import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Target, Loader2 } from 'lucide-react';

// Define types for Google Maps
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export interface LocationData {
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  formattedAddress?: string;
  types?: string[];
  name?: string;
}

interface GoogleMapsPlacesInputProps {
  value: string;
  onChange: (value: string, locationData?: LocationData) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showMap?: boolean;
  mapHeight?: string;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  suggestions?: string[];
}

const GoogleMapsPlacesInput: React.FC<GoogleMapsPlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Search for a location",
  className = "",
  required = false,
  showMap = true,
  mapHeight = "300px",
  initialCenter = { lat: 6.9271, lng: 79.8612 }, // Colombo, Sri Lanka
  zoom = 12,
  suggestions = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google) {
        setIsMapLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        return;
      }

      setIsLoading(true);

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Set up callback
      window.initMap = () => {
        setIsMapLoaded(true);
        setIsLoading(false);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps');
        setIsLoading(false);
      };

      document.head.appendChild(script);

      return () => {
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        if (window.initMap) {
          window.initMap = undefined as unknown as () => void;
        }
      };
    };

    loadGoogleMaps();
  }, []);

  // Initialize Map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !isMapLoaded) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: zoom,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
      restriction: {
        // Restrict to Sri Lanka bounds
        latLngBounds: {
          north: 9.8315,
          south: 5.9188,
          west: 79.6951,
          east: 81.8812,
        },
      },
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "on" }]
        }
      ]
    });

    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      position: initialCenter,
      draggable: true,
      title: 'Drag to adjust location',
      animation: window.google.maps.Animation.DROP,
    });

    // Handle marker drag
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        
        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results && results[0]) {
            const locationData: LocationData = {
              coordinates: { lat, lng },
              placeId: results[0].place_id,
              formattedAddress: results[0].formatted_address,
              types: results[0].types,
              name: results[0].address_components?.[0]?.long_name || results[0].formatted_address,
            };
            setCurrentLocation(locationData);
            onChange(results[0].formatted_address, locationData);
          }
        });
      }
    });

    // Handle map click
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      markerInstance.setPosition({ lat, lng });
      markerInstance.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => markerInstance.setAnimation(null), 1000);
      
      // Reverse geocode
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          const locationData: LocationData = {
            coordinates: { lat, lng },
            placeId: results[0].place_id,
            formattedAddress: results[0].formatted_address,
            types: results[0].types,
            name: results[0].address_components?.[0]?.long_name || results[0].formatted_address,
          };
          setCurrentLocation(locationData);
          onChange(results[0].formatted_address, locationData);
        }
      });
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [initialCenter, zoom, isMapLoaded, onChange]);

  // Initialize Autocomplete
  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google || !isMapLoaded) return;

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: 'LK' }, // Restrict to Sri Lanka
        fields: ['place_id', 'formatted_address', 'geometry', 'name', 'types', 'address_components'],
        types: ['establishment', 'geocode'],
        strictBounds: false,
      }
    );

    // Set bias to Sri Lanka
    const sriLankaBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(5.9188, 79.6951),
      new window.google.maps.LatLng(9.8315, 81.8812)
    );
    autocompleteInstance.setBounds(sriLankaBounds);

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.warn('No location details available for this place');
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      const locationData: LocationData = {
        coordinates: { lat, lng },
        placeId: place.place_id,
        formattedAddress: place.formatted_address,
        types: place.types,
        name: place.name,
      };

      setCurrentLocation(locationData);
      onChange(place.formatted_address || place.name || '', locationData);

      // Update map and marker if available
      if (map && marker) {
        map.setCenter({ lat, lng });
        marker.setPosition({ lat, lng });
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 1000);
        map.setZoom(16); // Zoom in when place is selected
      }
    });

    autocompleteRef.current = autocompleteInstance;
  }, [isMapLoaded, map, marker, onChange]);

  // Initialize components when Google Maps is loaded
  useEffect(() => {
    if (isMapLoaded) {
      if (showMap) {
        initializeMap();
      }
      initializeAutocomplete();
    }
  }, [isMapLoaded, showMap, initializeMap, initializeAutocomplete]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (map && marker) {
            map.setCenter({ lat, lng });
            marker.setPosition({ lat, lng });
            marker.setAnimation(window.google.maps.Animation.DROP);
            map.setZoom(16);
          }

          // Reverse geocode current location
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
              if (status === 'OK' && results && results[0]) {
                const locationData: LocationData = {
                  coordinates: { lat, lng },
                  placeId: results[0].place_id,
                  formattedAddress: results[0].formatted_address,
                  types: results[0].types,
                  name: results[0].address_components?.[0]?.long_name || results[0].formatted_address,
                };
                setCurrentLocation(locationData);
                onChange(results[0].formatted_address, locationData);
              }
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setIsLoading(false);
        }
      );
    }
  };

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <p className="text-red-700 text-sm font-medium mb-2">⚠️ Google Maps API Key Missing</p>
        <p className="text-red-600 text-sm mb-3">
          Please add <code className="bg-red-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to your environment variables.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Input with Google Places Autocomplete */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          required={required}
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Use current location"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                if (autocompleteRef.current) {
                  if (inputRef.current) {
                    inputRef.current.value = suggestion;
                  }
                  onChange(suggestion);
                }
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              📍 {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Google Map */}
      {showMap && (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Click on map to select location
            </span>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
          </div>
          <div 
            ref={mapRef} 
            style={{ height: mapHeight, width: '100%' }}
            className="bg-gray-100 relative"
          >
            {!isMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm">Loading Google Maps...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Info Card */}
      {currentLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-green-800 mb-1">📍 Selected Location</h4>
              {currentLocation.name && (
                <p className="text-sm font-semibold text-green-700 mb-1">{currentLocation.name}</p>
              )}
              <p className="text-sm text-green-700 mb-2">{currentLocation.formattedAddress}</p>
              <div className="flex items-center space-x-4 text-xs text-green-600">
                <span>
                  📊 Lat: {currentLocation.coordinates.lat.toFixed(6)}
                </span>
                <span>
                  📊 Lng: {currentLocation.coordinates.lng.toFixed(6)}
                </span>
                {currentLocation.placeId && (
                  <span className="truncate">
                    🆔 {currentLocation.placeId.substring(0, 20)}...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <div className="flex flex-wrap gap-4">
          <span>💡 Type to search places</span>
          <span>🖱️ Click map to select</span>
          <span>↗️ Drag marker to adjust</span>
          <span>📍 Use location button for GPS</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsPlacesInput;
