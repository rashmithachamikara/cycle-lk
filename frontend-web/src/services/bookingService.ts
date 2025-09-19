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
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentInfo?: {
    method?: string;
    transactionId?: string;
    paid: boolean;
    paymentDate?: string;
  };
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
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
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
  dropoffPartnerPhone?: string;
  packageType: string;
  rating?: number;
}

export interface UserDashboardBooking {
  id: string;
  bikeName: string;
  bikeImages: string[];
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
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
        dropoffPartnerId: string
}

// Utility function to transform backend booking to partner dashboard format
export const transformBookingForPartnerDashboard = (booking: BackendBooking): PartnerDashboardBooking => {
  return {
    id: booking._id,
    paymentStatus: booking.paymentStatus || 'Unknown',
    customerName: booking.userId ? `${booking.userId.firstName} ${booking.userId.lastName}` : 'Unknown Customer',
    customerPhone: booking.userId?.phone || '',
    customerEmail: booking.userId?.email || '',
    bikeName: booking.bikeId?.name || 'Unknown Bike',
    bikeId: booking.bikeId?._id || '',
    bikeImages: booking.bikeId?.images || [],
    startDate: booking.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '',
    endDate: booking.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '',
    status: booking.status || 'unknown',
    value: booking.pricing?.total ? `$${booking.pricing.total}` : '$0',
    bookingNumber: booking.bookingNumber || '',
    pickupLocation: booking.locations?.pickup || '',
    dropoffLocation: booking.locations?.dropoff || '',
    dropoffPartner: booking.dropoffPartnerId?.companyName || 'Unknown Partner',
    dropoffPartnerId: typeof booking.dropoffPartnerId === 'string' 
      ? booking.dropoffPartnerId 
      : booking.dropoffPartnerId?._id || '',
    dropoffPartnerPhone: booking.dropoffPartnerId?.phone || '',
    packageType: booking.package?.name || '',
    rating: booking.review?.rating
  };
};

export const transformBookingForUserDashboard = (booking: BackendBooking): UserDashboardBooking => {
  console.log('Transform function input:', booking);
  
  try {
    const transformed = {
      id: booking._id || '',
      bikeImages: booking.bikeId?.images || [],
      bikeName: booking.bikeId?.name || 'Unknown Bike',
      paymentStatus: booking.paymentStatus || 'Unknown',
      startDate: booking.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '',
      endDate: booking.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '',
      status: booking.status || 'requested',
      value: booking.pricing?.total ? `$${booking.pricing.total}` : '$0',
      bookingNumber: booking.bookingNumber || '',
      pickupLocation: booking.locations?.pickup || '',
      dropoffLocation: booking.locations?.dropoff || '',
      dropoffPartner: booking.dropoffPartnerId?.companyName || 'Unknown Partner',
      dropoffPartnerPhone: booking.dropoffPartnerId?.phone || '',
      packageType: booking.package?.name || '',
      rating: booking.review?.rating,
      location: booking.locations?.pickup || '', // For backward compatibility
      partner: booking.partnerId?.companyName || 'Unknown Partner',
      partnerPhone: booking.partnerId?.phone || '',
      review: booking.review?.comment || ''
    };
    
    console.log('Transform function output:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error in transform function:', error);
    console.log('Problematic booking object:', booking);
    
    // Return a safe fallback object
    return {
      id: booking._id || 'unknown',
      paymentStatus: booking.paymentStatus || 'Unknown',
      bikeName: 'Unknown Bike',
      bikeImages: [],
      startDate: '',
      endDate: '',
      status: 'requested' as const,
      value: '$0',
      bookingNumber: '',
      pickupLocation: '',
      dropoffLocation: '',
      dropoffPartner: 'Unknown Partner',
      dropoffPartnerPhone: '',
      packageType: '',
      location: '',
      partner: 'Unknown Partner',
      partnerPhone: '',
      review: ''
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
