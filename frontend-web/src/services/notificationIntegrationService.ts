import { realtimeEventService, RealtimeEvent, EventType } from './realtimeEventService';
import { notificationService } from './notificationService';
import { api } from '../utils/apiUtils';
import toast from 'react-hot-toast';

/**
 * Service to integrate real-time events with notifications
 * Bridges the gap between Firebase real-time events and MongoDB notifications
 */
class NotificationIntegrationService {
  private userId: string | null = null;
  private userRole: 'user' | 'partner' | 'admin' | null = null;
  private listenerId: string | null = null;
  private isInitialized: boolean = false;
  private processedEventIds: Set<string> = new Set();
  private updateCallbacks: Set<() => void> = new Set();

  /**
   * Initialize the notification integration for a user
   */
  async initialize(userId: string, userRole: 'user' | 'partner' | 'admin') {
    // Prevent multiple initializations
    if (this.isInitialized && this.userId === userId) {
      console.log('[NotificationIntegration] Already initialized for user:', userId);
      return;
    }

    // Cleanup previous initialization
    if (this.isInitialized) {
      this.cleanup();
    }

    this.userId = userId;
    this.userRole = userRole;
    this.isInitialized = true;
    this.processedEventIds.clear();

    console.log('[NotificationIntegration] Initializing for user:', userId, 'role:', userRole);

    // Register FCM token if available
    await this.registerFCMToken();

    // Subscribe to real-time events
    this.subscribeToRealtimeEvents();
  }

  /**
   * Subscribe to notification updates
   */
  onNotificationUpdate(callback: () => void): () => void {
    this.updateCallbacks.add(callback);
    console.log('[NotificationIntegration] Added update callback, total callbacks:', this.updateCallbacks.size);
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
      console.log('[NotificationIntegration] Removed update callback, remaining callbacks:', this.updateCallbacks.size);
    };
  }

  /**
   * Notify all subscribers about notification updates
   */
  private notifyUpdateCallbacks() {
    console.log('[NotificationIntegration] Notifying', this.updateCallbacks.size, 'update callbacks');
    this.updateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[NotificationIntegration] Error in update callback:', error);
      }
    });
  }

  /**
   * Subscribe to real-time events for the current user
   */
  private subscribeToRealtimeEvents() {
    if (!this.userId || !this.userRole) return;

    this.listenerId = realtimeEventService.subscribeToUserEvents(
      this.userId,
      this.userRole,
      this.handleRealtimeEvents.bind(this)
    );
  }

  /**
   * Handle incoming real-time events
   */
  private handleRealtimeEvents(events: RealtimeEvent[]) {
    let hasNewEvents = false;
    
    events.forEach(event => {
      // Prevent duplicate processing
      if (!event.id || this.processedEventIds.has(event.id)) {
        console.log('[NotificationIntegration] Skipping already processed event:', event.id);
        return;
      }

      console.log('[NotificationIntegration] Processing new event:', event.type, event.id);
      this.processedEventIds.add(event.id);
      hasNewEvents = true;

      // Show toast notification based on event type and user role
      this.showToastNotification(event);
      
      // Mark the real-time event as processed
      realtimeEventService.markEventAsProcessed(event.id);
    });

    // Notify subscribers about new notifications
    if (hasNewEvents) {
      this.notifyUpdateCallbacks();
    }
  }

  /**
   * Show appropriate toast notification based on event type
   */
  private showToastNotification(event: RealtimeEvent) {
    // Only show toast if this event is meant for the current user
    if (event.targetUserId !== this.userId) return;

    switch (event.type) {
      case EventType.BOOKING_CREATED:
        if (this.userRole === 'partner') {
          toast.success('New booking request received!');
        }
        break;

      case EventType.NEW_BOOKING_CREATED_FOR_OWNER:
        if (this.userRole === 'partner') {
          toast.success('A New booking has been created for your Bike!');
        } 
        break;

      case EventType.NEW_DROPOFF_BOOKING:
        if (this.userRole === 'partner') {
          toast.success('A new drop-off booking has been scheduled for you!');
        }
        break;

      case EventType.BOOKING_ACCEPTED:
        if (this.userRole === 'user') {
          toast.success('Your booking has been confirmed!');
        }
        break;

      case EventType.BOOKING_REJECTED:
        if (this.userRole === 'user') {
          toast.error('Your booking request was declined');
        }
        break;

      case EventType.BOOKING_COMPLETED:
        toast.success('Booking completed successfully!');
        break;

      case EventType.BOOKING_CANCELLED:
        toast.error('Booking has been cancelled');
        break;

      case EventType.PAYMENT_COMPLETED:
        toast.success('Payment completed successfully!');
        break;

      default:
        break;
    }
  }

  /**
   * Register FCM token with backend
   */
  private async registerFCMToken() {
    try {
      if (!this.userId || !this.userRole) return;

      const token = await notificationService.requestPermissionAndGetToken();
      if (token) {
        await notificationService.sendTokenToBackend(token, this.userId, this.userRole);
        console.log('FCM token registered successfully');
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }


  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      if (!this.userId) return 0;
      
      const response = await api.get(`/notifications/unread-count/${this.userId}`);
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      await api.put(`/notifications/${notificationId}/mark-read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await api.put('/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Cleanup when user logs out or component unmounts
   */
  cleanup() {
    console.log('[NotificationIntegration] Cleaning up...');
    
    if (this.listenerId) {
      realtimeEventService.unsubscribe(this.listenerId);
      this.listenerId = null;
    }
    
    this.userId = null;
    this.userRole = null;
    this.isInitialized = false;
    this.processedEventIds.clear();
    this.updateCallbacks.clear();
  }
}

// Create singleton instance
export const notificationIntegrationService = new NotificationIntegrationService();

export default notificationIntegrationService;
