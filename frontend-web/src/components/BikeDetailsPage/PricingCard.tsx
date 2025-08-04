import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Bike } from '../../services/bikeService';

interface PricingCardProps {
  bike: Bike;
  formatPrice: (price: number) => string;
}

const PricingCard = ({ bike, formatPrice }: PricingCardProps) => {
  // Calculate weekly and monthly prices if available
  const weeklyPrice = bike.pricing.perWeek || bike.pricing.perDay * 6; // 1 day free
  const monthlyPrice = bike.pricing.perMonth || bike.pricing.perDay * 25; // 5 days free

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-emerald-600">{formatPrice(bike.pricing.perDay)}</div>
          <div className="text-gray-600">per day</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Weekly rate</div>
          <div className="text-xl font-semibold text-gray-900">{formatPrice(weeklyPrice)}</div>
          {bike.pricing.perWeek && bike.pricing.perWeek < bike.pricing.perDay * 7 && (
            <div className="text-xs text-emerald-600">
              Save {formatPrice(bike.pricing.perDay * 7 - bike.pricing.perWeek)}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Available now:</span>
          <span className={`font-medium ${bike.availability?.status ? 'text-green-600' : 'text-red-600'}`}>
            {bike.availability?.status ? 'Yes' : 'No'}
          </span>
        </div>
        {monthlyPrice && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Monthly rate:</span>
            <span className="font-medium text-gray-900">{formatPrice(monthlyPrice)}</span>
          </div>
        )}
      </div>
      
      <Link
        to={`/booking?bikeId=${bike.id}`}
        className="w-full bg-emerald-500 text-white py-4 rounded-xl hover:bg-emerald-600 transition-colors font-semibold text-lg text-center block"
      >
        Book This Bike
      </Link>
      
      <div className="flex items-center justify-center text-sm text-gray-500 mt-3">
        <Shield className="h-4 w-4 mr-2" />
        Free cancellation up to 24 hours before
      </div>
    </div>
  );
};

export default PricingCard;
