import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  BookingProgressCard,
  BookingFilter,
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
  const [searchParams] = useSearchParams();
  
  // Check if we should show past rentals
  const viewType = searchParams.get('view');
  const [showPastRentals, setShowPastRentals] = useState(viewType === 'past');
  
  // Filter state for bookings in main section
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled'>('all');
  
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
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

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

  // Filter for past rentals if needed
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

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

  // Filter bookings by status
  const filterBookingsByStatus = (filter: 'all' | 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled') => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => booking.status === filter);
  };

  // Calculate booking counts for filters
  const getBookingCounts = () => {
    const counts = {
      all: bookings.length,
      requested: bookings.filter(b => b.status === 'requested').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    return counts;
  };

  // Get current content based on view type
  const getCurrentContent = () => {
    const currentBookings = filterBookingsByStatus(selectedFilter);
    const displayBookings = showPastRentals ? pastBookings : currentBookings;
    const title = showPastRentals ? 'Past Rentals' : 'All Current Bookings';
    
    return (
      <div id="all-bookings-section" className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col gap-7 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {!showPastRentals && (
            <BookingFilter
              activeFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
              bookingCounts={getBookingCounts()}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowPastRentals(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showPastRentals
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Current Rentals
          </button>
          <button
            onClick={() => setShowPastRentals(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPastRentals
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Past Rentals ({pastBookings.length})
          </button>
        </div>

        {/* Booking Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={handleRetryFetch}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {showPastRentals ? 'No past rentals found' : 'No bookings found'}
            </div>
            {!showPastRentals && (
              <button
                onClick={() => navigate('/booking')}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Book Your First Bike
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map((booking: UserDashboardBooking) => (
              <BookingProgressCard
                key={booking.id}
                booking={booking}
              />
            ))}
          </div>
        )}
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

        {/* Most Recent Booking */}
        <div className="mb-8">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={handleRetryFetch}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                <div className="text-gray-500 mb-4">Start your cycling adventure today!</div>
                <button
                  onClick={() => navigate('/booking')}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Book Your First Bike
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Most Recent Booking</h3>
                <button
                  onClick={() => {
                    const element = document.getElementById('all-bookings-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  View All Bookings →
                </button>
              </div>
              <BookingProgressCard
                booking={bookings[0]}
              />
            </div>
          )}
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
