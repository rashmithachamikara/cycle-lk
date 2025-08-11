import React, { useState } from 'react';
import GoogleMapsPlacesInput from '../components/forms/GoogleMapsPlacesInput';
import ServiceLocationManager from '../components/forms/ServiceLocationManager';

interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  placeId?: string;
  isMainLocation?: boolean;
}

interface CityServiceData {
  city: string;
  locations: ServiceLocation[];
}

interface LocationData {
  coordinates: { lat: number; lng: number };
  placeId?: string;
  formattedAddress?: string;
  name?: string;
  types?: string[];
}

const TestGoogleMapsPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [serviceCities, setServiceCities] = useState<CityServiceData[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Google Maps Places UI Demo
          </h1>
          <p className="text-gray-600">
            Professional location selection with Google Maps integration
          </p>
        </div>

        {/* Single Location Input Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Single Location Picker</h2>
          <div className="max-w-2xl">
            <GoogleMapsPlacesInput
              value={selectedLocation}
              onChange={(address, data) => {
                setSelectedLocation(address);
                setLocationData(data || null);
                console.log('Selected location:', { address, data });
              }}
              placeholder="Search for a location in Sri Lanka..."
            />
            
            {locationData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Selected Location Details:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Name:</strong> {locationData.name}</p>
                  <p><strong>Address:</strong> {locationData.formattedAddress}</p>
                  <p><strong>Coordinates:</strong> {locationData.coordinates.lat.toFixed(6)}, {locationData.coordinates.lng.toFixed(6)}</p>
                  <p><strong>Place ID:</strong> {locationData.placeId}</p>
                  {locationData.types && (
                    <p><strong>Types:</strong> {locationData.types.join(', ')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Location Manager Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Service Location Manager</h2>
          <p className="text-gray-600 mb-6">
            Manage multiple cities and their service locations with professional Google Maps integration
          </p>
          
          <ServiceLocationManager
            serviceCities={serviceCities}
            onChange={setServiceCities}
          />

          {serviceCities.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Current Service Data:</h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                {JSON.stringify(serviceCities, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p><strong>Single Location Picker:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Type to search for locations using Google Places Autocomplete</li>
              <li>Click on the map to select a location</li>
              <li>Use the "Current Location" button to get your GPS location</li>
              <li>View detailed location information including coordinates and place ID</li>
            </ul>
            
            <p className="mt-4"><strong>Service Location Manager:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Select cities from the dropdown in the left panel</li>
              <li>Click on a city to manage its service locations</li>
              <li>Add multiple locations per city using the Google Maps interface</li>
              <li>Mark locations as "main" locations for each city</li>
              <li>Remove cities or individual locations as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestGoogleMapsPage;
