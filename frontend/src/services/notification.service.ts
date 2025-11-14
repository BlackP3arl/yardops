import apiClient from '@/lib/api';
import {
  Notification,
  NotificationStats,
  CreateNotificationRequest,
} from '../../../common/types/notification.types';
import { ApiResponse, PaginatedResponse } from '../../../common/types/api.types';

/**
 * Notification service
 */
export const notificationService = {
  /**
   * Get user notifications
   */
  async getUserNotifications(
    page: number = 1,
    limit: number = 20,
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Notification>>
    >(`/api/notifications?${params.toString()}`);
    return response.data.data!;
  },

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await apiClient.get<ApiResponse<NotificationStats>>(
      '/api/notifications/stats'
    );
    return response.data.data!;
  },

  /**
   * Create notification (Admin only)
   */
  async createNotification(
    data: CreateNotificationRequest
  ): Promise<Notification> {
    const response = await apiClient.post<ApiResponse<Notification>>(
      '/api/notifications',
      data
    );
    return response.data.data!;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.put<ApiResponse<Notification>>(
      `/api/notifications/${notificationId}/read`
    );
    return response.data.data!;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/api/notifications/read-all');
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`);
  },
};

