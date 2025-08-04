import React from 'react';
import { ErrorDisplay } from '../../ui';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return <ErrorDisplay error={error} onRetry={onRetry} />;
};

export default ErrorState;
