import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { 
  bookingService, 
  transformBookingForUserDashboard,
  UserDashboardBooking
} from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';
import { useUserRealtimeEvents } from '../hooks/useRealtimeEvents';

// Import our new dashboard components
import {
  WelcomeSection,
  StatsGrid,
  BookingTabs,
  BookingList,
  DashboardSidebar
} from '../components/DashboardPage';

// Notification interface for sidebar
interface NotificationProps {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'requested' | 'past'>('requested');
  const [bookings, setBookings] = useState<UserDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time events hook
  const { 
    bookingUpdates, 
    isConnected: realtimeConnected,
    clearProcessedUpdates
  } = useUserRealtimeEvents();

  // Mock notifications - in real app, this would come from an API
  const [notifications] = useState<NotificationProps[]>([
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your bike rental at Colombo Fort has been confirmed',
      timestamp: '2 hours ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Payment Reminder',
      message: 'Payment due for your upcoming rental',
      timestamp: '1 day ago',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'New Location Available',
      message: 'Check out bikes available in Kandy',
      timestamp: '3 days ago',
      read: true,
      type: 'info'
    }
  ]);

  // Fetch user bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingService.getMyBookings();
        console.log('Fetched bookings:', response);
        
        // Transform backend bookings to user dashboard format
        const transformedBookings = response.map(transformBookingForUserDashboard);
        console.log('Transformed bookings:', transformedBookings);
        
        setBookings(transformedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setBookings([]);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle real-time booking updates
  useEffect(() => {
    if (bookingUpdates.length > 0) {
      console.log('Processing real-time booking updates:', bookingUpdates);
      
      // Refresh bookings when we get real-time updates
      const refreshBookings = async () => {
        try {
          const response = await bookingService.getMyBookings();
          const transformedBookings = response.map(transformBookingForUserDashboard);
          setBookings(transformedBookings);
          
          // Clear processed updates after refreshing
          clearProcessedUpdates();
        } catch (err) {
          console.error('Error refreshing bookings after real-time update:', err);
        }
      };

      refreshBookings();
    }
  }, [bookingUpdates, clearProcessedUpdates]);

  // Filter bookings by status for each tab
  const filterBookingsByTab = (tab: 'current' | 'requested' | 'past') => {
    switch (tab) {
      case 'current':
        return bookings.filter(booking => booking.status === 'confirmed' || booking.status === 'active');
      case 'requested':
        return bookings.filter(booking => booking.status === 'requested');
      case 'past':
        return bookings.filter(booking => booking.status === 'completed' || booking.status === 'cancelled');
      default:
        return [];
    }
  };

  // Calculate stats for the stats grid
  const calculateStats = () => {
    const totalBookings = bookings.length;
    const activeRentals = bookings.filter(b => b.status === 'confirmed' || b.status === 'active').length;
    const avgRating = bookings
      .filter(booking => booking.rating && booking.rating > 0)
      .reduce((sum, booking, _, arr) => sum + (booking.rating || 0) / arr.length, 0);
    const citiesVisited = new Set(bookings.map(booking => booking.location)).size;

    return {
      activeRentals,
      totalBookings,
      avgRating: avgRating > 0 ? avgRating : 0,
      citiesVisited
    };
  };

  // Calculate booking counts for tabs
  const bookingCounts = {
    current: filterBookingsByTab('current').length,
    requested: filterBookingsByTab('requested').length,
    past: filterBookingsByTab('past').length
  };

  const handleMarkAsRead = (notificationId: string) => {
    // In a real app, this would update the notification status via API
    console.log('Marking notification as read:', notificationId);
  };

  const handleRetryFetch = () => {
    // Retry fetching bookings
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingService.getMyBookings();
        const transformedBookings = response.map(transformBookingForUserDashboard);
        setBookings(transformedBookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setBookings([]);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  };

  const currentBookings = filterBookingsByTab(activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Connection Status */}
        {!realtimeConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              ⚠️ Real-time updates are not connected. You may not receive live booking updates.
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <WelcomeSection 
          userName={user?.firstName || 'User'} 
        />

        {/* Stats Grid */}
        <div className="mb-8">
          <StatsGrid 
            activeRentals={calculateStats().activeRentals}
            totalBookings={calculateStats().totalBookings}
            avgRating={calculateStats().avgRating}
            citiesVisited={calculateStats().citiesVisited}
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content - Bookings */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Rentals</h2>
              
              {/* Booking Tabs */}
              <BookingTabs 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={bookingCounts}
              />

              {/* Booking List */}
              <BookingList
                bookings={currentBookings}
                loading={loading}
                error={error}
                type={activeTab}
                onRetry={handleRetryFetch}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar 
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
