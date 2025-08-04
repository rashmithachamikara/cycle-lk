const { Partner, User, Bike } = require('../models');

// Mock data for development when database is not available
const mockPartners = [
  {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    companyName: 'Colombo Bikes',
    category: 'Premium',
    description: 'Leading bike rental service in Colombo with premium fleet and exceptional customer service.',
    location: 'Colombo Central',
    address: 'No. 123, Galle Road, Colombo 03',
    coordinates: { latitude: 6.9271, longitude: 79.8612 },
    phone: '+94 77 123 4567',
    email: 'info@colombobikes.lk',
    businessHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '06:00', close: '22:00' },
      sunday: { open: '08:00', close: '20:00' }
    },
    specialties: ['City Tours', 'Business Rentals', 'Airport Transfers'],
    features: ['24/7 Support', 'Free Delivery', 'Insurance Included', 'GPS Tracking'],
    rating: 4.9,
    reviews: [
      { userId: '507f1f77bcf86cd799439013', rating: 5, comment: 'Excellent service!', date: '2024-01-15' },
      { userId: '507f1f77bcf86cd799439014', rating: 4, comment: 'Great bikes!', date: '2024-01-10' }
    ],
    bikeCount: 25,
    yearsActive: 5,
    images: {
      logo: 'https://via.placeholder.com/200x100?text=Colombo+Bikes',
      storefront: 'https://via.placeholder.com/800x400?text=Modern+Bike+Shop',
      gallery: ['https://via.placeholder.com/400x300?text=Shop+Interior']
    },
    verified: true,
    status: 'active',
    createdAt: '2019-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    _id: '507f1f77bcf86cd799439015',
    userId: '507f1f77bcf86cd799439016',
    companyName: 'Hill Country Cycles',
    category: 'Adventure',
    description: 'Specialized in mountain bikes and scenic routes through Kandy\'s beautiful hill country.',
    location: 'Kandy',
    address: 'Temple Street, Kandy',
    coordinates: { latitude: 7.2906, longitude: 80.6337 },
    phone: '+94 77 234 5678',
    email: 'rides@hillcountrycycles.lk',
    businessHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '07:00', close: '19:00' },
      sunday: { open: '08:00', close: '18:00' }
    },
    specialties: ['Mountain Biking', 'Tea Plantation Tours', 'Cultural Routes'],
    features: ['Route Planning', 'Guide Services', 'Equipment Rental', 'Emergency Support'],
    rating: 4.8,
    reviews: [
      { userId: '507f1f77bcf86cd799439017', rating: 5, comment: 'Amazing mountain routes!', date: '2024-01-12' }
    ],
    bikeCount: 18,
    yearsActive: 3,
    images: {
      storefront: 'https://via.placeholder.com/800x400?text=Mountain+Bike+Shop'
    },
    verified: true,
    status: 'active',
    createdAt: '2021-01-15T00:00:00.000Z',
    updatedAt: '2024-01-12T00:00:00.000Z'
  },
  {
    _id: '507f1f77bcf86cd799439018',
    userId: '507f1f77bcf86cd799439019',
    companyName: 'Coastal Bikes',
    category: 'Beach',
    description: 'Perfect for exploring Galle Fort and coastal areas with comfortable beach cruisers.',
    location: 'Galle',
    address: 'Fort Road, Galle Fort',
    coordinates: { latitude: 6.0329, longitude: 80.217 },
    phone: '+94 77 345 6789',
    email: 'hello@coastalbikes.lk',
    businessHours: {
      monday: { open: '06:30', close: '20:00' },
      tuesday: { open: '06:30', close: '20:00' },
      wednesday: { open: '06:30', close: '20:00' },
      thursday: { open: '06:30', close: '20:00' },
      friday: { open: '06:30', close: '20:00' },
      saturday: { open: '06:30', close: '20:00' },
      sunday: { open: '07:00', close: '19:00' }
    },
    specialties: ['Beach Cruising', 'Fort Tours', 'Sunset Rides'],
    features: ['Beach Accessories', 'Fort Passes', 'Photography Tips', 'Sunset Tours'],
    rating: 4.7,
    reviews: [],
    bikeCount: 22,
    yearsActive: 4,
    verified: true,
    status: 'active',
    createdAt: '2020-01-15T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
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