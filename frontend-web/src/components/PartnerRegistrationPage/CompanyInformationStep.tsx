// // frontend-web/components/PartnerRegistrationPage/CompanyInformationStep.tsx
// import React from 'react';
// import { Building2, Tag, FileText } from 'lucide-react';
// import { FormField } from '../forms';
// import { StepProps } from './types';
// import { BUSINESS_CATEGORIES } from './constants';
// import ServiceLocationManager from './ServiceLocationManager';

// const CompanyInformationStep: React.FC<StepProps> = ({
//   formData,
//   onInputChange,
//   onServiceCitiesChange,
//   onServiceLocationsChange
// }) => {
//   return (
//     <div className="space-y-8">
//       <div className="text-center mb-6">
//         <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Information</h3>
//         <p className="text-gray-600">Tell us about your business and service locations</p>
//       </div>

//       {/* Basic Company Info */}
//       <div className="space-y-6">
//         <FormField
//           label="Company Name"
//           name="companyName"
//           value={formData.companyName}
//           onChange={onInputChange}
//           placeholder="Enter your company name"
//           required
//           icon={Building2}
//         />

//         <FormField
//           label="Business Category"
//           name="category"
//           type="select"
//           value={formData.category}
//           onChange={onInputChange}
//           placeholder="Select a category"
//           required
//           icon={Tag}
//           options={BUSINESS_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
//         />

//         <FormField
//           label="Business Description"
//           name="description"
//           type="textarea"
//           value={formData.description}
//           onChange={onInputChange}
//           placeholder="Describe your business and what makes it special..."
//           icon={FileText}
//           rows={4}
//         />
//       </div>

//       {/* Service Locations Section */}
//       <div className="border-t border-gray-200 pt-8">
//         <ServiceLocationManager
//           serviceCities={formData.serviceCities}
//           serviceLocations={formData.serviceLocations}
//           onServiceCitiesChange={onServiceCitiesChange}
//           onServiceLocationsChange={onServiceLocationsChange}
//         />
//       </div>
//     </div>
//   );
// };

// export default CompanyInformationStep;






// frontend-web/components/PartnerRegistrationPage/CompanyInformationStep.tsx

import React from 'react';
import { Building, Tag, FileText, MapPin } from 'lucide-react';
import ServiceLocationManager from './ServiceLocationManager';
import { type StepProps } from './types';
import { BUSINESS_CATEGORIES } from './constants';

const CompanyInformationStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onServiceCitiesChange,
  onServiceLocationsChange,
  isUserAuthenticated
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <Building className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
        <p className="text-gray-600">Tell us about your business and where you operate</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={onInputChange}
              placeholder="Enter your company name"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Business Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Business Category *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={onInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select a category</option>
              {BUSINESS_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Years Active */}
        <div>
          <label htmlFor="yearsActive" className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            id="yearsActive"
            name="yearsActive"
            value={formData.yearsActive}
            onChange={onInputChange}
            min="0"
            max="100"
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={4}
              placeholder="Describe your business, services, and what makes you unique..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This description will be shown to customers on your profile
          </p>
        </div>
      </div>

      {/* Service Locations */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center mb-6">
          <MapPin className="h-6 w-6 text-emerald-600 mr-2" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Locations</h3>
            <p className="text-sm text-gray-600">Add the cities and specific locations where you provide services</p>
          </div>
        </div>

        <ServiceLocationManager
          serviceCities={formData.serviceCities}
          serviceLocations={formData.serviceLocations}
          onServiceCitiesChange={onServiceCitiesChange}
          onServiceLocationsChange={onServiceLocationsChange}
        />
      </div>

      {/* Validation Summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-emerald-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-emerald-800 mb-1">Required Information:</p>
            <ul className="text-emerald-700 space-y-1">
              <li className={`flex items-center ${formData.companyName ? 'line-through opacity-60' : ''}`}>
                • Company name
              </li>
              <li className={`flex items-center ${formData.category ? 'line-through opacity-60' : ''}`}>
                • Business category
              </li>
              <li className={`flex items-center ${formData.serviceCities.length > 0 ? 'line-through opacity-60' : ''}`}>
                • At least one service city
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationStep;