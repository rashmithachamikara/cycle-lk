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
import type { PartnerRegistrationForm as FormData, ImageFile, VerificationDocumentFile } from './types';
import { DEFAULT_BUSINESS_HOURS } from './constants';
import RegistrationSuccess from './RegistrationSuccess';
import type { CityServiceData } from './types';

interface PartnerRegistrationFormProps {
  onSuccess: () => void;
}

const PartnerRegistrationForm: React.FC<PartnerRegistrationFormProps> = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUserAuthenticated = isAuthenticated && user;
  const totalSteps = 5;

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
    mapLocation: undefined,
    location: '',
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
    galleryImages: [],
    // Document field
    verificationDocuments: [],
    documentsUploaded: false // Track upload status
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string, value: any, type: string } }
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
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

  const handleDocumentChange = (documents: VerificationDocumentFile[]) => {
    setFormData(prev => ({
      ...prev,
      verificationDocuments: documents,
      documentsUploaded: false // Reset upload status on change
    }));
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
          formData.storefrontImage &&
          formData.mapLocation?.address &&
          formData.location
        );
      case 2:
        if (!isUserAuthenticated) {
          return !!(
            formData.companyName.trim() && 
            formData.category &&
            formData.storefrontImage &&
            formData.mapLocation?.address &&
            formData.location
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
        // Business hours are required, but have default values, so we allow proceeding.
        return true;
      case 4:
         // Services and features are required.
         return formData.specialties.length > 0 && formData.features.length > 0;
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
          if (!formData.storefrontImage) errors.push('Storefront image is required');
          if (!formData.mapLocation?.address) errors.push('Store location is required');
          if (!formData.location) errors.push('Location selection is required');
        }
        break;
      case 2:
        if (!isUserAuthenticated) {
          if (!formData.companyName.trim()) errors.push('Company name is required');
          if (!formData.category) errors.push('Business category is required');
          if (!formData.storefrontImage) errors.push('Storefront image is required');
          if (!formData.mapLocation?.address) errors.push('Store location is required');
          if (!formData.location) errors.push('Location selection is required');
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
      case 4:
        if (formData.specialties.length === 0) errors.push('At least one bike specialty is required.');
        if (formData.features.length === 0) errors.push('At least one business feature is required.');
        // Only check if documents are present, not uploaded yet
        if (!formData.verificationDocuments || formData.verificationDocuments.length === 0) {
          errors.push('At least one verification document is required.');
        }
        break;
    }
    return errors;
  };

  const handleNextStep = () => {
    const errors = getValidationErrors(currentStep);
    
    if (errors.length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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

    // Final validation before submitting
    const validationErrors = getValidationErrors(4);
    if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
    }

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

      if (!formData.storefrontImage) {
        setError('Storefront image is required.');
        return;
      }

      if (!formData.mapLocation?.address) {
        setError('Store location is required.');
        return;
      }

      if (!formData.location) {
        setError('Location selection is required.');
        return;
      }

      // --- Normalize mapLocation to ensure all required fields ---
      const mapLocation = formData.mapLocation || {};
      const normalizedMapLocation = {
        id: mapLocation.id || (mapLocation.coordinates && mapLocation.coordinates.lat && mapLocation.coordinates.lng ? `${mapLocation.coordinates.lat},${mapLocation.coordinates.lng}` : 'unknown'),
        name: mapLocation.name || mapLocation.address || 'Store Location',
        address: mapLocation.address || 'Unknown address',
        coordinates: {
          lat: typeof mapLocation.coordinates?.lat === 'number' ? mapLocation.coordinates.lat : 0,
          lng: typeof mapLocation.coordinates?.lng === 'number' ? mapLocation.coordinates.lng : 0
        },
        placeId: mapLocation.placeId || '',
        isMainLocation: true
      };

      // Prepare registration data including verification documents
      const registrationData = {
        userId,
        companyName: formData.companyName.trim(),
        category: formData.category,
        description: formData.description.trim(),
        address: formData.address.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim() || formData.userPhone.trim(),
        email: formData.email.trim() || formData.userEmail.trim(),
        businessHours: formData.businessHours,
        specialties: formData.specialties,
        features: formData.features,
        yearsActive: formData.yearsActive,
        mapLocation: normalizedMapLocation,
        location: formData.location,
        logoImage: formData.logoImage,
        storefrontImage: formData.storefrontImage,
        galleryImages: formData.galleryImages,
        verificationDocuments: formData.verificationDocuments // <-- include docs here
      };

      // Register partner with all files (images + documents)
      await partnerService.registerPartner(registrationData);

      setCurrentStep(5);
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
    ? ['Company', 'Contact', 'Hours', 'Services', 'Success']
    : ['Account', 'Company', 'Contact', 'Services', 'Success'];

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

  const stepProps = {
    formData,
    onInputChange: handleInputChange,
    onImageChange: handleImageChange,
    onDocumentChange: handleDocumentChange,
    onArrayFieldChange: handleArrayFieldChange,
    onBusinessHourChange: handleBusinessHourChange,
    onServiceCitiesChange: handleServiceCitiesChange,
    onServiceLocationsChange: handleServiceLocationsChange,
    isUserAuthenticated: !!isUserAuthenticated
  };

  const renderCurrentStep = () => {
    if (currentStep === 5) {
      return <RegistrationSuccess />;
    }
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
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />

      <form onSubmit={handleSubmit}>
        {renderCurrentStep()}

        {error && (
          <div className="mt-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {currentStep < 5 && (
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
                  disabled={loading || !currentStepValid}
                  className={!currentStepValid ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading && <Loader size="sm" className="mr-2" />}
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step validation feedback */}
        {!currentStepValid && currentStep < 5 && (
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