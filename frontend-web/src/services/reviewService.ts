import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

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
    const response = await axios.get(`${API_URL}/reviews`, { params: filters });
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: ReviewData) => {
    const response = await axios.post(`${API_URL}/reviews`, reviewData);
    return response.data;
  }
};
