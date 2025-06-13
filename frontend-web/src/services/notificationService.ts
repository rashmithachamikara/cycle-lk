import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

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
    const response = await axios.get(`${API_URL}/notifications`, { params: filters });
    return response.data;
  },

  // Get notification by ID
  getNotificationById: async (id: string) => {
    const response = await axios.get(`${API_URL}/notifications/${id}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async (userId: string) => {
    const response = await axios.get(`${API_URL}/notifications/unread-count/${userId}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    const response = await axios.put(`${API_URL}/notifications/${id}/mark-read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axios.put(`${API_URL}/notifications/mark-all-read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    const response = await axios.delete(`${API_URL}/notifications/${id}`);
    return response.data;
  },

  // Delete all user notifications
  deleteAllNotifications: async (userId: string) => {
    const response = await axios.delete(`${API_URL}/notifications/user/${userId}`);
    return response.data;
  }
};
