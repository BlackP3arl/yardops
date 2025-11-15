import apiClient from '@/lib/api';
import {
  Meter,
  CreateMeterRequest,
  UpdateMeterRequest,
  AssignMeterRequest,
  MeterAssignment,
  CreateScheduledReadingRequest,
} from '../../../common/types/meter.types';
import { ApiResponse, PaginatedResponse } from '../../../common/types/api.types';

/**
 * Meter service
 */
export const meterService = {
  /**
   * Get all meters
   */
  async getAllMeters(
    page: number = 1,
    limit: number = 10,
    filters?: {
      locationId?: string;
      meterTypeId?: string;
      frequency?: string;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.locationId && { locationId: filters.locationId }),
      ...(filters?.meterTypeId && { meterTypeId: filters.meterTypeId }),
      ...(filters?.frequency && { frequency: filters.frequency }),
    });
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Meter>>
    >(`/api/meters?${params.toString()}`);
    return response.data.data!;
  },

  /**
   * Get meter by ID
   */
  async getMeterById(id: string): Promise<Meter> {
    const response = await apiClient.get<ApiResponse<Meter>>(
      `/api/meters/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create meter
   */
  async createMeter(data: CreateMeterRequest): Promise<Meter> {
    const response = await apiClient.post<ApiResponse<Meter>>(
      '/api/meters',
      data
    );
    return response.data.data!;
  },

  /**
   * Update meter
   */
  async updateMeter(id: string, data: UpdateMeterRequest): Promise<Meter> {
    const response = await apiClient.put<ApiResponse<Meter>>(
      `/api/meters/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete meter
   */
  async deleteMeter(id: string): Promise<void> {
    await apiClient.delete(`/api/meters/${id}`);
  },

  /**
   * Assign meter to user
   */
  async assignMeter(data: AssignMeterRequest): Promise<MeterAssignment> {
    const response = await apiClient.post<ApiResponse<MeterAssignment>>(
      '/api/meters/assign',
      data
    );
    return response.data.data!;
  },

  /**
   * Unassign meter from user
   */
  async unassignMeter(meterId: string, userId: string): Promise<void> {
    await apiClient.delete(`/api/meters/${meterId}/assign/${userId}`);
  },

  /**
   * Get meters assigned to user
   */
  async getMetersByUser(userId: string): Promise<Meter[]> {
    const response = await apiClient.get<ApiResponse<Meter[]>>(
      `/api/meters/user/${userId}`
    );
    return response.data.data!;
  },

  /**
   * Schedule reading
   */
  async scheduleReading(
    data: CreateScheduledReadingRequest
  ): Promise<void> {
    await apiClient.post('/api/meters/schedule', data);
  },
};

