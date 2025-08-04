import React from 'react';
import { Users, MapPin, Bike, Star } from 'lucide-react';
import { StatsSectionProps } from './types';
import { Partner } from '../../services/partnerService';

const StatsSection: React.FC<StatsSectionProps> = ({ partners }) => {
  const totalBikes = partners.reduce((sum, partner: Partner) => sum + (partner.bikeCount || 0), 0);

  const stats = [
    {
      icon: Users,
      value: partners.length,
      label: 'Trusted Partners',
      color: 'emerald'
    },
    {
      icon: MapPin,
      value: 6,
      label: 'Cities Covered',
      color: 'blue'
    },
    {
      icon: Bike,
      value: totalBikes,
      label: 'Total Bikes',
      color: 'yellow'
    },
    {
      icon: Star,
      value: '4.7',
      label: 'Average Rating',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    return colorMap[color] || colorMap.emerald;
  };

  return (
    <section className="mb-12">
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          const IconComponent = stat.icon;
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className={`h-6 w-6 ${colors.text}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatsSection;
