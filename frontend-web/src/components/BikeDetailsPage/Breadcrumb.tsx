import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  bikeName: string;
}

const Breadcrumb = ({ bikeName }: BreadcrumbProps) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link to="/" className="hover:text-emerald-600">Home</Link>
      <span>/</span>
      <Link to="/locations" className="hover:text-emerald-600">Locations</Link>
      <span>/</span>
      <span className="text-gray-900">{bikeName}</span>
    </div>
  );
};

export default Breadcrumb;
