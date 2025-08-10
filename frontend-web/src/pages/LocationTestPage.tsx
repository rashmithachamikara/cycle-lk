import React, { useState } from 'react';
import { MapLocationInput } from '../components/forms';
import { type LocationData } from '../config/googleMaps';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LocationTestPage: React.FC = () => {
  const [location, setLocation] = useState('');
  const [selectedLocationData, setSelectedLocationData] = useState<LocationData | null>(null);

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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Google Maps Location Input Demo</h1>
          <p className="text-xl text-gray-600">
            Test the enhanced location input with Google Maps integration
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enhanced Location Input</h2>
            <p className="text-gray-600 mb-4">
              This component includes Google Maps autocomplete, map selection, and coordinate display.
            </p>
            
            <MapLocationInput
              value={location}
              onChange={handleLocationChange}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a location or click on the map"
              suggestions={sriLankanCities}
              showMap={true}
              mapHeight="400px"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude:</label>
                      <p className="text-gray-900">{selectedLocationData.coordinates.lat.toFixed(6)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude:</label>
                      <p className="text-gray-900">{selectedLocationData.coordinates.lng.toFixed(6)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Place ID:</label>
                      <p className="text-gray-900 text-xs break-all">{selectedLocationData.placeId || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Raw Data:</label>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(selectedLocationData, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Type in the search box to get Google Places autocomplete suggestions</li>
              <li>• Click on the map to select a location by coordinates</li>
              <li>• Drag the marker to fine-tune the selected location</li>
              <li>• Use the dropdown arrow to see local Sri Lankan city suggestions</li>
              <li>• Toggle the map visibility using the map icon button</li>
            </ul>
          </div>

          {/* Setup Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Setup Required:</h4>
            <ol className="text-yellow-800 text-sm space-y-1 list-decimal list-inside">
              <li>Get a Google Maps API key from Google Cloud Console</li>
              <li>Enable Maps JavaScript API, Places API, and Geocoding API</li>
              <li>Add your API key to .env file as VITE_GOOGLE_MAPS_API_KEY</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LocationTestPage;
