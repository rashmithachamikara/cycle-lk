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
      color: 'teal'
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
      color: 'coral'
    },
    {
      icon: Star,
      value: '4.7',
      label: 'Average Rating',
      color: 'pink'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
      teal: { 
        bg: 'bg-teal-400/20', 
        text: 'text-teal-400',
        hover: 'hover:shadow-[0_12px_40px_rgba(16,185,129,0.4)]' // teal
      },
      blue: { 
        bg: 'bg-[#1E90FF]/20', 
        text: 'text-[#1E90FF]',
        hover: 'hover:shadow-[0_12px_40px_rgba(30,144,255,0.4)]' // blue
      },
      coral: { 
        bg: 'bg-[#FF7F50]/20', 
        text: 'text-[#FF7F50]',
        hover: 'hover:shadow-[0_12px_40px_rgba(255,127,80,0.4)]' // coral
      },
      pink: { 
        bg: 'bg-[#FF69B4]/20', 
        text: 'text-[#FF69B4]',
        hover: 'hover:shadow-[0_12px_40px_rgba(255,105,180,0.4)]' // pink
      }
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
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group cursor-pointer p-6 text-center ${colors.hover}`}
            >
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