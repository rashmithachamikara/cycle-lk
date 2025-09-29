import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PaymentRequestCard from '../../components/PartnerDashboard/PaymentRequestCard';
import PaymentRequestCardSkeleton from '../../components/PartnerDashboard/PaymentRequestCardSkeleton';
import { 
  bookingService, 
  BackendBooking, 
  PartnerDashboardBooking, 
  transformBookingForPartnerDashboard 
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { usePartnerRealtimeEvents } from '../../hooks/useRealtimeEvents';

const PaymentRequestsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PartnerDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time events hook for partner
  const { 
    isConnected: realtimeConnected 
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
    if (user && user.role === 'partner') {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  // Filter bookings that are confirmed but payment is still pending
  const paymentPendingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && booking.paymentStatus === 'pending'
  );

  const formatCurrency = (amount: string) => {
    // Remove LKR if present and parse
    const numericAmount = parseFloat(amount.replace('LKR', '').replace(',', ''));
    return `LKR${numericAmount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Connection Status */}
        {!realtimeConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              ⚠️ Real-time updates are not connected. Payment status updates may be delayed.
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/partner-dashboard"
                className="inline-flex items-center text-yellow-100 hover:text-white mb-4 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold mb-2">Payment Requests</h1>
              <p className="text-yellow-100">
                Monitor bookings awaiting initial payments from customers
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{paymentPendingBookings.length}</div>
              <div className="text-yellow-100">Pending Payments</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            {[...Array(3)].map((_, index) => (
              <PaymentRequestCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Payment Requests Content */}
        {!loading && (
          <>
            {paymentPendingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">All Caught Up!</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  No customers are currently waiting to make initial payments. All confirmed bookings have been paid for.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/partner-dashboard"
                    className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    Return to Dashboard
                  </Link>
                  <Link
                    to="/partner-dashboard/booking-requests"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    View Booking Requests
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Summary</h3>
                      <p className="text-gray-600">Bookings awaiting customer payment</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(
                          paymentPendingBookings
                            .reduce((sum, booking) => sum + parseFloat(booking.value.replace('$', '')), 0)
                            .toString()
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Total pending amount</div>
                    </div>
                  </div>
                </div>

                {/* Payment Requests List */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Payment Requests</h3>
                    <p className="text-gray-600">
                      These bookings are confirmed and waiting for customer payments
                    </p>
                  </div>

                  {/* Payment Request Cards */}
                  {paymentPendingBookings.map((booking) => (
                    <PaymentRequestCard key={booking.id} booking={booking} />
                  ))}
                </div>

                {/* Information Card */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Process Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Customers receive payment notifications via email/SMS</li>
                        <li>• They can pay directly through the platform</li>
                        <li>• You'll be notified once payment is completed</li>
                        <li>• Booking status will automatically change to "Active"</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Payment Timeline</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Customers have 24 hours to complete payment</li>
                        <li>• Automatic reminders are sent at 12 and 2 hours remaining</li>
                        <li>• Bookings may be cancelled if payment isn't received</li>
                        <li>• You can contact customers directly if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PaymentRequestsPage;
