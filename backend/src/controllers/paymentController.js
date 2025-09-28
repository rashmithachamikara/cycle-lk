const { Payment, Booking, User, Partner } = require('../models');
const transactionController = require('./transactionController');
const firebaseAdmin = require('../config/firebase');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const DOMAIN = 'http://localhost:5173'; // Replace with your frontend domain

// Payment configuration
const PAYMENT_CONFIG = {
  INITIAL_PAYMENT_PERCENTAGE: 0.2, // 20% initial payment
  REMAINING_PAYMENT_PERCENTAGE: 0.8, // 80% remaining payment
};
const REVENUE_SHARE_CONFIG = {
  OWNER_PARTNER_PERCENTAGE: 0.70,    // 70%
  PICKUP_PARTNER_PERCENTAGE: 0.20,   // 20%
  PLATFORM_PERCENTAGE: 0.10          // 10%
};
/**
 * Calculate payment amounts for a booking
 */
const calculatePaymentAmounts = (totalAmount) => {
  const initialAmount = Math.round(totalAmount * PAYMENT_CONFIG.INITIAL_PAYMENT_PERCENTAGE * 100) / 100;
  const remainingAmount = Math.round(totalAmount * PAYMENT_CONFIG.REMAINING_PAYMENT_PERCENTAGE * 100) / 100;
  
  return {
    totalAmount,
    initialAmount,
    remainingAmount,
    initialPercentage: PAYMENT_CONFIG.INITIAL_PAYMENT_PERCENTAGE * 100,
    remainingPercentage: PAYMENT_CONFIG.REMAINING_PAYMENT_PERCENTAGE * 100
  };
};

const updatePartnerEarnings = async (payment) => {
  try {
    const booking = await Booking.findById(payment.bookingId)
      .populate('partnerId currentBikePartnerId');
    
    if (!booking) {
      console.error('Booking not found for payment:', payment._id);
      return { success: false, error: 'Booking not found' };
    }
    
    // Use actual payment amount for revenue sharing, not total booking amount
    const totalAmount = payment.amount;
    
    // Calculate earnings for each partner
    const ownerEarnings = Math.round(totalAmount * REVENUE_SHARE_CONFIG.OWNER_PARTNER_PERCENTAGE * 100) / 100;
    const pickupEarnings = Math.round(totalAmount * REVENUE_SHARE_CONFIG.PICKUP_PARTNER_PERCENTAGE * 100) / 100;
    const platformEarnings = Math.round(totalAmount * REVENUE_SHARE_CONFIG.PLATFORM_PERCENTAGE * 100) / 100;
    
    console.log('Revenue sharing calculation:', {
      totalAmount,
      ownerEarnings,
      pickupEarnings,
      platformEarnings,
      ownerPartnerId: booking.partnerId._id,
      pickupPartnerId: booking.currentBikePartnerId?._id
    });

    // Use transaction controller to create revenue share transactions
    const transactions = await transactionController.createRevenueShareTransactions({
      payment,
      booking,
      ownerEarnings,
      pickupEarnings,
      platformEarnings
    });
    
    return {
      success: true,
      ownerEarnings,
      pickupEarnings,
      platformEarnings,
      transactions: transactions.map(t => t._id)
    };
    
  } catch (error) {
    console.error('Error updating partner earnings:', error);
    return { success: false, error: error.message };
  }
};



/**
 * Get payment summary for a booking
 */
const getBookingPaymentSummary = async (bookingId) => {
  const payments = await Payment.find({ bookingId }).sort({ createdAt: 1 });
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  const totalBookingAmount = booking.pricing.total;
  const paymentAmounts = calculatePaymentAmounts(totalBookingAmount);
  
  const initialPayment = payments.find(p => p.paymentType === 'initial');
  const remainingPayment = payments.find(p => p.paymentType === 'remaining');
  const additionalChargesPayments = payments.filter(p => p.paymentType === 'additional_charges');
  
  const totalAdditionalCharges = additionalChargesPayments.reduce((sum, payment) => {
    return sum + (payment.additionalCharges?.reduce((chargeSum, charge) => chargeSum + charge.amount, 0) || 0);
  }, 0);
  
  return {
    booking,
    totalBookingAmount,
    paymentAmounts,
    payments: {
      initial: initialPayment,
      remaining: remainingPayment,
      additionalCharges: additionalChargesPayments
    },
    status: {
      initialPaid: !!initialPayment && initialPayment.status === 'completed',
      remainingPaid: !!remainingPayment && remainingPayment.status === 'completed',
      totalAdditionalCharges,
      isFullyPaid: !!initialPayment && !!remainingPayment && 
                   initialPayment.status === 'completed' && 
                   remainingPayment.status === 'completed'
    }
  };
};

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
      method: paymentMethod, // For backward compatibility
      transactionId,
      status: 'completed',
      createdAt: new Date()
    });
    
    await payment.save();
    
    // Update booking with payment information
    booking.paymentId = payment._id;
    booking.paymentStatus = 'paid';
    await booking.save();
    await updatePartnerEarnings(payment);
    
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
      paymentStatus: { $in: ['pending', 'partial_paid'] }
    })
    .populate('bikeId', 'name images')
    .populate('partnerId', 'companyName')
    .sort({ createdAt: -1 });

    // Transform to payment pending format
    const pendingPayments = confirmedBookings.map(booking => {
      console.log('Processing booking:', {
        id: booking._id,
        bikeId: booking.bikeId?._id,
        bikeName: booking.bikeId?.name,
        images: booking.bikeId?.images,
        imageUrl: booking.bikeId?.images?.[0]?.url
      });
      
      return {
        id: booking._id,
        bikeName: booking.bikeId?.name || 'Unknown Bike',
        bikeImage: booking.bikeId?.images?.[0]?.url || null,
        bikeImages: booking.bikeId?.images?.map(img => img.url) || [],
        partnerName: booking.partnerId?.companyName || 'Unknown Partner',
        startDate: booking.dates.startDate,
        endDate: booking.dates.endDate,
        totalAmount: booking.pricing.total * 0.2,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        bookingNumber: booking._id.toString().slice(-8).toUpperCase(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };
    });
    console.log('Pending payments for user:', userId, pendingPayments);

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
    
    // Debug logging
    console.log('Payment request data:', {
      bookingId,
      amount,
      paymentMethod,
      userId
    });
    
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
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid payment amount is required' 
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment method is required' 
      });
    }
    
    if (!booking.partnerId || !booking.partnerId._id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Partner information is missing from booking' 
      });
    }
    
    // Calculate payment amounts
    const totalBookingAmount = booking.pricing.total;
    const paymentAmounts = calculatePaymentAmounts(totalBookingAmount);
    
    // Validate that the amount matches expected initial payment
    if (Math.abs(amount - paymentAmounts.initialAmount) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid initial payment amount. Expected: ${paymentAmounts.initialAmount}, Received: ${amount}` 
      });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Bike Rental - ${booking.bikeId?.name || 'Bike Booking'}`,
              description: `Initial payment (${paymentAmounts.initialPercentage}%) for booking #${booking.bookingNumber}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents and ensure integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancel_url: `${DOMAIN}/payment-cancel?bookingId=${bookingId}`,
      metadata: {
        bookingId: bookingId,
        userId: userId,
        partnerId: booking.partnerId._id.toString(),
        paymentType: 'initial',
        totalBookingAmount: totalBookingAmount.toString(),
        paymentPercentage: paymentAmounts.initialPercentage.toString()
      },
      customer_email: req.user.email,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    });

    console.log('Stripe session created:', {
      sessionId: session.id,
      sessionUrl: session.url,
      bookingId,
      amount
    });
    
    // Update booking with session info (but don't mark as paid yet)
    booking.paymentInfo = {
      method: paymentMethod,
      stripeSessionId: session.id,
      paid: false, // Will be updated after successful payment
      sessionCreatedAt: new Date(),
      ...paymentDetails
    };
    booking.paymentStatus = 'processing'; // Intermediate status

    // booking.payments.initial = {
    //   ...booking.payments.initial,
    //   status: 'completed',
    // };

    await booking.save();
    

    
    // Return the session URL for frontend redirect
    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      paymentStatus: 'processing',
      message: 'Stripe session created successfully',
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

/**
 * Verify Stripe session status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      sessionId: session.id,
      metadata: session.metadata
    });
    
  } catch (err) {
    console.error('Error verifying Stripe session:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify session' 
    });
  }
};

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Add this to your .env file

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * Handle successful checkout session completion
 */

async function handleCheckoutSessionCompleted(session) {
  try {
    const { bookingId, userId, partnerId, paymentType } = session.metadata;
    
    // Get booking and update payment status
    const booking = await Booking.findById(bookingId).populate('partnerId currentBikePartnerId');
    if (!booking) {
      console.error('Booking not found for session:', session.id);
      return;
    }

    // Generate transaction ID
    const transactionId = session.payment_intent || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (paymentType === 'initial') {
      // Handle initial booking payment
      const totalBookingAmount = parseFloat(session.metadata.totalBookingAmount);
      const paymentPercentage = parseFloat(session.metadata.paymentPercentage);
      
      // Create initial payment record
      const payment = new Payment({
        bookingId,
        userId,
        partnerId,
        amount: session.amount_total / 100,
        totalBookingAmount,
        paymentPercentage,
        paymentType: 'initial',
        method: 'card',
        transactionId,
        status: 'completed',
        createdAt: new Date()
      });
      
      await payment.save();
      
      // Update booking with initial payment info
      booking.payments.initial = {
        ...booking.payments.initial,
        paymentId: payment._id,
        status: 'completed',
        transactionId,
        paidAt: new Date(),
        stripeSessionId: session.id
      };
      
      booking.paymentInfo = {
        ...booking.paymentInfo,
        transactionId,
        paid: true,
        paymentDate: new Date(),
        stripePaymentIntentId: session.payment_intent
      };
      
      booking.status = 'active';
      await booking.save();
      
      // UPDATE PARTNER EARNINGS - This is the key addition
      await updatePartnerEarnings(payment);
      
      console.log('Initial payment completed with earnings distribution:', { 
        bookingId, 
        amount: session.amount_total / 100, 
        transactionId 
      });
      
    } else if (paymentType === 'remaining') {
      // Handle remaining payment
      const totalBookingAmount = parseFloat(session.metadata.totalBookingAmount);
      const paymentPercentage = parseFloat(session.metadata.paymentPercentage);
      const additionalCharges = session.metadata.additionalCharges ? 
        JSON.parse(session.metadata.additionalCharges) : [];
      const relatedPaymentId = session.metadata.relatedPaymentId;
      
      // Create remaining payment record
      const payment = new Payment({
        bookingId,
        userId,
        partnerId,
        amount: session.amount_total / 100,
        totalBookingAmount,
        paymentPercentage,
        paymentType: 'remaining',
        relatedPaymentId,
        method: 'card',
        transactionId,
        status: 'completed',
        additionalCharges,
        createdAt: new Date()
      });
      
      await payment.save();
    
      // Update booking with remaining payment info
      booking.payments.remaining = {
        ...booking.payments.remaining,
        paymentId: payment._id,
        status: 'completed',
        transactionId,
        paidAt: new Date(),
        stripeSessionId: session.id,
        additionalCharges
      };
      
      booking.status = 'completed';
      await booking.save();
      
      // UPDATE PARTNER EARNINGS FOR REMAINING PAYMENT
      await updatePartnerEarnings(payment);
      
      console.log('Remaining payment completed with earnings distribution:', { 
        bookingId, 
        amount: session.amount_total / 100, 
        transactionId 
      });
    }

       // Send real-time notification to partner
    if (booking.partnerId && firebaseAdmin) {
      try {
        const db = firebaseAdmin.firestore();
        await db.collection('realtimeEvents').add({
          type: 'PAYMENT_COMPLETED',
          userId: booking.partnerId.userId,
          targetUserId: booking.partnerId.userId,
          userRole: 'partner',
          data: {
            bookingId: booking._id,
            amount: session.amount_total / 100,
            transactionId,
            paymentMethod: 'card',
            customerName: session.customer_email,
            timestamp: new Date().toISOString()
          },
          processed: false,
          timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      } catch (error) {
        console.error('Error sending real-time notification to partner:', error);
      }
    }
    
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}
/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session) {
  try {
    const { bookingId } = session.metadata;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error('Booking not found for expired session:', session.id);
      return;
    }

    // Reset payment status if it was processing
    if (booking.paymentStatus === 'processing') {
      booking.paymentStatus = 'failed';
      await booking.save();
    }

    console.log('Checkout session expired for booking:', bookingId);
  } catch (error) {
    console.error('Error handling checkout session expired:', error);
  }
}

/**
 * Process remaining payment for a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processRemainingPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, additionalCharges } = req.body;
    const userId = req.user.id;
    
    // Get booking payment summary
    const paymentSummary = await getBookingPaymentSummary(bookingId);
    const { booking, paymentAmounts, status } = paymentSummary;
    
    // Validate user is authorized to process payment for this booking
    // Either the booking owner (customer) or the dropoff partner can process remaining payment
    const isBookingOwner = booking.userId.toString() === userId;
    const isDropoffPartner = req.user.partnerId && booking.dropoffPartnerId && 
                           booking.dropoffPartnerId.toString() === req.user.partnerId.toString();
    
    if (!isBookingOwner && !isDropoffPartner) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to pay for this booking' 
      });
    }
    
    // Check if initial payment is completed
    if (booking.payments.initial.status !== 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Initial payment must be completed before remaining payment' 
      });
    }
    
    // Check if remaining payment already completed
    if (booking.payments.remaining.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Remaining payment already completed' 
      });
    }
    
    // Calculate total amount including additional charges
    const additionalChargesTotal = (additionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0);
    const totalAmount = paymentAmounts.remainingAmount + additionalChargesTotal;
    
    if (paymentMethod === 'cash') {
      // Process cash payment directly
      const initialPayment = paymentSummary.payments.initial;
      
      const payment = new Payment({
        bookingId,
        userId,
        partnerId: isDropoffPartner ? booking.dropoffPartnerId : booking.partnerId,
        amount: totalAmount,
        totalBookingAmount: paymentAmounts.totalAmount,
        paymentPercentage: paymentAmounts.remainingPercentage,
        paymentType: 'remaining',
        relatedPaymentId: initialPayment._id,
        method: 'cash',
        status: 'completed',
        additionalCharges: additionalCharges || [],
        transactionId: `CASH_REMAINING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
      });
      
      await payment.save();
      
      // Update booking remaining payment info
      booking.payments.remaining = {
        ...booking.payments.remaining,
        paymentId: payment._id,
        status: 'completed',
        transactionId: payment.transactionId,
        paidAt: new Date(),
        additionalCharges: additionalCharges || []
      };
      
      booking.status = 'completed';
      await booking.save(); // paymentStatus will be auto-updated to 'fully_paid'
      await updatePartnerEarnings(payment);
      res.json({
        success: true,
        paymentStatus: 'completed',
        transactionId: payment.transactionId,
        message: 'Remaining payment completed successfully',
        paymentSummary: await getBookingPaymentSummary(bookingId)
      });
      
    } else if (paymentMethod === 'card') {
      // Create Stripe session for remaining payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Final Payment - Booking #${booking.bookingNumber}`,
                description: `Remaining payment (${paymentAmounts.remainingPercentage}%) + additional charges`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}&type=remaining`,
        cancel_url: `${DOMAIN}/payment-cancel?bookingId=${bookingId}&type=remaining`,
        metadata: {
          bookingId: bookingId,
          userId: userId,
          partnerId: (isDropoffPartner ? booking.dropoffPartnerId : booking.partnerId).toString(),
          paymentType: 'remaining',
          totalBookingAmount: paymentAmounts.totalAmount.toString(),
          paymentPercentage: paymentAmounts.remainingPercentage.toString(),
          additionalCharges: JSON.stringify(additionalCharges || []),
          relatedPaymentId: paymentSummary.payments.initial._id.toString()
        },
        customer_email: req.user.email,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      });
      
      res.json({
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        paymentStatus: 'processing',
        message: 'Stripe session created for remaining payment'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Use "cash" or "card"'
      });
    }
    
  } catch (err) {
    console.error('Error processing remaining payment:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed' 
    });
  }
};

/**
 * Get payment summary for a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBookingPaymentSummary = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    const paymentSummary = await getBookingPaymentSummary(bookingId);
    
    // Check if user is authorized to view this booking's payment info
    if (paymentSummary.booking.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to view payment information' 
      });
    }
    
    res.json({
      success: true,
      ...paymentSummary
    });
    
  } catch (err) {
    console.error('Error getting payment summary:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment summary' 
    });
  }
};

/**
 * Process drop-off cash payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processDropOffCashPayment = async (req, res) => {
  try {
    const { bookingId, amount, additionalCharges } = req.body;
    const partnerId = req.user.id;
    
    // Validate booking exists
    const booking = await Booking.findById(bookingId).populate('userId partnerId');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment amount' 
      });
    }
    
    // Generate transaction ID for cash payment
    const transactionId = `CASH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment record for additional charges
    const payment = new Payment({
      bookingId,
      userId: booking.userId._id,
      partnerId,
      amount,
      paymentMethod: 'cash',
      method: 'cash',
      transactionId,
      status: 'completed',
      additionalCharges: additionalCharges || [],
      createdAt: new Date()
    });
    
    await payment.save();

    await updatePartnerEarnings(payment);
    
    res.json({
      success: true,
      paymentStatus: 'completed',
      transactionId,
      message: 'Cash payment recorded successfully'
    });
    
  } catch (err) {
    console.error('Error processing drop-off cash payment:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed' 
    });
  }
};

/**
 * Process drop-off card payment via Stripe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processDropOffCardPayment = async (req, res) => {
  try {
    const { bookingId, amount, additionalCharges } = req.body;
    const partnerId = req.user.id;
    
    // Validate booking exists
    const booking = await Booking.findById(bookingId).populate('userId partnerId');
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment amount' 
      });
    }
    
    // Create Stripe checkout session for additional charges
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Additional Charges - Booking #${booking.bookingNumber || booking._id.toString().slice(-8).toUpperCase()}`,
              description: `Drop-off additional charges for bike rental`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/partner-dashboard/drop-bike?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}&payment=success`,
      cancel_url: `${DOMAIN}/partner-dashboard/drop-bike?bookingId=${bookingId}&payment=cancelled`,
      metadata: {
        bookingId: bookingId,
        partnerId: partnerId,
        userId: booking.userId._id.toString(),
        paymentType: 'dropoff_additional',
        additionalCharges: JSON.stringify(additionalCharges || [])
      },
      customer_email: booking.userId.email,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });
    
    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      paymentStatus: 'processing',
      message: 'Stripe session created successfully'
    });
    
  } catch (err) {
    console.error('Error processing drop-off card payment:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed' 
    });
  }
};
exports.getPartnerEarnings = async (req, res) => {
  try {
    const partnerId = req.user.partnerId || req.params.partnerId;
    
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: 'Partner ID is required'
      });
    }
    
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }
    
    // Get payment history for this partner
    const payments = await Payment.find({
      $or: [
        { partnerId: partnerId },
        // Also include payments where this partner was the pickup partner
        // This requires checking booking data
      ]
    })
    .populate('bookingId')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({
      success: true,
      earnings: partner.account,
      recentPayments: payments
    });
    
  } catch (error) {
    console.error('Error getting partner earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings data'
    });
  }
};

/**
 * Process initial payment for a booking (Development/Test Mode - skips Stripe)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processInitialPaymentDev = async (req, res) => {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      success: false, 
      message: 'This endpoint is only available in development mode' 
    });
  }

  try {
    const { bookingId, amount, paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;
    
    // Debug logging
    console.log('Payment request data (DEV MODE):', {
      bookingId,
      amount,
      paymentMethod,
      userId
    });
    
    // Validate booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('partnerId currentBikePartnerId');
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
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid payment amount is required' 
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment method is required' 
      });
    }
    
    if (!booking.partnerId || !booking.partnerId._id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Partner information is missing from booking' 
      });
    }
    
    // Calculate payment amounts
    const totalBookingAmount = booking.pricing.total;
    const paymentAmounts = calculatePaymentAmounts(totalBookingAmount);
    
    // Validate that the amount matches expected initial payment
    if (Math.abs(amount - paymentAmounts.initialAmount) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid initial payment amount. Expected: ${paymentAmounts.initialAmount}, Received: ${amount}` 
      });
    }
    
    // Generate transaction ID for dev payment
    const transactionId = `DEV_INITIAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create initial payment record
    const payment = new Payment({
      bookingId,
      userId,
      partnerId: booking.partnerId._id,
      amount,
      totalBookingAmount,
      paymentPercentage: paymentAmounts.initialPercentage,
      paymentType: 'initial',
      method: paymentMethod,
      transactionId,
      status: 'completed',
      createdAt: new Date()
    });
    
    await payment.save();
    
    // Update booking with initial payment info
    booking.payments.initial = {
      paymentId: payment._id,
      status: 'completed',
      transactionId,
      paidAt: new Date(),
      stripeSessionId: null // No Stripe session in dev mode
    };
    
    booking.paymentInfo = {
      method: paymentMethod,
      transactionId,
      paid: true,
      paymentDate: new Date(),
      stripePaymentIntentId: null, // No Stripe in dev mode
      ...paymentDetails
    };
    
    booking.status = 'active';
    await booking.save();
    
    // UPDATE PARTNER EARNINGS
    await updatePartnerEarnings(payment);
    
    console.log('Initial payment completed (DEV MODE) with earnings distribution:', { 
      bookingId, 
      amount, 
      transactionId 
    });
    
    // Send real-time notification to partner
    if (booking.partnerId && firebaseAdmin) {
      try {
        const db = firebaseAdmin.firestore();
        await db.collection('realtimeEvents').add({
          type: 'PAYMENT_COMPLETED',
          userId: booking.partnerId.userId,
          targetUserId: booking.partnerId.userId,
          userRole: 'partner',
          data: {
            bookingId: booking._id,
            amount,
            transactionId,
            paymentMethod,
            customerName: req.user.email,
            timestamp: new Date().toISOString()
          },
          processed: false,
          timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
      } catch (error) {
        console.error('Error sending real-time notification to partner:', error);
      }
    }
    
    // Return success response
    res.json({
      success: true,
      transactionId,
      paymentStatus: 'completed',
      message: 'Payment completed successfully (Development Mode)',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: 'paid'
      }
    });
    
  } catch (err) {
    console.error('Error processing initial payment (DEV MODE):', err);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed' 
    });
  }
};


