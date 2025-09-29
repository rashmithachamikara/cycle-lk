import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Notifications from '../../components/PartnerDashboard/Notifications';
import UpcomingEvents from '../../components/PartnerDashboard/UpcomingEvents';
import MonthlySnapshot from '../../components/PartnerDashboard/MonthlySnapshot';
import { 
  Bike, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  ArrowRight,
  CreditCard,
  Rows4,  
  BarChart3
} from 'lucide-react';
import { Loader } from '../../ui';

import { 
  bookingService, 
  BackendBooking, 
  PartnerDashboardBooking, 
  transformBookingForPartnerDashboard 
} from '../../services/bookingService';
import { partnerService, Partner } from '../../services/partnerService';
import { useAuth } from '../../contexts/AuthContext';
import { usePartnerRealtimeEvents } from '../../hooks/useRealtimeEvents';
import notificationIntegrationService from '../../services/notificationIntegrationService';

const PartnerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<PartnerDashboardBooking[]>([]);
  const [dropOffBookings, setDropOffBookings] = useState<PartnerDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  
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

      const dropOffBookings = await bookingService.getDropoffBookings();
      setDropOffBookings(dropOffBookings);
      console.log('Drop-off bookings count:', dropOffBookings.length);

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
    console.log('[PartnerDashboard] User state changed:', {
      user: user ? {
        id: user.id,
        role: user.role,
        firstName: user.firstName,
        email: user.email
      } : null
    });
    
    if (user && user.role === 'partner') {
      console.log('[PartnerDashboard] Initializing for partner user:', user.id);
      fetchBookings();
      
      // Initialize notification integration service
      notificationIntegrationService.initialize(user.id, 'partner')
        .then(() => {
          console.log('[PartnerDashboard] Partner notification integration initialized successfully');
        })
        .catch((error) => {
          console.error('[PartnerDashboard] Failed to initialize partner notification integration:', error);
        });
    } else {
      console.log('[PartnerDashboard] User is not a partner or not logged in');
      // If not a partner, set to empty and stop loading
      setBookings([]);
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      console.log('[PartnerDashboard] Cleaning up notification integration');
      notificationIntegrationService.cleanup();
    };
  }, [user]);

  // Handle real-time new booking requests
  useEffect(() => {
    console.log('[PartnerDashboard] Real-time events state:', {
      newBookingRequestsCount: newBookingRequests.length,
      realtimeConnected,
      events: newBookingRequests.map(req => ({
        id: req.id,
        type: req.type,
        targetUserId: req.targetUserId,
        targetUserRole: req.targetUserRole
      }))
    });
    
    if (newBookingRequests.length > 0) {
      console.log('[PartnerDashboard] Processing real-time booking requests:', newBookingRequests);
      
      // Refresh bookings when we get new requests
      const refreshBookings = async () => {
        try {
          console.log('[PartnerDashboard] Refreshing bookings due to real-time events');
          const backendBookings: BackendBooking[] = await bookingService.getMyBookings();
          const transformedBookings = backendBookings.map(transformBookingForPartnerDashboard);
          setBookings(transformedBookings);
          
          // Clear processed requests after refreshing
          console.log('[PartnerDashboard] Clearing processed requests');
          clearProcessedRequests();
        } catch (err) {
          console.error('[PartnerDashboard] Error refreshing bookings after real-time update:', err);
        }
      };

      refreshBookings();
    }
  }, [newBookingRequests, clearProcessedRequests, realtimeConnected]);

  useEffect(() => {
    // Fetch partner profile for approval status
    const fetchPartnerProfile = async () => {
      try {
        setPartnerLoading(true);
        if (user && user.role === 'partner') {
          console.log('[PartnerDashboard] Fetching partner profile for user:', user.id);
          const partnerData = await partnerService.getPartnerByUserId(user.id);
          console.log('[PartnerDashboard] Partner profile loaded:', {
            partnerId: partnerData?.id,
            companyName: partnerData?.companyName,
            status: partnerData?.status,
            userId: partnerData?.userId
          });
          setPartner(partnerData);
        }
      } catch (error) {
        console.error('[PartnerDashboard] Error fetching partner profile:', error);
        setPartner(null);
      } finally {
        setPartnerLoading(false);
      }
    };
    fetchPartnerProfile();
  }, [user]);
  
  // Filter bookings by status
  const requestedBookings = bookings.filter(booking => booking.status === 'requested');
  const currentBookings = bookings.filter(booking => booking.status === 'active');
  const recentBookings = bookings.filter(booking => booking.status === 'completed');
  const paymentRequests = bookings.filter(booking => booking.status === 'confirmed' && booking.paymentStatus === 'pending');

  // Calculate total revenue from completed bookings (for future use)
  // const totalRevenue = recentBookings.reduce((sum, booking) => {
  //   const value = parseFloat(booking.value.replace('LKR', ''));
  //   return sum + value;
  // }, 0);

  // Approval status check
  if (partnerLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (partner && partner.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-xl mx-auto mt-20 px-4 py-24 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
            <Clock className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Approval</h2>
            <p className="text-gray-700 mb-4">
              Your partner account is currently <span className="font-semibold">{partner.status}</span>.<br />
              You will be notified once your application is approved.
            </p>
            <p className="text-gray-500 text-sm">
              If you have questions, please contact support.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2"> Dashboard</h1>
              <p className="text-black-100">
                Welcome back, {partner?.companyName || user?.firstName || 'Partner'}!
              </p>
            </div>
            {/* <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bike className="h-8 w-8 text-white" />
            </div> */}

            {/* Action Buttons at the right end of welcome section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/partner-dashboard/drop-off-bike"
              className="relative bg-white bg-opacity-20 text-white py-3 px-6 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors font-medium text-center"
            >
              Drop Off a Bike
              {dropOffBookings.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {dropOffBookings.length}
                </span>
              )}
            </Link>
            <Link
              to="/partner-dashboard/add-bike"
              className="bg-white bg-opacity-20 text-white py-3 px-6 rounded-lg hover:bg-white hover:bg-opacity-30 transition-colors font-medium text-center"
            >
              + Add New Bike
            </Link>
          </div>
          </div>
          
          
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">LKR 12,450</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            

            {/* Management Overview Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Management Overview</h3>
                <p className="text-gray-500 text-sm">Streamlined access to your rental operations</p>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Booking Requests Button */}
                  <Link
                    to="/partner-dashboard/booking-requests"
                    className="group bg-white hover:bg-gray-50 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-orange-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors shadow-sm">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Requests</h4>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">Review pending requests</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{requestedBookings.length}</span>
                      <span className="text-gray-500 text-sm">pending</span>
                    </div>
                    {newBookingRequests.length > 0 && (
                      <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        {newBookingRequests.length} new
                      </div>
                    )}
                  </Link>

                  {/* Initial Payment Pending Requests Button */}
                  <Link
                    to="/partner-dashboard/paymentRequests"
                    className="group bg-white hover:bg-gray-50 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-yellow-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 transition-colors shadow-sm">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Requests</h4>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">Review pending payments</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{paymentRequests.length}</span>
                      <span className="text-gray-500 text-sm">pending</span>
                    </div>
                  </Link>

                  {/* Current Rentals Button */}
                  <Link
                    to="/partner-dashboard/current-rentals"
                    className="group bg-white hover:bg-gray-50 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Current Rentals</h4>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">Active bicycle rentals</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{currentBookings.length}</span>
                      <span className="text-gray-500 text-sm">active</span>
                    </div>
                  </Link>

                  {/* Completed Rentals Button */}
                  <Link
                    to="/partner-dashboard/completed-rentals"
                    className="group bg-white hover:bg-gray-50 rounded-2xl p-6 transition-all duration-300 border border-gray-200 hover:border-green-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-sm">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Completed Rentals</h4>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">Rental history & earnings</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{recentBookings.length}</span>
                      <span className="text-gray-500 text-sm">completed</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 mt-8">
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
            {/* <UpcomingEvents /> */}

            {/* Analytics Summary */}
            {/* <MonthlySnapshot /> */}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartnerDashboardPage;