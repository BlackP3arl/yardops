import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { NotificationType, NotificationStatus } from '@prisma/client';
import { sendEmail, emailTemplates } from '../config/email';
import { CreateNotificationRequest } from '../../../common/types/notification.types';

/**
 * Notification service
 * Handles notification operations
 */
export class NotificationService {
  /**
   * Create notification
   */
  static async createNotification(data: CreateNotificationRequest) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Send email notification if configured
    try {
      if (data.type === NotificationType.NEW_ASSIGNMENT && data.metadata?.meterNumber) {
        const emailData = emailTemplates.newAssignment(
          data.metadata.meterNumber as string,
          data.metadata.location as string || 'Unknown Location'
        );
        await sendEmail(user.email, emailData.subject, emailData.html);
      } else if (data.type === NotificationType.READING_DUE && data.metadata?.meterNumber) {
        const emailData = emailTemplates.readingDue(
          data.metadata.meterNumber as string,
          data.metadata.dueDate as string || 'Unknown Date'
        );
        await sendEmail(user.email, emailData.subject, emailData.html);
      } else if (data.type === NotificationType.READING_MISSED && data.metadata?.meterNumber) {
        const emailData = emailTemplates.readingMissed(
          data.metadata.meterNumber as string,
          data.metadata.daysOverdue as number || 0
        );
        await sendEmail(user.email, emailData.subject, emailData.html);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to send email notification');
      // Don't throw - notification is still created
    }

    logger.info(
      { notificationId: notification.id, userId: data.userId, type: data.type },
      'Notification created'
    );

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
    };
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: NotificationStatus
  ) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt ? notification.readAt.toISOString() : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('You do not have permission to update this notification');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    logger.info({ notificationId }, 'Notification marked as read');

    return {
      ...updatedNotification,
      createdAt: updatedNotification.createdAt.toISOString(),
      readAt: updatedNotification.readAt
        ? updatedNotification.readAt.toISOString()
        : null,
    };
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    logger.info({ userId }, 'All notifications marked as read');

    return { success: true };
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('You do not have permission to delete this notification');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info({ notificationId }, 'Notification deleted');

    return { success: true };
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(userId: string) {
    const [unreadCount, totalCount] = await Promise.all([
      prisma.notification.count({
        where: {
          userId,
          status: NotificationStatus.UNREAD,
        },
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      unreadCount,
      totalCount,
    };
  }

  /**
   * Notify users of due readings
   */
  static async notifyDueReadings() {
    const now = new Date();
    const scheduledReadings = await prisma.scheduledReading.findMany({
      where: {
        dueDate: {
          lte: now,
        },
      },
      include: {
        meter: {
          include: {
            assignments: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const notifications = [];

    for (const scheduledReading of scheduledReadings) {
      for (const assignment of scheduledReading.meter.assignments) {
        // Check if notification already exists
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: assignment.userId,
            type: NotificationType.READING_DUE,
            metadata: {
              path: ['meterId'],
              equals: scheduledReading.meter.id,
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (!existingNotification) {
          const notification = await this.createNotification({
            userId: assignment.userId,
            type: NotificationType.READING_DUE,
            title: `Reading Due: ${scheduledReading.meter.meterNumber}`,
            message: `The reading for meter ${scheduledReading.meter.meterNumber} is due.`,
            metadata: {
              meterId: scheduledReading.meter.id,
              meterNumber: scheduledReading.meter.meterNumber,
              dueDate: scheduledReading.dueDate.toISOString(),
            },
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  }

  /**
   * Notify users of missed readings
   */
  static async notifyMissedReadings() {
    const now = new Date();
    const meters = await prisma.meter.findMany({
      include: {
        assignments: {
          include: {
            user: true,
          },
        },
        readings: {
          take: 1,
          orderBy: { readingDate: 'desc' },
        },
      },
    });

    const notifications = [];

    for (const meter of meters) {
      if (meter.assignments.length === 0) continue;

      const lastReading = meter.readings[0];
      if (!lastReading) continue;

      const daysSinceLastReading = Math.floor(
        (now.getTime() - lastReading.readingDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let expectedInterval = 0;
      switch (meter.frequency) {
        case 'DAILY':
          expectedInterval = 1;
          break;
        case 'WEEKLY':
          expectedInterval = 7;
          break;
        case 'MONTHLY':
          expectedInterval = 30;
          break;
        default:
          continue;
      }

      if (daysSinceLastReading > expectedInterval * 1.5) {
        for (const assignment of meter.assignments) {
          // Check if notification already exists
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: assignment.userId,
              type: NotificationType.READING_MISSED,
              metadata: {
                path: ['meterId'],
                equals: meter.id,
              },
              createdAt: {
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          });

          if (!existingNotification) {
            const notification = await this.createNotification({
              userId: assignment.userId,
              type: NotificationType.READING_MISSED,
              title: `Overdue Reading: ${meter.meterNumber}`,
              message: `The reading for meter ${meter.meterNumber} is ${daysSinceLastReading - expectedInterval} days overdue.`,
              metadata: {
                meterId: meter.id,
                meterNumber: meter.meterNumber,
                daysOverdue: daysSinceLastReading - expectedInterval,
              },
            });
            notifications.push(notification);
          }
        }
      }
    }

    return notifications;
  }
}

