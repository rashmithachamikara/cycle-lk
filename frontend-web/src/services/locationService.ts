import api from '../utils/apiUtils';

// Interface for location data
export interface Location {
  id: string;
  name: string;
  region: string;
  image:string;
  description: string,
  coordinates: {
    latitude: number;
    longitude: number;
  };
  bikeCount: number;
  partnerCount: number;
}

// Location service object
export const locationService = {
  // Get all locations
  getAllLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },

  // Search locations by query
  searchLocations: async (query: string) => {
    const response = await api.get('/locations/search', { params: { query } });
    return response.data;
  }
};
