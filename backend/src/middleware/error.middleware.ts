import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Error response interface
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      error: 'Database error',
      message: 'An error occurred while processing your request',
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Authentication error',
      message: 'Invalid or expired token',
    });
    return;
  }

  // Handle custom application errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

