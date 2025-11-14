import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { CreateLocationRequest, UpdateLocationRequest } from '../../../common/types/meter.types';

/**
 * Location service
 * Handles location management operations
 */
export class LocationService {
  /**
   * Get all locations
   */
  static async getAllLocations() {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    });

    return locations.map((location) => ({
      ...location,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    }));
  }

  /**
   * Get location by ID
   */
  static async getLocationById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        meters: {
          select: {
            id: true,
            meterNumber: true,
            meterType: true,
            frequency: true,
          },
        },
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    return {
      ...location,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
      meters: location.meters.map((meter) => ({
        ...meter,
      })),
    };
  }

  /**
   * Create location
   */
  static async createLocation(data: CreateLocationRequest) {
    const location = await prisma.location.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    logger.info({ locationId: location.id }, 'Location created');

    return {
      ...location,
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  /**
   * Update location
   */
  static async updateLocation(id: string, data: UpdateLocationRequest) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    logger.info({ locationId: id }, 'Location updated');

    return {
      ...updatedLocation,
      createdAt: updatedLocation.createdAt.toISOString(),
      updatedAt: updatedLocation.updatedAt.toISOString(),
    };
  }

  /**
   * Delete location
   */
  static async deleteLocation(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        meters: true,
      },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    if (location.meters.length > 0) {
      throw new Error('Cannot delete location with associated meters');
    }

    await prisma.location.delete({
      where: { id },
    });

    logger.info({ locationId: id }, 'Location deleted');

    return { success: true };
  }
}

