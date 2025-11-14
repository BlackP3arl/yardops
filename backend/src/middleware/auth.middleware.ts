import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';
import { UserRole } from '@prisma/client';

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookie
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Try to get token from Authorization header
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      // Fallback to cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided',
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
}

/**
 * Authorization middleware
 * Checks if user has required role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Adds user to request if token is present, but doesn't require it
 */
export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      req.user = payload;
    } else if (req.cookies?.accessToken) {
      const token = req.cookies.accessToken;
      const payload = verifyToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  next();
}

