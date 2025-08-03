import { Star } from 'lucide-react';
import { BikeReview } from '../../services/bikeService';

interface ReviewsSectionProps {
  reviews?: BikeReview[];
  rating?: number;
}

const ReviewsSection = ({ reviews, rating }: ReviewsSectionProps) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-8 mt-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Reviews ({reviews.length})</h3>
        {rating && (
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="text-lg font-semibold text-gray-900 ml-2">{rating}</span>
            <span className="text-gray-600 ml-2">out of 5</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {reviews.slice(0, 3).map((review, index) => (
          <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">User {review.userId.substring(0, 8)}</div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.helpful && (
                <button className="text-sm text-gray-600 hover:text-emerald-600">
                  Helpful ({review.helpful})
                </button>
              )}
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="text-center mt-8">
          <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-emerald-500 transition-colors font-medium">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
