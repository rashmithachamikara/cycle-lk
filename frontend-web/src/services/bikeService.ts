//frontend-web/src/services/bikeService.ts
import api from '../utils/apiUtils';

// Interface for bike filter parameters
export interface BikeFilterParams {
  location?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  partnerId?: string;
  limit?: number;
  sort?: 'price-asc' | 'price-desc' | 'rating';
}

// Interface for bike specifications
export interface BikeSpecifications {
  frameSize?: string;
  gears?: string;
  brakes?: string;
  [key: string]: string | undefined;
}

// Interface for bike pricing
export interface BikePricing {
  perHour: number;
  perDay: number;
  deliveryFee?: number;
}

// Interface for bike data
export interface BikeData {
  name: string;
  type: string;
  brand: string;
  model: string;
  pricing: BikePricing;
  specifications?: BikeSpecifications;
  description?: string;
  location: string;
}

// Bike service object
export const bikeService = {
  // Get all bikes with optional filters
  getAllBikes: async (filters?: BikeFilterParams) => {
    const response = await api.get('/bikes', { params: filters });
    return response.data;
  },

  // Get a single bike by ID
  getBikeById: async (id: string) => {
    const response = await api.get(`/bikes/${id}`);
    return response.data;
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
    return response.data;
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
  updateBikeAvailability: async (id: string, status: boolean, unavailableDates?: string[]) => {
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