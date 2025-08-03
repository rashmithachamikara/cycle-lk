import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** URL to navigate back to */
  to: string;
  /** Custom text for the button */
  text?: string;
  /** Custom className */
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  text = "Back",
  className = ""
}) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </Link>
  );
};

export default BackButton;
