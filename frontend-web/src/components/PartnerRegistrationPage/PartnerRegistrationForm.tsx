// frontend-web/components/PartnerRegistrationPage/PartnerRegistrationForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Loader, ErrorDisplay } from '../../ui';
import { partnerService, type BusinessHours } from '../../services/partnerService';
import { ArrowRight } from 'lucide-react';

import StepIndicator from './StepIndicator';
import UserAccountStep from './UserAccountStep';
import CompanyInformationStep from './CompanyInformationStep';
import ContactInformationStep from './ContactInformationStep';
import BusinessHoursStep from './BusinessHoursStep';
import ServicesAndFeaturesStep from './ServicesAndFeaturesStep';
import { PartnerRegistrationForm as FormData, type CityServiceData, type ImageFile } from './types';
import { DEFAULT_BUSINESS_HOURS } from './constants';

interface PartnerRegistrationFormProps {
  onSuccess: () => void;
}

const PartnerRegistrationForm: React.FC<PartnerRegistrationFormProps> = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUserAuthenticated = isAuthenticated && user;

  const [formData, setFormData] = useState<FormData>({
    // User fields for non-authenticated users
    firstName: '',
    lastName: '',
    userEmail: '',
    userPhone: '',
    password: '',
    confirmPassword: '',
    // Partner fields
    companyName: '',
    category: '',
    description: '',
    // Updated location system
    serviceCities: [],
    serviceLocations: [],
    address: '',
    contactPerson: '',
    phone: '',
    email: user?.email || '',
    businessHours: DEFAULT_BUSINESS_HOURS,
    specialties: [],
    features: [],
    yearsActive: 0,
    // Image fields
    logoImage: undefined,
    storefrontImage: undefined,
    galleryImages: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleServiceCitiesChange = (cities: string[]) => {
    setFormData(prev => ({
      ...prev,
      serviceCities: cities
    }));
  };

  const handleServiceLocationsChange = (locations: CityServiceData[]) => {
    setFormData(prev => ({
      ...prev,
      serviceLocations: locations
    }));
  };

  const handleBusinessHourChange = (day: keyof BusinessHours, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleArrayFieldChange = (field: 'specialties' | 'features', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageChange = (field: 'logo' | 'storefront' | 'gallery', files: ImageFile | ImageFile[] | null) => {
    setFormData(prev => {
      if (field === 'logo' || field === 'storefront') {
        return {
          ...prev,
          [`${field}Image`]: files as ImageFile | undefined
        };
      } else if (field === 'gallery') {
        return {
          ...prev,
          galleryImages: files as ImageFile[] || []
        };
      }
      return prev;
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!isUserAuthenticated) {
          return !!(
            formData.firstName.trim() && 
            formData.lastName.trim() && 
            formData.userEmail.trim() && 
            formData.userPhone.trim() &&
            formData.password &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword &&
            formData.userEmail.includes('@')
          );
        }
        return !!(
          formData.companyName.trim() && 
          formData.category && 
          formData.serviceCities.length > 0 &&
          formData.storefrontImage // Storefront image is required
        );
      case 2:
        if (!isUserAuthenticated) {
          return !!(
            formData.companyName.trim() && 
            formData.category && 
            formData.serviceCities.length > 0 &&
            formData.storefrontImage // Storefront image is required
          );
        }
        return !!(
          formData.address.trim() && 
          formData.contactPerson.trim() && 
          formData.phone.trim()
        );
      case 3:
        if (!isUserAuthenticated) {
          return !!(
            formData.address.trim() && 
            formData.contactPerson.trim() && 
            formData.phone.trim()
          );
        }
        return true; // Business hours are optional
      case 4:
        return true; // Services and features are optional
      default:
        return true;
    }
  };

  const getValidationErrors = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!isUserAuthenticated) {
          if (!formData.firstName.trim()) errors.push('First name is required');
          if (!formData.lastName.trim()) errors.push('Last name is required');
          if (!formData.userEmail.trim()) errors.push('Email is required');
          if (!formData.userEmail.includes('@')) errors.push('Valid email is required');
          if (!formData.userPhone.trim()) errors.push('Phone number is required');
          if (!formData.password) errors.push('Password is required');
          if (!formData.confirmPassword) errors.push('Password confirmation is required');
          if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
        } else {
          if (!formData.companyName.trim()) errors.push('Company name is required');
          if (!formData.category) errors.push('Business category is required');
          if (formData.serviceCities.length === 0) errors.push('At least one service city is required');
          if (!formData.storefrontImage) errors.push('Storefront image is required');
        }
        break;
      case 2:
        if (!isUserAuthenticated) {
          if (!formData.companyName.trim()) errors.push('Company name is required');
          if (!formData.category) errors.push('Business category is required');
          if (formData.serviceCities.length === 0) errors.push('At least one service city is required');
          if (!formData.storefrontImage) errors.push('Storefront image is required');
        } else {
          if (!formData.address.trim()) errors.push('Business address is required');
          if (!formData.contactPerson.trim()) errors.push('Contact person is required');
          if (!formData.phone.trim()) errors.push('Phone number is required');
        }
        break;
      case 3:
        if (!isUserAuthenticated) {
          if (!formData.address.trim()) errors.push('Business address is required');
          if (!formData.contactPerson.trim()) errors.push('Contact person is required');
          if (!formData.phone.trim()) errors.push('Phone number is required');
        }
        break;
    }
    
    return errors;
  };

  const handleNextStep = () => {
    const errors = getValidationErrors(currentStep);
    
    if (errors.length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
    } else {
      setError(errors.join('. '));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      let userId = user?.id;

      // If user is not authenticated, register them first
      if (!isUserAuthenticated) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        const { authService } = await import('../../services/authService');
        
        const userData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.userEmail.trim(),
          password: formData.password,
          phone: formData.userPhone.trim()
        };

        const authResult = await authService.register(userData);
        userId = authResult.user.id;
      }

      if (!userId) {
        setError('User information not available. Please try again.');
        return;
      }

      // Validate required fields
      if (!formData.companyName.trim()) {
        setError('Company name is required.');
        return;
      }

      if (!formData.category) {
        setError('Business category is required.');
        return;
      }

      if (formData.serviceCities.length === 0) {
        setError('At least one service city is required.');
        return;
      }

      if (!formData.storefrontImage) {
        setError('Storefront image is required.');
        return;
      }

      const registrationData = {
        userId,
        companyName: formData.companyName.trim(),
        category: formData.category,
        description: formData.description.trim(),
        serviceCities: formData.serviceCities,
        serviceLocations: formData.serviceLocations,
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim() || formData.userPhone.trim(),
        email: formData.email.trim() || formData.userEmail.trim(),
        businessHours: formData.businessHours,
        specialties: formData.specialties,
        features: formData.features,
        yearsActive: formData.yearsActive,
        // Include image files
        logoImage: formData.logoImage,
        storefrontImage: formData.storefrontImage,
        galleryImages: formData.galleryImages
      };

      await partnerService.registerPartner(registrationData);
      onSuccess();

    } catch (err: unknown) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = isUserAuthenticated 
    ? ['Company', 'Contact', 'Hours', 'Services']
    : ['Account', 'Company', 'Contact', 'Services'];

  const stepProps = {
    formData,
    onInputChange: handleInputChange,
    onServiceCitiesChange: handleServiceCitiesChange,
    onServiceLocationsChange: handleServiceLocationsChange,
    onBusinessHourChange: handleBusinessHourChange,
    onArrayFieldChange: handleArrayFieldChange,
    onImageChange: handleImageChange,
    isUserAuthenticated: !!isUserAuthenticated
  };

  const renderCurrentStep = () => {
    if (!isUserAuthenticated) {
      switch (currentStep) {
        case 1: return <UserAccountStep {...stepProps} />;
        case 2: return <CompanyInformationStep {...stepProps} />;
        case 3: return <ContactInformationStep {...stepProps} />;
        case 4: return <ServicesAndFeaturesStep {...stepProps} />;
        default: return null;
      }
    } else {
      switch (currentStep) {
        case 1: return <CompanyInformationStep {...stepProps} />;
        case 2: return <ContactInformationStep {...stepProps} />;
        case 3: return <BusinessHoursStep {...stepProps} />;
        case 4: return <ServicesAndFeaturesStep {...stepProps} />;
        default: return null;
      }
    }
  };

  const currentStepValid = validateStep(currentStep);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        stepLabels={stepLabels}
      />

      <form onSubmit={handleSubmit}>
        {renderCurrentStep()}

        {error && (
          <div className="mt-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={loading}
              >
                Previous
              </Button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNextStep}
                disabled={!currentStepValid}
                className={!currentStepValid ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading && <Loader size="sm" className="mr-2" />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>

        {/* Step validation feedback */}
        {!currentStepValid && currentStep < 4 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Please complete all required fields to continue
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default PartnerRegistrationForm;