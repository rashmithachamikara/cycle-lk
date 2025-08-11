import React from 'react';
import { CheckCircle } from 'lucide-react';
import Header from '../Header';
import Footer from '../Footer';
import { RegistrationSuccessProps } from './types';

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for joining Cycle.LK! Your partner application has been submitted and is now under review.
            You'll receive an email notification once your account is verified.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to the partners page...
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegistrationSuccess;
