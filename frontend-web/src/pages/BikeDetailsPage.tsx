//frontend-web/pages/BikeDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { bikeService, Bike } from '../services/bikeService';
import {
  ImageGallery,
  BikeHeader,
  PricingCard,
  PartnerInfo,
  FeaturesSection,
  SpecificationsSection,
  ReviewsSection,
  LoadingState,
  ErrorState,
  Breadcrumb,
  BackButton
} from '../components/BikeDetailsPage';

const BikeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bike data
  useEffect(() => {
    const fetchBike = async () => {
      if (!id) {
        navigate('/locations');
        return;
      }

      try {
        setLoading(true);
        const bikeData = await bikeService.getBikeById(id);
        setBike(bikeData);
      } catch (err) {
        setError('Failed to load bike details. Please try again later.');
        console.error('Error fetching bike:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [id, navigate]);

  // Helper function to format price in LKR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Helper function to format business hours
  const formatBusinessHours = (businessHours: string | { [key: string]: string } | undefined) => {
    if (!businessHours) return 'Contact for hours';
    
    if (typeof businessHours === 'string') {
      return businessHours;
    }
    
    // If it's an object, format it nicely
    if (typeof businessHours === 'object') {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const workingDays = days.filter(day => businessHours[day] && businessHours[day] !== 'Closed');
      
      if (workingDays.length === 0) return 'Closed';
      if (workingDays.length === 7) return 'Open daily';
      if (workingDays.length === 5 && workingDays.includes('monday') && workingDays.includes('friday')) {
        return 'Mon-Fri';
      }
      
      return `${workingDays.length} days/week`;
    }
    
    return 'Contact for hours';
  };

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error || !bike) {
    return <ErrorState error={error || undefined} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Locations', href: '/locations' },
            { label: bike.name, active: true }
          ]} 
        />

        {/* Back Button */}
        <BackButton to="/locations" text="Back to Bikes" />

        <div className="grid lg:grid-cols-2 gap-12">


          {/* Image Gallery */}
          <ImageGallery images={bike.images} bikeName={bike.name} />


          {/* Bike Details */}
          <div className="space-y-6">
            <BikeHeader bike={bike} />
            <PricingCard bike={bike} formatPrice={formatPrice} />
            <PartnerInfo bike={bike} formatBusinessHours={formatBusinessHours} />
          </div>
        </div>

        {/* Features & Specifications */}
        <div className="grid lg:grid-cols-2 gap-12 mt-12">
          <FeaturesSection features={bike.features} />
          <SpecificationsSection specifications={bike.specifications} />
        </div>

        {/* Reviews */}
        <ReviewsSection reviews={bike.reviews} rating={bike.rating} />
      </div>

      <Footer />
    </div>
  );
};

export default BikeDetailsPage;