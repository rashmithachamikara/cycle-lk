import { type BusinessHours } from '../../services/partnerService';

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
  location: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessHours: BusinessHours;
  specialties: string[];
  features: string[];
  yearsActive: number;
}

export interface StepProps {
  formData: PartnerRegistrationForm;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onLocationChange: (value: string) => void;
  onBusinessHourChange: (day: keyof BusinessHours, field: 'open' | 'close', value: string) => void;
  onArrayFieldChange: (field: 'specialties' | 'features', value: string) => void;
  isUserAuthenticated: boolean;
}

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export interface RegistrationSuccessProps {
  onClose?: () => void;
}
