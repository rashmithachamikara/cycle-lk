// // frontend-web/src/components/Header.tsx
// import { useState, useRef, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Menu, X, User, Bell, ChevronDown, Building, ShieldCheck, LogOut } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { useNotifications } from '../hooks/useNotifications';
// import './Header.css';

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isDashboardOpen, setIsDashboardOpen] = useState(false);
//   const [showMobileNav, setShowMobileNav] = useState(false); // for animation
//   const dashboardRef = useRef<HTMLDivElement>(null);
//   const location = useLocation();
//   const { isAuthenticated, user, logout } = useAuth();
//   const { unreadCount } = useNotifications();

//   const isActive = (path: string) => location.pathname === path;
  
//   // Close the dashboard dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
//         setIsDashboardOpen(false);
//       }
//     }
    
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Handle mounting/unmounting for animation
//   useEffect(() => {
//     if (isMenuOpen) {
//       setShowMobileNav(true);
//     } else if (showMobileNav) {
//       // Wait for animation to finish before unmounting
//       const timeout = setTimeout(() => setShowMobileNav(false), 300);
//       return () => clearTimeout(timeout);
//     }
//   }, [isMenuOpen]);

//   return (
//     <header
//       className={`bg-white shadow-sm border-b border-gray-300 sticky top-0 z-50 transition-all
//         ${!isMenuOpen ? 'header-blur bg-opacity-60' : ''}
//         md:header-blur
//       `}
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative ">
//         <div className="flex justify-between items-center h-16">
//           {/* <Link to="/" className="flex items-center space-x-2">
//             <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
//               <Bike className="h-6 w-6 text-white" />
//             </div>
//             <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
//               Cycle.LK
//             </span>
//           </Link> */}
          
//           <Link to="/" className="flex items-center space-x-2">
//           <div className="h-12 w-12 rounded-xl overflow-hidden">
//             <img
//             src="https://res.cloudinary.com/di9vcyned/image/upload/v1755623346/logo_vo5njt.jpg"
//             alt="Logo"
//             className="h-full w-full object-contain"
//             />
//           </div>
//           <span className="text-2xl font-bold bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] bg-clip-text text-transparent font-sans">
//             Cycle.LK
//           </span>
//           </Link>
          
//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8">
//             <Link 
//               to="/" 
//               className={`font-medium transition-colors ${
//                 isActive('/') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
//               }`}
//             >
//               Home
//             </Link>
//             <Link 
//               to="/booking" 
//               className={`font-medium transition-colors ${
//                 isActive('/booking') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
//               }`}
//             >
//               Book Now
//             </Link>
//             <Link 
//               to="/locations" 
//               className={`font-medium transition-colors ${
//                 isActive('/locations') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
//               }`}
//             >
//               Locations
//             </Link>
//             <Link 
//               to="/partners" 
//               className={`font-medium transition-colors ${
//                 isActive('/partners') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
//               }`}
//             >
//               Partners
//             </Link>
//             <Link 
//               to="/support" 
//               className={`font-medium transition-colors ${
//                 isActive('/support') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
//               }`}
//             >
//               Support
//             </Link>
            
//             {isAuthenticated ? (
//               <div className="flex items-center space-x-4">
//                 <Link
//                   to="/notifications"
//                   className="relative p-2 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-emerald-50 transition-all duration-150 text-gray-600 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
//                   aria-label="Notifications"
//                 >
//                   <Bell className={`h-5 w-5 ${unreadCount > 0 ? '' : ''}`} />
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow">
//                       {unreadCount > 9 ? '9+' : unreadCount}
//                     </span>
//                   )}
//                 </Link>

//                 <div className="relative" ref={dashboardRef}>
//                   <button 
//                     onClick={() => setIsDashboardOpen(!isDashboardOpen)}
//                     className="flex items-center space-x-2 p-2 px-4 rounded-full bg-white/80 border border-gray-200 shadow hover:bg-emerald-50 transition-all duration-150 text-gray-700 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
//                     aria-label="Profile and dashboard menu"
//                   >
//                     <User className="h-5 w-5" />
//                     <span className="font-medium">{user?.firstName || 'Dashboard'}</span>
//                     <ChevronDown className={`h-4 w-4 transform transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
//                   </button>

//                   {isDashboardOpen && (
//                     <div className="absolute right-0 w-60 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
//                       {user?.role === 'user' && (
//                         <Link 
//                          to="/dashboard" 
//                          className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50"
//                          onClick={() => setIsDashboardOpen(false)}
//                        >
//                          <User className="h-5 w-5 text-emerald-600" />
//                          <div>
//                            <div className="font-medium">User Dashboard</div>
//                            <div className="text-xs text-gray-500">Manage your bookings</div>
//                          </div>
//                         </Link>
//                       )}
                      
//                       {user?.role === 'partner' && (
//                         <Link 
//                           to="/partner-dashboard" 
//                           className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                           onClick={() => setIsDashboardOpen(false)}
//                         >
//                           <Building className="h-5 w-5 text-blue-600" />
//                           <div>
//                             <div className="font-medium">Partner Dashboard</div>
//                             <div className="text-xs text-gray-500">Manage your rental business</div>
//                           </div>
//                         </Link>
//                       )}
                      
//                       {user?.role === 'admin' && (
//                         <Link 
//                           to="/admin-dashboard" 
//                           className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                           onClick={() => setIsDashboardOpen(false)}
//                         >
//                           <ShieldCheck className="h-5 w-5 text-purple-600" />
//                           <div>
//                             <div className="font-medium">Admin Dashboard</div>
//                             <div className="text-xs text-gray-500">System administration</div>
//                           </div>
//                         </Link>
//                       )}
                      
//                       <Link 
//                         to="/profile" 
//                         className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
//                         onClick={() => setIsDashboardOpen(false)}
//                       >
//                         <User className="h-5 w-5 text-gray-600" />
//                         <div>
//                           <div className="font-medium">Profile</div>
//                           <div className="text-xs text-gray-500">View and edit your profile</div>
//                         </div>
//                       </Link>
                      
//                       <button 
//                         onClick={() => {
//                           logout();
//                           setIsDashboardOpen(false);
//                         }}
//                         className="w-full flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100 text-left"
//                       >
//                         <LogOut className="h-5 w-5 text-red-600" />
//                         <div>
//                           <div className="font-medium">Log out</div>
//                           <div className="text-xs text-gray-500">End your current session</div>
//                         </div>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <Link 
//                   to="/login" 
//                   className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 font-semibold shadow-sm transition-colors duration-150"
//                 >
//                   Log in
//                 </Link>
//                 <Link 
//                   to="/register" 
//                   className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors"
//                 >
//                   Register
//                 </Link>
//               </div>
//             )}
//           </nav>
//         </div>
//         {/* Mobile menu button (hidden on md+) */}
//         <button
//           onClick={() => setIsMenuOpen(!isMenuOpen)}
//           className="md:hidden absolute top-4 right-4 p-2 text-gray-600 hover:text-emerald-600 transition-colors z-50"
//           aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//         >
//           {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//         </button>
//       </div>
//       {/* Mobile Navigation */}
//       {showMobileNav && (
//         <div
//           className={`md:hidden fixed left-0 right-0 top-16 z-40 w-full
//             py-4 border-t bg-white shadow-lg rounded-b-xl
//             transition-all duration-300 ease-out
//             ${isMenuOpen ? 'animate-navbar-slide' : 'animate-navbar-slide-reverse'}
//           `}
//         >
//           <nav className="flex flex-col space-y-1 px-2">
//             <Link 
//               to="/" 
//               className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
//                 isActive('/') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
//               }`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link 
//               to="/booking" 
//               className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
//                 isActive('/booking') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
//               }`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Book Now
//             </Link>
//             <Link 
//               to="/locations" 
//               className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
//                 isActive('/locations') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
//               }`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Locations
//             </Link>
//             <Link 
//               to="/partners" 
//               className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
//                 isActive('/partners') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
//               }`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Partners
//             </Link>
//             <Link 
//               to="/support" 
//               className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
//                 isActive('/support') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
//               }`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Support
//             </Link>
//             {isAuthenticated && (
//               <div className="pt-3 mt-3 border-t border-gray-100">
//                 <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Dashboards</h3>
//                 <div className="space-y-1">
//                   {user?.role === 'user' && (
//                     <Link 
//                       to="/dashboard" 
//                       className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
//                         isActive('/dashboard') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
//                       }`}
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       <User className="h-5 w-5 mr-3" />
//                       User Dashboard
//                     </Link>
//                   )}
//                   {user?.role === 'partner' && (
//                     <Link 
//                       to="/partner-dashboard" 
//                       className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
//                         isActive('/partner-dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
//                       }`}
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       <Building className="h-5 w-5 mr-3" />
//                       Partner Dashboard
//                     </Link>
//                   )}
//                   {user?.role === 'admin' && (
//                     <Link 
//                       to="/admin-dashboard" 
//                       className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
//                         isActive('/admin-dashboard') ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'
//                       }`}
//                       onClick={() => setIsMenuOpen(false)}
//                     >
//                       <ShieldCheck className="h-5 w-5 mr-3" />
//                       Admin Dashboard
//                     </Link>
//                   )}
//                   {/* Profile link */}
//                   <Link
//                     to="/profile"
//                     className="flex items-center rounded-lg px-4 py-3 font-medium transition-colors text-gray-700 hover:bg-gray-50"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <User className="h-5 w-5 mr-3" />
//                     Profile
//                   </Link>
//                   {/* Logout button */}
//                   <button
//                     onClick={() => {
//                       logout();
//                       setIsMenuOpen(false);
//                     }}
//                     className="flex items-center rounded-lg px-4 py-3 font-medium transition-colors text-gray-700 hover:bg-gray-50 w-full text-left"
//                   >
//                     <LogOut className="h-5 w-5 mr-3 text-red-600" />
//                     Log out
//                   </button>
//                 </div>
//               </div>
//             )}
//             {/* For mobile nav (not authenticated) */}
//             {!isAuthenticated && (
//               <div className="flex flex-col space-y-2 pt-4">
//                 <Link 
//                   to="/login" 
//                   className="block rounded-lg px-4 py-3 border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 font-semibold shadow-sm transition-colors duration-150"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Log in
//                 </Link>
//                 <Link 
//                   to="/register" 
//                   className="block rounded-lg px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Register
//                 </Link>
//               </div>
//             )}
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;





// 🟠perfect UI
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell, ChevronDown, Building, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const isActive = (path: string) => location.pathname === path;

  // Close the dashboard dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle mounting/unmounting for animation
  useEffect(() => {
    if (isMenuOpen) {
      setShowMobileNav(true);
    } else if (showMobileNav) {
      const timeout = setTimeout(() => setShowMobileNav(false), 300);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  return (
    <header className="fixed w-full z-50 top-0 left-0 right-0 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative flex justify-between items-center h-16 transition-all duration-300
            bg-white/20 dark:bg-gray-500/50 backdrop-blur-md rounded-lg border border-white/80 dark:border-gray-500/20 shadow-md
            ${isMenuOpen ? 'rounded-b-none' : ''}
          `}
        >
        {/* Logo Section */}
        <div className="logo-section flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="https://res.cloudinary.com/di9vcyned/image/upload/v1759076638/lightmode_ni0n0u.png"
              alt="Cycle.LK Logo"
              className="h-25 pt-2 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 pr-4">
          <Link
            to="/"
            className={`font-medium transition-colors ${
              isActive('/') ? 'text-[#00D4AA]' : 'text-[#f7f1f7] hover:text-[#00D4AA]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/booking"
            className={`font-medium transition-colors ${
              isActive('/booking') ? 'text-[#00D4AA]' : 'text-[#f7f1f7] hover:text-[#00D4AA]'
            }`}
          >
            Book Now
          </Link>
          <Link
            to="/locations"
            className={`font-medium transition-colors ${
              isActive('/locations') ? 'text-[#00D4AA]' : 'text-[#f7f1f7] hover:text-[#00D4AA]'
            }`}
          >
            Locations
          </Link>
          <Link
            to="/partners"
            className={`font-medium transition-colors ${
              isActive('/partners') ? 'text-[#00D4AA]' : 'text-[#f7f1f7] hover:text-[#00D4AA]'
            }`}
          >
            Partners
          </Link>
          <Link
            to="/support"
            className={`font-medium transition-colors ${
              isActive('/support') ? 'text-[#00D4AA]' : 'text-[#f7f1f7] hover:text-[#00D4AA]'
            }`}
          >
            Support
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/notifications"
                className="relative p-2 rounded-full bg-white/10 dark:bg-gray-500/30 backdrop-blur-md border border-white/30 dark:border-gray-500/20 shadow-md hover:bg-white/20 dark:hover:bg-gray-500/40 transition-all duration-150 text-[#f7f1f7] hover:text-[#00D4AA] focus:outline-none focus:ring-2 focus:ring-emerald-200"
                aria-label="Notifications"
              >
                <Bell className={`h-5 w-5 ${unreadCount > 0 ? '' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={dashboardRef}>
                <button
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                  className="flex items-center space-x-2 p-2 px-4 rounded-full bg-white/10 dark:bg-gray-500/30 backdrop-blur-md border border-white/30 dark:border-gray-500/20 shadow-md hover:bg-white/20 dark:hover:bg-gray-500/40 transition-all duration-150 text-[#f7f1f7] hover:text-[#00D4AA] focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label="Profile and dashboard menu"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user?.firstName || 'Dashboard'}</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDashboardOpen && (
                  <div className="absolute right-[-1rem] w-60 mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden z-50">
                    {user?.role === 'user' && (
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 p-4 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
                        onClick={() => setIsDashboardOpen(false)}
                      >
                        <User className="h-5 w-5 text-emerald-600" />
                        <div>
                          <div className="font-medium">User Dashboard</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Manage your bookings</div>
                        </div>
                      </Link>
                    )}

                    {user?.role === 'partner' && (
                      <Link
                        to="/partner-dashboard"
                        className="flex items-center space-x-3 p-4 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600 transition-all duration-150"
                        onClick={() => setIsDashboardOpen(false)}
                      >
                        <Building className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Partner Dashboard</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Manage your rental business</div>
                        </div>
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin-dashboard"
                        className="flex items-center space-x-3 p-4 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600 transition-all duration-150"
                        onClick={() => setIsDashboardOpen(false)}
                      >
                        <ShieldCheck className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Admin Dashboard</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">System administration</div>
                        </div>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-4 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600 transition-all duration-150"
                      onClick={() => setIsDashboardOpen(false)}
                    >
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Profile</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">View and edit your profile</div>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsDashboardOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 p-4 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-left transition-all duration-150"
                    >
                      <LogOut className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-medium">Log out</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">End your current session</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-white/10 dark:bg-gray-500/30 backdrop-blur-md border border-white/30 dark:border-gray-500/20 text-[#f7f1f7] hover:bg-white/20 dark:hover:bg-gray-500/40 hover:text-[#00D4AA] font-semibold shadow-md transition-all duration-150"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-emerald-600/90 backdrop-blur-md text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors shadow-md"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu button (hidden on lg+) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full bg-white/10 dark:bg-gray-500/30 backdrop-blur-md border border-white/30 dark:border-gray-500/20 shadow-md text-[#f7f1f7] hover:text-[#00D4AA] hover:bg-white/20 dark:hover:bg-gray-500/40 transition-all duration-150 z-50"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && (
        <div className="fixed inset-x-0 top-[82px] z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`lg:hidden w-full
                py-4 bg-white/20 dark:bg-gray-500/50 backdrop-blur-md rounded-b-xl border border-white/30 dark:border-gray-500/20 border-t-0 shadow-lg
                transition-all duration-300 ease-out
                ${isMenuOpen ? 'animate-navbar-slide' : 'animate-navbar-slide-reverse'}
              `}
            >
          <nav className="flex flex-col space-y-1 px-2">
            <Link
              to="/"
              className={`block rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                isActive('/') 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/booking"
              className={`block rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                isActive('/booking') 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Book Now
            </Link>
            <Link
              to="/locations"
              className={`block rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                isActive('/locations') 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Locations
            </Link>
            <Link
              to="/partners"
              className={`block rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                isActive('/partners') 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Partners
            </Link>
            <Link
              to="/support"
              className={`block rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                isActive('/support') 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            
            {isAuthenticated && (
              <div className="pt-3 mt-3 border-t border-white/20 dark:border-gray-500/30">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Dashboards</h3>
                <div className="space-y-1">
                  {user?.role === 'user' && (
                    <Link
                      to="/dashboard"
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                        isActive('/dashboard') 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      User Dashboard
                    </Link>
                  )}
                  {user?.role === 'partner' && (
                    <Link
                      to="/partner-dashboard"
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                        isActive('/partner-dashboard') 
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building className="h-5 w-5 mr-3" />
                      Partner Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-all duration-150 ${
                        isActive('/admin-dashboard') 
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' 
                          : 'text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShieldCheck className="h-5 w-5 mr-3" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center rounded-lg px-4 py-3 font-medium transition-all duration-150 text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center rounded-lg px-4 py-3 font-medium transition-all duration-150 text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-500/60 w-full text-left"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-red-600" />
                    Log out
                  </button>
                </div>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="flex flex-col space-y-2 pt-4">
                <Link
                  to="/login"
                  className="block rounded-lg px-4 py-3 bg-white/10 dark:bg-gray-500/30 backdrop-blur-md border border-white/30 dark:border-gray-500/20 text-gray-800 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-500/40 hover:text-emerald-600 font-semibold shadow-md transition-all duration-150 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block rounded-lg px-4 py-3 bg-emerald-600/90 backdrop-blur-md text-white hover:bg-emerald-700 font-medium transition-colors shadow-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
        </div>
        </div>
      )}
    </div>
    </header>
  );
};

export default Header;