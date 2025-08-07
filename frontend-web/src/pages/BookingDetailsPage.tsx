import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Breadcrumb, BackButton } from '../ui';
import { Loader } from '../ui';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CreditCard, 
  Download, 
  Star, 
  MessageCircle,
  Navigation,
  QrCode,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { bookingService, UserDashboardBooking, transformBookingForUserDashboard } from '../services/bookingService';

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<UserDashboardBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // In a real app, you would have a getBookingById endpoint
        // For now, we'll get all bookings and find the specific one
        const allBookings = await bookingService.getMyBookings();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedBookings = allBookings.map((booking: any) => 
          transformBookingForUserDashboard(booking)
        );
        
        const foundBooking = transformedBookings.find((b: UserDashboardBooking) => b.id === id);
        
        if (!foundBooking) {
          setError('Booking not found');
          return;
        }
        
        setBooking(foundBooking);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, navigate]);

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: status === 'active' ? 'Active' : 'Confirmed'
        };
      case 'requested':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'Requested'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'Cancelled'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: status
        };
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader />
            <span className="ml-3 text-gray-600">Loading booking details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton to="/dashboard" text="Back to Dashboard" />
          <div className="text-center py-20">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Booking Details', href: `/booking-details/${booking.id}` }
          ]}
        />

        {/* Back Button */}
        <BackButton to="/dashboard" text="Back to Dashboard" />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{booking.bikeName}</h1>
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm">Booking #{booking.bookingNumber}</span>
                  </div>
                </div>
                <div className={`flex items-center px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
                  <StatusIcon className={`h-5 w-5 mr-2 ${statusConfig.color}`} />
                  <span className={`font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Pickup Location</div>
                      <div className="text-gray-600">{booking.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Rental Period</div>
                      <div className="text-gray-600">{booking.startDate} to {booking.endDate}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Partner</div>
                      <div className="text-gray-600">{booking.partner}</div>
                    </div>
                  </div>
                  
                  {booking.partnerPhone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Contact</div>
                        <a 
                          href={`tel:${booking.partnerPhone}`} 
                          className="text-emerald-600 hover:underline"
                        >
                          {booking.partnerPhone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {booking.value && (
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Total Cost</div>
                        <div className="text-gray-600 font-semibold">
                          {booking.value}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating and Review Section */}
            {booking.status === 'completed' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Experience</h3>
                
                {booking.rating && booking.rating > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">Your Rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < (booking.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {booking.rating}/5
                        </span>
                      </div>
                    </div>
                    
                    {booking.review && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Your Review:</span>
                        <p className="mt-2 text-gray-600 italic">"{booking.review}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Share your experience with this rental</p>
                    <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                      Leave a Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Actions & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {/* Status-specific actions */}
                {(booking.status === 'active' || booking.status === 'confirmed') && (
                  <>
                    <button className="w-full flex items-center justify-center bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors">
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code
                    </button>
                    <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </button>
                    {booking.partnerPhone && (
                      <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Partner
                      </button>
                    )}
                  </>
                )}
                
                {booking.status === 'requested' && (
                  <>
                    <button className="w-full flex items-center justify-center bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Download Voucher
                    </button>
                    <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                      Modify Booking
                    </button>
                  </>
                )}
                
                {(booking.status === 'completed' || booking.status === 'cancelled') && (
                  <>
                    <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </button>
                    {booking.status === 'completed' && (
                      <button 
                        onClick={() => navigate('/booking')}
                        className="w-full flex items-center justify-center bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Book Again
                      </button>
                    )}
                  </>
                )}
                
                <button className="w-full flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Booking Created</div>
                    <div className="text-sm text-gray-600">Request submitted successfully</div>
                    <div className="text-xs text-gray-400 mt-1">{booking.startDate}</div>
                  </div>
                </div>
                
                {booking.status !== 'requested' && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Booking Confirmed</div>
                      <div className="text-sm text-gray-600">Partner accepted your request</div>
                    </div>
                  </div>
                )}
                
                {booking.status === 'completed' && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Rental Completed</div>
                      <div className="text-sm text-gray-600">Bike returned successfully</div>
                      <div className="text-xs text-gray-400 mt-1">{booking.endDate}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{booking.bookingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{booking.startDate}</span>
                </div>
                {booking.value && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">{booking.value}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetailsPage;
