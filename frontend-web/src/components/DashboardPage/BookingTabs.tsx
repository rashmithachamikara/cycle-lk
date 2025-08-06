import React from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface BookingTabsProps {
  activeTab: 'current' | 'requested' | 'past';
  onTabChange: (tab: 'current' | 'requested' | 'past') => void;
  counts: {
    current: number;
    requested: number;
    past: number;
  };
}

const BookingTabs: React.FC<BookingTabsProps> = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    {
      id: 'current' as const,
      label: 'Current Rentals',
      icon: Calendar,
      count: counts.current,
      color: 'text-green-600',
      activeColor: 'border-green-500 bg-green-50 text-green-700'
    },
    {
      id: 'requested' as const,
      label: 'Requested Rentals',
      icon: Clock,
      count: counts.requested,
      color: 'text-blue-600',
      activeColor: 'border-blue-500 bg-blue-50 text-blue-700'
    },
    {
      id: 'past' as const,
      label: 'Past Rentals',
      icon: CheckCircle,
      count: counts.past,
      color: 'text-gray-600',
      activeColor: 'border-gray-500 bg-gray-50 text-gray-700'
    }
  ];

  return (
    <div className="flex space-x-2 border-b border-gray-200 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              isActive
                ? tab.activeColor
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                isActive 
                  ? 'bg-white text-gray-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BookingTabs;
