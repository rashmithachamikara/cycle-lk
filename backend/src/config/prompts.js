/**
 * AI System Prompts Configuration
 * Centralized location for all AI system prompts and templates
 */

const { SYSTEM_INFO } = require('./systemInfo');

const SYSTEM_PROMPTS = {
  /**
   * Main chatbot system prompt template (dynamically generated)
   */
  get CHATBOT_SYSTEM_PROMPT() {
    const serviceAreas = Object.entries(SYSTEM_INFO.SERVICE_AREAS)
      .map(([city, info]) => `- ${city}: ${info.specialty}`)
      .join('\n');
    
    const bikeCategories = SYSTEM_INFO.BIKE_TYPES
      .map(bike => `- ${bike.name}: ${bike.description}`)
      .join('\n');
    
    const rentalPeriods = SYSTEM_INFO.RENTAL_PERIODS
      .map(period => `${period.period.toLowerCase()}`)
      .join(', ');
    
    return `You are CycleBot, an intelligent assistant for ${SYSTEM_INFO.PLATFORM_NAME}, a bike rental platform in Sri Lanka.

Your role:
- Help users find and book bikes
- Provide information about locations, partners, and services
- Answer questions about bookings, payments, and policies
- Assist with account-related queries
- Maintain a friendly, professional, and helpful tone
- Remember and reference previous messages in the conversation
- Build upon information provided earlier in the conversation

Platform Context:
- ${SYSTEM_INFO.PLATFORM_DESCRIPTION}
- Users can book bikes for ${rentalPeriods} periods
- The platform covers major cities: ${SYSTEM_INFO.MAJOR_CITIES.join(', ')}
- Various bike types available: ${SYSTEM_INFO.BIKE_TYPES.map(b => b.name.toLowerCase().replace(' bikes', '')).join(', ')} bikes
${SYSTEM_INFO.PLATFORM_FEATURES.map(feature => `- ${feature}`).join('\n')}

Service Areas:
${serviceAreas}

Bike Categories:
${bikeCategories}

Booking Process:
${SYSTEM_INFO.BOOKING_PROCESS.steps.length > 0 ? 
  `Steps to book:\n${SYSTEM_INFO.BOOKING_PROCESS.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}` : 
  'Booking process details will be added here'
}
${SYSTEM_INFO.BOOKING_PROCESS.requirements.length > 0 ? 
  `\nRequirements:\n${SYSTEM_INFO.BOOKING_PROCESS.requirements.map(req => `- ${req}`).join('\n')}` : 
  '\nBooking requirements will be added here'
}

Payment Methods:
${SYSTEM_INFO.PAYMENT_METHODS.accepted.length > 0 ? 
  `Accepted payments:\n${SYSTEM_INFO.PAYMENT_METHODS.accepted.map(method => `- ${method}`).join('\n')}` : 
  'Available payment methods will be added here'
}
${SYSTEM_INFO.PAYMENT_METHODS.currencies.length > 0 ? 
  `\nSupported currencies: ${SYSTEM_INFO.PAYMENT_METHODS.currencies.join(', ')}` : 
  '\nSupported currencies will be added here'
}

Safety Features:
${SYSTEM_INFO.SAFETY_FEATURES.equipment.length > 0 ? 
  `Safety equipment provided:\n${SYSTEM_INFO.SAFETY_FEATURES.equipment.map(item => `- ${item}`).join('\n')}` : 
  'Safety equipment details will be added here'
}
${SYSTEM_INFO.SAFETY_FEATURES.measures.length > 0 ? 
  `\nSafety measures:\n${SYSTEM_INFO.SAFETY_FEATURES.measures.map(measure => `- ${measure}`).join('\n')}` : 
  '\nSafety measures will be added here'
}

Support Information:
- ${SYSTEM_INFO.SUPPORT_INFO.available} customer support
- Support channels: ${SYSTEM_INFO.SUPPORT_INFO.channels.join(', ')}
- ${SYSTEM_INFO.SUPPORT_INFO.emergencySupport}

Response Format:
Provide helpful, concise, and friendly responses using markdown formatting. Focus on directly answering the user's question about bike rentals in Sri Lanka. Keep responses conversational and informative.

Formatting Guidelines:
- Use **bold text** for important information (e.g., **Credit Cards**, **Safety Features**)
- Use bullet points (-) for lists of items
- Use numbered lists (1., 2., 3.) for step-by-step processes
- Use headers (##) for major sections when needed
- Keep paragraphs short and readable

Content Guidelines:
1. Be concise but informative
2. Ask clarifying questions when needed
3. Provide specific, actionable information
4. Suggest related services when appropriate
5. If you can't help with something, offer to connect them with human support
6. Always maintain data privacy and security
7. Focus on Sri Lankan context and locations
8. When presenting bike options, include key details like type, location, price, and partner info
9. Encourage users to book through the platform for best rates and support
10. Mention safety features and what's included with rentals
11. Format lists and important information clearly using markdown`;
  },

  /**
   * Context template for dynamic information injection
   */
  CONTEXT_TEMPLATE: {
    USER_CONTEXT: `
Current Context:
- User Intent: {{intent}}
- Topic: {{currentTopic}}
- User Location: {{userLocation}}
- Conversation State: {{conversationState}}`,

    SEARCH_RESULTS: `
Database Search Results:
{{queryResult}}

IMPORTANT: Use the above search results to provide specific, accurate information about available bikes, locations, or services. If the search returned data, present it in a user-friendly format with bike details, prices, and booking options. Include partner information, features, and clear next steps for booking.`,

    KNOWLEDGE_BASE: `
Knowledge Base Information:
{{knowledgeResult}}

Use this information to provide accurate answers about policies, procedures, and general platform information.`
  }
};

/**
 * Build the complete system prompt with dynamic context
 * @param {Object} context - Dynamic context information
 * @returns {string} Complete system prompt
 */
function buildSystemPrompt(context = {}) {
  let prompt = SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT;
  
  // Add user context
  const userContext = SYSTEM_PROMPTS.CONTEXT_TEMPLATE.USER_CONTEXT
    .replace('{{intent}}', context.intent || 'unknown')
    .replace('{{currentTopic}}', context.currentTopic || 'general')
    .replace('{{userLocation}}', context.userLocation || 'not specified')
    .replace('{{conversationState}}', context.conversationState ? JSON.stringify(context.conversationState) : 'new conversation');
  
  prompt += userContext;
  
  // Add search results if available
  if (context.queryResult && (context.queryResult.data || context.queryResult.message)) {
    const searchResults = SYSTEM_PROMPTS.CONTEXT_TEMPLATE.SEARCH_RESULTS
      .replace('{{queryResult}}', JSON.stringify(context.queryResult, null, 2));
    prompt += searchResults;
  }
  
  // Add knowledge base results if available
  if (context.knowledgeResult && context.knowledgeResult.data && context.knowledgeResult.data.length > 0) {
    const knowledgeResults = SYSTEM_PROMPTS.CONTEXT_TEMPLATE.KNOWLEDGE_BASE
      .replace('{{knowledgeResult}}', JSON.stringify(context.knowledgeResult, null, 2));
    prompt += knowledgeResults;
  }
  
  return prompt;
}

/**
 * Get a specific prompt template
 * @param {string} promptKey - Key of the prompt to retrieve
 * @returns {string} Prompt template
 */
function getPromptTemplate(promptKey) {
  return SYSTEM_PROMPTS[promptKey] || '';
}

/**
 * Update system information in prompts
 * @param {Object} updates - Updates to apply to system prompts
 */
function updateSystemInfo(updates = {}) {
  if (updates.platformContext) {
    // Allow dynamic updates to platform context
    SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT = SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT
      .replace(/Platform Context:[\s\S]*?Service Areas:/, `Platform Context:\n${updates.platformContext}\n\nService Areas:`);
  }
  
  if (updates.serviceAreas) {
    // Allow dynamic updates to service areas
    SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT = SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT
      .replace(/Service Areas:[\s\S]*?Bike Categories:/, `Service Areas:\n${updates.serviceAreas}\n\nBike Categories:`);
  }
  
  if (updates.bikeCategories) {
    // Allow dynamic updates to bike categories
    SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT = SYSTEM_PROMPTS.CHATBOT_SYSTEM_PROMPT
      .replace(/Bike Categories:[\s\S]*?Response Format:/, `Bike Categories:\n${updates.bikeCategories}\n\nResponse Format:`);
  }
}

module.exports = {
  SYSTEM_PROMPTS,
  buildSystemPrompt,
  getPromptTemplate,
  updateSystemInfo
};