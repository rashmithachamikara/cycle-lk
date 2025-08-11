import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Target, Loader2, AlertTriangle } from 'lucide-react';

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

// Rate limiting and error handling utilities
class GeocodingManager {
  private static instance: GeocodingManager;
  private requestQueue: Array<{ 
    request: google.maps.GeocoderRequest; 
    callback: (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => void; 
    timestamp: number 
  }> = [];
  private isProcessing = false;
  private failedRequests = new Map<string, number>();
  private readonly maxRetries = 3;
  private readonly rateLimitDelay = 100; // 100ms between requests
  private readonly maxFailures = 5; // Max failures before circuit breaker
  private readonly circuitBreakerTimeout = 60000; // 1 minute
  private circuitBreakerTripped = false;
  private lastResetTime = Date.now();

  static getInstance(): GeocodingManager {
    if (!GeocodingManager.instance) {
      GeocodingManager.instance = new GeocodingManager();
    }
    return GeocodingManager.instance;
  }

  private generateRequestKey(request: google.maps.GeocoderRequest): string {
    return JSON.stringify(request);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isCircuitBreakerTripped(): boolean {
    const now = Date.now();
    if (this.circuitBreakerTripped && (now - this.lastResetTime) > this.circuitBreakerTimeout) {
      this.circuitBreakerTripped = false;
      this.failedRequests.clear();
      this.lastResetTime = now;
    }
    return this.circuitBreakerTripped;
  }

  private handleError(requestKey: string, status: string): boolean {
    const failures = (this.failedRequests.get(requestKey) || 0) + 1;
    this.failedRequests.set(requestKey, failures);

    if (failures >= this.maxRetries) {
      console.warn(`Geocoding request failed ${failures} times:`, status);
      
      // Check if we should trip the circuit breaker
      const totalFailures = Array.from(this.failedRequests.values()).reduce((sum, val) => sum + val, 0);
      if (totalFailures >= this.maxFailures) {
        this.circuitBreakerTripped = true;
        this.lastResetTime = Date.now();
        console.error('Geocoding circuit breaker tripped due to excessive failures');
      }
      return false;
    }
    return true;
  }

  async geocode(
    geocoder: google.maps.Geocoder,
    request: google.maps.GeocoderRequest,
    callback: (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => void,
    timeout = 5000
  ): Promise<void> {
    const requestKey = this.generateRequestKey(request);

    // Check circuit breaker
    if (this.isCircuitBreakerTripped()) {
      console.warn('Geocoding requests blocked by circuit breaker');
      callback(null, 'CIRCUIT_BREAKER_OPEN');
      return;
    }

    // Add to queue
    return new Promise((resolve) => {
      this.requestQueue.push({
        request,
        callback: (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => {
          if (status !== 'OK') {
            const shouldRetry = this.handleError(requestKey, status as string);
            if (shouldRetry) {
              // Retry after delay
              setTimeout(() => {
                this.geocode(geocoder, request, callback, timeout);
              }, 1000);
              resolve();
              return;
            }
          } else {
            // Success - clear failures for this request
            this.failedRequests.delete(requestKey);
          }
          
          callback(results, status);
          resolve();
        },
        timestamp: Date.now()
      });

      this.processQueue(geocoder, timeout);
    });
  }

  private async processQueue(geocoder: google.maps.Geocoder, timeout: number): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { request, callback, timestamp } = this.requestQueue.shift()!;

      // Check if request is too old (prevent memory buildup)
      if (Date.now() - timestamp > 30000) { // 30 seconds timeout
        callback(null, 'TIMEOUT');
        continue;
      }

      try {
        // Wrap geocoder call with timeout
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Geocoding timeout')), timeout);
        });

        const geocodePromise = new Promise<void>((resolve) => {
          geocoder.geocode(request, (results, status) => {
            callback(results, status);
            resolve();
          });
        });

        await Promise.race([geocodePromise, timeoutPromise]);
      } catch (error) {
        console.error('Geocoding error:', error);
        callback(null, 'ERROR');
      }

      // Rate limiting delay
      await this.delay(this.rateLimitDelay);
    }

    this.isProcessing = false;
  }

  getStatus(): { 
    queueLength: number; 
    circuitBreakerTripped: boolean; 
    totalFailures: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.requestQueue.length,
      circuitBreakerTripped: this.circuitBreakerTripped,
      totalFailures: Array.from(this.failedRequests.values()).reduce((sum, val) => sum + val, 0),
      isProcessing: this.isProcessing
    };
  }
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
  const [error, setError] = useState<string | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<{
    queueLength: number;
    circuitBreakerTripped: boolean;
    totalFailures: number;
  }>({ queueLength: 0, circuitBreakerTripped: false, totalFailures: 0 });

  // Get geocoding manager instance (stable reference)
  const geocodingManager = useRef(GeocodingManager.getInstance()).current;

  // Debug logging for development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('GoogleMapsPlacesInput render:', {
        isMapLoaded,
        isLoading,
        error,
        value,
        hasMap: !!map,
        hasMarker: !!marker
      });
    }
  });

  // Helper function to handle geocoding errors
  const handleGeocodingError = (status: google.maps.GeocoderStatus | string) => {
    let errorMessage = 'Failed to get location details';
    switch (status) {
      case 'ZERO_RESULTS':
        errorMessage = 'No results found for this location';
        break;
      case 'OVER_QUERY_LIMIT':
        errorMessage = 'Too many requests. Please try again later.';
        break;
      case 'REQUEST_DENIED':
        errorMessage = 'Location service access denied';
        break;
      case 'INVALID_REQUEST':
        errorMessage = 'Invalid location request';
        break;
      case 'TIMEOUT':
        errorMessage = 'Request timed out. Please try again.';
        break;
      case 'CIRCUIT_BREAKER_OPEN':
        errorMessage = 'Service temporarily unavailable due to errors';
        break;
      default:
        errorMessage = `Geocoding failed: ${status}`;
    }
    setError(errorMessage);
    console.warn('Geocoding failed:', status);
  };

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
        setError('Google Maps API key not configured');
        return;
      }

      setIsLoading(true);

      try {
        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;

        // Set up callback
        window.initMap = () => {
          setIsMapLoaded(true);
          setIsLoading(false);
          setError(null);
        };

        script.onerror = () => {
          console.error('Failed to load Google Maps');
          setIsLoading(false);
          setError('Failed to load Google Maps. Please check your API key and internet connection.');
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
        setError('Failed to initialize Google Maps');
      }

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
    });

    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      position: initialCenter,
      draggable: true,
      title: 'Drag to adjust location',
      animation: window.google.maps.Animation.DROP,
    });

    // Handle marker drag with error handling
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        
        const geocoder = new window.google.maps.Geocoder();
        geocodingManager.geocode(
          geocoder,
          { location: { lat, lng } },
          (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => {
            setGeocodingStatus(geocodingManager.getStatus());
            
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
              setError(null);
            } else {
              handleGeocodingError(status);
            }
          }
        );
      }
    });

    // Handle map click with error handling
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      markerInstance.setPosition({ lat, lng });
      markerInstance.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => markerInstance.setAnimation(null), 1000);
      
      const geocoder = new window.google.maps.Geocoder();
      geocodingManager.geocode(
        geocoder,
        { location: { lat, lng } },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => {
          setGeocodingStatus(geocodingManager.getStatus());
          
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
            setError(null);
          } else {
            handleGeocodingError(status);
          }
        }
      );
    });

    setMap(mapInstance);
    setMarker(markerInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setError('No location details available for this place');
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
      setError(null);

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

  // Get current location with error handling
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);
    
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

        // Reverse geocode current location with error handling
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocodingManager.geocode(
            geocoder,
            { location: { lat, lng } },
            (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => {
              setGeocodingStatus(geocodingManager.getStatus());
              
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
                setError(null);
              } else {
                handleGeocodingError(status);
              }
              setIsLoading(false);
            }
          );
        } else {
          setIsLoading(false);
        }
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
          default:
            errorMessage = 'Unknown location error';
            break;
        }
        setError(errorMessage);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Fallback UI if API key is missing
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
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
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading || !isMapLoaded}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Get current location"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Target className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 text-sm font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
            {geocodingStatus.circuitBreakerTripped && (
              <p className="text-red-500 text-xs mt-1">
                Service temporarily disabled due to repeated errors. Please try again later.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status Display (Development) */}
      {import.meta.env.DEV && (geocodingStatus.queueLength > 0 || geocodingStatus.totalFailures > 0) && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          Queue: {geocodingStatus.queueLength} | Failures: {geocodingStatus.totalFailures} | 
          Circuit Breaker: {geocodingStatus.circuitBreakerTripped ? 'OPEN' : 'CLOSED'}
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="relative border rounded-lg overflow-hidden bg-gray-100" style={{ height: mapHeight }}>
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading Google Maps...</p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
          
          {currentLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentLocation.name}
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
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = suggestion;
                  }
                  onChange(suggestion);
                }}
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

export default GoogleMapsPlacesInput;
