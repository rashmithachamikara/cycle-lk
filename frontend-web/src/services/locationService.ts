import api from '../utils/apiUtils';

// Interface for location data from API (with _id)
interface LocationFromAPI {
  _id: string;
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

// Interface for location data (with id for frontend)
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

// Helper function to transform API response
const transformLocation = (apiLocation: LocationFromAPI): Location => ({
  id: apiLocation._id,
  name: apiLocation.name,
  description: apiLocation.description,
  coordinates: apiLocation.coordinates,
  bikeCount: apiLocation.bikeCount,
  partnerCount: apiLocation.partnerCount,
  popular: apiLocation.popular,
  image: apiLocation.image,
  region: apiLocation.region,
  createdAt: apiLocation.createdAt,
  updatedAt: apiLocation.updatedAt,
});

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
      const apiLocations: LocationFromAPI[] = response.data;
      return apiLocations.map(transformLocation);
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
      const apiLocation: LocationFromAPI = response.data;
      return transformLocation(apiLocation);
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
      const apiLocations: LocationFromAPI[] = response.data;
      return apiLocations.map(transformLocation);
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
      const apiLocations: LocationFromAPI[] = response.data;
      return apiLocations.map(transformLocation);
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      throw error;
    }
  }
};
