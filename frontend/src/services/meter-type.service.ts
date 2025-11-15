import apiClient from '@/lib/api';
import {
  MeterTypeModel,
  CreateMeterTypeRequest,
  UpdateMeterTypeRequest,
} from '../../../common/types/meter.types';
import { ApiResponse } from '../../../common/types/api.types';

/**
 * Meter Type service
 */
export const meterTypeService = {
  /**
   * Get all meter types
   */
  async getAllMeterTypes(): Promise<MeterTypeModel[]> {
    const response = await apiClient.get<ApiResponse<MeterTypeModel[]>>(
      '/api/meter-types'
    );
    return response.data.data!;
  },

  /**
   * Get meter type by ID
   */
  async getMeterTypeById(id: string): Promise<MeterTypeModel> {
    const response = await apiClient.get<ApiResponse<MeterTypeModel>>(
      `/api/meter-types/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create meter type
   */
  async createMeterType(data: CreateMeterTypeRequest): Promise<MeterTypeModel> {
    const response = await apiClient.post<ApiResponse<MeterTypeModel>>(
      '/api/meter-types',
      data
    );
    return response.data.data!;
  },

  /**
   * Update meter type
   */
  async updateMeterType(
    id: string,
    data: UpdateMeterTypeRequest
  ): Promise<MeterTypeModel> {
    const response = await apiClient.put<ApiResponse<MeterTypeModel>>(
      `/api/meter-types/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete meter type
   */
  async deleteMeterType(id: string): Promise<void> {
    await apiClient.delete(`/api/meter-types/${id}`);
  },
};

