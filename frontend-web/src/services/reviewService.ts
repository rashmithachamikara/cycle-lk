import { api, debugLog } from '../utils/apiUtils';

// Log service initialization in debug mode
debugLog('Review Service initialized');

// Interface for review filter parameters
export interface ReviewFilterParams {
  bikeId?: string;
  userId?: string;
  rating?: number;
  sort?: 'latest' | 'rating-high' | 'rating-low';
}

// Interface for review data
export interface ReviewData {
  bikeId: string;
  bookingId: string;
  rating: number;
  comment: string;
}

// Review service object
export const reviewService = {
  // Get all reviews with optional filters
  getAllReviews: async (filters?: ReviewFilterParams) => {
    debugLog('Fetching reviews with filters', filters);
    const response = await api.get('/reviews', { params: filters });
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: ReviewData) => {
    debugLog('Creating new review', reviewData);
    const response = await api.post('/reviews', reviewData);
    return response.data;
  }
};
