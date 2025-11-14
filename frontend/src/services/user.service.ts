import apiClient from '@/lib/api';
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '../../../common/types/user.types';
import { ApiResponse, PaginatedResponse } from '../../../common/types/api.types';

/**
 * User service
 */
export const userService = {
  /**
   * Get all users
   */
  async getAllUsers(page: number = 1, limit: number = 10, role?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role }),
    });
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      `/api/users?${params.toString()}`
    );
    return response.data.data!;
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/api/users/${id}`);
    return response.data.data!;
  },

  /**
   * Create user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/api/users', data);
    return response.data.data!;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      `/api/users/${id}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/users/${id}`);
  },
};

