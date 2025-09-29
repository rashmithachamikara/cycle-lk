const mongoose = require('mongoose');

const chatbotKnowledgeSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['bikes', 'booking', 'locations', 'partners', 'payment', 'account', 'general', 'support'],
    index: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 500
  },
  answer: {
    type: String,
    required: true,
    maxlength: 5000
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  intent: {
    type: String,
    required: true,
    index: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for search performance
chatbotKnowledgeSchema.index({ category: 1, active: 1 });
chatbotKnowledgeSchema.index({ intent: 1, active: 1 });
chatbotKnowledgeSchema.index({ keywords: 1, active: 1 });
chatbotKnowledgeSchema.index({ priority: -1, active: 1 });

// Text index for full-text search
chatbotKnowledgeSchema.index({
  question: 'text',
  answer: 'text',
  keywords: 'text'
}, {
  weights: {
    question: 10,
    keywords: 5,
    answer: 1
  },
  name: 'knowledge_text_index'
});

// Method to increment usage count
chatbotKnowledgeSchema.methods.recordUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Static method to search knowledge base
chatbotKnowledgeSchema.statics.searchKnowledge = function(query, category = null, limit = 5) {
  const searchCriteria = {
    active: true,
    $text: { $search: query }
  };
  
  if (category) {
    searchCriteria.category = category;
  }
  
  return this.find(searchCriteria, {
    score: { $meta: 'textScore' }
  })
  .sort({ 
    score: { $meta: 'textScore' },
    priority: -1,
    usageCount: -1
  })
  .limit(limit);
};

// Static method to find by intent
chatbotKnowledgeSchema.statics.findByIntent = function(intent, limit = 3) {
  return this.find({
    intent,
    active: true
  })
  .sort({ priority: -1, usageCount: -1 })
  .limit(limit);
};

// Static method to get popular knowledge
chatbotKnowledgeSchema.statics.getPopularKnowledge = function(category = null, limit = 10) {
  const criteria = { active: true };
  if (category) criteria.category = category;
  
  return this.find(criteria)
    .sort({ usageCount: -1, priority: -1 })
    .limit(limit);
};

// Pre-save middleware
chatbotKnowledgeSchema.pre('save', function(next) {
  // Convert keywords to lowercase and remove duplicates
  if (this.keywords && this.keywords.length > 0) {
    this.keywords = [...new Set(this.keywords.map(k => k.toLowerCase().trim()))];
  }
  next();
});

module.exports = mongoose.model('ChatbotKnowledge', chatbotKnowledgeSchema);