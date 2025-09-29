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

// Interface for last 7 days revenue chart
export interface Last7DaysRevenueChart {
  chartData: ChartDataPoint[];
  period: {
    startDate: string;
    endDate: string;
  };
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

  // Get current user's last 7 days revenue chart (for partners)
  getMyLast7DaysRevenueChart: async (): Promise<Last7DaysRevenueChart> => {
    const response = await api.get('/transactions/my-last-7-days-chart');
    return response.data;
  },
};

export default transactionService;