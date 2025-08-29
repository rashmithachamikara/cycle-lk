

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Target, Loader2, AlertTriangle, X } from 'lucide-react';
import { googleMapsService } from '../../services/googleMapsService';
import { validateGoogleMapsApiKey, type LocationData } from '../../config/googleMaps';

// Interface for partner markers
export interface PartnerMarker {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
}

interface GoogleMapsPlacesProps {
  value?: string;
  onChange?: (value: string, locationData?: LocationData) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  showMap?: boolean;
  mapHeight?: string;
  initialCenter?: { lat: number; lng: number };
  zoom?: number;
  suggestions?: string[];
  partnerMarkers?: PartnerMarker[]; // New prop for partner locations
  showSearch?: boolean; // Control whether to show search input
  enableInteraction?: boolean; // Control whether the map allows interaction (dragging, clicking to select)
  showLocationMarker?: boolean; // Control whether to show the red location selection marker
}

const GoogleMapsPlaces: React.FC<GoogleMapsPlacesProps> = ({
  value = "",
  onChange,
  placeholder = "Search for a location",
  className = "",
  required = false,
  showMap = true,
  mapHeight = "300px",
  initialCenter = { lat: 6.9271, lng: 79.8612 }, // Colombo, Sri Lanka
  zoom = 12,
  suggestions = [],
  partnerMarkers = [],
  showSearch = true,
  enableInteraction = true,
  showLocationMarker = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const partnerMarkersRef = useRef<google.maps.Marker[]>([]);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value);

  // Check API key on mount
  useEffect(() => {
    if (!validateGoogleMapsApiKey()) {
      setError('Google Maps API key is missing or invalid. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
    }
  }, []);

  // Handle geocoding with error handling
  const handleGeocoding = useCallback(async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const locationData = await googleMapsService.reverseGeocode({ lat, lng });

      if (locationData) {
        setCurrentLocation(locationData);
        setInputValue(locationData.address); // update input field when map is used
        onChange?.(locationData.address, locationData);
      } else {
        const fallbackData: LocationData = {
          address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: { lat, lng },
          formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };
        setCurrentLocation(fallbackData);
        setInputValue(fallbackData.address); // update input field when map is used
        onChange?.(fallbackData.address, fallbackData);
        setError('Address lookup unavailable, but location coordinates saved');
      }
    } catch (error) {
      console.error('Geocoding error:', error);

      const fallbackData: LocationData = {
        address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng },
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
      setCurrentLocation(fallbackData);
      setInputValue(fallbackData.address); // update input field when map is used
      onChange?.(fallbackData.address, fallbackData);
      setError('Address lookup failed, but location coordinates saved');
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  const setupMarkerEvents = useCallback((markerInstance: google.maps.Marker, mapInstance: google.maps.Map) => {
    // Remove previous listeners to avoid duplicates
    google.maps.event.clearInstanceListeners(markerInstance);
    google.maps.event.clearInstanceListeners(mapInstance);

    // Handle marker drag
    markerInstance.addListener('dragend', async () => {
      const position = markerInstance.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        await handleGeocoding(lat, lng);
      }
    });

    // Handle map click
    mapInstance.addListener('click', async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      markerInstance.setPosition({ lat, lng });
      markerInstance.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => markerInstance.setAnimation(null), 1000);
      await handleGeocoding(lat, lng);
    });
  }, [handleGeocoding]);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !showMap || isMapInitialized) return;

    try {
      setIsLoading(true);
      setError(null);

      const mapInstance = await googleMapsService.createMap(mapRef.current, {
        center: initialCenter,
        zoom: zoom,
        mapTypeId: 'roadmap',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative', // Always allow map panning/zooming
        disableDoubleClickZoom: false,
      });

      let markerInstance: google.maps.Marker | null = null;

      // Only create the location marker if showLocationMarker is true
      if (showLocationMarker) {
        markerInstance = new google.maps.Marker({
          map: mapInstance,
          position: initialCenter,
          draggable: enableInteraction, // Only allow dragging if interaction is enabled
          title: enableInteraction ? 'Drag to adjust location' : 'Location marker',
          animation: google.maps.Animation.DROP,
        });

        if (enableInteraction) {
          setupMarkerEvents(markerInstance, mapInstance);
        }
      }

      setMap(mapInstance);
      setMarker(markerInstance);
      setIsMapInitialized(true);

      // Partner markers will be created by the separate useEffect
    } catch (error) {
      console.error('Map initialization error:', error);
      setError('Failed to initialize Google Maps');
    } finally {
      setIsLoading(false);
    }
  }, [showMap, initialCenter, zoom, isMapInitialized, setupMarkerEvents, enableInteraction, showLocationMarker]);

  // Initialize Autocomplete
  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || autocompleteRef.current) return;

    try {
      const autocompleteInstance = await googleMapsService.createAutocomplete(inputRef.current);

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();

        if (!place.geometry || !place.geometry.location) {
          setError('No location details available for this place');
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const locationData: LocationData = {
          address: place.formatted_address || place.name || '',
          coordinates: { lat, lng },
          placeId: place.place_id,
          formattedAddress: place.formatted_address,
          types: place.types,
          name: place.name,
        };

        setCurrentLocation(locationData);
        setInputValue(place.formatted_address || place.name || '');
        onChange?.(place.formatted_address || place.name || '', locationData);
        setError(null);

        // Update map pin and center map only if showLocationMarker is true
        if (map && marker && showLocationMarker) {
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(() => marker.setAnimation(null), 1000);
          map.setZoom(16);
          setupMarkerEvents(marker, map); // Ensure marker remains interactive
        } else if (map && !showLocationMarker) {
          // Just center the map without placing a marker
          map.setCenter({ lat, lng });
          map.setZoom(16);
        } else if (mapRef.current) {
          googleMapsService.createMap(mapRef.current, {
            center: { lat, lng },
            zoom: 16,
            mapTypeId: 'roadmap',
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'cooperative',
          }).then((mapInstance: google.maps.Map) => {
            const markerInstance = new google.maps.Marker({
              map: mapInstance,
              position: { lat, lng },
              draggable: true,
              title: 'Drag to adjust location',
              animation: google.maps.Animation.BOUNCE,
            });
            setupMarkerEvents(markerInstance, mapInstance);
            setMap(mapInstance);
            setMarker(markerInstance);
            setIsMapInitialized(true);
            setTimeout(() => markerInstance.setAnimation(null), 1000);
          });
        }
      });

      autocompleteRef.current = autocompleteInstance;
    } catch (error) {
      console.error('Autocomplete initialization error:', error);
    }
  }, [map, marker, onChange, setupMarkerEvents, showLocationMarker]);

  // Initialize components when Google Maps loads
  useEffect(() => {
    const initializeComponents = async () => {
      if (!validateGoogleMapsApiKey()) return;
      
      try {
        await googleMapsService.load();
        await initializeAutocomplete();
        if (showMap) {
          await initializeMap();
        }
      } catch (error) {
        console.error('Component initialization error:', error);
        setError('Failed to load Google Maps');
      }
    };

    initializeComponents();
  }, [showMap, initializeMap, initializeAutocomplete]);

  // Update partner markers when they change
  useEffect(() => {
    if (!map || partnerMarkers.length === 0) return;

    // Clear existing partner markers
    partnerMarkersRef.current.forEach(marker => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    
    partnerMarkers.forEach(partner => {
      const marker = new google.maps.Marker({
        map: map,
        position: partner.coordinates,
        title: partner.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#059669"/>
              <circle cx="15" cy="15" r="8" fill="white"/>
              <text x="15" y="20" text-anchor="middle" fill="#059669" font-size="12" font-weight="bold">P</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 40),
          anchor: new google.maps.Point(15, 40)
        }
      });

      // Create info window for partner
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #059669;">${partner.name}</h3>
            ${partner.address ? `<p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>Address:</strong> ${partner.address}</p>` : ''}
            <p style="margin: 4px 0; color: #666; font-size: 12px;">
              <strong>Coordinates:</strong> ${partner.coordinates.lat.toFixed(6)}, ${partner.coordinates.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        newMarkers.forEach(m => {
          const existingInfoWindow = (m as google.maps.Marker & { infoWindow?: google.maps.InfoWindow }).infoWindow;
          if (existingInfoWindow && existingInfoWindow !== infoWindow) existingInfoWindow.close();
        });
        infoWindow.open(map, marker);
      });

      // Store info window reference
      (marker as google.maps.Marker & { infoWindow?: google.maps.InfoWindow }).infoWindow = infoWindow;
      newMarkers.push(marker);
    });

    partnerMarkersRef.current = newMarkers;
  }, [map, partnerMarkers]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(16);
          
          // Only update marker if it exists and showLocationMarker is true
          if (marker && showLocationMarker) {
            marker.setPosition({ lat, lng });
            marker.setAnimation(google.maps.Animation.DROP);
          }
        }

        await handleGeocoding(lat, lng);
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [map, marker, handleGeocoding, showLocationMarker]);

  // Clear location
  const clearLocation = () => {
    onChange?.('');
    setInputValue('');
    setCurrentLocation(null);
    setError(null);
  };

  // Sync inputValue with external value only when it changes externally (not on every keystroke)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Show error if API key is invalid
  if (!validateGoogleMapsApiKey()) {
    return (
      <div className="border border-red-300 rounded-lg p-4 bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-700 text-sm font-medium">Google Maps API Key Missing</p>
        </div>
        <p className="text-red-600 text-sm mb-3">
          Please add <code className="bg-red-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to your environment variables.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input - Only show if showSearch is true */}
      {showSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange?.(e.target.value); // propagate to parent
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={required}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {value && enableInteraction && (
              <button
                type="button"
                onClick={clearLocation}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Clear location"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {enableInteraction && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoading || !googleMapsService.isGoogleMapsLoaded()}
                className="text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                title="Get current location"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 text-sm font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="relative border rounded-lg overflow-hidden bg-gray-100" style={{ height: mapHeight }}>
          {!isMapInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading Google Maps...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
          
          {currentLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md z-10">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentLocation.name || 'Selected Location'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {currentLocation.formattedAddress}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentLocation.coordinates.lat.toFixed(6)}, {currentLocation.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm text-gray-700 font-medium">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange?.(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsPlaces;