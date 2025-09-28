import { messaging, getToken, onMessage } from '../config/firebase';
import { api, debugLog } from '../utils/apiUtils';

// Log service initialization in debug mode
debugLog('Notification Service initialized');

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  type?: 'BOOKING_CREATED' | 'BOOKING_ACCEPTED' | 'BOOKING_REJECTED' | 'BOOKING_COMPLETED' | 'PAYMENT_REQUIRED' | 'NEW_BOOKING_CREATED_FOR_OWNER' | 'NEW_DROPOFF_BOOKING';
}

export interface FCMNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  type: 'BOOKING_CREATED' | 'BOOKING_ACCEPTED' | 'BOOKING_REJECTED' | 'BOOKING_COMPLETED' | 'PAYMENT_REQUIRED' | 'NEW_BOOKING_CREATED_FOR_OWNER' | 'NEW_DROPOFF_BOOKING';
  data?: Record<string, string>;
}

// Interface for notification filter parameters
export interface NotificationFilterParams {
  userId: string;
  read?: boolean;
  type?: string;
  limit?: number;
}

class NotificationService {
  private vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  private notifications: FCMNotification[] = [];
  private listeners: ((notifications: FCMNotification[]) => void)[] = [];

  constructor() {
    this.setupMessageListener();
  }

  // Request notification permission and get FCM token
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return null;
      }

      // Check if VAPID key is configured
      if (!this.vapidKey || this.vapidKey === 'YOUR_VAPID_KEY_HERE') {
        console.warn('VAPID key is not configured. FCM push notifications will not work.');
        console.log('To fix this:');
        console.log('1. Go to Firebase Console > Project Settings > Cloud Messaging');
        console.log('2. In Web Push certificates section, click "Generate key pair"');
        console.log('3. Copy the key and set it as VITE_FIREBASE_VAPID_KEY in .env.local');
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: this.vapidKey
        });
        
        if (token) {
          console.log('FCM Token:', token);
          // Store token in localStorage for persistence
          localStorage.setItem('fcmToken', token);
          return token;
        } else {
          console.log('No registration token available');
          return null;
        }
      } else {
        console.log('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Setup listener for foreground messages
  private setupMessageListener() {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      const notification: FCMNotification = {
        id: Date.now().toString(),
        title: payload.notification?.title || 'New Notification',
        body: payload.notification?.body || '',
        timestamp: new Date(),
        read: false,
        type: (payload.data?.type as FCMNotification['type']) || 'BOOKING_CREATED',
        data: payload.data
      };

      // Add to notifications array
      this.notifications.unshift(notification);
      
      // Notify listeners
      this.notifyListeners();
      
      // Show browser notification if page is not focused
      if (document.hidden) {
        this.showBrowserNotification(notification);
      }
    });
  }

  // Show browser notification
  private showBrowserNotification(notification: FCMNotification) {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/logo192.png', // Add your app icon
        badge: '/logo192.png',
        tag: notification.id,
        data: notification.data
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        
        // Handle notification click based on type
        this.handleNotificationClick(notification);
      };
    }
  }

  // Handle notification click
  private handleNotificationClick(notification: FCMNotification) {
    switch (notification.type) {
      case 'BOOKING_CREATED':
        // Navigate to partner dashboard for partners
        if (notification.data?.userRole === 'partner') {
          window.location.href = '/partner-dashboard';
        }
        break;
      case 'BOOKING_ACCEPTED':
        // Navigate to user dashboard for users
        if (notification.data?.userRole === 'user') {
          window.location.href = '/dashboard';
        }
        break;
      case 'PAYMENT_REQUIRED':
        // Navigate to payment page
        if (notification.data?.bookingId) {
          window.location.href = `/booking/${notification.data.bookingId}/payment`;
        }
        break;
      default:
        // Default navigation
        window.location.href = '/dashboard';
    }
  }

  // Get current FCM token from localStorage
  getStoredToken(): string | null {
    return localStorage.getItem('fcmToken');
  }

  // Subscribe to notifications updates
  subscribe(callback: (notifications: FCMNotification[]) => void) {
    this.listeners.push(callback);
    // Immediately call with current notifications
    callback([...this.notifications]);
  }

  // Unsubscribe from notifications updates
  unsubscribe(callback: (notifications: FCMNotification[]) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners();
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get all notifications
  getNotifications(): FCMNotification[] {
    return [...this.notifications];
  }

  // Clear all notifications
  clearNotifications() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }

  // Send token to backend
  async sendTokenToBackend(token: string, userId: string, userRole: 'user' | 'partner' | 'admin') {
    try {
      const response = await api.post('/notifications/register-token', {
        token,
        userId,
        userRole,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        }
      });

      console.log('FCM token registered successfully');
      return response.data;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }

  // Legacy API methods for backward compatibility
  async getUserNotifications(filters: NotificationFilterParams) {
    debugLog('Fetching user notifications', filters);
    const response = await api.get('/notifications', { params: filters });
    return response.data;
  }

  async getNotificationById(id: string) {
    debugLog('Fetching notification by ID', { id });
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  }

  async deleteNotification(id: string) {
    debugLog('Deleting notification', { id });
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }

  async deleteAllNotifications(userId: string) {
    debugLog('Deleting all user notifications', { userId });
    const response = await api.delete(`/notifications/user/${userId}`);
    return response.data;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
