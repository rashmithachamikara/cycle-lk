import { Bike as BikeIcon } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import { ErrorDisplay, BackButton } from '../../ui';

interface ErrorStateProps {
  error?: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorDisplay
          error={error || 'Bike not found'}
          fullPage={true}
          icon={<BikeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        />
        <div className="text-center">
          <BackButton to="/locations" text="Back to Bikes" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorState;
