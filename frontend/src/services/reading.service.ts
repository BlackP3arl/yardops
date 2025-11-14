import apiClient from '@/lib/api';
import {
  Reading,
  CreateReadingRequest,
  UpdateReadingRequest,
  ReadingStats,
  MeterReadingHistory,
} from '../../../common/types/reading.types';
import { ApiResponse, PaginatedResponse } from '../../../common/types/api.types';

/**
 * Reading service
 */
export const readingService = {
  /**
   * Get all readings
   */
  async getAllReadings(
    page: number = 1,
    limit: number = 10,
    filters?: {
      meterId?: string;
      userId?: string;
      locationId?: string;
      meterType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.meterId && { meterId: filters.meterId }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.locationId && { locationId: filters.locationId }),
      ...(filters?.meterType && { meterType: filters.meterType }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Reading>>
    >(`/api/readings?${params.toString()}`);
    return response.data.data!;
  },

  /**
   * Get reading statistics
   */
  async getReadingStats(): Promise<ReadingStats> {
    const response = await apiClient.get<ApiResponse<ReadingStats>>(
      '/api/readings/stats'
    );
    return response.data.data!;
  },

  /**
   * Get readings for a specific meter
   */
  async getMeterReadings(meterId: string): Promise<MeterReadingHistory> {
    const response = await apiClient.get<ApiResponse<MeterReadingHistory>>(
      `/api/readings/meter/${meterId}`
    );
    return response.data.data!;
  },

  /**
   * Get readings by user
   */
  async getUserReadings(userId: string): Promise<Reading[]> {
    const response = await apiClient.get<ApiResponse<Reading[]>>(
      `/api/readings/user/${userId}`
    );
    return response.data.data!;
  },

  /**
   * Get reading by ID
   */
  async getReadingById(id: string): Promise<Reading> {
    const response = await apiClient.get<ApiResponse<Reading>>(
      `/api/readings/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create reading
   */
  async createReading(data: CreateReadingRequest): Promise<Reading> {
    const response = await apiClient.post<ApiResponse<Reading>>(
      '/api/readings',
      data
    );
    return response.data.data!;
  },

  /**
   * Update reading
   */
  async updateReading(
    id: string,
    data: UpdateReadingRequest
  ): Promise<Reading> {
    const response = await apiClient.put<ApiResponse<Reading>>(
      `/api/readings/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete reading
   */
  async deleteReading(id: string): Promise<void> {
    await apiClient.delete(`/api/readings/${id}`);
  },
};

