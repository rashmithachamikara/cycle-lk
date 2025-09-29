import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-[#FF7F50]/80 to-[#FF6B9D] text-white pt-[126px] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Our Locations</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Discover Sri Lanka's most beautiful destinations with our extensive network of bike rental partners
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
