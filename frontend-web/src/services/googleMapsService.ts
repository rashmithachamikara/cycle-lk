import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG, type LocationCoordinates, type LocationData } from '../config/googleMaps';

class GoogleMapsService {
  private loader: Loader;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_CONFIG.apiKey,
      version: 'weekly',
      libraries: [...GOOGLE_MAPS_CONFIG.libraries],
    });
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loader.load().then(() => {
      this.loaded = true;
    });

    return this.loadPromise;
  }

  async createMap(container: HTMLElement, options?: Partial<google.maps.MapOptions>): Promise<google.maps.Map> {
    await this.load();
    
    const mapOptions = {
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

    const autocompleteOptions = {
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(GOOGLE_MAPS_CONFIG.sriLankaBounds.south, GOOGLE_MAPS_CONFIG.sriLankaBounds.west),
        new google.maps.LatLng(GOOGLE_MAPS_CONFIG.sriLankaBounds.north, GOOGLE_MAPS_CONFIG.sriLankaBounds.east)
      ),
      strictBounds: false,
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'lk' }, // Restrict to Sri Lanka
      ...options,
    };

    return new google.maps.places.Autocomplete(input, autocompleteOptions);
  }

  async geocodeAddress(address: string): Promise<LocationData | null> {
    await this.load();

    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ 
        address,
        componentRestrictions: { country: 'LK' }
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
    }

    return null;
  }

  async reverseGeocode(coordinates: LocationCoordinates): Promise<LocationData | null> {
    await this.load();

    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await geocoder.geocode({ 
        location: { lat: coordinates.lat, lng: coordinates.lng }
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
    }

    return null;
  }

  async searchNearbyPlaces(
    center: LocationCoordinates,
    radius: number = 5000,
    keyword?: string
  ): Promise<google.maps.places.PlaceResult[]> {
    await this.load();

    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(center.lat, center.lng),
        radius,
        keyword,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  calculateDistance(from: LocationCoordinates, to: LocationCoordinates): number {
    const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
    const toLatLng = new google.maps.LatLng(to.lat, to.lng);
    
    return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
  }

  isGoogleMapsLoaded(): boolean {
    return this.loaded;
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();
export default googleMapsService;
