import apiClient from '@/lib/api';
import { ReportFilters, ReportData, ExportFormat } from '../../../common/types/report.types';
import { ApiResponse } from '../../../common/types/api.types';

/**
 * Report service
 */
export const reportService = {
  /**
   * Generate report
   */
  async generateReport(filters: ReportFilters): Promise<ReportData> {
    const params = new URLSearchParams();
    if (filters.locationId) params.append('locationId', filters.locationId);
    if (filters.readerId) params.append('readerId', filters.readerId);
    if (filters.meterType) params.append('meterType', filters.meterType);
    if (filters.frequency) params.append('frequency', filters.frequency);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get<ApiResponse<ReportData>>(
      `/api/reports?${params.toString()}`
    );
    return response.data.data!;
  },

  /**
   * Export report
   */
  async exportReport(filters: ReportFilters, format: ExportFormat): Promise<Blob> {
    const params = new URLSearchParams({ format });
    if (filters.locationId) params.append('locationId', filters.locationId);
    if (filters.readerId) params.append('readerId', filters.readerId);
    if (filters.meterType) params.append('meterType', filters.meterType);
    if (filters.frequency) params.append('frequency', filters.frequency);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/api/reports/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

