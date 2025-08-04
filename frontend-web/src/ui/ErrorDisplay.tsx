import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorDisplayProps {
  /** Error message to display */
  error: string;
  /** Retry function */
  onRetry?: () => void;
  /** Show as a full page error (with more spacing) */
  fullPage?: boolean;
  /** Custom icon to use instead of AlertCircle */
  icon?: React.ReactNode;
  /** Custom className */
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  fullPage = false,
  icon,
  className = ''
}) => {
  const containerClasses = fullPage 
    ? "text-center py-12" 
    : "bg-red-50 border border-red-200 rounded-lg p-6 text-center";

  return (
    <div className={`${containerClasses} ${className}`}>
      {icon || <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />}
      
      <div className={`${fullPage ? 'text-lg font-semibold text-gray-900 mb-2' : 'text-red-600 mb-2 font-medium'}`}>
        {error}
      </div>
      
      {fullPage && (
        <p className="text-gray-600 mb-6">
          Please try again or contact support if the problem persists.
        </p>
      )}
      
      {onRetry && (
        <Button
          variant={fullPage ? "primary" : "ghost"}
          onClick={onRetry}
          icon={RefreshCw}
          className={fullPage ? "" : "text-emerald-600 hover:text-emerald-700"}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;
