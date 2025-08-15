//frontend-web/PartnersPage/PartnerCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  Navigation,
  MessageCircle,
  Heart
} from 'lucide-react';
import { PartnerCardProps, getCategoryStyle } from './types';
import { formatBusinessHours } from '../../services/partnerService';

const PartnerCard: React.FC<PartnerCardProps> = ({ partner }) => {
  // Helper function to get main location coordinates
  const getMainLocationCoordinates = () => {
    // First try to find a main location
    if (partner.serviceLocations && partner.serviceLocations.length > 0) {
      for (const cityService of partner.serviceLocations) {
        const mainLocation = cityService.locations.find(loc => loc.isMainLocation);
        if (mainLocation) {
          return {
            lat: mainLocation.coordinates.lat,
            lng: mainLocation.coordinates.lng
          };
        }
      }
      
      // If no main location found, use the first location
      const firstCity = partner.serviceLocations[0];
      if (firstCity.locations && firstCity.locations.length > 0) {
        return {
          lat: firstCity.locations[0].coordinates.lat,
          lng: firstCity.locations[0].coordinates.lng
        };
      }
    }
    
    // Fallback to legacy coordinates if they exist
    if (partner.coordinates) {
      return {
        lat: partner.coordinates.latitude,
        lng: partner.coordinates.longitude
      };
    }
    
    return null;
  };

  // Helper function to get display location
  const getDisplayLocation = () => {
    // Try to get from service cities first
    if (partner.serviceCities && partner.serviceCities.length > 0) {
      return partner.serviceCities.join(', ');
    }
    
    // Fallback to legacy location field
    return partner.location || 'Location not specified';
  };

  // Get coordinates for navigation
  const coordinates = getMainLocationCoordinates();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Partner Header */}
      <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-500 relative overflow-hidden">
        {partner.images?.storefront?.url ? (
          <img 
            src={partner.images.storefront.url} 
            alt={partner.companyName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          // Show gradient background if no storefront image
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500"></div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 left-4 flex space-x-2">
          {partner.category && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryStyle(partner.category)}`}>
              {partner.category}
            </span>
          )}
          {partner.verified && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-lg font-bold">{partner.companyName}</div>
        </div>
      </div>

      <div className="p-6">
        {/* Partner Info */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{partner.companyName}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{getDisplayLocation()}</span>
            </div>
            {partner.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {partner.rating} ({partner.reviews?.length || 0} reviews)
                </span>
              </div>
            )}
          </div>
          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-700 mb-4">{partner.description || 'Professional bike rental service.'}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">{partner.bikeCount || 0}</div>
            <div className="text-xs text-gray-600">Bikes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{partner.yearsActive || 0}</div>
            <div className="text-xs text-gray-600">Years</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{partner.reviews?.length || 0}</div>
            <div className="text-xs text-gray-600">Reviews</div>
          </div>
        </div>

        {/* Specialties */}
        {partner.specialties && partner.specialties.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {partner.specialties.map((specialty, index) => (
                <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {partner.features && partner.features.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {partner.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-3 w-3 text-emerald-500 mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {partner.businessHours && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Hours: {formatBusinessHours(partner.businessHours)}</span>
              </div>
            )}
            {partner.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <a href={`tel:${partner.phone}`} className="text-emerald-600 hover:underline">
                  {partner.phone}
                </a>
              </div>
            )}
            {partner.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <a href={`mailto:${partner.email}`} className="text-emerald-600 hover:underline">
                  {partner.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/partners/${partner.id || partner._id}/bikes`}
            className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium text-center"
          >
            View Bikes
          </Link>
          {partner.phone && (
            <a
              href={`tel:${partner.phone}`}
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          {partner.email && (
            <a
              href={`mailto:${partner.email}`}
              className="flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
          {coordinates && (
            <a
              href={`https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:border-emerald-500 transition-colors"
            >
              <Navigation className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerCard;