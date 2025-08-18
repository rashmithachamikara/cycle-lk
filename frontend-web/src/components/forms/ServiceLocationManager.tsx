import React, { useState } from 'react';
import { Plus, X, MapPin, Building2, Star } from 'lucide-react';
import GoogleMapsPlacesInput from './GoogleMapsPlacesInput';

interface LocationData {
  coordinates: { lat: number; lng: number };
  placeId?: string;
  formattedAddress?: string;
  name?: string;
  types?: string[];
}

interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  isMainLocation?: boolean;
}

interface CityServiceData {
  city: string;
  locations: ServiceLocation[];
}

interface ServiceLocationManagerProps {
  serviceCities: CityServiceData[];
  onChange: (cities: CityServiceData[]) => void;
  className?: string;
}

const SRI_LANKAN_CITIES = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura',
  'Polonnaruwa', 'Trincomalee', 'Batticaloa', 'Matara', 'Ratnapura',
  'Badulla', 'Kurunegala', 'Puttalam', 'Kalutara', 'Gampaha',
  'Hambantota', 'Vavuniya', 'Kalmunai', 'Panadura'
];

const ServiceLocationManager: React.FC<ServiceLocationManagerProps> = ({
  serviceCities,
  onChange,
  className = ""
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  const addCity = (city: string) => {
    if (!city || serviceCities.some(sc => sc.city === city)) return;
    
    const newCities = [...serviceCities, { city, locations: [] }];
    onChange(newCities);
    setSelectedCity(city);
  };

  const removeCity = (cityToRemove: string) => {
    const newCities = serviceCities.filter(sc => sc.city !== cityToRemove);
    onChange(newCities);
    if (selectedCity === cityToRemove) {
      setSelectedCity(newCities.length > 0 ? newCities[0].city : '');
    }
  };

  const addLocationToCity = (city: string, locationData: LocationData) => {
    const newLocation: ServiceLocation = {
      id: Date.now().toString(),
      name: locationData.name || locationData.formattedAddress || 'Unknown Location',
      address: locationData.formattedAddress || 'Unknown Address',
      coordinates: locationData.coordinates,
      placeId: locationData.placeId,
      isMainLocation: false
    };

    const newCities = serviceCities.map(sc => {
      if (sc.city === city) {
        return {
          ...sc,
          locations: [...sc.locations, newLocation]
        };
      }
      return sc;
    });

    onChange(newCities);
    setShowLocationInput(false);
  };

  const removeLocation = (city: string, locationId: string) => {
    const newCities = serviceCities.map(sc => {
      if (sc.city === city) {
        return {
          ...sc,
          locations: sc.locations.filter(loc => loc.id !== locationId)
        };
      }
      return sc;
    });
    onChange(newCities);
  };

  const setMainLocation = (city: string, locationId: string) => {
    const newCities = serviceCities.map(sc => {
      if (sc.city === city) {
        return {
          ...sc,
          locations: sc.locations.map(loc => ({
            ...loc,
            isMainLocation: loc.id === locationId
          }))
        };
      }
      return sc;
    });
    onChange(newCities);
  };

  const currentCityData = serviceCities.find(sc => sc.city === selectedCity);

  return (
    <div className={`flex gap-6 h-96 ${className}`}>
      {/* Left Panel - Cities */}
      <div className="w-1/3 border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Service Cities
        </h3>
        
        {/* Add City Dropdown */}
        <div className="mb-4">
          <select
            className="w-full p-2 border rounded-md text-sm"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                addCity(e.target.value);
              }
            }}
          >
            <option value="">Select a city to add...</option>
            {SRI_LANKAN_CITIES
              .filter(city => !serviceCities.some(sc => sc.city === city))
              .map(city => (
                <option key={city} value={city}>{city}</option>
              ))
            }
          </select>
        </div>

        {/* Cities List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {serviceCities.map((cityData) => (
            <div
              key={cityData.city}
              className={`p-3 rounded-md border-2 transition-all cursor-pointer ${
                selectedCity === cityData.city
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCity(cityData.city)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{cityData.city}</div>
                  <div className="text-xs text-gray-500">
                    {cityData.locations.length} location{cityData.locations.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCity(cityData.city);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {serviceCities.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">
            No cities selected. Choose a city from the dropdown above.
          </div>
        )}
      </div>

      {/* Right Panel - Locations */}
      <div className="flex-1 border rounded-lg p-4 bg-white">
        {selectedCity ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Locations in {selectedCity}
              </h3>
              <button
                onClick={() => setShowLocationInput(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>

            {showLocationInput && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Add New Location</h4>
                  <button
                    onClick={() => setShowLocationInput(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <GoogleMapsPlacesInput
                  value=""
                  onChange={(_, locationData) => {
                    if (locationData) {
                      addLocationToCity(selectedCity, locationData);
                    }
                  }}
                  placeholder={`Search for locations in ${selectedCity}...`}
                />
              </div>
            )}

            {/* Locations List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {currentCityData?.locations.map((location) => (
                <div
                  key={location.id}
                  className="p-3 border rounded-md bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{location.name}</h4>
                        {location.isMainLocation && (
                          <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            <Star className="w-3 h-3" />
                            Main
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{location.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!location.isMainLocation && (
                        <button
                          onClick={() => setMainLocation(selectedCity, location.id)}
                          className="text-xs px-2 py-1 text-yellow-600 hover:text-yellow-800"
                          title="Set as main location"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => removeLocation(selectedCity, location.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!currentCityData?.locations || currentCityData.locations.length === 0) && (
              <div className="text-center text-gray-500 py-8 text-sm">
                No locations added for {selectedCity}. Click "Add Location" to get started.
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Select a city from the left panel to manage its locations
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceLocationManager;