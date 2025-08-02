// React import is automatically included in JSX files
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import BikeDetailsPage from './pages/BikeDetailsPage';
import LocationsPage from './pages/LocationsPage';
import PartnersPage from './pages/PartnersPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AddBikePage from './pages/AddBikePage';
import EditBikePage from './pages/EditBikePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TestPage from './pages/TestPage';

// Protected route component
const ProtectedRoute = ({ element, requiredRole }: { element: JSX.Element, requiredRole?: string }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading or redirect if still checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if role requirement is met (if specified)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
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
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
      <Route path="/bike/:id" element={<BikeDetailsPage />} />
      <Route path="/locations" element={<LocationsPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/partner-dashboard" element={<ProtectedRoute element={<PartnerDashboardPage />} requiredRole="partner" />} />
      <Route path="/partner-dashboard/:section" element={<ProtectedRoute element={<PartnerDashboardPage />} requiredRole="partner" />} />
      <Route path="/add-bike" element={<ProtectedRoute element={<AddBikePage />} requiredRole="partner" />} />
      <Route path="/edit-bike/:id" element={<ProtectedRoute element={<EditBikePage />} requiredRole="partner" />} />
      <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboardPage />} requiredRole="admin" />} />
      <Route path="/admin-dashboard/:section" element={<ProtectedRoute element={<AdminDashboardPage />} requiredRole="admin" />} />
      <Route path="/test" element={<ProtectedRoute element={<TestPage />} requiredRole="partner" />} />
    </Routes>
  );
}

export default App;