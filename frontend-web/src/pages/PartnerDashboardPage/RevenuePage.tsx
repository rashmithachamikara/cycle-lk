import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import transactionService, { MonthlyEarnings, RevenueChart, TransactionsResponse, Transaction } from '../../services/transactionService';
import { Loader } from '../../ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, ArrowLeft, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const RevenuePage = () => {
  const { user } = useAuth();
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings | null>(null);
  const [revenueChart7Days, setRevenueChart7Days] = useState<RevenueChart | null>(null);
  const [revenueChart30Days, setRevenueChart30Days] = useState<RevenueChart | null>(null);
  const [revenueChart4Weeks, setRevenueChart4Weeks] = useState<RevenueChart | null>(null);
  const [revenueChartCustom, setRevenueChartCustom] = useState<RevenueChart | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '4weeks' | 'custom'>('7days');
  const [selectedBreakdown, setSelectedBreakdown] = useState<'day' | 'week' | 'month'>('day');
  const [customBreakdown, setCustomBreakdown] = useState<'day' | 'week' | 'month'>('day');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [lastAppliedStartDate, setLastAppliedStartDate] = useState('');
  const [lastAppliedEndDate, setLastAppliedEndDate] = useState('');

  // Transaction log state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);

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

  // Refs to avoid dependency issues
  const customStartDateRef = useRef(customStartDate);
  const customEndDateRef = useRef(customEndDate);
  const selectedBreakdownRef = useRef(selectedBreakdown);

  // Update refs when values change
  useEffect(() => {
    customStartDateRef.current = customStartDate;
  }, [customStartDate]);

  useEffect(() => {
    customEndDateRef.current = customEndDate;
  }, [customEndDate]);

  useEffect(() => {
    selectedBreakdownRef.current = selectedBreakdown;
  }, [selectedBreakdown]);

  // Fetch chart data
  const fetchChartData = useCallback(async (period: '7days' | '30days' | '4weeks' | 'custom' = selectedPeriod, breakdown: 'day' | 'week' | 'month' = selectedBreakdown) => {
    try {
      setChartLoading(true);
      if (period === '7days') {
        const chartData = await transactionService.getMyRevenueChart({ period: breakdown, limit: 7 });
        setRevenueChart7Days(chartData);
      } else if (period === '30days') {
        const chartData = await transactionService.getMyRevenueChart({ period: breakdown, limit: 30 });
        setRevenueChart30Days(chartData);
      } else if (period === '4weeks') {
        const chartData = await transactionService.getMyRevenueChart({ period: breakdown, limit: 4 });
        setRevenueChart4Weeks(chartData);
      } else if (period === 'custom' && customStartDateRef.current && customEndDateRef.current) {
        const chartData = await transactionService.getMyRevenueChart({
          period: breakdown,
          startDate: customStartDateRef.current,
          endDate: customEndDateRef.current
        });
        setRevenueChartCustom(chartData);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && user.role === 'partner') {
      fetchEarnings();
      fetchChartData('7days', 'day');
      fetchChartData('30days', 'day');
      fetchChartData('4weeks', 'week');
    }
  }, [user, fetchChartData]); // Added fetchChartData back to dependencies

  // Initialize custom date range with last 30 days
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setCustomStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setCustomEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Handle period change
  useEffect(() => {
    if (user && user.role === 'partner') {
      if (selectedPeriod === '7days' && !revenueChart7Days) {
        fetchChartData('7days', 'day');
      } else if (selectedPeriod === '30days' && !revenueChart30Days) {
        fetchChartData('30days', 'day');
      } else if (selectedPeriod === '4weeks' && !revenueChart4Weeks) {
        fetchChartData('4weeks', 'week');
      }
      // Note: Custom range data is only fetched when Apply button is clicked
    }
  }, [selectedPeriod, user, fetchChartData, revenueChart7Days, revenueChart30Days, revenueChart4Weeks]);



  // Fetch transactions
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setTransactionsLoading(true);
      const params: {
        page: number;
        limit: number;
        type?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        minAmount?: number;
        maxAmount?: number;
      } = { page, limit: 10 };

      // Add filters
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount) params.minAmount = parseFloat(filters.minAmount);
      if (filters.maxAmount) params.maxAmount = parseFloat(filters.maxAmount);

      const response: TransactionsResponse = await transactionService.getMyTransactions(params);
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
      setTotalTransactions(response.totalCount);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [filters]);

  // Load initial transactions when component mounts
  useEffect(() => {
    if (user && user.role === 'partner') {
      fetchTransactions(1);
    }
  }, [user, fetchTransactions]);

  // Memoized formatter functions to prevent unnecessary re-renders
  const tickFormatter = useCallback((dateStr: string) => {
    const breakdown = selectedPeriod === '7days' ? 'day' :
                     selectedPeriod === '30days' ? 'day' :
                     selectedPeriod === '4weeks' ? 'week' :
                     customBreakdown;

    if (breakdown === 'week') {
      // For weekly data: "YYYY-WW" format
      const [, week] = dateStr.split('-');
      return `W${week}`;
    } else if (breakdown === 'month') {
      // For monthly data: "YYYY-MM" format
      const [, month] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(month) - 1];
    } else {
      // For daily data: "YYYY-MM-DD" format
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }, [selectedPeriod, customBreakdown]);

  const labelFormatter = useCallback((dateStr: string) => {
    const breakdown = selectedPeriod === '7days' ? 'day' :
                     selectedPeriod === '30days' ? 'day' :
                     selectedPeriod === '4weeks' ? 'week' :
                     customBreakdown;

    if (breakdown === 'week') {
      // For weekly data: "YYYY-WW" format
      const [year, week] = dateStr.split('-');
      return `Week ${week}, ${year}`;
    } else if (breakdown === 'month') {
      // For monthly data: "YYYY-MM" format
      const [year, month] = dateStr.split('-');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } else {
      // For daily data: "YYYY-MM-DD" format
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }, [selectedPeriod, customBreakdown]);

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return selectedPeriod === '7days' ? revenueChart7Days?.chartData :
           selectedPeriod === '30days' ? revenueChart30Days?.chartData :
           selectedPeriod === '4weeks' ? revenueChart4Weeks?.chartData :
           revenueChartCustom?.chartData;
  }, [selectedPeriod, revenueChart7Days?.chartData, revenueChart30Days?.chartData, revenueChart4Weeks?.chartData, revenueChartCustom?.chartData]);

  // Memoize chart visibility condition
  const shouldShowChart = useMemo(() => {
    return (selectedPeriod === '7days' && revenueChart7Days?.chartData && revenueChart7Days.chartData.length > 0) ||
           (selectedPeriod === '30days' && revenueChart30Days?.chartData && revenueChart30Days.chartData.length > 0) ||
           (selectedPeriod === '4weeks' && revenueChart4Weeks?.chartData && revenueChart4Weeks.chartData.length > 0) ||
           (selectedPeriod === 'custom' && revenueChartCustom?.chartData && revenueChartCustom.chartData.length > 0);
  }, [selectedPeriod, revenueChart7Days?.chartData, revenueChart30Days?.chartData, revenueChart4Weeks?.chartData, revenueChartCustom?.chartData]);

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
          <div className="flex space-x-2 mb-4">
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
            <button
              onClick={() => setSelectedPeriod('custom')}
              className={`px-4 py-2 rounded-lg font-medium ${
                selectedPeriod === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Range Inputs */}
          {selectedPeriod === 'custom' && (
            <div className="flex space-x-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breakdown Type</label>
                <select
                  value={selectedBreakdown}
                  onChange={(e) => setSelectedBreakdown(e.target.value as 'day' | 'week' | 'month')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
              <button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setCustomBreakdown(selectedBreakdown);
                    setLastAppliedStartDate(customStartDate);
                    setLastAppliedEndDate(customEndDate);
                    setRevenueChartCustom(null); // Reset to force refetch
                    fetchChartData('custom', selectedBreakdown);
                  }
                }}
                disabled={selectedBreakdown === customBreakdown && customStartDate === lastAppliedStartDate && customEndDate === lastAppliedEndDate}
                className={`px-4 py-2 rounded-lg ${
                  selectedBreakdown === customBreakdown && customStartDate === lastAppliedStartDate && customEndDate === lastAppliedEndDate
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Overview ({
                selectedPeriod === '7days' ? 'Last 7 Days' :
                selectedPeriod === '30days' ? 'Last 30 Days' :
                selectedPeriod === '4weeks' ? 'Last 4 Weeks' :
                selectedPeriod === 'custom' && customStartDate && customEndDate ?
                  `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}` :
                  'Custom Range'
              })
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {selectedPeriod === '7days' ? 'Daily' :
                 selectedPeriod === '30days' ? 'Daily' :
                 selectedPeriod === '4weeks' ? 'Weekly' :
                 customBreakdown === 'day' ? 'Daily' :
                 customBreakdown === 'week' ? 'Weekly' : 'Monthly'} breakdown
              </span>
            </div>
          </div>

          <div className="h-80">
            {chartLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader />
              </div>
            ) : shouldShowChart ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={tickFormatter}
                  />
                  <YAxis
                    tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`LKR ${value.toLocaleString()}`, 'Earnings']}
                    labelFormatter={labelFormatter}
                  />
                  <Bar dataKey="earnings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                {selectedPeriod === 'custom' && (!customStartDate || !customEndDate)
                  ? 'Please select a date range to view the chart'
                  : 'No revenue data available for the selected period'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Log</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="owner_earnings">Owner Earnings</option>
                    <option value="pickup_earnings">Pickup Earnings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="earning">Earnings</option>
                    <option value="deduction">Deductions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    placeholder="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => {
                    setFilters({
                      type: '',
                      category: '',
                      startDate: '',
                      endDate: '',
                      minAmount: '',
                      maxAmount: ''
                    });
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => fetchTransactions(1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            {transactionsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No transactions found
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.category === 'earning'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          LKR {Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.bookingId?.bookingNumber || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchTransactions(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchTransactions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RevenuePage;