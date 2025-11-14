import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, JWTPayload } from '../config/jwt';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';
import { CreateUserRequest, LoginRequest, AuthResponse } from '../../../common/types/user.types';

/**
 * Authentication service
 * Handles user authentication and authorization
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
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

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      logger.info({ userId: user.id, email: user.email }, 'User registered successfully');

      return {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        accessToken,
      };
    } catch (error) {
      logger.error({ error }, 'Registration failed');
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        accessToken,
      };
    } catch (error) {
      logger.error({ error }, 'Login failed');
      throw error;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
}

