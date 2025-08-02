// Bike interface for type safety
export interface Bike {
  id: string;
  name: string;
  type: string;
  location: string;
  pricing: {
    perDay: number;
    perHour?: number;
    perWeek?: number;
  };
  rating?: number;
  reviews?: Array<unknown>;
  images?: string[];
  available: boolean;
  features?: string[];
  partner?: {
    name: string;
    id?: string;
  };
  brand?: string;
  description?: string;
  condition?: string;
  specifications?: Record<string, unknown>;
}
