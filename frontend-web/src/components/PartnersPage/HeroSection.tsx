import React from 'react';
import { HeroSectionProps } from './types';

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Our Trusted Partners",
  subtitle = "Meet the local bike rental experts who make your Sri Lankan adventure possible"
}) => {
  return (
    <section className="bg-gradient-to-r from-[#00D4AA] to-[#20B2AA]/50 text-white pt-[126px] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
