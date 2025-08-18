import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { 
  bookingService, 
  transformBookingForUserDashboard,
  UserDashboardBooking
} from '../services/bookingService';
import { 
  paymentService, 
  PaymentPendingBooking
} from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useUserRealtimeEvents } from '../hooks/useRealtimeEvents';

// Import our dashboard components
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'current' | 'requested' | 'past'>('requested');
  const [bookings, setBookings] = useState<UserDashboardBooking[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PaymentPendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time events hook
  const { 
    bookingUpdates, 
    isConnected: realtimeConnected,
    clearProcessedUpdates
  } = useUserRealtimeEvents();

  // Mock notifications - in real app, this would come from an API
  const [notifications, setNotifications] = useState<NotificationProps[]>([
    // {
    //   id: '1',
    //   title: 'Booking Confirmed',
    //   message: 'Your bike rental at Colombo Fort has been confirmed',
    //   timestamp: '2 hours ago',
    //   read: false,
    //   type: 'success'
    // },
    // {
    //   id: '2',
    //   title: 'Payment Reminder',
    //   message: 'Payment due for your upcoming rental',
    //   timestamp: '1 day ago',
    //   read: false,
    //   type: 'warning'
    // },
    // {
    //   id: '3',
    //   title: 'New Location Available',
    //   message: 'Check out bikes available in Kandy',
    //   timestamp: '3 days ago',
    //   read: true,
    //   type: 'info'
    // }
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

    const fetchPendingPayments = async () => {
      try {
        const payments = await paymentService.getPendingPayments();
        setPendingPayments(payments);
      } catch (err) {
        console.error('Error fetching pending payments:', err);
        // Don't show error for payments, just log it
      }
    };

    if (user) {
      fetchBookings();
      fetchPendingPayments();
    }
  }, [user]);

  // Handle real-time booking updates
  useEffect(() => {
    if (bookingUpdates.length > 0) {
      console.log('Processing real-time booking updates:', bookingUpdates);
      
      // Check for payment-relevant updates
      const paymentRelevantUpdates = bookingUpdates.filter(update => 
        update.type === 'BOOKING_UPDATED' || 
        update.type === 'BOOKING_ACCEPTED' || 
        update.type === 'BOOKING_REJECTED' || 
        update.type === 'PAYMENT_COMPLETED'
      );

      if (paymentRelevantUpdates.length > 0) {
        // Refresh both bookings and pending payments
        const refreshData = async () => {
          try {
            const [bookingResponse, paymentsResponse] = await Promise.all([
              bookingService.getMyBookings(),
              paymentService.getPendingPayments()
            ]);
            
            const transformedBookings = bookingResponse.map(transformBookingForUserDashboard);
            setBookings(transformedBookings);
            setPendingPayments(paymentsResponse);
            
            // Show notification for new payments due
            const newAcceptedBookings = paymentRelevantUpdates.filter(u => u.type === 'BOOKING_ACCEPTED');
            const newUpdatedBookings = paymentRelevantUpdates.filter(u => u.type === 'BOOKING_UPDATED');
            const newRejectedBookings = paymentRelevantUpdates.filter(u => u.type === 'BOOKING_REJECTED');
            const newPayments = paymentRelevantUpdates.filter(u => u.type === 'PAYMENT_COMPLETED');
            
            if (newAcceptedBookings.length > 0) {
              toast.success(`${newAcceptedBookings.length} booking(s) confirmed! Check payments.`);
              const firstBooking = newAcceptedBookings[0];
              const location = firstBooking?.data?.bookingData?.pickupLocation || 'your selected location';
              setNotifications(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  title: 'Booking Confirmed',
                  timestamp: new Date().toISOString(),
                  message: `Your bike rental at ${location} confirmed! Please proceed to the initial payment.`,
                  read: false,
                  type: 'success'
                }
              ]);
            }
            if (newUpdatedBookings.length > 0) {
              toast.success(`${newUpdatedBookings.length} booking(s) updated! Check payments.`);
              const firstBooking = newUpdatedBookings[0];
              const location = firstBooking?.data?.bookingData?.pickupLocation || 'your selected location';
              setNotifications(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  title: 'Booking Updated',
                  timestamp: new Date().toISOString(),
                  message: `Your bike rental at ${location} has been updated. Please check the details.`,
                  read: false,
                  type: 'info'
                }
              ]);
            }
            if (newRejectedBookings.length > 0) {
              toast.error(`${newRejectedBookings.length} booking(s) rejected.`);
              const firstBooking = newRejectedBookings[0];
              const location = firstBooking?.data?.bookingData?.pickupLocation || 'your selected location';
              setNotifications(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  title: 'Booking Rejected',
                  timestamp: new Date().toISOString(),
                  message: `Your bike rental at ${location} has been rejected due to unavailability of bikes ! Please contact support for assistance.`,
                  read: false,
                  type: 'warning'
                }
              ]);
            }
            if (newPayments.length > 0) {
              toast.success(`${newPayments.length} payment(s) completed!`);
              const firstPayment = newPayments[0];
              const location = firstPayment?.data?.bookingData?.pickupLocation || 'your selected location';
              setNotifications(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  title: 'Payment Completed',
                  timestamp: new Date().toISOString(),
                  message: `Your payment for the bike rental at ${location} has been completed successfully.`,
                  read: false,
                  type: 'success'
                }
              ]);
            }
            
          } catch (err) {
            console.error('Error refreshing data after real-time update:', err);
          }
        };
        
        refreshData();
      }
      
      // Clear processed updates
      clearProcessedUpdates();
    }
  }, [bookingUpdates, clearProcessedUpdates]);

  // Filter bookings by tab (excluding payments)
  const filterBookingsByTab = (tab: 'current' | 'requested' | 'past') => {
    return bookings.filter(booking => {
      switch (tab) {
        case 'current':
          return booking.status === 'active';
        case 'requested':
          return booking.status === 'requested';
        case 'past':
          return booking.status === 'completed' || booking.status === 'cancelled';
        default:
          return false;
      }
    });
  };

  // Calculate stats for the stats grid
  const calculateStats = () => {
    const activeRentals = bookings.filter(
      booking => booking.status === 'confirmed'
    ).length;
    const totalBookings = bookings.length;
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

  // Get current content based on active tab
  const getCurrentContent = () => {
    const currentBookings = filterBookingsByTab(activeTab);
    return (
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
    );
  };

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

        {/* Pending Payments Alert */}
        {pendingPayments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-blue-800">
                  <strong>Payment Required:</strong> You have {pendingPayments.length} booking(s) requiring payment.
                </div>
              </div>
              <button
                onClick={() => navigate('/payments')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                View Payments
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <WelcomeSection 
          userName={user?.firstName || 'User'} 
          pendingPaymentsCount={pendingPayments.length}
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
          {/* Main Content */}
          <div className="lg:col-span-3">
            {getCurrentContent()}
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
