import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Interface for coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
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

// Interface for partner images
export interface PartnerImages {
  logo?: string;
  storefront?: string;
  gallery?: string[];
}

// Full Partner interface matching MongoDB structure
export interface Partner {
  _id: string;
  id?: string; // For frontend consistency
  userId: string;
  companyName: string;
  category?: string;
  description?: string;
  location: string;
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

// Interface for partner registration data
export interface PartnerRegistrationData {
  userId: string;
  companyName: string;
  companyAddress: string;
  businessRegNumber: string;
  contactPhone: string;
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
  userId: string;
  companyName: string;
  category?: string;
  description?: string;
  location: string;
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
  };
};

// Mock data for development/testing
const mockPartners: PartnerFromAPI[] = [
  {
    _id: "64f2a3b4c5d6e7f8a9b0c1d2",
    userId: "64f1a2b3c4d5e6f7a8b9c0d1",
    companyName: "Galle Fort Cycles",
    category: "Premium",
    description: "Premium bike rental service in historic Galle Fort with guided tours and high-end bikes.",
    location: "Galle",
    address: "42 Church Street, Galle Fort, Galle 80000",
    coordinates: {
      latitude: 6.0329,
      longitude: 80.2168
    },
    contactPerson: "Nimal Perera",
    phone: "+94912234567",
    email: "info@gallefortcycles.lk",
    businessHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "18:00" },
      saturday: { open: "08:00", close: "19:00" },
      sunday: { open: "08:00", close: "19:00" }
    },
    specialties: ["Heritage Tours", "Sunset Rides", "Photography Tours"],
    features: ["24/7 Support", "Free Delivery", "Guided Tours", "Professional Maintenance"],
    rating: 4.8,
    reviews: [
      {
        userId: "64f1a2b3c4d5e6f7a8b9c0d1",
        rating: 5,
        comment: "Excellent service and beautiful bikes! The heritage tour was amazing.",
        date: "2025-05-20T16:30:00.000Z"
      }
    ],
    bikeCount: 25,
    yearsActive: 5,
    images: {
      logo: "https://images.cycleLK.com/partners/galle_fort_cycles_logo.jpg",
      storefront: "https://images.cycleLK.com/partners/galle_fort_cycles_store.jpg",
      gallery: [
        "https://images.cycleLK.com/partners/galle_fort_cycles_1.jpg",
        "https://images.cycleLK.com/partners/galle_fort_cycles_2.jpg"
      ]
    },
    verified: true,
    status: "active",
    createdAt: "2024-09-01T12:00:00.000Z",
    updatedAt: "2025-06-01T10:00:00.000Z"
  },
  {
    _id: "64f2a3b4c5d6e7f8a9b0c1d3",
    userId: "64f1a2b3c4d5e6f7a8b9c0d2",
    companyName: "Colombo City Bikes",
    category: "Urban",
    description: "Modern bike rental service in Colombo with electric bikes and city tour packages.",
    location: "Colombo",
    address: "123 Galle Road, Colombo 03",
    phone: "+94112345678",
    email: "info@colombocitybikes.lk",
    specialties: ["City Tours", "Electric Bikes", "Business Rentals"],
    features: ["GPS Tracking", "Mobile App", "24/7 Support"],
    rating: 4.5,
    bikeCount: 40,
    yearsActive: 3,
    verified: true,
    status: "active"
  }
];

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
  // Register as a partner
  registerPartner: async (partnerData: PartnerRegistrationData) => {
    const response = await axios.post(`${API_URL}/partners`, partnerData);
    return transformPartner(response.data);
  },

  // Get all partners
  getAllPartners: async (): Promise<Partner[]> => {
    try {
      const response = await axios.get(`${API_URL}/partners`);
      console.log('Partners API response:', response.data); // Debug log
      
      // Handle different response structures
      let partnersData: PartnerFromAPI[];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        partnersData = response.data;
      } else if (response.data.partners && Array.isArray(response.data.partners)) {
        // Nested in partners property
        partnersData = response.data.partners;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Nested in data property
        partnersData = response.data.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Invalid response format from partners API');
      }
      
      return partnersData.map(transformPartner);
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data for development
      return mockPartners.map(transformPartner);
    }
  },

  // Get a single partner by ID
  getPartnerById: async (id: string): Promise<Partner> => {
    const response = await axios.get(`${API_URL}/partners/${id}`);
    return transformPartner(response.data);
  },

  // Update partner verification status (requires admin role)
  updateVerificationStatus: async (id: string, status: string) => {
    const response = await axios.put(`${API_URL}/partners/${id}/verification`, { 
      verificationStatus: status 
    });
    return transformPartner(response.data);
  },

  // Update partner bank details (requires partner role)
  updateBankDetails: async (id: string, bankDetails: BankDetails) => {
    const response = await axios.put(`${API_URL}/partners/${id}/bank`, bankDetails);
    return transformPartner(response.data);
  },

  // Get partner bikes
  getPartnerBikes: async (id: string) => {
    const response = await axios.get(`${API_URL}/partners/${id}/bikes`);
    return response.data;
  },

  // Get partners by location
  getPartnersByLocation: async (location: string): Promise<Partner[]> => {
    const response = await axios.get(`${API_URL}/partners?location=${encodeURIComponent(location)}`);
    return response.data.map(transformPartner);
  },

  // Search partners
  searchPartners: async (query: string): Promise<Partner[]> => {
    const response = await axios.get(`${API_URL}/partners/search?q=${encodeURIComponent(query)}`);
    return response.data.map(transformPartner);
  },

  // Get verified partners only
  getVerifiedPartners: async (): Promise<Partner[]> => {
    const response = await axios.get(`${API_URL}/partners?verified=true`);
    return response.data.map(transformPartner);
  }
};
