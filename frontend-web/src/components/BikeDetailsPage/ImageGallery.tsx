import { useState } from 'react';
import { Bike as BikeIcon } from 'lucide-react';

interface ImageGalleryProps {
  images?: string[];
  bikeName: string;
}

const ImageGallery = ({ images, bikeName }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-2xl overflow-hidden">
        <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative">
          {images && images.length > 0 ? (
            <img
              src={images[selectedImage]}
              alt={bikeName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to bike icon if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.removeAttribute('style');
              }}
            />
          ) : (
            <BikeIcon className="h-32 w-32 text-gray-400" />
          )}
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-sm text-gray-700">
            {images && images.length > 0 ? `Image ${selectedImage + 1} of ${images.length}` : bikeName}
          </div>
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden border-2 ${
                selectedImage === index ? 'border-emerald-500' : 'border-transparent'
              }`}
            >
              <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <img
                  src={image}
                  alt={`${bikeName} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                  }}
                />
                <BikeIcon className="h-8 w-8 text-gray-400" style={{ display: 'none' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
