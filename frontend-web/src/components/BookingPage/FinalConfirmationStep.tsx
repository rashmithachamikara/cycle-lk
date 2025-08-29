import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { Bike } from '../../services/bikeService';
import { Location } from '../../services/locationService';
import { Partner, partnerService } from '../../services/partnerService';
import GoogleMapsPlaces from './GoogleMapsPlaces';

interface FinalConfirmationStepProps {
  selectedBike: Bike;
  pickupLocation: Location;
  dropoffLocation: Location;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  deliveryAddress?: string;
  totalPrice: number;
  onBack: () => void;
  onConfirmBooking: () => void;
  isBooking: boolean;
}

const FinalConfirmationStep: React.FC<FinalConfirmationStepProps> = ({
  selectedBike,
  pickupLocation,
  dropoffLocation,
  startDate,
  startTime,
  endDate,
  endTime,
  deliveryAddress,
  totalPrice,
  onBack,
  onConfirmBooking,
  isBooking
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const formatDate = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const startDateTime = formatDate(startDate, startTime);
  const endDateTime = formatDate(endDate, endTime);
  const duration = Math.ceil((new Date(`${endDate}T${endTime}`).getTime() - new Date(`${startDate}T${startTime}`).getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    // Perform any side effects or data fetching here
    const fetchPartnersAtLocation = async () => {
      // Fetch partners based on the dropoff location
      try{
        setPartnersLoading(true);
        const fetchedPartners: Partner[] = await partnerService.getPartnersByLocationId(dropoffLocation.id);
        console.log(`available partners at ${dropoffLocation.name} location:`, fetchedPartners);
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="my-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Confirm Your Booking
        </h1>
        <p className="text-gray-600">
          Review your booking details before confirming
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Confirmation Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DROP-OFF LOCATIONS - TOP SECTION */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg p-8 border- border-blue-500">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Drop-off Information</h2>
            </div>
            
            <div className="grid md:grid-rows-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                </div>
                <p className="text-gray-700 font-medium">{pickupLocation.name}</p>
                <p className="text-gray-600 text-sm">{pickupLocation.region}</p>
                {/* <GoogleMapsPlaces
                    value=""
                    onChange={() => {}} // No need for onChange as this is display only
                    zoom={14}
                    showMap={true}
                    showSearch={false} // Hide search input for display-only map
                    initialCenter={{ lat: pickupLocation.coordinates.latitude, lng: pickupLocation.coordinates.longitude }}
                    partnerMarkers={partnerMarkers}
                    mapHeight="400px"
                    placeholder="Pickup location"
                  /> */}
 
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <h3 className="font-semibold text-gray-900">Available Drop-off Locations at {dropoffLocation.name} - {partners.length} found</h3>
                </div>
                {/* <p className="text-gray-700 font-medium">{dropoffLocation.name}</p>
                <p className="text-gray-600 text-sm">{dropoffLocation.region}</p> */}
                {/* showing google map here to show drop-off locations here */}
                {partnersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading partner locations...</span>
                  </div>
                ) : (
                  <GoogleMapsPlaces
                    value=""
                    onChange={() => {}} // No need for onChange as this is display only
                    zoom={14}
                    showMap={true}
                    showSearch={false} // Hide search input for display-only map
                    enableInteraction={true} // Allow map panning and zooming
                    showLocationMarker={false} // Hide the red location selection marker
                    initialCenter={getMapCenter()}
                    partnerMarkers={partnerMarkers}
                    mapHeight="400px"
                    placeholder="Partner locations"
                  />
                )}
                {partners.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    {/* <p className="text-green-700 text-sm font-medium">
                      Found {partners.length} partner{partners.length !== 1 ? 's' : ''} at this location
                    </p> */}
                    <p className="text-green-600 text-s mt-1">
                      Click on the green markers on the map to see dropoff location details
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

          {/* Bike Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Selected Bike</h2>
            <div className="flex items-start space-x-6">
              <img
                src={selectedBike.images?.[0]?.url || '/placeholder-bike.jpg'}
                alt={selectedBike.name}
                className="w-32 h-32 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedBike.name}</h3>
                <p className="text-gray-600 mb-4">{selectedBike.description}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <p className="font-medium">{selectedBike.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Condition:</span>
                    <p className="font-medium">{selectedBike.condition || 'Excellent'}</p>
                  </div>
                  {selectedBike.specifications && (
                    <>
                      {selectedBike.specifications.frameSize && (
                        <div>
                          <span className="text-sm text-gray-500">Frame Size:</span>
                          <p className="font-medium">{selectedBike.specifications.frameSize}</p>
                        </div>
                      )}
                      {selectedBike.specifications.gears && (
                        <div>
                          <span className="text-sm text-gray-500">Gears:</span>
                          <p className="font-medium">{selectedBike.specifications.gears}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {selectedBike.features && selectedBike.features.length > 0 && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Features:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedBike.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Rental Period
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start</h3>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    <span>{startDateTime.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mt-1">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>{startDateTime.time}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">End</h3>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                    <span>{endDateTime.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mt-1">
                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                    <span>{endDateTime.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Duration:</span>
                <span className="text-xl font-bold text-blue-600">{duration} days</span>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={onBack}
              className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rental Period
            </button>
            <button
              onClick={onConfirmBooking}
              disabled={isBooking}
              className={`flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isBooking
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
          
          {/* Information message */}
          {isBooking && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Please wait...</strong> We're creating your booking and notifying the partner. This may take a few moments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Pricing Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Pricing Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate:</span>
                <span className="font-medium">LKR {selectedBike.pricing.perDay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">LKR {(duration * selectedBike.pricing.perDay).toLocaleString()}</span>
              </div>
              
              {selectedBike.pricing.deliveryFee && deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">LKR {selectedBike.pricing.deliveryFee.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    LKR {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
                <p className="text-sm text-gray-600">
                  Payment will be processed securely after confirmation. 
                  You can pay via cash on delivery or online payment methods.
                </p>
              </div>

              {/* Terms */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Please bring a valid ID for bike pickup</li>
                  <li>• Helmet and safety gear included</li>
                  <li>• Bike must be returned in good condition</li>
                  <li>• Late returns may incur additional charges</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalConfirmationStep;
