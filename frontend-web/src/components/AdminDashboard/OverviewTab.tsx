import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlatformRevenueChart } from '../../services/transactionService';
import {
  Users,
  Building,
  Bike,
  CreditCard,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Shield,
  Filter
} from 'lucide-react';

interface OverviewTabProps {
  systemStats: {
    totalUsers: number;
    totalPartners: number;
    totalBikes: number;
    totalRevenue: number;
    pendingApprovals: number;
    isLoadingRevenue?: boolean;
    revenueChartData?: PlatformRevenueChart | null;
    isLoadingChart?: boolean;
    monthlyRevenueBreakdown?: {
      platformFees: number;
      ownerEarnings: number;
      pickupEarnings: number;
    } | null;
  };
  onTabChange: (tabId: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ systemStats, onTabChange }) => {
  const [selectedRevenueFilter, setSelectedRevenueFilter] = useState<'all' | 'platform_fee' | 'owner_earnings' | 'pickup_earnings' | 'partner_earnings'>('all');

  // Format chart data for display
  const formatChartData = () => {
    if (!systemStats.revenueChartData?.chartData) return [];
    
    return systemStats.revenueChartData.chartData.map(item => {
      let earnings = item.earnings;
      
      // Filter based on selected revenue type
      if (selectedRevenueFilter === 'platform_fee') {
        earnings = item.platformFees;
      } else if (selectedRevenueFilter === 'owner_earnings') {
        earnings = item.ownerEarnings;
      } else if (selectedRevenueFilter === 'pickup_earnings') {
        earnings = item.pickupEarnings;
      } else if (selectedRevenueFilter === 'partner_earnings') {
        earnings = item.ownerEarnings + item.pickupEarnings;
      }
      
      return {
        ...item,
        displayEarnings: earnings,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  };

  const chartData = formatChartData();

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
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview (Last 7 Days)</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedRevenueFilter}
                onChange={(e) => setSelectedRevenueFilter(e.target.value as 'all' | 'platform_fee' | 'owner_earnings' | 'pickup_earnings' | 'partner_earnings')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Revenue</option>
                <option value="platform_fee">Platform Fees</option>
                <option value="owner_earnings">Owner Earnings</option>
                <option value="pickup_earnings">Pickup Earnings</option>
                <option value="partner_earnings">Partner Earnings</option>
              </select>
              <Filter className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          <div className="h-60">
            {systemStats.isLoadingChart ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 h-full w-full rounded-lg"></div>
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="displayEarnings" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No revenue data available for the last 7 days
              </div>
            )}
          </div>
        </div>

        {/* Revenue Division */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Division</h3>
            <span className="text-xs text-gray-500">Current Month Breakdown</span>
          </div>
          
          <div className="h-60 flex flex-col justify-center space-y-4">
            {systemStats.isLoadingRevenue ? (
              <div className="space-y-4">
                <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                <div className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
              </div>
            ) : systemStats.monthlyRevenueBreakdown ? (
              <>
                {/* Platform Fees */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Platform Fees</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    LKR {systemStats.monthlyRevenueBreakdown.platformFees.toLocaleString()}
                  </span>
                </div>

                {/* Owner Earnings */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Owner Earnings</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    LKR {systemStats.monthlyRevenueBreakdown.ownerEarnings.toLocaleString()}
                  </span>
                </div>

                {/* Pickup Earnings */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-900">Pickup Earnings</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    LKR {systemStats.monthlyRevenueBreakdown.pickupEarnings.toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-lg mb-2">No Revenue Data</div>
                  <div className="text-sm">No earnings recorded for current month</div>
                </div>
              </div>
            )}
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
