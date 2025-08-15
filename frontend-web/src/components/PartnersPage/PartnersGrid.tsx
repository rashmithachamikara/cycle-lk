//frontend-web/PartnersPage/PartnersGrid.tsx
import React from 'react';
import { Bike } from 'lucide-react';
import { PartnersGridProps } from './types';
import { Loader, ErrorDisplay } from '../../ui';
import PartnerCard from './PartnerCard';

const PartnersGrid: React.FC<PartnersGridProps> = ({ 
  partners, 
  loading = false, 
  error = null, 
  onRetry 
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader message="Loading partners..." size="lg" />
      </div>
    );
  }

  // Show error state
  if (error && onRetry) {
    return (
      <div className="py-12">
        <ErrorDisplay 
          error={error} 
          onRetry={onRetry}
          fullPage={false}
        />
      </div>
    );
  }

  // Show empty state
  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <Bike className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners found</h3>
        <p className="text-gray-600">Try selecting a different category or check back later.</p>
      </div>
    );
  }

  // Show partners grid
  return (
    <section>
      <div className="grid lg:grid-cols-2 gap-8">
        {partners.map((partner) => (
          <PartnerCard 
            key={partner.id || partner._id} 
            partner={partner} 
          />
        ))}
      </div>
    </section>
  );
};

export default PartnersGrid;
