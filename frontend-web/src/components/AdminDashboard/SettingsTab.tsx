import { Settings } from 'lucide-react';

const SettingsTab: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
      <Settings className="h-16 w-16 text-purple-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h3>
      <p className="text-gray-600 max-w-lg mx-auto">
        Configure application settings, payment gateways, notification preferences, and system parameters.
      </p>
      <button className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
        Access Settings
      </button>
    </div>
  );
};

export default SettingsTab;
