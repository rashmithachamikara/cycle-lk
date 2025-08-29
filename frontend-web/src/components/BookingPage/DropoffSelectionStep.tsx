import React, { useEffect, useState } from 'react';
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { Bike } from '../../services/bikeService';
import { Location } from '../../services/locationService';
import { Partner, partnerService } from '../../services/partnerService';
import GoogleMapsPlaces from './GoogleMapsPlaces';

interface DropoffSelectionStepProps {
  selectedBike: Bike;
  pickupLocation: Location;
  dropoffLocation: Location;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress?: string;
  onBack: () => void;
  onContinue: (selectedPartnerId: string) => void;
}

const DropoffSelectionStep: React.FC<DropoffSelectionStepProps> = ({
  selectedBike,
  pickupLocation,
  dropoffLocation,
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  onBack,
  onContinue
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  useEffect(() => {
    const fetchPartnersAtLocation = async () => {
      try {
        setPartnersLoading(true);
        const fetchedPartners: Partner[] = await partnerService.getPartnersByLocationId(dropoffLocation.id);
        console.log(`Available partners at ${dropoffLocation.name} location:`, fetchedPartners);
        setPartners(fetchedPartners);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setPartnersLoading(false);
      }
    };

    fetchPartnersAtLocation();
  }, [dropoffLocation.id, dropoffLocation.name]);

  // Helper function to get map center based on partners
  const getMapCenter = () => {
    if (partners.length === 0) {
      return { lat: 6.9271, lng: 79.8612 }; // Default to Colombo, Sri Lanka
    }

    // Calculate center from partner coordinates
    let totalLat = 0;
    let totalLng = 0;
    let validCoordinatesCount = 0;

    partners.forEach(partner => {
      if (partner.coordinates) {
        totalLat += partner.coordinates.latitude;
        totalLng += partner.coordinates.longitude;
        validCoordinatesCount++;
      } else if (partner.mapLocation?.coordinates) {
        totalLat += partner.mapLocation.coordinates.lat;
        totalLng += partner.mapLocation.coordinates.lng;
        validCoordinatesCount++;
      }
    });

    if (validCoordinatesCount === 0) {
      return { lat: 6.9271, lng: 79.8612 }; // Fallback to default
    }

    return {
      lat: totalLat / validCoordinatesCount,
      lng: totalLng / validCoordinatesCount
    };
  };

  // Convert partners to marker format
  const partnerMarkers = partners.map(partner => {
    let coordinates = { lat: 0, lng: 0 };
    
    // Get coordinates from either legacy coordinates or new mapLocation
    if (partner.coordinates) {
      coordinates = {
        lat: partner.coordinates.latitude,
        lng: partner.coordinates.longitude
      };
    } else if (partner.mapLocation?.coordinates) {
      coordinates = partner.mapLocation.coordinates;
    }

    return {
      id: partner._id,
      name: partner.companyName,
      coordinates,
      address: partner.address || partner.mapLocation?.address || 'Address not available'
    };
  }).filter(marker => marker.coordinates.lat !== 0 && marker.coordinates.lng !== 0); // Filter out invalid coordinates

  const handlePartnerSelect = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    console.log('Selected partner ID:', partnerId);
  };

  const handleContinue = () => {
    if (selectedPartnerId) {
      onContinue(selectedPartnerId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="my-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select Drop-off Location
        </h1>
        <p className="text-gray-600">
          Choose your preferred partner location for returning the bike
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Drop-off Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DROP-OFF LOCATIONS SECTION */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-8 border border-blue-500">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Drop-off Information</h2>
            </div>
            
            <div className="grid lg:grid-rows-2 gap-6">
              {/* Pickup Location Display */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                </div>
                <p className="text-gray-700 font-medium">{pickupLocation.name}</p>
                <p className="text-gray-600 text-sm">{pickupLocation.region}</p>
                
                {/* Show pickup location on map */}
                <div className="mt-4">
                  <GoogleMapsPlaces
                    value=""
                    onChange={() => {}}
                    zoom={15}
                    showMap={true}
                    showSearch={false}
                    enableInteraction={false}
                    showLocationMarker={true}
                    initialCenter={{ 
                      lat: pickupLocation.coordinates?.latitude || 6.9271, 
                      lng: pickupLocation.coordinates?.longitude || 79.8612 
                    }}
                    partnerMarkers={[]}
                    mapHeight="300px"
                    placeholder="Pickup location"
                  />
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-600 text-sm">
                      📍 This is your bike pickup location
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Drop-off Locations */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-gray-900">
                    Available Drop-off Locations at {dropoffLocation.name} - {partners.length} found
                  </h3>
                </div>
                
                {/* Google Map showing partner locations */}
                {partnersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading partner locations...</span>
                  </div>
                ) : (
                  <GoogleMapsPlaces
                    value=""
                    onChange={() => {}}
                    zoom={14}
                    showMap={true}
                    showSearch={false}
                    enableInteraction={true}
                    showLocationMarker={false}
                    initialCenter={getMapCenter()}
                    partnerMarkers={partnerMarkers}
                    mapHeight="400px"
                    placeholder="Partner locations"
                  />
                )}
                
                {partners.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-600 text-sm mt-1">
                      Click on the green markers on the map to see drop-off location details
                    </p>
                  </div>
                )}
              </div>
            </div>

            {deliveryAddress && (
              <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">Custom Delivery Address:</h4>
                <p className="text-gray-700">{deliveryAddress}</p>
              </div>
            )}
          </div>

          {/* Partner Details List */}
          {partners.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Available Drop-off Partners</h3>
                <p className="text-gray-600">Please select a partner to set as your preferred drop-off location</p>
              </div>
              
              <div className="space-y-4">
                {partners.map((partner) => (
                  <button 
                    key={partner._id} 
                    className={`w-full text-left cursor-pointer transition-all duration-200 ${
                      selectedPartnerId === partner._id 
                        ? 'ring-2 ring-blue-500 transform scale-[1.02] shadow-lg' 
                        : 'hover:scale-[1.01] hover:shadow-md'
                    }`}
                    onClick={() => handlePartnerSelect(partner._id)}
                  >
                    <div className={`rounded-lg p-6 border-2 ${
                      selectedPartnerId === partner._id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              selectedPartnerId === partner._id ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <h4 className="font-semibold text-gray-900 text-lg">{partner.companyName}</h4>
                            {partner.verified && (
                              <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                ✓ Verified
                              </span>
                            )}
                            {selectedPartnerId === partner._id && (
                              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 text-sm">
                            {/* Address */}
                            <div>
                              <p className="text-gray-600 font-medium mb-1">Address:</p>
                              <p className="text-gray-800">
                                {partner.address || partner.mapLocation?.address || 'Address not available'}
                              </p>
                            </div>

                            {/* Contact Info */}
                            <div>
                              <p className="text-gray-600 font-medium mb-1">Contact:</p>
                              {partner.phone && (
                                <p className="text-gray-800">📞 {partner.phone}</p>
                              )}
                              {partner.email && (
                                <p className="text-gray-800">✉️ {partner.email}</p>
                              )}
                              {!partner.phone && !partner.email && (
                                <p className="text-gray-500">Contact details not available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Bike:</span>
                <span className="font-semibold">{selectedBike.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold capitalize">{selectedBike.type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup:</span>
                <span className="font-semibold">{pickupLocation.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Drop-off:</span>
                <span className="font-semibold">{dropoffLocation.name}</span>
              </div>
              
              <hr className="my-4" />
              
              <div className="flex justify-between">
                <span className="text-gray-600">Start:</span>
                <span className="font-semibold">{startDate} {startTime}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">End:</span>
                <span className="font-semibold">{endDate} {endTime}</span>
              </div>
              
              {deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-semibold">Included</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700">
                <span className="text-sm font-medium">
                  {selectedPartnerId ? 'Partner selected! Ready to continue.' : 'Please select a drop-off partner to continue.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid lg:grid-cols-2 gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex items-center justify-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rental Period
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedPartnerId}
          className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            selectedPartnerId
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Continue to Confirmation
        </button>
      </div>
    </div>
  );
};

export default DropoffSelectionStep;
