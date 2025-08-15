const { Payment, Booking, User, Partner } = require('../models');
const firebaseAdmin = require('../config/firebase');

/**
 * Get all payments with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { userId, partnerId, bookingId, status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (partnerId) filter.partnerId = partnerId;
    if (bookingId) filter.bookingId = bookingId;
    if (status) filter.status = status;
    
    // Date filters
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('partnerId', 'companyName email')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('partnerId', 'companyName email contact')
      .populate('bookingId');
      
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Process a new payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, transactionId } = req.body;
    const userId = req.user.id;
    
    // Validate booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Ensure user is authorized to make payment for this booking
    if (booking.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to make payment for this booking' });
    }
    
    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ bookingId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this booking' });
    }
    
    // Create payment record
    const payment = new Payment({
      bookingId,
      userId,
      partnerId: booking.partnerId,
      amount: booking.pricing.totalAmount,
      paymentMethod,
      transactionId,
      status: 'completed',
      createdAt: new Date()
    });
    
    await payment.save();
    
    // Update booking with payment information
    booking.paymentId = payment._id;
    booking.paymentStatus = 'paid';
    await booking.save();
    
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment status
    payment.status = status;
    payment.updatedAt = new Date();
    
    await payment.save();
    
    // If payment is refunded, update booking payment status accordingly
    if (status === 'refunded') {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: 'refunded'
      });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Process refund
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processRefund = async (req, res) => {
  try {
    const { reason, amount } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Only allow refunding completed payments
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }
    
    // Update payment status to refunded
    payment.status = 'refunded';
    payment.refundDetails = {
      amount: amount || payment.amount,
      reason,
      date: new Date(),
      processedBy: req.user.id
    };
    payment.updatedAt = new Date();
    
    await payment.save();
    
    // Update booking payment status to refunded
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: 'refunded'
    });
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get payment statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Define time range for stats
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Add partner filter for partner users
    if (req.user.role === 'partner') {
      const partner = await Partner.findOne({ userId: req.user.id });
      if (partner) {
        filter.partnerId = partner._id;
      }
    }
    
    // Total revenue
    const completedPayments = await Payment.find({
      ...filter,
      status: 'completed'
    });
    
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Count by payment methods
    const paymentMethodCounts = await Payment.aggregate([
      { $match: { ...filter, status: 'completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    
    // Format response
    const statistics = {
      totalRevenue,
      completedPaymentsCount: completedPayments.length,
      paymentMethods: paymentMethodCounts.map(pm => ({
        method: pm._id,
        count: pm.count,
        total: pm.total
      }))
    };
    
    res.json(statistics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get pending payments for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPendingPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find bookings that are confirmed but not yet paid
    const confirmedBookings = await Booking.find({
      userId,
      status: 'confirmed',
      paymentStatus: 'pending'
    })
    .populate('bikeId', 'name images')
    .populate('partnerId', 'companyName')
    .sort({ createdAt: -1 });

    // Transform to payment pending format
    const pendingPayments = confirmedBookings.map(booking => ({
      id: booking._id,
      bikeName: booking.bikeId?.name || 'Unknown Bike',
      bikeImage: booking.bikeId?.images?.[0],
      partnerName: booking.partnerId?.companyName || 'Unknown Partner',
      startDate: booking.dates.startDate,
      endDate: booking.dates.endDate,
      totalAmount: booking.pricing.totalAmount,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      bookingNumber: booking._id.toString().slice(-8).toUpperCase(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }));

    res.json({ pendingPayments });
  } catch (err) {
    console.error('Error fetching pending payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Process initial payment for a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processInitialPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;
    
    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('partnerId');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to pay for this booking' 
      });
    }
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking must be confirmed before payment' 
      });
    }
    
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment already completed for this booking' 
      });
    }
    
    // Simulate payment processing (in real app, integrate with payment gateway)
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update booking payment info
    booking.paymentInfo = {
      method: paymentMethod,
      transactionId,
      paid: true,
      paymentDate: new Date(),
      ...paymentDetails
    };
    booking.paymentStatus = 'paid';
    booking.status = 'active'; // Change status from confirmed to active
    
    await booking.save();
    
    // Create payment record
    const payment = new Payment({
      bookingId,
      userId,
      partnerId: booking.partnerId._id,
      amount,
      paymentMethod,
      transactionId,
      status: 'completed',
      createdAt: new Date()
    });
    
    await payment.save();
    
    // Send real-time notification to partner
    if (booking.partnerId && firebaseAdmin) {
      try {
        const db = firebaseAdmin.firestore();
        await db.collection('realtimeEvents').add({
          type: 'PAYMENT_COMPLETED',
          userId: booking.partnerId.userId, // Partner's user ID
          targetUserId: booking.partnerId.userId,
          userRole: 'partner',
          data: {
            bookingId: booking._id,
            amount,
            transactionId,
            paymentMethod,
            customerName: req.user.firstName + ' ' + req.user.lastName,
            timestamp: new Date().toISOString()
          },
          processed: false,
          timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });
      } catch (error) {
        console.error('Error sending real-time notification to partner:', error);
        // Don't fail the payment if notification fails
      }
    }
    
    res.json({
      success: true,
      transactionId,
      paymentStatus: 'completed',
      message: 'Payment processed successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
    
  } catch (err) {
    console.error('Error processing initial payment:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed' 
    });
  }
};
