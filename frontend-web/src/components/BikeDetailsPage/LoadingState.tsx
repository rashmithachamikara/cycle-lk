import Header from '../Header';
import Footer from '../Footer';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Loading bike details...</span>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoadingState;
