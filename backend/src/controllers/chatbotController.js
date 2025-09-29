const chatbotService = require('../services/chatbotService');
const auth = require('../middleware/auth');

/**
 * Send a message to the chatbot
 */
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }

    // Get user ID from auth token if available
    const userId = req.user?.id || null;
    
    // Prepare message data
    const messageData = {
      content: message.trim(),
      userId,
      sessionId,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        platform: req.get('X-Platform') || 'web'
      }
    };

    // Process message with chatbot service
    const result = await chatbotService.processMessage(messageData);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          sessionId: result.sessionId,
          messageId: result.messageId,
          message: result.response.message,
          suggestions: result.response.suggestions,
          actions: result.response.actions,
          needsHumanSupport: result.response.needsHumanSupport,
          data: result.response.data,
          context: result.context
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        fallbackResponse: result.fallbackResponse
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your message'
    });
  }
};

/**
 * Get chat history for a user or session
 */
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user?.id;

    if (!sessionId && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required for guest users'
      });
    }

    const result = await chatbotService.getChatHistory(
      userId, 
      sessionId, 
      Math.min(parseInt(limit), 50) // Max 50 messages
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          history: result.history,
          count: result.history.length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Update message feedback (thumbs up/down, rating)
 */
const updateMessageFeedback = async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const { rating, helpful, comment } = req.body;

    if (!sessionId || !messageId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and Message ID are required'
      });
    }

    // Validate feedback data
    const feedback = {};
    if (rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }
      feedback.rating = ratingNum;
    }

    if (helpful !== undefined) {
      feedback.helpful = Boolean(helpful);
    }

    if (comment) {
      feedback.comment = comment.trim();
    }

    const result = await chatbotService.updateMessageFeedback(sessionId, messageId, feedback);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get suggested questions/quick responses
 */
const getSuggestions = async (req, res) => {
  try {
    const { category = 'general', limit = 5 } = req.query;
    
    // Predefined suggestions by category
    const suggestions = {
      general: [
        'Check bike availability',
        'View popular locations',
        'How to book a bike?',
        'What are the rental rates?'
      ],
      booking: [
        'How do I make a booking?',
        'Can I cancel my booking?',
        'How to modify booking dates?',
        'What payment methods do you accept?',
        'How do I contact the bike partner?'
      ],
      bikes: [
        'What types of bikes are available?',
        'Show me mountain bikes',
        'Electric bikes in Colombo',
        'Bike specifications',
        'How to choose the right bike?'
      ],
      locations: [
        'Popular bike rental locations',
        'Bikes in Colombo',
        'Tourist destinations',
        'Beach locations',
        'Mountain biking spots'
      ],
      support: [
        'Contact customer support',
        'Report a problem',
        'Account help',
        'Payment issues',
        'Technical support'
      ]
    };

    const categoryList = suggestions[category] || suggestions.general;
    const limitedSuggestions = categoryList.slice(0, Math.min(parseInt(limit), 10));

    res.status(200).json({
      success: true,
      data: {
        category,
        suggestions: limitedSuggestions,
        count: limitedSuggestions.length
      }
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Clear chat history for a user or session
 */
const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!sessionId && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required for guest users'
      });
    }

    const result = await chatbotService.clearChatHistory(userId, sessionId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get chatbot status and configuration
 */
const getChatbotStatus = async (req, res) => {
  try {
    const status = {
      online: true,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      features: [
        'Natural language processing',
        'Bike search and filtering',
        'Booking assistance',
        'Location information',
        'Real-time availability',
        'Multi-language support (coming soon)'
      ],
      supportedIntents: [
        'find_bikes',
        'check_availability',
        'get_bike_details',
        'find_locations',
        'booking_status',
        'pricing_info',
        'get_reviews',
        'account_info',
        'faq',
        'contact_support'
      ],
      rateLimit: {
        requestsPerHour: parseInt(process.env.CHATBOT_RATE_LIMIT) || 100,
        maxTokens: parseInt(process.env.CHATBOT_MAX_TOKENS) || 1000
      }
    };

    res.status(200).json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get chatbot status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  updateMessageFeedback,
  getSuggestions,
  clearChatHistory,
  getChatbotStatus
};