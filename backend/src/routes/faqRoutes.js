const express = require('express');
const router = express.Router();
const { FAQ } = require('../models');

/**
 * @route   GET /api/faqs
 * @desc    Get all FAQs
 * @access  Public
 */
router.get('/', async (req, res) => {
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
});

/**
 * @route   GET /api/faqs/:id
 * @desc    Get FAQ by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
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
});

/**
 * @route   POST /api/faqs
 * @desc    Create a new FAQ
 * @access  Private/Admin
 */
router.post('/', async (req, res) => {
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
});

/**
 * @route   PUT /api/faqs/:id
 * @desc    Update an FAQ
 * @access  Private/Admin
 */
router.put('/:id', async (req, res) => {
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
});

/**
 * @route   PUT /api/faqs/:id/order
 * @desc    Update an FAQ's order
 * @access  Private/Admin
 */
router.put('/:id/order', async (req, res) => {
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
});

/**
 * @route   DELETE /api/faqs/:id
 * @desc    Delete an FAQ
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    const orderToRemove = faq.order;
    
    await faq.remove();
    
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
});

module.exports = router;
