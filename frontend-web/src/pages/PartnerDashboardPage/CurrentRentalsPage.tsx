import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CurrentRentals from '../../components/PartnerDashboard/CurrentRentals';
import { 
  bookingService, 
  BackendBooking, 
  PartnerDashboardBooking, 
  transformBookingForPartnerDashboard 
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const CurrentRentalsPage = () => {
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
  const currentBookings = bookings.filter(booking => booking.status === 'active' || booking.status === 'confirmed');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            to="/partner-dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Current Rentals</h1>
          <p className="text-gray-600 mt-2">Manage your active bicycle rentals</p>
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
            <span className="ml-3 text-gray-600">Loading current rentals...</span>
          </div>
        )}

        {/* Current Rentals Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Active Rentals ({currentBookings.length})
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <CurrentRentals rentals={currentBookings} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CurrentRentalsPage;
