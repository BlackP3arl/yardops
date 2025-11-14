export interface ReportFilters {
  locationId?: string;
  readerId?: string;
  meterType?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportData {
  readings: Array<{
    id: string;
    meterNumber: string;
    meterType: string;
    location: string;
    reader: string;
    value: number;
    readingDate: string;
    comment?: string;
  }>;
  summary: {
    totalReadings: number;
    totalMeters: number;
    totalLocations: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export type ExportFormat = 'csv' | 'pdf';

