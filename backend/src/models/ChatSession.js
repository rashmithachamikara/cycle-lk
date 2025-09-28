const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  intent: {
    type: String,
    default: null
  },
  entities: [{
    type: Object,
    default: []
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpful: {
      type: Boolean,
      default: null
    }
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for guest users
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema],
  context: {
    currentTopic: {
      type: String,
      default: null
    },
    userPreferences: {
      type: Object,
      default: {}
    },
    lastQueryType: {
      type: String,
      default: null
    },
    conversationState: {
      type: Object,
      default: {}
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ createdAt: -1 });

// Pre-save middleware to update the updatedAt field
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add a message to the session
chatSessionSchema.methods.addMessage = function(messageData) {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const message = {
    messageId,
    type: messageData.type,
    content: messageData.content,
    timestamp: new Date(),
    intent: messageData.intent || null,
    entities: messageData.entities || [],
    feedback: {}
  };
  
  this.messages.push(message);
  return messageId;
};

// Method to update message feedback
chatSessionSchema.methods.updateMessageFeedback = function(messageId, feedback) {
  const message = this.messages.find(msg => msg.messageId === messageId);
  if (message) {
    message.feedback = { ...message.feedback, ...feedback };
    return true;
  }
  return false;
};

// Method to get conversation history
chatSessionSchema.methods.getConversationHistory = function(limit = 10) {
  return this.messages
    .slice(-limit)
    .map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      intent: msg.intent
    }));
};

// Static method to create a new session
chatSessionSchema.statics.createSession = function(userId = null, metadata = {}) {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new this({
    userId,
    sessionId,
    messages: [],
    context: {
      currentTopic: null,
      userPreferences: {},
      lastQueryType: null,
      conversationState: {}
    },
    metadata
  });
};

// Static method to find active sessions
chatSessionSchema.statics.findActiveSessions = function(userId) {
  return this.find({
    userId,
    endedAt: null,
    updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);