import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Calendar, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { bookingService } from '../services/bookingService';
import { toast } from 'react-hot-toast';

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
  locations: {
    pickup: string;
    dropoff: string;
  };
  pricing: {
    total: number;
  };
  status: string;
  paymentStatus: string;
}

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        const booking = await bookingService.getBookingById(bookingId);
        setBookingDetails(booking);
        
        // Show success message
        toast.success('Payment completed successfully!');
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleDownloadInvoice = () => {
    // Placeholder for invoice download functionality
    toast.success('Invoice download will be available soon!');
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <h2 className="text-xl font-semibold">Error</h2>
              <p>{error}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your booking has been confirmed and payment processed successfully.
          </p>
          {sessionId && (
            <p className="text-sm text-gray-500 mt-2">
              Transaction ID: {sessionId}
            </p>
          )}
        </div>

        {/* Booking Details Card */}
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
                    <p className="text-lg text-gray-900">{bookingDetails.bikeId?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Partner</p>
                    <p className="text-lg text-gray-900">{bookingDetails.partnerId?.companyName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {bookingDetails.status}
                    </span>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Rental Period</p>
                      <p className="text-sm">
                        {formatDate(bookingDetails.dates.startDate)} - {formatDate(bookingDetails.dates.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Pickup Location</p>
                      <p className="text-sm">{bookingDetails.locations.pickup}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      LKR {bookingDetails.pricing?.total ? (bookingDetails.pricing.total * 0.2).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-gray-500">Initial payment (20%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          <button
            onClick={handleDownloadInvoice}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Invoice
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <div className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm">You'll receive a confirmation email with your booking details and QR code.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
              <div>
                <p className="font-medium">Partner Contact</p>
                <p className="text-sm">The bike partner will contact you to arrange pickup details.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
              <div>
                <p className="font-medium">Pickup Day</p>
                <p className="text-sm">Present your QR code and complete the remaining payment to collect your bike.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Need help? Our support team is here to assist you.
          </p>
          <button
            onClick={() => navigate('/support')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact Support
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
