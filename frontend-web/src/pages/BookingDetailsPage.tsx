import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Breadcrumb, BackButton } from '../ui';
import { Loader } from '../ui';
import { AlertTriangle } from 'lucide-react';
import { bookingService, UserDashboardBooking, transformBookingForUserDashboard } from '../services/bookingService';
import {
  BookingHeader,
  BikeImageGallery,
  BookingDetailsGrid,
  RatingAndReviewSection,
  QuickActions,
  BookingTimeline,
  AdditionalInfo
} from '../components/BookingDetailsPage';

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
        
        const booking = await bookingService.getBookingById(id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedBooking = transformBookingForUserDashboard(booking);

        if (!transformedBooking) {
          setError('Booking not found');
          return;
        }

        setBooking(transformedBooking);

      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, navigate]);

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
            {/* Booking Header with Image Gallery and Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <BookingHeader booking={booking} />
              <BikeImageGallery bikeImages={booking.bikeImages} bikeName={booking.bikeName} />
              <BookingDetailsGrid booking={booking} />
            </div>

            {/* Rating and Review Section */}
            <RatingAndReviewSection booking={booking} />
          </div>

          {/* Right Column - Actions & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <QuickActions booking={booking} />

            {/* Booking Timeline */}
            <BookingTimeline booking={booking} />

            {/* Additional Info */}
            <AdditionalInfo booking={booking} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetailsPage;
