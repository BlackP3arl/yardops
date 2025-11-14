import { Router, Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../../utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get(
  '/',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as UserRole | undefined;

      const result = await UserService.getAllUsers(page, limit, role);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
      });
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (own profile or admin)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Users can only view their own profile unless they're admin
    if (req.user!.userId !== req.params.id && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this user',
      });
    }

    const user = await UserService.getUserById(req.params.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'User not found',
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create user
 * @access  Admin only
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createUserSchema),
  async (req: Request, res: Response) => {
    try {
      const user = await UserService.createUser(req.body);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  }
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateUserSchema),
  async (req: Request, res: Response) => {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      await UserService.deleteUser(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      });
    }
  }
);

/**
 * @route   GET /api/users/:id/meters
 * @desc    Get meters assigned to user
 * @access  Private (own meters or admin)
 */
router.get('/:id/meters', async (req: Request, res: Response) => {
  try {
    // Users can only view their own meters unless they're admin
    if (req.user!.userId !== req.params.id && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this user\'s meters',
      });
    }

    const meters = await UserService.getUsersByMeter(req.params.id);

    res.json({
      success: true,
      data: meters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch meters',
    });
  }
});

export default router;

