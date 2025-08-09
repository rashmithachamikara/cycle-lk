import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BikeImageGalleryProps {
  bikeImages: string[] | { url: string }[];
  bikeName: string;
}

const BikeImageGallery: React.FC<BikeImageGalleryProps> = ({ bikeImages, bikeName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!bikeImages || bikeImages.length === 0) {
    return null;
  }

  // Helper function to get image URL
  const getImageUrl = (image: string | { url: string }): string => {
    return typeof image === 'string' ? image : image.url;
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <img
          src={getImageUrl(bikeImages[currentImageIndex])}
          alt={`${bikeName} - Image ${currentImageIndex + 1}`}
          className="w-full h-64 md:h-80 object-cover rounded-lg"
        />
        
        {/* Navigation Arrows */}
        {bikeImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(
                currentImageIndex === 0 ? bikeImages.length - 1 : currentImageIndex - 1
              )}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(
                currentImageIndex === bikeImages.length - 1 ? 0 : currentImageIndex + 1
              )}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        
        {/* Image Counter */}
        {bikeImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {bikeImages.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default BikeImageGallery;
