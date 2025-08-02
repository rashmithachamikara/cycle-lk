import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader className="h-8 w-8 text-emerald-500 animate-spin" />
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
};

export default LoadingState;
