// // frontend-web/components/PartnerRegistrationPage/RegistrationSuccess.tsx
// import React from 'react';
// import { CheckCircle } from 'lucide-react';
// import Header from '../Header';
// import Footer from '../Footer';
// import { RegistrationSuccessProps } from './types';

// const RegistrationSuccess: React.FC<RegistrationSuccessProps> = () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header />
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//           <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
//           <p className="text-gray-600 mb-6">
//             Thank you for joining Cycle.LK! Your partner application has been submitted and is now under review.
//             You'll receive an email notification once your account is verified.
//           </p>
//           <p className="text-sm text-gray-500">
//             Redirecting you to the partners page...
//           </p>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default RegistrationSuccess;



// frontend-web/components/PartnerRegistrationPage/RegistrationSuccess.tsx

import React from 'react';
import { CheckCircle, Mail, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type RegistrationSuccessProps } from './types';

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-emerald-100 rounded-full p-4">
          <CheckCircle className="h-16 w-16 text-emerald-600" />
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
      
      <p className="text-gray-600 mb-6">
        Thank you for joining Cycle.LK! Your partner application has been submitted and is now under review.
        You'll receive an email notification once your account is verified.
      </p>

      {/* Next Steps */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">What happens next?</h3>
        
        <div className="space-y-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-200 rounded-full p-1 mt-1">
              <Mail className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-800">Email Confirmation</h4>
              <p className="text-emerald-700 text-sm">
                You'll receive a confirmation email within the next few minutes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-emerald-200 rounded-full p-1 mt-1">
              <Clock className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-800">Application Review</h4>
              <p className="text-emerald-700 text-sm">
                Our team will review your application within 2-3 business days.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-emerald-200 rounded-full p-1 mt-1">
              <CheckCircle className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-800">Account Activation</h4>
              <p className="text-emerald-700 text-sm">
                Once approved, you'll receive login credentials and setup instructions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Return to Homepage
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>

        <Link
          to="/support"
          className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Contact Support
        </Link>
      </div>

      {/* Additional Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Application Reference:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Please save this reference number for your records
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Redirecting you to the partners page...
        </p>
      </div>

      {/* Close Button (if modal) */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default RegistrationSuccess;