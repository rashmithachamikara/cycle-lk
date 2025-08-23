//frontend-web/src/services/bikeService.ts
import api from '../utils/apiUtils';
import { Partner } from './partnerService'; // Import comprehensive Partner interface

// Interface for bike filter parameters
export interface BikeFilterParams {
  location?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string; // 'available' | 'unavailable' | 'requested'
  partnerId?: string;
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
  name: string;
  type: string;
  description?: string;
  location: string;
  coordinates?: BikeCoordinates;
  pricing: BikePricing;
  features?: string[];
  specifications?: BikeSpecifications;
  images?: BikeImage[];
  availability?: BikeAvailability;
  condition?: string;
  rating?: number;
  reviews?: BikeReview[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface for bike data (frontend format)
export interface Bike {
  id: string;
  partnerId: string;
  partner?: Partner; // Separated partner object for frontend use
  name: string;
  type: string;
  description?: string;
  location: string;
  coordinates?: BikeCoordinates;
  pricing: BikePricing;
  features?: string[];
  specifications?: BikeSpecifications;
  images?: BikeImage[];
  availability?: BikeAvailability;
  condition?: string;
  rating?: number;
  reviews?: BikeReview[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface for bike data when creating/updating
export interface BikeData {
  name: string;
  type: string;
  brand?: string;
  model?: string;
  pricing: BikePricing;
  specifications?: BikeSpecifications;
  description?: string;
  location: string;
  coordinates?: BikeCoordinates;
  features?: string[];
  condition?: string;
}

// Transform function to convert MongoDB _id to id
export const transformBike = (bikeFromAPI: BikeFromAPI): Bike => {
  const { _id, partnerId, ...rest } = bikeFromAPI;
  
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
  
  return {
    id: _id,
    partnerId: partnerIdString,
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

  getMyBikes: async (): Promise<Bike[]> => {
    const response = await api.get('/bikes/my');
    return response.data.map(transformBike);
  },

  // // Add a new bike (requires partner role)
  // addBike: async (bikeData: BikeData) => {
  //   const response = await api.post('/bikes', bikeData);
  //   return response.data;
  // },

  // Add a new bike (requires partner role)
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
  updateBikeAvailability: async (id: string, status: string, unavailableDates?: string[]) => {
    const response = await api.put(`/bikes/${id}/availability`, {
      status,
      unavailableDates
    });
    return response.data;
  },

  // Delete a bike (requires partner role)
  deleteBike: async (id: string) => {
    const response = await api.delete(`/bikes/${id}`);
    return response.data;
  }
};