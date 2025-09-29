//frontend-web/pages/PartnersPage.tsx
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  HeroSection,
  StatsSection,
  CategoryFilter,
  PartnersGrid,
  PartnerBenefits
} from '../components/PartnersPage';

import { Partner, partnerService } from '../services/partnerService';
import { Loader, ErrorDisplay } from '../ui';

const PartnersPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPartners = await partnerService.getAllPartners();
      console.log('Fetched partners:', allPartners); // Debug log
      setPartners(allPartners);
      
      // Generate categories from fetched data
      const categoryMap = new Map<string, number>();
      categoryMap.set('all', allPartners.length);
      
      allPartners.forEach(partner => {
        if (partner.category) {
          categoryMap.set(partner.category, (categoryMap.get(partner.category) || 0) + 1);
        }
      });
      
      const categoryList = Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: id === 'all' ? 'All Partners' : id,
        count
      }));
      
      setCategories(categoryList);
    } catch (err: unknown) {
      console.error('Error fetching partners:', err);
      let errorMessage = 'Failed to load partners. Please try again later.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = selectedCategory === 'all' 
    ? partners 
    : partners.filter(partner => partner.category === selectedCategory);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Hero Section */}
      <HeroSection />
        <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loader message="Loading partners..." size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-20">
          <ErrorDisplay 
            error={error} 
            onRetry={fetchPartners}
            fullPage={true}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <StatsSection partners={partners} />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Partners Grid */}
        <PartnersGrid partners={filteredPartners} />

        {/* Partner Benefits */}
        <PartnerBenefits />
      </div>

      <Footer />
    </div>
  );
};

export default PartnersPage;