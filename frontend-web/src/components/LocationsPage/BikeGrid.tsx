import React from 'react';
import BikeCard from './BikeCard';
import BikeListItem from './BikeListItem';
import { Bike } from '../../services/bikeService';

interface BikeGridProps {
  bikes: Bike[];
  viewMode: 'grid' | 'list';
}

const BikeGrid: React.FC<BikeGridProps> = ({ bikes, viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bikes.map((bike) => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bikes.map((bike) => (
        <BikeListItem key={bike.id} bike={bike} />
      ))}
    </div>
  );
};

export default BikeGrid;
