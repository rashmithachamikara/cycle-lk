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
  CheckSquare, 
  XSquare,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CurrentRental {
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
  actualStartDate?: string;
  duration: number;
  pricePerDay: number;
  isOverdue?: boolean;
}

const CurrentRentalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rental, setRental] = useState<CurrentRental | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRentalDetails = useCallback(async (rentalId: string) => {
    try {
      setLoading(true);
      const bookingData = await bookingService.getBookingById(rentalId);
    
      
      console.log('Raw booking data:', bookingData);
      
      // Transform the backend booking data to match our interface
      const rentalData: CurrentRental = {
        id: bookingData._id,
        customerName: bookingData.userId ? `${bookingData.userId.firstName} ${bookingData.userId.lastName}` : 'Unknown Customer',
        customerEmail: bookingData.userId?.email || '',
        customerPhone: bookingData.userId?.phone || '',
        bikeName: bookingData.bikeId?.name || 'Unknown Bike',
        bikeId: bookingData.bikeId?._id || '',
        bikeImage: bookingData.bikeId?.images?.[0] || '',
        startDate: bookingData.dates?.startDate || '',
        endDate: bookingData.dates?.endDate || '',
        actualStartDate: bookingData.dates?.actualStartDate || bookingData.dates?.startDate,
        totalAmount: bookingData.pricing?.total || 0,
        status: bookingData.status || 'active',
        pickupLocation: bookingData.locations?.pickup || '',
        dropoffLocation: bookingData.locations?.dropoff || '',
        duration: bookingData.package?.id === 'day' ? 1 : bookingData.package?.id === 'week' ? 7 : 30,
        pricePerDay: bookingData.pricing?.basePrice || 0
      };

      // Check if rental is overdue
      const currentDate = new Date();
      const endDate = new Date(rentalData.endDate);
      rentalData.isOverdue = currentDate > endDate;

      console.log('Transformed rental data:', rentalData);
      setRental(rentalData);
      
    } catch (error:any) { // Check if it's an authentication error
      if (error.message.includes('No token') || error.message.includes('authorization denied')) {
        toast.error('Please log in again to access this page');
        // Don't navigate immediately, let the auth context handle it
        return;
      }
      
      toast.error(error);
      navigate('/partner-dashboard/current-rentals');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      fetchRentalDetails(id);
    }
  }, [id, fetchRentalDetails]);

  const handleCompleteRental = async () => {
    if (!rental) return;
    
    setActionLoading('complete');
    try {
      await bookingService.updateBookingStatus(rental.id, 'completed');
      toast.success('Rental marked as completed successfully!');
      navigate('/partner-dashboard/current-rentals');
    } catch (error) {
      console.error('Error completing rental:', error);
      toast.error('Failed to complete rental');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRental = async () => {
    if (!rental) return;
    
    if (!confirm('Are you sure you want to cancel this rental? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading('cancel');
    try {
      await bookingService.updateBookingStatus(rental.id, 'cancelled');
      toast.success('Rental cancelled successfully');
      navigate('/partner-dashboard/current-rentals');
    } catch (error) {
      console.error('Error cancelling rental:', error);
      toast.error('Failed to cancel rental');
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

  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const getRemainingTime = () => {
    if (!rental) return '';
    
    const currentDate = new Date();
    const endDate = new Date(rental.endDate);
    const timeDiff = endDate.getTime() - currentDate.getTime();
    
    if (timeDiff <= 0) {
      return 'Overdue';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    }
  };

  const getRentalProgress = () => {
    if (!rental) return 0;
    
    const startDate = new Date(rental.actualStartDate || rental.startDate);
    const endDate = new Date(rental.endDate);
    const currentDate = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    return Math.round(progress);
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

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Rental Not Found</h1>
            <Link
              to="/partner-dashboard/current-rentals"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Current Rentals
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = getRentalProgress();
  const remainingTime = getRemainingTime();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/partner-dashboard/current-rentals"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Rentals
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Current Rental Details</h1>
          <p className="text-gray-600 mt-2">Monitor and manage this active rental</p>
        </div>

        {/* Overdue Alert */}
        {rental.isOverdue && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Rental Overdue</h3>
                <p className="text-red-700 text-sm mt-1">
                  This rental was supposed to end on {formatDateTime(rental.endDate)}. 
                  Please contact the customer immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rental Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Timeline</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      rental.isOverdue ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Started: {formatDate(rental.actualStartDate || rental.startDate)}</span>
                  <span className={rental.isOverdue ? 'text-red-600 font-medium' : ''}>
                    {remainingTime}
                  </span>
                  <span>Ends: {formatDate(rental.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{rental.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rental.isOverdue 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {rental.isOverdue ? 'Contact Required' : 'Active Rental'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <a 
                      href={`mailto:${rental.customerEmail}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {rental.customerEmail}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <a 
                      href={`tel:${rental.customerPhone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {rental.customerPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bike Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bike className="h-5 w-5 mr-2" />
                Bike Information
              </h2>
              <div className="flex items-start space-x-4">
                {rental.bikeImage && (
                  <img
                    src={rental.bikeImage}
                    alt={rental.bikeName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{rental.bikeName}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Bike ID: {rental.bikeId}</span>
                    <Link
                      to={`/bike/${rental.bikeId}`}
                      className="ml-4 text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Link>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rental.isOverdue 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      Currently Rented
                    </span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDateTime(rental.startDate)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled End</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDateTime(rental.endDate)}</span>
                  </div>
                </div>
                {rental.actualStartDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Start</label>
                    <div className="flex items-center text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span>{formatDateTime(rental.actualStartDate)}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <div className="flex items-center text-gray-900">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{rental.duration} day{rental.duration !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{rental.pickupLocation}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Location</label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{rental.dropoffLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Rental Value
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate per day</span>
                  <span className="font-medium">${rental.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{rental.duration} day{rental.duration !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Value</span>
                    <span className="text-green-600">${rental.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCompleteRental}
                  disabled={actionLoading === 'complete'}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {actionLoading === 'complete' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  )}
                  Mark as Completed
                </button>
                <button
                  onClick={handleCancelRental}
                  disabled={actionLoading === 'cancel'}
                  className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                >
                  {actionLoading === 'cancel' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <XSquare className="h-4 w-4 mr-2" />
                  )}
                  Cancel Rental
                </button>
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Summary</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Current Status:</span>
                  <br />
                  <span className={`font-medium ${
                    rental.isOverdue ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {rental.isOverdue ? 'Overdue - Action Required' : 'Active Rental'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Time Remaining:</span>
                  <br />
                  <span className={`font-medium ${
                    rental.isOverdue ? 'text-red-600' : progress > 80 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {remainingTime}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <br />
                  <span className="font-medium">{progress}% completed</span>
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
