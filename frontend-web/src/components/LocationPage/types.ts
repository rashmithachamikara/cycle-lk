import { Bike } from '../LocationsPage/types';
import { Location } from '../../services/locationService';

export type { Bike, Location };

export interface Partner {
  id: string;
  name: string;
  description?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  rating?: number;
  reviewCount?: number;
  image?: string;
  verified?: boolean;
}
