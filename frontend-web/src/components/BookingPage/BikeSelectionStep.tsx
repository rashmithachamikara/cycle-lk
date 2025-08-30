import { Filter, ArrowRight, ArrowLeft } from 'lucide-react';
import { Bike, BikeType } from '../../services/bikeService';
import BikeFilters from './BikeFilters';
import BikeCard from './BikeCard';
import ErrorAlert from './ErrorAlert';

interface BikeSelectionStepProps {
  availableBikes: Bike[];
  selectedBike: Bike | null;
  showFilters: boolean;
  error: string | null;
  loading?: boolean;
  onBikeSelect: (bike: Bike) => void;
  onToggleFilters: () => void;
  onApplyFilters?: (filters?: {
    type?: BikeType;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price-asc' | 'price-desc' | 'rating';
  }) => Promise<void>;
  onContinue: () => void;
  onBack: () => void; // Add onBack prop
}

const BikeSelectionStep = ({
  availableBikes,
  selectedBike,
  showFilters,
  error,
  loading = false,
  onBikeSelect,
  onToggleFilters,
  onApplyFilters,
  onContinue,
  onBack
}: BikeSelectionStepProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className='mt-8'>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Bike</h2>
          <p className="text-gray-600">Select from our available bikes for your journey</p>
        </div>
        <button
          onClick={onToggleFilters}
          className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:border-emerald-500 transition-colors"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      {error && <ErrorAlert message={error} />}

      <BikeFilters showFilters={showFilters} onApplyFilters={onApplyFilters} />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {availableBikes.length > 0 ? (
            availableBikes.map((bike) => (
              <BikeCard
                key={bike.id}
                bike={bike}
                isSelected={selectedBike?.id === bike.id}
                onSelect={onBikeSelect}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500 text-lg">No bikes are currently available at this location.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={onBack}
          className="w-full md:w-1/2 flex items-center justify-center px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to location selection
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedBike}
          className="w-full md:w-1/2 bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to rental period
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default BikeSelectionStep;
