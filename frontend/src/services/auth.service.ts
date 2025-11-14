import apiClient from '@/lib/api';
import { AuthResponse, LoginRequest, CreateUserRequest } from '../../../common/types/user.types';
import { ApiResponse } from '../../../common/types/api.types';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(data: CreateUserRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/register',
      data
    );
    return response.data.data!;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      data
    );
    return response.data.data!;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me');
    return response.data.data;
  },
};

