import { Bike as BikeIcon, Star, MapPin, CheckCircle } from 'lucide-react';
import { Bike } from '../../services/bikeService';

interface BikeCardProps {
  bike: Bike;
  isSelected: boolean;
  onSelect: (bike: Bike) => void;
}

const BikeCard = ({ bike, isSelected, onSelect }: BikeCardProps) => {
  return (
    <div
      onClick={() => onSelect(bike)}
      className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
        isSelected 
          ? 'border-emerald-500 ring-4 ring-emerald-100' 
          : 'border-gray-200 hover:border-emerald-300'
      }`}
    >
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        {bike.images && bike.images.length > 0 ? (
          <img 
            src={bike.images[0].url} 
            alt={bike.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <BikeIcon className="h-16 w-16 text-gray-400" />
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{bike.name}</h3>
          <div className="text-lg font-bold text-emerald-600">${bike.pricing.perDay}/day</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">{bike.type}</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{bike.rating || 0} ({bike.reviews?.length || 0})</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{bike.location}</span>
        </div>
        
        {bike.features && bike.features.length > 0 && (
          <ul className="space-y-1">
            {bike.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-3 w-3 text-emerald-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BikeCard;
