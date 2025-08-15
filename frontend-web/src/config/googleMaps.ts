// frontend-web/config/googleMaps.ts

// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Google Maps API key from environment
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
  // Default map options
  defaultMapOptions: {
    zoom: 13,
    center: { lat: 6.9271, lng: 79.8612 }, // Colombo, Sri Lanka
    mapTypeId: 'roadmap' as google.maps.MapTypeId,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: 'cooperative',
  },

  // Sri Lanka bounds for search bias
  sriLankaBounds: {
    north: 9.8315,
    south: 5.9188,
    east: 81.8812,
    west: 79.6951,
  },

  // Default location for Sri Lanka
  defaultLocation: {
    lat: 6.9271,
    lng: 79.8612,
    name: 'Colombo, Sri Lanka'
  },

  // Map libraries to load
  libraries: ['places', 'geometry'] as const,
};

// Location interface for coordinates
export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

// Extended location data
export interface LocationData {
  address: string;
  coordinates: LocationCoordinates;
  placeId?: string;
  formattedAddress?: string;
  name?: string;
  types?: string[];
}

// Service location interfaces
export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  isMainLocation?: boolean;
}

export interface CityServiceData {
  cityName: string;
  locations: ServiceLocation[];
}

// Validate API key
export const validateGoogleMapsApiKey = (): boolean => {
  const apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  return !!(apiKey && apiKey.length > 10 && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY');
};