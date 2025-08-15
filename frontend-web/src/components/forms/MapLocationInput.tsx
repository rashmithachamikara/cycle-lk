//frontend-web/components/forms/MapLocationInput.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Map, Search, X, Loader2 } from 'lucide-react';
import { googleMapsService } from '../../services/googleMapsService';
import { type LocationData, type LocationCoordinates } from '../../config/googleMaps';

interface MapLocationInputProps {
  value: string;
  onChange: (value: string, locationData?: LocationData) => void;
  placeholder?: string;
  required?: boolean;
  suggestions?: string[];
  disabled?: boolean;
  className?: string;
  showMap?: boolean;
  mapHeight?: string;
  onLocationSelect?: (location: LocationData) => void;
}

const MapLocationInput: React.FC<MapLocationInputProps> = ({
  value,
  onChange,
  placeholder = "Search location or click on map",
  required = false,
  suggestions = [],
  disabled = false,
  className = '',
  showMap = true,
  mapHeight = '300px',
  onLocationSelect
}) => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter local suggestions
  useEffect(() => {
    if (value.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setLocalSuggestions(filtered);
    } else {
      setLocalSuggestions(suggestions);
    }
  }, [value, suggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle location selection from coordinates
  const handleLocationSelect = useCallback(async (coordinates: LocationCoordinates) => {
    try {
      setIsLoading(true);
      const locationData = await googleMapsService.reverseGeocode(coordinates);
      
      if (locationData) {
        setSelectedLocation(locationData);
        onChange(locationData.address, locationData);
        onLocationSelect?.(locationData);
      }
    } catch (error) {
      console.error('Error getting location data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onChange, onLocationSelect]);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || map) return;

    try {
      setIsLoading(true);
      const newMap = await googleMapsService.createMap(mapRef.current, {
        center: { lat: 6.9271, lng: 79.8612 }, // Colombo
        zoom: 13,
      });

      setMap(newMap);

      // Add click listener to map
      newMap.addListener('click', async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const coordinates: LocationCoordinates = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };

          // Place marker
          if (marker) {
            marker.setPosition(event.latLng);
          } else {
            const newMarker = new google.maps.Marker({
              position: event.latLng,
              map: newMap,
              draggable: true,
              title: 'Selected Location',
            });

            // Add drag listener to marker
            newMarker.addListener('dragend', async () => {
              const position = newMarker.getPosition();
              if (position) {
                const dragCoordinates: LocationCoordinates = {
                  lat: position.lat(),
                  lng: position.lng(),
                };
                await handleLocationSelect(dragCoordinates);
              }
            });

            setMarker(newMarker);
          }

          await handleLocationSelect(coordinates);
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      setIsLoading(false);
    }
  }, [map, marker, handleLocationSelect]);

  // Initialize autocomplete
  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || autocomplete) return;

    try {
      const newAutocomplete = await googleMapsService.createAutocomplete(inputRef.current);
      setAutocomplete(newAutocomplete);

      newAutocomplete.addListener('place_changed', () => {
        const place = newAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const locationData: LocationData = {
            address: place.formatted_address || place.name || '',
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address || place.name,
              placeId: place.place_id,
            },
            placeId: place.place_id,
            formattedAddress: place.formatted_address,
          };

          setSelectedLocation(locationData);
          onChange(locationData.address, locationData);
          onLocationSelect?.(locationData);

          // Update map if visible
          if (map) {
            map.setCenter(place.geometry.location);
            map.setZoom(15);

            if (marker) {
              marker.setPosition(place.geometry.location);
            } else {
              const newMarker = new google.maps.Marker({
                position: place.geometry.location,
                map,
                draggable: true,
                title: locationData.address,
              });
              setMarker(newMarker);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }, [autocomplete, map, marker, onChange, onLocationSelect]);

  // Initialize components when map becomes visible
  useEffect(() => {
    if (isMapVisible && showMap) {
      initializeMap();
    }
  }, [isMapVisible, showMap, initializeMap]);

  // Initialize autocomplete when component mounts
  useEffect(() => {
    initializeAutocomplete();
  }, [initializeAutocomplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim() && localSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  const clearLocation = () => {
    onChange('');
    setSelectedLocation(null);
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }
  };

  const handleInputFocus = () => {
    if (localSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Field */}
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
            className={`w-full px-4 py-3 pl-10 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${className}`}
            autoComplete="off"
          />
          
          {/* Action Buttons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            )}
            {value && (
              <button
                type="button"
                onClick={clearLocation}
                disabled={disabled}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Clear location"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            {showMap && (
              <button
                type="button"
                onClick={toggleMap}
                disabled={disabled}
                className={`p-1 rounded ${
                  isMapVisible 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={isMapVisible ? 'Hide map' : 'Show map'}
              >
                <Map className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Local Suggestions Dropdown */}
        {showSuggestions && localSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {localSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
              >
                <Search className="h-4 w-4 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
            {value.trim() && !localSuggestions.some(s => s.toLowerCase() === value.toLowerCase()) && (
              <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
                <span className="font-medium">Custom location:</span> "{value}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-emerald-800">{selectedLocation.address}</p>
              <p className="text-emerald-600 text-xs">
                Coordinates: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Map */}
      {isMapVisible && showMap && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Click on the map to select a location
              </span>
              <button
                type="button"
                onClick={toggleMap}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            ref={mapRef}
            style={{ height: mapHeight }}
            className="w-full"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapLocationInput;
