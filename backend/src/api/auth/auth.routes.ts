import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../../utils/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await AuthService.register(req.body);

      // Set httpOnly cookie for access token
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await AuthService.login(req.body);

      // Set httpOnly cookie for access token
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await AuthService.getCurrentUser(req.user!.userId);
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

export default router;

