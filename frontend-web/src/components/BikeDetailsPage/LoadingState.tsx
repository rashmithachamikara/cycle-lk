import Header from '../Header';
import Footer from '../Footer';
import { Loader } from '../../ui';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loader message="Loading bike details..." size="lg" />
      </div>
      <Footer />
    </div>
  );
};

export default LoadingState;
