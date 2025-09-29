import apiUtils from '../utils/apiUtils';

// TypeScript interfaces
export interface MonthlyEarnings {
  totalEarnings: number;
  transactionCount: number;
  ownerEarnings: number;
  pickupEarnings: number;
}

export interface RevenueChart {
  chartData: Array<{
    date: string;
    earnings: number;
  }>;
  totalEarnings: number;
  period: string;
}

export interface Transaction {
  _id: string;
  partnerId: string;
  paymentId?: string;
  bookingId?: {
    _id: string;
    bookingNumber: string;
  };
  type: string;
  category: 'earning' | 'deduction';
  amount: number;
  description: string;
  createdAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface PlatformRevenue {
  totalRevenue: number;
  transactionCount: number;
  recentTransactions: Transaction[];
}

export interface MonthlyTotalRevenue {
  totalRevenue: number;
  transactionCount: number;
  ownerEarnings: number;
  pickupEarnings: number;
  platformFees: number;
  bonusPayments: number;
  referralCommissions: number;
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
  recentTransactions: Transaction[];
}

class TransactionService {
  // Get monthly earnings summary for a partner
  async getMyMonthlyEarnings(): Promise<MonthlyEarnings> {
    try {
      const response = await apiUtils.get('/transactions/my-monthly-earnings');
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly earnings:', error);
      throw error;
    }
  }

  // Get revenue chart data for a partner
  async getMyRevenueChart(params: {
    period: 'day' | 'week' | 'month';
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueChart> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('period', params.period);
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }

      const response = await apiUtils.get(`/transactions/my-revenue-chart?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue chart:', error);
      throw error;
    }
  }

  // Get paginated transactions for a partner with filtering
  async getMyTransactions(params: {
    page: number;
    limit: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<TransactionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      
      if (params.type) queryParams.append('type', params.type);
      if (params.category) queryParams.append('category', params.category);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
      if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());

      const response = await apiUtils.get(`/transactions/my-transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get platform revenue (admin only)
  async getPlatformRevenue(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PlatformRevenue> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await apiUtils.get(`/transactions/platform/revenue?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching platform revenue:', error);
      throw error;
    }
  }

  // Get monthly total revenue from all earnings (admin only)
  async getMonthlyTotalRevenue(params?: {
    year?: number;
    month?: number;
  }): Promise<MonthlyTotalRevenue> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month.toString());

      const response = await apiUtils.get(`/transactions/monthly/total-revenue?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly total revenue:', error);
      throw error;
    }
  }
}

const transactionService = new TransactionService();
export default transactionService;
