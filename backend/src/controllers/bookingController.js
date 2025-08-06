const { Booking, Bike, User, Payment, Partner } = require('../models');

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
    
    // Date filters - updated to use model structure
    if (startDate || endDate) {
      filter['dates.startDate'] = {};
      if (startDate) filter['dates.startDate'].$gte = new Date(startDate);
      if (endDate) filter['dates.endDate'] = { $lte: new Date(endDate) };
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
    console.log('=== BOOKING CREATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { bikeId, startTime, endTime, deliveryAddress } = req.body;
    const userId = req.user.id; // From auth middleware
    
    console.log('Extracted data:', { bikeId, startTime, endTime, deliveryAddress, userId });
    
    // Validate bike exists and is available
    const bike = await Bike.findById(bikeId);
    console.log('Found bike:', bike ? 'Yes' : 'No');
    
    if (!bike) {
      console.log('ERROR: Bike not found');
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    console.log('Bike details:', {
      id: bike._id,
      name: bike.name,
      partnerId: bike.partnerId,
      availability: bike.availability
    });
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    if (!bike.availability.status) {
      console.log('ERROR: Bike is not available');
      return res.status(400).json({ message: 'Bike is not available for booking' });
    }
    
    // Check if bike is already booked for the specified time
    const overlappingBookings = await Booking.find({
      bikeId,
      status: { $in: ['requested', 'confirmed', 'active'] },
      $or: [
        { 'dates.startDate': { $lt: new Date(endTime), $gte: new Date(startTime) } },
        { 'dates.endDate': { $gt: new Date(startTime), $lte: new Date(endTime) } },
        { 
          'dates.startDate': { $lte: new Date(startTime) }, 
          'dates.endDate': { $gte: new Date(endTime) } 
        }
      ]
    });
    
    if (overlappingBookings.length > 0) {
      return res.status(400).json({ message: 'Bike is already booked for this time period' });
    }
    
    // Calculate duration and determine package
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);
    const durationDays = Math.ceil(durationHours / 24);
    
    let packageInfo;
    if (durationDays <= 7) {
      packageInfo = {
        id: 'day',
        name: 'Daily Package',
        features: ['Basic insurance', 'Roadside assistance']
      };
    } else if (durationDays <= 30) {
      packageInfo = {
        id: 'week',
        name: 'Weekly Package',
        features: ['Basic insurance', 'Roadside assistance', 'Free maintenance']
      };
    } else {
      packageInfo = {
        id: 'month',
        name: 'Monthly Package',
        features: ['Full insurance', 'Roadside assistance', 'Free maintenance', 'Priority support']
      };
    }
    
    // Calculate pricing
    let basePrice = 0;
    if (durationHours <= 24) {
      basePrice = bike.pricing.perHour * durationHours;
    } else {
      basePrice = bike.pricing.perDay * durationDays;
    }
    
    const insurance = basePrice * 0.1; // 10% insurance
    const extras = 0; // No extras for now
    const discount = 0; // No discount for now
    const total = basePrice + insurance + extras - discount;
    
    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Create booking with proper model structure
    const booking = new Booking({
      bookingNumber,
      userId,
      bikeId,
      partnerId: bike.partnerId,
      package: packageInfo,
      pricing: {
        basePrice,
        insurance,
        extras,
        discount,
        total
      },
      dates: {
        startDate: start,
        endDate: end
      },
      locations: {
        pickup: deliveryAddress || bike.location,
        dropoff: deliveryAddress || bike.location
      },
      status: 'requested'
    });
    
    await booking.save();
    
    res.status(201).json(booking);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all bookings for the authenticated partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyBookings = async (req, res) => {
  try {
    // Get user details to check role
    const user = await User.findById(req.user.id);
    console.log(`User role: ${user.role}, User's Partner ID: ${req.user.partnerId}`);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(user.role === 'user') {
      // Users can only see their own bookings
      const bookings = await Booking.find({ userId: req.user.id })
        .populate('bikeId', 'name type brand model images pricing location')
        .populate('partnerId', 'companyName email phone location');
      
      // Return empty array if no bookings found (don't return 404)
      res.json(bookings || []);
    } else if (user.role === 'partner') { // For partners, use their own partnerId
      if (!req.user.partnerId) {
        return res.status(403).json({ message: 'Partner profile not found.' });
      }
      
      // Get all bookings for the authenticated partner
      const bookings = await Booking.find({ partnerId: req.user.partnerId })
        .populate('userId', 'firstName lastName email phone')
        .populate('bikeId', 'name type brand model images pricing location')
        .populate('partnerId', 'companyName email phone location')
        .sort({ createdAt: -1 });
      
      res.json(bookings);
    } else if (user.role === 'admin') {
      // Admins can see all bookings (or implement specific admin logic)
      const bookings = await Booking.find({})
        .populate('userId', 'firstName lastName email phone')
        .populate('bikeId', 'name type brand model images pricing location')
        .populate('partnerId', 'companyName email phone location')
        .sort({ createdAt: -1 });
      
      res.json(bookings);
    } else {
      return res.status(403).json({ message: 'Access denied. Invalid role.' });
    }
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all bookings for a specific partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBookingsByPartnerId = async (req, res) => {
  try {
    const partnerId = req.params.partnerId; // Get from URL params
    
    // Get user details to check role
    const user = await User.findById(req.user.id);
    console.log(`User role: ${user.role}`);
    console.log(`Requested Partner ID from URL: ${partnerId}`);
    console.log(`User's actual Partner ID from auth: ${req.user.partnerId}`);
    console.log(`Do they match? ${req.user.partnerId && req.user.partnerId.toString() === partnerId}`);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For partners, verify they can only access their own bookings
    if (user.role === 'partner') {
      // Check if the requested partnerId matches the authenticated user's partnerId
      if (!req.user.partnerId || req.user.partnerId.toString() !== partnerId) {
        return res.status(403).json({ message: 'Access denied. You can only view your own bookings.' });
      }
    }
    // Admins can access any partner's bookings (no additional check needed)
    
    // Get all bookings for the specified partner
    const bookings = await Booking.find({ partnerId })
      .populate('userId', 'firstName lastName email phone')
      .populate('bikeId', 'name type brand model images pricing location')
      .populate('partnerId', 'companyName email phone location')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings by partner error:', err);
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
    const validStatuses = ['requested', 'confirmed', 'active', 'completed', 'cancelled'];
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
      amount: booking.pricing.total,
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
    
    if (booking.status === 'active' || booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a booking that is active or completed' });
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
