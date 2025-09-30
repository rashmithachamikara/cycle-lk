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
 * Get total monthly revenue from all earnings transactions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMonthlyTotalRevenue = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Default to current month if not specified
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // JS months are 0-based
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999); // Last day of month
    
    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
          category: 'earning', // Only earnings transactions
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          ownerEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'owner_earnings'] }, '$amount', 0]
            }
          },
          pickupEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'pickup_earnings'] }, '$amount', 0]
            }
          },
          platformFees: {
            $sum: {
              $cond: [{ $eq: ['$type', 'platform_fee'] }, '$amount', 0]
            }
          },
          bonusPayments: {
            $sum: {
              $cond: [{ $eq: ['$type', 'bonus_payment'] }, '$amount', 0]
            }
          },
          referralCommissions: {
            $sum: {
              $cond: [{ $eq: ['$type', 'referral_commission'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const revenue = aggregationResult[0] || {
      totalRevenue: 0,
      transactionCount: 0,
      ownerEarnings: 0,
      pickupEarnings: 0,
      platformFees: 0,
      bonusPayments: 0,
      referralCommissions: 0
    };

    // Get recent transactions for details
    const recentTransactions = await Transaction.find({
      category: 'earning',
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('partnerId', 'companyName')
      .populate('paymentId', 'amount paymentType')
      .populate('bookingId', 'bookingNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      ...revenue,
      period: {
        year: targetYear,
        month: targetMonth + 1,
        startDate,
        endDate
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching monthly total revenue:', error);
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

/**
 * Get monthly earnings for a partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerMonthlyEarnings = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { year, month } = req.query;
    
    // Authorization check: partners can only access their own data, admins can access any
    if (req.user.role === 'partner' && req.user.partnerId.toString() !== partnerId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own earnings.' });
    }
    
    // Default to current month if not specified
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // JS months are 0-based
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999); // Last day of month
    
    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
          partnerId: partnerId,
          category: 'earning',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
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

    const earnings = aggregationResult[0] || {
      totalEarnings: 0,
      transactionCount: 0,
      ownerEarnings: 0,
      pickupEarnings: 0
    };

    res.json({
      ...earnings,
      period: {
        year: targetYear,
        month: targetMonth + 1,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching partner monthly earnings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get daily revenue data for current month chart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerMonthlyRevenueChart = async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    // Authorization check: partners can only access their own data, admins can access any
    if (req.user.role === 'partner' && req.user.partnerId.toString() !== partnerId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own revenue data.' });
    }
    
    // Get current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const dailyRevenue = await Transaction.aggregate([
      {
        $match: {
          partnerId: partnerId,
          category: 'earning',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyEarnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Fill in missing days with zero earnings
    const daysInMonth = endDate.getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dailyRevenue.find(d => d._id === dateStr);
      
      chartData.push({
        date: dateStr,
        earnings: dayData ? dayData.dailyEarnings : 0,
        transactions: dayData ? dayData.transactionCount : 0
      });
    }

    res.json({
      chartData,
      period: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching partner monthly revenue chart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user's monthly earnings (for partners)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyMonthlyEarnings = async (req, res) => {
  try {
    // Only partners can access their own earnings
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied. Only partners can view their earnings.' });
    }

    const partnerId = req.user.partnerId;
    const { year, month } = req.query;
    
    // Default to current month if not specified
    const now = new Date();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // JS months are 0-based
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999); // Last day of month
    
    const aggregationResult = await Transaction.aggregate([
      {
        $match: {
          partnerId: partnerId,
          category: 'earning',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
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

    const earnings = aggregationResult[0] || {
      totalEarnings: 0,
      transactionCount: 0,
      ownerEarnings: 0,
      pickupEarnings: 0
    };

    res.json({
      ...earnings,
      period: {
        year: targetYear,
        month: targetMonth + 1,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching my monthly earnings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user's monthly revenue chart (for partners)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyMonthlyRevenueChart = async (req, res) => {
  try {
    // Only partners can access their own chart data
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied. Only partners can view their revenue chart.' });
    }

    const partnerId = req.user.partnerId;
    
    // Get current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const dailyRevenue = await Transaction.aggregate([
      {
        $match: {
          partnerId: partnerId,
          category: 'earning',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          dailyEarnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Fill in missing days with zero earnings
    const daysInMonth = endDate.getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dailyRevenue.find(d => d._id === dateStr);
      
      chartData.push({
        date: dateStr,
        earnings: dayData ? dayData.dailyEarnings : 0,
        transactions: dayData ? dayData.transactionCount : 0
      });
    }

    res.json({
      chartData,
      period: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching my monthly revenue chart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user's transaction history (for partners)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyTransactions = async (req, res) => {
  try {
    // Only partners can access their own transactions
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied. Only partners can view their transactions.' });
    }

    const partnerId = req.user.partnerId;
    const { page = 1, limit = 20, type, category, startDate, endDate, minAmount, maxAmount } = req.query;

    // Build filter
    const filter = { partnerId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
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
      currentPage: parseInt(page),
      totalCount
    });
  } catch (error) {
    console.error('Error fetching my transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user's revenue chart with flexible period grouping (for partners)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyRevenueChart = async (req, res) => {
  try {
    // Only partners can access their own chart data
    if (req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied. Only partners can view their revenue chart.' });
    }

    const partnerId = req.user.partnerId;
    const { period = 'day', limit = 7, startDate, endDate } = req.query;

    // Validate period
    const validPeriods = ['day', 'week', 'month'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Must be one of: day, week, month' });
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 365) {
      return res.status(400).json({ message: 'Invalid limit. Must be a number between 1 and 365' });
    }

    let startDateObj, endDateObj;

    if (startDate && endDate) {
      // Custom date range
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use ISO date strings (YYYY-MM-DD)' });
      }
    } else {
      // Default to last N periods from today
      const now = new Date();
      endDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (period === 'day') {
        startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (limitNum - 1), 0, 0, 0, 0);
      } else if (period === 'week') {
        // Start from the beginning of the week that contains the date limitNum weeks ago
        const weeksAgo = new Date(now);
        weeksAgo.setDate(now.getDate() - (limitNum * 7) + 1); // +1 to include current week
        startDateObj = new Date(weeksAgo.getFullYear(), weeksAgo.getMonth(), weeksAgo.getDate(), 0, 0, 0, 0);
      } else if (period === 'month') {
        // Start from the beginning of the month limitNum months ago
        startDateObj = new Date(now.getFullYear(), now.getMonth() - (limitNum - 1), 1, 0, 0, 0, 0);
      }
    }

    // Build aggregation pipeline based on period
    let groupByFormat, dateIncrement;

    if (period === 'day') {
      groupByFormat = '%Y-%m-%d';
      dateIncrement = 1; // 1 day
    } else if (period === 'week') {
      groupByFormat = '%Y-%U'; // Year-week format (Sunday as start of week)
      dateIncrement = 7; // 7 days
    } else if (period === 'month') {
      groupByFormat = '%Y-%m';
      dateIncrement = 30; // Approximate month
    }

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          partnerId: partnerId,
          category: 'earning',
          createdAt: {
            $gte: startDateObj,
            $lte: endDateObj
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupByFormat, date: '$createdAt' }
          },
          earnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Generate all periods in the range and fill missing ones with zero
    const chartData = [];
    const currentDate = new Date(startDateObj);

    while (currentDate <= endDateObj) {
      let periodKey;

      if (period === 'day') {
        periodKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'week') {
        const year = currentDate.getFullYear();
        const weekNum = Math.ceil(((currentDate - new Date(year, 0, 1)) / 86400000 + 1) / 7);
        periodKey = `${year}-${String(weekNum).padStart(2, '0')}`;
      } else if (period === 'month') {
        periodKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      }

      const periodData = revenueData.find(d => d._id === periodKey);

      chartData.push({
        date: periodKey,
        earnings: periodData ? periodData.earnings : 0,
        transactions: periodData ? periodData.transactionCount : 0
      });

      // Increment date based on period
      if (period === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (period === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    res.json({
      chartData,
      period: {
        type: period,
        limit: limitNum,
        startDate: startDateObj,
        endDate: endDateObj
      }
    });
  } catch (error) {
    console.error('Error fetching my revenue chart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get platform revenue chart with flexible period grouping and filtering (for admins)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPlatformRevenueChart = async (req, res) => {
  try {
    // Only admins can access platform charts
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { period = 'day', limit, startDate, endDate, filter = 'all' } = req.query;
    const limitNum = limit ? parseInt(limit) : 7;

    // Parse dates
    let startDateObj, endDateObj;

    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
    } else {
      // Default to last N periods from today
      const now = new Date();
      endDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (period === 'day') {
        startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (limitNum - 1), 0, 0, 0, 0);
      } else if (period === 'week') {
        const weeksAgo = new Date(now);
        weeksAgo.setDate(now.getDate() - (limitNum * 7) + 1);
        startDateObj = new Date(weeksAgo.getFullYear(), weeksAgo.getMonth(), weeksAgo.getDate(), 0, 0, 0, 0);
      } else if (period === 'month') {
        startDateObj = new Date(now.getFullYear(), now.getMonth() - (limitNum - 1), 1, 0, 0, 0, 0);
      }
    }

    // Build match criteria based on filter
    let matchCriteria = {
      category: 'earning',
      createdAt: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    };

    // Apply filter for transaction types
    if (filter === 'platform_fee') {
      matchCriteria.type = 'platform_fee';
    } else if (filter === 'owner_earnings') {
      matchCriteria.type = 'owner_earnings';
    } else if (filter === 'pickup_earnings') {
      matchCriteria.type = 'pickup_earnings';
    } else if (filter === 'partner_earnings') {
      matchCriteria.type = { $in: ['owner_earnings', 'pickup_earnings'] };
    }
    // 'all' includes all earning transaction types

    // Build aggregation pipeline based on period
    let groupByFormat;

    if (period === 'day') {
      groupByFormat = '%Y-%m-%d';
    } else if (period === 'week') {
      groupByFormat = '%Y-%U'; // Year-week format (Sunday as start of week)
    } else if (period === 'month') {
      groupByFormat = '%Y-%m';
    }

    const revenueData = await Transaction.aggregate([
      {
        $match: matchCriteria
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupByFormat, date: '$createdAt' }
          },
          earnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          ownerEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'owner_earnings'] }, '$amount', 0]
            }
          },
          pickupEarnings: {
            $sum: {
              $cond: [{ $eq: ['$type', 'pickup_earnings'] }, '$amount', 0]
            }
          },
          platformFees: {
            $sum: {
              $cond: [{ $eq: ['$type', 'platform_fee'] }, '$amount', 0]
            }
          },
          bonusPayments: {
            $sum: {
              $cond: [{ $eq: ['$type', 'bonus_payment'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Generate all periods in the range and fill missing ones with zero
    const chartData = [];
    const currentDate = new Date(startDateObj);

    while (currentDate <= endDateObj) {
      let periodKey;

      if (period === 'day') {
        periodKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (period === 'week') {
        const year = currentDate.getFullYear();
        const weekNum = Math.ceil(((currentDate - new Date(year, 0, 1)) / 86400000 + 1) / 7);
        periodKey = `${year}-${String(weekNum).padStart(2, '0')}`;
      } else if (period === 'month') {
        periodKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      }

      const periodData = revenueData.find(d => d._id === periodKey);

      chartData.push({
        date: periodKey,
        earnings: periodData ? periodData.earnings : 0,
        transactions: periodData ? periodData.transactionCount : 0,
        ownerEarnings: periodData ? periodData.ownerEarnings : 0,
        pickupEarnings: periodData ? periodData.pickupEarnings : 0,
        platformFees: periodData ? periodData.platformFees : 0,
        bonusPayments: periodData ? periodData.bonusPayments : 0
      });

      // Increment date based on period
      if (period === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (period === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    res.json({
      chartData,
      totalEarnings: chartData.reduce((sum, item) => sum + item.earnings, 0),
      period: {
        type: period,
        limit: limitNum,
        startDate: startDateObj,
        endDate: endDateObj,
        filter
      }
    });
  } catch (error) {
    console.error('Error fetching platform revenue chart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};