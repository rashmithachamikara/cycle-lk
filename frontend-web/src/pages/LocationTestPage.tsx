import React, { useState } from 'react';
import { MapLocationInput } from '../components/forms';
import { ServiceLocationManager } from '../components/PartnerRegistrationPage';
import { type LocationData } from '../config/googleMaps';
import { type CityServiceData } from '../components/PartnerRegistrationPage/types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LocationTestPage: React.FC = () => {
  const [location, setLocation] = useState('');
  const [selectedLocationData, setSelectedLocationData] = useState<LocationData | null>(null);
  
  // For ServiceLocationManager demo
  const [serviceCities, setServiceCities] = useState<string[]>([]);
  const [serviceLocations, setServiceLocations] = useState<CityServiceData[]>([]);

  const handleLocationChange = (value: string, locationData?: LocationData) => {
    setLocation(value);
    if (locationData) {
      setSelectedLocationData(locationData);
    }
  };

  const handleLocationSelect = (locationData: LocationData) => {
    console.log('Location selected:', locationData);
    setSelectedLocationData(locationData);
  };

  const sriLankanCities = [
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Location Input Components Demo</h1>
          <p className="text-xl text-gray-600">
            Test the enhanced location input components with Google Maps integration
          </p>
        </div>

        {/* Service Location Manager Demo */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Location Manager</h2>
              <p className="text-gray-600">
                Multi-city, multi-location management system for partner registration
              </p>
            </div>
            
            <ServiceLocationManager
              serviceCities={serviceCities}
              serviceLocations={serviceLocations}
              onServiceCitiesChange={setServiceCities}
              onServiceLocationsChange={setServiceLocations}
            />
          </div>

          {/* Service Location Debug Panel */}
          <div className="mt-6 bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Location Data</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Service Cities ({serviceCities.length}):</h4>
                <pre className="bg-white p-3 rounded border text-sm overflow-auto max-h-32">
                  {JSON.stringify(serviceCities, null, 2)}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Service Locations ({serviceLocations.reduce((total, city) => total + city.locations.length, 0)} total):
                </h4>
                <pre className="bg-white p-3 rounded border text-sm overflow-auto max-h-32">
                  {JSON.stringify(serviceLocations, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Basic MapLocationInput Demo */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Map Location Input</h2>
            <p className="text-gray-600">
              Single location input with Google Maps integration
            </p>
          </div>

          <div>
            <MapLocationInput
              value={location}
              onChange={handleLocationChange}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location or click on the map"
              suggestions={sriLankanCities}
              showMap={true}
              mapHeight="300px"
              required
            />
          </div>

          {/* Display Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Selected Location Details:</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Input Value:</label>
                  <p className="text-gray-900">{location || 'No location entered'}</p>
                </div>
                
                {selectedLocationData && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Formatted Address:</label>
                      <p className="text-gray-900">{selectedLocationData.formattedAddress || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates:</label>
                      <p className="text-gray-900">
                        {selectedLocationData.coordinates.lat.toFixed(6)}, {selectedLocationData.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Place ID:</label>
                      <p className="text-gray-900 text-xs break-all">{selectedLocationData.placeId || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">How to Test:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Service Location Manager:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Add cities where you provide services (left panel)</li>
                <li>Select a city to manage its service locations</li>
                <li>Add multiple locations per city (right panel)</li>
                <li>Search using Google Places or click on map</li>
                <li>Drag markers to fine-tune positions</li>
                <li>Mark locations as "main" using star icon</li>
                <li>View data structure in debug panel</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Basic Location Input:</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                <li>Type to get Google Places autocomplete</li>
                <li>Click on map to select by coordinates</li>
                <li>Drag marker to adjust position</li>
                <li>Use dropdown for local suggestions</li>
                <li>Toggle map with map icon button</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-semibold text-yellow-900 mb-2">Setup Required:</h4>
          <ol className="text-yellow-800 text-sm space-y-1 list-decimal list-inside">
            <li>Get a Google Maps API key from Google Cloud Console</li>
            <li>Enable Maps JavaScript API, Places API, and Geocoding API</li>
            <li>Add your API key to .env file as <code>VITE_GOOGLE_MAPS_API_KEY</code></li>
            <li>Restart your development server</li>
          </ol>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LocationTestPage;
