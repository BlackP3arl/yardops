import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { CreateMeterTypeRequest, UpdateMeterTypeRequest } from '../../../common/types/meter.types';

/**
 * Meter Type service
 * Handles meter type management operations
 */
export class MeterTypeService {
  /**
   * Get all meter types
   */
  static async getAllMeterTypes() {
    try {
      const meterTypes = await prisma.meterType.findMany({
        orderBy: { name: 'asc' },
      });

      return meterTypes.map((meterType) => ({
        ...meterType,
        createdAt: meterType.createdAt.toISOString(),
        updatedAt: meterType.updatedAt.toISOString(),
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to fetch meter types');
      throw error;
    }
  }

  /**
   * Get meter type by ID
   */
  static async getMeterTypeById(id: string) {
    const meterType = await prisma.meterType.findUnique({
      where: { id },
      include: {
        meters: {
          select: {
            id: true,
            meterNumber: true,
            frequency: true,
          },
        },
      },
    });

    if (!meterType) {
      throw new Error('Meter type not found');
    }

    return {
      ...meterType,
      createdAt: meterType.createdAt.toISOString(),
      updatedAt: meterType.updatedAt.toISOString(),
      meters: meterType.meters.map((meter) => ({
        ...meter,
      })),
    };
  }

  /**
   * Create meter type
   */
  static async createMeterType(data: CreateMeterTypeRequest) {
    // Check if meter type with same name already exists
    const existing = await prisma.meterType.findUnique({
      where: { name: data.name.toUpperCase() },
    });

    if (existing) {
      throw new Error('Meter type with this name already exists');
    }

    const meterType = await prisma.meterType.create({
      data: {
        name: data.name.toUpperCase(),
        description: data.description,
      },
    });

    logger.info({ meterTypeId: meterType.id }, 'Meter type created');

    return {
      ...meterType,
      createdAt: meterType.createdAt.toISOString(),
      updatedAt: meterType.updatedAt.toISOString(),
    };
  }

  /**
   * Update meter type
   */
  static async updateMeterType(id: string, data: UpdateMeterTypeRequest) {
    const meterType = await prisma.meterType.findUnique({
      where: { id },
    });

    if (!meterType) {
      throw new Error('Meter type not found');
    }

    // Check if new name conflicts with existing meter type
    if (data.name) {
      const existing = await prisma.meterType.findUnique({
        where: { name: data.name.toUpperCase() },
      });

      if (existing && existing.id !== id) {
        throw new Error('Meter type with this name already exists');
      }
    }

    const updatedMeterType = await prisma.meterType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.toUpperCase() }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    logger.info({ meterTypeId: id }, 'Meter type updated');

    return {
      ...updatedMeterType,
      createdAt: updatedMeterType.createdAt.toISOString(),
      updatedAt: updatedMeterType.updatedAt.toISOString(),
    };
  }

  /**
   * Delete meter type
   */
  static async deleteMeterType(id: string) {
    const meterType = await prisma.meterType.findUnique({
      where: { id },
      include: {
        meters: true,
      },
    });

    if (!meterType) {
      throw new Error('Meter type not found');
    }

    if (meterType.meters.length > 0) {
      throw new Error('Cannot delete meter type with associated meters');
    }

    await prisma.meterType.delete({
      where: { id },
    });

    logger.info({ meterTypeId: id }, 'Meter type deleted');

    return { success: true };
  }
}

