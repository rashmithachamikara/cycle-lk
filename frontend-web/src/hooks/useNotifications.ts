import { useState, useEffect } from 'react';
import { notificationService, FCMNotification } from '../services/notificationService';
import { notificationIntegrationService } from '../services/notificationIntegrationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<FCMNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Fetch database notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
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
    };

    fetchUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async () => {
    try {
      await notificationIntegrationService.markAllAsRead();
      notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
