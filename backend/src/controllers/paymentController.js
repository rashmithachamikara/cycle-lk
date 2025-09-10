const { Payment, Booking, User, Partner } = require('../models');
const firebaseAdmin = require('../config/firebase');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const DOMAIN = 'http://localhost:5173'; // Replace with your frontend domain

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
      totalAmount: booking.pricing.total * 0.2,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      bookingNumber: booking._id.toString().slice(-8).toUpperCase(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    }));
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
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Bike Rental - ${booking.bikeId?.name || 'Bike Booking'}`,
              description: `Initial payment for booking #${booking.bookingNumber}`,
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
        partnerId: booking.partnerId._id.toString()
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
    const { bookingId, userId, partnerId } = session.metadata;
    
    // Get booking and update payment status
    const booking = await Booking.findById(bookingId).populate('partnerId');
    if (!booking) {
      console.error('Booking not found for session:', session.id);
      return;
    }

    // Generate transaction ID
    const transactionId = session.payment_intent || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update booking
    booking.paymentInfo = {
      ...booking.paymentInfo,
      transactionId,
      paid: true,
      paymentDate: new Date(),
      stripePaymentIntentId: session.payment_intent
    };
    booking.paymentStatus = 'paid';
    booking.status = 'active';
    
    await booking.save();

    // Create payment record
    const payment = new Payment({
      bookingId,
      userId,
      partnerId,
      amount: session.amount_total / 100, // Convert from cents
      method: 'card',
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

    console.log('Payment completed successfully for booking:', bookingId);
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
