// // frontend-web/src/ui/BikeCard.tsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { MapPin, Star, Bike as BikeIcon } from 'lucide-react';
// import { Bike } from '../services/bikeService';

// interface BikeCardProps {
//   bike: Bike;
// }

// const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
//       <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
//         {bike.images && bike.images.length > 0 ? (
//           <img 
//             src={bike.images[0]} 
//             alt={bike.name} 
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <BikeIcon className="h-16 w-16 text-gray-400" />
//           </div>
//         )}
//         {bike.availability?.status ? (
//           <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
//             Available
//           </div>
//         ) : (
//           <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
//             Unavailable
//           </div>
//         )}
//       </div>
      
//       <div className="p-6">
//         <div className="flex items-center justify-between mb-2">
//           <h3 className="text-xl font-semibold text-gray-900">{bike.name}</h3>
//           <div className="text-lg font-bold text-emerald-600">LKR {bike.pricing.perDay.toLocaleString()}/day</div>
//         </div>
        
//         <div className="flex items-center space-x-4 mb-3">
//           <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
//           <div className="flex items-center">
//             <Star className="h-4 w-4 text-yellow-400 fill-current" />
//             <span className="text-sm text-gray-600 ml-1">{bike.rating || 'N/A'} ({bike.reviews?.length || 0})</span>
//           </div>
//         </div>
        
//         <div className="flex items-center text-gray-600 mb-4">
//           <MapPin className="h-4 w-4 mr-2" />
//           <span className="text-sm">{bike.location} • {bike.partner?.companyName || 'Partner'}</span>
//         </div>
        
//         <div className="flex flex-wrap gap-2 mb-4">
//           {bike.features && bike.features.slice(0, 3).map((feature: string, index: number) => (
//             <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
//               {feature}
//             </span>
//           ))}
//         </div>
        
//         <div className="flex space-x-3">
//           <Link
//             to={`/bike/${bike.id}`}
//             className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center"
//           >
//             View Details
//           </Link>
//           <Link
//             to={`/booking/${bike.id}`}
//             className={`flex-1 py-3 rounded-lg font-medium text-center transition-colors ${
//               bike.availability?.status
//                 ? 'bg-emerald-500 text-white hover:bg-emerald-600'
//                 : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//             }`}
//           >
//             {bike.availability?.status ? 'Book Now' : 'Unavailable'}
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BikeCard;


import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Bike as BikeIcon } from 'lucide-react';
import { Bike } from '../services/bikeService';

interface BikeCardProps {
  bike: Bike;
}

const BikeCard: React.FC<BikeCardProps> = ({ bike }) => {
  // Get the first image URL, or null if no images exist
  const imageUrl = bike.images && bike.images.length > 0 ? bike.images[0].url : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} // <-- CORRECT: Use the extracted URL string
            alt={bike.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BikeIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {bike.availability?.status === 'available' ? (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Available
          </div>
        ) : (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {bike.availability?.status === 'unavailable' ? 'Unavailable' :
             bike.availability?.status === 'requested' ? 'Requested' : 'Not Available'}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{bike.name}</h3>
          <div className="text-lg font-bold text-emerald-600">LKR {bike.pricing.perDay.toLocaleString()}/day</div>
        </div>
        
        <div className="flex items-center space-x-4 mb-3">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{bike.type}</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{bike.rating || 'N/A'} ({bike.reviews?.length || 0})</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-sm">{bike.location} • {bike.partner?.companyName || 'Partner'}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {bike.features && bike.features.slice(0, 3).map((feature: string, index: number) => (
            <span key={index} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs">
              {feature}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <Link
            to={`/bike/${bike.id}`}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:border-emerald-500 transition-colors font-medium text-center"
          >
            View Details
          </Link>
          <Link
            to={`/booking/${bike.id}`}
            className={`flex-1 py-3 rounded-lg font-medium text-center transition-colors ${
              bike.availability?.status === 'available'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
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
  );
};

export default BikeCard;