import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FormField, LocationInput } from '../components/forms';
import { Button, Loader, ErrorDisplay } from '../ui';
import { partnerService, type BusinessHours } from '../services/partnerService';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Tag, 
  FileText, 
  User,
  CheckCircle,
  ArrowRight,
  UserPlus
} from 'lucide-react';

interface PartnerRegistrationForm {
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

const PartnerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<PartnerRegistrationForm>({
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
    location: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: user?.email || '',
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '09:00', close: '18:00' }
    },
    specialties: [],
    features: [],
    yearsActive: 0
  });

  const categories = [
    'Bike Rental Shop',
    'Tour Operator',
    'Hotel & Resort',
    'Adventure Sports',
    'Transport Service',
    'Other'
  ];

  const commonSpecialties = [
    'Mountain Bikes',
    'City Bikes',
    'Electric Bikes',
    'Road Bikes',
    'Hybrid Bikes',
    'Kids Bikes',
    'Tandem Bikes',
    'Bike Tours',
    'Bike Maintenance',
    'Safety Equipment'
  ];

  const commonFeatures = [
    'Helmet Included',
    'Insurance Coverage',
    'GPS Navigation',
    'Delivery Service',
    'Maintenance Support',
    '24/7 Support',
    'Multiple Locations',
    'Online Booking',
    'Flexible Pickup',
    'Tour Guides'
  ];

  const sriLankanLocations = [
    'Colombo',
    'Kandy',
    'Galle',
    'Anuradhapura',
    'Polonnaruwa',
    'Sigiriya',
    'Ella',
    'Nuwara Eliya',
    'Bentota',
    'Mirissa',
    'Unawatuna',
    'Hikkaduwa',
    'Negombo',
    'Trincomalee',
    'Batticaloa',
    'Jaffna',
    'Matara',
    'Ratnapura',
    'Badulla',
    'Kurunegala'
  ];

  // Check if user is authenticated - show different flow for non-authenticated users
  const isUserAuthenticated = isAuthenticated && user;

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // If not authenticated, validate user registration fields
        if (!isUserAuthenticated) {
          return !!(
            formData.firstName && 
            formData.lastName && 
            formData.userEmail && 
            formData.userPhone &&
            formData.password &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
          );
        }
        // If authenticated, validate company info
        return !!(formData.companyName && formData.category && formData.location);
      case 2:
        // Company information (for non-authenticated users, this is step 2)
        if (!isUserAuthenticated) {
          return !!(formData.companyName && formData.category && formData.location);
        }
        // Contact information (for authenticated users, this is step 2)
        return !!(formData.address && formData.contactPerson && formData.phone);
      case 3:
        // Contact information (for non-authenticated users, this is step 3)
        if (!isUserAuthenticated) {
          return !!(formData.address && formData.contactPerson && formData.phone);
        }
        // Business hours (for authenticated users, this is step 3)
        return true; // Optional fields
      case 4:
        return true; // Optional fields for both
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
    } else {
      setError('Please fill in all required fields before proceeding.');
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

        // Import authService for registration
        const { authService } = await import('../services/authService');
        
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.userEmail,
          password: formData.password,
          phone: formData.userPhone
        };

        const authResult = await authService.register(userData);
        userId = authResult.user.id;
      }

      if (!userId) {
        setError('User information not available. Please try again.');
        return;
      }

      const registrationData = {
        userId,
        companyName: formData.companyName,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        contactPerson: formData.contactPerson,
        phone: formData.phone || formData.userPhone,
        email: formData.email || formData.userEmail,
        businessHours: formData.businessHours,
        specialties: formData.specialties,
        features: formData.features,
        yearsActive: formData.yearsActive
      };

      await partnerService.registerPartner(registrationData);
      setSuccess(true);
      
      // Redirect to success page or partner dashboard after a delay
      setTimeout(() => {
        navigate('/partners', { replace: true });
      }, 3000);

    } catch (err: unknown) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for joining Cycle.LK! Your partner application has been submitted and is now under review.
              You'll receive an email notification once your account is verified.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the partners page...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderStepIndicator = () => {
    const totalSteps = isUserAuthenticated ? 4 : 4; // Both flows have 4 steps
    const stepLabels = isUserAuthenticated 
      ? ['Company', 'Contact', 'Hours', 'Services']
      : ['Account', 'Company', 'Contact', 'Services'];

    return (
      <div className="flex items-center justify-center mb-8">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step <= currentStep ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                <span className="text-xs text-gray-500 mt-1">{stepLabels[index]}</span>
              </div>
              {step < totalSteps && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderStep1 = () => {
    // For non-authenticated users, show user registration form first
    if (!isUserAuthenticated) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
            <p className="text-gray-600">First, let's create your user account</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
              icon={User}
            />

            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              required
              icon={User}
            />
          </div>

          <FormField
            label="Email Address"
            name="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={handleInputChange}
            placeholder="your@email.com"
            required
            icon={Mail}
          />

          <FormField
            label="Phone Number"
            name="userPhone"
            type="tel"
            value={formData.userPhone}
            onChange={handleInputChange}
            placeholder="+94 XX XXX XXXX"
            required
            icon={Phone}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter a secure password"
              required
            />

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-red-500 text-sm">Passwords do not match</p>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <UserPlus className="h-4 w-4 inline mr-1" />
              Already have an account? <Link to="/login" className="underline">Login here</Link> to register as a partner.
            </p>
          </div>
        </div>
      );
    }

    // For authenticated users, show company information
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Information</h3>
          <p className="text-gray-600">Tell us about your business</p>
        </div>

        <FormField
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          placeholder="Enter your company name"
          required
          icon={Building2}
        />

        <FormField
          label="Business Category"
          name="category"
          type="select"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="Select a category"
          required
          icon={Tag}
          options={categories.map(cat => ({ value: cat, label: cat }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-2" />
            Primary Location <span className="text-red-500">*</span>
          </label>
          <LocationInput
            value={formData.location}
            onChange={handleLocationChange}
            placeholder="Enter or select your location"
            required
            suggestions={sriLankanLocations}
          />
        </div>

        <FormField
          label="Business Description"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your business and what makes it special..."
          icon={FileText}
          rows={4}
        />
      </div>
    );
  };

  const renderStep2 = () => {
    // For non-authenticated users, show company information (step 2)
    if (!isUserAuthenticated) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Information</h3>
            <p className="text-gray-600">Tell us about your business</p>
          </div>

          <FormField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Enter your company name"
            required
            icon={Building2}
          />

          <FormField
            label="Business Category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="Select a category"
            required
            icon={Tag}
            options={categories.map(cat => ({ value: cat, label: cat }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Primary Location <span className="text-red-500">*</span>
            </label>
            <LocationInput
              value={formData.location}
              onChange={handleLocationChange}
              placeholder="Enter or select your location"
              required
              suggestions={sriLankanLocations}
            />
          </div>

          <FormField
            label="Business Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your business and what makes it special..."
            icon={FileText}
            rows={4}
          />
        </div>
      );
    }

    // For authenticated users, show contact information (step 2)
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h3>
          <p className="text-gray-600">How can customers reach you?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-2" />
            Full Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter your complete business address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            Contact Person *
          </label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Name of the primary contact person"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-2" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="+94 XX XXX XXXX"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="business@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            name="yearsActive"
            value={formData.yearsActive}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="How many years have you been in business?"
          />
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    // For non-authenticated users, show contact information (step 3)
    if (!isUserAuthenticated) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h3>
            <p className="text-gray-600">How can customers reach you?</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Full Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your complete business address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Contact Person *
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Name of the primary contact person"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Business Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+94 XX XXX XXXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Business Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="business@example.com (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years in Business
            </label>
            <input
              type="number"
              name="yearsActive"
              value={formData.yearsActive}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="How many years have you been in business?"
            />
          </div>
        </div>
      );
    }

    // For authenticated users, show business hours (step 3)
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Hours</h3>
          <p className="text-gray-600">When are you open for business?</p>
        </div>

        <div className="space-y-4">
          {Object.entries(formData.businessHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</div>
              <input
                type="time"
                value={hours.open}
                onChange={(e) => handleBusinessHourChange(day as keyof BusinessHours, 'open', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={hours.close}
                onChange={(e) => handleBusinessHourChange(day as keyof BusinessHours, 'close', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    // Step 4 is the same for both authenticated and non-authenticated users
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {!isUserAuthenticated ? 'Business Hours & Services' : 'Services & Features'}
          </h3>
          <p className="text-gray-600">
            {!isUserAuthenticated 
              ? 'Set your operating hours and tell us what you offer' 
              : 'What do you offer to your customers?'
            }
          </p>
        </div>

        {/* Business Hours for non-authenticated users */}
        {!isUserAuthenticated && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h4>
            <div className="space-y-4">
              {Object.entries(formData.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</div>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) => handleBusinessHourChange(day as keyof BusinessHours, 'open', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) => handleBusinessHourChange(day as keyof BusinessHours, 'close', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Bike Specialties</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonSpecialties.map(specialty => (
              <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleArrayFieldChange('specialties', specialty)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Additional Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonFeatures.map(feature => (
              <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleArrayFieldChange('features', feature)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Cycle.LK Partner</h1>
          <p className="text-xl text-gray-600">
            {isUserAuthenticated 
              ? "Join our network and grow your bike rental business across Sri Lanka"
              : "Create your account and join our network of bike rental partners across Sri Lanka"
            }
          </p>
          {isUserAuthenticated && (
            <p className="text-sm text-emerald-600 mt-2">
              Welcome back, {user.firstName}! Let's set up your partner account.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

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
                    disabled={!validateStep(currentStep)}
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
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Have questions? <Link to="/support" className="text-emerald-600 hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartnerRegistrationPage;
