import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Bike as BikeIcon } from 'lucide-react';
import { Bike } from '../services/bikeService';

interface BikeListItemProps {
  bike: Bike;
}

const BikeListItem: React.FC<BikeListItemProps> = ({ bike }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(0,212,170,0.4)] group cursor-pointer p-6">

      <div className="grid md:grid-cols-4 gap-6 items-center">
        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative">
          {bike.images && bike.images.length > 0 ? (
            <img 
              src={bike.images[0].url} 
              alt={bike.name} 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <BikeIcon className="h-12 w-12 text-gray-400" />
          )}
        </div>
        
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">{bike.name}</h3>
            {bike.availability?.status !== 'available' && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {bike.availability?.status === 'unavailable' ? 'Unavailable' : 
                 bike.availability?.status === 'requested' ? 'Requested' : 'Not Available'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{bike.rating || 'N/A'} ({bike.reviews?.length || 0})</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{bike.location} • {bike.partner?.companyName || 'Partner'}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {bike.features && bike.features.map((feature, index) => (
              <span key={index} className="bg-teal-400/10 text-teal-600 px-2 py-1 rounded text-xs">
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-[#00D4AA]">LKR {bike.pricing.perDay.toLocaleString()}/day</div>
          <div className="flex flex-col space-y-2">
            <Link
              to={`/bike/${bike.id}`}
              className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:border-[#00D4AA] transition-colors font-medium text-center"
            >
              View Details
            </Link>
            <Link
              to={`/booking/${bike.id}`}
              className={`py-2 px-4 rounded-lg font-medium text-center transition-colors ${
                bike.availability?.status === 'available'
                  ? 'bg-[#00D4AA] text-white hover:bg-[#00D4AA]/80'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {bike.availability?.status === 'available' ? 'Book Now' : 
               bike.availability?.status === 'unavailable' ? 'Unavailable' :
               bike.availability?.status === 'requested' ? 'Requested' : 'Not Available'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeListItem;
