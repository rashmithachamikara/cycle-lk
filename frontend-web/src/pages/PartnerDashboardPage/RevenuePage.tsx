import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import transactionService, { MonthlyEarnings, RevenueChart } from '../../services/transactionService';
import { Loader } from '../../ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, ArrowLeft } from 'lucide-react';

const RevenuePage = () => {
  const { user } = useAuth();
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings | null>(null);
  const [revenueChart7Days, setRevenueChart7Days] = useState<RevenueChart | null>(null);
  const [revenueChart30Days, setRevenueChart30Days] = useState<RevenueChart | null>(null);
  const [revenueChart4Weeks, setRevenueChart4Weeks] = useState<RevenueChart | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '4weeks'>('7days');

  // Fetch earnings data
  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const earningsData = await transactionService.getMyMonthlyEarnings();
      setMonthlyEarnings(earningsData);
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setEarningsLoading(false);
    }
  };

  // Fetch chart data
  const fetchChartData = useCallback(async (period: '7days' | '30days' | '4weeks' = selectedPeriod) => {
    try {
      setChartLoading(true);
      if (period === '7days') {
        const chartData = await transactionService.getMyRevenueChart({ period: 'day', limit: 7 });
        setRevenueChart7Days(chartData);
      } else if (period === '30days') {
        const chartData = await transactionService.getMyRevenueChart({ period: 'day', limit: 30 });
        setRevenueChart30Days(chartData);
      } else if (period === '4weeks') {
        const chartData = await transactionService.getMyRevenueChart({ period: 'week', limit: 4 });
        setRevenueChart4Weeks(chartData);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (user && user.role === 'partner') {
      fetchEarnings();
      fetchChartData('7days');
      fetchChartData('30days');
      fetchChartData('4weeks');
    }
  }, [user, fetchChartData]);

  // Handle period change
  useEffect(() => {
    if (user && user.role === 'partner') {
      if (selectedPeriod === '7days' && !revenueChart7Days) {
        fetchChartData('7days');
      } else if (selectedPeriod === '30days' && !revenueChart30Days) {
        fetchChartData('30days');
      } else if (selectedPeriod === '4weeks' && !revenueChart4Weeks) {
        fetchChartData('4weeks');
      }
    }
  }, [selectedPeriod, user, fetchChartData, revenueChart7Days, revenueChart30Days, revenueChart4Weeks]);

  if (!user || user.role !== 'partner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need to be logged in as a partner to view this page.</p>
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/partner-dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-2">Track your earnings and revenue performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {earningsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                  ) : (
                    `LKR ${monthlyEarnings?.totalEarnings?.toLocaleString() || '0'}`
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Monthly Earnings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {earningsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                  ) : (
                    monthlyEarnings?.transactionCount || 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {earningsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                  ) : (
                    `LKR ${monthlyEarnings?.ownerEarnings?.toLocaleString() || '0'}`
                  )}
                </div>
                <div className="text-sm text-gray-600">Owner Earnings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {earningsLoading ? (
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                  ) : (
                    `LKR ${monthlyEarnings?.pickupEarnings?.toLocaleString() || '0'}`
                  )}
                </div>
                <div className="text-sm text-gray-600">Pickup Earnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('7days')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedPeriod === '7days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('30days')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedPeriod === '30days'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('4weeks')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedPeriod === '4weeks'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Last 4 Weeks
            </button>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Overview ({
                selectedPeriod === '7days' ? 'Last 7 Days' :
                selectedPeriod === '30days' ? 'Last 30 Days' :
                'Last 4 Weeks'
              })
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {selectedPeriod === '7days' ? 'Daily' : selectedPeriod === '30days' ? 'Daily' : 'Weekly'} breakdown
              </span>
            </div>
          </div>

          <div className="h-80">
            {chartLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader />
              </div>
            ) : ((selectedPeriod === '7days' && revenueChart7Days?.chartData && revenueChart7Days.chartData.length > 0) ||
                  (selectedPeriod === '30days' && revenueChart30Days?.chartData && revenueChart30Days.chartData.length > 0) ||
                  (selectedPeriod === '4weeks' && revenueChart4Weeks?.chartData && revenueChart4Weeks.chartData.length > 0)) ? (
              <ResponsiveContainer width="100%" height="100%" key={selectedPeriod}>
                <BarChart data={
                  selectedPeriod === '7days' ? revenueChart7Days?.chartData :
                  selectedPeriod === '30days' ? revenueChart30Days?.chartData :
                  revenueChart4Weeks?.chartData
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(dateStr) => {
                      if (selectedPeriod === '4weeks') {
                        // For weekly data: "YYYY-WW" format
                        const [, week] = dateStr.split('-');
                        return `W${week}`;
                      } else {
                        // For daily data: "YYYY-MM-DD" format
                        const date = new Date(dateStr);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }
                    }}
                  />
                  <YAxis
                    tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Earnings']}
                    labelFormatter={(dateStr) => {
                      if (selectedPeriod === '4weeks') {
                        // For weekly data: "YYYY-WW" format
                        const [year, week] = dateStr.split('-');
                        return `Week ${week}, ${year}`;
                      } else {
                        // For daily data: "YYYY-MM-DD" format
                        const date = new Date(dateStr);
                        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                      }
                    }}
                  />
                  <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No revenue data available for the selected period
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RevenuePage;