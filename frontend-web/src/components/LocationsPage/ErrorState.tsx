import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
      <div className="text-red-600 mb-2 font-medium">{error}</div>
      <button 
        onClick={onRetry}
        className="text-emerald-600 hover:text-emerald-700 font-medium"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState;
