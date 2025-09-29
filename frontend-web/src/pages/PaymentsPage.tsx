import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { 
  paymentService, 
  PaymentPendingBooking,
  InitialPaymentRequest
} from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { useUserRealtimeEvents } from '../hooks/useRealtimeEvents';
import PaymentsSection from '../components/DashboardPage/PaymentsSection';

const PaymentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState<PaymentPendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time events hook
  const { 
    bookingUpdates, 
    isConnected: realtimeConnected,
    clearProcessedUpdates
  } = useUserRealtimeEvents();

  // Fetch pending payments on component mount
  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const payments = await paymentService.getPendingPayments();
        console.log('Fetched pending payments:', payments);
        setPendingPayments(payments);
      } catch (err) {
        console.error('Error fetching pending payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pending payments');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPendingPayments();
    }
  }, [user]);

  // Handle payment processing
  const handlePayNow = async (bookingId: string) => {
    try {
      // Find the booking to get payment amount
      const booking = pendingPayments.find(b => b.id === bookingId);
      console.log('Found booking for payment:', booking);
      if (!booking) {
        toast.error('Booking not found');
        return;
      }

      // For demo purposes, we'll simulate a payment process
      // In a real app, this would integrate with a payment gateway
      const paymentRequest: InitialPaymentRequest = {
        bookingId,
        amount: booking.totalAmount,
        paymentMethod: 'card', // This would come from user selection
      };

      const response = await paymentService.processInitialPayment(paymentRequest);
      
      if (response.success) {
        if (response.sessionUrl) {
          // Redirect to Stripe checkout
          window.location.href = response.sessionUrl;
        } else {
          toast.success('Payment processed successfully!');
          
          // Remove from pending payments
          setPendingPayments(prev => prev.filter(p => p.id !== bookingId));
          
          // Show success message and option to go back to dashboard
          setTimeout(() => {
            toast.success('Redirecting to dashboard...', { duration: 2000 });
            navigate('/dashboard');
          }, 2000);
        }
      } else {
        toast.error(response.message || 'Payment failed. Please try again.');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Please try again.');
    }
  };

  // Handle real-time booking updates
  useEffect(() => {
    if (bookingUpdates.length > 0) {
      console.log('Processing real-time booking updates on payments page:', bookingUpdates);
      
      // Check for payment-relevant updates
      const paymentRelevantUpdates = bookingUpdates.filter(update => 
        update.type === 'BOOKING_UPDATED' || update.type === 'PAYMENT_COMPLETED'
      );

      if (paymentRelevantUpdates.length > 0) {
        // Refresh pending payments
        const refreshPayments = async () => {
          try {
            const paymentsResponse = await paymentService.getPendingPayments();
            setPendingPayments(paymentsResponse);
            
            // Show notification for new payments due
            const newAcceptedBookings = paymentRelevantUpdates.filter(u => u.type === 'BOOKING_UPDATED');
            if (newAcceptedBookings.length > 0) {
              toast.success(`${newAcceptedBookings.length} booking(s) updated! New payments available.`);
            }
            
          } catch (err) {
            console.error('Error refreshing payments after real-time update:', err);
          }
        };
        
        refreshPayments();
      }
      
      // Clear processed updates
      clearProcessedUpdates();
    }
  }, [bookingUpdates, clearProcessedUpdates]);

  const handleRetry = () => {
    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const payments = await paymentService.getPendingPayments();
        setPendingPayments(payments);
      } catch (err) {
        console.error('Error fetching pending payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pending payments');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPendingPayments();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Real-time Connection Status */}
        {!realtimeConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              ⚠️ Real-time updates are not connected. You may not receive live payment updates.
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Center</h1>
            <p className="text-gray-600">
              Manage your pending payments and complete transactions for your confirmed bookings.
            </p>
            
            {pendingPayments.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-blue-800">
                    <strong>Action Required:</strong> You have {pendingPayments.length} payment(s) pending for approved bookings.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={handleRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Payments Section */}
        <div className="mb-8">
          <PaymentsSection
            pendingPayments={pendingPayments}
            onPayNow={handlePayNow}
            loading={loading}
          />
        </div>

        {/* Additional Information */}
        {pendingPayments.length === 0 && !loading && !error && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Payments Complete</h3>
              <p className="text-gray-600 mb-6">
                You don't have any pending payments at the moment. When your bookings are approved by partners, 
                payment options will appear here.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Process</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-900">Booking Approved</p>
                  <p>Partner approves your booking request</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-900">Payment Required</p>
                  <p>Initial payment becomes due</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-gray-900">Complete Payment</p>
                  <p>Pay securely and activate your booking</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</div>
                <div>
                  <p className="font-medium text-gray-900">Booking Active</p>
                  <p>Your bike rental is confirmed and ready</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Secure Payments</p>
                <p>All payments are processed securely with industry-standard encryption</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Accepted Methods</p>
                <p>Credit/Debit Cards, Bank Transfer, Mobile Payments</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Instant Confirmation</p>
                <p>Payments are processed immediately and partners are notified in real-time</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Support</p>
                <p>Contact our support team if you encounter any payment issues</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentsPage;
