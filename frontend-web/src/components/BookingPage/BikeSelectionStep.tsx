import { Filter, ArrowRight } from 'lucide-react';
import { Bike } from '../../services/bikeService';
import BikeFilters from './BikeFilters';
import BikeCard from './BikeCard';
import ErrorAlert from './ErrorAlert';

interface BikeSelectionStepProps {
  availableBikes: Bike[];
  selectedBike: Bike | null;
  showFilters: boolean;
  error: string | null;
  onBikeSelect: (bike: Bike) => void;
  onToggleFilters: () => void;
  onContinue: () => void;
}

const BikeSelectionStep = ({
  availableBikes,
  selectedBike,
  showFilters,
  error,
  onBikeSelect,
  onToggleFilters,
  onContinue
}: BikeSelectionStepProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
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

      <BikeFilters showFilters={showFilters} />

      <div className="grid md:grid-cols-2 gap-6">
        {availableBikes.map((bike) => (
          <BikeCard
            key={bike.id}
            bike={bike}
            isSelected={selectedBike?.id === bike.id}
            onSelect={onBikeSelect}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={!selectedBike}
          className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default BikeSelectionStep;
