import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Award, ExternalLink } from 'lucide-react';
import { PartnerBenefitsProps } from './types';

const PartnerBenefits: React.FC<PartnerBenefitsProps> = ({ className = '' }) => {
  const benefits = [
    {
      icon: Users,
      title: 'Increased Bookings',
      description: 'Access to thousands of tourists looking for authentic local experiences',
      color: 'emerald'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Guaranteed payments with comprehensive insurance coverage for all rentals',
      color: 'blue'
    },
    {
      icon: Award,
      title: 'Marketing Support',
      description: 'Professional photography, listing optimization, and promotional campaigns',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500'
    };
    return colorMap[color] || colorMap.emerald;
  };

  return (
    <section className={`mt-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Our Partners Choose Cycle.LK</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join our growing network of successful bike rental businesses across Sri Lanka
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => {
          const IconComponent = benefit.icon;
          
          return (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${getColorClasses(benefit.color)} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/support"
          className="bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-600 transition-colors font-semibold text-lg inline-flex items-center"
        >
          Become a Partner
          <ExternalLink className="h-5 w-5 ml-2" />
        </Link>
      </div>
    </section>
  );
};

export default PartnerBenefits;
