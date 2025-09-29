import api from '../utils/apiUtils';

// Interface for booking filter parameters
export interface BookingFilterParams {
  userId?: string;
  bikeId?: string;
  partnerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Interface for additional charges
export interface AdditionalCharge {
  type: 'damage' | 'cleaning' | 'late_return' | 'fuel' | 'other';
  description: string;
  amount: number;
}

// Interface for payment information
export interface PaymentInfo {
  paymentId?: string;
  amount?: number;
  percentage?: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paidAt?: string;
  stripeSessionId?: string;
  additionalCharges?: AdditionalCharge[];
}

// Interface for booking payments
export interface BookingPayments {
  initial: PaymentInfo;
  remaining: PaymentInfo;
}

// Interface for legacy payment info
export interface LegacyPaymentInfo {
  method?: string;
  transactionId?: string;
  paid: boolean;
  paymentDate?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

// Interface for payment summary (virtual field)
export interface PaymentSummary {
  initialPaid: boolean;
  remainingPaid: boolean;
  isFullyPaid: boolean;
  totalPaid: number;
  totalAdditionalCharges: number;
  nextPaymentDue: 'initial' | 'remaining' | null;
}

// Interface for booking data from backend (matches Booking model)
export interface BackendBooking {
  _id: string;
  bookingNumber: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bikeId: {
    _id: string;
    name: string;
    type: string;
    brand: string;
    model: string;
    images: string[];
    pricing: {
      perHour: number;
      perDay: number;
      deliveryFee?: number;
    };
    location: string;
  };
  partnerId: {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
    location: string;
  };
  currentBikePartnerId?: {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
    location: string;
  };
  package: {
    id: 'day' | 'week' | 'month';
    name: string;
    features: string[];
  };
  pricing: {
    basePrice: number;
    insurance: number;
    extras: number;
    discount: number;
    total: number;
    currency: string;
  };
  dates: {
    startDate: string;
    endDate: string;
    bookingDate: string;
  };
  locations: {
    pickup: string;
    dropoff: string;
  };
  dropoffPartnerId: {
    _id: string;
    companyName: string;
    email: string;
    phone: string;
    location: string;
  };
  status: 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'partial_paid' | 'fully_paid' | 'refunded' | 'failed';
  payments: BookingPayments;
  paymentInfo?: LegacyPaymentInfo;
  paymentSummary?: PaymentSummary;
  review?: {
    rating?: number;
    comment?: string;
    date?: string;
  };
  qrCode?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for partner dashboard booking display
export interface PartnerDashboardBooking {
  id: string;
  paymentStatus: 'pending' | 'processing' | 'partial_paid' | 'fully_paid' | 'refunded' | 'failed';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bikeName: string;
  bikeId: string;
  bikeImages: string[];
  startDate: string;
  endDate: string;
  status: 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  value: string;
  bookingNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  dropoffPartner?: string;
  dropoffPartnerId?: string;
  currentBikePartnerId?: string;
  currentBikePartnerName?: string;
  dropoffPartnerPhone?: string;
  packageType: string;
  rating?: number;
  paymentSummary?: {
    initialPaid: boolean;
    remainingPaid: boolean;
    isFullyPaid: boolean;
    totalPaid: number;
    nextPaymentDue: 'initial' | 'remaining' | null;
  };
}

export interface UserDashboardBooking {
  id: string;
  bikeName: string;
  bikeImages: string[];
  paymentStatus: 'pending' | 'processing' | 'partial_paid' | 'fully_paid' | 'refunded' | 'failed';
  startDate: string;
  endDate: string;
  status: 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  value: string;
  bookingNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  dropoffPartner?: string;
  dropoffPartnerPhone?: string;
  packageType: string;
  rating?: number;
  location?: string; // For backward compatibility
  partner?: string; // Partner name
  partnerPhone?: string; // Partner phone
  review?: string; // User review text
  paymentSummary?: {
    initialPaid: boolean;
    remainingPaid: boolean;
    isFullyPaid: boolean;
    totalPaid: number;
    nextPaymentDue: 'initial' | 'remaining' | null;
  };
}

// Interface for new booking data
export interface BookingData {
  bikeId: string;
  package: {
    id: 'day' | 'week' | 'month';
    name: string;
    features: string[];
  };
  dates: {
    startDate: string;
    endDate: string;
  };
  locations: {
    pickup: string;
    dropoff: string;
  };
}

export interface CreateBookingRequest{
        bikeId: string,
        startTime: string,
        endTime: string,
        deliveryAddress?: string,
        pickupLocation?: string,
        dropoffLocation?: string,
        dropoffPartnerId: string,
        totalAmount: number
}

// Utility function to transform backend booking to partner dashboard format
export const transformBookingForPartnerDashboard = (booking: BackendBooking): PartnerDashboardBooking => {
  return {
    id: booking._id,
    paymentStatus: booking.paymentStatus || 'pending',
    customerName: booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : 'Unknown Customer',
    customerPhone: booking.userId?.phone || '',
    customerEmail: booking.userId?.email || '',
    bikeName: booking.bikeId?.name || 'Unknown Bike',
    bikeId: booking.bikeId?._id || '',
    bikeImages: booking.bikeId?.images || [],
    startDate: booking.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '',
    endDate: booking.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '',
    status: booking.status || 'requested',
    value: booking.pricing?.total ? `LKR ${booking.pricing.total}` : 'LKR 0',
    bookingNumber: booking.bookingNumber || '',
    pickupLocation: booking.locations?.pickup || '',
    dropoffLocation: booking.locations?.dropoff || '',
    dropoffPartner: booking.dropoffPartnerId?.companyName || 'Unknown Partner',
    dropoffPartnerId: typeof booking.dropoffPartnerId === 'string' 
      ? booking.dropoffPartnerId 
      : booking.dropoffPartnerId?._id || '',
    currentBikePartnerId: typeof booking.currentBikePartnerId === 'string'
      ? booking.currentBikePartnerId
      : booking.currentBikePartnerId?._id || '',
    currentBikePartnerName: booking.currentBikePartnerId?.companyName || '',
    dropoffPartnerPhone: booking.dropoffPartnerId?.phone || '',
    packageType: booking.package?.name || '',
    rating: booking.review?.rating,
    paymentSummary: booking.paymentSummary || {
      initialPaid: booking.payments?.initial?.status === 'completed',
      remainingPaid: booking.payments?.remaining?.status === 'completed',
      isFullyPaid: booking.payments?.initial?.status === 'completed' && booking.payments?.remaining?.status === 'completed',
      totalPaid: (booking.payments?.initial?.status === 'completed' ? booking.payments?.initial?.amount || 0 : 0) +
                 (booking.payments?.remaining?.status === 'completed' ? booking.payments?.remaining?.amount || 0 : 0),
      nextPaymentDue: booking.payments?.initial?.status !== 'completed' ? 'initial' : 
                      (booking.payments?.remaining?.status !== 'completed' ? 'remaining' : null)
    }
  };
};

export const transformBookingForUserDashboard = (booking: BackendBooking): UserDashboardBooking => {
  console.log('Transform function input:', booking);
  
  try {
    const transformed = {
      id: booking._id || '',
      bikeImages: booking.bikeId?.images || [],
      bikeName: booking.bikeId?.name || 'Unknown Bike',
      paymentStatus: booking.paymentStatus || 'pending',
      startDate: booking.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '',
      endDate: booking.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '',
      status: booking.status || 'requested',
      value: booking.pricing?.total ? `LKR ${booking.pricing.total}` : 'LKR 0',
      bookingNumber: booking.bookingNumber || '',
      pickupLocation: booking.locations?.pickup || '',
      dropoffLocation: booking.locations?.dropoff || '',
      dropoffPartner: booking.dropoffPartnerId?.companyName || 'Unknown Partner',
      dropoffPartnerPhone: booking.dropoffPartnerId?.phone || '',
      currentBikePartnerId: typeof booking.currentBikePartnerId === 'string'
        ? booking.currentBikePartnerId
        : booking.currentBikePartnerId?._id || '',
      currentBikePartnerName: booking.currentBikePartnerId?.companyName || '',
      packageType: booking.package?.name || '',
      rating: booking.review?.rating,
      location: booking.locations?.pickup || '', // For backward compatibility
      partner: booking.partnerId?.companyName || 'Unknown Partner',
      partnerPhone: booking.partnerId?.phone || '',
      review: booking.review?.comment || '',
      paymentSummary: booking.paymentSummary || {
        initialPaid: booking.payments?.initial?.status === 'completed',
        remainingPaid: booking.payments?.remaining?.status === 'completed',
        isFullyPaid: booking.payments?.initial?.status === 'completed' && booking.payments?.remaining?.status === 'completed',
        totalPaid: (booking.payments?.initial?.status === 'completed' ? booking.payments?.initial?.amount || 0 : 0) +
                   (booking.payments?.remaining?.status === 'completed' ? booking.payments?.remaining?.amount || 0 : 0),
        nextPaymentDue: booking.payments?.initial?.status !== 'completed' ? 'initial' : 
                        (booking.payments?.remaining?.status !== 'completed' ? 'remaining' : null)
      }
    };
    
    console.log('Transform function output:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error in transform function:', error);
    console.log('Problematic booking object:', booking);
    
    // Return a safe fallback object
    return {
      id: booking._id || 'unknown',
      paymentStatus: booking.paymentStatus || 'pending',
      bikeName: 'Unknown Bike',
      bikeImages: [],
      startDate: '',
      endDate: '',
      status: 'requested' as const,
      value: 'LKR 0',
      bookingNumber: '',
      pickupLocation: '',
      dropoffLocation: '',
      dropoffPartner: 'Unknown Partner',
      dropoffPartnerPhone: '',
      packageType: '',
      location: '',
      partner: 'Unknown Partner',
      partnerPhone: '',
      review: '',
      paymentSummary: {
        initialPaid: false,
        remainingPaid: false,
        isFullyPaid: false,
        totalPaid: 0,
        nextPaymentDue: 'initial'
      }
    };
  }
};

// Booking service object
export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: CreateBookingRequest) => {
    const response = await api.post('/bookings', bookingData, {
      timeout: 30000 // 30 seconds timeout for booking creation
    });
    return response.data;
  },

  // Get all bookings with optional filters
  getAllBookings: async (filters?: BookingFilterParams) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  // Get a single booking by ID
  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  getBookingsByPartnerId: async (partnerId: string) => {
    const response = await api.get(`/bookings/partner/${partnerId}`);
    return response.data;
  },

  // Get all AVAILABLE PICKUP bookings for the authenticated partner
  getMyPickupBookings: async () => {
    console.log('Frontend calling getMyPickupBookings - URL: /bookings/my-pickup-bookings');
    const response = await api.get('/bookings/my-pickup-bookings');
    return response.data;
  },

  // Get bookings for the authenticated partner
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  // Get dropoff bookings for the authenticated partner (where they are the dropoff partner)
  getDropoffBookings: async (): Promise<PartnerDashboardBooking[]> => {
    const response = await api.get('/bookings/dropoff-bookings');
    const backendBookings: BackendBooking[] = response.data;
    return backendBookings.map(transformBookingForPartnerDashboard);
  },

  // Update booking status (requires partner/admin role)
  updateBookingStatus: async (id: string, status: string) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  }
};
