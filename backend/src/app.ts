import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './api/auth/auth.routes';
import userRoutes from './api/users/users.routes';
import locationRoutes from './api/locations/locations.routes';
import meterTypeRoutes from './api/meter-types/meter-types.routes';
import meterRoutes from './api/meters/meters.routes';
import readingRoutes from './api/readings/readings.routes';
import notificationRoutes from './api/notifications/notifications.routes';
import reportRoutes from './api/reports/reports.routes';

/**
 * Express application setup
 */
const app: Express = express();

// CORS configuration - must be before other middleware
const isDevelopment = process.env.NODE_ENV !== 'production';

const corsOptions = {
  origin: isDevelopment
    ? true // Allow all origins in development
    : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:3000',
          'http://127.0.0.1:3000',
        ];
        
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Security middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting - skip OPTIONS requests
// More lenient limits in development (isDevelopment already declared above)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => req.method === 'OPTIONS',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // Much higher limit in development (50 vs 5)
  message: 'Too many authentication attempts, please try again later.',
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/meter-types', meterTypeRoutes);
app.use('/api/meters', meterRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Start server
 */
const PORT = process.env.PORT || 5001; // Changed from 5000 to avoid macOS AirPlay conflict

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;

