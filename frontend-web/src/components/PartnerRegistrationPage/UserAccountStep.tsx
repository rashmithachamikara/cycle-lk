import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, UserPlus } from 'lucide-react';
import { FormField } from '../forms';
import { StepProps } from './types';

const UserAccountStep: React.FC<StepProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Account</h3>
        <p className="text-gray-600">First, let's create your user account</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={onInputChange}
          placeholder="Enter your first name"
          required
          icon={User}
        />

        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={onInputChange}
          placeholder="Enter your last name"
          required
          icon={User}
        />
      </div>

      <FormField
        label="Email Address"
        name="userEmail"
        type="email"
        value={formData.userEmail}
        onChange={onInputChange}
        placeholder="your@email.com"
        required
        icon={Mail}
      />

      <FormField
        label="Phone Number"
        name="userPhone"
        type="tel"
        value={formData.userPhone}
        onChange={onInputChange}
        placeholder="+94 XX XXX XXXX"
        required
        icon={Phone}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onInputChange}
          placeholder="Enter a secure password"
          required
        />

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={onInputChange}
          placeholder="Confirm your password"
          required
        />
      </div>

      {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
        <p className="text-red-500 text-sm">Passwords do not match</p>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <UserPlus className="h-4 w-4 inline mr-1" />
          Already have an account? <Link to="/login" className="underline">Login here</Link> to register as a partner.
        </p>
      </div>
    </div>
  );
};

export default UserAccountStep;
