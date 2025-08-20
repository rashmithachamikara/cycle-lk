import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, BackendBooking } from '../../services/bookingService';

interface UpcomingEvent {
  id: string;
  type: 'pickup' | 'dropoff' | 'maintenance';
  title: string;
  description: string;
  datetime: string;
  location: string;
  customerName?: string;
  bikeName?: string;
  priority: 'high' | 'medium' | 'low';
}

const UpcomingEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate upcoming events from bookings
  const generateUpcomingEvents = useCallback((bookings: BackendBooking[]) => {
    const now = new Date();
    const upcomingEvents: UpcomingEvent[] = [];

    bookings.forEach((booking) => {
      const startDate = new Date(booking.dates?.startDate);
      const endDate = new Date(booking.dates?.endDate);

      // Only consider confirmed and active bookings for upcoming events
      if (booking.status === 'confirmed' || booking.status === 'active') {
        // Add pickup event (if start date is in the future)
        if (startDate > now && booking.status === 'confirmed') {
          upcomingEvents.push({
            id: `${booking._id}-pickup`,
            type: 'pickup',
            title: 'Bike Pickup',
            description: `Customer pickup for ${booking.bikeId?.name || 'bike rental'}`,
            datetime: booking.dates.startDate,
            location: booking.locations?.pickup || 'Location TBD',
            customerName: `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim() || 'Customer',
            bikeName: booking.bikeId?.name || 'Unknown Bike',
            priority: 'high'
          });
        }

        // Add dropoff event (if end date is in the future)
        if (endDate > now) {
          upcomingEvents.push({
            id: `${booking._id}-dropoff`,
            type: 'dropoff',
            title: 'Bike Return',
            description: `Customer return for ${booking.bikeId?.name || 'bike rental'}`,
            datetime: booking.dates.endDate,
            location: booking.locations?.dropoff || booking.locations?.pickup || 'Location TBD',
            customerName: `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim() || 'Customer',
            bikeName: booking.bikeId?.name || 'Unknown Bike',
            priority: 'medium'
          });
        }
      }
    });

    // Sort by datetime (earliest first)
    upcomingEvents.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

    // Return only next 5 events
    return upcomingEvents.slice(0, 5);
  }, []);

  // Fetch bookings and generate events
  const fetchUpcomingEvents = useCallback(async () => {
    if (!user || user.role !== 'partner') return;

    try {
      setLoading(true);
      const backendBookings: BackendBooking[] = await bookingService.getMyBookings();
      const events = generateUpcomingEvents(backendBookings);
      setEvents(events);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, generateUpcomingEvents]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  // Format datetime for display
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'Overdue';
    if (diffHours < 24) return `In ${diffHours}h`;
    if (diffDays < 7) return `In ${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Get event icon and color
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pickup': return <User className="h-4 w-4" />;
      case 'dropoff': return <MapPin className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    if (priority === 'medium') return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No upcoming events</p>
            <p className="text-xs text-gray-400 mt-1">Events will appear when you have confirmed bookings</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getEventColor(event.priority)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDateTime(event.datetime)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-1">
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {event.customerName && (
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {event.customerName}
                      </span>
                    )}
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
