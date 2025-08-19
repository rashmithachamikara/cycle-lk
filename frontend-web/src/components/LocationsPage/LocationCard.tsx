import React from 'react';
import { MapPin, Bike, MapIcon } from 'lucide-react';
import { Location } from '../../services/locationService';

interface LocationCardProps {
  location: Location;
  onViewBikes?: (locationId: string) => void;
  onMoreDetails?: (locationId: string) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  onViewBikes, 
  onMoreDetails 
}) => {
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={() => onMoreDetails?.(location.id)}
    >
      <div
        className="h-48 relative overflow-hidden"
        style={
          location.image
          ? {
              backgroundImage: `url(${location.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: '#e0f2f1' }
        }
      >
        {location.popular && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Popular
          </div>
        )}
        {!location.image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapIcon className="h-16 w-16 text-teal-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 group-hover:from-black/20 group-hover:to-black/70 transition-all duration-300"></div>
        <div className="absolute bottom-4 left-6 text-white">
          <div className="text-sm opacity-90">{location.region}</div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{location.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {location.description || "Explore this beautiful location and rent bikes from our local partners."}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-[#00D4AA]">
            <Bike className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{location.bikeCount} bikes</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{location.partnerCount} partners</span>
          </div>
        </div>
        
        {(onViewBikes || onMoreDetails) && (
          <div className="flex space-x-3">
            {onViewBikes && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewBikes(location.id);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-medium"
              >
                View Bikes
              </button>
            )}
            {onMoreDetails && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreDetails(location.id);
                }}
                className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF6B9D] text-white py-3 rounded-lg hover:from-[#e55a2e] hover:to-[#e55a89] transition-colors duration-300 font-medium"
              >
                More Details
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCard;
