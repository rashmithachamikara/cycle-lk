import React from 'react';
import { BikeCard, BikeListItem } from '../LocationsPage';
import { LoadingState, ErrorState, EmptyState } from '../LocationsPage';
import { Bike } from '../../services/bikeService';

interface BikeSectionProps {
  bikes: Bike[];
  viewMode: 'grid' | 'list';
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onClearFilters: () => void;
}

const BikeSection: React.FC<BikeSectionProps> = ({
  bikes,
  viewMode,
  loading,
  error,
  onRetry,
  onClearFilters
}) => {
  if (loading) {
    return <LoadingState message="Loading bikes..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (bikes.length === 0) {
    return <EmptyState type="bikes" onClearFilters={onClearFilters} />;
  }

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

export default BikeSection;
