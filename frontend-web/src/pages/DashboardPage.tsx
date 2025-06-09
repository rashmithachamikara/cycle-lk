import React, { useState } from 'react';
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
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  CreditCard,
  Bell
} from 'lucide-react';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('current');

  const currentBookings = [
    {
      id: 'CL2025001',
      bikeName: 'City Cruiser',
      location: 'Colombo Central',
      startDate: '2025-03-15',
      endDate: '2025-03-22',
      status: 'active',
      qrCode: 'QR123456',
      partner: 'Colombo Bikes',
      partnerPhone: '+94 77 123 4567'
    }
  ];

  const pastBookings = [
    {
      id: 'CL2025002',
      bikeName: 'Mountain Explorer',
      location: 'Kandy Hills',
      startDate: '2025-02-10',
      endDate: '2025-02-17',
      status: 'completed',
      rating: 5,
      review: 'Amazing experience cycling through the tea plantations!'
    },
    {
      id: 'CL2025003',
      bikeName: 'Beach Rider',
      location: 'Galle Fort',
      startDate: '2025-01-20',
      endDate: '2025-01-22',
      status: 'completed',
      rating: 4,
      review: 'Great bike for coastal rides. Very comfortable.'
    }
  ];

  const upcomingBookings = [
    {
      id: 'CL2025004',
      bikeName: 'City Cruiser',
      location: 'Ella Station',
      startDate: '2025-04-01',
      endDate: '2025-04-08',
      status: 'confirmed',
      partner: 'Ella Adventures',
      partnerPhone: '+94 77 987 6543'
    }
  ];

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
              <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
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
                    <div className="text-2xl font-bold text-gray-900">1</div>
                    <div className="text-sm text-gray-600">Active Rental</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">3</div>
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
                    <div className="text-2xl font-bold text-gray-900">4.5</div>
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
                    <div className="text-2xl font-bold text-gray-900">5</div>
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
                    { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
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
                {/* Current Rentals */}
                {activeTab === 'current' && (
                  <div className="space-y-6">
                    {currentBookings.map((booking) => (
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
                              <div className="flex items-center">
                                <span className="text-gray-600 w-20">Phone:</span>
                                <a href={`tel:${booking.partnerPhone}`} className="text-emerald-600 hover:underline">
                                  {booking.partnerPhone}
                                </a>
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <button className="flex items-center bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </button>
                              <button className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming Bookings */}
                {activeTab === 'upcoming' && (
                  <div className="space-y-6">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-lg font-semibold text-gray-900">Upcoming Rental</span>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            Confirmed
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
                    ))}
                  </div>
                )}

                {/* Past Bookings */}
                {activeTab === 'past' && (
                  <div className="space-y-6">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                            <span className="text-lg font-semibold text-gray-900">Completed Rental</span>
                          </div>
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            Completed
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
                            
                            <div className="flex items-center">
                              <div className="flex items-center mr-4">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">Your Rating</span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Your Review</h4>
                            <p className="text-gray-600 text-sm italic">"{booking.review}"</p>
                            <div className="flex space-x-2 mt-4">
                              <button className="flex items-center border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:border-emerald-500 transition-colors text-sm">
                                <Download className="h-4 w-4 mr-1" />
                                Receipt
                              </button>
                              <Link
                                to="/booking"
                                className="flex items-center bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Book Again
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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