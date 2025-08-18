import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeEventService, EventType, RealtimeEvent } from '../services/realtimeEventService';
import { useAuth } from '../contexts/AuthContext';

interface UseRealtimeEventsOptions {
  onBookingCreated?: (event: RealtimeEvent) => void;
  onBookingAccepted?: (event: RealtimeEvent) => void;
  onBookingRejected?: (event: RealtimeEvent) => void;
  onBookingCompleted?: (event: RealtimeEvent) => void;
  onBookingUpdated?: (event: RealtimeEvent) => void;
}

export const useRealtimeEvents = (options: UseRealtimeEventsOptions = {}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Use refs to store the latest callbacks without causing re-renders
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Handle incoming events - now stable with useCallback
  const handleEventsUpdate = useCallback((newEvents: RealtimeEvent[]) => {
    console.log(`[RealtimeEvents] Processing ${newEvents.length} events`);
    setEvents(newEvents);
    
    // Process new events through callbacks using the ref
    newEvents.forEach(event => {
      const currentOptions = optionsRef.current;
      switch (event.type) {
        case EventType.BOOKING_CREATED:
          currentOptions.onBookingCreated?.(event);
          break;
        case EventType.BOOKING_ACCEPTED:
          currentOptions.onBookingAccepted?.(event);
          break;
        case EventType.BOOKING_REJECTED:
          currentOptions.onBookingRejected?.(event);
          break;
        case EventType.BOOKING_COMPLETED:
          currentOptions.onBookingCompleted?.(event);
          break;
        case EventType.BOOKING_UPDATED:
          currentOptions.onBookingUpdated?.(event);
          break;
      }
    });
  }, []); // No dependencies - stable callback

  // Subscribe to real-time events
  useEffect(() => {
    let currentListenerId: string | null = null;

    if (user) {
      try {
        currentListenerId = realtimeEventService.subscribeToUserEvents(
          user.id,
          user.role as 'user' | 'partner' | 'admin',
          handleEventsUpdate
        );
        setIsConnected(true);
        console.log(`[RealtimeHook] Subscribed to events for ${user.role} ${user.id}`);
      } catch (error) {
        console.error('[RealtimeHook] Error subscribing to events:', error);
        setIsConnected(false);
      }
    }

    // Cleanup on unmount or user change
    return () => {
      if (currentListenerId) {
        realtimeEventService.unsubscribe(currentListenerId);
        setIsConnected(false);
        console.log('[RealtimeHook] Unsubscribed from events');
      }
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // handleEventsUpdate is intentionally excluded to prevent infinite loops
  // The callback is stable due to useCallback with no dependencies and useRef for options

  // Mark event as processed
  const markEventAsProcessed = useCallback(async (eventId: string) => {
    try {
      await realtimeEventService.markEventAsProcessed(eventId);
      // Remove from local events list
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('[RealtimeHook] Error marking event as processed:', error);
    }
  }, []);

  // Get unprocessed events count
  const unprocessedCount = events.length;

  return {
    events,
    isConnected,
    unprocessedCount,
    markEventAsProcessed
  };
};

// Hook specifically for partner dashboard
export const usePartnerRealtimeEvents = () => {
  const [newBookingRequests, setNewBookingRequests] = useState<RealtimeEvent[]>([]);

  const { events, isConnected, unprocessedCount, markEventAsProcessed } = useRealtimeEvents({
    onBookingCreated: (event) => {
      console.log('[PartnerRealtime] New booking request received:', event);
      setNewBookingRequests(prev => [event, ...prev]);
      
      // Show browser notification if supported
      // if ('Notification' in window && Notification.permission === 'granted') {
      //   new Notification('New Booking Request!', {
      //     body: `New booking request from ${event.data.bookingData?.data.customerName}`,
      //     icon: '/logo192.png'
      //   });
      // }
    },
    onBookingCompleted: (event) => {
      console.log('[PartnerRealtime] Booking completed:', event);
    }
  });

  const clearProcessedRequests = useCallback(() => {
    newBookingRequests.forEach(request => {
      if (request.id) {
        markEventAsProcessed(request.id);
      }
    });
    setNewBookingRequests([]);
  }, [newBookingRequests, markEventAsProcessed]);

  return {
    events,
    newBookingRequests,
    isConnected,
    unprocessedCount,
    clearProcessedRequests,
    markEventAsProcessed
  };
};

// Hook specifically for user dashboard
export const useUserRealtimeEvents = () => {
  const [bookingUpdates, setBookingUpdates] = useState<RealtimeEvent[]>([]);

  const { events, isConnected, unprocessedCount, markEventAsProcessed } = useRealtimeEvents({
    onBookingAccepted: (event) => {
      console.log('[UserRealtime] Booking accepted:', event);
      setBookingUpdates(prev => [event, ...prev]);
      
      // Don't show browser notification here - handled by NotificationIntegrationService
    },
    onBookingRejected: (event) => {
      console.log('[UserRealtime] Booking rejected:', event);
      setBookingUpdates(prev => [event, ...prev]);
      
      // Don't show browser notification here - handled by NotificationIntegrationService
    },
    onBookingCompleted: (event) => {
      console.log('[UserRealtime] Booking completed:', event);
      setBookingUpdates(prev => [event, ...prev]);
    }
  });

  const clearProcessedUpdates = useCallback(() => {
    bookingUpdates.forEach(update => {
      if (update.id) {
        markEventAsProcessed(update.id);
      }
    });
    setBookingUpdates([]);
  }, [bookingUpdates, markEventAsProcessed]);

  return {
    events,
    bookingUpdates,
    isConnected,
    unprocessedCount,
    clearProcessedUpdates,
    markEventAsProcessed
  };
};
