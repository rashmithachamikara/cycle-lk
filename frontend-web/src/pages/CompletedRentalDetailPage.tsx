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
  Star,
  ExternalLink,
  Download,
  TrendingUp,
  Award
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CompletedRental {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bikeName: string;
  bikeId: string;
  bikeImage?: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  totalAmount: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  rating?: number;
  review?: string;
  duration: number;
  pricePerDay: number;
  completedAt: string;
}

const CompletedRentalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rental, setRental] = useState<CompletedRental | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRentalDetails = useCallback(async (rentalId: string) => {
    try {
      setLoading(true);
      const bookingData = await bookingService.getBookingById(rentalId);
      
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
      const completedData: CompletedRental = {
        id: bookingData._id || bookingData.id || '',
        customerName: bookingData.userId ? `${bookingData.userId.firstName || ''} ${bookingData.userId.lastName || ''}`.trim() : 'Unknown Customer',
        customerEmail: bookingData.userId?.email || '',
        customerPhone: bookingData.userId?.phone || '',
        bikeName: bookingData.bikeId?.name || 'Unknown Bike',
        bikeId: bookingData.bikeId?._id || bookingData.bikeId?.id || '',
        bikeImage: bookingData.bikeId?.images?.[0] || '',
        startDate: bookingData.dates?.startDate || '',
        endDate: bookingData.dates?.endDate || '',
        actualStartDate: bookingData.dates?.actualStartDate || bookingData.dates?.startDate,
        actualEndDate: bookingData.dates?.actualEndDate || bookingData.dates?.endDate,
        totalAmount: bookingData.pricing?.total || 0,
        status: bookingData.status || 'completed',
        pickupLocation: bookingData.locations?.pickup || '',
        dropoffLocation: bookingData.locations?.dropoff || '',
        rating: bookingData.review?.rating || 0,
        review: bookingData.review?.comment || '',
        duration: bookingData.package?.id === 'day' ? 1 : bookingData.package?.id === 'week' ? 7 : 30,
        pricePerDay: bookingData.pricing?.basePrice || 0,
        completedAt: bookingData.updatedAt || bookingData.createdAt || ''
      };
      
      console.log('Transformed completed rental data:', completedData);
      setRental(completedData);
    } catch (error) {
      console.error('Error fetching rental details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load rental details';
      
      // Check if it's an authentication error
      if (errorMessage.includes('No token') || errorMessage.includes('authorization denied')) {
        toast.error('Please log in again to access this page');
        // Don't navigate immediately, let the auth context handle it
        return;
      }
      
      toast.error(errorMessage);
      navigate('/partner-dashboard/completed-rentals');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      fetchRentalDetails(id);
    }
  }, [id, fetchRentalDetails]);

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

  const calculateActualDuration = () => {
    if (!rental || !rental.actualStartDate || !rental.actualEndDate) {
      return rental?.duration || 0;
    }
    
    const start = new Date(rental.actualStartDate);
    const end = new Date(rental.actualEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getPerformanceMetrics = () => {
    if (!rental) return { onTime: false, durationMatch: false, rating: 0 };
    
    const scheduledEnd = new Date(rental.endDate);
    const actualEnd = new Date(rental.actualEndDate || rental.completedAt);
    const onTime = actualEnd <= scheduledEnd;
    
    const scheduledDuration = rental.duration;
    const actualDuration = calculateActualDuration();
    const durationMatch = actualDuration === scheduledDuration;
    
    return {
      onTime,
      durationMatch,
      rating: rental.rating || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96 mt-20">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Rental Not Found</h1>
            <Link
              to="/partner-dashboard/completed-rentals"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Completed Rentals
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const metrics = getPerformanceMetrics();
  const actualDuration = calculateActualDuration();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/partner-dashboard/completed-rentals"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Completed Rentals
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Completed Rental Details</h1>
          <p className="text-gray-600 mt-2">Review this completed rental and customer feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Performance Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${metrics.onTime ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.onTime ? '✓' : '✗'}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-1">On-Time Return</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.onTime ? 'Returned on schedule' : 'Late return'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < metrics.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-1">Customer Rating</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.rating > 0 ? `${metrics.rating}/5 stars` : 'No rating provided'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    LKR{rental.totalAmount}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-1">Revenue Earned</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {actualDuration} day{actualDuration !== 1 ? 's' : ''} rental
                  </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Rating</label>
                  <div className="flex items-center">
                    {rental.rating ? (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < rental.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({rental.rating}/5)</span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">No rating provided</span>
                    )}
                  </div>
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
              
              {/* Customer Review */}
              {rental.review && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Review</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 italic">"{rental.review}"</p>
                  </div>
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
                {rental.bikeImage && (
                  <img
                    src={rental.bikeImage}
                    alt={rental.bikeName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{rental.bikeName}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span>Bike ID: {rental.bikeId}</span>
                    <Link
                      to={`/bike/${rental.bikeId}`}
                      className="ml-4 text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Link>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Successfully Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Rental Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Rental Timeline
              </h2>
              <div className="space-y-4">
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
                  {rental.actualEndDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual End</label>
                      <div className="flex items-center text-gray-900">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        <span>{formatDateTime(rental.actualEndDate)}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Duration</label>
                    <div className="flex items-center text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{rental.duration} day{rental.duration !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Duration</label>
                    <div className="flex items-center text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span>{actualDuration} day{actualDuration !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                      <div className="flex items-center text-gray-900">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{rental.pickupLocation}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Location</label>
                      <div className="flex items-center text-gray-900">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{rental.dropoffLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Revenue Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate per day</span>
                  <span className="font-medium">LKR {rental.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual duration</span>
                  <span className="font-medium">{actualDuration} day{actualDuration !== 1 ? 's' : ''}</span>
                </div>
                {actualDuration !== rental.duration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Originally {rental.duration} day{rental.duration !== 1 ? 's' : ''}</span>
                    <span className={`${actualDuration > rental.duration ? 'text-green-600' : 'text-orange-600'}`}>
                      {actualDuration > rental.duration ? '+' : ''}{actualDuration - rental.duration} day{Math.abs(actualDuration - rental.duration) !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Revenue</span>
                    <span className="text-green-600">LKR {rental.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center font-medium">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-gray-400 flex items-center justify-center font-medium">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Completion Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Summary</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Completion Status:</span>
                  <br />
                  <span className="font-medium text-green-600">Successfully Completed</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Completed On:</span>
                  <br />
                  <span className="font-medium">{formatDate(rental.completedAt)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Performance:</span>
                  <br />
                  <span className={`font-medium ${
                    metrics.onTime && metrics.rating >= 4 ? 'text-green-600' : 
                    metrics.onTime || metrics.rating >= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.onTime && metrics.rating >= 4 ? 'Excellent' :
                     metrics.onTime || metrics.rating >= 3 ? 'Good' : 'Needs Improvement'}
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

export default CompletedRentalDetailPage;
