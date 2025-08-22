import { useState } from 'react';
import { Star, MapPin, Heart, Share2 } from 'lucide-react';
import { Bike } from '../../services/bikeService';

interface BikeHeaderProps {
  bike: Bike;
}

const BikeHeader = ({ bike }: BikeHeaderProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">{bike.name}</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-lg border ${
              isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-600'
            } hover:scale-110 transition-transform`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:scale-110 transition-transform">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <span className="bg-teal-400/10 text-teal-600 px-3 py-1 rounded-full text-sm font-medium capitalize">
          {bike.type}
        </span>
        {bike.rating && (
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {bike.rating} ({bike.reviews?.length || 0} reviews)
            </span>
          </div>
        )}
        {bike.condition && (
          <span className="text-sm text-gray-600 capitalize">
            Condition: {bike.condition}
          </span>
        )}
      </div>
      
      <div className="flex items-center text-gray-600 mb-6">
        <MapPin className="h-4 w-4 mr-2" />
        <span>{bike.location}</span>
      </div>
      
      <p className="text-gray-700 leading-relaxed">{bike.description || 'No description available.'}</p>
    </div>
  );
};

export default BikeHeader;
