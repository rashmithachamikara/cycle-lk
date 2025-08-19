import { useState, useEffect, useCallback } from 'react';
import { notificationService, FCMNotification } from '../services/notificationService';
import { notificationIntegrationService } from '../services/notificationIntegrationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<FCMNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch unread count from server
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const count = await notificationIntegrationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Subscribe to FCM notification updates
    const handleNotificationsUpdate = (updatedNotifications: FCMNotification[]) => {
      setNotifications(updatedNotifications);
    };

    notificationService.subscribe(handleNotificationsUpdate);

    // Cleanup subscription on unmount
    return () => {
      notificationService.unsubscribe(handleNotificationsUpdate);
    };
  }, []);

  // Real-time unread count updates
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchUnreadCount();

    // Subscribe to real-time notification updates
    const unsubscribe = notificationIntegrationService.onNotificationUpdate(() => {
      console.log('[useNotifications] Real-time update received, refreshing unread count...');
      fetchUnreadCount();
    });

    console.log('[useNotifications] Subscribed to real-time notification updates');

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log('[useNotifications] Unsubscribed from real-time notification updates');
      }
    };
  }, [user, fetchUnreadCount]);

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    // Optimistically update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    try {
      await notificationIntegrationService.markAllAsRead();
      notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Refresh count on error to ensure accuracy
      fetchUnreadCount();
    }
  };

  const clearNotifications = () => {
    notificationService.clearNotifications();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};
