import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  Bike, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface BookingRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bikeName: string;
  bikeId: string;
  bikeImage?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  message?: string;
  submittedAt: string;
  duration: number;
  pricePerDay: number;
}

const BookingRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookingDetails = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      const bookingData = await bookingService.getBookingById(bookingId);
      
      console.log('API response from bookingService:', bookingData);
      
      // Check if data exists
      if (!bookingData) {
        throw new Error('No data received from server');
      }
      
      // Validate that bookingData has required properties
      if (typeof bookingData !== 'object') {
        throw new Error('Invalid booking data received');
      }
      
      console.log('Raw booking data:', bookingData);
      
      // Transform the backend booking data to match our interface
      const requestData: BookingRequest = {
        id: bookingData._id || bookingData.id || '',
        customerName: bookingData.userId ? `${bookingData.userId.firstName || ''} ${bookingData.userId.lastName || ''}`.trim() : 'Unknown Customer',
        customerEmail: bookingData.userId?.email || '',
        customerPhone: bookingData.userId?.phone || '',
        bikeName: bookingData.bikeId?.name || 'Unknown Bike',
        bikeId: bookingData.bikeId?._id || bookingData.bikeId?.id || '',
        bikeImage: bookingData.bikeId?.images?.[0] || '',
        startDate: bookingData.dates?.startDate || '',
        endDate: bookingData.dates?.endDate || '',
        totalAmount: bookingData.pricing?.total || 0,
        status: bookingData.status || 'requested',
        pickupLocation: bookingData.locations?.pickup || '',
        dropoffLocation: bookingData.locations?.dropoff || '',
        message: bookingData.note || '',
        submittedAt: bookingData.dates?.bookingDate || bookingData.createdAt || '',
        duration: bookingData.package?.id === 'day' ? 1 : bookingData.package?.id === 'week' ? 7 : 30,
        pricePerDay: bookingData.pricing?.basePrice || 0
      };
      
      console.log('Transformed booking data:', requestData);
      setBooking(requestData);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load booking details';
      
      // Check if it's an authentication error
      if (errorMessage.includes('No token') || errorMessage.includes('authorization denied')) {
        toast.error('Please log in again to access this page');
        // Don't navigate immediately, let the auth context handle it
        return;
      }
      
      toast.error(errorMessage);
      navigate('/partner-dashboard/booking-requests');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(id);
    }
  }, [id, fetchBookingDetails]);

  const handleApprove = async () => {
    if (!booking) return;
    
    setActionLoading('approve');
    try {
      await bookingService.updateBookingStatus(booking.id, 'approved');
      toast.success('Booking request approved successfully!');
      navigate('/partner-dashboard/booking-requests');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!booking) return;
    
    setActionLoading('decline');
    try {
      await bookingService.updateBookingStatus(booking.id, 'declined');
      toast.success('Booking request declined');
      navigate('/partner-dashboard/booking-requests');
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error('Failed to decline booking request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
            <Link
              to="/partner-dashboard/booking-requests"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
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
      
      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/partner-dashboard/booking-requests"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking Requests
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Booking Request Details</h1>
          <p className="text-gray-600 mt-2">Review and manage this booking request</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{booking.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-gray-900">{booking.customerEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <p className="text-gray-900">{booking.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : booking.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
              {booking.message && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.message}</p>
                </div>
              )}
            </div>

            {/* Bike Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bike className="h-5 w-5 mr-2" />
                Bike Information
              </h2>
              <div className="flex items-start space-x-4">
                {booking.bikeImage && (
                  <img
                    src={booking.bikeImage}
                    alt={booking.bikeName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{booking.bikeName}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Bike ID: {booking.bikeId}</span>
                    <Link
                      to={`/bike/${booking.bikeId}`}
                      className="ml-4 text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Rental Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(booking.startDate)} at {formatTime(booking.startDate)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(booking.endDate)} at {formatTime(booking.endDate)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{booking.duration} day{booking.duration !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(booking.submittedAt)}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{booking.pickupLocation}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{booking.dropoffLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate per day</span>
                  <span className="font-medium">${booking.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{booking.duration} day{booking.duration !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-green-600">${booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {booking.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading === 'approve'}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {actionLoading === 'approve' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Request
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={actionLoading === 'decline'}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {actionLoading === 'decline' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Decline Request
                  </button>
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Current Status:</span>
                  <br />
                  <span className={`font-medium ${
                    booking.status === 'pending' 
                      ? 'text-yellow-600'
                      : booking.status === 'approved'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {booking.status === 'pending' ? 'Awaiting your response' : 
                     booking.status === 'approved' ? 'Request approved' : 'Request declined'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <br />
                  <span className="font-medium">{formatDate(booking.submittedAt)}</span>
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
