import api from './api';
import { ApiResponse, PaginatedResponse } from '../types/common';
import { NotificationItem } from '../types/Notification';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return response.data.data;
  },

  async getNotificationsPaginated(page = 0, size = 10): Promise<PaginatedResponse<NotificationItem>> {
    const response = await api.get<ApiResponse<PaginatedResponse<NotificationItem>>>('/notifications/paginated', {
      params: { page, size },
    });
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  async markAsRead(id: number): Promise<void> {
    await api.put<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put<ApiResponse<void>>('/notifications/mark-all-read');
  },
};
