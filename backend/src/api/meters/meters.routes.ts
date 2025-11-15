import { Router, Request, Response } from 'express';
import { MeterService } from '../../services/meter.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createMeterSchema,
  updateMeterSchema,
  assignMeterSchema,
  createScheduledReadingSchema,
} from '../../utils/validation';
import { UserRole, ReadingFrequency } from '@prisma/client';
import { NotificationService } from '../../services/notification.service';
import { NotificationType } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/meters
 * @desc    Get all meters
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = {};

    if (req.query.locationId) {
      filters.locationId = req.query.locationId as string;
    }
    if (req.query.meterTypeId) {
      filters.meterTypeId = req.query.meterTypeId as string;
    }
    if (req.query.frequency) {
      filters.frequency = req.query.frequency as ReadingFrequency;
    }

    const result = await MeterService.getAllMeters(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in GET /api/meters:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch meters';
    res.status(500).json({
      success: false,
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error?.stack || String(error) 
      }),
    });
  }
});

/**
 * @route   GET /api/meters/:id
 * @desc    Get meter by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const meter = await MeterService.getMeterById(req.params.id);

    res.json({
      success: true,
      data: meter,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Meter not found',
    });
  }
});

/**
 * @route   POST /api/meters
 * @desc    Create meter
 * @access  Admin only
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createMeterSchema),
  async (req: Request, res: Response) => {
    try {
      const meter = await MeterService.createMeter(req.body);

      res.status(201).json({
        success: true,
        data: meter,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create meter',
      });
    }
  }
);

/**
 * @route   PUT /api/meters/:id
 * @desc    Update meter
 * @access  Admin only
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateMeterSchema),
  async (req: Request, res: Response) => {
    try {
      const meter = await MeterService.updateMeter(req.params.id, req.body);

      res.json({
        success: true,
        data: meter,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update meter',
      });
    }
  }
);

/**
 * @route   DELETE /api/meters/:id
 * @desc    Delete meter
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      await MeterService.deleteMeter(req.params.id);

      res.json({
        success: true,
        message: 'Meter deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete meter',
      });
    }
  }
);

/**
 * @route   POST /api/meters/assign
 * @desc    Assign meter to user
 * @access  Admin only
 */
router.post(
  '/assign',
  authorize(UserRole.ADMIN),
  validate(assignMeterSchema),
  async (req: Request, res: Response) => {
    try {
      const assignment = await MeterService.assignMeter(
        req.body,
        req.user!.userId
      );

      // Create notification for assigned user
      try {
        await NotificationService.createNotification({
          userId: req.body.userId,
          type: NotificationType.NEW_ASSIGNMENT,
          title: `New Meter Assignment: ${assignment.meter.meterNumber}`,
          message: `You have been assigned to read meter ${assignment.meter.meterNumber} at ${assignment.meter.location.name}.`,
          metadata: {
            meterId: assignment.meterId,
            meterNumber: assignment.meter.meterNumber,
            location: assignment.meter.location.name,
          },
        });
      } catch (notifError) {
        // Log but don't fail the assignment
        console.error('Failed to create notification:', notifError);
      }

      res.status(201).json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign meter',
      });
    }
  }
);

/**
 * @route   DELETE /api/meters/:meterId/assign/:userId
 * @desc    Unassign meter from user
 * @access  Admin only
 */
router.delete(
  '/:meterId/assign/:userId',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      await MeterService.unassignMeter(req.params.meterId, req.params.userId);

      res.json({
        success: true,
        message: 'Meter unassigned successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unassign meter',
      });
    }
  }
);

/**
 * @route   GET /api/meters/user/:userId
 * @desc    Get meters assigned to user
 * @access  Private (own meters or admin)
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    // Users can only view their own meters unless they're admin
    if (req.user!.userId !== req.params.userId && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this user\'s meters',
      });
    }

    const meters = await MeterService.getMetersByUser(req.params.userId);

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

/**
 * @route   POST /api/meters/schedule
 * @desc    Schedule reading
 * @access  Admin only
 */
router.post(
  '/schedule',
  authorize(UserRole.ADMIN),
  validate(createScheduledReadingSchema),
  async (req: Request, res: Response) => {
    try {
      const scheduledReading = await MeterService.scheduleReading(req.body);

      res.status(201).json({
        success: true,
        data: scheduledReading,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule reading',
      });
    }
  }
);

export default router;

