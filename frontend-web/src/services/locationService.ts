import api from '../utils/apiUtils';

// Interface for location data
export interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  bikeCount: number;
  partnerCount: number;
  popular: boolean;
  image: string;
  region: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Location service for interacting with location-related API endpoints
 */
export const locationService = {
  /**
   * Get all locations
   * @returns Promise with array of locations
   */
  getAllLocations: async (): Promise<Location[]> => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  /**
   * Get location by ID
   * @param id - Location ID
   * @returns Promise with location data
   */
  getLocationById: async (id: string): Promise<Location> => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching location with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search locations by query string
   * @param query - Search term for location name, city or province
   * @returns Promise with array of matching locations
   */
  searchLocations: async (query: string): Promise<Location[]> => {
    try {
      const response = await api.get('/locations/search', { params: { query } });
      return response.data;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  },

  /**
   * Get popular locations
   * @returns Promise with array of popular locations
   */
  getPopularLocations: async (): Promise<Location[]> => {
    try {
      const response = await api.get('/locations', { params: { popular: true } });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      throw error;
    }
  }
};
