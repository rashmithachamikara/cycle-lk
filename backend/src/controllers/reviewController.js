const { Review, Bike, User, Booking } = require('../models');

/**
 * Get all reviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { bikeId, userId, rating, sort } = req.query;
    
    // Build filter object
    const filter = {};
    if (bikeId) filter.bikeId = bikeId;
    if (userId) filter.userId = userId;
    if (rating) filter.rating = Number(rating);
    
    // Build sort options
    let sortOptions = {};
    if (sort === 'latest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'rating-high') {
      sortOptions = { rating: -1 };
    } else if (sort === 'rating-low') {
      sortOptions = { rating: 1 };
    } else {
      sortOptions = { createdAt: -1 }; // Default sort
    }
    
    const reviews = await Review.find(filter)
      .populate('userId', 'firstName lastName profileImage')
      .populate('bikeId', 'name type images')
      .sort(sortOptions);
    
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get review by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'firstName lastName profileImage')
      .populate('bikeId', 'name type images');
      
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createReview = async (req, res) => {
  try {
    const { bikeId, bookingId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate user, bike and booking
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    // If booking ID is provided, check if it exists and is completed
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      if (booking.status !== 'completed') {
        return res.status(400).json({ message: 'You can only review a completed booking' });
      }
      
      if (booking.userId.toString() !== userId) {
        return res.status(403).json({ message: 'You can only review your own bookings' });
      }
      
      if (booking.bikeId.toString() !== bikeId) {
        return res.status(400).json({ message: 'The booking is not for this bike' });
      }
      
      // Check if user has already reviewed this booking
      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this booking' });
      }
    }
    
    const review = new Review({
      userId,
      bikeId,
      bookingId,
      rating,
      comment,
      createdAt: new Date()
    });
    
    await review.save();
    
    // Update bike rating
    await updateBikeRating(bikeId);
    
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.updatedAt = new Date();
    
    await review.save();
    
    // Update bike rating
    await updateBikeRating(review.bikeId);
    
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review or an admin
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }
    
    const bikeId = review.bikeId;
    
    await review.remove();
    
    // Update bike rating
    await updateBikeRating(bikeId);
    
    res.json({ message: 'Review removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Helper function to update bike rating
 * @param {ObjectId} bikeId - ID of the bike to update
 */
async function updateBikeRating(bikeId) {
  try {
    // Get all reviews for the bike
    const reviews = await Review.find({ bikeId });
    
    if (reviews.length === 0) {
      // If no reviews, set rating to 0
      await Bike.findByIdAndUpdate(bikeId, { rating: 0, reviewCount: 0 });
      return;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    // Update bike with new rating and review count
    await Bike.findByIdAndUpdate(bikeId, { 
      rating: averageRating, 
      reviewCount: reviews.length 
    });
  } catch (err) {
    console.error('Error updating bike rating:', err);
  }
}
