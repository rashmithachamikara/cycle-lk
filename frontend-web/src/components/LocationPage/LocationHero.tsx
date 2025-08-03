import React from 'react';
import { MapPin, ArrowLeft, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Location } from './types';

interface LocationHeroProps {
  location: Location;
  bikeCount?: number;
}

const LocationHero: React.FC<LocationHeroProps> = ({ location, bikeCount = 0 }) => {
  return (
    <section className="relative">
      {/* Background Image */}
      <div 
        className="h-80 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden"
        style={
          location.image 
            ? {
                backgroundImage: `linear-gradient(rgba(16, 170, 129, 0.8), rgba(20, 184, 166, 0.8)), url(${location.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            {/* Back Button */}
            <Link 
              to="/locations" 
              className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Locations
            </Link>
            
            {/* Location Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl md:text-5xl font-bold">{location.name}</h1>
                {location.popular && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-emerald-100 text-lg">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{location.region}</span>
              </div>
              
              <p className="text-xl text-emerald-100 max-w-3xl">
                {location.description || `Explore ${location.name} with our extensive collection of bikes from trusted local partners.`}
              </p>
              
              {/* Stats */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">🚴</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{bikeCount} Bikes</div>
                    <div className="text-emerald-100 text-sm">Available</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{location.partnerCount} Partners</div>
                    <div className="text-emerald-100 text-sm">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationHero;
