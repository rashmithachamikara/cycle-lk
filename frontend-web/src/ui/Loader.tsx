import React from 'react';
import { Loader as LoaderIcon } from 'lucide-react';

interface LoaderProps {
  /** Custom message to display alongside the loader */
  message?: string;
  /** Size of the loader icon */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className for the container */
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = "Loading...", 
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <LoaderIcon className={`${sizeClasses[size]} text-emerald-500 animate-spin`} />
      <span className="ml-2 text-gray-600">{message}</span>
    </div>
  );
};

export default Loader;
