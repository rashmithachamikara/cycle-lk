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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Where would you like to
              <span className="text-blue-600 block">Ride today?</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose your pickup and drop-off locations to start your cycling adventure. 
              Explore beautiful destinations across Sri Lanka with our premium bike rental service.
            </p>
          </div>

          {error && (
            <div className="mb-8">
              <ErrorAlert message={error} />
            </div>
          )}

          {/* Location Selection Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {/* Pickup Location Dropdown */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Pickup Location
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPickupDropdown(!showPickupDropdown);
                      setShowDropoffDropdown(false);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-green-500 mr-3" />
                      <span className={pickupLocation ? 'text-gray-900' : 'text-gray-500'}>
                        {pickupLocation ? pickupLocation.name : 'Select pickup location'}
                      </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showPickupDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Pickup Dropdown */}
                  {showPickupDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {locations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setPickupLocation(location);
                            setShowPickupDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-green-500 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">{location.name}</div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Drop-off Location
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDropoffDropdown(!showDropoffDropdown);
                      setShowPickupDropdown(false);
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-red-500 mr-3" />
                      <span className={dropoffLocation ? 'text-gray-900' : 'text-gray-500'}>
                        {dropoffLocation ? dropoffLocation.name : 'Select drop-off location'}
                      </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showDropoffDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Drop-off Dropdown */}
                  {showDropoffDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                      {locations.map((location) => (
                        <button
                          key={location.id}
                          onClick={() => {
                            setDropoffLocation(location);
                            setShowDropoffDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-red-500 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">{location.name}</div>
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
              className={`w-full py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
                pickupLocation && dropoffLocation
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Bike Selection
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>

            {/* Selected Locations Summary */}
            {(pickupLocation || dropoffLocation) && (
              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Locations:</h3>
                <div className="space-y-2 text-sm">
                  {pickupLocation && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 text-green-500 mr-2" />
                      <span>Pickup: {pickupLocation.name}, {pickupLocation.region}</span>
                    </div>
                  )}
                  {dropoffLocation && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-4 w-4 text-red-500 mr-2" />
                      <span>Drop-off: {dropoffLocation.name}, {dropoffLocation.region}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Locations</h3>
              <p className="text-gray-600">Choose from various pickup and drop-off points across Sri Lanka</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Fast booking process with instant confirmation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Premium bikes with comprehensive insurance coverage</p>
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
