// // React import is automatically included in JSX files
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './contexts/AuthContext';
// import HomePage from './pages/HomePage';
// import BookingPage from './pages/BookingPage';
// import DashboardPage from './pages/DashboardPage';
// import BikeDetailsPage from './pages/BikeDetailsPage';
// import LocationsPage from './pages/LocationsPage';
// import LocationPage from './pages/LocationPage';
// import PartnersPage from './pages/PartnersPage';
// import ProfilePage from './pages/ProfilePage';
// import SupportPage from './pages/SupportPage';
// import PartnerDashboardPage from './pages/PartnerDashboardPage';
// import AdminDashboardPage from './pages/AdminDashboardPage';
// import AddBikePage from './pages/AddBikePage';
// import EditBikePage from './pages/EditBikePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import TestPage from './pages/TestPage';

// // Protected route component
// const ProtectedRoute = ({ element, requiredRole }: { element: JSX.Element, requiredRole?: string }) => {
//   const { isAuthenticated, user, isLoading } = useAuth();

//   // Show loading or redirect if still checking authentication
//   if (isLoading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }

//   // Check if user is authenticated
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Check if role requirement is met (if specified)
//   if (requiredRole && user?.role !== requiredRole) {
//     return <Navigate to="/" replace />;
//   }

//   return element;
// };

// function App() {
//   const { isAuthenticated } = useAuth();

//   return (
//     <Routes>
//       <Route path="/" element={<HomePage />} />
//       <Route path="/booking" element={<BookingPage />} />
//       <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
//       <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
//       <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
//       <Route path="/bike/:id" element={<BikeDetailsPage />} />
//       <Route path="/locations" element={<LocationsPage />} />
//       <Route path="/location/:id" element={<LocationPage />} />
//       <Route path="/partners" element={<PartnersPage />} />
//       <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
//       <Route path="/support" element={<SupportPage />} />
//       <Route path="/partner-dashboard" element={<ProtectedRoute element={<PartnerDashboardPage />} requiredRole="partner" />} />
//       <Route path="/partner-dashboard/:section" element={<ProtectedRoute element={<PartnerDashboardPage />} requiredRole="partner" />} />
//       <Route path="/add-bike" element={<ProtectedRoute element={<AddBikePage />} requiredRole="partner" />} />
//       <Route path="/edit-bike/:id" element={<ProtectedRoute element={<EditBikePage />} requiredRole="partner" />} />
//       <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} requiredRole="partner" />} />
//       <Route path="/admin-dashboard/:section" element={<ProtectedRoute element={<AdminDashboardPage />} requiredRole="partner" />} />
//       <Route path="/test" element={<ProtectedRoute element={<TestPage />} requiredRole="partner" />} />
//     </Routes>
//   );
// }

// export default App;


// React import is automatically included in JSX files
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import BikeDetailsPage from './pages/BikeDetailsPage';
import LocationsPage from './pages/LocationsPage';
import LocationPage from './pages/LocationPage';
import PartnersPage from './pages/PartnersPage';
import PartnerBikesPage from './pages/PartnerBikesPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage/PartnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AddBikePage from './pages/PartnerDashboardPage/AddBikePage';
import EditBikePage from './pages/EditBikePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PartnerRegistrationPage from './pages/PartnerRegistrationPage';
import TestPage from './pages/TestPage';

// Protected route component with support for multiple roles
const ProtectedRoute = ({ 
  element, 
  requiredRole, 
  requiredRoles 
}: { 
  element: JSX.Element, 
  requiredRole?: string,
  requiredRoles?: string[]
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show loading or redirect if still checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role requirements
  if (requiredRole || requiredRoles) {
    const userRole = user?.role;
    
    // If user has no role, deny access
    if (!userRole) {
      return <Navigate to="/" replace />;
    }
    
    // Check single role requirement
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
    
    // Check multiple roles requirement
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }
  
  return element;
};

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} requiredRoles={["user"]} />} />
      <Route path="/booking-details/:id" element={<ProtectedRoute element={<BookingDetailsPage />} requiredRoles={["admin", "partner", "user"]} />} />
      <Route path="/bike/:id" element={<BikeDetailsPage />} />
      <Route path="/locations" element={<LocationsPage />} />
      <Route path="/location/:id" element={<LocationPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/partners/:partnerId/bikes" element={<PartnerBikesPage />} />
      <Route path="/partner-registration" element={<PartnerRegistrationPage />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/support" element={<SupportPage />} />
      
      {/* Partner-only routes */}
      <Route path="/partner-dashboard" element={<ProtectedRoute element={<PartnerDashboardPage />} requiredRole="partner" />} />
      <Route path="/partner-dashboard/add-bike" element={<ProtectedRoute element={<AddBikePage />} requiredRole="partner" />} />
      <Route path="/partner-dashboard/add-bike" element={<ProtectedRoute element={<AddBikePage />} requiredRole="partner" />} />
      <Route path="/partner-dashboard/:section" element={<ProtectedRoute element={<PartnerDashboardPage />} requiredRole="partner" />} />
      <Route path="/edit-bike/:id" element={<ProtectedRoute element={<EditBikePage />} requiredRole="partner" />} />
      <Route 
        path="/admin-dashboard" 
        element={<ProtectedRoute element={<AdminDashboardPage />} requiredRoles={["admin", "partner"]} />} 
      />
      <Route 
        path="/admin-dashboard/:section" 
        element={<ProtectedRoute element={<AdminDashboardPage />} requiredRoles={["admin", "partner"]} />} 
      />
      
      {/* Test route - accessible by both admin and partner roles */}
      <Route 
        path="/test" 
        element={<ProtectedRoute element={<TestPage />} requiredRoles={["admin", "partner"]} />} 
      />
    </Routes>
  );
}

export default App;