import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, ArrowRight, Zap, Shield } from 'lucide-react';
import { locationService, Location } from '../../services/locationService';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

interface LocationSelectionStepProps {
  onLocationSelect: (pickupLocation: Location, dropoffLocation: Location) => void;
}

const LocationSelectionStep: React.FC<LocationSelectionStepProps> = ({
  onLocationSelect
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const fetchedLocations = await locationService.getAllLocations();
        setLocations(fetchedLocations);
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleContinue = () => {
    if (pickupLocation && dropoffLocation) {
      onLocationSelect(pickupLocation, dropoffLocation);
    }
  };

  if (loading) {
   <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-24">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
              Where would you like to
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block p-3">Ride today?</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Choose your pickup and drop-off locations to start your cycling adventure. 
              Explore beautiful destinations across Sri Lanka with our premium bike rental service.
            </p>
            
            {/* Decorative Line */}
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mt-8 rounded-full"></div>
          </div>

          {error && (
            <div className="mb-12">
              <ErrorAlert message={error} />
            </div>
          )}

          {/* Location Selection Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16 max-w-4xl mx-auto border border-gray-100">
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              {/* Pickup Location Dropdown */}
              <div className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Pickup Location
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPickupDropdown(!showPickupDropdown);
                      setShowDropoffDropdown(false);
                    }}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 hover:border-blue-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-6 w-6 text-green-500 mr-4" />
                      <span className={`text-lg ${pickupLocation ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {pickupLocation ? pickupLocation.name : 'Select pickup location'}
                      </span>
                    </div>
                    <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${showPickupDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Pickup Dropdown */}
                  {showPickupDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-10 max-h-72 overflow-y-auto">
                      {locations.map((location, index) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setPickupLocation(location);
                            setShowPickupDropdown(false);
                          }}
                          className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-green-600 font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-base">{location.name}</div>
                              <div className="text-sm text-gray-500">{location.region}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drop-off Location Dropdown */}
              <div className="relative">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Drop-off Location
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDropoffDropdown(!showDropoffDropdown);
                      setShowPickupDropdown(false);
                    }}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 hover:border-red-300 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-6 w-6 text-red-500 mr-4" />
                      <span className={`text-lg ${dropoffLocation ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {dropoffLocation ? dropoffLocation.name : 'Select drop-off location'}
                      </span>
                    </div>
                    <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${showDropoffDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Drop-off Dropdown */}
                  {showDropoffDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-10 max-h-72 overflow-y-auto">
                      {locations.map((location, index) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setDropoffLocation(location);
                            setShowDropoffDropdown(false);
                          }}
                          className="w-full px-6 py-4 text-left hover:bg-red-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-red-600 font-bold text-sm">{(index + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-base">{location.name}</div>
                              <div className="text-sm text-gray-500">{location.region}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!pickupLocation || !dropoffLocation}
              className={`w-full py-6 px-12 rounded-2xl font-semibold text-xl transition-all duration-300 flex items-center justify-center ${
                pickupLocation && dropoffLocation
                  ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Bike Selection
              <ArrowRight className="h-6 w-6 ml-3" />
            </button>

            {/* Selected Locations Summary */}
            {(pickupLocation || dropoffLocation) && (
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Selected Locations:</h3>
                <div className="space-y-3">
                  {pickupLocation && (
                    <div className="flex items-center text-gray-700">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-base font-medium">Pickup: {pickupLocation.name}, {pickupLocation.region}</span>
                    </div>
                  )}
                  {dropoffLocation && (
                    <div className="flex items-center text-gray-700">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <MapPin className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-base font-medium">Drop-off: {dropoffLocation.name}, {dropoffLocation.region}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-12 mt-24 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MapPin className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Locations</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Choose from various pickup and drop-off points across Sri Lanka</p>
              
              {/* Decorative Line */}
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick & Easy</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Fast booking process with instant confirmation</p>
              
              {/* Decorative Line */}
              <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safe & Secure</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Premium bikes with comprehensive insurance coverage</p>
              
              {/* Decorative Line */}
              <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mt-4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showPickupDropdown || showDropoffDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowPickupDropdown(false);
            setShowDropoffDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default LocationSelectionStep;
