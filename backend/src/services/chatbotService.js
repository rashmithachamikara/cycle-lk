const geminiService = require('./geminiService');
const queryService = require('./queryService');
const intentService = require('./intentService');
const { ChatSession, ChatbotKnowledge } = require('../models');
const { v4: uuidv4 } = require('uuid');

class ChatbotService {
  constructor() {
    this.rateLimitMap = new Map(); // Simple in-memory rate limiting
    this.maxRequestsPerHour = parseInt(process.env.CHATBOT_RATE_LIMIT) || 100;
  }

  /**
   * Process a user message and generate a response
   * @param {Object} messageData - Message data including content, userId, sessionId
   * @returns {Promise<Object>} Response object
   */
  async processMessage(messageData) {
    try {
      const { content, userId = null, sessionId, metadata = {} } = messageData;
      
      // Validate input
      const validation = geminiService.validateInput(content);
      if (!validation.valid) {
        return this.createErrorResponse(validation.error);
      }
      
      // Check rate limiting
      if (!this.checkRateLimit(userId || sessionId)) {
        return this.createErrorResponse('Rate limit exceeded. Please try again later.');
      }
      
      // Get or create chat session
      let session = await this.getOrCreateSession(userId, sessionId, metadata);
      
      // Get conversation history BEFORE adding the current message
      const previousHistory = session.getConversationHistory(5);
      console.log('Previous conversation history:', previousHistory.map(m => `${m.type}: ${m.content.substring(0, 50)}...`));
      
      // Add user message to session
      const messageId = session.addMessage({
        type: 'user',
        content: validation.sanitized
      });
      
      // Analyze message for intent and entities
      const analysis = intentService.analyzeMessage(
        validation.sanitized, 
        session.context
      );
      
      console.log('Message analysis:', analysis);
      
      // Update message with analysis results
      const userMessage = session.messages.find(m => m.messageId === messageId);
      if (userMessage) {
        userMessage.intent = analysis.intent;
        userMessage.entities = analysis.entities;
      }
      
      // Generate response
      let response;
      
      if (analysis.needsClarification) {
        response = await this.handleClarification(analysis, session, previousHistory, validation.sanitized);
      } else {
        response = await this.generateIntelligentResponse(analysis, session, previousHistory, validation.sanitized);
      }
      
      // Add bot response to session
      const botMessageId = session.addMessage({
        type: 'bot',
        content: response.message,
        intent: analysis.intent,
        entities: response.entities || {}
      });
      
      // Update session context
      session.context = {
        ...session.context,
        ...analysis.context,
        currentTopic: analysis.intent,
        lastQueryType: analysis.intent
      };
      
      // Save session
      await session.save();
      
      return {
        success: true,
        sessionId: session.sessionId,
        messageId: botMessageId,
        response: {
          message: response.message,
          intent: analysis.intent,
          confidence: analysis.confidence,
          suggestions: response.suggestions || analysis.suggestions,
          data: response.data,
          actions: response.actions || [],
          needsHumanSupport: response.needsHumanSupport || false
        },
        context: session.context
      };
      
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return this.createErrorResponse('I encountered an error processing your message. Please try again.');
    }
  }

  /**
   * Generate intelligent response using AI and database queries
   */
  async generateIntelligentResponse(analysis, session, previousHistory = [], userMessage) {
    const { intent, entities, confidence } = analysis;
    
    try {
      // First, try to get data from database if applicable
      let queryResult = null;
      if (this.requiresDatabaseQuery(intent)) {
        queryResult = await queryService.executeQuery(intent, entities, {
          userId: session.userId,
          sessionId: session.sessionId
        });
        console.log('Query result:', JSON.stringify(queryResult, null, 2));
      }
      
      // Check knowledge base for quick answers
      const knowledgeResult = await this.searchKnowledgeBase(intent, entities);
      
      // Prepare context for AI generation
      console.log('Using previous conversation history for AI context');
      
      const aiContext = {
        intent,
        entities,
        confidence,
        userLocation: entities.location,
        currentTopic: session.context.currentTopic,
        queryResult,
        knowledgeResult,
        conversationHistory: previousHistory
      };
      
      // Generate response with Gemini AI
      const aiResponse = await geminiService.generateResponse(
        userMessage,
        aiContext,
        previousHistory
      );
      
      if (aiResponse.success) {
        // Combine AI response with database results
        return this.combineResponseData(aiResponse.response, queryResult, knowledgeResult);
      } else {
        // Fallback to predefined responses
        return this.getFallbackResponse(intent, queryResult, knowledgeResult);
      }
      
    } catch (error) {
      console.error('Response generation error:', error);
      return this.getFallbackResponse(intent);
    }
  }

  /**
   * Handle clarification requests
   */
  async handleClarification(analysis, session, previousHistory = [], userMessage = '') {
    // Double-check if we actually have sufficient entities to proceed
    if (intentService.hasSufficientEntities(analysis.intent, analysis.entities)) {
      console.log('Have sufficient entities, proceeding with normal response instead of clarification');
      // We have enough information, proceed with normal response
      return await this.generateIntelligentResponse(analysis, session, previousHistory, userMessage);
    }
    
    const clarificationQuestion = intentService.getClarificationQuestion(
      analysis.intent, 
      analysis.entities
    );
    
    // Get suggestions to help user
    const suggestions = this.getClarificationSuggestions(analysis.intent);
    
    return {
      message: clarificationQuestion,
      suggestions,
      needsClarification: true,
      actions: [{
        type: 'request_clarification',
        data: { intent: analysis.intent, entities: analysis.entities }
      }]
    };
  }

  /**
   * Search knowledge base for quick answers
   */
  async searchKnowledgeBase(intent, entities) {
    try {
      // Search by intent first
      let results = await ChatbotKnowledge.findByIntent(intent, 3);
      
      // If no results, try text search with entities
      if (results.length === 0 && entities) {
        const searchTerms = Object.values(entities).flat().join(' ');
        if (searchTerms) {
          results = await ChatbotKnowledge.searchKnowledge(searchTerms, null, 3);
        }
      }
      
      // Record usage for found results
      if (results.length > 0) {
        await Promise.all(results.map(result => result.recordUsage()));
      }
      
      return {
        success: true,
        results: results.map(kb => ({
          question: kb.question,
          answer: kb.answer,
          category: kb.category,
          priority: kb.priority
        }))
      };
      
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return { success: false, results: [] };
    }
  }

  /**
   * Combine AI response with database and knowledge base results
   */
  combineResponseData(aiResponse, queryResult, knowledgeResult) {
    let message = aiResponse.message || "I'm here to help you with Cycle.LK!";
    let data = null;
    let actions = aiResponse.actions || [];
    
    // Include database results if available
    if (queryResult && queryResult.success && queryResult.data) {
      data = queryResult.data;
      
      // Add action to show more details if applicable
      if (Array.isArray(data) && data.length > 0) {
        actions.push({
          type: 'show_results',
          data: { count: data.length, type: queryResult.type }
        });
      }
    }
    
    // Include knowledge base results if no database results
    if (!data && knowledgeResult && knowledgeResult.results.length > 0) {
      const topResult = knowledgeResult.results[0];
      message = `${message}\n\n${topResult.answer}`;
      
      actions.push({
        type: 'knowledge_answer',
        data: { category: topResult.category }
      });
    }
    
    return {
      message,
      data,
      actions,
      suggestions: aiResponse.suggestions || this.getDefaultSuggestions(),
      needsHumanSupport: aiResponse.needsHumanSupport || false
    };
  }

  /**
   * Get fallback response when AI fails
   */
  getFallbackResponse(intent, queryResult = null, knowledgeResult = null) {
    // Use database results if available
    if (queryResult && queryResult.success) {
      return {
        message: queryResult.message || "Here's what I found:",
        data: queryResult.data,
        suggestions: queryResult.suggestions || this.getIntentSuggestions(intent)
      };
    }
    
    // Use knowledge base results
    if (knowledgeResult && knowledgeResult.results.length > 0) {
      const topResult = knowledgeResult.results[0];
      return {
        message: topResult.answer,
        suggestions: this.getIntentSuggestions(intent),
        actions: [{ type: 'knowledge_answer', data: { category: topResult.category } }]
      };
    }
    
    // Default fallback responses by intent
    const fallbacks = {
      'find_bikes': {
        message: "I can help you find bikes! Let me know your preferred location or bike type.",
        suggestions: ['Browse all bikes', 'Search by location', 'Filter by type']
      },
      'check_availability': {
        message: "To check bike availability, please provide a location or specific bike ID.",
        suggestions: ['Search bikes', 'View locations', 'Contact support']
      },
      'booking_status': {
        message: "To check your booking status, please provide your booking ID or log in to your account.",
        suggestions: ['Login to account', 'Contact support', 'View booking help']
      },
      'general': {
        message: "I'm here to help you with bike rentals! What can I assist you with today?",
        suggestions: ['Find bikes', 'Check availability', 'View locations', 'Get help']
      }
    };
    
    return fallbacks[intent] || fallbacks.general;
  }

  /**
   * Get or create chat session
   */
  async getOrCreateSession(userId, sessionId, metadata) {
    if (sessionId) {
      const existingSession = await ChatSession.findOne({ sessionId });
      if (existingSession) {
        return existingSession;
      }
    }
    
    // Create new session
    return ChatSession.createSession(userId, metadata);
  }

  /**
   * Check if intent requires database query
   */
  requiresDatabaseQuery(intent) {
    const databaseIntents = [
      'find_bikes', 'check_availability', 'get_bike_details',
      'find_locations', 'get_partners', 'booking_status',
      'pricing_info', 'get_reviews', 'account_info'
    ];
    
    return databaseIntents.includes(intent);
  }

  /**
   * Simple rate limiting check
   */
  checkRateLimit(identifier) {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    
    if (!this.rateLimitMap.has(identifier)) {
      this.rateLimitMap.set(identifier, []);
    }
    
    const requests = this.rateLimitMap.get(identifier);
    
    // Remove old requests
    const recentRequests = requests.filter(time => time > hourAgo);
    this.rateLimitMap.set(identifier, recentRequests);
    
    if (recentRequests.length >= this.maxRequestsPerHour) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimitMap.set(identifier, recentRequests);
    
    return true;
  }

  /**
   * Create error response
   */
  createErrorResponse(message) {
    return {
      success: false,
      error: message,
      response: {
        message,
        needsHumanSupport: true,
        suggestions: ['Contact support', 'Try again', 'Get help']
      }
    };
  }

  /**
   * Get clarification suggestions
   */
  getClarificationSuggestions(intent) {
    const suggestions = {
      'find_bikes': ['Bikes in Colombo', 'Mountain bikes', 'Electric bikes'],
      'check_availability': ['Check specific bike', 'Bikes for tomorrow', 'Weekend availability'],
      'booking_status': ['Enter booking ID', 'Login to account', 'Contact support'],
      'pricing_info': ['Daily rates', 'Weekly packages', 'Compare prices']
    };
    
    return suggestions[intent] || ['Browse bikes', 'View locations', 'Get help'];
  }

  /**
   * Get intent-specific suggestions
   */
  getIntentSuggestions(intent) {
    const suggestions = {
      'find_bikes': ['Filter by location', 'Check availability', 'View details'],
      'check_availability': ['Book now', 'Compare options', 'Check other dates'],
      'booking_status': ['View details', 'Modify booking', 'Contact partner'],
      'pricing_info': ['Compare bikes', 'View packages', 'Book now']
    };
    
    return suggestions[intent] || this.getDefaultSuggestions();
  }

  /**
   * Get default suggestions
   */
  getDefaultSuggestions() {
    return ['Find bikes', 'Check locations', 'View bookings', 'Get help'];
  }

  /**
   * Get chat history for a user
   */
  async getChatHistory(userId, sessionId = null, limit = 20) {
    try {
      let query = {};
      
      if (sessionId) {
        query.sessionId = sessionId;
      } else if (userId) {
        query.userId = userId;
      } else {
        throw new Error('Either userId or sessionId is required');
      }
      
      const sessions = await ChatSession.find(query)
        .sort({ updatedAt: -1 })
        .limit(5); // Limit to recent sessions
      
      const history = [];
      
      sessions.forEach(session => {
        session.messages.slice(-limit).forEach(message => {
          history.push({
            sessionId: session.sessionId,
            messageId: message.messageId,
            type: message.type,
            content: message.content,
            timestamp: message.timestamp,
            intent: message.intent,
            feedback: message.feedback
          });
        });
      });
      
      return {
        success: true,
        history: history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };
      
    } catch (error) {
      console.error('Chat history error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update message feedback
   */
  async updateMessageFeedback(sessionId, messageId, feedback) {
    try {
      const session = await ChatSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Session not found');
      }
      
      const updated = session.updateMessageFeedback(messageId, feedback);
      if (!updated) {
        throw new Error('Message not found');
      }
      
      await session.save();
      
      return { success: true, message: 'Feedback updated successfully' };
      
    } catch (error) {
      console.error('Feedback update error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(userId, sessionId = null) {
    try {
      let query = {};
      
      if (sessionId) {
        query.sessionId = sessionId;
      } else if (userId) {
        query.userId = userId;
      } else {
        throw new Error('Either userId or sessionId is required');
      }
      
      await ChatSession.deleteMany(query);
      
      return { success: true, message: 'Chat history cleared successfully' };
      
    } catch (error) {
      console.error('Clear history error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ChatbotService();