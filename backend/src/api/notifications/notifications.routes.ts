import { Router, Request, Response } from 'express';
import { NotificationService } from '../../services/notification.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createNotificationSchema } from '../../utils/validation';
import { UserRole, NotificationStatus } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as NotificationStatus | undefined;

    const result = await NotificationService.getUserNotifications(
      req.user!.userId,
      page,
      limit,
      status
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications',
    });
  }
});

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await NotificationService.getNotificationStats(req.user!.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create notification
 * @access  Admin only
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createNotificationSchema),
  async (req: Request, res: Response) => {
    try {
      const notification = await NotificationService.createNotification(req.body);

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification',
      });
    }
  }
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await NotificationService.markAsRead(
      req.params.id,
      req.user!.userId
    );

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user!.userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notifications as read',
    });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await NotificationService.deleteNotification(req.params.id, req.user!.userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notification',
    });
  }
});

export default router;

