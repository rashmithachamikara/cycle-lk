import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Bike className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Cycle.LK</span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Explore Sri Lanka sustainably with our flexible bike rental network. 
              Supporting local businesses while creating unforgettable travel experiences.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/booking" className="text-gray-300 hover:text-emerald-400 transition-colors">Book Now</Link></li>
              <li><Link to="/locations" className="text-gray-300 hover:text-emerald-400 transition-colors">Locations</Link></li>
              <li><Link to="/partners" className="text-gray-300 hover:text-emerald-400 transition-colors">Partners</Link></li>
              <li><Link to="/support" className="text-gray-300 hover:text-emerald-400 transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-emerald-400 mr-3" />
                <span className="text-gray-300">+94 11 123 4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-emerald-400 mr-3" />
                <span className="text-gray-300">hello@cycle.lk</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Cycle.LK. All rights reserved. Exploring Sri Lanka sustainably, one bike at a time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;