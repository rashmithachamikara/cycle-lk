const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware for chatbot endpoints
const chatRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.CHATBOT_RATE_LIMIT) || 100, // Requests per hour
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to the chatbot
 * @access  Public
 * @body    { message: string, sessionId?: string }
 */
router.post('/message', chatRateLimit, chatbotController.sendMessage);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Public
 * @params  sessionId
 * @query   limit (optional, default 20, max 50)
 */
router.get('/history/:sessionId', chatbotController.getChatHistory);

/**
 * @route   POST /api/chat/feedback/:sessionId/:messageId
 * @desc    Update message feedback (rating, helpful, comment)
 * @access  Public
 * @params  sessionId, messageId
 * @body    { rating?: number (1-5), helpful?: boolean, comment?: string }
 */
router.post('/feedback/:sessionId/:messageId', chatbotController.updateMessageFeedback);

/**
 * @route   GET /api/chat/suggestions
 * @desc    Get suggested questions/quick responses
 * @access  Public
 * @query   category (optional: general, booking, bikes, locations, support)
 * @query   limit (optional, default 5, max 10)
 */
router.get('/suggestions', chatbotController.getSuggestions);

/**
 * @route   DELETE /api/chat/history/:sessionId
 * @desc    Clear chat history for a session
 * @access  Public
 * @params  sessionId
 */
router.delete('/history/:sessionId', chatbotController.clearChatHistory);

/**
 * @route   GET /api/chat/status
 * @desc    Get chatbot status and configuration
 * @access  Public
 */
router.get('/status', chatbotController.getChatbotStatus);

// Health check endpoint for chatbot service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chatbot service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint to get chatbot capabilities
router.get('/capabilities', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      intents: [
        {
          name: 'find_bikes',
          description: 'Search and filter available bikes',
          examples: ['Find bikes in Colombo', 'Show me mountain bikes', 'Electric bikes under $20']
        },
        {
          name: 'check_availability',
          description: 'Check bike availability for specific dates',
          examples: ['Is bike available tomorrow?', 'Check availability for weekend', 'Available bikes for next week']
        },
        {
          name: 'get_bike_details',
          description: 'Get detailed information about a specific bike',
          examples: ['Tell me about this bike', 'Bike specifications', 'More details about bike ID 123']
        },
        {
          name: 'find_locations',
          description: 'Search for rental locations and destinations',
          examples: ['Popular locations', 'Bikes in Kandy', 'Tourist destinations']
        },
        {
          name: 'booking_status',
          description: 'Check booking status and details',
          examples: ['My booking status', 'Check reservation', 'Booking details']
        },
        {
          name: 'pricing_info',
          description: 'Get pricing information and compare rates',
          examples: ['Bike rental rates', 'How much does it cost?', 'Compare prices']
        },
        {
          name: 'get_reviews',
          description: 'View bike and partner reviews',
          examples: ['Show reviews', 'Customer feedback', 'Bike ratings']
        },
        {
          name: 'account_info',
          description: 'Get account information and booking history',
          examples: ['My account', 'Booking history', 'Profile information']
        },
        {
          name: 'faq',
          description: 'Get help and frequently asked questions',
          examples: ['How to book?', 'Payment methods', 'Cancellation policy']
        },
        {
          name: 'contact_support',
          description: 'Connect with human support',
          examples: ['Contact support', 'Speak to agent', 'Need help']
        }
      ],
      entities: [
        'location', 'bikeType', 'priceRange', 'dates', 'bikeId', 'bookingId', 'duration'
      ],
      languages: ['en'], // Currently English only, more languages coming soon
      features: [
        'Natural Language Processing',
        'Context Awareness',
        'Multi-turn Conversations',
        'Real-time Database Queries',
        'Personalized Responses',
        'Feedback Learning'
      ]
    }
  });
});

module.exports = router;