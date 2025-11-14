import { Router, Request, Response } from 'express';
import { ReportService } from '../../services/report.service';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validateQuery } from '../../middleware/validation.middleware';
import { reportFilterSchema } from '../../utils/validation';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reports
 * @desc    Generate report
 * @access  Admin only
 */
router.get(
  '/',
  authorize(UserRole.ADMIN),
  validateQuery(reportFilterSchema),
  async (req: Request, res: Response) => {
    try {
      const filters: any = {};

      if (req.query.locationId) {
        filters.locationId = req.query.locationId as string;
      }
      if (req.query.readerId) {
        filters.readerId = req.query.readerId as string;
      }
      if (req.query.meterType) {
        filters.meterType = req.query.meterType as string;
      }
      if (req.query.frequency) {
        filters.frequency = req.query.frequency as string;
      }
      if (req.query.startDate) {
        filters.startDate = req.query.startDate as string;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate as string;
      }

      const reportData = await ReportService.generateReport(filters);

      res.json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      });
    }
  }
);

/**
 * @route   GET /api/reports/export
 * @desc    Export report as CSV or PDF
 * @access  Admin only
 */
router.get(
  '/export',
  authorize(UserRole.ADMIN),
  validateQuery(
    reportFilterSchema.extend({
      format: z.enum(['csv', 'pdf']),
    })
  ),
  async (req: Request, res: Response) => {
    try {
      const format = req.query.format as 'csv' | 'pdf';
      const filters: any = {};

      if (req.query.locationId) {
        filters.locationId = req.query.locationId as string;
      }
      if (req.query.readerId) {
        filters.readerId = req.query.readerId as string;
      }
      if (req.query.meterType) {
        filters.meterType = req.query.meterType as string;
      }
      if (req.query.frequency) {
        filters.frequency = req.query.frequency as string;
      }
      if (req.query.startDate) {
        filters.startDate = req.query.startDate as string;
      }
      if (req.query.endDate) {
        filters.endDate = req.query.endDate as string;
      }

      const reportData = await ReportService.generateReport(filters);

      if (format === 'csv') {
        const csvContent = ReportService.generateCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="yardops-report-${new Date().toISOString()}.csv"`
        );
        res.send(csvContent);
      } else if (format === 'pdf') {
        const pdfContent = ReportService.generatePDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="yardops-report-${new Date().toISOString()}.pdf"`
        );
        res.send(pdfContent);
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid format. Use "csv" or "pdf"',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export report',
      });
    }
  }
);

export default router;

