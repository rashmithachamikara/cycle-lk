// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white py-16">
//       <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
//         <div className="grid md:grid-cols-4 gap-8 mb-12">
//           <div className="col-span-2">
//             <Link to="/" className="flex items-center space-x-2 mb-6">
//               <div className="h-12 w-12 rounded-xl overflow-hidden">
//                 <img
//                   src="https://res.cloudinary.com/di9vcyned/image/upload/v1755623346/logo_vo5njt.jpg"
//                   alt="Logo"
//                   className="h-full w-full object-contain"
//                   />
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] bg-clip-text text-transparent font-sans ">Cycle.LK</span>
//             </Link>
//             <p className="text-gray-300 mb-6 max-w-md">
//               Explore Sri Lanka sustainably with our flexible bike rental network. 
//               Supporting local businesses while creating unforgettable travel experiences.
//             </p>
//             <div className="flex space-x-4">
//               <Facebook className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
//               <Instagram className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
//               <Twitter className="h-6 w-6 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
//             </div>
//           </div>
          
//           <div>
//             <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
//             <ul className="space-y-2">
//               <li><Link to="/booking" className="text-gray-300 hover:text-emerald-400 transition-colors">Book Now</Link></li>
//               <li><Link to="/locations" className="text-gray-300 hover:text-emerald-400 transition-colors">Locations</Link></li>
//               <li><Link to="/partners" className="text-gray-300 hover:text-emerald-400 transition-colors">Partners</Link></li>
//               <li><Link to="/support" className="text-gray-300 hover:text-emerald-400 transition-colors">Support</Link></li>
//             </ul>
//           </div>
          
//           <div>
//             <h4 className="text-lg font-semibold mb-4">Contact</h4>
//             <div className="space-y-3">
//               <div className="flex items-center">
//                 <Phone className="h-5 w-5 text-emerald-400 mr-3" />
//                 <span className="text-gray-300">+94 11 123 4567</span>
//               </div>
//               <div className="flex items-center">
//                 <Mail className="h-5 w-5 text-emerald-400 mr-3" />
//                 <span className="text-gray-300">hello@cycle.lk</span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="border-t border-gray-800 pt-8 text-center">
//           <p className="text-gray-400">
//             © 2025 Cycle.LK. All rights reserved. Exploring Sri Lanka sustainably, one bike at a time.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;


import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12 border-b border-gray-800 pb-6 sm:pb-8">
          
          <div className="sm:col-span-2 lg:col-span-2 order-1 text-center sm:text-left">
            {/* Logo Section */}
            <Link to="/" className="flex items-center justify-center sm:justify-start space-x-2 mb-0">
              {/* Replaced img with a div using background-image */}
              <div 
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-cover bg-center" 
                style={{ backgroundImage: "url('https://res.cloudinary.com/di9vcyned/image/upload/v1759076638/lightmode_ni0n0u.png')" }}
                aria-label="Cycle.LK Logo"
              ></div>
            </Link>
            <p className="text-gray-400 text-sm sm:text-base max-w-sm lg:max-w-md mb-4 mx-auto sm:mx-0">
              Explore Sri Lanka sustainably with our flexible bike rental network.
              Supporting local businesses while creating unforgettable travel experiences.
            </p>
            <div className="flex space-x-3 sm:space-x-4 justify-center sm:justify-start">
              <a href="https://facebook.com/cycle.lk" target="_blank" rel="noopener noreferrer" className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-emerald-500 transition-colors">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-white" />
              </a>
              <a href="https://instagram.com/cycle.lk" target="_blank" rel="noopener noreferrer" className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-emerald-500 transition-colors">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-white" />
              </a>
              <a href="https://twitter.com/cycle_lk" target="_blank" rel="noopener noreferrer" className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-emerald-500 transition-colors">
                <FaXTwitter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="order-2 sm:order-3 lg:order-2 flex justify-center sm:justify-end lg:justify-end">
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/booking" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">Book Now</Link></li>
                <li><Link to="/locations" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">Locations</Link></li>
                <li><Link to="/partners" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">Partners</Link></li>
                <li><Link to="/support" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Resources */}
          <div className="order-3 sm:order-2 lg:order-3 flex justify-center sm:justify-end lg:justify-end">
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/faqs" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">FAQs</Link></li>
                <li><Link to="/terms-of-service" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/pprivacy-policy" className="text-sm sm:text-base text-gray-300 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="py-6 sm:py-8 bg-gray-800 rounded-lg mb-8 sm:mb-12 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-around items-center gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <img src="https://res.cloudinary.com/di9vcyned/image/upload/v1759080694/images_h0lcvv.png" alt="Sri Lanka Tourism" className="h-8 sm:h-10 mb-2 rounded-md" />
              <span className="text-gray-400 text-xs sm:text-sm">Official Tourism Partner</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <img src="https://res.cloudinary.com/di9vcyned/image/upload/v1759083223/Screenshot_2025-09-28_234329_dpexoa.png" alt="EcoTravel Gear" className="h-8 sm:h-10 mb-2 rounded-md" />
              <span className="text-gray-400 text-xs sm:text-sm">Local Bike Shops Partner</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <img src="https://res.cloudinary.com/di9vcyned/image/upload/v1759080657/101117293_102825518129880_622739398579978240_n_rrlbrd.jpg" alt="Compliance & Licensing" className="h-8 sm:h-10 mb-2 rounded-md" />
              <span className="text-gray-400 text-xs sm:text-sm">Compliance & Licensing Partner</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Legal & Copyright */}
        <div className="text-center mb-6 sm:mb-8">
          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Partnerships & Opportunities</h4>
          <p className="text-gray-400 text-sm sm:text-base max-w-3xl mx-auto mb-4 sm:mb-6 px-2">
            Cycle.LK is committed to promoting sustainable tourism and supporting local businesses.
            If you're interested in partnering with us or becoming a rental location,
            please contact us to explore opportunities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 text-gray-300 text-sm">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-emerald-400 mr-2" />
              <a href="mailto:hello@cycle.lk" className="hover:text-emerald-400 transition-colors">hello@cycle.lk</a>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-emerald-400 mr-2" />
              <a href="tel:+94111234567" className="hover:text-emerald-400 transition-colors">+94 11 123 4567</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-4 lg:gap-0">
          <p className="text-gray-400 text-xs sm:text-sm order-2 lg:order-1">
            © {new Date().getFullYear()} Cycle.LK. All rights reserved. Exploring Sri Lanka sustainably, one bike at a time.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-end items-center gap-4 sm:gap-6 text-xs sm:text-sm order-1 lg:order-2">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-emerald-400 transition-colors">Terms of Use</Link>
            <span className="text-gray-400">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;