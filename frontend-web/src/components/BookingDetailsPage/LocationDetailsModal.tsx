import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Building2,
  ExternalLink 
} from 'lucide-react';
import { Partner, partnerService, formatBusinessHours, isPartnerOpen } from '../../services/partnerService';
import { Location, locationService } from '../../services/locationService';
import { UserDashboardBooking } from '../../services/bookingService';
import GoogleMapsPlaces from '../BookingPage/GoogleMapsPlaces';

interface LocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationType: 'pickup' | 'dropoff';
  booking: UserDashboardBooking;
}

const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({
  isOpen,
  onClose,
  locationType,
  booking
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the relevant location string and partner info based on location type
  const locationString = locationType === 'pickup' ? booking.pickupLocation : booking.dropoffLocation;
  const partnerName = locationType === 'pickup' ? booking.partner : booking.dropoffPartner;
  const partnerPhone = locationType === 'pickup' ? booking.partnerPhone : booking.dropoffPartnerPhone;

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to find the location by searching for the location string
        if (locationString) {
          try {
            const locations = await locationService.searchLocations(locationString);
            if (locations.length > 0) {
              setLocation(locations[0]);
            }
          } catch (err) {
            console.warn('Location search failed:', err);
          }
        }

        // Try to find the partner by searching all partners
        if (partnerName) {
          try {
            const partners = await partnerService.searchPartners(partnerName);
            const exactMatch = partners.find(p => 
              p.companyName.toLowerCase() === partnerName.toLowerCase()
            );
            if (exactMatch) {
              setPartner(exactMatch);
            } else if (partners.length > 0) {
              setPartner(partners[0]);
            }
          } catch (err) {
            console.warn('Partner search failed:', err);
          }
        }

      } catch (err) {
        console.error('Error fetching location details:', err);
        setError('Failed to load location details');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchLocationDetails();
    }
  }, [isOpen, locationType, locationString, partnerName]);

  const getMapCenter = () => {
    if (partner?.coordinates) {
      return {
        lat: partner.coordinates.latitude,
        lng: partner.coordinates.longitude
      };
    }
    if (partner?.mapLocation?.coordinates) {
      return partner.mapLocation.coordinates;
    }
    if (location?.coordinates) {
      return {
        lat: location.coordinates.latitude,
        lng: location.coordinates.longitude
      };
    }
    return { lat: 6.9271, lng: 79.8612 }; // Default to Colombo
  };

  const getPartnerMarkers = () => {
    if (!partner) return [];

    let coordinates = { lat: 0, lng: 0 };
    if (partner.coordinates) {
      coordinates = {
        lat: partner.coordinates.latitude,
        lng: partner.coordinates.longitude
      };
    } else if (partner.mapLocation?.coordinates) {
      coordinates = partner.mapLocation.coordinates;
    }

    if (coordinates.lat === 0 && coordinates.lng === 0) return [];

    return [{
      id: partner._id,
      name: partner.companyName,
      coordinates,
      address: partner.address || partner.mapLocation?.address || 'Address not available'
    }];
  };

  const openInGoogleMaps = () => {
    const center = getMapCenter();
    const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <MapPin className={`h-6 w-6 mr-3 ${
              locationType === 'pickup' ? 'text-green-600' : 'text-red-600'
            }`} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {locationType === 'pickup' ? 'Pickup' : 'Drop-off'} Location Details
              </h2>
              <p className="text-gray-600 text-sm">
                Booking #{booking.bookingNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading location details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="p-6 space-y-6">
            {/* Basic Location Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-700">{locationString}</p>
              {location && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Region:</strong> {location.region}</p>
                  <p><strong>Description:</strong> {location.description}</p>
                </div>
              )}
            </div>

            {/* Partner Information */}
            {partner && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Partner Details</h3>
                  </div>
                  {partner.verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{partner.companyName}</p>
                    {partner.description && (
                      <p className="text-sm text-gray-600 mt-1">{partner.description}</p>
                    )}
                    {partner.address && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Address:</strong> {partner.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {partnerPhone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`tel:${partnerPhone}`} className="text-blue-600 hover:underline">
                          {partnerPhone}
                        </a>
                      </div>
                    )}
                    {partner.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">
                          {partner.email}
                        </a>
                      </div>
                    )}
                    {partner.businessHours && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className={`font-medium ${
                            isPartnerOpen(partner.businessHours) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPartnerOpen(partner.businessHours) ? 'Open Now' : 'Closed'}
                          </span>
                          <p className="text-gray-600">
                            {formatBusinessHours(partner.businessHours)}
                          </p>
                        </div>
                      </div>
                    )}
                    {partner.rating && (
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-400 mr-2" />
                        <span>{partner.rating.toFixed(1)} rating</span>
                      </div>
                    )}
                  </div>
                </div>

                {partner.specialties && partner.specialties.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Location on Map</h3>
                <button
                  onClick={openInGoogleMaps}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in Google Maps
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <GoogleMapsPlaces
                  value=""
                  onChange={() => {}}
                  zoom={15}
                  showMap={true}
                  showSearch={false}
                  enableInteraction={true}
                  showLocationMarker={!partner} // Only show location marker if no partner
                  initialCenter={getMapCenter()}
                  partnerMarkers={getPartnerMarkers()}
                  mapHeight="400px"
                  placeholder="Location map"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={openInGoogleMaps}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </button>
              
              {partnerPhone && (
                <a
                  href={`tel:${partnerPhone}`}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Partner
                </a>
              )}
              
              <button
                onClick={onClose}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetailsModal;
