import React from 'react';
import { MapPin, User, Phone, Mail } from 'lucide-react';
import { StepProps } from './types';

const ContactInformationStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  isUserAuthenticated
}) => {
  const isBusinessPhoneStep = !isUserAuthenticated;

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
          onChange={onInputChange}
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
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Name of the primary contact person"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="h-4 w-4 inline mr-2" />
          {isBusinessPhoneStep ? 'Business Phone Number' : 'Phone Number'} *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="+94 XX XXX XXXX"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="h-4 w-4 inline mr-2" />
          {isBusinessPhoneStep ? 'Business Email Address' : 'Email Address'}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder={isBusinessPhoneStep ? "business@example.com (optional)" : "business@example.com"}
        />
      </div>

      {isUserAuthenticated && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            name="yearsActive"
            value={formData.yearsActive}
            onChange={onInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="How many years have you been in business?"
          />
        </div>
      )}

      {!isUserAuthenticated && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            name="yearsActive"
            value={formData.yearsActive}
            onChange={onInputChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="How many years have you been in business?"
          />
        </div>
      )}
    </div>
  );
};

export default ContactInformationStep;
