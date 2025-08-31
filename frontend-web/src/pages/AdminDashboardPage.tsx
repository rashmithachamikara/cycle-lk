import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { partnerService, Partner } from '../services/partnerService';
import { 
Clock, 
  MapPin, 
  Bike, 
  Users, 
  Star, 
  Settings,
  CreditCard,
  BarChart3,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Search,
  Shield,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Edit,
  User,
  Building,
  Filter,
  Plus,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  ClipboardList,
  Loader
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [partnersError, setPartnersError] = useState<string | null>(null);

  const partnerRequests = [
    {
      id: 'PR-1001',
      companyName: 'Hill Country Bikes',
      location: 'Nuwara Eliya',
      contactPerson: 'Daniel Fernando',
      phone: '+94 77 123 4567',
      email: 'daniel@hillcountrybikes.lk',
      bikeCount: 12,
      status: 'pending'
    },
    {
      id: 'PR-1002',
      companyName: 'Coastal Cruisers',
      location: 'Mirissa',
      contactPerson: 'Sarah Perera',
      phone: '+94 77 987 6543',
      email: 'sarah@coastalcruisers.lk',
      bikeCount: 8,
      status: 'pending'
    }
  ];

  const users = [
    {
      id: 'USR-1001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      joined: '2024-12-15',
      bookings: 5,
      status: 'active'
    },
    {
      id: 'USR-1002',
      name: 'Emma Johnson',
      email: 'emma.johnson@example.com',
      joined: '2025-01-03',
      bookings: 3,
      status: 'active'
    },
    {
      id: 'USR-1003',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      joined: '2025-01-10',
      bookings: 0,
      status: 'inactive'
    },
    {
      id: 'USR-1004',
      name: 'Sophia Davis',
      email: 'sophia.davis@example.com',
      joined: '2025-02-05',
      bookings: 2,
      status: 'active'
    }
  ];

  // Fetch partners data
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoadingPartners(true);
        setPartnersError(null);
        const partnersData = await partnerService.getAllPartners();
        setPartners(partnersData);
      } catch (error) {
        console.error('Error fetching partners:', error);
        setPartnersError('Failed to load partners data');
      } finally {
        setIsLoadingPartners(false);
      }
    };

    fetchPartners();
  }, []);

  // Filter partners by status
  const pendingPartners = partners.filter(partner => partner.status === 'pending');
  const activePartners = partners.filter(partner => partner.status === 'active');

  // Helper function to format location
  const getPartnerLocation = (partner: Partner): string => {
    if (typeof partner.location === 'object' && partner.location?.name) {
      return partner.location.name;
    }
    return partner.address || partner.location as string || 'Location not specified';
  };

  // Helper function to get partner contact person
  const getContactPerson = (partner: Partner): string => {
    return partner.contactPerson || 'Not specified';
  };

  // Helper function to get partner phone
  const getPartnerPhone = (partner: Partner): string => {
    return partner.phone || 'Not provided';
  };

  // Helper function to get partner email
  const getPartnerEmail = (partner: Partner): string => {
    return partner.email || 'Not provided';
  };

  // Helper function to format creation date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  // Update system stats to use real data
  const systemStats = {
    totalUsers: 1245, // Keep existing mock data for now
    totalPartners: partners.length,
    totalBikes: partners.reduce((sum, partner) => sum + (partner.bikeCount || 0), 0),
    totalBookings: 3254, // Keep existing mock data for now
    totalRevenue: 142350, // Keep existing mock data for now
    activeBookings: 124, // Keep existing mock data for now
    pendingApprovals: pendingPartners.length,
    supportTickets: 15 // Keep existing mock data for now
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Control Panel</h1>
              <p className="text-purple-100">Welcome back, Admin User!</p>
            </div>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/admin-dashboard/settings"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
              >
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="flex items-center overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'partners', label: 'Partners', icon: Building },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'support', label: 'Support Tickets', icon: MessageSquare },
              { id: 'reports', label: 'Reports', icon: ClipboardList },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-6 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{systemStats.totalPartners}</div>
                    <div className="text-sm text-gray-600">Partners</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Bike className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{systemStats.totalBikes}</div>
                    <div className="text-sm text-gray-600">Bikes Listed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">${(systemStats.totalRevenue/1000).toFixed(1)}k</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600 font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +15.3% from last month
                    </span>
                  </div>
                </div>
                
                <div className="h-60 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg flex items-end justify-between p-4">
                  {[35, 42, 50, 45, 65, 75, 68].map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-gradient-to-t from-purple-500 to-indigo-600 rounded-t-md" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].slice(0, 7)[index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Distribution</h3>
                  <button className="text-xs text-gray-500 hover:text-purple-600">
                    More Details
                  </button>
                </div>
                
                <div className="flex items-center justify-center h-60">
                  <div className="w-48 h-48 rounded-full border-8 border-indigo-500 relative flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-8 border-blue-500 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-8 border-purple-500 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                      Colombo: 45%
                    </div>
                    <div className="absolute bottom-0 right-0 text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                      Kandy: 25%
                    </div>
                    <div className="absolute bottom-0 left-0 text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                      Galle: 18%
                    </div>
                    <div className="absolute top-0 left-0 text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                      Others: 12%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Required Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Action Required</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-purple-200 rounded-xl p-5 bg-purple-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">Partner Approvals</h4>
                      <span className="text-sm text-gray-600">{partnerRequests.length} pending requests</span>
                    </div>
                  </div>
                  <Link 
                    to="#partner-section" 
                    className="text-purple-600 flex items-center text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('partners');
                    }}
                  >
                    Review Requests
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <div className="border border-blue-200 rounded-xl p-5 bg-blue-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">Support Tickets</h4>
                      <span className="text-sm text-gray-600">15 open tickets</span>
                    </div>
                  </div>
                  <Link 
                    to="#support-section" 
                    className="text-blue-600 flex items-center text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('support');
                    }}
                  >
                    Handle Support
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <div className="border border-amber-200 rounded-xl p-5 bg-amber-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-gray-900">Verification Needed</h4>
                      <span className="text-sm text-gray-600">3 partners require verification</span>
                    </div>
                  </div>
                  <Link 
                    to="#"
                    className="text-amber-600 flex items-center text-sm font-medium"
                  >
                    Verify Partners
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-8">
            {/* Partner Management Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Partner Management</h2>
                <p className="text-gray-600">Manage all registered bike rental partners</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search partners..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Partner
                </button>
              </div>
            </div>

            {/* Partner Approval Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6" id="partner-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Approval Requests</h3>
              
              {isLoadingPartners ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading partners...</span>
                </div>
              ) : partnersError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  {partnersError}
                </div>
              ) : pendingPartners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending partner requests</div>
              ) : (
                <div className="space-y-6">
                  {pendingPartners.map((partner) => (
                    <div key={partner._id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                          <span className="text-lg font-semibold text-gray-900">{partner.companyName}</span>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          Pending Approval
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{getPartnerLocation(partner)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <User className="h-4 w-4 mr-2" />
                              <span>Contact: {getContactPerson(partner)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Bike className="h-4 w-4 mr-2" />
                              <span>Bikes to list: {partner.bikeCount || 'Not specified'}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </button>
                            <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Reject
                            </button>
                            <button className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:border-purple-500 transition-colors">
                              <Edit className="h-4 w-4 mr-2" />
                              Review Details
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">ID:</span>
                              <span className="font-medium">{partner._id.slice(-8)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-sm">{getPartnerEmail(partner)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{getPartnerPhone(partner)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Applied:</span>
                              <span className="font-medium">{formatDate(partner.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Partners Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Partners</h3>
              
              {isLoadingPartners ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="h-8 w-8 text-purple-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Loading partners...</span>
                </div>
              ) : activePartners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No active partners found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bikes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activePartners.map((partner) => (
                        <tr key={partner._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                            <div className="text-sm text-gray-500">{getContactPerson(partner)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getPartnerLocation(partner)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {partner.bikeCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              partner.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {partner.status?.charAt(0).toUpperCase() + partner.status?.slice(1) || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-500">
                                {partner.rating ? partner.rating.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              partner.verified 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {partner.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                            <button className="text-gray-600 hover:text-gray-900 mr-4">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Suspend</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* Users Management Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage all registered users</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.joined}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.bookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                          <button className="text-red-600 hover:text-red-900">Block</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                <div className="h-60 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg flex items-end justify-between p-4">
                  {[20, 35, 45, 60, 75, 85, 95].map((height, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-gradient-to-t from-purple-500 to-indigo-600 rounded-t-md" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2">
                        {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].slice(0, 7)[index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">68%</div>
                    <div className="text-sm text-gray-600">Local Users</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">32%</div>
                    <div className="text-sm text-gray-600">International</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-violet-600 mb-1">45%</div>
                    <div className="text-sm text-gray-600">Returning</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">55%</div>
                    <div className="text-sm text-gray-600">New Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            {/* Support Management Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
                <p className="text-gray-600">Manage customer and partner support requests</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl shadow-sm p-6" id="support-section">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supportTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              ticket.userType === 'partner' ? 'bg-blue-500' : 'bg-green-500'
                            }`}></span>
                            <span className="text-sm text-gray-500">{ticket.from}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.created}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : ticket.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ticket.status === 'open' 
                              ? 'bg-blue-100 text-blue-800' 
                              : ticket.status === 'in-progress'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-purple-600 hover:text-purple-900 mr-4">View</button>
                          <button className="text-blue-600 hover:text-blue-900 mr-4">Assign</button>
                          <button className="text-gray-600 hover:text-gray-900">Close</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Support Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Average Response Time</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">1.5 hours</div>
                    <div className="flex items-center text-sm text-green-600">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      15% from last month
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resolution Rate</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">92%</div>
                    <div className="flex items-center text-sm text-green-600">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      5% from last month
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Satisfaction</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                    <div className="flex items-center text-sm text-green-600">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      0.2 from last month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for Reports and Settings tabs */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <HelpCircle className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports Module</h3>
            <p className="text-gray-600 max-w-lg mx-auto">
              Generate comprehensive reports on bookings, revenue, partners, and user activity to inform business decisions.
            </p>
            <button className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Configure Reports
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Settings className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-600 max-w-lg mx-auto">
              Configure application settings, payment gateways, notification preferences, and system parameters.
            </p>
            <button className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Access Settings
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
