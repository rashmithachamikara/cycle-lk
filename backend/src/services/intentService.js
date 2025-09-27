const natural = require('natural');
const compromise = require('compromise');

class IntentService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    
    // Intent patterns with keywords and phrases
    this.intentPatterns = {
      // Bike search and browsing
      'find_bikes': {
        keywords: ['find', 'search', 'show', 'look', 'browse', 'bikes', 'bicycle', 'cycle'],
        phrases: ['find bikes', 'search bikes', 'show me bikes', 'looking for bikes', 'browse bikes'],
        entities: ['location', 'bikeType', 'priceRange']
      },
      
      'check_availability': {
        keywords: ['available', 'availability', 'free', 'book', 'reserve'],
        phrases: ['check availability', 'is available', 'can i book', 'available bikes'],
        entities: ['location', 'dates', 'bikeId']
      },
      
      'get_bike_details': {
        keywords: ['details', 'info', 'information', 'specifications', 'features', 'about'],
        phrases: ['bike details', 'more info', 'tell me about', 'specifications'],
        entities: ['bikeId', 'bikeName']
      },
      
      // Location and partner queries
      'find_locations': {
        keywords: ['locations', 'places', 'areas', 'cities', 'where', 'destinations'],
        phrases: ['find locations', 'available locations', 'where can i rent', 'locations'],
        entities: ['location', 'region']
      },
      
      'get_partners': {
        keywords: ['partners', 'shops', 'stores', 'rental', 'companies'],
        phrases: ['rental partners', 'bike shops', 'find partners'],
        entities: ['location', 'partnerId']
      },
      
      // Booking related
      'create_booking': {
        keywords: ['book', 'rent', 'reserve', 'hire'],
        phrases: ['book a bike', 'make booking', 'rent bike', 'i want to book'],
        entities: ['bikeId', 'dates', 'location']
      },
      
      'booking_status': {
        keywords: ['booking', 'reservation', 'status', 'my booking'],
        phrases: ['booking status', 'check booking', 'my reservations', 'booking details'],
        entities: ['bookingId', 'bookingNumber']
      },
      
      'cancel_booking': {
        keywords: ['cancel', 'cancellation', 'remove'],
        phrases: ['cancel booking', 'cancel reservation', 'remove booking'],
        entities: ['bookingId', 'bookingNumber']
      },
      
      // Pricing
      'pricing_info': {
        keywords: ['price', 'cost', 'pricing', 'rates', 'fees', 'charges', 'how much'],
        phrases: ['bike prices', 'rental rates', 'how much does it cost', 'pricing'],
        entities: ['bikeType', 'location', 'duration']
      },
      
      // Payment Methods
      'payment_methods': {
        keywords: ['payment', 'pay', 'methods', 'options', 'card', 'cash', 'bank'],
        phrases: ['payment methods', 'how to pay', 'payment options', 'available payment', 'pay with'],
        entities: []
      },
      
      // Safety Features
      'safety_info': {
        keywords: ['safety', 'helmet', 'protection', 'gear', 'secure', 'insurance'],
        phrases: ['safety features', 'safety gear', 'what safety', 'protection included'],
        entities: []
      },
      
      // Booking Process
      'booking_process': {
        keywords: ['book', 'booking', 'process', 'how to book', 'steps', 'procedure', 'rent', 'rental', 'how to rent'],
        phrases: ['how to book', 'booking process', 'booking steps', 'how do i book', 'how to rent', 'rental process', 'how do i rent'],
        entities: []
      },
      
      // Reviews and ratings
      'get_reviews': {
        keywords: ['reviews', 'ratings', 'feedback', 'comments'],
        phrases: ['bike reviews', 'customer reviews', 'ratings'],
        entities: ['bikeId', 'partnerId']
      },
      
      // Account related
      'account_info': {
        keywords: ['account', 'profile', 'my info', 'personal'],
        phrases: ['my account', 'account details', 'profile info'],
        entities: ['userId']
      },
      
      'login_help': {
        keywords: ['login', 'sign in', 'password', 'forgot'],
        phrases: ['login help', 'forgot password', 'cant login', 'sign in'],
        entities: []
      },
      
      // Support and FAQ
      'faq': {
        keywords: ['help', 'faq', 'question', 'how to', 'support'],
        phrases: ['need help', 'how do i', 'frequently asked', 'support'],
        entities: ['category', 'topic']
      },
      
      'contact_support': {
        keywords: ['support', 'contact', 'help desk', 'assistance'],
        phrases: ['contact support', 'need assistance', 'talk to human'],
        entities: []
      },
      
      // Payment related
      'payment_info': {
        keywords: ['payment', 'pay', 'billing', 'invoice', 'receipt'],
        phrases: ['payment methods', 'how to pay', 'billing info'],
        entities: ['paymentMethod', 'bookingId']
      },
      
      // Greetings and general
      'greeting': {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
        phrases: ['hello', 'hi there', 'good morning', 'hey'],
        entities: []
      },
      
      'goodbye': {
        keywords: ['bye', 'goodbye', 'thanks', 'thank you'],
        phrases: ['goodbye', 'thank you', 'bye'],
        entities: []
      }
    };
    
    // Entity extraction patterns
    this.entityPatterns = {
      location: {
        keywords: ['colombo', 'kandy', 'galle', 'jaffna', 'negombo', 'matara', 'anuradhapura', 'trincomalee', 'batticaloa', 'ratnapura'],
        patterns: [/in ([a-zA-Z\s]+)/i, /at ([a-zA-Z\s]+)/i, /near ([a-zA-Z\s]+)/i]
      },
      bikeType: {
        keywords: ['mountain', 'road', 'city', 'electric', 'hybrid', 'bmx', 'touring', 'any type', 'any bike', 'all types'],
        patterns: [
          /(mountain|road|city|electric|hybrid|bmx|touring|sport|racing|cruiser)\s+bike/i,
          /(mountain|road|city|electric|hybrid|bmx|touring|sport|racing|cruiser)\s+bicycle/i,
          /any\s+(type|bike)/i,
          /all\s+(types|bikes)/i
        ]
      },
      dates: {
        patterns: [
          /(\d{1,2}\/\d{1,2}\/\d{4})/g,
          /(\d{4}-\d{2}-\d{2})/g,
          /(today|tomorrow|next week|next month)/gi,
          /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi
        ]
      },
      priceRange: {
        patterns: [
          /under (\d+)/i,
          /below (\d+)/i,
          /(\d+)\s*to\s*(\d+)/i,
          /between (\d+) and (\d+)/i,
          /less than (\d+)/i
        ]
      },
      bikeId: {
        patterns: [/bike\s*id[:\s]*([a-zA-Z0-9]+)/i, /id[:\s]*([a-zA-Z0-9]{24})/i]
      },
      bookingId: {
        patterns: [/booking[:\s]*([a-zA-Z0-9]+)/i, /reservation[:\s]*([a-zA-Z0-9]+)/i]
      },
      duration: {
        keywords: ['hour', 'day', 'week', 'month'],
        patterns: [/(\d+)\s*(hour|day|week|month)s?/gi]
      }
    };
  }

  /**
   * Analyze user message to detect intent and extract entities
   * @param {string} message - User's message
   * @param {Object} context - Conversation context
   * @returns {Object} Analysis result with intent and entities
   */
  analyzeMessage(message, context = {}) {
    if (!message || typeof message !== 'string') {
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {},
        needsClarification: true
      };
    }

    const normalizedMessage = this.normalizeText(message);
    const tokens = this.tokenizer.tokenize(normalizedMessage);
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token.toLowerCase()));
    
    // Detect intent
    const intentResult = this.detectIntent(normalizedMessage, stemmedTokens, context);
    
    // Extract entities from current message
    const currentEntities = this.extractEntities(message, intentResult.intent);
    
    // Merge with accumulated entities from conversation context
    const accumulatedEntities = this.mergeEntities(
      context.conversationState?.collectedEntities || {},
      currentEntities,
      intentResult.intent
    );
    
    // Get suggestions based on intent and accumulated entities
    const suggestions = this.getSuggestions(intentResult.intent, accumulatedEntities);
    
    // Determine if clarification is needed based on accumulated entities
    const needsClarification = this.needsClarification(
      intentResult.intent, 
      intentResult.confidence, 
      accumulatedEntities
    ) && !this.hasSufficientEntities(intentResult.intent, accumulatedEntities);
    
    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      entities: accumulatedEntities,
      currentEntities,
      suggestions,
      needsClarification,
      context: this.updateContext(context, intentResult.intent, accumulatedEntities)
    };
  }

  /**
   * Normalize text for better processing
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detect intent from message
   */
  detectIntent(message, stemmedTokens, context) {
    const scores = {};
    
    // Calculate scores for each intent
    Object.entries(this.intentPatterns).forEach(([intent, pattern]) => {
      let score = 0;
      
      // Check keywords
      pattern.keywords.forEach(keyword => {
        const stemmedKeyword = this.stemmer.stem(keyword.toLowerCase());
        if (stemmedTokens.includes(stemmedKeyword)) {
          score += 1;
        }
      });
      
      // Check phrases
      pattern.phrases.forEach(phrase => {
        if (message.includes(phrase.toLowerCase())) {
          score += 2; // Phrases have higher weight
        }
      });
      
      // Context bonus - check multiple context fields
      const currentTopic = context.currentTopic || context.lastIntent || context.lastQueryType;
      if (currentTopic === intent) {
        score += 2.0; // Strong bonus for continuing same topic
      }
      
      // Special handling for follow-up messages that could continue previous intent
      if (this.isFollowUpMessage(message, stemmedTokens, currentTopic, intent)) {
        score += 3.0; // Very strong boost for contextual follow-ups
      }
      
      // For related intents (availability and finding), prefer current topic
      if (currentTopic && this.areRelatedIntents(currentTopic, intent)) {
        score += 1.5; // Moderate bonus for related intents
      }
      
      scores[intent] = score;
    });
    
    // Find best match
    const maxScore = Math.max(...Object.values(scores));
    const bestIntent = Object.keys(scores).find(intent => scores[intent] === maxScore);
    
    if (maxScore === 0) {
      return { intent: 'general', confidence: 0.1 };
    }
    
    // Calculate confidence (normalize score)
    const confidence = Math.min(maxScore / 6, 1.0); // Max score of 6 = 100% confidence
    
    return {
      intent: bestIntent || 'general',
      confidence: confidence
    };
  }

  /**
   * Check if two intents are related (can flow into each other)
   */
  areRelatedIntents(intent1, intent2) {
    const relatedGroups = [
      ['check_availability', 'find_bikes', 'get_bike_details'],
      ['booking_status', 'cancel_booking', 'make_booking'],
      ['find_locations', 'get_location_details'],
      ['pricing_info', 'get_pricing']
    ];
    
    return relatedGroups.some(group => 
      group.includes(intent1) && group.includes(intent2)
    );
  }

  /**
   * Merge entities from conversation context with current message entities
   */
  mergeEntities(previousEntities, currentEntities, intent) {
    const merged = { ...previousEntities };
    
    // For the same intent, accumulate entities
    Object.entries(currentEntities).forEach(([entityType, values]) => {
      if (Array.isArray(values)) {
        if (!merged[entityType]) {
          merged[entityType] = [];
        } else if (!Array.isArray(merged[entityType])) {
          merged[entityType] = [merged[entityType]];
        }
        
        // Add new values that aren't already present
        values.forEach(value => {
          if (!merged[entityType].includes(value)) {
            merged[entityType].push(value);
          }
        });
        
        // If only one value, convert back to string
        if (merged[entityType].length === 1) {
          merged[entityType] = merged[entityType][0];
        }
      } else {
        // For non-array values, use the latest one
        merged[entityType] = values;
      }
    });
    
    return merged;
  }

  /**
   * Check if this message is a follow-up that continues a previous intent
   */
  isFollowUpMessage(message, stemmedTokens, currentTopic, intent) {
    if (!currentTopic) return false;
    
    // Define follow-up patterns for different intents
    const followUpPatterns = {
      'check_availability': {
        // If previous topic was availability, check for location/date follow-ups
        locations: ['colombo', 'kandy', 'galle', 'negombo', 'ella', 'nuwara eliya', 'jaffna', 'trincomalee'],
        dateKeywords: ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'next week'],
        timeKeywords: ['morning', 'afternoon', 'evening', 'night', 'am', 'pm'],
        bikeTypes: ['mountain', 'road', 'hybrid', 'electric', 'city', 'touring', 'any type', 'any', 'all'],
        durationKeywords: ['hour', 'day', 'week', 'month', 'hourly', 'daily', 'weekly', 'monthly', 'hours', 'days', 'weeks', 'months'],
        availabilityKeywords: ['available', 'bikes', 'check', 'find', 'search', 'show', 'list']
      },
      'get_pricing': {
        // If previous topic was pricing, check for bike type follow-ups
        bikeTypes: ['mountain', 'road', 'hybrid', 'electric', 'city', 'touring'],
        durationKeywords: ['hour', 'day', 'week', 'month', 'hourly', 'daily', 'weekly', 'monthly']
      },
      'find_locations': {
        // If previous topic was locations, check for specific location queries
        locationKeywords: ['near', 'close', 'around', 'address', 'directions', 'how to get']
      }
    };
    
    // Check if current message contains follow-up keywords for the current topic
    if ((currentTopic === 'check_availability' || currentTopic === 'find_bikes') && 
        (intent === 'check_availability' || intent === 'find_bikes')) {
      const patterns = followUpPatterns.check_availability;
      
      // Check for location names
      const hasLocation = patterns.locations.some(loc => 
        message.toLowerCase().includes(loc.toLowerCase())
      );
      
      // Check for date/time keywords
      const hasDateTime = patterns.dateKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      ) || patterns.timeKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Check for bike type keywords
      const hasBikeType = patterns.bikeTypes.some(type => 
        message.toLowerCase().includes(type.toLowerCase())
      );
      
      // Check for duration keywords
      const hasDuration = patterns.durationKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      ) || /\d+\s*(hour|day|week|month)s?/.test(message.toLowerCase());
      
      // Check for availability keywords
      const hasAvailability = patterns.availabilityKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasLocation || hasDateTime || hasBikeType || hasDuration || hasAvailability) {
        return true;
      }
    }
    
    if (currentTopic === 'get_pricing' && intent === 'get_pricing') {
      const patterns = followUpPatterns.get_pricing;
      
      const hasBikeType = patterns.bikeTypes.some(type => 
        message.toLowerCase().includes(type.toLowerCase())
      );
      
      const hasDuration = patterns.durationKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasBikeType || hasDuration) {
        return true;
      }
    }
    
    if (currentTopic === 'find_locations' && intent === 'find_locations') {
      const patterns = followUpPatterns.find_locations;
      
      const hasLocationKeyword = patterns.locationKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasLocationKeyword) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extract entities from message
   */
  extractEntities(message, intent) {
    const entities = {};
    
    Object.entries(this.entityPatterns).forEach(([entityType, config]) => {
      // Check keywords
      if (config.keywords) {
        config.keywords.forEach(keyword => {
          if (message.toLowerCase().includes(keyword)) {
            if (!entities[entityType]) entities[entityType] = [];
            entities[entityType].push(keyword);
          }
        });
      }
      
      // Check patterns
      if (config.patterns) {
        config.patterns.forEach(pattern => {
          const matches = message.match(pattern);
          if (matches) {
            if (!entities[entityType]) entities[entityType] = [];
            
            if (entityType === 'priceRange') {
              // Special handling for price ranges
              const priceMatch = this.extractPriceRange(matches);
              if (priceMatch) entities[entityType] = priceMatch;
            } else {
              matches.forEach(match => {
                // Extract captured groups or full match
                const value = matches[1] || match;
                if (value && !entities[entityType].includes(value)) {
                  entities[entityType].push(value);
                }
              });
            }
          }
        });
      }
    });
    
    // Clean up entities
    Object.keys(entities).forEach(key => {
      if (Array.isArray(entities[key])) {
        // Remove duplicates and empty values
        entities[key] = [...new Set(entities[key].filter(Boolean))];
        
        // Convert single-item arrays to strings for convenience
        if (entities[key].length === 1) {
          entities[key] = entities[key][0];
        } else if (entities[key].length === 0) {
          delete entities[key];
        }
      }
    });
    
    return entities;
  }

  /**
   * Extract price range from matches
   */
  extractPriceRange(matches) {
    const numbers = matches.join(' ').match(/\d+/g)?.map(Number);
    if (!numbers || numbers.length === 0) return null;
    
    if (numbers.length === 1) {
      // Single number - treat as max price
      return { max: numbers[0] };
    } else if (numbers.length === 2) {
      // Range
      return { min: Math.min(...numbers), max: Math.max(...numbers) };
    }
    
    return null;
  }

  /**
   * Get suggestions based on intent
   */
  getSuggestions(intent, entities) {
    const suggestions = {
      'find_bikes': ['Search by location', 'Filter by bike type', 'Check availability'],
      'check_availability': ['Book now', 'View bike details', 'Compare prices'],
      'booking_status': ['View booking details', 'Modify booking', 'Contact partner'],
      'pricing_info': ['Compare prices', 'View packages', 'Check availability'],
      'faq': ['Contact support', 'View all FAQs', 'Search help articles'],
      'general': ['Find bikes', 'Check locations', 'View bookings', 'Get help']
    };
    
    return suggestions[intent] || suggestions.general;
  }

  /**
   * Update conversation context
   */
  updateContext(currentContext, intent, entities) {
    return {
      ...currentContext,
      currentTopic: intent,
      lastIntent: intent,
      lastQueryType: intent,
      lastEntities: entities,
      conversationTurn: (currentContext.conversationTurn || 0) + 1,
      timestamp: new Date(),
      conversationState: {
        ...currentContext.conversationState,
        activeIntent: intent,
        collectedEntities: {
          ...currentContext.conversationState?.collectedEntities,
          ...entities
        }
      }
    };
  }

  /**
   * Check if we have sufficient entities to proceed without clarification
   */
  hasSufficientEntities(intent, entities) {
    const requirements = {
      'check_availability': () => {
        // Need location and at least one of: dates, duration, or bikeType
        return entities.location && 
               (entities.dates || entities.duration || entities.bikeType);
      },
      'find_bikes': () => {
        // Need location or bikeType
        return entities.location || entities.bikeType;
      },
      'get_pricing': () => {
        // Need location or bikeType
        return entities.location || entities.bikeType;
      },
      'booking_status': () => {
        // Need booking ID or user ID
        return entities.bookingId || entities.userId;
      },
      'get_bike_details': () => {
        // Need bike ID or bike name
        return entities.bikeId || entities.bikeName;
      }
    };
    
    const requirement = requirements[intent];
    return requirement ? requirement() : false;
  }

  /**
   * Check if message needs clarification
   */
  needsClarification(intent, confidence, entities) {
    // Lower confidence threshold to be more lenient
    if (confidence < 0.4) return true;
    
    // Some intents don't need clarification - they can provide general info
    const noclarificationNeeded = [
      'payment_methods', 'safety_info', 'booking_process', 
      'faq', 'greeting', 'goodbye', 'contact_support'
    ];
    
    if (noclarificationNeeded.includes(intent)) {
      return false;
    }
    
    // Intent-specific clarification rules - more flexible with accumulated entities
    const clarificationRules = {
      'find_bikes': () => !entities.location,
      'check_availability': () => !entities.location,
      'booking_status': () => !entities.bookingId && !entities.userId,
      'get_bike_details': () => !entities.bikeId && !entities.bikeName,
      'pricing_info': () => !entities.location && !entities.bikeType
    };
    
    const rule = clarificationRules[intent];
    return rule ? rule() : false;
  }

  /**
   * Generate clarification questions
   */
  getClarificationQuestion(intent, entities) {
    const questions = {
      'find_bikes': "I'd be happy to help you find bikes! Could you tell me which location you're interested in or what type of bike you're looking for?",
      'check_availability': "To check availability, I'll need either a specific bike ID or the location you're interested in. Which would you prefer to provide?",
      'booking_status': "To check your booking status, please provide your booking ID or make sure you're logged in to your account.",
      'get_bike_details': "I can show you bike details! Please provide the bike ID or tell me which bike you're interested in.",
      'general': "I'm here to help! You can ask me about finding bikes, checking availability, booking status, or any other questions about Cycle.LK."
    };
    
    return questions[intent] || questions.general;
  }
}

module.exports = new IntentService();