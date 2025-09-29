const { Transaction, Partner } = require('../models');

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Object} Created transaction
 */
exports.createTransaction = async (transactionData) => {
  try {
    const { partnerId, paymentId, bookingId, type, category, amount, description } = transactionData;
    
    const transaction = new Transaction({
      partnerId: partnerId || null,
      paymentId,
      bookingId,
      type,
      category,
      amount,
      description
    });

    const savedTransaction = await transaction.save();
    
    // Update partner totals if this is a partner transaction
    if (partnerId) {
      await exports.updatePartnerTotals(partnerId);
    }

    return savedTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Create multiple transactions for revenue sharing
 * @param {Object} paymentData - Payment and booking data for revenue sharing
 * @returns {Array} Array of created transactions
 */
exports.createRevenueShareTransactions = async (paymentData) => {
  try {
    const { payment, booking, ownerEarnings, pickupEarnings, platformEarnings } = paymentData;
    const transactions = [];

    // Create owner earnings transaction
    if (booking.partnerId && ownerEarnings > 0) {
      const ownerTransaction = await exports.createTransaction({
        partnerId: booking.partnerId._id,
        paymentId: payment._id,
        bookingId: booking._id,
        type: 'owner_earnings',
        category: 'earning',
        amount: ownerEarnings,
        description: `Owner earnings from booking #${booking.bookingNumber || booking._id.toString().slice(-8).toUpperCase()}`
      });
      transactions.push(ownerTransaction);
    }

    // Create pickup earnings transaction (if different partner)
    if (booking.currentBikePartnerId && pickupEarnings > 0) {
      const pickupPartnerId = booking.currentBikePartnerId._id;
      const ownerPartnerId = booking.partnerId._id;
      
      const pickupTransaction = await exports.createTransaction({
        partnerId: pickupPartnerId,
        paymentId: payment._id,
        bookingId: booking._id,
        type: 'pickup_earnings',
        category: 'earning',
        amount: pickupEarnings,
        description: `Pickup earnings from booking #${booking.bookingNumber || booking._id.toString().slice(-8).toUpperCase()}`
      });
      transactions.push(pickupTransaction);
    }

    // Create platform fee transaction
    if (platformEarnings > 0) {
      const platformTransaction = await exports.createTransaction({
        partnerId: null, // Platform transaction
        paymentId: payment._id,
        bookingId: booking._id,
        type: 'platform_fee',
        category: 'earning',
        amount: platformEarnings,
        description: `Platform fee from booking #${booking.bookingNumber || booking._id.toString().slice(-8).toUpperCase()}`
      });
      transactions.push(platformTransaction);
    }

    return transactions;
  } catch (error) {
    console.error('Error creating revenue share transactions:', error);
    throw error;
  }
};

/**
 * Update partner totals by aggregating their transactions
 * @param {String} partnerId - Partner ID
 * @returns {Object} Updated totals
 */
exports.updatePartnerTotals = async (partnerId) => {
  try {
    const aggregationResult = await Transaction.aggregate([
      { $match: { partnerId: partnerId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          ownerEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'owner_earnings'] }, '$amount', 0]
            }
          },
          pickupEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'pickup_earnings'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const totals = aggregationResult[0] || {
      totalEarnings: 0,
      ownerEarnings: 0,
      pickupEarnings: 0
    };

    await Partner.findByIdAndUpdate(partnerId, {
      'account.totalEarnings': totals.totalEarnings,
      'account.pendingAmount': totals.totalEarnings, // Assuming all earnings are pending until withdrawal
      'account.revenueBreakdown.ownerEarnings': totals.ownerEarnings,
      'account.revenueBreakdown.pickupEarnings': totals.pickupEarnings
    });

    console.log(`Updated partner ${partnerId} totals:`, totals);
    return totals;
  } catch (error) {
    console.error('Error updating partner totals:', error);
    throw error;
  }
};

/**
 * Get transaction history for a partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerTransactions = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { page = 1, limit = 20, type, category, startDate, endDate } = req.query;
    
    // Build filter
    const filter = { partnerId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('paymentId', 'amount paymentType status')
      .populate('bookingId', 'bookingNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching partner transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Calculate partner balance from transactions
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
exports.calculatePartnerBalance = async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const aggregationResult = await Transaction.aggregate([
      { $match: { partnerId: partnerId } },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$amount' },
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ['$category', 'earning'] }, '$amount', 0]
            }
          },
          totalDeductions: {
            $sum: {
              $cond: [{ $eq: ['$category', 'deduction'] }, '$amount', 0]
            }
          },
          ownerEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'owner_earnings'] }, '$amount', 0]
            }
          },
          pickupEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'pickup_earnings'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const balance = aggregationResult[0] || {
      totalBalance: 0,
      totalEarnings: 0,
      totalDeductions: 0,
      ownerEarnings: 0,
      pickupEarnings: 0
    };

    res.json(balance);
  } catch (error) {
    console.error('Error calculating partner balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get platform revenue from transactions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPlatformRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { partnerId: null, type: 'platform_fee' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const aggregationResult = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const revenue = aggregationResult[0] || {
      totalRevenue: 0,
      transactionCount: 0
    };

    // Get recent transactions for details
    const recentTransactions = await Transaction.find(filter)
      .populate('paymentId', 'amount paymentType')
      .populate('bookingId', 'bookingNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      ...revenue,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching platform revenue:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create manual transaction (for withdrawals, penalties, etc.)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createManualTransaction = async (req, res) => {
  try {
    const { partnerId, type, category, amount, description } = req.body;
    
    // Validate required fields
    if (!type || !category || !amount || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate category and amount consistency
    let finalAmount = amount;
    if (category === 'deduction' && amount > 0) {
      // Convert positive amount to negative for deductions
      finalAmount = -amount;
    } else if (category === 'earning' && amount < 0) {
      return res.status(400).json({ message: 'Earnings must have positive amounts' });
    }

    const transaction = await exports.createTransaction({
      partnerId: partnerId || null,
      type,
      category,
      amount: finalAmount,
      description
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating manual transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all transactions with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      partnerId, 
      type, 
      category, 
      startDate, 
      endDate 
    } = req.query;
    
    // Build filter
    const filter = {};
    if (partnerId) filter.partnerId = partnerId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('partnerId', 'companyName email')
      .populate('paymentId', 'amount paymentType status')
      .populate('bookingId', 'bookingNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id)
      .populate('partnerId', 'companyName email')
      .populate('paymentId', 'amount paymentType status')
      .populate('bookingId', 'bookingNumber');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};