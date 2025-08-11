// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  // Replace with your actual Google Maps API key
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // Default map options
  defaultMapOptions: {
    zoom: 13,
    center: { lat: 6.9271, lng: 79.8612 }, // Colombo, Sri Lanka
    mapTypeId: 'roadmap' as google.maps.MapTypeId,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
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
}
