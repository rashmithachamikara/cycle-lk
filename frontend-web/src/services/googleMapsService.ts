// frontend-web/services/googleMapsService.ts
import { GOOGLE_MAPS_CONFIG, type LocationCoordinates, type LocationData, validateGoogleMapsApiKey } from '../config/googleMaps';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

class GoogleMapsService {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private loadAttempts = 0;
  private readonly maxLoadAttempts = 3;

  constructor() {
    // Bind the global callback
    window.initGoogleMaps = this.onGoogleMapsLoad.bind(this);
  }

  private onGoogleMapsLoad(): void {
    this.isLoaded = true;
    console.log('Google Maps API loaded successfully');
  }

  async load(): Promise<void> {
    // Check if already loaded
    if (this.isLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    // Return existing promise if loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Validate API key
    if (!validateGoogleMapsApiKey()) {
      throw new Error('Invalid or missing Google Maps API key. Please check your VITE_GOOGLE_MAPS_API_KEY environment variable.');
    }

    this.loadPromise = this.loadGoogleMapsScript();
    return this.loadPromise;
  }

  private async loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google?.maps) {
          this.isLoaded = true;
          resolve();
          return;
        }
        // Remove existing script if it failed to load
        existingScript.remove();
      }

      this.loadAttempts++;
      if (this.loadAttempts > this.maxLoadAttempts) {
        reject(new Error('Failed to load Google Maps after multiple attempts'));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      const timeoutId = setTimeout(() => {
        reject(new Error('Google Maps loading timeout'));
      }, 10000); // 10 second timeout

      script.onload = () => {
        clearTimeout(timeoutId);
        // Wait a bit for Google Maps to fully initialize
        setTimeout(() => {
          if (window.google?.maps) {
            this.isLoaded = true;
            resolve();
          } else {
            reject(new Error('Google Maps failed to initialize'));
          }
        }, 100);
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });
  }

  async createMap(container: HTMLElement, options?: Partial<google.maps.MapOptions>): Promise<google.maps.Map> {
    await this.load();
    
    const mapOptions: google.maps.MapOptions = {
      ...GOOGLE_MAPS_CONFIG.defaultMapOptions,
      ...options,
    };

    return new google.maps.Map(container, mapOptions);
  }

  async createAutocomplete(
    input: HTMLInputElement, 
    options?: Partial<google.maps.places.AutocompleteOptions>
  ): Promise<google.maps.places.Autocomplete> {
    await this.load();

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(GOOGLE_MAPS_CONFIG.sriLankaBounds.south, GOOGLE_MAPS_CONFIG.sriLankaBounds.west),
      new google.maps.LatLng(GOOGLE_MAPS_CONFIG.sriLankaBounds.north, GOOGLE_MAPS_CONFIG.sriLankaBounds.east)
    );

    const autocompleteOptions: google.maps.places.AutocompleteOptions = {
      bounds,
      strictBounds: false,
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'lk' },
      fields: ['place_id', 'formatted_address', 'geometry', 'name', 'types'],
      ...options,
    };

    return new google.maps.places.Autocomplete(input, autocompleteOptions);
  }

  async geocodeAddress(address: string): Promise<LocationData | null> {
    await this.load();

    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode({ 
          address,
          componentRestrictions: { country: 'LK' }
        }, (results, status) => {
          if (status === 'OK' && results) {
            resolve({ results });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (response.results.length > 0) {
        const result = response.results[0];
        return {
          address: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            address: result.formatted_address,
            placeId: result.place_id,
          },
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // If geocoding fails, but we still have a valid address string, return basic data
      if (address && address.trim()) {
        return {
          address: address.trim(),
          coordinates: {
            lat: 6.9271, // Default to Colombo
            lng: 79.8612,
            address: address.trim(),
          },
          formattedAddress: address.trim(),
        };
      }
    }

    return null;
  }

  async reverseGeocode(coordinates: LocationCoordinates): Promise<LocationData | null> {
    await this.load();

    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
        geocoder.geocode({ 
          location: { lat: coordinates.lat, lng: coordinates.lng }
        }, (results, status) => {
          if (status === 'OK' && results) {
            resolve({ results });
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });

      if (response.results.length > 0) {
        const result = response.results[0];
        return {
          address: result.formatted_address,
          coordinates: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            address: result.formatted_address,
            placeId: result.place_id,
          },
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // If geocoding fails, return basic location data with coordinates
      return {
        address: `Location: ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        formattedAddress: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
      };
    }

    return null;
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  getLoadStatus(): { isLoaded: boolean; attempts: number } {
    return {
      isLoaded: this.isLoaded,
      attempts: this.loadAttempts,
    };
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
export default googleMapsService;