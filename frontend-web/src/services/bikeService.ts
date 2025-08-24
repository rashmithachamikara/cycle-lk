//frontend-web/src/services/bikeService.ts
import api from '../utils/apiUtils';
import { Partner } from './partnerService'; // Import comprehensive Partner interface

// Enum for bike types (matching backend model)
export const BikeTypes = [
  'city',
  'mountain', 
  'road',
  'hybrid',
  'electric',
  'touring',
  'folding',
  'cruiser'
] as const;

export type BikeType = typeof BikeTypes[number];

// Enum for bike conditions (matching backend model)
export const BikeConditions = [
  'excellent',
  'good', 
  'fair'
] as const;

export type BikeCondition = typeof BikeConditions[number];

// Interface for bike filter parameters
export interface BikeFilterParams {
  location?: string;
  type?: BikeType;
  minPrice?: number;
  maxPrice?: number;
  availability?: string; // 'available' | 'unavailable' | 'requested'
  partnerId?: string;
  currentPartnerId?: string;
  limit?: number;
  sort?: 'price-asc' | 'price-desc' | 'rating';
}

// Interface for bike specifications
export interface BikeSpecifications {
  frameSize?: string;
  weight?: string;
  gears?: string;
  ageRestriction?: string;
  maxLoad?: string;
  brakeType?: string;
  tireSize?: string;
  gearSystem?: string;
  [key: string]: string | undefined;
}

// Interface for bike pricing
export interface BikePricing {
  perDay: number;
  perWeek?: number;
  perMonth?: number;
  perHour?: number;
  deliveryFee?: number;
}

// Interface for bike coordinates
export interface BikeCoordinates {
  latitude: number;
  longitude: number;
}

// Interface for bike availability
export interface BikeAvailability {
  status: string; // 'available' | 'unavailable' | 'requested'
  reason?: string;
  unavailableDates?: string[];
}

// Interface for bike review
export interface BikeReview {
  userId: string;
  bookingId?: string;
  rating: number;
  comment: string;
  date: string;
  helpful?: number;
}


// Define a specific interface for the image object
export interface BikeImage {
  url: string;
  publicId: string;
  _id?: string; // Mongoose might add an _id to subdocuments
}



// Partner interface is imported from partnerService

// Interface for bike from API (with MongoDB _id)
export interface BikeFromAPI {
  _id: string;
  partnerId: string | Partner; // Can be either string ID or populated partner object
  currentPartnerId?: string | CurrentPartnerId; // Current partner holding the bike
  name: string;
  type: BikeType;
  description?: string;
  location?: string; // Derived from currentPartnerId's location
  coordinates?: BikeCoordinates;
  pricing: BikePricing;
  features?: string[];
  specifications?: BikeSpecifications;
  images?: BikeImage[];
  availability?: BikeAvailability;
  condition?: BikeCondition;
  rating?: number;
  reviews?: BikeReview[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface for bike data (frontend format)
export interface Bike {
  id: string;
  partnerId: string;
  currentPartnerId?: string | CurrentPartnerId; // Current partner holding the bike
  partner?: Partner; // Separated partner object for frontend use
  name: string;
  type: BikeType;
  description?: string;
  location?: string; // Derived from currentPartnerId's location
  coordinates?: BikeCoordinates;
  pricing: BikePricing;
  features?: string[];
  specifications?: BikeSpecifications;
  images?: BikeImage[];
  availability?: BikeAvailability;
  condition?: BikeCondition;
  rating?: number;
  reviews?: BikeReview[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrentPartnerId {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  location?: string | {
    _id: string;
    name: string;
  };
}

// Interface for bike data when creating/updating
export interface BikeData {
  name: string;
  type: BikeType;
  brand?: string;
  model?: string;
  pricing: BikePricing;
  specifications?: BikeSpecifications;
  description?: string;
  coordinates?: BikeCoordinates;
  features?: string[];
  condition?: BikeCondition;
  availability?: BikeAvailability;
}

// Transform function to convert MongoDB _id to id
export const transformBike = (bikeFromAPI: BikeFromAPI): Bike => {
  const { _id, partnerId, currentPartnerId, ...rest } = bikeFromAPI;
  
  // Handle populated partner data
  let partnerIdString: string;
  let partnerData: Partner | undefined;
  
  if (typeof partnerId === 'object' && partnerId !== null) {
    // partnerId is populated with partner object
    partnerIdString = partnerId._id;
    partnerData = partnerId;
  } else {
    // partnerId is just a string
    partnerIdString = partnerId;
  }

  // Handle currentPartnerId
  let currentPartnerIdValue: string | CurrentPartnerId | undefined;
  if (typeof currentPartnerId === 'object' && currentPartnerId !== null) {
    currentPartnerIdValue = currentPartnerId;
  } else if (typeof currentPartnerId === 'string') {
    currentPartnerIdValue = currentPartnerId;
  }
  
  return {
    id: _id,
    partnerId: partnerIdString,
    currentPartnerId: currentPartnerIdValue,
    partner: partnerData,
    ...rest
  };
};

// Bike service object
export const bikeService = {
  // Get all bikes with optional filters
  getAllBikes: async (filters?: BikeFilterParams): Promise<Bike[]> => {
    const response = await api.get('/bikes', { params: filters });
    return response.data.map(transformBike);
  },

  // Get a single bike by ID
  getBikeById: async (id: string): Promise<Bike> => {
    const response = await api.get(`/bikes/${id}`);
    return transformBike(response.data);
  },

  // Get bikes for the authenticated partner
  getMyBikes: async (): Promise<Bike[]> => {
    const response = await api.get('/bikes/my');
    return response.data.map(transformBike);
  },

  // Get bikes by partner ID
  getBikesByPartner: async (partnerId: string): Promise<Bike[]> => {
    const response = await api.get(`/bikes/by-partner/${partnerId}`);
    return response.data.map(transformBike);
  },

  // Get featured bikes
  getFeaturedBikes: async (limit?: number): Promise<Bike[]> => {
    const response = await api.get('/bikes/featured', { params: { limit } });
    return response.data.map(transformBike);
  },

  // Add a new bike (requires partner role) with file upload support
  addBike: async (bikeData: FormData) => {
    const response = await api.post('/bikes', bikeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

    
  // Update a bike (requires partner role)
  updateBike: async (id: string, bikeData: Partial<BikeData>) => {
    const response = await api.put(`/bikes/${id}`, bikeData);
    return transformBike(response.data);
  },

  // Upload bike images (requires partner role)
  uploadBikeImages: async (id: string, imageFiles: File[]) => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    const response = await api.post(`/bikes/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update bike availability (requires partner role)
  updateBikeAvailability: async (id: string, status: string, reason?: string, unavailableDates?: string[]) => {
    const response = await api.put(`/bikes/${id}/availability`, {
      status,
      reason,
      unavailableDates
    });
    return response.data;
  },

  // Delete a bike (requires partner role)
  deleteBike: async (id: string) => {
    const response = await api.delete(`/bikes/${id}`);
    return response.data;
  },

  // Get available bikes for a specific location ID (optimized)
  getAvailableBikesForLocation: async (locationId: string, filters?: {
    type?: BikeType;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    sort?: 'price-asc' | 'price-desc' | 'rating';
  }): Promise<Bike[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort) params.append('sort', filters.sort);

      const queryString = params.toString();
      const url = `/bikes/location/${locationId}/available${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data.map(transformBike);
    } catch (error) {
      console.error('Error fetching available bikes for location:', error);
      throw error;
    }
  },

  // Legacy method using partners service (kept for backward compatibility)
  getAvailableBikesForLocationLegacy: async (locationId: string): Promise<Bike[]> => {
    try {
      // First, get all partners for this location
      const { partnerService } = await import('./partnerService');
      const partners = await partnerService.getPartnersByLocationId(locationId);
      
      if (partners.length === 0) {
        return [];
      }

      // Get all available bikes for all partners at this location
      const allBikesPromises = partners.map(partner => 
        bikeService.getAllBikes({
          currentPartnerId: partner._id,
          availability: 'available'
        })
      );

      const bikesArrays = await Promise.all(allBikesPromises);
      
      // Flatten the array and remove duplicates
      const allAvailableBikes = bikesArrays.flat();
      
      // Remove duplicates based on bike ID
      const uniqueBikes = allAvailableBikes.filter((bike, index, array) => 
        array.findIndex(b => b.id === bike.id) === index
      );

      return uniqueBikes;
    } catch (error) {
      console.error('Error fetching available bikes for location:', error);
      throw error;
    }
  }
};