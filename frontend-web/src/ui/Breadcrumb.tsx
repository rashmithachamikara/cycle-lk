import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  /** Display text */
  label: string;
  /** URL to navigate to (if clickable) */
  href?: string;
  /** Whether this is the current/active item */
  active?: boolean;
}

interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Custom separator */
  separator?: string;
  /** Custom className */
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = "/",
  className = ""
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 mb-6 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">{separator}</span>}
          
          {item.href && !item.active ? (
            <Link
              to={item.href}
              className="hover:text-emerald-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={item.active ? "text-gray-900 font-medium" : "text-gray-600"}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
