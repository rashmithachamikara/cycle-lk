// // frontend-web/components/PartnerRegistrationPage/index.ts
// // Main components
// export { default as PartnerRegistrationForm } from './PartnerRegistrationForm';
// export { default as RegistrationSuccess } from './RegistrationSuccess';
// export { default as ServiceLocationManager } from './ServiceLocationManager';

// // Step components
// export { default as StepIndicator } from './StepIndicator';
// export { default as UserAccountStep } from './UserAccountStep';
// export { default as CompanyInformationStep } from './CompanyInformationStep';
// export { default as ContactInformationStep } from './ContactInformationStep';
// export { default as BusinessHoursStep } from './BusinessHoursStep';
// export { default as ServicesAndFeaturesStep } from './ServicesAndFeaturesStep';

// // Types and constants
// export * from './types';
// export * from './constants';



// frontend-web/components/PartnerRegistrationPage/index.ts

export { default as PartnerRegistrationForm } from './PartnerRegistrationForm';
export { default as RegistrationSuccess } from './RegistrationSuccess';
export { default as ServiceLocationManager } from './ServiceLocationManager';
export { default as CompanyInformationStep } from './CompanyInformationStep';
export { default as StepIndicator } from './StepIndicator';

// Export types
export type {
  ServiceLocation,
  CityServiceData,
  LocationData,
  PartnerRegistrationForm as PartnerRegistrationFormData,
  StepProps,
  StepIndicatorProps,
  RegistrationSuccessProps
} from './types';

// Export constants
export {
  BUSINESS_CATEGORIES,
  BIKE_SPECIALTIES,
  BUSINESS_FEATURES,
  SRI_LANKAN_LOCATIONS,
  POPULAR_CITIES,
  TIME_SLOTS,
  DEFAULT_BUSINESS_HOURS
} from './constants';