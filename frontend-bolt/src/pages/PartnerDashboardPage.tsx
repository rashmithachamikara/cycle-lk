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
  Bell,
  BarChart3,
  Users,
  PlusCircle,
  ClipboardList,
  Shield,
  ArrowUpRight,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Search
} from 'lucide-react';

const PartnerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('current');

  const currentBookings = [
    {
      id: 'CL2025001',
      customerName: 'John Doe',
      customerPhone: '+94 77 123 4567',
      bikeName: 'City Cruiser',
      bikeId: 'BIKE-1234',
      startDate: '2025-03-15',
      endDate: '2025-03-22',
      status: 'active',
      value: '$105'
    },
    {
      id: 'CL2025002',
      customerName: 'Sarah Johnson',
      customerPhone: '+94 77 234 5678',
      bikeName: 'Mountain Explorer',
      bikeId: 'BIKE-2345',
      startDate: '2025-03-18',
      endDate: '2025-03-25',
      status: 'active',
      value: '$140'
    }
  ];

  const requestedBookings = [
    {
      id: 'CL2025003',
      customerName: 'David Chen',
      customerPhone: '+94 77 345 6789',
      bikeName: 'Beach Rider',
      bikeId: 'BIKE-3456',
      startDate: '2025-03-20',
      endDate: '2025-03-27',
      status: 'requested',
      value: '$105'
    },
    {
      id: 'CL2025004',
      customerName: 'Maria Garcia',
      customerPhone: '+94 77 456 7890',
      bikeName: 'City Cruiser',
      bikeId: 'BIKE-4567',
      startDate: '2025-03-22',
      endDate: '2025-03-29',
      status: 'requested',
      value: '$105'
    }
  ];

  const recentBookings = [
    {
      id: 'CL2025005',
      customerName: 'Robert Smith',
      bikeName: 'Mountain Explorer',
      bikeId: 'BIKE-5678',
      startDate: '2025-02-10',
      endDate: '2025-02-17',
      status: 'completed',
      rating: 5,
    },
    {
      id: 'CL2025006',
      customerName: 'Emma Wilson',
      bikeName: 'Beach Rider',
      bikeId: 'BIKE-6789',
      startDate: '2025-02-15',
      endDate: '2025-02-18',
      status: 'completed',
      rating: 4,
    }
  ];

  const inventoryItems = [
    { id: 'BIKE-1234', name: 'City Cruiser', type: 'City', status: 'rented', condition: 'Excellent' },
    { id: 'BIKE-2345', name: 'Mountain Explorer', type: 'Mountain', status: 'rented', condition: 'Good' },
    { id: 'BIKE-3456', name: 'Beach Rider', type: 'Cruiser', status: 'available', condition: 'Excellent' },
    { id: 'BIKE-4567', name: 'City Cruiser', type: 'City', status: 'maintenance', condition: 'Fair' },
    { id: 'BIKE-5678', name: 'Mountain Explorer', type: 'Mountain', status: 'available', condition: 'Excellent' }
  ];

  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'You have a new booking request from David Chen',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'return',
      title: 'Bike Return',
      message: 'City Cruiser (BIKE-7890) has been returned',
      time: '1 day ago',
      read: true
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Maintenance Alert',
      message: 'Mountain Explorer (BIKE-4567) is due for maintenance',
      time: '2 days ago',
      read: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
              <p className="text-blue-100">Welcome back, Colombo Bikes!</p>
            </div>
            <div className="hidden md:block">
              <Link
                to="/partner-dashboard/add-bike"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Bike
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
                    <div className="text-2xl font-bold text-gray-900">8</div>
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
                    <div className="text-2xl font-bold text-gray-900">$2.4k</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </div>
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

            {/* Bookings Tabs */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'current', label: 'Current Rentals', count: currentBookings.length },
                    { id: 'requested', label: 'Booking Requests', count: requestedBookings.length },
                    { id: 'inventory', label: 'Inventory', count: inventoryItems.length },
                    { id: 'recent', label: 'Completed Rentals', count: recentBookings.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
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
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName} ({booking.bikeId})</h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{booking.startDate} to {booking.endDate}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Rented by: {booking.customerName}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3">
                              <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                <Phone className="h-4 w-4 mr-2" />
                                Contact Customer
                              </button>
                              <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Booking
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-medium">{booking.id}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Customer Phone:</span>
                                <span className="font-medium">{booking.customerPhone}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Value:</span>
                                <span className="font-medium">{booking.value}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">7 days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Booking Requests */}
                {activeTab === 'requested' && (
                  <div className="space-y-6">
                    {requestedBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-lg font-semibold text-gray-900">Booking Request</span>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            Awaiting Approval
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName} ({booking.bikeId})</h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{booking.startDate} to {booking.endDate}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Requested by: {booking.customerName}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-3">
                              <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </button>
                              <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Decline
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-medium">{booking.id}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Customer Phone:</span>
                                <span className="font-medium">{booking.customerPhone}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Value:</span>
                                <span className="font-medium">{booking.value}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">7 days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inventory */}
                {activeTab === 'inventory' && (
                  <div>
                    <div className="flex justify-between mb-6">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type="text"
                          placeholder="Search inventory..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <div className="absolute left-3 top-2.5">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>                      <Link to="/add-bike" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Bike
                      </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bike ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Condition
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventoryItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.status === 'available' 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.status === 'rented' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.condition}
                              </td>                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/edit-bike/${item.id}`} className="text-blue-600 hover:text-blue-900 mr-4">Edit</Link>
                                <button className="text-red-600 hover:text-red-900">Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recent Bookings */}
                {activeTab === 'recent' && (
                  <div className="space-y-6">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                            <span className="text-lg font-semibold text-gray-900">Completed Rental</span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.bikeName} ({booking.bikeId})</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{booking.startDate} to {booking.endDate}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Rented by: {booking.customerName}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-end">
                            <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-blue-500 transition-colors">
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </button>
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
                <button
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-center block"
                >
                  Add New Bike
                </button>
                <button
                  className="w-full border border-blue-500 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-center block"
                >
                  Generate Reports
                </button>
                <button
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-blue-500 transition-colors font-medium text-center block"
                >
                  Manage Settings
                </button>
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
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2">
                  View All Notifications
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Snapshot</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">$2,450</span>
                    <span className="text-green-500 text-xs ml-2 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      18%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">32</span>
                    <span className="text-green-500 text-xs ml-2 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      7%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Duration</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">4.5 days</span>
                    <span className="text-green-500 text-xs ml-2 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      5%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maintenance Costs</span>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900">$350</span>
                    <span className="text-red-500 text-xs ml-2 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                      4%
                    </span>
                  </div>
                </div>
                <Link
                  to="/partner-dashboard/analytics"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center w-full mt-2"
                >
                  View Detailed Analytics
                  <ArrowUpRight className="h-4 w-4 ml-1" />
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

export default PartnerDashboardPage;
