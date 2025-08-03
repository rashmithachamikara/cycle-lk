import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  return (
    <Link
      to="/locations"
      className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Bikes
    </Link>
  );
};

export default BackButton;
