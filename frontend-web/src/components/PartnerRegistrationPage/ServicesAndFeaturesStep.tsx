import React from 'react';
import { StepProps } from './types';
import { BIKE_SPECIALTIES, BUSINESS_FEATURES } from './constants';

const ServicesAndFeaturesStep: React.FC<StepProps> = ({
  formData,
  onArrayFieldChange,
  onBusinessHourChange,
  isUserAuthenticated
}) => {
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
                  onChange={(e) => onBusinessHourChange(day as keyof typeof formData.businessHours, 'open', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => onBusinessHourChange(day as keyof typeof formData.businessHours, 'close', e.target.value)}
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
          {BIKE_SPECIALTIES.map(specialty => (
            <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialties.includes(specialty)}
                onChange={() => onArrayFieldChange('specialties', specialty)}
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
          {BUSINESS_FEATURES.map(feature => (
            <label key={feature} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.includes(feature)}
                onChange={() => onArrayFieldChange('features', feature)}
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

export default ServicesAndFeaturesStep;
