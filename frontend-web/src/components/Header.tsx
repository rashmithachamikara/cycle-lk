import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell, ChevronDown, Building, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false); // for animation
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
      // Wait for animation to finish before unmounting
      const timeout = setTimeout(() => setShowMobileNav(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isMenuOpen]);

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-300 sticky top-0 z-50 transition-all
        ${!isMenuOpen ? 'header-blur bg-opacity-40' : ''}
        md:header-blur
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative ">
        <div className="flex justify-between items-center h-16">
          {/* <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Cycle.LK
            </span>
          </Link> */}
          
          <Link to="/" className="flex items-center space-x-2">
          <div className="h-12 w-12 rounded-xl overflow-hidden">
            <img
            src="https://res.cloudinary.com/di9vcyned/image/upload/v1755623346/logo_vo5njt.jpg"
            alt="Logo"
            className="h-full w-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#1E90FF] to-[#00D4AA] bg-clip-text text-transparent font-sans">
            Cycle.LK
          </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/booking" 
              className={`font-medium transition-colors ${
                isActive('/booking') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Book Now
            </Link>
            <Link 
              to="/locations" 
              className={`font-medium transition-colors ${
                isActive('/locations') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Locations
            </Link>
            <Link 
              to="/partners" 
              className={`font-medium transition-colors ${
                isActive('/partners') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Partners
            </Link>
            <Link 
              to="/support" 
              className={`font-medium transition-colors ${
                isActive('/support') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
              }`}
            >
              Support
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={dashboardRef}>
                  <button 
                    onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user?.firstName || 'Dashboard'}</span>
                    <ChevronDown className={`h-4 w-4 transform transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDashboardOpen && (
                    <div className="absolute right-0 w-60 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                      {user?.role === 'user' && (
                        <Link 
                         to="/dashboard" 
                         className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50"
                         onClick={() => setIsDashboardOpen(false)}
                       >
                         <User className="h-5 w-5 text-emerald-600" />
                         <div>
                           <div className="font-medium">User Dashboard</div>
                           <div className="text-xs text-gray-500">Manage your bookings</div>
                         </div>
                        </Link>
                      )}
                      
                      {user?.role === 'partner' && (
                        <Link 
                          to="/partner-dashboard" 
                          className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          onClick={() => setIsDashboardOpen(false)}
                        >
                          <Building className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Partner Dashboard</div>
                            <div className="text-xs text-gray-500">Manage your rental business</div>
                          </div>
                        </Link>
                      )}
                      
                      {user?.role === 'admin' && (
                        <Link 
                          to="/admin-dashboard" 
                          className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          onClick={() => setIsDashboardOpen(false)}
                        >
                          <ShieldCheck className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="font-medium">Admin Dashboard</div>
                            <div className="text-xs text-gray-500">System administration</div>
                          </div>
                        </Link>
                      )}
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                        onClick={() => setIsDashboardOpen(false)}
                      >
                        <User className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Profile</div>
                          <div className="text-xs text-gray-500">View and edit your profile</div>
                        </div>
                      </Link>
                      
                      <button 
                        onClick={() => {
                          logout();
                          setIsDashboardOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-4 text-gray-700 hover:bg-gray-50 border-t border-gray-100 text-left"
                      >
                        <LogOut className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-medium">Log out</div>
                          <div className="text-xs text-gray-500">End your current session</div>
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
                  className="px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
        {/* Mobile menu button (hidden on md+) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-600 hover:text-emerald-600 transition-colors z-50"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {/* Mobile Navigation */}
      {showMobileNav && (
        <div
          className={`md:hidden fixed left-0 right-0 top-16 z-40 w-full
            py-4 border-t bg-white shadow-lg rounded-b-xl
            transition-all duration-300 ease-out
            ${isMenuOpen ? 'animate-navbar-slide' : 'animate-navbar-slide-reverse'}
          `}
        >
          <nav className="flex flex-col space-y-1 px-2">
            <Link 
              to="/" 
              className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                isActive('/') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/booking" 
              className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                isActive('/booking') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Book Now
            </Link>
            <Link 
              to="/locations" 
              className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                isActive('/locations') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Locations
            </Link>
            <Link 
              to="/partners" 
              className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                isActive('/partners') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Partners
            </Link>
            <Link 
              to="/support" 
              className={`block rounded-lg px-4 py-3 font-medium transition-colors ${
                isActive('/support') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            {isAuthenticated && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Dashboards</h3>
                <div className="space-y-1">
                  {user?.role === 'user' && (
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
                        isActive('/dashboard') ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
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
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
                        isActive('/partner-dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
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
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
                        isActive('/admin-dashboard') ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShieldCheck className="h-5 w-5 mr-3" />
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col space-y-2 pt-4">
                <Link 
                  to="/login" 
                  className="block rounded-lg px-4 py-3 text-gray-700 hover:text-emerald-600 font-medium transition-colors hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="block rounded-lg px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;