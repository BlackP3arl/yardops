import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { ReportFilters, ReportData } from '../../../common/types/report.types';

/**
 * Report service
 * Handles report generation and export
 */
export class ReportService {
  /**
   * Generate report data
   */
  static async generateReport(filters: ReportFilters): Promise<ReportData> {
    const where: any = {};

    // Apply date filters
    if (filters.startDate || filters.endDate) {
      where.readingDate = {};
      if (filters.startDate) {
        where.readingDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.readingDate.lte = new Date(filters.endDate);
      }
    }

    // Get all readings with filters
    const readings = await prisma.reading.findMany({
      where,
      include: {
        meter: {
          include: {
            location: true,
            meterType: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { readingDate: 'desc' },
    });

    // Apply additional filters
    let filteredReadings = readings;
    if (filters.locationId) {
      filteredReadings = filteredReadings.filter(
        (reading) => reading.meter.locationId === filters.locationId
      );
    }
    if (filters.meterTypeId || filters.meterType) {
      const meterTypeFilter = filters.meterTypeId || filters.meterType;
      filteredReadings = filteredReadings.filter(
        (reading) => reading.meter.meterTypeId === meterTypeFilter || reading.meter.meterType?.name === meterTypeFilter
      );
    }
    if (filters.readerId) {
      filteredReadings = filteredReadings.filter(
        (reading) => reading.userId === filters.readerId
      );
    }
    if (filters.frequency) {
      filteredReadings = filteredReadings.filter(
        (reading) => reading.meter.frequency === filters.frequency
      );
    }

    // Get unique meters and locations
    const uniqueMeters = new Set(filteredReadings.map((r) => r.meterId));
    const uniqueLocations = new Set(
      filteredReadings.map((r) => r.meter.locationId)
    );

    // Format report data
    const reportData: ReportData = {
      readings: filteredReadings.map((reading) => ({
        id: reading.id,
        meterNumber: reading.meter.meterNumber,
        meterType: reading.meter.meterType?.name || 'Unknown',
        location: reading.meter.location.name,
        reader: `${reading.user.firstName} ${reading.user.lastName}`,
        value: reading.value,
        readingDate: reading.readingDate.toISOString(),
        comment: reading.comment || undefined,
      })),
      summary: {
        totalReadings: filteredReadings.length,
        totalMeters: uniqueMeters.size,
        totalLocations: uniqueLocations.size,
        dateRange: {
          start: filters.startDate || 'N/A',
          end: filters.endDate || 'N/A',
        },
      },
    };

    logger.info(
      {
        totalReadings: reportData.readings.length,
        filters,
      },
      'Report generated'
    );

    return reportData;
  }

  /**
   * Generate CSV content
   */
  static generateCSV(reportData: ReportData): string {
    const headers = [
      'Meter Number',
      'Meter Type',
      'Location',
      'Reader',
      'Value',
      'Reading Date',
      'Comment',
    ];

    const rows = reportData.readings.map((reading) => [
      reading.meterNumber,
      reading.meterType,
      reading.location,
      reading.reader,
      reading.value.toString(),
      reading.readingDate,
      reading.comment || '',
    ]);

    const csvRows = [headers.join(','), ...rows.map((row) => row.join(','))];

    return csvRows.join('\n');
  }

  /**
   * Generate PDF content (simplified - in production, use a library like pdfkit)
   */
  static generatePDF(reportData: ReportData): string {
    // This is a simplified version
    // In production, use a library like pdfkit or puppeteer
    let pdfContent = `YardOps Meter Reading Report\n`;
    pdfContent += `Generated: ${new Date().toISOString()}\n\n`;
    pdfContent += `Summary:\n`;
    pdfContent += `- Total Readings: ${reportData.summary.totalReadings}\n`;
    pdfContent += `- Total Meters: ${reportData.summary.totalMeters}\n`;
    pdfContent += `- Total Locations: ${reportData.summary.totalLocations}\n`;
    pdfContent += `- Date Range: ${reportData.summary.dateRange.start} to ${reportData.summary.dateRange.end}\n\n`;
    pdfContent += `Readings:\n`;
    pdfContent += `Meter Number | Type | Location | Reader | Value | Date | Comment\n`;
    pdfContent += `-`.repeat(80) + `\n`;

    reportData.readings.forEach((reading) => {
      pdfContent += `${reading.meterNumber} | ${reading.meterType} | ${reading.location} | ${reading.reader} | ${reading.value} | ${reading.readingDate} | ${reading.comment || ''}\n`;
    });

    return pdfContent;
  }
}

