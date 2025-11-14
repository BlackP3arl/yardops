import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { UserRole } from '@prisma/client';
import { CreateUserRequest, UpdateUserRequest } from '../../../common/types/user.types';

/**
 * User service
 * Handles user management operations
 */
export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(page: number = 1, limit: number = 10, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Create user
   */
  static async createUser(data: CreateUserRequest) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ userId: user.id }, 'User created');

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: UpdateUserRequest) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ userId: id }, 'User updated');

    return {
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    logger.info({ userId: id }, 'User deleted');

    return { success: true };
  }

  /**
   * Get users assigned to a meter
   */
  static async getUsersByMeter(meterId: string) {
    const assignments = await prisma.meterAssignment.findMany({
      where: { meterId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return assignments.map((assignment) => ({
      ...assignment.user,
      assignedAt: assignment.assignedAt.toISOString(),
    }));
  }
}

