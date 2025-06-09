const { FAQ } = require('../models');

/**
 * Get all FAQs with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllFAQs = async (req, res) => {
  try {
    const { category, active } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    
    // Only show active FAQs by default
    if (active !== undefined) {
      filter.active = active === 'true';
    } else {
      filter.active = true;
    }
    
    const faqs = await FAQ.find(filter).sort({ order: 1 });
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get FAQ by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createFAQ = async (req, res) => {
  try {
    // Get the highest current order to put this at the end
    const highestOrder = await FAQ.findOne().sort({ order: -1 }).select('order');
    const order = highestOrder ? highestOrder.order + 1 : 0;
    
    const faq = new FAQ({
      ...req.body,
      order
    });
    
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update an existing FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update an FAQ's order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateFAQOrder = async (req, res) => {
  try {
    const { newOrder } = req.body;
    
    if (newOrder === undefined) {
      return res.status(400).json({ message: 'New order value is required' });
    }
    
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    const oldOrder = faq.order;
    
    // If moving down in the list
    if (newOrder > oldOrder) {
      // Decrease order for FAQs between old and new position
      await FAQ.updateMany(
        { order: { $gt: oldOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } 
    // If moving up in the list
    else if (newOrder < oldOrder) {
      // Increase order for FAQs between new and old position
      await FAQ.updateMany(
        { order: { $gte: newOrder, $lt: oldOrder } },
        { $inc: { order: 1 } }
      );
    }
    
    // Set new order for the current FAQ
    faq.order = newOrder;
    await faq.save();
    
    res.json({ message: 'FAQ order updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete an FAQ
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    const orderToRemove = faq.order;
    
    await faq.deleteOne(); // Using deleteOne instead of remove as remove is deprecated
    
    // Reorder remaining FAQs to close the gap
    await FAQ.updateMany(
      { order: { $gt: orderToRemove } },
      { $inc: { order: -1 } }
    );
    
    res.json({ message: 'FAQ removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get FAQ categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFAQCategories = async (req, res) => {
  try {
    const categories = ['booking', 'payment', 'locations', 'bikes', 'safety', 'account', 'other'];
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
