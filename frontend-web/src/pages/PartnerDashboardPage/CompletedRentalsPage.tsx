import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CompletedRentals from '../../components/PartnerDashboard/CompletedRentals';
import { 
  bookingService, 
  BackendBooking, 
  PartnerDashboardBooking, 
  transformBookingForPartnerDashboard 
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const CompletedRentalsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PartnerDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (user && user.role === 'partner') {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  // Filter bookings by status
  const recentBookings = bookings.filter(booking => booking.status === 'completed');

  // Calculate total revenue from completed bookings
  // const totalRevenue = recentBookings.reduce((sum, booking) => {
  //   const value = parseFloat(booking.value.replace('LKR', ''));
  //   return sum + value;
  // }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            to="/partner-dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Completed Rentals</h1>
          <p className="text-gray-600 mt-2">View your rental history and earnings</p>
        </div>

        {/* Revenue Summary */}
        {/* <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Total Revenue</h2>
              <p className="text-green-100">From {recentBookings.length} completed rentals</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">LKR {totalRevenue.toFixed(2)}</div>
              <div className="text-green-100">This month</div>
            </div>
          </div>
        </div> */}

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
            <span className="ml-3 text-gray-600">Loading completed rentals...</span>
          </div>
        )}

        {/* Completed Rentals Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Rental History ({recentBookings.length})
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <CompletedRentals bookings={recentBookings} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompletedRentalsPage;
