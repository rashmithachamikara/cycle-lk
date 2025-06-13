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

// Interface for new booking data
export interface BookingData {
  bikeId: string;
  startTime: string;
  endTime: string;
  deliveryAddress?: string;
}

// Booking service object
export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData: BookingData) => {
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
