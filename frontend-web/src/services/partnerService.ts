// frontend-web/services/partnerService.ts
import { api, ENV_CONFIG, debugLog } from '../utils/apiUtils';
import {transformBike} from './bikeService';
import { ImageFile } from '../components/PartnerRegistrationPage/types';

// Log API configuration in debug mode
debugLog('Partner Service initialized', { API_URL: ENV_CONFIG.API_URL });

// Interface for coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Interface for service location coordinates (new structure)
export interface ServiceLocationCoordinates {
  lat: number;
  lng: number;
}

// Interface for individual service location
export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  coordinates: ServiceLocationCoordinates;
  placeId?: string;
  isMainLocation?: boolean;
}

// Interface for city service data
export interface CityServiceData {
  cityName: string;
  locations: ServiceLocation[];
}

// Interface for business hours
export interface BusinessHour {
  open: string;
  close: string;
}

export interface BusinessHours {
  monday: BusinessHour;
  tuesday: BusinessHour;
  wednesday: BusinessHour;
  thursday: BusinessHour;
  friday: BusinessHour;
  saturday: BusinessHour;
  sunday: BusinessHour;
}

// Interface for partner review
export interface PartnerReview {
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

// Interface for partner images (with cloudinary support)
export interface PartnerImages {
  logo?: {
    url: string;
    publicId: string;
  };
  storefront?: {
    url: string;
    publicId: string;
  };
  gallery?: Array<{
    url: string;
    publicId: string;
  }>;
}

// Interface for map location (new structure)
export interface MapLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  isMainLocation?: boolean;
}

// Full Partner interface matching MongoDB structure
export interface Partner {
  _id: string;
  id?: string; // For frontend consistency
  userId: string;
  companyName: string;
  category?: string;
  description?: string;
  location: string; // Now ObjectId string (reference)
  // mapLocation replaces serviceCities/serviceLocations
  mapLocation?: MapLocation;
  address?: string;
  coordinates?: Coordinates; // Legacy coordinates
  contactPerson?: string;
  phone?: string;
  email?: string;
  businessHours?: BusinessHours;
  specialties?: string[];
  features?: string[];
  rating?: number;
  reviews?: PartnerReview[];
  bikeCount?: number;
  yearsActive?: number;
  images?: PartnerImages;
  verified?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

// Interface for partner registration data
export interface PartnerRegistrationData {
  userId: string;
  companyName: string;
  companyAddress: string;
  businessRegNumber: string;
  contactPhone: string;
}

// Extended interface for complete partner registration
export interface PartnerRegistrationFormData {
  userId: string;
  companyName: string;
  category?: string;
  description?: string;
  // serviceCities?: string[]; // removed
  // serviceLocations?: CityServiceData[]; // removed
  mapLocation?: MapLocation;
  location?: string;
  address: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  businessHours?: BusinessHours;
  specialties?: string[];
  features?: string[];
  yearsActive?: number;
  // Image files for upload
  logoImage?: ImageFile;
  storefrontImage?: ImageFile;
  galleryImages?: ImageFile[];
}

// Interface for bank details
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchCode: string;
}

// Interface for raw partner data from MongoDB API
export interface PartnerFromAPI {
  _id: string;
  userId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  companyName: string;
  category?: string;
  description?: string;
  location: string;
  // serviceCities?: string[]; // removed
  // serviceLocations?: CityServiceData[]; // removed
  mapLocation?: MapLocation;
  address?: string;
  coordinates?: Coordinates;
  contactPerson?: string;
  phone?: string;
  email?: string;
  businessHours?: BusinessHours;
  specialties?: string[];
  features?: string[];
  rating?: number;
  reviews?: PartnerReview[];
  bikeCount?: number;
  yearsActive?: number;
  images?: PartnerImages;
  verified?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

// Transform function to convert MongoDB partner to frontend partner
export const transformPartner = (partnerFromAPI: PartnerFromAPI): Partner => {
  return {
    ...partnerFromAPI,
    id: partnerFromAPI._id, // Add id field for frontend consistency
    userId: typeof partnerFromAPI.userId === 'string' 
      ? partnerFromAPI.userId 
      : partnerFromAPI.userId._id, // Handle populated userId
  };
};

// Helper function to create FormData with images
const createPartnerFormData = (data: PartnerRegistrationFormData): FormData => {
  const formData = new FormData();
  
  // Add text fields
  Object.keys(data).forEach(key => {
    const value = data[key as keyof PartnerRegistrationFormData];
    
    // Skip image fields - they'll be handled separately
    if (key === 'logoImage' || key === 'storefrontImage' || key === 'galleryImages') {
      return;
    }
    
    // Handle arrays and objects
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  // Add image files
  if (data.logoImage?.file) {
    formData.append('logo', data.logoImage.file);
  }
  
  if (data.storefrontImage?.file) {
    formData.append('storefront', data.storefrontImage.file);
  }
  
  if (data.galleryImages && data.galleryImages.length > 0) {
    data.galleryImages.forEach(imageFile => {
      if (imageFile.file) {
        formData.append('gallery', imageFile.file);
      }
    });
  }
  
  return formData;
};

// Helper function to format business hours for display
export const formatBusinessHours = (businessHours: BusinessHours | undefined): string => {
  if (!businessHours) return 'Contact for hours';
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const workingDays = days.filter(day => {
    const dayHours = businessHours[day as keyof BusinessHours];
    return dayHours && dayHours.open && dayHours.close;
  });
  
  if (workingDays.length === 0) return 'Closed';
  if (workingDays.length === 7) {
    // Check if all days have same hours
    const firstDayHours = businessHours[workingDays[0] as keyof BusinessHours];
    const allSameHours = workingDays.every(day => {
      const dayHours = businessHours[day as keyof BusinessHours];
      return dayHours.open === firstDayHours.open && dayHours.close === firstDayHours.close;
    });
    
    if (allSameHours) {
      return `Daily ${firstDayHours.open} - ${firstDayHours.close}`;
    }
    return 'Open daily';
  }
  
  // Check for weekdays pattern
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const isWeekdaysOnly = workingDays.length === 5 && 
    weekdays.every(day => workingDays.includes(day));
  
  if (isWeekdaysOnly) {
    const mondayHours = businessHours.monday;
    return `Mon-Fri ${mondayHours.open} - ${mondayHours.close}`;
  }
  
  return `Open ${workingDays.length} days/week`;
};

// Helper function to check if partner is currently open
export const isPartnerOpen = (businessHours: BusinessHours | undefined): boolean => {
  if (!businessHours) return false;
  
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()] as keyof BusinessHours;
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = businessHours[currentDay];
  if (!todayHours || !todayHours.open || !todayHours.close) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Partner service object
export const partnerService = {
  // Register as a partner with image upload
  registerPartner: async (partnerData: PartnerRegistrationData | PartnerRegistrationFormData) => {
    let response;
    
    // Check if this is form data with images
    if ('logoImage' in partnerData || 'storefrontImage' in partnerData || 'galleryImages' in partnerData) {
      const formData = createPartnerFormData(partnerData as PartnerRegistrationFormData);
      response = await api.post('/partners', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Regular JSON data
      response = await api.post('/partners', partnerData);
    }
    
    return transformPartner(response.data);
  },

  // Update partner with optional image upload
  updatePartner: async (id: string, updateData: Partial<PartnerRegistrationFormData>) => {
    let response;
    
    // Check if this includes image updates
    if ('logoImage' in updateData || 'storefrontImage' in updateData || 'galleryImages' in updateData) {
      const formData = createPartnerFormData(updateData as PartnerRegistrationFormData);
      response = await api.put(`/partners/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Regular JSON data
      response = await api.put(`/partners/${id}`, updateData);
    }
    
    return transformPartner(response.data);
  },

  // Delete a gallery image
  deleteGalleryImage: async (partnerId: string, imageIndex: number) => {
    const response = await api.delete(`/partners/${partnerId}/gallery/${imageIndex}`);
    return response.data;
  },

  // Get all partners
  getAllPartners: async (): Promise<Partner[]> => {
    try {
      debugLog('Fetching partners from API');
      const response = await api.get('/partners');
      console.log('Partners API response:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      // Handle different response structures
      let partnersData: PartnerFromAPI[];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        partnersData = response.data;
        console.log('Using direct array response, length:', partnersData.length);
      } else if (response.data.partners && Array.isArray(response.data.partners)) {
        // Nested in partners property
        partnersData = response.data.partners;
        console.log('Using nested partners array, length:', partnersData.length);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Nested in data property
        partnersData = response.data.data;
        console.log('Using nested data array, length:', partnersData.length);
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Invalid response format from partners API');
      }
      
      const transformedPartners = partnersData.map(transformPartner);
      console.log('Transformed partners:', transformedPartners);
      return transformedPartners;
    } catch (error) {
      console.error('Error in getAllPartners:', error);
      throw error;
    }
  },

  // Get a single partner by ID
  getPartnerById: async (id: string): Promise<Partner> => {
    const response = await api.get(`/partners/${id}`);
    return transformPartner(response.data);
  },

  // Update partner verification status (requires admin role)
  updateVerificationStatus: async (id: string, status: string) => {
    const response = await api.put(`/partners/${id}/verification`, { 
      verificationStatus: status 
    });
    return transformPartner(response.data);
  },

  // Update partner bank details (requires partner role)
  updateBankDetails: async (id: string, bankDetails: BankDetails) => {
    const response = await api.put(`/partners/${id}/bank`, bankDetails);
    return transformPartner(response.data);
  },

  // Get partner bikes
  getPartnerBikes: async (id: string) => {
    const response = await api.get(`/partners/${id}/bikes`);
    return response.data.map(transformBike);
  },

  // Get partners by location
  getPartnersByLocation: async (location: string): Promise<Partner[]> => {
    const response = await api.get(`/partners?location=${encodeURIComponent(location)}`);
    return response.data.map(transformPartner);
  },

  // Search partners
  searchPartners: async (query: string): Promise<Partner[]> => {
    const response = await api.get(`/partners/search?q=${encodeURIComponent(query)}`);
    return response.data.map(transformPartner);
  },

  // Get verified partners only
  getVerifiedPartners: async (): Promise<Partner[]> => {
    const response = await api.get('/partners?verified=true');
    return response.data.map(transformPartner);
  }
};