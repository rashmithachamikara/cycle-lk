import React from 'react';
import { Building2, MapPin, Tag, FileText } from 'lucide-react';
import { FormField, LocationInput } from '../forms';
import { StepProps } from './types';
import { BUSINESS_CATEGORIES, SRI_LANKAN_LOCATIONS } from './constants';

const CompanyInformationStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onLocationChange
}) => {
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
        onChange={onInputChange}
        placeholder="Enter your company name"
        required
        icon={Building2}
      />

      <FormField
        label="Business Category"
        name="category"
        type="select"
        value={formData.category}
        onChange={onInputChange}
        placeholder="Select a category"
        required
        icon={Tag}
        options={BUSINESS_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="h-4 w-4 inline mr-2" />
          Primary Location <span className="text-red-500">*</span>
        </label>
        <LocationInput
          value={formData.location}
          onChange={onLocationChange}
          placeholder="Enter or select your location"
          required
          suggestions={SRI_LANKAN_LOCATIONS}
        />
      </div>

      <FormField
        label="Business Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={onInputChange}
        placeholder="Describe your business and what makes it special..."
        icon={FileText}
        rows={4}
      />
    </div>
  );
};

export default CompanyInformationStep;
