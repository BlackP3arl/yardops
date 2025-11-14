import { z } from 'zod';

/**
 * Validation schemas using Zod
 */

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'READER']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'READER']),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['ADMIN', 'READER']).optional(),
});

// Location schemas
export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  description: z.string().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').optional(),
  description: z.string().optional(),
});

// Meter schemas
export const createMeterSchema = z.object({
  meterNumber: z.string().min(1, 'Meter number is required'),
  meterType: z.enum(['WATER', 'ELECTRIC']),
  locationId: z.string().uuid('Invalid location ID'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AD_HOC']),
});

export const updateMeterSchema = z.object({
  meterNumber: z.string().min(1, 'Meter number is required').optional(),
  meterType: z.enum(['WATER', 'ELECTRIC']).optional(),
  locationId: z.string().uuid('Invalid location ID').optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AD_HOC']).optional(),
});

export const assignMeterSchema = z.object({
  meterId: z.string().uuid('Invalid meter ID'),
  userId: z.string().uuid('Invalid user ID'),
});

// Reading schemas
export const createReadingSchema = z.object({
  meterId: z.string().uuid('Invalid meter ID'),
  value: z.number().positive('Value must be positive'),
  readingDate: z.string().datetime().optional(),
  comment: z.string().optional(),
});

export const updateReadingSchema = z.object({
  value: z.number().positive('Value must be positive').optional(),
  readingDate: z.string().datetime().optional(),
  comment: z.string().optional(),
});

// Scheduled reading schema
export const createScheduledReadingSchema = z.object({
  meterId: z.string().uuid('Invalid meter ID'),
  scheduledDate: z.string().datetime(),
  dueDate: z.string().datetime(),
});

// Notification schema
export const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['NEW_ASSIGNMENT', 'READING_DUE', 'READING_MISSED']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  metadata: z.record(z.any()).optional(),
});

// Report filter schema
export const reportFilterSchema = z.object({
  locationId: z.string().uuid().optional(),
  readerId: z.string().uuid().optional(),
  meterType: z.enum(['WATER', 'ELECTRIC']).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AD_HOC']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

