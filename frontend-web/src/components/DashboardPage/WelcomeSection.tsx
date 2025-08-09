import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface WelcomeSectionProps {
  userName?: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userName || 'User'}!
          </h1>
          <p className="text-emerald-100">Ready for your next cycling adventure in Sri Lanka?</p>
        </div>
        <div className="hidden md:block">
          <Link
            to="/booking"
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Booking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
