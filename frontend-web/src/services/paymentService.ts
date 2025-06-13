import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

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
    const response = await axios.post(`${API_URL}/payments`, paymentData);
    return response.data;
  },

  // Get all payments
  getAllPayments: async (filters?: PaymentFilterParams) => {
    const response = await axios.get(`${API_URL}/payments`, { params: filters });
    return response.data;
  },

  // Get payment statistics
  getPaymentStatistics: async (startDate?: string, endDate?: string) => {
    const response = await axios.get(`${API_URL}/payments/stats`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: string) => {
    const response = await axios.get(`${API_URL}/payments/${id}`);
    return response.data;
  },

  // Process refund (requires admin role)
  processRefund: async (id: string, reason: string, amount: number) => {
    const response = await axios.post(`${API_URL}/payments/${id}/refund`, {
      reason,
      amount
    });
    return response.data;
  }
};
