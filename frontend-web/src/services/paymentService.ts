import { api, debugLog } from '../utils/apiUtils';

// Log service initialization in debug mode
debugLog('Payment Service initialized');

// Interface for payment filter parameters
export interface PaymentFilterParams {
  userId?: string;
  partnerId?: string;
  bookingId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Interface for payment data
export interface PaymentData {
  bookingId: string;
  paymentMethod: string;
  transactionId: string;
}

// Payment service object
export const paymentService = {
  // Process payment
  processPayment: async (paymentData: PaymentData) => {
    debugLog('Processing payment', paymentData);
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Get all payments
  getAllPayments: async (filters?: PaymentFilterParams) => {
    debugLog('Fetching payments with filters', filters);
    const response = await api.get('/payments', { params: filters });
    return response.data;
  },

  // Get payment statistics
  getPaymentStatistics: async (startDate?: string, endDate?: string) => {
    debugLog('Fetching payment statistics', { startDate, endDate });
    const response = await api.get('/payments/stats', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: string) => {
    debugLog('Fetching payment by ID', { id });
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Process refund (requires admin role)
  processRefund: async (id: string, reason: string, amount: number) => {
    debugLog('Processing refund', { id, reason, amount });
    const response = await api.post(`/payments/${id}/refund`, {
      reason,
      amount
    });
    return response.data;
  }
};
