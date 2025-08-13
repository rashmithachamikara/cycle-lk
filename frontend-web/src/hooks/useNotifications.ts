import { useState, useEffect } from 'react';
import { notificationService, FCMNotification } from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<FCMNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to notification updates
    const handleNotificationsUpdate = (updatedNotifications: FCMNotification[]) => {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    };

    notificationService.subscribe(handleNotificationsUpdate);

    // Cleanup subscription on unmount
    return () => {
      notificationService.unsubscribe(handleNotificationsUpdate);
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const clearNotifications = () => {
    notificationService.clearNotifications();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};
