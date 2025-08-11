import React from 'react';
import { StepProps } from './types';
import { type BusinessHours } from '../../services/partnerService';

const BusinessHoursStep: React.FC<StepProps> = ({
  formData,
  onBusinessHourChange
}) => {
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
              onChange={(e) => onBusinessHourChange(day as keyof BusinessHours, 'open', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="time"
              value={hours.close}
              onChange={(e) => onBusinessHourChange(day as keyof BusinessHours, 'close', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessHoursStep;
