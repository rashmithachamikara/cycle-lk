const { Booking, Bike, User, Payment } = require('../models');

/**
 * Get all bookings with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { userId, bikeId, partnerId, status, startDate, endDate } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (bikeId) filter.bikeId = bikeId;
    if (partnerId) filter.partnerId = partnerId;
    if (status) filter.status = status;
    
    // Date filters
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.endTime.$lte = new Date(endDate);
    }
    
    // Create the query
    const bookings = await Booking.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('bikeId', 'name type brand model images pricing')
      .populate('partnerId', 'companyName email phone location')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('bikeId', 'name type brand model images pricing')
      .populate('partnerId', 'companyName email phone location')
      .populate('paymentId');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createBooking = async (req, res) => {
  try {
    const { bikeId, startTime, endTime, deliveryAddress } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Validate bike exists and is available
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    if (!bike.availability.status) {
      return res.status(400).json({ message: 'Bike is not available for booking' });
    }
    
    // Check if bike is already booked for the specified time
    const overlappingBookings = await Booking.find({
      bikeId,
      status: { $in: ['confirmed', 'inProgress'] },
      $or: [
        { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { 
          startTime: { $lte: new Date(startTime) }, 
          endTime: { $gte: new Date(endTime) } 
        }
      ]
    });
    
    if (overlappingBookings.length > 0) {
      return res.status(400).json({ message: 'Bike is already booked for this time period' });
    }
    
    // Calculate duration and total cost
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60); // Duration in hours
    
    let basePrice = 0;
    
    // Calculate price based on hourly or daily rate
    if (durationHours <= 24) {
      basePrice = bike.pricing.perHour * durationHours;
    } else {
      const days = Math.ceil(durationHours / 24);
      basePrice = bike.pricing.perDay * days;
    }
    
    // Add delivery cost if applicable
    const deliveryCost = deliveryAddress ? bike.pricing.deliveryFee || 0 : 0;
    
    // Calculate total amount
    const totalAmount = basePrice + deliveryCost;
    
    // Create booking
    const booking = new Booking({
      userId,
      bikeId,
      partnerId: bike.partnerId,
      startTime,
      endTime,
      deliveryAddress,
      pricing: {
        basePrice,
        deliveryCost,
        totalAmount
      },
      status: 'pending'
    });
    
    await booking.save();
    
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update booking status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status is valid
    const validStatuses = ['pending', 'confirmed', 'inProgress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Update status
    booking.status = status;
    
    // Handle bike availability for cancellation or completion
    if (status === 'cancelled' || status === 'completed') {
      await Bike.findByIdAndUpdate(booking.bikeId, {
        'availability.status': true
      });
    } else if (status === 'confirmed') {
      // When booking is confirmed, set the bike as unavailable for the booking period
      await Bike.findByIdAndUpdate(booking.bikeId, {
        'availability.status': false
      });
    }
    
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Record payment for a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.recordPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Create payment record
    const payment = new Payment({
      bookingId,
      userId: booking.userId,
      partnerId: booking.partnerId,
      amount: booking.pricing.totalAmount,
      paymentMethod,
      transactionId,
      status: 'completed'
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
 * Cancel booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status === 'inProgress' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a booking that is in progress or completed' });
    }
    
    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    // Make bike available again
    await Bike.findByIdAndUpdate(booking.bikeId, {
      'availability.status': true
    });
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
