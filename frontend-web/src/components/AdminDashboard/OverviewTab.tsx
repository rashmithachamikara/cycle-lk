import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  Bike,
  CreditCard,
  TrendingUp,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Shield
} from 'lucide-react';

interface OverviewTabProps {
  systemStats: {
    totalUsers: number;
    totalPartners: number;
    totalBikes: number;
    totalRevenue: number;
    pendingApprovals: number;
    isLoadingRevenue?: boolean;
  };
  onTabChange: (tabId: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ systemStats, onTabChange }) => {
  return (
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
              <div className="text-2xl font-bold text-gray-900">
                {systemStats.isLoadingRevenue ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  `LKR ${systemStats.totalRevenue.toLocaleString()}`
                )}
              </div>
              <div className="text-sm text-gray-600">Monthly Total Revenue</div>
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
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][index]}
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
                <span className="text-sm text-gray-600">{systemStats.pendingApprovals} pending requests</span>
              </div>
            </div>
            <button 
              className="text-purple-600 flex items-center text-sm font-medium"
              onClick={() => onTabChange('partners')}
            >
              Review Requests
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
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
            <button 
              className="text-blue-600 flex items-center text-sm font-medium"
              onClick={() => onTabChange('support')}
            >
              Handle Support
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
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
  );
};

export default OverviewTab;
