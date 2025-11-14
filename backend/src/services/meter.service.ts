import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { MeterType, ReadingFrequency } from '@prisma/client';
import {
  CreateMeterRequest,
  UpdateMeterRequest,
  AssignMeterRequest,
  CreateScheduledReadingRequest,
} from '../../../common/types/meter.types';

/**
 * Meter service
 * Handles meter management operations
 */
export class MeterService {
  /**
   * Get all meters
   */
  static async getAllMeters(
    page: number = 1,
    limit: number = 10,
    filters?: {
      locationId?: string;
      meterType?: MeterType;
      frequency?: ReadingFrequency;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }
    if (filters?.meterType) {
      where.meterType = filters.meterType;
    }
    if (filters?.frequency) {
      where.frequency = filters.frequency;
    }

    const [meters, total] = await Promise.all([
      prisma.meter.findMany({
        where,
        skip,
        take: limit,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          assignments: {
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
        orderBy: { meterNumber: 'asc' },
      }),
      prisma.meter.count({ where }),
    ]);

    return {
      data: meters.map((meter) => ({
        ...meter,
        createdAt: meter.createdAt.toISOString(),
        updatedAt: meter.updatedAt.toISOString(),
        location: {
          ...meter.location,
        },
        assignments: meter.assignments.map((assignment) => ({
          id: assignment.id,
          userId: assignment.userId,
          assignedAt: assignment.assignedAt.toISOString(),
          user: assignment.user,
        })),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get meter by ID
   */
  static async getMeterById(id: string) {
    const meter = await prisma.meter.findUnique({
      where: { id },
      include: {
        location: true,
        assignments: {
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
        readings: {
          take: 10,
          orderBy: { readingDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    return {
      ...meter,
      createdAt: meter.createdAt.toISOString(),
      updatedAt: meter.updatedAt.toISOString(),
      location: {
        ...meter.location,
        createdAt: meter.location.createdAt.toISOString(),
        updatedAt: meter.location.updatedAt.toISOString(),
      },
      assignments: meter.assignments.map((assignment) => ({
        id: assignment.id,
        userId: assignment.userId,
        assignedAt: assignment.assignedAt.toISOString(),
        user: assignment.user,
      })),
      readings: meter.readings.map((reading) => ({
        ...reading,
        readingDate: reading.readingDate.toISOString(),
        createdAt: reading.createdAt.toISOString(),
        updatedAt: reading.updatedAt.toISOString(),
        user: reading.user,
      })),
    };
  }

  /**
   * Create meter
   */
  static async createMeter(data: CreateMeterRequest) {
    // Check if meter number already exists
    const existingMeter = await prisma.meter.findUnique({
      where: { meterNumber: data.meterNumber },
    });

    if (existingMeter) {
      throw new Error('Meter with this number already exists');
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    const meter = await prisma.meter.create({
      data: {
        meterNumber: data.meterNumber,
        meterType: data.meterType,
        locationId: data.locationId,
        frequency: data.frequency,
      },
      include: {
        location: true,
      },
    });

    logger.info({ meterId: meter.id, meterNumber: meter.meterNumber }, 'Meter created');

    return {
      ...meter,
      createdAt: meter.createdAt.toISOString(),
      updatedAt: meter.updatedAt.toISOString(),
      location: {
        ...meter.location,
        createdAt: meter.location.createdAt.toISOString(),
        updatedAt: meter.location.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Update meter
   */
  static async updateMeter(id: string, data: UpdateMeterRequest) {
    const meter = await prisma.meter.findUnique({
      where: { id },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    // Check meter number uniqueness if being updated
    if (data.meterNumber && data.meterNumber !== meter.meterNumber) {
      const existingMeter = await prisma.meter.findUnique({
        where: { meterNumber: data.meterNumber },
      });

      if (existingMeter) {
        throw new Error('Meter with this number already exists');
      }
    }

    // Verify location exists if being updated
    if (data.locationId && data.locationId !== meter.locationId) {
      const location = await prisma.location.findUnique({
        where: { id: data.locationId },
      });

      if (!location) {
        throw new Error('Location not found');
      }
    }

    const updatedMeter = await prisma.meter.update({
      where: { id },
      data: {
        ...(data.meterNumber && { meterNumber: data.meterNumber }),
        ...(data.meterType && { meterType: data.meterType }),
        ...(data.locationId && { locationId: data.locationId }),
        ...(data.frequency && { frequency: data.frequency }),
      },
      include: {
        location: true,
      },
    });

    logger.info({ meterId: id }, 'Meter updated');

    return {
      ...updatedMeter,
      createdAt: updatedMeter.createdAt.toISOString(),
      updatedAt: updatedMeter.updatedAt.toISOString(),
      location: {
        ...updatedMeter.location,
        createdAt: updatedMeter.location.createdAt.toISOString(),
        updatedAt: updatedMeter.location.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Delete meter
   */
  static async deleteMeter(id: string) {
    const meter = await prisma.meter.findUnique({
      where: { id },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    await prisma.meter.delete({
      where: { id },
    });

    logger.info({ meterId: id }, 'Meter deleted');

    return { success: true };
  }

  /**
   * Assign meter to user
   */
  static async assignMeter(data: AssignMeterRequest, assignedBy?: string) {
    // Verify meter exists
    const meter = await prisma.meter.findUnique({
      where: { id: data.meterId },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.meterAssignment.findUnique({
      where: {
        meterId_userId: {
          meterId: data.meterId,
          userId: data.userId,
        },
      },
    });

    if (existingAssignment) {
      throw new Error('Meter is already assigned to this user');
    }

    const assignment = await prisma.meterAssignment.create({
      data: {
        meterId: data.meterId,
        userId: data.userId,
        assignedBy: assignedBy || null,
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
      { meterId: data.meterId, userId: data.userId },
      'Meter assigned to user'
    );

    return {
      id: assignment.id,
      meterId: assignment.meterId,
      userId: assignment.userId,
      assignedAt: assignment.assignedAt.toISOString(),
      assignedBy: assignment.assignedBy,
      meter: {
        ...assignment.meter,
        createdAt: assignment.meter.createdAt.toISOString(),
        updatedAt: assignment.meter.updatedAt.toISOString(),
        location: {
          ...assignment.meter.location,
          createdAt: assignment.meter.location.createdAt.toISOString(),
          updatedAt: assignment.meter.location.updatedAt.toISOString(),
        },
      },
      user: assignment.user,
    };
  }

  /**
   * Unassign meter from user
   */
  static async unassignMeter(meterId: string, userId: string) {
    const assignment = await prisma.meterAssignment.findUnique({
      where: {
        meterId_userId: {
          meterId,
          userId,
        },
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    await prisma.meterAssignment.delete({
      where: {
        meterId_userId: {
          meterId,
          userId,
        },
      },
    });

    logger.info({ meterId, userId }, 'Meter unassigned from user');

    return { success: true };
  }

  /**
   * Get meters assigned to user
   */
  static async getMetersByUser(userId: string) {
    const assignments = await prisma.meterAssignment.findMany({
      where: { userId },
      include: {
        meter: {
          include: {
            location: true,
            readings: {
              take: 1,
              orderBy: { readingDate: 'desc' },
            },
          },
        },
      },
    });

    return assignments.map((assignment) => ({
      id: assignment.meter.id,
      meterNumber: assignment.meter.meterNumber,
      meterType: assignment.meter.meterType,
      frequency: assignment.meter.frequency,
      location: {
        ...assignment.meter.location,
        createdAt: assignment.meter.location.createdAt.toISOString(),
        updatedAt: assignment.meter.location.updatedAt.toISOString(),
      },
      assignedAt: assignment.assignedAt.toISOString(),
      lastReading: assignment.meter.readings[0]
        ? {
            ...assignment.meter.readings[0],
            readingDate: assignment.meter.readings[0].readingDate.toISOString(),
            createdAt: assignment.meter.readings[0].createdAt.toISOString(),
            updatedAt: assignment.meter.readings[0].updatedAt.toISOString(),
          }
        : null,
    }));
  }

  /**
   * Schedule reading
   */
  static async scheduleReading(data: CreateScheduledReadingRequest) {
    // Verify meter exists
    const meter = await prisma.meter.findUnique({
      where: { id: data.meterId },
    });

    if (!meter) {
      throw new Error('Meter not found');
    }

    const scheduledReading = await prisma.scheduledReading.create({
      data: {
        meterId: data.meterId,
        scheduledDate: new Date(data.scheduledDate),
        dueDate: new Date(data.dueDate),
      },
      include: {
        meter: {
          include: {
            location: true,
          },
        },
      },
    });

    logger.info(
      { scheduledReadingId: scheduledReading.id, meterId: data.meterId },
      'Reading scheduled'
    );

    return {
      ...scheduledReading,
      scheduledDate: scheduledReading.scheduledDate.toISOString(),
      dueDate: scheduledReading.dueDate.toISOString(),
      createdAt: scheduledReading.createdAt.toISOString(),
      updatedAt: scheduledReading.updatedAt.toISOString(),
      meter: {
        ...scheduledReading.meter,
        createdAt: scheduledReading.meter.createdAt.toISOString(),
        updatedAt: scheduledReading.meter.updatedAt.toISOString(),
        location: {
          ...scheduledReading.meter.location,
          createdAt: scheduledReading.meter.location.createdAt.toISOString(),
          updatedAt: scheduledReading.meter.location.updatedAt.toISOString(),
        },
      },
    };
  }
}

