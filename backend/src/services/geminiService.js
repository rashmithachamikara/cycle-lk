const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { buildSystemPrompt } = require('../config/prompts');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.maxTokens = parseInt(process.env.CHATBOT_MAX_TOKENS) || 1000;
    
    // Initialize the model with safety settings
    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        maxOutputTokens: this.maxTokens,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    });
  }

  /**
   * Generate a response based on user input and context
   * @param {string} userMessage - The user's message
   * @param {Object} context - Conversation context
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} Generated response with metadata
   */
  async generateResponse(userMessage, context = {}, conversationHistory = []) {
    try {
      const systemPrompt = buildSystemPrompt(context);
      const fullPrompt = this.buildFullPrompt(systemPrompt, userMessage, conversationHistory);
      
      console.log('Generating response with Gemini AI...');
      console.log('Full prompt (first 500 chars):', fullPrompt.substring(0, 500) + '...');
      console.log('Conversation history length:', conversationHistory?.length || 0);
      
      // Add timeout to the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 30 seconds')), 30000);
      });
      
      const result = await Promise.race([
        this.model.generateContent(fullPrompt),
        timeoutPromise
      ]);
      
      const response = await result.response;
      
      if (!response || !response.text) {
        throw new Error('No response received from Gemini AI');
      }
      
      const responseText = response.text();
      console.log('Gemini API response received:', responseText.substring(0, 200) + '...');
      
      // Parse the response - handle JSON in markdown code blocks or plain text
      let parsedResponse;
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[1]);
          // If it's a nested response object, extract the message
          const message = jsonData.response || jsonData.message || jsonData;
          parsedResponse = {
            message: typeof message === 'string' ? message : JSON.stringify(message),
            intent: context.intent || 'general',
            confidence: 0.9,
            suggestions: this.generateSuggestions(context.intent),
            needsHumanSupport: false
          };
        } catch (e) {
          console.log('Failed to parse JSON from markdown:', e.message);
          // Fallback to plain text
          parsedResponse = {
            message: responseText.trim(),
            intent: context.intent || 'general',
            confidence: 0.9,
            suggestions: this.generateSuggestions(context.intent),
            needsHumanSupport: false
          };
        }
      } else {
        // Try direct JSON parsing
        try {
          const jsonData = JSON.parse(responseText);
          parsedResponse = {
            message: jsonData.message || jsonData.response || responseText,
            intent: context.intent || 'general',
            confidence: 0.9,
            suggestions: this.generateSuggestions(context.intent),
            needsHumanSupport: false
          };
        } catch (e) {
          // Fallback to plain text
          parsedResponse = {
            message: responseText.trim(),
            intent: context.intent || 'general',
            confidence: 0.9,
            suggestions: this.generateSuggestions(context.intent),
            needsHumanSupport: false
          };
        }
      }
      
      return {
        success: true,
        response: parsedResponse,
        tokensUsed: this.estimateTokens(responseText),
        model: this.modelName
      };
      
    } catch (error) {
      console.error('Gemini AI generation error:', error);
      
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackResponse(context.intent)
      };
    }
  }

  /**
   * Build the system prompt for the AI model
   * @param {Object} context - Current context
   * @returns {string} System prompt
   */
  buildSystemPrompt(context) {
    return buildSystemPrompt(context);
  }

  /**
   * Build the full prompt including conversation history
   * @param {string} systemPrompt - System instructions
   * @param {string} userMessage - Current user message
   * @param {Array} conversationHistory - Previous messages
   * @returns {string} Complete prompt
   */
  buildFullPrompt(systemPrompt, userMessage, conversationHistory) {
    let prompt = systemPrompt + '\n\n';
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Previous Conversation:\n';
      conversationHistory.slice(-5).forEach(msg => {
        prompt += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\nIMPORTANT: Reference the previous conversation when relevant. Build upon what was already discussed.\n\n';
    }
    
    prompt += `Current User Message: ${userMessage}\n\n`;
    prompt += 'Please provide a helpful response that takes into account the conversation history above:';
    
    return prompt;
  }

  /**
   * Generate contextual suggestions based on intent
   * @param {string} intent - Current intent
   * @returns {Array} Array of suggestions
   */
  generateSuggestions(intent) {
    const suggestionMap = {
      find_bikes: ['Check availability', 'View bike types', 'Search by location'],
      booking: ['View booking', 'Modify booking', 'Cancel booking'],
      pricing_info: ['Compare prices', 'View packages', 'Check discounts'],
      locations: ['Popular spots', 'Nearby locations', 'Tourist destinations'],
      support: ['Contact support', 'View FAQ', 'Report issue'],
      general: ['Find bikes', 'Make booking', 'Check locations', 'Get help']
    };
    
    return suggestionMap[intent] || suggestionMap.general;
  }

  /**
   * Get fallback response for when AI fails
   * @param {string} intent - Detected intent
   * @returns {Object} Fallback response
   */
  getFallbackResponse(intent) {
    const fallbacks = {
      booking: {
        message: "I'm having trouble processing your booking request right now. Let me connect you with our booking team who can assist you directly.",
        suggestions: ["View available bikes", "Check booking status", "Contact support"],
        needsHumanSupport: true
      },
      bikes: {
        message: "I'm unable to fetch bike information at the moment. You can browse our available bikes on the main page or I can connect you with our team.",
        suggestions: ["Browse bikes", "Search by location", "Contact support"],
        needsHumanSupport: false
      },
      payment: {
        message: "For payment-related queries, I recommend speaking with our support team who can securely assist you with your account.",
        suggestions: ["Contact support", "View payment methods", "Check booking history"],
        needsHumanSupport: true
      },
      general: {
        message: "I'm experiencing some technical difficulties right now. Is there something specific I can help you with, or would you like me to connect you with our support team?",
        suggestions: ["Find bikes", "Make booking", "Contact support"],
        needsHumanSupport: false
      }
    };
    
    return fallbacks[intent] || fallbacks.general;
  }

  /**
   * Estimate token usage for billing/monitoring
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Validate and sanitize user input
   * @param {string} input - User input
   * @returns {Object} Validation result
   */
  validateInput(input) {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Invalid input' };
    }
    
    if (input.length > 2000) {
      return { valid: false, error: 'Message too long' };
    }
    
    // Basic content filtering
    const inappropriateContent = /\b(spam|hack|exploit|abuse)\b/i;
    if (inappropriateContent.test(input)) {
      return { valid: false, error: 'Inappropriate content detected' };
    }
    
    return { valid: true, sanitized: input.trim() };
  }
}

module.exports = new GeminiService();