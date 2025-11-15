import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { ReadingFrequency } from '@prisma/client';
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
      meterTypeId?: string;
      frequency?: ReadingFrequency;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }
    if (filters?.meterTypeId) {
      where.meterTypeId = filters.meterTypeId;
    }
    if (filters?.frequency) {
      where.frequency = filters.frequency;
    }

    try {
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
            meterType: {
              select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                updatedAt: true,
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
          id: meter.id,
          meterNumber: meter.meterNumber,
          meterTypeId: meter.meterTypeId,
          locationId: meter.locationId,
          frequency: meter.frequency,
          createdAt: meter.createdAt instanceof Date 
            ? meter.createdAt.toISOString() 
            : meter.createdAt,
          updatedAt: meter.updatedAt instanceof Date 
            ? meter.updatedAt.toISOString() 
            : meter.updatedAt,
          location: meter.location ? {
            id: meter.location.id,
            name: meter.location.name,
            description: meter.location.description,
          } : null,
          meterType: meter.meterType ? {
            id: meter.meterType.id,
            name: meter.meterType.name,
            description: meter.meterType.description,
            createdAt: meter.meterType.createdAt instanceof Date 
              ? meter.meterType.createdAt.toISOString() 
              : meter.meterType.createdAt,
            updatedAt: meter.meterType.updatedAt instanceof Date 
              ? meter.meterType.updatedAt.toISOString() 
              : meter.meterType.updatedAt,
          } : null,
          assignments: meter.assignments ? meter.assignments.map((assignment) => ({
            id: assignment.id,
            userId: assignment.userId,
            assignedAt: assignment.assignedAt instanceof Date 
              ? assignment.assignedAt.toISOString() 
              : assignment.assignedAt,
            user: assignment.user,
          })) : [],
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error({ 
        error: error?.message || error, 
        stack: error?.stack,
        filters 
      }, 'Failed to fetch meters');
      throw new Error(error?.message || 'Failed to fetch meters');
    }
  }

  /**
   * Get meter by ID
   */
  static async getMeterById(id: string) {
    const meter = await prisma.meter.findUnique({
      where: { id },
      include: {
        location: true,
        meterType: true,
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
      meterType: meter.meterType ? {
        ...meter.meterType,
        createdAt: meter.meterType.createdAt.toISOString(),
        updatedAt: meter.meterType.updatedAt.toISOString(),
      } : undefined,
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

    // Verify meter type exists
    const meterType = await prisma.meterType.findUnique({
      where: { id: data.meterTypeId },
    });

    if (!meterType) {
      throw new Error('Meter type not found');
    }

    const meter = await prisma.meter.create({
      data: {
        meterNumber: data.meterNumber,
        meterTypeId: data.meterTypeId,
        locationId: data.locationId,
        frequency: data.frequency,
      },
      include: {
        location: true,
        meterType: true,
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
      meterType: meter.meterType ? {
        ...meter.meterType,
        createdAt: meter.meterType.createdAt.toISOString(),
        updatedAt: meter.meterType.updatedAt.toISOString(),
      } : undefined,
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

    // Verify meter type exists if being updated
    if (data.meterTypeId && data.meterTypeId !== meter.meterTypeId) {
      const meterType = await prisma.meterType.findUnique({
        where: { id: data.meterTypeId },
      });

      if (!meterType) {
        throw new Error('Meter type not found');
      }
    }

    const updatedMeter = await prisma.meter.update({
      where: { id },
      data: {
        ...(data.meterNumber && { meterNumber: data.meterNumber }),
        ...(data.meterTypeId && { meterTypeId: data.meterTypeId }),
        ...(data.locationId && { locationId: data.locationId }),
        ...(data.frequency && { frequency: data.frequency }),
      },
      include: {
        location: true,
        meterType: true,
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
      meterType: updatedMeter.meterType ? {
        ...updatedMeter.meterType,
        createdAt: updatedMeter.meterType.createdAt.toISOString(),
        updatedAt: updatedMeter.meterType.updatedAt.toISOString(),
      } : undefined,
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
            meterType: true,
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
      meterTypeId: assignment.meter.meterTypeId,
      meterType: assignment.meter.meterType ? {
        ...assignment.meter.meterType,
        createdAt: assignment.meter.meterType.createdAt.toISOString(),
        updatedAt: assignment.meter.meterType.updatedAt.toISOString(),
      } : undefined,
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

