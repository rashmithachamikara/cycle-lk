// frontend-web/pages/PartnerRegistrationPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PartnerRegistrationForm from '../components/PartnerRegistrationPage/PartnerRegistrationForm';
import RegistrationSuccess from '../components/PartnerRegistrationPage/RegistrationSuccess';

const PartnerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [success, setSuccess] = useState(false);

  const isUserAuthenticated = isAuthenticated && user;

  const handleSuccess = () => {
    setSuccess(true);
    // Redirect to success page or partner dashboard after a delay
    setTimeout(() => {
      navigate('/partners', { replace: true });
    }, 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
          <RegistrationSuccess />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Cycle.LK Partner</h1>
          <p className="text-xl text-gray-600">
            {isUserAuthenticated 
              ? "Join our network and grow your bike rental business across Sri Lanka"
              : "Create your account and join our network of bike rental partners across Sri Lanka"
            }
          </p>
          {isUserAuthenticated && (
            <p className="text-sm text-emerald-600 mt-2">
              Welcome back, {user.firstName}! Let's set up your partner account.
            </p>
          )}
        </div>

        <PartnerRegistrationForm onSuccess={handleSuccess} />

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Have questions? <Link to="/support" className="text-emerald-600 hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PartnerRegistrationPage;