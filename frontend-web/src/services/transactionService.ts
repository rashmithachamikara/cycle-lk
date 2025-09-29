// frontend-web/services/transactionService.ts
import { api, debugLog } from '../utils/apiUtils';

// Log API configuration in debug mode
debugLog('Transaction Service initialized');

// Interface for monthly earnings data
export interface MonthlyEarnings {
  totalEarnings: number;
  transactionCount: number;
  ownerEarnings: number;
  pickupEarnings: number;
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
}

// Interface for chart data point
export interface ChartDataPoint {
  date: string;
  earnings: number;
  transactions: number;
}

// Interface for monthly revenue chart
export interface MonthlyRevenueChart {
  chartData: ChartDataPoint[];
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
}

// Interface for flexible revenue chart
export interface RevenueChart {
  chartData: ChartDataPoint[];
  period: {
    type: 'day' | 'week' | 'month';
    limit: number;
    startDate: string;
    endDate: string;
  };
}

// Interface for transaction data
export interface Transaction {
  _id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  createdAt: string;
  paymentId?: {
    amount: number;
    paymentType: string;
    status: string;
  };
  bookingId?: {
    bookingNumber: string;
  };
}

// Interface for paginated transactions response
export interface TransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

const transactionService = {
  // Get monthly earnings for a partner
  getPartnerMonthlyEarnings: async (partnerId: string, year?: number, month?: number): Promise<MonthlyEarnings> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/transactions/monthly-earnings/${partnerId}?${params.toString()}`);
    return response.data;
  },

  // Get daily revenue chart data for current month
  getPartnerMonthlyRevenueChart: async (partnerId: string): Promise<MonthlyRevenueChart> => {
    const response = await api.get(`/transactions/monthly-chart/${partnerId}`);
    return response.data;
  },

  // Get current user's monthly earnings (for partners)
  getMyMonthlyEarnings: async (year?: number, month?: number): Promise<MonthlyEarnings> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const response = await api.get(`/transactions/my-monthly-earnings?${params.toString()}`);
    return response.data;
  },

  // Get current user's monthly revenue chart (for partners)
  getMyMonthlyRevenueChart: async (): Promise<MonthlyRevenueChart> => {
    const response = await api.get('/transactions/my-monthly-chart');
    return response.data;
  },

  // Get current user's revenue chart with flexible period grouping (for partners)
  getMyRevenueChart: async (params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueChart> => {
    const queryParams = new URLSearchParams();

    if (params?.period) queryParams.append('period', params.period);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(`/transactions/my-revenue-chart?${queryParams.toString()}`);
    return response.data;
  },

  // Get current user's transactions with filtering and pagination (for partners)
  getMyTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<TransactionsResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params?.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());

    const response = await api.get(`/transactions/my-transactions?${queryParams.toString()}`);
    return response.data;
  },
};

export default transactionService;