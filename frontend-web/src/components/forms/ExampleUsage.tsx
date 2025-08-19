// Example: How to integrate MapLocationInput into your forms

import React, { useState } from 'react';
import { MapLocationInput } from './index';
import { type LocationData } from '../../config/googleMaps';

interface FormData {
  companyName: string;
  location: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const ExampleForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    location: '',
    address: '',
  });

  const handleLocationChange = (value: string, locationData?: LocationData) => {
    setFormData(prev => ({
      ...prev,
      location: value,
      // Store coordinates if available
      coordinates: locationData ? {
        lat: locationData.coordinates.lat,
        lng: locationData.coordinates.lng
      } : undefined,
      // Optionally auto-fill address
      address: locationData?.formattedAddress || prev.address
    }));
  };

  const handleLocationSelect = (locationData: LocationData) => {
    console.log('Location selected:', locationData);
    // You can perform additional actions here like:
    // - Validating the location
    // - Fetching nearby services
    // - Updating other form fields
  };

  const sriLankanCities = [
    'Colombo', 'Kandy', 'Galle', 'Anuradhapura', 'Polonnaruwa',
    'Sigiriya', 'Ella', 'Nuwara Eliya', 'Bentota', 'Mirissa'
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter your company name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Location *
        </label>
        <MapLocationInput
          value={formData.location}
          onChange={handleLocationChange}
          onLocationSelect={handleLocationSelect}
          placeholder="Search for your business location"
          suggestions={sriLankanCities}
          showMap={true}
          mapHeight="250px"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter your complete business address"
          rows={3}
        />
      </div>

      {/* Display coordinates if available */}
      {formData.coordinates && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-sm text-emerald-800">
            <strong>Coordinates:</strong> {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExampleForm;