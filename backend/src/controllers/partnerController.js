const { Partner, User, Bike } = require('../models');

/**
 * Get all partners
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPartners = async (req, res) => {
  try {
    console.log('Attempting to fetch partners from database...');
  
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
    res.status(500).json({ message: 'Database error occurred', error: error.message });
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
    const { 
      userId, 
      companyName, 
      category,
      description,
      location,
      address,
      contactPerson,
      phone,
      email,
      businessHours,
      specialties,
      features,
      yearsActive,
      // Legacy support
      companyAddress, 
      businessRegNumber, 
      contactPhone 
    } = req.body;
    
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
    
    // Create partner profile with all fields
    const partnerData = {
      userId,
      companyName,
      category: category || undefined,
      description: description || undefined,
      location,
      address: address || companyAddress, // Support both field names
      contactPerson: contactPerson || undefined,
      phone: phone || contactPhone || user.phone,
      email: email || user.email,
      businessHours: businessHours || undefined,
      specialties: specialties || [],
      features: features || [],
      yearsActive: yearsActive || 0,
      status: 'pending'
    };

    // Remove undefined fields
    Object.keys(partnerData).forEach(key => {
      if (partnerData[key] === undefined) {
        delete partnerData[key];
      }
    });
    
    const partner = new Partner(partnerData);
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