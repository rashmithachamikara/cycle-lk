import { api, debugLog } from '../utils/apiUtils';

// Log service initialization in debug mode
debugLog('Notification Service initialized');

// Interface for notification filter parameters
export interface NotificationFilterParams {
  userId: string;
  read?: boolean;
  type?: string;
  limit?: number;
}

// Notification service object
export const notificationService = {
  // Get user notifications
  getUserNotifications: async (filters: NotificationFilterParams) => {
    debugLog('Fetching user notifications', filters);
    const response = await api.get('/notifications', { params: filters });
    return response.data;
  },

  // Get notification by ID
  getNotificationById: async (id: string) => {
    debugLog('Fetching notification by ID', { id });
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (userId: string) => {
    debugLog('Fetching unread notification count', { userId });
    const response = await api.get(`/notifications/unread-count/${userId}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    debugLog('Marking notification as read', { id });
    const response = await api.put(`/notifications/${id}/mark-read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    debugLog('Marking all notifications as read');
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    debugLog('Deleting notification', { id });
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete all user notifications
  deleteAllNotifications: async (userId: string) => {
    debugLog('Deleting all user notifications', { userId });
    const response = await api.delete(`/notifications/user/${userId}`);
    return response.data;
  }
};
