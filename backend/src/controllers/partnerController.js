const { Partner, User, Bike } = require('../models');

// Mock data for development when database is not available
const mockPartners = [
  {
    _id: '64f2a3b4c5d6e7f8a9b0c1d2',
    userId: {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      firstName: 'Samantha',
      lastName: 'Fernando',
      email: 'samantha.fernando@gmail.com',
      phone: '+94771234567'
    },
    companyName: 'Galle Fort Cycles',
    category: 'Premium',
    description: 'Premium bike rental service in historic Galle Fort with guided tours and high-end bikes.',
    location: 'Galle',
    address: '42 Church Street, Galle Fort, Galle 80000',
    coordinates: { latitude: 6.0329, longitude: 80.2168 },
    contactPerson: 'Nimal Perera',
    phone: '+94912234567',
    email: 'info@gallefortcycles.lk',
    businessHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '19:00' },
      sunday: { open: '08:00', close: '19:00' }
    },
    specialties: ['Heritage Tours', 'Sunset Rides', 'Photography Tours'],
    features: ['24/7 Support', 'Free Delivery', 'Guided Tours', 'Professional Maintenance'],
    rating: 4.8,
    reviews: [
      {
        userId: '64f1a2b3c4d5e6f7a8b9c0d1',
        rating: 5,
        comment: 'Excellent service and beautiful bikes! The heritage tour was amazing.',
        date: '2025-05-20T16:30:00.000Z'
      }
    ],
    bikeCount: 25,
    yearsActive: 5,
    images: {
      logo: 'https://images.cycleLK.com/partners/galle_fort_cycles_logo.jpg',
      storefront: 'https://images.cycleLK.com/partners/galle_fort_cycles_store.jpg',
      gallery: [
        'https://images.cycleLK.com/partners/galle_fort_cycles_1.jpg',
        'https://images.cycleLK.com/partners/galle_fort_cycles_2.jpg',
        'https://images.cycleLK.com/partners/galle_fort_cycles_3.jpg'
      ]
    },
    verified: true,
    status: 'active',
    createdAt: '2024-09-01T12:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z'
  },
  {
    _id: '64f2a3b4c5d6e7f8a9b0c1d3',
    userId: {
      _id: '64f1a2b3c4d5e6f7a8b9c0d1',
      firstName: 'Samantha',
      lastName: 'Fernando',
      email: 'samantha.fernando@gmail.com',
      phone: '+94771234567'
    },
    companyName: 'Colombo City Bikes',
    category: 'Urban',
    description: 'Modern city bikes for exploring Colombo\'s bustling streets and landmarks.',
    location: 'Colombo',
    address: '156 R.A. De Mel Mawatha, Colombo 03',
    coordinates: { latitude: 6.9271, longitude: 79.8612 },
    contactPerson: 'Priya Jayawardena',
    phone: '+94112345678',
    email: 'hello@colombocitybikes.com',
    businessHours: {
      monday: { open: '07:00', close: '20:00' },
      tuesday: { open: '07:00', close: '20:00' },
      wednesday: { open: '07:00', close: '20:00' },
      thursday: { open: '07:00', close: '20:00' },
      friday: { open: '07:00', close: '20:00' },
      saturday: { open: '08:00', close: '21:00' },
      sunday: { open: '08:00', close: '21:00' }
    },
    specialties: ['City Tours', 'Corporate Rentals', 'Airport Pickup'],
    features: ['Express Booking', 'Mobile App', 'GPS Tracking', 'Insurance Included'],
    rating: 4.6,
    reviews: [],
    bikeCount: 45,
    yearsActive: 3,
    images: {
      logo: 'https://images.cycleLK.com/partners/colombo_city_bikes_logo.jpg',
      storefront: 'https://images.cycleLK.com/partners/colombo_city_bikes_store.jpg',
      gallery: [
        'https://images.cycleLK.com/partners/colombo_city_bikes_1.jpg',
        'https://images.cycleLK.com/partners/colombo_city_bikes_2.jpg'
      ]
    },
    verified: true,
    status: 'active',
    createdAt: '2024-11-15T09:30:00.000Z',
    updatedAt: '2025-05-28T15:45:00.000Z'
  },
  {
    _id: '64f2a3b4c5d6e7f8a9b0c1d4',
    userId: {
      _id: '64f1a2b3c4d5e6f7a8b9c0d2',
      firstName: 'Kasun',
      lastName: 'Silva',
      email: 'kasun.silva@gmail.com',
      phone: '+94773456789'
    },
    companyName: 'Kandy Hill Bikes',
    category: 'Adventure',
    description: 'Adventure bike rentals for exploring the scenic hill country around Kandy.',
    location: 'Kandy',
    address: 'Temple Street, Kandy',
    coordinates: { latitude: 7.2906, longitude: 80.6337 },
    contactPerson: 'Kasun Silva',
    phone: '+94812345678',
    email: 'adventure@kandyhillbikes.lk',
    businessHours: {
      monday: { open: '06:00', close: '19:00' },
      tuesday: { open: '06:00', close: '19:00' },
      wednesday: { open: '06:00', close: '19:00' },
      thursday: { open: '06:00', close: '19:00' },
      friday: { open: '06:00', close: '19:00' },
      saturday: { open: '06:00', close: '20:00' },
      sunday: { open: '07:00', close: '20:00' }
    },
    specialties: ['Mountain Biking', 'Tea Plantation Tours', 'Nature Trails'],
    features: ['Trail Maps', 'Safety Gear', 'Emergency Support', 'Guide Services'],
    rating: 4.7,
    reviews: [
      {
        userId: '64f1a2b3c4d5e6f7a8b9c0d3',
        rating: 5,
        comment: 'Amazing mountain trails and excellent bike quality!',
        date: '2025-04-15T14:20:00.000Z'
      }
    ],
    bikeCount: 30,
    yearsActive: 4,
    images: {
      logo: 'https://images.cycleLK.com/partners/kandy_hill_bikes_logo.jpg',
      storefront: 'https://images.cycleLK.com/partners/kandy_hill_bikes_store.jpg',
      gallery: [
        'https://images.cycleLK.com/partners/kandy_hill_bikes_1.jpg',
        'https://images.cycleLK.com/partners/kandy_hill_bikes_2.jpg'
      ]
    },
    verified: true,
    status: 'active',
    createdAt: '2024-07-10T08:15:00.000Z',
    updatedAt: '2025-05-01T12:30:00.000Z'
  }
];

/**
 * Get all partners
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPartners = async (req, res) => {
  try {
    console.log('Attempting to fetch partners from database...');
    
    // Check if Partner model is properly imported
    if (!Partner) {
      console.error('Partner model is not properly imported');
      return res.status(500).json({ 
        message: 'Server configuration error', 
        data: mockPartners 
      });
    }

    // Test database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Connection state:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'Database connection error', 
        data: mockPartners 
      });
    }

    console.log('Database connected, fetching partners...');
    
    const partners = await Partner.find()
      .populate('userId', 'firstName lastName email phone')
      .lean(); // Use lean() for better performance
    
    console.log(`Successfully fetched ${partners.length} partners from database`);
    res.json(partners);
    
  } catch (error) {
    console.error('Database error in getAllPartners:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return mock data with error information for development
    res.status(500).json({ 
      message: 'Database error occurred',
      error: error.message,
      data: mockPartners 
    });
  }
};

/**
 * Get partner by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerById = async (req, res) => {
  try {
    console.log('Fetching partner by ID:', req.params.id);
    
    const partner = await Partner.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');
      
    if (!partner) {
      console.log('Partner not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // If user is not admin and not the partner, don't show bank details (only if user is authenticated)
    if (req.user && req.user.role !== 'admin' && partner.userId && partner.userId._id.toString() !== req.user.id) {
      partner.bankDetails = undefined;
    }
    
    console.log('Successfully fetched partner:', partner.companyName);
    res.json(partner);
  } catch (error) {
    console.error('Error in getPartnerById:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Register a new partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerPartner = async (req, res) => {
  try {
    const { userId, companyName, companyAddress, businessRegNumber, contactPhone } = req.body;
    
    console.log('Registering new partner for user:', userId);
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if partner already exists for this user
    const existingPartner = await Partner.findOne({ userId });
    if (existingPartner) {
      return res.status(400).json({ message: 'This user is already a partner' });
    }
    
    // Create partner profile
    const partner = new Partner({
      userId,
      companyName,
      companyAddress,
      businessRegNumber,
      contact: {
        email: user.email,
        phone: contactPhone || user.phone
      },
      verificationStatus: 'pending',
      joinDate: new Date()
    });
    
    await partner.save();
    
    // Update user role to partner
    user.role = 'partner';
    await user.save();
    
    console.log('Successfully registered partner:', companyName);
    res.status(201).json(partner);
  } catch (error) {
    console.error('Error in registerPartner:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Update partner information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePartner = async (req, res) => {
  try {
    console.log('Updating partner:', req.params.id);
    
    // Don't allow updating userId
    if (req.body.userId) {
      delete req.body.userId;
    }
    
    // Don't allow updating verification status unless admin
    if (req.body.verificationStatus && req.user && req.user.role !== 'admin') {
      delete req.body.verificationStatus;
    }
    
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    console.log('Successfully updated partner:', partner.companyName);
    res.json(partner);
  } catch (error) {
    console.error('Error in updatePartner:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Update partner verification status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { verificationStatus } = req.body;
    
    console.log('Updating verification status for partner:', req.params.id, 'to:', verificationStatus);
    
    // Validate status
    const validStatuses = ['pending', 'verified', 'rejected'];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }
    
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    partner.verificationStatus = verificationStatus;
    
    // If verifying, set verification date
    if (verificationStatus === 'verified') {
      partner.verificationDate = new Date();
    }
    
    await partner.save();
    
    console.log('Successfully updated verification status for:', partner.companyName);
    res.json(partner);
  } catch (error) {
    console.error('Error in updateVerificationStatus:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Get all bikes for a specific partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerBikes = async (req, res) => {
  try {
    console.log('Fetching bikes for partner:', req.params.id);
    
    const bikes = await Bike.find({ partnerId: req.params.id });
    
    console.log(`Found ${bikes.length} bikes for partner:`, req.params.id);
    res.json(bikes);
  } catch (error) {
    console.error('Error in getPartnerBikes:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Update partner bank details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBankDetails = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder, branchCode } = req.body;
    
    console.log('Updating bank details for partner:', req.params.id);
    
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Only allow if the user is the partner or an admin
    if (req.user && partner.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update bank details' });
    }
    
    partner.bankDetails = {
      bankName,
      accountNumber,
      accountHolder,
      branchCode
    };
    
    await partner.save();
    
    console.log('Successfully updated bank details for:', partner.companyName);
    res.json({ message: 'Bank details updated successfully' });
  } catch (error) {
    console.error('Error in updateBankDetails:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};