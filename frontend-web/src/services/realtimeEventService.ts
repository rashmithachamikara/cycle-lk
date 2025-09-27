import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  getDocs
} from 'firebase/firestore';

// Event types for the system
export enum EventType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CREATED_FOR_OWNER = 'BOOKING_CREATED_FOR_OWNER',
  NEW_DROPOFF = 'NEW_DROPOFF',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_ACCEPTED = 'BOOKING_ACCEPTED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  BIKE_AVAILABILITY_CHANGED = 'BIKE_AVAILABILITY_CHANGED'
}

type bookingData = {
  id: string;
  bikeName: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'active' | 'completed' | 'cancelled' | 'confirmed';
  partnerName: string;
  startDate: Timestamp;
  endDate: Timestamp;
  total: number;
};

// Real-time event interface
export interface RealtimeEvent {
  id?: string;
  type: EventType;
  targetUserId: string; // User who should receive this event
  targetUserRole: 'user' | 'partner' | 'admin';
  data: {
    bookingId?: string;
    bikeId?: string;
    partnerId?: string;
    userId?: string;
    bookingData?: bookingData;
    bikeData?: Record<string, unknown>;
    paymentData?: Record<string, unknown>;
    previousStatus?: string;
    newStatus?: string;
    [key: string]: unknown;
  };
  timestamp: Timestamp;
  processed: boolean;
  metadata?: {
    sourceUserId?: string;
    sourceUserRole?: string;
    deviceInfo?: string;
  };
}

class RealtimeEventService {
  private listeners: Map<string, () => void> = new Map();
  private eventCallbacks: Map<EventType, ((event: RealtimeEvent) => void)[]> = new Map();

  // Subscribe to real-time events for a specific user
  subscribeToUserEvents(
    userId: string, 
    userRole: 'user' | 'partner' | 'admin',
    callback: (events: RealtimeEvent[]) => void
  ): string {
    const listenerId = `${userId}_${userRole}_${Date.now()}`;
    
    console.log(`[RealtimeEvents] Setting up subscription for userId: ${userId}, role: ${userRole}`);
    
    // Create query for user-specific events
    const eventsQuery = query(
      collection(db, 'realtimeEvents'),
      where('targetUserId', '==', userId),
      where('targetUserRole', '==', userRole),
      where('processed', '==', false),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(eventsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const events: RealtimeEvent[] = [];
      
      console.log(`[RealtimeEvents] Firestore snapshot received. Size: ${snapshot.size}, Empty: ${snapshot.empty}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[RealtimeEvents] Event document:`, { id: doc.id, ...data });
        events.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp
        } as RealtimeEvent);
      });

      console.log(`[RealtimeEvents] Received ${events.length} events for user ${userId} (role: ${userRole})`);
      callback(events);

      // Process events through registered callbacks
      events.forEach(event => {
        this.processEvent(event);
      });
    }, (error) => {
      console.error(`[RealtimeEvents] Snapshot error for user ${userId}:`, error);
    });

    // Store the unsubscribe function
    this.listeners.set(listenerId, unsubscribe);
    
    return listenerId;
  }

  // Unsubscribe from events
  unsubscribe(listenerId: string) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      console.log(`[RealtimeEvents] Unsubscribed listener: ${listenerId}`);
    }
  }

  // Register callback for specific event types
  onEvent(eventType: EventType, callback: (event: RealtimeEvent) => void) {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  // Remove event callback
  offEvent(eventType: EventType, callback: (event: RealtimeEvent) => void) {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Process individual event through callbacks
  private processEvent(event: RealtimeEvent) {
    const callbacks = this.eventCallbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[RealtimeEvents] Error processing event ${event.type}:`, error);
        }
      });
    }
  }

  // Mark event as processed
  async markEventAsProcessed(eventId: string) {
    try {
      await updateDoc(doc(db, 'realtimeEvents', eventId), {
        processed: true,
        processedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('[RealtimeEvents] Error marking event as processed:', error);
    }
  }

  // Send event to backend to create real-time event
  async sendEvent(event: Omit<RealtimeEvent, 'id' | 'timestamp' | 'processed'>) {
    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error('Failed to send real-time event');
      }

      console.log('[RealtimeEvents] Event sent successfully:', event.type);
    } catch (error) {
      console.error('[RealtimeEvents] Error sending event:', error);
    }
  }

  // Clean up old processed events (call periodically)
  async cleanupOldEvents(olderThanDays: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const oldEventsQuery = query(
        collection(db, 'realtimeEvents'),
        where('processed', '==', true),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );

      const snapshot = await getDocs(oldEventsQuery);
      const deletePromises = snapshot.docs.map((docSnapshot) => deleteDoc(docSnapshot.ref));
      
      await Promise.all(deletePromises);
      console.log(`[RealtimeEvents] Cleaned up ${snapshot.docs.length} old events`);
    } catch (error) {
      console.error('[RealtimeEvents] Error cleaning up old events:', error);
    }
  }

  // Disconnect all listeners
  disconnectAll() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    this.eventCallbacks.clear();
    console.log('[RealtimeEvents] All listeners disconnected');
  }
}

// Create singleton instance
export const realtimeEventService = new RealtimeEventService();

// Helper functions for specific events
export const createBookingEvent = (
  targetUserId: string,
  targetUserRole: 'user' | 'partner',
  eventType: EventType,
  bookingData: bookingData,
  metadata?: Record<string, unknown>
) => {
  return realtimeEventService.sendEvent({
    type: eventType,
    targetUserId,
    targetUserRole,
    data: {
      bookingId: bookingData.id,
      bookingData,
      ...metadata
    },
    metadata
  });
};

export default realtimeEventService;
