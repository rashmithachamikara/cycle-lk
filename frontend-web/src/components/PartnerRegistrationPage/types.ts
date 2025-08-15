// // frontend-web/components/PartnerRegistrationPage/types.ts
// import { type BusinessHours } from '../../services/partnerService';

// // Service location interface for individual service stations
// export interface ServiceLocation {
//   id: string;
//   name: string;
//   address: string;
//   coordinates: {
//     lat: number;
//     lng: number;
//   };
//   placeId?: string;
//   isMainLocation?: boolean;
// }

// // City with multiple service locations
// export interface CityServiceData {
//   cityName: string;
//   locations: ServiceLocation[];
// }

// export interface PartnerRegistrationForm {
//   // User fields for non-authenticated users
//   firstName: string;
//   lastName: string;
//   userEmail: string;
//   userPhone: string;
//   password: string;
//   confirmPassword: string;
//   // Partner fields
//   companyName: string;
//   category: string;
//   description: string;
//   // Updated location system
//   serviceCities: string[]; // Cities where they provide services
//   serviceLocations: CityServiceData[]; // Detailed locations for each city
//   // Contact information
//   address: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   businessHours: BusinessHours;
//   specialties: string[];
//   features: string[];
//   yearsActive: number;
// }

// export interface StepProps {
//   formData: PartnerRegistrationForm;
//   onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
//   onServiceCitiesChange: (cities: string[]) => void;
//   onServiceLocationsChange: (locations: CityServiceData[]) => void;
//   onBusinessHourChange: (day: keyof BusinessHours, field: 'open' | 'close', value: string) => void;
//   onArrayFieldChange: (field: 'specialties' | 'features', value: string) => void;
//   isUserAuthenticated: boolean;
// }

// export interface StepIndicatorProps {
//   currentStep: number;
//   totalSteps: number;
//   stepLabels: string[];
// }

// export interface RegistrationSuccessProps {
//   onClose?: () => void;
// }






// frontend-web/components/PartnerRegistrationPage/types.ts

import { type BusinessHours } from '../../services/partnerService';

// Service location interface for individual service stations
export interface ServiceLocation {
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

// City with multiple service locations
export interface CityServiceData {
  cityName: string;
  locations: ServiceLocation[];
}

// Location data from Google Maps
export interface LocationData {
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  formattedAddress?: string;
  types?: string[];
  name?: string;
}

// Partner registration form interface
export interface PartnerRegistrationForm {
  // User fields for non-authenticated users
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  password: string;
  confirmPassword: string;
  // Partner fields
  companyName: string;
  category: string;
  description: string;
  // Updated location system
  serviceCities: string[]; // Cities where they provide services
  serviceLocations: CityServiceData[]; // Detailed locations for each city
  // Contact information
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessHours: BusinessHours;
  specialties: string[];
  features: string[];
  yearsActive: number;
}

// Step component props interface
export interface StepProps {
  formData: PartnerRegistrationForm;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onServiceCitiesChange: (cities: string[]) => void;
  onServiceLocationsChange: (locations: CityServiceData[]) => void;
  onBusinessHourChange: (day: keyof BusinessHours, field: 'open' | 'close', value: string) => void;
  onArrayFieldChange: (field: 'specialties' | 'features', value: string) => void;
  isUserAuthenticated: boolean;
}

// Step indicator props
export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

// Registration success props
export interface RegistrationSuccessProps {
  onClose?: () => void;
}