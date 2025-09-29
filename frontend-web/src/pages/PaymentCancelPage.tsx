import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { bookingService } from '../services/bookingService';

interface BookingDetails {
  _id: string;
  bookingNumber?: string;
  bikeId?: {
    name: string;
    images?: string[];
  };
  partnerId?: {
    companyName: string;
  };
  dates: {
    startDate: string;
    endDate: string;
  };
  pricing: {
    total: number;
  };
  status: string;
  paymentStatus: string;
}

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const booking = await bookingService.getBookingById(bookingId);
        setBookingDetails(booking);
      } catch (err) {
        console.error('Error fetching booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleRetryPayment = () => {
    if (bookingId) {
      navigate(`/payments`);
    } else {
      navigate('/dashboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-lg text-gray-600">
            Your payment was cancelled and no charges were made to your account.
          </p>
        </div>

        {/* Booking Details Card (if available) */}
        {bookingDetails && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Booking Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      #{bookingDetails.bookingNumber || bookingDetails._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bike</p>
                    <p className="text-lg text-gray-900">{bookingDetails.bikeId?.name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Partner</p>
                    <p className="text-lg text-gray-900">{bookingDetails.partnerId?.companyName || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rental Period</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(bookingDetails.dates.startDate)} - {formatDate(bookingDetails.dates.endDate)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      LKR {(bookingDetails.pricing.total * 0.2).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Initial payment (20%)</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Payment Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRetryPayment}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry Payment
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* What Happened */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happened?</h3>
            <div className="space-y-3 text-gray-600">
              <p>Your payment was cancelled before completion. This can happen when:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You clicked the back button during payment</li>
                <li>You closed the payment window</li>
                <li>Your session expired during payment</li>
                <li>There was a network connectivity issue</li>
              </ul>
            </div>
          </div>

          {/* Your Booking */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Booking Status</h3>
            <div className="space-y-3 text-gray-600">
              <p>Your booking is still confirmed and waiting for payment:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your booking slot is still reserved</li>
                <li>No charges have been made</li>
                <li>You can retry payment anytime</li>
                <li>Payment is required to activate your booking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Important Notice</h3>
          <div className="text-amber-800">
            <p className="mb-3">
              <strong>Your booking is still active</strong> but requires payment to be completed.
            </p>
            <div className="space-y-2 text-sm">
              <p>• Complete payment within 24 hours to secure your booking</p>
              <p>• After 24 hours, unpaid bookings may be automatically cancelled</p>
              <p>• You can retry payment from your dashboard or payments page</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <HelpCircle className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <button
              onClick={() => navigate('/support')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-blue-600 font-medium mb-1">Contact Support</div>
              <div className="text-sm text-gray-600">Get help with payment issues</div>
            </button>
            
            <button
              onClick={() => navigate('/faq')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-blue-600 font-medium mb-1">FAQ</div>
              <div className="text-sm text-gray-600">Common payment questions</div>
            </button>
            
            <button
              onClick={() => window.open('mailto:support@cycle.lk', '_blank')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-blue-600 font-medium mb-1">Email Us</div>
              <div className="text-sm text-gray-600">support@cycle.lk</div>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelPage;
