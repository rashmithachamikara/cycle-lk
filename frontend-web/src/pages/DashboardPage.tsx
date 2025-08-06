import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Calendar, 
  MapPin, 
  Bike, 
  Clock, 
  Star, 
  Download,
  QrCode,
  Navigation,
  Phone,
  MessageCircle,
  AlertCircle,
  Plus,
  Settings,
  CreditCard,
  Bell,
  Loader
} from 'lucide-react';

import { 
  bookingService, 
  BackendBooking,
  transformBookingForUserDashboard,
  UserDashboardBooking
} from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('current');
  const [bookings, setBookings] = useState<UserDashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingService.getMyBookings();
        console.log('Fetched bookings:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
        console.log('Response length:', response?.length);
        
        // Transform backend bookings to user dashboard format
        // The API returns bookings directly as an array in response
        const bookingsArray = Array.isArray(response) ? response : [];
        console.log('Bookings array:', bookingsArray);
        console.log('First booking:', bookingsArray[0]);
        
        const transformedBookings = bookingsArray.map((booking: BackendBooking) => {
          console.log('Transforming booking:', booking);
          const transformed = transformBookingForUserDashboard(booking);
          console.log('Transformed result:', transformed);
          return transformed;
        });
        console.log('All transformed bookings:', transformedBookings);
        
        setBookings(transformedBookings);
      } catch (err: unknown) {
        console.error('Error fetching bookings:', err);
        
        // Handle 404 as empty bookings (user has no bookings yet)
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setBookings([]);
        } else {
          setError('Failed to load bookings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Function to refresh bookings
  const refreshBookings = async () => {
    if (user) {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingService.getMyBookings();
        const bookingsArray = Array.isArray(response) ? response : [];
        const transformedBookings = bookingsArray.map((booking: BackendBooking) => 
          transformBookingForUserDashboard(booking)
        );
        setBookings(transformedBookings);
      } catch (err: unknown) {
        console.error('Error refreshing bookings:', err);
        
        // Handle 404 as empty bookings (user has no bookings yet)
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          setBookings([]);
        } else {
          setError('Failed to refresh bookings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Separate bookings by status
  const currentBookings = bookings.filter(booking => booking.status === 'active');
  const requestedBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'requested'
  );
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  // Calculate stats from real data
  const totalBookings = bookings.length;
  const activeRentals = currentBookings.length;
  const avgRating = bookings
    .filter(booking => booking.rating && booking.rating > 0)
    .reduce((sum, booking, _, arr) => sum + (booking.rating || 0) / arr.length, 0);
  const citiesVisited = new Set(bookings.map(booking => booking.pickupLocation)).size;

  const notifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Pickup Reminder',
      message: 'Your bike pickup is scheduled for tomorrow at Colombo Central',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'offer',
      title: 'Special Offer',
      message: '20% off your next mountain bike rental in Ella',
      time: '1 day ago',
      read: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-emerald-100">Ready for your next cycling adventure in Sri Lanka?</p>
            </div>
            <div className="hidden md:block">
              <Link
                to="/booking"
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Booking
              </Link>
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
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Bike className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{activeRentals}</div>
                    <div className="text-sm text-gray-600">Active Rental{activeRentals !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{totalBookings}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{citiesVisited}</div>
                    <div className="text-sm text-gray-600">Cities Visited</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Tabs */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'current', label: 'Current Rentals', count: currentBookings.length },
                    { id: 'requested', label: 'Requested Rentals', count: requestedBookings.length },
                    { id: 'past', label: 'Past Rentals', count: pastBookings.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-emerald-600" />
                    <span className="ml-2 text-gray-600">Loading your bookings...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                    <span className="text-red-600 mb-4">{error}</span>
                    <button
                      onClick={refreshBookings}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Current Rentals */}
                    {activeTab === 'current' && (
                      <div className="space-y-6">
                        {currentBookings.length === 0 ? (
                          <div className="text-center py-12">
                            <Bike className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No active rentals</h3>
                            <p className="text-gray-600 mb-4">You don't have any active bike rentals at the moment.</p>
                            <Link
                              to="/booking"
                              className="inline-flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Book a Bike
                            </Link>
                          </div>
                        ) : (
                          currentBookings.map((booking) => (
                            <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                  <span className="text-lg font-semibold text-gray-900">Active Rental</span>
                                </div>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                  In Progress
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName}</h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      <span>{booking.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      <span>{booking.startDate} to {booking.endDate}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-3">
                                    <button className="flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                                      <QrCode className="h-4 w-4 mr-2" />
                                      Show QR Code
                                    </button>
                                    <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors">
                                      <Navigation className="h-4 w-4 mr-2" />
                                      Get Directions
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Partner Contact</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center">
                                      <span className="text-gray-600 w-20">Partner:</span>
                                      <span className="font-medium">{booking.partner}</span>
                                    </div>
                                    {booking.partnerPhone && (
                                      <div className="flex items-center">
                                        <span className="text-gray-600 w-20">Phone:</span>
                                        <a href={`tel:${booking.partnerPhone}`} className="text-emerald-600 hover:underline">
                                          {booking.partnerPhone}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex space-x-2 mt-4">
                                    {booking.partnerPhone && (
                                      <button className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                        <Phone className="h-4 w-4 mr-1" />
                                        Call
                                      </button>
                                    )}
                                    <button className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                      <MessageCircle className="h-4 w-4 mr-1" />
                                      Chat
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Requested Bookings */}
                    {activeTab === 'requested' && (
                      <div className="space-y-6">
                        {requestedBookings.length === 0 ? (
                          <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requested bookings</h3>
                            <p className="text-gray-600 mb-4">You don't have any requested bike rentals.</p>
                            <Link
                              to="/booking"
                              className="inline-flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Book a Bike
                            </Link>
                          </div>
                        ) : (
                          requestedBookings.map((booking) => (
                            <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                  <span className="text-lg font-semibold text-gray-900">Requested Rental</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  booking.status === 'confirmed' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {booking.status === 'confirmed' ? 'Confirmed' : 'Requested'}
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName}</h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      <span>{booking.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      <span>{booking.startDate} to {booking.endDate}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex space-x-3">
                                    <button className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Voucher
                                    </button>
                                    <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors">
                                      <Settings className="h-4 w-4 mr-2" />
                                      Modify
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Pickup Instructions</h4>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <p>• Arrive 15 minutes before pickup time</p>
                                    <p>• Bring valid ID and booking confirmation</p>
                                    <p>• Contact partner if you're running late</p>
                                  </div>
                                  <div className="mt-4">
                                    <span className="text-gray-600">Partner: </span>
                                    <span className="font-medium">{booking.partner}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Past Bookings */}
                    {activeTab === 'past' && (
                      <div className="space-y-6">
                        {pastBookings.length === 0 ? (
                          <div className="text-center py-12">
                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
                            <p className="text-gray-600 mb-4">You haven't completed any bike rentals yet.</p>
                            <Link
                              to="/booking"
                              className="inline-flex items-center bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Book Your First Bike
                            </Link>
                          </div>
                        ) : (
                          pastBookings.map((booking) => (
                            <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-3 ${
                                    booking.status === 'completed' ? 'bg-gray-400' : 'bg-red-400'
                                  }`}></div>
                                  <span className="text-lg font-semibold text-gray-900">
                                    {booking.status === 'completed' ? 'Completed Rental' : 'Cancelled Rental'}
                                  </span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  booking.status === 'completed' 
                                    ? 'bg-gray-100 text-gray-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName}</h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      <span>{booking.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      <span>{booking.startDate} to {booking.endDate}</span>
                                    </div>
                                  </div>
                                  
                                  {booking.rating && booking.rating > 0 && (
                                    <div className="flex items-center">
                                      <div className="flex items-center mr-4">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < (booking.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-600">Your Rating</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                  {booking.review && booking.status === 'completed' ? (
                                    <>
                                      <h4 className="font-semibold text-gray-900 mb-3">Your Review</h4>
                                      <p className="text-gray-600 text-sm italic">"{booking.review}"</p>
                                    </>
                                  ) : (
                                    <div className="text-center">
                                      <h4 className="font-semibold text-gray-900 mb-2">
                                        {booking.status === 'completed' ? 'No Review Yet' : 'Booking Details'}
                                      </h4>
                                      <p className="text-gray-600 text-sm">
                                        {booking.status === 'completed' 
                                          ? 'Share your experience with other riders'
                                          : `Booking #${booking.bookingNumber}`
                                        }
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex space-x-2 mt-4">
                                    <button className="flex items-center border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 transition-colors text-sm">
                                      <Download className="h-4 w-4 mr-1" />
                                      Receipt
                                    </button>
                                    {booking.status === 'completed' && (
                                      <Link
                                        to="/booking"
                                        className="flex items-center bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Book Again
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/booking"
                  className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-center block"
                >
                  New Booking
                </Link>
                <Link
                  to="/locations"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center block"
                >
                  Browse Locations
                </Link>
                <Link
                  to="/support"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center block"
                >
                  Get Support
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                        notification.read ? 'bg-gray-400' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Profile Settings
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Payment Methods
                </Link>
                <Link
                  to="/support"
                  className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Help & Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;