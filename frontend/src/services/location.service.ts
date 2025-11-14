import apiClient from '@/lib/api';
import {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
} from '../../../common/types/meter.types';
import { ApiResponse } from '../../../common/types/api.types';

/**
 * Location service
 */
export const locationService = {
  /**
   * Get all locations
   */
  async getAllLocations(): Promise<Location[]> {
    const response = await apiClient.get<ApiResponse<Location[]>>(
      '/api/locations'
    );
    return response.data.data!;
  },

  /**
   * Get location by ID
   */
  async getLocationById(id: string): Promise<Location> {
    const response = await apiClient.get<ApiResponse<Location>>(
      `/api/locations/${id}`
    );
    return response.data.data!;
  },

  /**
   * Create location
   */
  async createLocation(data: CreateLocationRequest): Promise<Location> {
    const response = await apiClient.post<ApiResponse<Location>>(
      '/api/locations',
      data
    );
    return response.data.data!;
  },

  /**
   * Update location
   */
  async updateLocation(
    id: string,
    data: UpdateLocationRequest
  ): Promise<Location> {
    const response = await apiClient.put<ApiResponse<Location>>(
      `/api/locations/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete location
   */
  async deleteLocation(id: string): Promise<void> {
    await apiClient.delete(`/api/locations/${id}`);
  },
};

