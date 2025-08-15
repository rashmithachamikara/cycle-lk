import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Phone, Mail, DollarSign, Package, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  bookingService, 
  BackendBooking
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const CurrentRentalDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'complete' | 'cancel' | null>(null);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      try {
        setLoading(true);
        setError(null);
        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'partner') {
      fetchBookingDetails();
    }
  }, [bookingId, user]);

  // Handle marking rental as completed
  const handleComplete = async () => {
    if (!booking) return;
    
    try {
      setActionLoading('complete');
      await bookingService.updateBookingStatus(booking._id, 'completed');
      toast.success(`Rental ${booking.bookingNumber} marked as completed!`);
      navigate('/partner-dashboard/current-rentals');
    } catch (error) {
      console.error('Error completing rental:', error);
      toast.error('Failed to complete rental. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle cancelling rental
  const handleCancel = async () => {
    if (!booking) return;
    
    try {
      setActionLoading('cancel');
      await bookingService.updateBookingStatus(booking._id, 'cancelled');
      toast.success(`Rental ${booking.bookingNumber} has been cancelled.`);
      navigate('/partner-dashboard/current-rentals');
    } catch (error) {
      console.error('Error cancelling rental:', error);
      toast.error('Failed to cancel rental. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate rental status
  const getRentalStatus = () => {
    if (!booking) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    const now = new Date();
    const startDate = new Date(booking.dates.startDate);
    const endDate = new Date(booking.dates.endDate);
    
    if (now < startDate) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', color: 'green', text: 'Active' };
    } else {
      return { status: 'overdue', color: 'red', text: 'Overdue' };
    }
  };

  const rentalStatus = getRentalStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading rental details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error || 'Rental not found'}
            </div>
            <Link to="/partner-dashboard/current-rentals" className="text-red-600 hover:text-red-800 mt-2 inline-block">
              ← Back to Current Rentals
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <Link 
            to="/partner-dashboard/current-rentals" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Rentals
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Current Rental Details</h1>
              <p className="text-gray-600 mt-2">Manage this active rental</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`bg-${rentalStatus.color}-100 text-${rentalStatus.color}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                {rentalStatus.text}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Customer Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {booking.userId?.firstName} {booking.userId?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.userId?.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.userId?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bike Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Bike Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Bike Name</label>
                  <p className="text-lg font-semibold text-gray-900">{booking.bikeId?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type & Brand</label>
                  <p className="text-gray-900">{booking.bikeId?.type} - {booking.bikeId?.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Model</label>
                  <p className="text-gray-900">{booking.bikeId?.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.bikeId?.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Rental Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Rental Start</p>
                    <p className="text-sm text-gray-600">{new Date(booking.dates.startDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${rentalStatus.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Rental End</p>
                    <p className="text-sm text-gray-600">{new Date(booking.dates.endDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Pickup & Dropoff
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Pickup Location</label>
                  <p className="text-gray-900">{booking.locations.pickup}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Dropoff Location</label>
                  <p className="text-gray-900">{booking.locations.dropoff}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  disabled={actionLoading !== null}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {actionLoading === 'complete' ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionLoading === 'complete' ? 'Completing...' : 'Mark as Completed'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading !== null}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {actionLoading === 'cancel' ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Rental'}
                </button>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg text-green-600">${booking.pricing.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                {booking.paymentInfo?.method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{booking.paymentInfo.method}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Number</label>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.bookingNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Package Type</label>
                  <p className="text-gray-900">{booking.package.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900">
                    {Math.ceil((new Date(booking.dates.endDate).getTime() - new Date(booking.dates.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CurrentRentalDetailPage;
