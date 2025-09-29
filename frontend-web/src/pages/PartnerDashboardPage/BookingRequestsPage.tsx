import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BookingRequests from '../../components/PartnerDashboard/BookingRequests';
import { 
  bookingService, 
  BackendBooking, 
  PartnerDashboardBooking, 
  transformBookingForPartnerDashboard 
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { usePartnerRealtimeEvents } from '../../hooks/useRealtimeEvents';
import { Partner } from '../../services/partnerService';
import { authService } from '../../services/authService';

const BookingRequestsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PartnerDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<Partner | null>(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  
  // Real-time events hook for partner
  const { 
    newBookingRequests, 
    isConnected: realtimeConnected,
    clearProcessedRequests 
  } = usePartnerRealtimeEvents();

  // Fetch bookings for the partner
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const backendBookings: BackendBooking[] = await bookingService.getMyBookings();
      const transformedBookings = backendBookings.map(transformBookingForPartnerDashboard);
      
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  
    useEffect(() => {
      const fetchPartnerDetails = async () => {
        try {
          setPartnerLoading(true);
          if (user) {
            const partnerDetails = await authService.getCurrentUserPartner();
            setPartnerDetails(partnerDetails);
            console.log('Fetched partner details:', partnerDetails);
          }
        } catch (error) {
          console.error('Error fetching partner details:', error);
          setPartnerDetails(null);
        } finally {
          setPartnerLoading(false);
        }
      };
  
      fetchPartnerDetails();
    }, [user]);

  useEffect(() => {
    if (user && user.role === 'partner') {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  // Handle real-time new booking requests
  useEffect(() => {
    if (newBookingRequests.length > 0) {
      console.log('Processing real-time booking requests:', newBookingRequests);
      
      // Refresh bookings when we get new requests
      const refreshBookings = async () => {
        try {
          const backendBookings: BackendBooking[] = await bookingService.getMyBookings();
          const transformedBookings = backendBookings.map(transformBookingForPartnerDashboard);
          setBookings(transformedBookings);
          
          // Clear processed requests after refreshing
          clearProcessedRequests();
        } catch (err) {
          console.error('Error refreshing bookings after real-time update:', err);
        }
      };

      refreshBookings();
    }
  }, [newBookingRequests, clearProcessedRequests]);

  // Filter bookings by status
  const requestedBookings = bookings.filter(booking => booking.status === 'requested');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Connection Status */}
        {!realtimeConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              ⚠️ Real-time updates are not connected. You may not receive live booking requests.
            </div>
          </div>
        )}

        {/* New Booking Request Alert */}
        {newBookingRequests.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="text-green-800 text-sm font-medium">
              🔔 {newBookingRequests.length} new booking request{newBookingRequests.length > 1 ? 's' : ''} received!
            </div>
          </div>
        )}

        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            to="/partner-dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-gray-600 mt-2">Review and manage incoming booking requests</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading booking requests...</span>
          </div>
        )}

        {/* Booking Requests Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Requests ({requestedBookings.length})
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <BookingRequests 
            partner={partnerDetails}
              bookings={requestedBookings} 
              onBookingUpdate={fetchBookings}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingRequestsPage;
