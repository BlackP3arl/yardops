import { Router, Request, Response } from 'express';
import { MeterTypeService } from '../../services/meter-type.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createMeterTypeSchema, updateMeterTypeSchema } from '../../utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/meter-types
 * @desc    Get all meter types
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const meterTypes = await MeterTypeService.getAllMeterTypes();

    res.json({
      success: true,
      data: meterTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch meter types',
    });
  }
});

/**
 * @route   GET /api/meter-types/:id
 * @desc    Get meter type by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const meterType = await MeterTypeService.getMeterTypeById(req.params.id);

    res.json({
      success: true,
      data: meterType,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error instanceof Error ? error.message : 'Meter type not found',
    });
  }
});

/**
 * @route   POST /api/meter-types
 * @desc    Create meter type
 * @access  Admin only
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validate(createMeterTypeSchema),
  async (req: Request, res: Response) => {
    try {
      const meterType = await MeterTypeService.createMeterType(req.body);

      res.status(201).json({
        success: true,
        data: meterType,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create meter type',
      });
    }
  }
);

/**
 * @route   PUT /api/meter-types/:id
 * @desc    Update meter type
 * @access  Admin only
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validate(updateMeterTypeSchema),
  async (req: Request, res: Response) => {
    try {
      const meterType = await MeterTypeService.updateMeterType(req.params.id, req.body);

      res.json({
        success: true,
        data: meterType,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update meter type',
      });
    }
  }
);

/**
 * @route   DELETE /api/meter-types/:id
 * @desc    Delete meter type
 * @access  Admin only
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      await MeterTypeService.deleteMeterType(req.params.id);

      res.json({
        success: true,
        message: 'Meter type deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete meter type',
      });
    }
  }
);

export default router;

