import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OverviewTab from '../components/AdminDashboard/OverviewTab';
import PartnersTab from '../components/AdminDashboard/PartnersTab';
import UsersTab from '../components/AdminDashboard/UsersTab';
import SupportTab from '../components/AdminDashboard/SupportTab';
import ReportsTab from '../components/AdminDashboard/ReportsTab';
import SettingsTab from '../components/AdminDashboard/SettingsTab';
import { partnerService, Partner } from '../services/partnerService';
import { 
  Settings,
  BarChart3,
  Building,
  Users,
  MessageSquare,
  ClipboardList
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [partnersError, setPartnersError] = useState<string | null>(null);
  const [approvingPartners, setApprovingPartners] = useState<Set<string>>(new Set());

  // Mock data
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

  const supportTickets = [
    {
      id: 'TCK-1001',
      subject: 'Unable to book bike',
      from: 'John Smith',
      userType: 'user',
      created: '2025-02-10',
      priority: 'high',
      status: 'open'
    },
    {
      id: 'TCK-1002',
      subject: 'Payment issue',
      from: 'Hill Country Bikes',
      userType: 'partner',
      created: '2025-02-11',
      priority: 'medium',
      status: 'in-progress'
    },
    {
      id: 'TCK-1003',
      subject: 'Bike listing not visible',
      from: 'Sarah Perera',
      userType: 'partner',
      created: '2025-02-12',
      priority: 'low',
      status: 'closed'
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

  // Handle tab switching from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'partners', 'users', 'support', 'reports', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Filter partners by status
  const pendingPartners = partners.filter(partner => partner.status === 'pending');

  // Update system stats to use real data
  const systemStats = {
    totalUsers: 1245,
    totalPartners: partners.length,
    totalBikes: partners.reduce((sum, partner) => sum + (partner.bikeCount || 0), 0),
    totalRevenue: 142350,
    pendingApprovals: pendingPartners.length
  };

  // Handle partner approval
  const handleApprovePartner = async (partnerId: string) => {
    try {
      setApprovingPartners(prev => new Set(prev).add(partnerId));
      
      // Update partner status to active and verified
      await partnerService.updatePartner(partnerId, { 
        status: 'active',
        verified: true 
      });
      
      // Refresh partners list
      const updatedPartners = await partnerService.getAllPartners();
      setPartners(updatedPartners);
      
      // Show success message (you could add a toast notification here)
      console.log('Partner approved successfully');
      
    } catch (error) {
      console.error('Error approving partner:', error);
      // You could add error toast notification here
    } finally {
      setApprovingPartners(prev => {
        const newSet = new Set(prev);
        newSet.delete(partnerId);
        return newSet;
      });
    }
  };

  // Handle partner rejection
  const handleRejectPartner = async (partnerId: string) => {
    try {
      setApprovingPartners(prev => new Set(prev).add(partnerId));
      
      // Update partner status to inactive
      await partnerService.updatePartner(partnerId, { 
        status: 'inactive'
      });
      
      // Refresh partners list
      const updatedPartners = await partnerService.getAllPartners();
      setPartners(updatedPartners);
      
      console.log('Partner rejected successfully');
      
    } catch (error) {
      console.error('Error rejecting partner:', error);
    } finally {
      setApprovingPartners(prev => {
        const newSet = new Set(prev);
        newSet.delete(partnerId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 py-8">
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
            { [
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'partners', label: 'Partners', icon: Building },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'support', label: 'Support Tickets', icon: MessageSquare },
              { id: 'reports', label: 'Reports', icon: ClipboardList },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            systemStats={systemStats} 
            onTabChange={handleTabChange} 
          />
        )}

        {activeTab === 'partners' && (
          <PartnersTab 
            partners={partners}
            isLoadingPartners={isLoadingPartners}
            partnersError={partnersError}
            approvingPartners={approvingPartners}
            onApprovePartner={handleApprovePartner}
            onRejectPartner={handleRejectPartner}
          />
        )}

        {activeTab === 'users' && <UsersTab users={users} />}
        {activeTab === 'support' && <SupportTab supportTickets={supportTickets} />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;