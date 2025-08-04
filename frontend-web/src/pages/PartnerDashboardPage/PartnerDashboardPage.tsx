import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Notifications from '../../components/PartnerDashboard/Notifications';
import MonthlySnapshot from '../../components/PartnerDashboard/MonthlySnapshot';
import CurrentRentals from '../../components/PartnerDashboard/CurrentRentals';
import BookingRequests from '../../components/PartnerDashboard/BookingRequests';
import Inventory from '../../components/PartnerDashboard/Inventory';
import CompletedRentals from '../../components/PartnerDashboard/CompletedRentals';
import { 
  Bike, 
  Star, 
  Users,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const PartnerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('current');
  // Add delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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

  // Handle confirming bike deletion
  const handleConfirmDelete = () => {
    if (!bikeToDelete) return;
    
    setIsDeleting(true);
    
    // Simulate API call to delete bike
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteSuccess(true);
      
      // Close modal after showing success message
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteSuccess(false);
        setBikeToDelete(null);
        // In a real application, we would update the inventory list here
      }, 1500);
    }, 1000);
  };

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
                {activeTab === 'current' && <CurrentRentals />}

                {/* Booking Requests */}
                {activeTab === 'requested' && <BookingRequests />}

                {/* Inventory */}
                {activeTab === 'inventory' && (
                  <Inventory
                    showDeleteModal={showDeleteModal}
                    setShowDeleteModal={setShowDeleteModal}
                    bikeToDelete={bikeToDelete}
                    setBikeToDelete={setBikeToDelete}
                    handleConfirmDelete={handleConfirmDelete}
                    isDeleting={isDeleting}
                    deleteSuccess={deleteSuccess}
                  />
                )}

                {/* Recent Bookings */}
                {activeTab === 'recent' && <CompletedRentals />}
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
                  to="/partner-dashboard/add-bike"
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium text-center block"
                >
                  Add New Bike
                </Link>
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
            <Notifications />

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