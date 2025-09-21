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

// Interface for initial payment request
export interface InitialPaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'mobile_payment';
  paymentDetails?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardHolderName?: string;
    bankAccount?: string;
    mobileNumber?: string;
  };
}

// Interface for payment response
export interface PaymentResponse {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  transactionId?: string;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'processing';
  message: string;
  booking?: object;
}

// Interface for pending payment booking
export interface PaymentPendingBooking {
  id: string;
  bikeName: string;
  bikeImage?: string;
  partnerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'requested' | 'confirmed' | 'active';
  bookingNumber: string;
  dueDate?: string;
}

// Payment service object
export const paymentService = {
  // Process payment
  processPayment: async (paymentData: PaymentData) => {
    debugLog('Processing payment', paymentData);
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Process initial payment for booking
  processInitialPayment: async (paymentRequest: InitialPaymentRequest): Promise<PaymentResponse> => {
    debugLog('Processing initial payment', paymentRequest);
    const response = await api.post('/payments/initial', paymentRequest);
    return response.data;
  },

  // Get pending payments for current user
  getPendingPayments: async (): Promise<PaymentPendingBooking[]> => {
    debugLog('Fetching pending payments');
    const response = await api.get('/payments/pending');
    return response.data.pendingPayments || [];
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
  },

  // Verify payment status
  verifyPayment: async (transactionId: string): Promise<PaymentResponse> => {
    debugLog('Verifying payment', { transactionId });
    const response = await api.get(`/payments/verify/${transactionId}`);
    return response.data;
  }
};
