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
  pickupPartner: Partner | null;
  setPickupPartner: React.Dispatch<React.SetStateAction<Partner | null>>;
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
  pickupPartner,
  setPickupPartner,
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  onBack,
  onContinue,
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchPartnersAtLocation = async () => {
      try {
        setPartnersLoading(true);
        
        // Only fetch pickup partner if currentPartnerId exists
        if (selectedBike.currentPartnerId) {
          try {
            // Handle currentPartnerId properly - it can be string or object
            let partnerIdToFetch: string;
            
            if (typeof selectedBike.currentPartnerId === 'string') {
              partnerIdToFetch = selectedBike.currentPartnerId;
            } else if (typeof selectedBike.currentPartnerId === 'object' && selectedBike.currentPartnerId._id) {
              partnerIdToFetch = selectedBike.currentPartnerId._id;
            } else {
              console.error('Invalid currentPartnerId format:', selectedBike.currentPartnerId);
              setPickupPartner(null);
              return;
            }
            
            console.log('Fetching pickup partner with ID:', partnerIdToFetch);
            const fetchedPickupPartner: Partner | null = await partnerService.getPartnerById(partnerIdToFetch);
            setPickupPartner(fetchedPickupPartner);
          } catch (error) {
            console.error('Error fetching pickup partner:', error);
            setPickupPartner(null);
          }
        }
        
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
  }, [dropoffLocation.id, dropoffLocation.name, selectedBike.currentPartnerId, setPickupPartner]);

  // Helper function to get map center based on partners or selected partner
  const getMapCenter = () => {
    // If a specific center is set (when partner is selected), use that
    if (mapCenter) {
      return mapCenter;
    }

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
    
    // Find the selected partner and pan map to its location
    const selectedPartner = partners.find(partner => partner._id === partnerId);
    if (selectedPartner) {
      let partnerCoordinates = null;
      
      // Get coordinates from either legacy coordinates or new mapLocation
      if (selectedPartner.coordinates) {
        partnerCoordinates = {
          lat: selectedPartner.coordinates.latitude,
          lng: selectedPartner.coordinates.longitude
        };
      } else if (selectedPartner.mapLocation?.coordinates) {
        partnerCoordinates = selectedPartner.mapLocation.coordinates;
      }
      
      if (partnerCoordinates) {
        // Update map center to pan to selected partner
        setMapCenter(partnerCoordinates);
        console.log('Panning map to partner location:', partnerCoordinates);
      }
    }
  };

  const handleContinue = () => {
    if (selectedPartnerId) {
      onContinue(selectedPartnerId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 lg:px-6">
      {/* Header */}
      <div className="my-4 md:my-8 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
          Select 
           <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block my-1 p-1 md:p-2">Drop-off Location</span>
            
        </h1>
         {/* Decorative Line */}
            <div className="w-20 md:w-32 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mt-4 md:mt-8 rounded-full"></div>
        <p className="text-gray-600 text-base md:text-xl mt-2 px-2">
          Choose your preferred partner location for returning the bike
        </p>
      </div>

      <div className="">
        {/* Main Content - Drop-off Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DROP-OFF LOCATIONS SECTION */}
          <div className="rounded-2xl md:rounded-3xl md:shadow-2xl md:p-6 lg:p-10 md:border p-0 border-gray-100">
            <div className="flex items-center mb-4 md:mb-6">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mr-2 md:mr-3" />
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Drop-off Information</h2>
            </div>
            
            <div className="grid gap-4 md:gap-6">

              {/* Pickup Location Display */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm h-auto lg:h-[580px] flex flex-col">
                    <div className="flex items-center mb-3 md:mb-4 flex-shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 md:mr-3"></div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">Pickup Location</h3>
                    </div>
                    <div className="flex-shrink-0 mb-4">
                      <p className="text-gray-700 font-medium text-sm md:text-base">{pickupLocation.name}</p>
                      <p className="text-gray-600 text-xs md:text-sm">{pickupLocation.region}</p>
                    </div>
                    
                    {/* Show pickup location on map */}
                    <div className="flex-1 min-h-0 flex flex-col">
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
                        mapHeight="400px"
                        placeholder="Pickup location"
                      />
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 flex-shrink-0">
                        <p className="text-blue-600 text-xs md:text-sm">
                          📍 This is your bike pickup location
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  {/* Pickup Partner Information */}
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm h-auto lg:h-[580px] flex flex-col">
                    <div className="flex items-center mb-3 md:mb-4 flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 md:mr-3"></div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">Pickup Partner</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      {pickupPartner ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base lg:text-lg">{pickupPartner.companyName}</h4>
                            {pickupPartner.verified && (
                              <span className="inline-block mt-2 px-2 md:px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                ✓ Verified Partner
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                            {/* Address */}
                            <div>
                              <p className="text-gray-600 font-medium mb-1">Address:</p>
                              <p className="text-gray-800">
                                {pickupPartner.address || pickupPartner.mapLocation?.address || 'Address not available'}
                              </p>
                            </div>

                            {/* Contact Info */}
                            <div>
                              <p className="text-gray-600 font-medium mb-1">Contact:</p>
                              {pickupPartner.phone && (
                                <p className="text-gray-800">📞 {pickupPartner.phone}</p>
                              )}
                              {pickupPartner.email && (
                                <p className="text-gray-800">✉️ {pickupPartner.email}</p>
                              )}
                              {!pickupPartner.phone && !pickupPartner.email && (
                                <p className="text-gray-500">Contact details not available</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-700 text-sm font-medium">
                              🚲 Your bike will be collected from this partner
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-gray-500 mb-2">No pickup partner assigned</div>
                            <p className="text-gray-400 text-sm">
                              Partner information will be available after booking confirmation
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>  
              </div>

              
              
              {/* Drop-off Locations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm h-auto lg:h-[580px] flex flex-col">
                    <div className="flex items-center mb-3 md:mb-4 flex-shrink-0">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2 md:mr-3"></div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        Available Drop-off Locations at {dropoffLocation.name}
                      </h3>
                    </div>
                    
                    {/* Google Map showing partner locations */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      {partnersLoading ? (
                        <div className="flex items-center justify-center py-6 md:py-8 flex-1">
                          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600 text-sm md:text-base">Loading partner locations...</span>
                        </div>
                      ) : (
                        <GoogleMapsPlaces
                          key={`map-${mapCenter?.lat}-${mapCenter?.lng}`} // Force re-render when center changes
                          value=""
                          onChange={() => {}}
                          zoom={mapCenter ? 16 : 14} // Zoom in more when focusing on a specific partner
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
                    </div>
                    
                    {partners.length > 0 && (
                      <div className="mt-3 md:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
                        <div className="p-2 md:p-3 bg-green-50 rounded-lg border border-green-200 flex-1">
                          <p className="text-green-600 text-xs md:text-sm">
                            {selectedPartnerId && mapCenter 
                              ? `🎯 Map focused on: ${partners.find(p => p._id === selectedPartnerId)?.companyName || 'Selected partner'}`
                              : '📍 Click on green markers or select a partner below to focus on their location'
                            }
                          </p>
                        </div>
                        {mapCenter && (
                          <button
                            onClick={() => setMapCenter(null)}
                            className="px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors whitespace-nowrap"
                          >
                            View All
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  {/* Partner Details List */}
                  {partners.length > 0 ? (
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm h-auto lg:h-[580px] flex flex-col">
                      <div className="mb-3 md:mb-4 flex-shrink-0">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Available Drop-off Partners ({partners.length} found)</h3>
                        <p className="text-gray-600 text-xs md:text-sm">Select a partner for your preferred drop-off location</p>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 md:pr-2 max-h-96 lg:max-h-none">
                        <div className="space-y-2 md:space-y-3 p-1">
                          {partners.map((partner) => (
                            <button 
                              key={partner._id} 
                              className={`w-full text-left cursor-pointer transition-all duration-200 rounded-lg ${
                                selectedPartnerId === partner._id 
                                  ? 'ring-2  shadow-md' 
                                  : 'hover:shadow-sm'
                              }`}
                              onClick={() => handlePartnerSelect(partner._id)}
                            >
                              <div className={`p-2 md:p-3 border-2 rounded-lg transition-all duration-300 ${
                                selectedPartnerId === partner._id 
                                  ? mapCenter 
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-purple-300 shadow-md' 
                                    : 'bg-blue-50 border-blue-300'
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="min-w-0">
                                  <div className="flex items-center mb-1 md:mb-2">
                                    <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                                      selectedPartnerId === partner._id ? 'bg-blue-500' : 'bg-green-500'
                                    }`}></div>
                                    <h4 className="font-semibold text-gray-900 text-xs md:text-sm truncate">{partner.companyName}</h4>
                                  </div>
                                  
                                  <div className="space-y-0.5 md:space-y-1 text-xs mb-1 md:mb-2">
                                    <p className="text-gray-600 break-words leading-tight">
                                      {partner.address || partner.mapLocation?.address || 'Address not available'}
                                    </p>
                                    {partner.phone && (
                                      <p className="text-gray-600 break-all">📞 {partner.phone}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {partner.verified && (
                                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium flex-shrink-0">
                                        ✓ Verified
                                      </span>
                                    )}
                                    {selectedPartnerId === partner._id && (
                                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium flex-shrink-0">
                                        ✓ Selected
                                      </span>
                                    )}
                                    {mapCenter && selectedPartnerId === partner._id && (
                                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium flex-shrink-0">
                                        🎯 Focused
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm h-auto lg:h-[580px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-500 mb-2 text-sm md:text-base">No partners available</div>
                        <p className="text-gray-400 text-xs md:text-sm">
                          No drop-off partners found at {dropoffLocation.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
          {/* This section has been moved next to the map above */}
        </div>

        
      </div>
     {/*  Booking Summary */}
        <div className="w-full">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 sticky top-4 md:top-8 mt-4 md:mt-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">Booking Summary</h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-gray-600 text-sm md:text-base">Bike:</span>
                <span className="font-semibold text-sm md:text-base text-right">{selectedBike.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm md:text-base">Type:</span>
                <span className="font-semibold capitalize text-sm md:text-base">{selectedBike.type}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 text-sm md:text-base">Pickup:</span>
                <span className="font-semibold text-sm md:text-base text-right">{pickupLocation.name}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 text-sm md:text-base">Drop-off:</span>
                <span className="font-semibold text-sm md:text-base text-right">{dropoffLocation.name}</span>
              </div>
              
              <hr className="my-3 md:my-4" />
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 text-sm md:text-base">Start:</span>
                <span className="font-semibold text-sm md:text-base text-right">{startDate} {startTime}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 text-sm md:text-base">End:</span>
                <span className="font-semibold text-sm md:text-base text-right">{endDate} {endTime}</span>
              </div>
              
              {deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm md:text-base">Delivery:</span>
                  <span className="font-semibold text-sm md:text-base">Included</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700">
                <span className="text-xs md:text-sm font-medium">
                  {selectedPartnerId ? 'Partner selected! Ready to continue.' : 'Please select a drop-off partner to continue.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 px-4 md:px-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm md:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rental Period
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedPartnerId}
          className={`flex items-center justify-center px-4 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base ${
            selectedPartnerId
              ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Confirmation
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default DropoffSelectionStep;
