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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your Perfect
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent block">Adventure Bike</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Select from our premium collection of bikes perfectly maintained for your journey across Sri Lanka
          </p>
          
          {/* Decorative Line */}
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full"></div>
        </div>

        {/* Filter Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={onToggleFilters}
            className="flex items-center space-x-3 bg-white border-2 border-gray-200 px-6 py-3 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-lg"
          >
            <Filter className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-gray-700">Filters</span>
          </button>
        </div>

        {error && (
          <div className="mb-8">
            <ErrorAlert message={error} />
          </div>
        )}

        <BikeFilters showFilters={showFilters} onApplyFilters={onApplyFilters} />

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Finding your perfect bikes...</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
              <div className="col-span-full text-center py-24">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Bikes Available</h3>
                  <p className="text-lg text-gray-500">No bikes are currently available at this location. Try adjusting your filters or selecting a different location.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
          <button
            onClick={onBack}
            className="w-full md:w-1/2 flex items-center justify-center px-8 py-5 text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-lg"
          >
            <ArrowLeft className="h-6 w-6 mr-3" />
            Back to Location Selection
          </button>
          <button
            onClick={onContinue}
            disabled={!selectedBike}
            className={`w-full md:w-1/2 flex items-center justify-center px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              selectedBike
                ? 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Rental Period
            <ArrowRight className="h-6 w-6 ml-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BikeSelectionStep;
