import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Notifications from '../../components/PartnerDashboard/Notifications';
import UpcomingEvents from '../../components/PartnerDashboard/UpcomingEvents';
import MonthlySnapshot from '../../components/PartnerDashboard/MonthlySnapshot';
import { 
  Bike, 
  Star, 
  Users,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  ArrowRight,
  CreditCard,
  Rows4  
} from 'lucide-react';
import { Loader } from '../../ui';

import { 
  bookingService, 
  BackendBooking, 
  PartnerDashboardBooking, 
  transformBookingForPartnerDashboard 
} from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { usePartnerRealtimeEvents } from '../../hooks/useRealtimeEvents';
import notificationIntegrationService from '../../services/notificationIntegrationService';

const PartnerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PartnerDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time events hook for partner
  const { 
    newBookingRequests, 
    isConnected: realtimeConnected,
    clearProcessedRequests 
  } = usePartnerRealtimeEvents();

  // Fetch bookings for the partner
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the new endpoint that doesn't require partnerId in URL
      const backendBookings: BackendBooking[] = await bookingService.getMyBookings();
      console.log('Raw backend bookings:', backendBookings);
      const transformedBookings = backendBookings.map(transformBookingForPartnerDashboard);
      console.log('Transformed bookings:', transformedBookings);
      
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      // For now, use fallback data if the API fails
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'partner') {
      fetchBookings();
      
      // Initialize notification integration service
      notificationIntegrationService.initialize(user.id, 'partner')
        .then(() => {
          console.log('Partner notification integration initialized');
        })
        .catch((error) => {
          console.error('Failed to initialize partner notification integration:', error);
        });
    } else {
      // If not a partner, set to empty and stop loading
      setBookings([]);
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      notificationIntegrationService.cleanup();
    };
  }, [user]);

  // Handle real-time new booking requests
  useEffect(() => {
    if (newBookingRequests.length > 0) {
      console.log('Processing real-time booking requests:', newBookingRequests);
      
      // Refresh bookings when we get new requests
      const refreshBookings = async () => {
        try {
          const backendBookings: BackendBooking[] = await bookingService.getMyBookings();
          const transformedBookings = backendBookings.map(transformBookingForPartnerDashboard);
          setBookings(transformedBookings);
          
          // Clear processed requests after refreshing
          clearProcessedRequests();
        } catch (err) {
          console.error('Error refreshing bookings after real-time update:', err);
        }
      };

      refreshBookings();
    }
  }, [newBookingRequests, clearProcessedRequests]);

  // Filter bookings by status
  const requestedBookings = bookings.filter(booking => booking.status === 'requested');
  const currentBookings = bookings.filter(booking => booking.status === 'active');
  const recentBookings = bookings.filter(booking => booking.status === 'completed');
  const paymentRequests = bookings.filter(booking => booking.status === 'confirmed' && booking.paymentStatus === 'pending');

  // Calculate total revenue from completed bookings
  const totalRevenue = recentBookings.reduce((sum, booking) => {
    const value = parseFloat(booking.value.replace('$', ''));
    return sum + value;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Connection Status */}
        {!realtimeConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="text-yellow-800 text-sm">
              ⚠️ Real-time updates are not connected. You may not receive live booking requests.
            </div>
          </div>
        )}

        {/* New Booking Request Alert */}
        {newBookingRequests.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="text-green-800 text-sm font-medium">
              🔔 {newBookingRequests.length} new booking request{newBookingRequests.length > 1 ? 's' : ''} received!
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
              <p className="text-blue-100">Welcome back, Colombo Bikes!</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bike className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">15</div>
                    <div className="text-sm text-gray-600">Total Bikes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{currentBookings.length}</div>
                    <div className="text-sm text-gray-600">Active Rentals</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">4.7</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            

            {/* Management Overview Cards */}
            <div className="bg-white rounded-2xl shadow-sm">
              {/* <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Management Overview</h3>
                <p className="text-gray-600 mt-1">Quick access to your rental management</p>
              </div> */}

              <div className="p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  

                  {/* Booking Requests Button */}
                  <Link
                    to="/partner-dashboard/booking-requests"
                    className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl p-6 transition-all duration-200 border border-orange-200 hover:border-orange-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Requests</h4>
                    <p className="text-gray-600 text-sm mb-3">Review pending requests</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-orange-600">{requestedBookings.length}</span>
                      <span className="text-orange-600 text-sm ml-2">pending requests</span>
                    </div>
                    {newBookingRequests.length > 0 && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {newBookingRequests.length} new!
                      </div>
                    )}
                  </Link>

                  {/* Initial Payment Pending Requests Button */}
                  <Link
                    to="/partner-dashboard/paymentRequests"
                    className="group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl p-6 transition-all duration-200 border border-yellow-200 hover:border-yellow-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-yellow-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Requests</h4>
                    <p className="text-gray-600 text-sm mb-3">Review pending Initial payments</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-yellow-600">{paymentRequests.length}</span>
                      <span className="text-yellow-600 text-sm ml-2">pending payments</span>
                    </div>
                  </Link>

                  {/* Current Rentals Button */}
                  <Link
                    to="/partner-dashboard/current-rentals"
                    className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-6 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Current Rentals</h4>
                    <p className="text-gray-600 text-sm mb-3">Manage active bicycle rentals</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600">{currentBookings.length}</span>
                      <span className="text-blue-600 text-sm ml-2">active rentals</span>
                    </div>
                  </Link>

                  {/* Completed Rentals Button */}
                  <Link
                    to="/partner-dashboard/completed-rentals"
                    className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-6 transition-all duration-200 border border-green-200 hover:border-green-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Completed Rentals</h4>
                    <p className="text-gray-600 text-sm mb-3">View rental history & earnings</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600">{recentBookings.length}</span>
                      <span className="text-green-600 text-sm ml-2">completed</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12.5% from last month
                  </span>
                </div>
              </div>
              
              <div className="h-60 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-end justify-between p-4">
                {[35, 55, 40, 65, 45, 75, 60].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-md" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3> */}
              <div className="space-y-3">
                <Link
                  to="/partner-dashboard/add-bike"
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-center block"
                >
                  Add New Bike +
                
                </Link>
                <Link
                  to="/partner-dashboard/inventory"
                  className="w-full border border-green-500 text-black-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center flex items-center justify-center gap-2"
                >
                  <Rows4  className="h-4 w-4" /> Inventory
                </Link>
                <Link
                  to="/partner-dashboard/bike-locations"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-blue-500 transition-colors font-medium text-center block"
                >
                  My Bike Locations
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <Notifications />

            {/* Upcoming Events */}
            <UpcomingEvents />

            {/* Analytics Summary */}
            <MonthlySnapshot />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartnerDashboardPage;