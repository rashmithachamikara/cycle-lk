// React import is automatically included in JSX files
import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/bike/:id" element={<BikeDetailsPage />} />
      <Route path="/locations" element={<LocationsPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/partner-dashboard" element={<PartnerDashboardPage />} />
      <Route path="/partner-dashboard/:section" element={<PartnerDashboardPage />} />
      <Route path="/add-bike" element={<AddBikePage />} />
      <Route path="/edit-bike/:id" element={<EditBikePage />} />
      <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin-dashboard/:section" element={<AdminDashboardPage />} />
    </Routes>
  );
}

export default App;