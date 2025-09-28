const { Booking, Bike, User, Payment, Partner, Notification } = require('../models');
const { notificationService } = require('../services/notificationService');
const firebaseAdmin = require('../config/firebase');

/**
 * Create a database notification for booking events
 */
 const createBookingNotification = async (booking, targetUserId, eventType) => {
  try {
    let notificationData = {
      userId: targetUserId,
      sentVia: ['app'],
      relatedTo: {
        type: 'booking',
        id: booking._id.toString()
      }
    };

    switch (eventType) {
      case 'BOOKING_CREATED':
        const userName = booking.userId?.firstName && booking.userId?.lastName 
          ? `${booking.userId.firstName} ${booking.userId.lastName}`
          : 'a customer';
        notificationData = {
          ...notificationData,
          type: 'partner',
          title: 'New Booking Request',
          message: `New booking request for ${booking.bikeId?.name || 'bike'} from ${userName}`
        };
        break;

        case 'NEW_BOOKING_CREATED_FOR_OWNER':
          const usersName = booking.userId?.firstName + ' ' + booking.userId?.lastName;
          const currentpartnerName = booking.currentBikePartnerId.companyName
            ? booking.currentBikePartnerId.companyName
            : 'the partner';
          notificationData = {
            ...notificationData,
            type: 'owner',
            title: 'New Booking Created',
            message: `A new booking has been created for your bike ${booking.bikeId?.name || 'bike'} at ${currentpartnerName} by ${usersName}`
          };
          console.log('Creating NEW_BOOKING_CREATED_FOR_OWNER notification:', notificationData);
          break;

       case 'NEW_DROPOFF_BOOKING':
         notificationData = {
           ...notificationData,
           type: 'owner',
           title: 'New Drop-off Booking Scheduled',
           message: `A new drop-off booking has been Scheduled for the bike ${booking.bikeId?.name || 'bike'} by ${usersName}.Expect arrival on ${new Date(booking.dates.endDate).toLocaleDateString()}`
         };
         break;

      case 'BOOKING_ACCEPTED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Booking Confirmed!',
          message: `Your booking for ${booking.bikeId?.name || 'bike'} has been confirmed. Please complete payment.`
        };
        break;

      case 'BOOKING_REJECTED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Booking Declined',
          message: `Your booking request for ${booking.bikeId?.name || 'bike'} has been declined.`
        };
        break;

      case 'BOOKING_COMPLETED':
        notificationData = {
          ...notificationData,
          type: 'system',
          title: 'Booking Completed',
          message: `Your rental of ${booking.bikeId?.name || 'bike'} has been completed. Please rate your experience!`
        };
        break;

      case 'PAYMENT_REQUIRED':
        notificationData = {
          ...notificationData,
          type: 'payment',
          title: 'Payment Required',
          message: `Please complete payment of LKR ${booking.pricing?.total || 0} for your booking.`,
          relatedTo: {
            type: 'payment',
            id: booking._id.toString()
          }
        };
        break;

      default:
        return null;
    }

    const notification = new Notification(notificationData);
    
    // Validate notification data before saving
    const validationError = notification.validateSync();
    if (validationError) {
      console.error('[Notification] Validation failed:', validationError.message);
      console.error('[Notification] Invalid data:', notificationData);
      throw validationError;
    }
    
    await notification.save();
    
    console.log(`[Notification] Created ${eventType} notification for user ${targetUserId}`);
    return notification;
  } catch (error) {
    console.error('[Notification] Error creating booking notification:', error);
    console.error('[Notification] Event type:', eventType);
    console.error('[Notification] Target user:', targetUserId);
    console.error('[Notification] Notification data:', notificationData);
    return null;
  }
};

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
      .populate('bikeId', 'name type brand model images pricing location')
      .populate('partnerId', 'companyName email phone location')
      .populate('dropoffPartnerId', 'companyName email phone location')
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
      .populate('bikeId', 'name type brand model images pricing location')
      .populate('partnerId', 'companyName email phone location')
      .populate('dropoffPartnerId', 'companyName email phone location');
      
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
    
    const { bikeId, startTime, endTime, deliveryAddress, pickupLocation, dropoffLocation, dropoffPartnerId, totalAmount } = req.body;
    const userId = req.user.id; // From auth middleware
    
    console.log('Extracted data:', { bikeId, startTime, endTime, deliveryAddress, pickupLocation, dropoffLocation, dropoffPartnerId, totalAmount, userId });
    
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
    
    if (bike.availability.status !== 'available') {
      console.log('ERROR: Bike is not available');
      return res.status(400).json({ message: 'Bike is not available for booking' });
    }
    
    // Validate dropoff partner exists
    if (!dropoffPartnerId) {
      console.log('ERROR: Dropoff partner ID is required');
      return res.status(400).json({ message: 'Dropoff partner ID is required' });
    }
    
    const dropoffPartner = await Partner.findById(dropoffPartnerId);
    console.log('Found dropoff partner:', dropoffPartner ? 'Yes' : 'No');
    
    if (!dropoffPartner) {
      console.log('ERROR: Dropoff partner not found');
      return res.status(404).json({ message: 'Dropoff partner not found' });
    }
    
    console.log('Dropoff partner details:', {
      id: dropoffPartner._id,
      companyName: dropoffPartner.companyName,
      verified: dropoffPartner.verified
    });
    
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
    
    // Calculate pricing - use totalAmount from frontend if provided, otherwise calculate
    let basePrice = 0;
    let total = 0;
    
    if (totalAmount && totalAmount > 0) {
      // Use the total amount calculated and sent from frontend
      total = totalAmount;
      basePrice = totalAmount; // For now, set basePrice equal to total (can be refined later)
    } else {
      // Fallback to backend calculation if no totalAmount provided
      if (durationHours <= 24) {
        basePrice = bike.pricing.perHour * durationHours;
      } else {
        basePrice = bike.pricing.perDay * durationDays;
      }
      
      const insurance = basePrice * 0.1; // 10% insurance
      const extras = 0; // No extras for now
      const discount = 0; // No discount for now
      total = basePrice + insurance + extras - discount;
    }
    
    const insurance = 0; // Set to 0 when using frontend total
    const extras = 0; // No extras for now
    const discount = 0; // No discount for now
    
    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Calculate payment amounts
    const initialAmount = Math.round(total * 0.2 * 100) / 100; // 20%
    const remainingAmount = Math.round(total * 0.8 * 100) / 100; // 80%
    
    // Create booking with proper model structure
    const booking = new Booking({
      bookingNumber,
      userId,
      bikeId,
      partnerId: bike.partnerId,
      currentBikePartnerId: bike.currentPartnerId,
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
        pickup: pickupLocation || deliveryAddress || 'Default pickup location',
        dropoff: dropoffLocation || deliveryAddress || 'Default dropoff location'
      },
      dropoffPartnerId,
      status: 'requested',
      payments: {
        initial: {
          amount: initialAmount,
          percentage: 20,
          status: 'pending'
        },
        remaining: {
          amount: remainingAmount,
          percentage: 80,
          status: 'pending',
          additionalCharges: []
        }
      }
    });
    
    await booking.save();

    await Bike.findByIdAndUpdate(bikeId, {
      'availability.status': 'requested',
      'availability.reason': 'Booked'
    });
    console.log('Booking created successfully:', booking);

    // Send response immediately to prevent timeout
    res.status(201).json(booking);

    // Handle notifications and real-time events asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        // Send notification to partner about new booking request
        await notificationService.notifyBookingCreated(booking, bike.partnerId);
        await notificationService.notifyBookingCreated(booking, bike.currentPartnerId);
        console.log('Notification sent to partner successfully');
      } catch (notificationError) {
        console.error('Error sending notification to partner:', notificationError);
      }

      // Send real-time event to partner dashboard
      try {
        if (firebaseAdmin) {
          // Get the partner document to find the associated userId
          const Partner = require('../models/Partner');
          const partner = await Partner.findById(bike.partnerId);
          const pickupPartner = await Partner.findById(bike.currentPartnerId);

          if (!partner || !pickupPartner) {
            console.error('Partner not found for partnerId:', bike.partnerId);
            throw new Error('Partner not found');
          }
          
          console.log('Partner found:', { partnerId: partner._id, userId: partner.userId });
          
          const db = firebaseAdmin.firestore();
          await db.collection('realtimeEvents').add({
            type: 'BOOKING_CREATED',
            targetUserId: pickupPartner.userId.toString(), // Use pickupPartner's userId instead of partnerId
            targetUserRole: 'partner',
            data: {
              bookingId: booking._id.toString(),
              bikeId: bikeId,
              userId: userId,
              bookingData: {
                id: booking._id.toString(),
                bookingNumber: booking.bookingNumber,
                customerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
                customerEmail: req.user.email || '',
                customerPhone: req.user.phone || '',
                bikeName: bike.name,
                startDate: booking.dates.startDate,
                endDate: booking.dates.endDate,
                status: booking.status,
                total: booking.pricing.total,
                pickupLocation: booking.locations.pickup,
                dropoffLocation: booking.locations.dropoff,
                packageType: booking.package.name
              }
            },
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            processed: false,
            metadata: {
              sourceUserId: userId,
              sourceUserRole: 'user'
            }
          });
          console.log('Real-time event sent to dropoff partner dashboard');


          await db.collection('realtimeEvents').add({
            type: 'NEW_BOOKING_CREATED_FOR_OWNER',
            targetUserId: partner.userId.toString(), // Use partner's userId instead of dropoffPartnerId
            targetUserRole: 'partner',
            data: {
              bookingId: booking._id.toString(),
              bikeId: bikeId,
              userId: userId,
              bookingData: {
                id: booking._id.toString(),
                bookingNumber: booking.bookingNumber,
                customerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
                customerEmail: req.user.email || '',
                customerPhone: req.user.phone || '',
                bikeName: bike.name,
                startDate: booking.dates.startDate,
                endDate: booking.dates.endDate,
                status: booking.status,
                total: booking.pricing.total,
                pickupLocation: booking.locations.pickup,
                dropoffLocation: booking.locations.dropoff,
                packageType: booking.package.name
              }
            },
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            processed: false,
            metadata: {
              sourceUserId: userId,
              sourceUserRole: 'user'
            }
          });
          console.log('Real-time event sent to partner dashboard');
          
          // Populate booking with user details before creating notification
          const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'firstName lastName email phone')
            .populate('currentBikePartnerId', 'companyName userId')
            .populate('bikeId', 'name');
          
          // Create database notification for partner
          await createBookingNotification(populatedBooking, pickupPartner.userId.toString(), 'BOOKING_CREATED');
          // Create database notification for bike owner partner
          await createBookingNotification(populatedBooking, partner.userId.toString(), 'NEW_BOOKING_CREATED_FOR_OWNER');
        } else {
          console.log('Firebase not available - real-time events disabled');
        }
      } catch (eventError) {
        console.error('Error sending real-time event:', eventError);
      }
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    
    // Handle specific validation errors
    if (err.name === 'ValidationError') {
      const errorMessages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errorMessages 
      });
    }
    
    // Handle duplicate booking errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Booking already exists' 
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      message: 'Server error during booking creation',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Get all AVAILABLE PICKUP bookings for the authenticated partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMyPickupBookings = async (req, res) => {
  try {

    console.log('Request URL:', req.originalUrl);
    const partnerId = req.user.partnerId;

    if (!partnerId) {
      return res.status(403).json({ message: 'Partner profile not found.' });
    }

    // Get bookings where this partner is the PICKUP partner (either currentBikePartnerId or partnerId matches)
    const bookings = await Booking.find({ 
      $or: [
        { currentBikePartnerId: req.user.partnerId },
        { partnerId: req.user.partnerId }
      ]
    })
      .populate('userId', 'firstName lastName email phone')
      .populate('bikeId', 'name type brand model images pricing location')
      .populate('partnerId', 'companyName email phone location')
      .populate('dropoffPartnerId', 'companyName email phone location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('Get pickup bookings error:', err);
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
        .populate('partnerId', 'companyName email phone location')
        .populate('dropoffPartnerId', 'companyName email phone location');
      
      // Return empty array if no bookings found (don't return 404)
      res.json(bookings || []);
    } else if (user.role === 'partner') { // For partners, use their own partnerId
      if (!req.user.partnerId) {
        return res.status(403).json({ message: 'Partner profile not found.' });
      }
      
      // Get all bookings for the authenticated partner
      const bookings = await Booking.find({ $or: [
        { currentBikePartnerId: req.user.partnerId },
        { partnerId: req.user.partnerId }
      ]})
        .populate('userId', 'firstName lastName email phone')
        .populate('bikeId', 'name type brand model images pricing location')
        .populate('partnerId', 'companyName email phone location')
        .populate('dropoffPartnerId', 'companyName email phone location')
        .sort({ createdAt: -1 });
      
      res.json(bookings);
    } else if (user.role === 'admin') {
      // Admins can see all bookings (or implement specific admin logic)
      const bookings = await Booking.find({})
        .populate('userId', 'firstName lastName email phone')
        .populate('bikeId', 'name type brand model images pricing location')
        .populate('partnerId', 'companyName email phone location')
        .populate('dropoffPartnerId', 'companyName email phone location')
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
      .populate('dropoffPartnerId', 'companyName email phone location')
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
    
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('bikeId', 'name partnerId')
      .populate('partnerId', 'companyName')
      .populate('dropoffPartnerId', 'companyName');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const previousStatus = booking.status;
    
    // Update status
    booking.status = status;
    
    // Handle bike availability for different status changes
    if (status === 'cancelled' || status === 'completed') {
      await Bike.findByIdAndUpdate(booking.bikeId, {
        'availability.status': 'available'
      });
    } else if (status === 'confirmed') {
      // When booking is confirmed, set the bike as unavailable for the booking period
      await Bike.findByIdAndUpdate(booking.bikeId, {
        'availability.status': 'unavailable',
        'currentPartnerId': null
      });
    }
    
    await booking.save();

    // Send notifications based on status change
    try {
      if (status === 'confirmed' && previousStatus === 'requested') {
        // Booking accepted - notify user
        await notificationService.notifyBookingAccepted(booking, booking.userId._id);
        
        // Also send payment required notification
        await notificationService.notifyPaymentRequired(booking, booking.userId._id);
        
        console.log('Booking acceptance and payment notifications sent to user');

        // Send real-time event to user dashboard
        if (firebaseAdmin) {
          const db = firebaseAdmin.firestore();
          await db.collection('realtimeEvents').add({
            type: 'BOOKING_ACCEPTED',
            targetUserId: booking.userId._id.toString(),
            targetUserRole: 'user',
            data: {
              bookingId: booking._id.toString(),
              bikeId: booking.bikeId._id.toString(),
              bookingData: {
                id: booking._id.toString(),
                bikeName: booking.bikeId.name || 'Unknown Bike',
                pickupLocation: booking.locations.pickup || 'Unknown Location',
                dropoffLocation: booking.locations.dropoff || 'Unknown Location',
                status: 'confirmed',
                partnerName: booking.partnerId.companyName || 'Unknown Partner',
                startDate: booking.dates.startDate,
                endDate: booking.dates.endDate,
                total: booking.pricing.total || 0
              }
            },
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            processed: false,
            metadata: {
              sourceUserId: req.user.id,
              sourceUserRole: req.user.role || 'partner'
            }
          });
          console.log('Real-time booking acceptance event sent to user dashboard');
          
          // Create database notifications for user
          await createBookingNotification(booking, booking.userId._id.toString(), 'BOOKING_ACCEPTED');
          await createBookingNotification(booking, booking.userId._id.toString(), 'PAYMENT_REQUIRED');
        }
      } else if (status === 'cancelled' && previousStatus === 'requested') {
        // Booking rejected - notify user
        await notificationService.notifyBookingRejected(booking, booking.userId._id);
        console.log('Booking rejection notification sent to user');

        // Send real-time event to user dashboard
        if (firebaseAdmin) {
          const db = firebaseAdmin.firestore();
          await db.collection('realtimeEvents').add({
            type: 'BOOKING_REJECTED',
            targetUserId: booking.userId._id.toString(),
            targetUserRole: 'user',
            data: {
              bookingId: booking._id.toString(),
              bikeId: booking.bikeId._id.toString(),
              bookingData: {
                id: booking._id.toString(),
                bikeName: booking.bikeId.name || 'Unknown Bike',
                status: 'cancelled',
                partnerName: booking.partnerId.companyName || 'Unknown Partner'
              }
            },
            timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            processed: false,
            metadata: {
              sourceUserId: req.user.id,
              sourceUserRole: req.user.role || 'partner'
            }
          });
          console.log('Real-time booking rejection event sent to user dashboard');
          
          // Create database notification for user
          await createBookingNotification(booking, booking.userId._id.toString(), 'BOOKING_REJECTED');
        }
      } else if (status === 'completed') {
        // Booking completed - notify both user and partner
        await notificationService.notifyBookingCompleted(booking, booking.userId._id, booking.partnerId._id);
        console.log('Booking completion notifications sent to user and partner');

        // Send real-time events to both dashboards
        if (firebaseAdmin) {
          const db = firebaseAdmin.firestore();
          const completionData = {
            bookingId: booking._id.toString(),
            bikeId: booking.bikeId._id.toString(),
            bookingData: {
              id: booking._id.toString(),
              bikeName: booking.bikeId.name,
              status: 'completed'
            }
          };

          await Promise.all([
            db.collection('realtimeEvents').add({
              type: 'BOOKING_COMPLETED',
              targetUserId: booking.userId._id.toString(),
              targetUserRole: 'user',
              data: completionData,
              timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
              processed: false
            }),
            db.collection('realtimeEvents').add({
              type: 'BOOKING_COMPLETED',
              targetUserId: booking.partnerId._id.toString(),
              targetUserRole: 'partner',
              data: completionData,
              timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
              processed: false
            })
          ]);
          console.log('Real-time booking completion events sent to both dashboards');
          
          // Create database notifications for both user and partner
          await createBookingNotification(booking, booking.userId._id.toString(), 'BOOKING_COMPLETED');
          await createBookingNotification(booking, booking.partnerId._id.toString(), 'BOOKING_COMPLETED');
        }
      }
    } catch (notificationError) {
      console.error('Error sending status update notification:', notificationError);
      // Don't fail the status update if notification fails
    }
    
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
    booking.paymentStatus = 'paid';
    booking.paymentInfo = {
      method: paymentMethod,
      transactionId: transactionId,
      paid: true,
      paymentDate: new Date()
    };
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
      'availability.status': 'available'
    });
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get bookings where the current partner is the dropoff partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDropoffBookings = async (req, res) => {
  try {
    // Get user details to check role and partner ID
    const user = await User.findById(req.user.id);
    console.log(`User role: ${user.role}, Partner ID: ${req.user.partnerId}`);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify user is a partner
    if (user.role !== 'partner') {
      return res.status(403).json({ message: 'Access denied. Only partners can access dropoff bookings.' });
    }
    
    // Verify user has a partnerId
    if (!req.user.partnerId) {
      return res.status(403).json({ message: 'Partner ID not found in user profile.' });
    }
    
    // Get all bookings where this partner is the dropoff partner
    // Filter for active and confirmed bookings only (ready for dropoff)
    const bookings = await Booking.find({ 
      dropoffPartnerId: req.user.partnerId,
      status: { $in: ['active', 'confirmed'] }
    })
      .populate('userId', 'firstName lastName email phone')
      .populate('bikeId', 'name type brand model images pricing location')
      .populate('partnerId', 'companyName email phone location')
      .populate('dropoffPartnerId', 'companyName email phone location')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${bookings.length} dropoff bookings for partner ${req.user.partnerId}`);
    
    res.json(bookings);
  } catch (err) {
    console.error('Get dropoff bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
