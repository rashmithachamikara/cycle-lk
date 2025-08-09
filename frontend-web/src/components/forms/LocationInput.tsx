import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  suggestions?: string[];
  disabled?: boolean;
  className?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Enter or select location",
  required = false,
  suggestions = [],
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter suggestions based on input value
    if (value.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.trim() && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const baseInputClasses = `w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    disabled ? 'bg-gray-100 cursor-not-allowed' : ''
  } ${className}`;

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
            >
              <MapPin className="h-4 w-4 inline mr-2 text-gray-400" />
              {suggestion}
            </button>
          ))}
          {value.trim() && !suggestions.some(s => s.toLowerCase() === value.toLowerCase()) && (
            <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
              <span className="font-medium">Custom location:</span> "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
