import { Link } from 'react-router-dom';
import { ArrowLeft, Bike as BikeIcon } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';

interface ErrorStateProps {
  error?: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <BikeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Bike not found'}
          </h3>
          <p className="text-gray-600 mb-6">
            The bike you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/locations"
            className="inline-flex items-center bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bikes
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorState;
