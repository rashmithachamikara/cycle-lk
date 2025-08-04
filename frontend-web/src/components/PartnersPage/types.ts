import { Partner } from '../../services/partnerService';

// Props interfaces for PartnersPage components
export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export interface StatsSectionProps {
  partners: Partner[];
}

export interface CategoryFilterProps {
  categories: { id: string; name: string; count: number }[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export interface PartnerCardProps {
  partner: Partner;
}

export interface PartnersGridProps {
  partners: Partner[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export interface PartnerBenefitsProps {
  className?: string;
}

// Category color mapping
export const getCategoryStyle = (category: string): string => {
  const styles: Record<string, string> = {
    'Premium': 'bg-yellow-500 text-white',
    'Adventure': 'bg-orange-500 text-white',
    'Beach': 'bg-blue-500 text-white',
    'Eco': 'bg-green-500 text-white',
    'Heritage': 'bg-purple-500 text-white',
  };
  return styles[category] || 'bg-gray-500 text-white';
};
