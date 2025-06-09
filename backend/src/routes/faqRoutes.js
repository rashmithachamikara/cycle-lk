const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/faqs
 * @desc    Get all FAQs
 * @access  Public
 */
router.get('/', faqController.getAllFAQs);
/**
 * @route   GET /api/faqs/:id
 * @desc    Get FAQ by ID
 * @access  Public
 */
router.get('/:id', faqController.getFAQById);

/**
 * @route   POST /api/faqs
 * @desc    Create a new FAQ
 * @access  Private/Admin
 */
router.post('/', auth(['admin']), faqController.createFAQ);

/**
 * @route   PUT /api/faqs/:id
 * @desc    Update an FAQ
 * @access  Private/Admin
 */
router.put('/:id', auth(['admin']), faqController.updateFAQ);

/**
 * @route   PUT /api/faqs/:id/order
 * @desc    Update an FAQ's order
 * @access  Private/Admin
 */
router.put('/:id/order', auth(['admin']), faqController.updateFAQOrder);

/**
 * @route   DELETE /api/faqs/:id
 * @desc    Delete an FAQ
 * @access  Private/Admin
 */
router.delete('/:id', auth(['admin']), faqController.deleteFAQ);

/**
 * @route   GET /api/faqs/categories/list
 * @desc    Get all FAQ categories
 * @access  Public
 */
router.get('/categories/list', faqController.getFAQCategories);

module.exports = router;
