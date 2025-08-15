import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, MapPin, Phone, Mail, DollarSign, Package, Star, CheckCircle, FileText } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  bookingService, 
  BackendBooking
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

const CompletedRentalDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BackendBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Calculate rental duration
  const getRentalDuration = () => {
    if (!booking) return 0;
    const start = new Date(booking.dates.startDate);
    const end = new Date(booking.dates.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

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
            <Link to="/partner-dashboard/completed-rentals" className="text-red-600 hover:text-red-800 mt-2 inline-block">
              ← Back to Completed Rentals
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
            to="/partner-dashboard/completed-rentals" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Completed Rentals
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Completed Rental Details</h1>
              <p className="text-gray-600 mt-2">View rental history and customer feedback</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
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
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900">{getRentalDuration()} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Package Type</label>
                  <p className="text-gray-900">{booking.package.name}</p>
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
              </div>
            </div>

            {/* Customer Review */}
            {booking.review && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Customer Review
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rating</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {renderStarRating(booking.review.rating || 0)}
                      </div>
                      <span className="text-gray-600">({booking.review.rating}/5)</span>
                    </div>
                  </div>
                  {booking.review.comment && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Comment</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 italic">"{booking.review.comment}"</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Review Date</label>
                    <p className="text-gray-900">{booking.review.date ? new Date(booking.review.date).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Revenue Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Revenue Summary
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
                    <span>Total Earned</span>
                    <span className="text-green-600">${booking.pricing.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Booking Summary
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Number</label>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.bookingNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Date</label>
                  <p className="text-gray-900">{new Date(booking.dates.bookingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                {booking.paymentInfo?.method && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-gray-900">{booking.paymentInfo.method}</p>
                  </div>
                )}
                {booking.paymentInfo?.transactionId && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                    <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded break-all">{booking.paymentInfo.transactionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Customer Rating</span>
                  <span className="font-bold">
                    {booking.review?.rating ? `${booking.review.rating}/5` : 'No rating'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-bold">{getRentalDuration()} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span className="font-bold">${booking.pricing.total}</span>
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

export default CompletedRentalDetailPage;
