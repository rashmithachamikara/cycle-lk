import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Building, Star } from 'lucide-react';
import { MapLocationInput } from '../forms';
import { type ServiceLocation, type CityServiceData } from './types';
import { SRI_LANKAN_LOCATIONS } from './constants';

interface ServiceLocationManagerProps {
  serviceCities: string[];
  serviceLocations: CityServiceData[];
  onServiceCitiesChange: (cities: string[]) => void;
  onServiceLocationsChange: (locations: CityServiceData[]) => void;
}

const ServiceLocationManager: React.FC<ServiceLocationManagerProps> = ({
  serviceCities,
  serviceLocations,
  onServiceCitiesChange,
  onServiceLocationsChange
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [newCityInput, setNewCityInput] = useState('');

  // Initialize service locations when cities change
  useEffect(() => {
    const updatedLocations = serviceCities.map(city => {
      const existingCity = serviceLocations.find(loc => loc.cityName === city);
      return existingCity || {
        cityName: city,
        locations: []
      };
    });
    
    // Only update if there are actual changes
    if (JSON.stringify(updatedLocations) !== JSON.stringify(serviceLocations)) {
      onServiceLocationsChange(updatedLocations);
    }
  }, [serviceCities, serviceLocations, onServiceLocationsChange]);

  const addCity = (cityName: string) => {
    if (cityName && !serviceCities.includes(cityName)) {
      onServiceCitiesChange([...serviceCities, cityName]);
      setSelectedCity(cityName);
      setNewCityInput('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    onServiceCitiesChange(serviceCities.filter(city => city !== cityToRemove));
    if (selectedCity === cityToRemove) {
      setSelectedCity('');
    }
  };

  const addLocationToCity = (cityName: string) => {
    const newLocation: ServiceLocation = {
      id: Date.now().toString(),
      name: '',
      address: '',
      coordinates: {
        lat: 6.9271, // Default to Colombo
        lng: 79.8612
      }
    };

    const updatedLocations = serviceLocations.map(cityData => {
      if (cityData.cityName === cityName) {
        return {
          ...cityData,
          locations: [...cityData.locations, newLocation]
        };
      }
      return cityData;
    });

    onServiceLocationsChange(updatedLocations);
  };

  const updateLocationInCity = (cityName: string, locationId: string, updates: Partial<ServiceLocation>) => {
    const updatedLocations = serviceLocations.map(cityData => {
      if (cityData.cityName === cityName) {
        return {
          ...cityData,
          locations: cityData.locations.map(location => 
            location.id === locationId 
              ? { ...location, ...updates }
              : location
          )
        };
      }
      return cityData;
    });

    onServiceLocationsChange(updatedLocations);
  };

  const removeLocationFromCity = (cityName: string, locationId: string) => {
    const updatedLocations = serviceLocations.map(cityData => {
      if (cityData.cityName === cityName) {
        return {
          ...cityData,
          locations: cityData.locations.filter(location => location.id !== locationId)
        };
      }
      return cityData;
    });

    onServiceLocationsChange(updatedLocations);
  };

  const toggleMainLocation = (cityName: string, locationId: string) => {
    const updatedLocations = serviceLocations.map(cityData => {
      if (cityData.cityName === cityName) {
        return {
          ...cityData,
          locations: cityData.locations.map(location => ({
            ...location,
            isMainLocation: location.id === locationId ? !location.isMainLocation : false
          }))
        };
      }
      return cityData;
    });

    onServiceLocationsChange(updatedLocations);
  };

  const currentCityData = serviceLocations.find(city => city.cityName === selectedCity);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Service Locations</h3>
        <p className="text-gray-600">Specify the cities and exact locations where you provide bike rental services</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Cities Selection */}
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium text-emerald-800 mb-3 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Service Cities
            </h4>
            
            {/* Add City Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCityInput}
                  onChange={(e) => setNewCityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCity(newCityInput)}
                  placeholder="Enter city name"
                  className="flex-1 px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  list="sri-lankan-cities"
                />
                <button
                  type="button"
                  onClick={() => addCity(newCityInput)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <datalist id="sri-lankan-cities">
                {SRI_LANKAN_LOCATIONS.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>

              {/* Quick Add Popular Cities */}
              <div className="flex flex-wrap gap-2">
                {['Colombo', 'Kandy', 'Galle', 'Negombo'].map(city => (
                  !serviceCities.includes(city) && (
                    <button
                      key={city}
                      type="button"
                      onClick={() => addCity(city)}
                      className="px-3 py-1 text-sm bg-white border border-emerald-300 text-emerald-700 rounded-full hover:bg-emerald-50"
                    >
                      + {city}
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Selected Cities List */}
            {serviceCities.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-emerald-700">Selected Cities:</p>
                {serviceCities.map(city => (
                  <div
                    key={city}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCity === city 
                        ? 'bg-emerald-100 border-emerald-300' 
                        : 'bg-white border-emerald-200 hover:bg-emerald-50'
                    }`}
                    onClick={() => setSelectedCity(city)}
                  >
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-emerald-600 mr-2" />
                      <span className="font-medium text-gray-900">{city}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({serviceLocations.find(loc => loc.cityName === city)?.locations.length || 0} locations)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCity(city);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Location Details */}
        <div className="space-y-4">
          {selectedCity ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-blue-800 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations in {selectedCity}
                </h4>
                <button
                  type="button"
                  onClick={() => addLocationToCity(selectedCity)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Location
                </button>
              </div>

              {currentCityData?.locations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No locations added for {selectedCity}</p>
                  <p className="text-sm">Click "Add Location" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentCityData?.locations.map((location, index) => (
                    <div key={location.id} className="bg-white border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Location {index + 1}
                          </span>
                          {location.isMainLocation && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Main
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => toggleMainLocation(selectedCity, location.id)}
                            className={`p-1 rounded ${location.isMainLocation ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                            title={location.isMainLocation ? 'Remove main location' : 'Set as main location'}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLocationFromCity(selectedCity, location.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location Name
                          </label>
                          <input
                            type="text"
                            value={location.name}
                            onChange={(e) => updateLocationInCity(selectedCity, location.id, { name: e.target.value })}
                            placeholder="e.g., Main Store, Beach Branch, etc."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search & Select Location
                          </label>
                          <MapLocationInput
                            value={location.address}
                            onChange={(value, locationData) => {
                              const updates: Partial<ServiceLocation> = { address: value };
                              if (locationData) {
                                updates.coordinates = {
                                  lat: locationData.coordinates.lat,
                                  lng: locationData.coordinates.lng
                                };
                                updates.placeId = locationData.placeId;
                              }
                              updateLocationInCity(selectedCity, location.id, updates);
                            }}
                            placeholder="Search for exact location or click on map"
                            showMap={true}
                            mapHeight="200px"
                            suggestions={[selectedCity]}
                          />
                        </div>

                        {location.coordinates.lat !== 6.9271 || location.coordinates.lng !== 79.8612 ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                            <p className="text-sm text-green-800">
                              📍 Coordinates: {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="font-medium text-gray-700 mb-2">Select a City</h4>
              <p className="text-gray-500">
                Choose a city from the left to add your service locations
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {serviceCities.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
          <div className="text-sm text-gray-600">
            <p>
              <strong>{serviceCities.length}</strong> cities selected, {' '}
              <strong>{serviceLocations.reduce((total, city) => total + city.locations.length, 0)}</strong> total locations
            </p>
            {serviceLocations.some(city => city.locations.some(loc => loc.isMainLocation)) && (
              <p className="mt-1">
                Main locations: {serviceLocations.flatMap(city => 
                  city.locations.filter(loc => loc.isMainLocation).map(loc => `${loc.name || 'Unnamed'} (${city.cityName})`)
                ).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceLocationManager;
