import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '../../../common/types/api.types';

/**
 * API client configuration
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Create axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Token is sent via httpOnly cookie, so no need to add it here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    // Handle network errors
    if (!error.response) {
      const networkError = new Error('Network error: Unable to connect to server');
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Extract error message from response
    const errorMessage = error.response.data?.error || error.response.data?.message || error.message;
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response.status;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;

