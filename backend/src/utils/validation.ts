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

// Meter Type schemas
export const createMeterTypeSchema = z.object({
  name: z.string().min(1, 'Meter type name is required'),
  description: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
});

export const updateMeterTypeSchema = z.object({
  name: z.string().min(1, 'Meter type name is required').optional(),
  description: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
});

// Meter schemas
export const createMeterSchema = z.object({
  meterNumber: z.string().min(1, 'Meter number is required'),
  meterTypeId: z.string().uuid('Invalid meter type ID'),
  locationId: z.string().uuid('Invalid location ID'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AD_HOC']),
});

export const updateMeterSchema = z.object({
  meterNumber: z.string().min(1, 'Meter number is required').optional(),
  meterTypeId: z.string().uuid('Invalid meter type ID').optional(),
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
  readingDate: z.preprocess(
    (val) => {
      if (!val || val === '') return undefined;
      // Handle both ISO strings and datetime-local format
      if (typeof val === 'string') {
        try {
          // If it's datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
          if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
          // If it's already an ISO string, validate it
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          // If conversion fails, return undefined
          return undefined;
        }
      }
      return val;
    },
    z.string().datetime().optional()
  ),
  comment: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
});

export const updateReadingSchema = z.object({
  value: z.number().positive('Value must be positive').optional(),
  readingDate: z.preprocess(
    (val) => {
      if (!val || val === '') return undefined;
      // Handle both ISO strings and datetime-local format
      if (typeof val === 'string') {
        try {
          // If it's datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
          if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            const date = new Date(val);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
          // If it's already an ISO string, validate it
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          // If conversion fails, return undefined
          return undefined;
        }
      }
      return val;
    },
    z.string().datetime().optional()
  ),
  comment: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
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
  meterTypeId: z.string().uuid().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AD_HOC']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

