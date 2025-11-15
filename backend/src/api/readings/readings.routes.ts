import { Router, Request, Response } from 'express';
import { ReadingService } from '../../services/reading.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createReadingSchema, updateReadingSchema } from '../../utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/readings
 * @desc    Get all readings
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = {};

    if (req.query.meterId) {
      filters.meterId = req.query.meterId as string;
    }
    if (req.query.userId) {
      filters.userId = req.query.userId as string;
    }
    if (req.query.locationId) {
      filters.locationId = req.query.locationId as string;
    }
    if (req.query.meterType) {
      filters.meterType = req.query.meterType as string;
    }
    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }

    const result = await ReadingService.getAllReadings(page, limit, filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch readings',
    });
  }
});

/**
 * @route   GET /api/readings/stats
 * @desc    Get reading statistics
 * @access  Admin only
 */
router.get(
  '/stats',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const stats = await ReadingService.getReadingStats();

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
  }
);

/**
 * @route   GET /api/readings/meter/:meterId
 * @desc    Get readings for a specific meter
 * @access  Private
 */
router.get('/meter/:meterId', async (req: Request, res: Response) => {
  try {
    const result = await ReadingService.getMeterReadings(req.params.meterId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Meter not found',
    });
  }
});

/**
 * @route   GET /api/readings/user/:userId
 * @desc    Get readings by user
 * @access  Private (own readings or admin)
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    // Users can only view their own readings unless they're admin
    if (req.user!.userId !== req.params.userId && req.user!.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this user\'s readings',
      });
    }

    const readings = await ReadingService.getUserReadings(req.params.userId);

    res.json({
      success: true,
      data: readings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch readings',
    });
  }
});

/**
 * @route   GET /api/readings/:id
 * @desc    Get reading by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const reading = await ReadingService.getReadingById(req.params.id);

    res.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Reading not found',
    });
  }
});

/**
 * @route   POST /api/readings
 * @desc    Create reading
 * @access  Private
 */
router.post(
  '/',
  validate(createReadingSchema),
  async (req: Request, res: Response) => {
    try {
      const reading = await ReadingService.createReading(req.body, req.user!.userId);

      res.status(201).json({
        success: true,
        data: reading,
      });
    } catch (error: any) {
      console.error('Error creating reading:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create reading';
      res.status(400).json({
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error?.stack || String(error) 
        }),
      });
    }
  }
);

/**
 * @route   PUT /api/readings/:id
 * @desc    Update reading
 * @access  Private (own reading or admin)
 */
router.put(
  '/:id',
  validate(updateReadingSchema),
  async (req: Request, res: Response) => {
    try {
      // Check if user is admin or owns the reading
      const reading = await ReadingService.getReadingById(req.params.id);
      if (reading.userId !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to update this reading',
        });
      }

      const updatedReading = await ReadingService.updateReading(
        req.params.id,
        req.body,
        req.user!.userId
      );

      res.json({
        success: true,
        data: updatedReading,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update reading',
      });
    }
  }
);

/**
 * @route   DELETE /api/readings/:id
 * @desc    Delete reading
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      await ReadingService.deleteReading(req.params.id);

      res.json({
        success: true,
        message: 'Reading deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete reading',
      });
    }
  }
);

export default router;

