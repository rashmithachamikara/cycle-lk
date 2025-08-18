import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard } from 'lucide-react';

interface WelcomeSectionProps {
  userName?: string;
  pendingPaymentsCount?: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName, pendingPaymentsCount = 0 }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userName || 'User'}!
          </h1>
          <p className="text-emerald-100">Ready for your next cycling adventure in Sri Lanka?</p>
        </div>
        <div className="hidden md:flex space-x-3">
          {/* Payments Button */}
          <Link
            to="/payments"
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center relative ${
              pendingPaymentsCount > 0
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Payments
            {pendingPaymentsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {pendingPaymentsCount}
              </span>
            )}
          </Link>
          
          {/* New Booking Button */}
          <Link
            to="/booking"
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Booking
          </Link>
        </div>
      </div>
      
      {/* Mobile buttons */}
      <div className="md:hidden mt-6 flex space-x-3">
        <Link
          to="/payments"
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center relative ${
            pendingPaymentsCount > 0
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Payments
          {pendingPaymentsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {pendingPaymentsCount}
            </span>
          )}
        </Link>
        
        <Link
          to="/booking"
          className="flex-1 bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Link>
      </div>
    </div>
  );
};

export default WelcomeSection;
