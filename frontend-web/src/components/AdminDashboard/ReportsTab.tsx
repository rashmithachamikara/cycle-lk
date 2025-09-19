import { HelpCircle } from 'lucide-react';

const ReportsTab: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <HelpCircle className="h-16 w-16 text-purple-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports Module</h3>
      <p className="text-gray-600 max-w-lg mx-auto">
        Generate comprehensive reports on bookings, revenue, partners, and user activity to inform business decisions.
      </p>
      <button className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
        Configure Reports
      </button>
    </div>
  );
};

export default ReportsTab;
