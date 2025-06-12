const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews with optional filtering
 * @access  Public
 */
router.get('/', reviewController.getAllReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get('/:id', reviewController.getReviewById);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', auth(), validateReview, reviewController.createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private
 */
router.put('/:id', auth(), reviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:id', auth(), reviewController.deleteReview);

module.exports = router;
