import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Phone, Mail, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  bookingService, 
  BackendBooking
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const BookingRequestDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'approve' | 'decline' | null>(null);

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

  // Handle booking approval
  const handleApprove = async () => {
    if (!booking) return;
    
    try {
      setActionLoading('approve');
      await bookingService.updateBookingStatus(booking._id, 'confirmed');
      toast.success(`Booking ${booking.bookingNumber} approved successfully!`);
      navigate('/partner-dashboard/booking-requests');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle booking decline
  const handleDecline = async () => {
    if (!booking) return;
    
    try {
      setActionLoading('decline');
      await bookingService.updateBookingStatus(booking._id, 'cancelled');
      toast.success(`Booking ${booking.bookingNumber} declined.`);
      navigate('/partner-dashboard/booking-requests');
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error('Failed to decline booking. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading booking details...</span>
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
              <strong>Error:</strong> {error || 'Booking not found'}
            </div>
            <Link to="/partner-dashboard/booking-requests" className="text-red-600 hover:text-red-800 mt-2 inline-block">
              ← Back to Booking Requests
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
            to="/partner-dashboard/booking-requests" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking Requests
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Request Details</h1>
              <p className="text-gray-600 mt-2">Review and manage this booking request</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Awaiting Approval
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
                  <label className="text-sm font-medium text-gray-600">Current Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.bikeId?.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Rental Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-gray-900">{new Date(booking.dates.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-gray-900">{new Date(booking.dates.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Pickup Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.locations.pickup}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Dropoff Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.locations.dropoff}
                  </p>
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

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {actionLoading === 'approve' ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve Request'}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading !== null}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {actionLoading === 'decline' ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  {actionLoading === 'decline' ? 'Declining...' : 'Decline Request'}
                </button>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Pricing Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">${booking.pricing.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-medium">${booking.pricing.insurance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Extras</span>
                  <span className="font-medium">${booking.pricing.extras}</span>
                </div>
                {booking.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-${booking.pricing.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">${booking.pricing.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Number</label>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.bookingNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Request Date</label>
                  <p className="text-gray-900">{new Date(booking.dates.bookingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    {booking.paymentStatus}
                  </span>
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

export default BookingRequestDetailPage;
