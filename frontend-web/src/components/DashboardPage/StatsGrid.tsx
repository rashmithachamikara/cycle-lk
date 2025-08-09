import React from 'react';
import { Bike, Calendar, Star, MapPin } from 'lucide-react';
import StatsCard from './StatsCard';

interface StatsGridProps {
  activeRentals: number;
  totalBookings: number;
  avgRating: number;
  citiesVisited: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  activeRentals,
  totalBookings,
  avgRating,
  citiesVisited
}) => {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <StatsCard
        icon={Bike}
        value={activeRentals}
        label={`Active Rental${activeRentals !== 1 ? 's' : ''}`}
        bgColor="bg-emerald-100"
        iconColor="text-emerald-600"
      />
      
      <StatsCard
        icon={Calendar}
        value={totalBookings}
        label="Total Bookings"
        bgColor="bg-blue-100"
        iconColor="text-blue-600"
      />
      
      <StatsCard
        icon={Star}
        value={avgRating > 0 ? avgRating.toFixed(1) : '-'}
        label="Avg Rating"
        bgColor="bg-yellow-100"
        iconColor="text-yellow-600"
      />
      
      <StatsCard
        icon={MapPin}
        value={citiesVisited}
        label="Cities Visited"
        bgColor="bg-purple-100"
        iconColor="text-purple-600"
      />
    </div>
  );
};

export default StatsGrid;
