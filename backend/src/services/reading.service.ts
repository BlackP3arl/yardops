import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { ReadingFrequency } from '@prisma/client';
import { CreateReadingRequest, UpdateReadingRequest } from '../../../common/types/reading.types';

/**
 * Reading service
 * Handles meter reading operations
 */
export class ReadingService {
  /**
   * Get all readings with filters
   */
  static async getAllReadings(
    page: number = 1,
    limit: number = 10,
    filters?: {
      meterId?: string;
      userId?: string;
      locationId?: string;
      meterType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.meterId) {
      where.meterId = filters.meterId;
    }
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.readingDate = {};
      if (filters.startDate) {
        where.readingDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.readingDate.lte = new Date(filters.endDate);
      }
    }

    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where,
        skip,
        take: limit,
        include: {
          meter: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { readingDate: 'desc' },
      }),
      prisma.reading.count({ where }),
    ]);

    // Apply additional filters if needed
    let filteredReadings = readings;
    if (filters?.locationId) {
      filteredReadings = filteredReadings.filter(
        (reading) => reading.meter.locationId === filters.locationId
      );
    }
    if (filters?.meterType) {
      filteredReadings = filteredReadings.filter(
        (reading) => reading.meter.meterType === filters.meterType
      );
    }

    return {
      data: filteredReadings.map((reading) => ({
        ...reading,
        readingDate: reading.readingDate.toISOString(),
        createdAt: reading.createdAt.toISOString(),
        updatedAt: reading.updatedAt.toISOString(),
        meter: {
          id: reading.meter.id,
          meterNumber: reading.meter.meterNumber,
          meterType: reading.meter.meterType,
          location: reading.meter.location,
        },
        user: reading.user,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get reading by ID
   */
  static async getReadingById(id: string) {
    const reading = await prisma.reading.findUnique({
      where: { id },
      include: {
        meter: {
          include: {
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!reading) {
      throw new Error('Reading not found');
    }

    return {
      ...reading,
      readingDate: reading.readingDate.toISOString(),
      createdAt: reading.createdAt.toISOString(),
      updatedAt: reading.updatedAt.toISOString(),
      meter: {
        ...reading.meter,
        createdAt: reading.meter.createdAt.toISOString(),
        updatedAt: reading.meter.updatedAt.toISOString(),
        location: {
          ...reading.meter.location,
          createdAt: reading.meter.location.createdAt.toISOString(),
          updatedAt: reading.meter.location.updatedAt.toISOString(),
        },
      },
      user: reading.user,
    };
  }

  /**
   * Create reading
   */
  static async createReading(data: CreateReadingRequest, userId: string) {
    // Verify meter exists
    const meter = await prisma.meter.findUnique({
      where: { id: data.meterId },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    // Verify user is assigned to meter
    const assignment = await prisma.meterAssignment.findUnique({
      where: {
        meterId_userId: {
          meterId: data.meterId,
          userId,
        },
      },
    });

    if (!assignment) {
      throw new Error('You are not assigned to this meter');
    }

    const reading = await prisma.reading.create({
      data: {
        meterId: data.meterId,
        userId,
        value: data.value,
        readingDate: data.readingDate ? new Date(data.readingDate) : new Date(),
        comment: data.comment,
      },
      include: {
        meter: {
          include: {
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(
      { readingId: reading.id, meterId: data.meterId, userId },
      'Reading created'
    );

    return {
      ...reading,
      readingDate: reading.readingDate.toISOString(),
      createdAt: reading.createdAt.toISOString(),
      updatedAt: reading.updatedAt.toISOString(),
      meter: {
        ...reading.meter,
        createdAt: reading.meter.createdAt.toISOString(),
        updatedAt: reading.meter.updatedAt.toISOString(),
        location: {
          ...reading.meter.location,
          createdAt: reading.meter.location.createdAt.toISOString(),
          updatedAt: reading.meter.location.updatedAt.toISOString(),
        },
      },
      user: reading.user,
    };
  }

  /**
   * Update reading
   */
  static async updateReading(id: string, data: UpdateReadingRequest, userId: string) {
    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading) {
      throw new Error('Reading not found');
    }

    // Only the user who created the reading or admin can update it
    if (reading.userId !== userId) {
      // Check if user is admin (this should be checked in the route handler)
      throw new Error('You do not have permission to update this reading');
    }

    const updatedReading = await prisma.reading.update({
      where: { id },
      data: {
        ...(data.value !== undefined && { value: data.value }),
        ...(data.readingDate && { readingDate: new Date(data.readingDate) }),
        ...(data.comment !== undefined && { comment: data.comment }),
      },
      include: {
        meter: {
          include: {
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info({ readingId: id }, 'Reading updated');

    return {
      ...updatedReading,
      readingDate: updatedReading.readingDate.toISOString(),
      createdAt: updatedReading.createdAt.toISOString(),
      updatedAt: updatedReading.updatedAt.toISOString(),
      meter: {
        ...updatedReading.meter,
        createdAt: updatedReading.meter.createdAt.toISOString(),
        updatedAt: updatedReading.meter.updatedAt.toISOString(),
        location: {
          ...updatedReading.meter.location,
          createdAt: updatedReading.meter.location.createdAt.toISOString(),
          updatedAt: updatedReading.meter.location.updatedAt.toISOString(),
        },
      },
      user: updatedReading.user,
    };
  }

  /**
   * Delete reading
   */
  static async deleteReading(id: string) {
    const reading = await prisma.reading.findUnique({
      where: { id },
    });

    if (!reading) {
      throw new Error('Reading not found');
    }

    await prisma.reading.delete({
      where: { id },
    });

    logger.info({ readingId: id }, 'Reading deleted');

    return { success: true };
  }

  /**
   * Get reading statistics
   */
  static async getReadingStats() {
    const [
      totalReadings,
      totalMeters,
      readingsByFrequency,
      recentReadings,
    ] = await Promise.all([
      prisma.reading.count(),
      prisma.meter.count(),
      prisma.meter.groupBy({
        by: ['frequency'],
        _count: true,
      }),
      prisma.reading.count({
        where: {
          readingDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
    ]);

    const byFrequency = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      adHoc: 0,
    };

    readingsByFrequency.forEach((item) => {
      byFrequency[item.frequency.toLowerCase() as keyof typeof byFrequency] =
        item._count;
    });

    // Calculate pending and missed readings
    const now = new Date();
    const allMeters = await prisma.meter.findMany({
      include: {
        readings: {
          take: 1,
          orderBy: { readingDate: 'desc' },
        },
        assignments: true,
      },
    });

    let pendingReadings = 0;
    let missedReadings = 0;

    allMeters.forEach((meter) => {
      if (meter.assignments.length === 0) return;

      const lastReading = meter.readings[0];
      const daysSinceLastReading = lastReading
        ? Math.floor(
            (now.getTime() - lastReading.readingDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : Infinity;

      let expectedInterval = 0;
      switch (meter.frequency) {
        case ReadingFrequency.DAILY:
          expectedInterval = 1;
          break;
        case ReadingFrequency.WEEKLY:
          expectedInterval = 7;
          break;
        case ReadingFrequency.MONTHLY:
          expectedInterval = 30;
          break;
        case ReadingFrequency.AD_HOC:
          expectedInterval = 999; // No expected interval for ad-hoc
          break;
      }

      if (daysSinceLastReading >= expectedInterval) {
        if (daysSinceLastReading > expectedInterval * 1.5) {
          missedReadings++;
        } else {
          pendingReadings++;
        }
      }
    });

    return {
      totalReadings,
      totalMeters,
      pendingReadings,
      missedReadings,
      recentReadings,
      byFrequency,
    };
  }

  /**
   * Get readings for a specific meter
   */
  static async getMeterReadings(meterId: string) {
    const meter = await prisma.meter.findUnique({
      where: { id: meterId },
      include: {
        location: true,
        readings: {
          orderBy: { readingDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    const lastReading = meter.readings[0] || null;

    // Calculate next due date based on frequency
    let nextDueDate: Date | null = null;
    if (lastReading) {
      const lastReadingDate = lastReading.readingDate;
      switch (meter.frequency) {
        case ReadingFrequency.DAILY:
          nextDueDate = new Date(
            lastReadingDate.getTime() + 24 * 60 * 60 * 1000
          );
          break;
        case ReadingFrequency.WEEKLY:
          nextDueDate = new Date(
            lastReadingDate.getTime() + 7 * 24 * 60 * 60 * 1000
          );
          break;
        case ReadingFrequency.MONTHLY:
          nextDueDate = new Date(
            lastReadingDate.getTime() + 30 * 24 * 60 * 60 * 1000
          );
          break;
      }
    }

    const isOverdue = nextDueDate ? nextDueDate < new Date() : false;

    return {
      meter: {
        id: meter.id,
        meterNumber: meter.meterNumber,
        meterType: meter.meterType,
        location: {
          id: meter.location.id,
          name: meter.location.name,
        },
      },
      readings: meter.readings.map((reading) => ({
        ...reading,
        readingDate: reading.readingDate.toISOString(),
        createdAt: reading.createdAt.toISOString(),
        updatedAt: reading.updatedAt.toISOString(),
        user: reading.user,
      })),
      lastReading: lastReading
        ? {
            ...lastReading,
            readingDate: lastReading.readingDate.toISOString(),
            createdAt: lastReading.createdAt.toISOString(),
            updatedAt: lastReading.updatedAt.toISOString(),
            user: lastReading.user,
          }
        : null,
      nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
      isOverdue,
    };
  }

  /**
   * Get user's readings
   */
  static async getUserReadings(userId: string) {
    const readings = await prisma.reading.findMany({
      where: { userId },
      include: {
        meter: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { readingDate: 'desc' },
    });

    return readings.map((reading) => ({
      ...reading,
      readingDate: reading.readingDate.toISOString(),
      createdAt: reading.createdAt.toISOString(),
      updatedAt: reading.updatedAt.toISOString(),
      meter: {
        id: reading.meter.id,
        meterNumber: reading.meter.meterNumber,
        meterType: reading.meter.meterType,
        location: reading.meter.location,
      },
    }));
  }
}

