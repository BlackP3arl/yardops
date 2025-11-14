import { Router, Request, Response } from 'express';
import { LocationService } from '../../services/location.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createLocationSchema, updateLocationSchema } from '../../utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/locations
 * @desc    Get all locations
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const locations = await LocationService.getAllLocations();

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch locations',
    });
  }
});

/**
 * @route   GET /api/locations/:id
 * @desc    Get location by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const location = await LocationService.getLocationById(req.params.id);

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Location not found',
    });
  }
});

/**
 * @route   POST /api/locations
 * @desc    Create location
 * @access  Admin only
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createLocationSchema),
  async (req: Request, res: Response) => {
    try {
      const location = await LocationService.createLocation(req.body);

      res.status(201).json({
        success: true,
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create location',
      });
    }
  }
);

/**
 * @route   PUT /api/locations/:id
 * @desc    Update location
 * @access  Admin only
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateLocationSchema),
  async (req: Request, res: Response) => {
    try {
      const location = await LocationService.updateLocation(req.params.id, req.body);

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update location',
      });
    }
  }
);

/**
 * @route   DELETE /api/locations/:id
 * @desc    Delete location
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      await LocationService.deleteLocation(req.params.id);

      res.json({
        success: true,
        message: 'Location deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete location',
      });
    }
  }
);

export default router;

