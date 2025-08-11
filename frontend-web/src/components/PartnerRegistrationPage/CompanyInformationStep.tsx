import React from 'react';
import { Building2, Tag, FileText } from 'lucide-react';
import { FormField } from '../forms';
import { StepProps } from './types';
import { BUSINESS_CATEGORIES } from './constants';
import ServiceLocationManager from './ServiceLocationManager';

const CompanyInformationStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onServiceCitiesChange,
  onServiceLocationsChange
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Information</h3>
        <p className="text-gray-600">Tell us about your business and service locations</p>
      </div>

      {/* Basic Company Info */}
      <div className="space-y-6">
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

      {/* Service Locations Section */}
      <div className="border-t border-gray-200 pt-8">
        <ServiceLocationManager
          serviceCities={formData.serviceCities}
          serviceLocations={formData.serviceLocations}
          onServiceCitiesChange={onServiceCitiesChange}
          onServiceLocationsChange={onServiceLocationsChange}
        />
      </div>
    </div>
  );
};

export default CompanyInformationStep;
