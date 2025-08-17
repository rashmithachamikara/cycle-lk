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

  /**
   * Initialize the notification integration for a user
   */
  async initialize(userId: string, userRole: 'user' | 'partner' | 'admin') {
    this.userId = userId;
    this.userRole = userRole;

    // Setup real-time event listeners
    this.setupRealtimeEventListeners();

    // Register FCM token if available
    await this.registerFCMToken();

    // Subscribe to real-time events
    this.subscribeToRealtimeEvents();
  }

  /**
   * Setup event listeners for different event types
   */
  private setupRealtimeEventListeners() {
    // Booking-related events
    realtimeEventService.onEvent(EventType.BOOKING_CREATED, this.handleBookingCreated.bind(this));
    realtimeEventService.onEvent(EventType.BOOKING_ACCEPTED, this.handleBookingAccepted.bind(this));
    realtimeEventService.onEvent(EventType.BOOKING_REJECTED, this.handleBookingRejected.bind(this));
    realtimeEventService.onEvent(EventType.BOOKING_COMPLETED, this.handleBookingCompleted.bind(this));
    realtimeEventService.onEvent(EventType.BOOKING_CANCELLED, this.handleBookingCancelled.bind(this));
    
    // Payment-related events
    realtimeEventService.onEvent(EventType.PAYMENT_COMPLETED, this.handlePaymentCompleted.bind(this));
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
    events.forEach(event => {
      // Create MongoDB notification for each real-time event
      this.createDatabaseNotification(event);
      
      // Mark the real-time event as processed
      if (event.id) {
        realtimeEventService.markEventAsProcessed(event.id);
      }
    });
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
   * Create a notification in MongoDB database
   */
  private async createDatabaseNotification(event: RealtimeEvent) {
    try {
      const notification = this.mapEventToNotification(event);
      if (notification) {
        await api.post('/notifications', notification);
        console.log('Database notification created for event:', event.type);
      }
    } catch (error) {
      console.error('Error creating database notification:', error);
    }
  }

  /**
   * Map real-time event to notification format
   */
  private mapEventToNotification(event: RealtimeEvent) {
    const baseNotification = {
      userId: event.targetUserId,
      sentVia: ['app'],
      relatedTo: {
        type: 'booking' as const,
        id: event.data.bookingId
      }
    };

    switch (event.type) {
      case EventType.BOOKING_CREATED:
        return {
          ...baseNotification,
          type: 'partner' as const,
          title: 'New Booking Request',
          message: `New booking request for ${event.data.bookingData?.bikeName || 'bike'}`
        };

      case EventType.BOOKING_ACCEPTED:
        return {
          ...baseNotification,
          type: 'system' as const,
          title: 'Booking Confirmed!',
          message: `Your booking for ${event.data.bookingData?.bikeName || 'bike'} has been confirmed`
        };

      case EventType.BOOKING_REJECTED:
        return {
          ...baseNotification,
          type: 'system' as const,
          title: 'Booking Declined',
          message: `Your booking request for ${event.data.bookingData?.bikeName || 'bike'} has been declined`
        };

      case EventType.BOOKING_COMPLETED:
        return {
          ...baseNotification,
          type: 'system' as const,
          title: 'Booking Completed',
          message: `Your rental of ${event.data.bookingData?.bikeName || 'bike'} has been completed. Please rate your experience!`
        };

      case EventType.BOOKING_CANCELLED:
        return {
          ...baseNotification,
          type: 'system' as const,
          title: 'Booking Cancelled',
          message: `Booking for ${event.data.bookingData?.bikeName || 'bike'} has been cancelled`
        };

      case EventType.PAYMENT_COMPLETED:
        return {
          ...baseNotification,
          type: 'payment' as const,
          title: 'Payment Confirmed',
          message: `Payment of LKR ${event.data.paymentData?.amount || 'amount'} has been processed successfully`,
          relatedTo: {
            type: 'payment' as const,
            id: event.data.bookingId || ''
          }
        };

      default:
        return null;
    }
  }

  /**
   * Event handlers for specific event types
   */
  private handleBookingCreated(_event: RealtimeEvent) {
    if (this.userRole === 'partner') {
      toast.success('New booking request received!');
    }
  }

  private handleBookingAccepted(_event: RealtimeEvent) {
    if (this.userRole === 'user') {
      toast.success('Your booking has been confirmed!');
    }
  }

  private handleBookingRejected(_event: RealtimeEvent) {
    if (this.userRole === 'user') {
      toast.error('Your booking request was declined');
    }
  }

  private handleBookingCompleted(_event: RealtimeEvent) {
    toast.success('Booking completed successfully!');
  }

  private handleBookingCancelled(_event: RealtimeEvent) {
    toast.error('Booking has been cancelled');
  }

  private handlePaymentCompleted(_event: RealtimeEvent) {
    toast.success('Payment completed successfully!');
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
    if (this.listenerId) {
      realtimeEventService.unsubscribe(this.listenerId);
    }
    
    // Clear event listeners
    realtimeEventService.disconnectAll();
    
    this.userId = null;
    this.userRole = null;
    this.listenerId = null;
  }
}

// Create singleton instance
export const notificationIntegrationService = new NotificationIntegrationService();

export default notificationIntegrationService;
