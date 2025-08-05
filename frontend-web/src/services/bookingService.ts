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
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bikeName: string;
  bikeId: string;
  startDate: string;
  endDate: string;
  status: 'requested' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  value: string;
  bookingNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  packageType: string;
  rating?: number;
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
        deliveryAddress?: string 
}

// Utility function to transform backend booking to partner dashboard format
export const transformBookingForPartnerDashboard = (booking: BackendBooking): PartnerDashboardBooking => {
  return {
    id: booking._id,
    customerName: `${booking.userId.firstName} ${booking.userId.lastName}`,
    customerPhone: booking.userId.phone,
    customerEmail: booking.userId.email,
    bikeName: booking.bikeId.name,
    bikeId: booking.bikeId._id,
    startDate: new Date(booking.dates.startDate).toLocaleDateString(),
    endDate: new Date(booking.dates.endDate).toLocaleDateString(),
    status: booking.status,
    value: `$${booking.pricing.total}`,
    bookingNumber: booking.bookingNumber,
    pickupLocation: booking.locations.pickup,
    dropoffLocation: booking.locations.dropoff,
    packageType: booking.package.name,
    rating: booking.review?.rating
  };
};

// Booking service object
export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: CreateBookingRequest) => {
    const response = await api.post('/bookings', bookingData);
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
