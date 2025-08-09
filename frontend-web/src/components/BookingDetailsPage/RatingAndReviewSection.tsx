import React from 'react';
import { Star } from 'lucide-react';
import { UserDashboardBooking } from '../../services/bookingService';

interface RatingAndReviewSectionProps {
  booking: UserDashboardBooking;
}

const RatingAndReviewSection: React.FC<RatingAndReviewSectionProps> = ({ booking }) => {
  if (booking.status !== 'completed') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Experience</h3>
      
      {booking.rating && booking.rating > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-3">Your Rating:</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < (booking.rating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {booking.rating}/5
              </span>
            </div>
          </div>
          
          {booking.review && (
            <div>
              <span className="text-sm font-medium text-gray-700">Your Review:</span>
              <p className="mt-2 text-gray-600 italic">"{booking.review}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Share your experience with this rental</p>
          <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
            Leave a Review
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingAndReviewSection;
