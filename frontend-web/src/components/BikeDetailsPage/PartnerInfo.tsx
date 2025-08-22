import { Star, Phone, MessageCircle } from 'lucide-react';
import { Bike } from '../../services/bikeService';

interface PartnerInfoProps {
  bike: Bike;
  formatBusinessHours: (businessHours: any) => string;
}

const PartnerInfo = ({ bike, formatBusinessHours }: PartnerInfoProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Shop</h3>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-gray-900">
            {bike.partner?.companyName || `Partner ID: ${bike.partnerId}`}
          </div>
          {bike.partner?.rating && (
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{bike.partner.rating} partner rating</span>
            </div>
          )}
          <div className="text-sm text-gray-600 mt-1">
            {bike.partner?.location || 'Contact for more details'}
          </div>
          {bike.partner?.businessHours && (
            <div className="text-sm text-gray-600 mt-1">
              Hours: {formatBusinessHours(bike.partner.businessHours)}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {bike.partner?.phone && (
            <a
              href={`tel:${bike.partner.phone}`}
              className="flex items-center bg-[#1E90FF] text-white px-3 py-2 rounded-lg hover:bg-[#00BFFF] transition-colors text-sm"
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </a>
          )}
          {bike.partner?.email && (
            <a
              href={`mailto:${bike.partner.email}`}
              className="flex items-center bg-[#00D4AA] text-white px-3 py-2 rounded-lg hover:bg-[#00B89A] transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Email
            </a>
          )}
          {!bike.partner?.phone && !bike.partner?.email && (
            <button className="flex items-center bg-gray-500 text-white px-3 py-2 rounded-lg text-sm cursor-not-allowed">
              <MessageCircle className="h-4 w-4 mr-1" />
              Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerInfo;
