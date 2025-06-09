const { Partner, User, Bike } = require('../models');

/**
 * Get all partners
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find()
      .select('-bankDetails')
      .populate('userId', 'firstName lastName email phone');
    
    res.json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get partner by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone');
      
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // If user is not admin and not the partner, don't show bank details
    if (req.user.role !== 'admin' && partner.userId.toString() !== req.user.id) {
      partner.bankDetails = undefined;
    }
    
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
    
    res.status(201).json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update partner information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePartner = async (req, res) => {
  try {
    // Don't allow updating userId
    if (req.body.userId) {
      delete req.body.userId;
    }
    
    // Don't allow updating verification status unless admin
    if (req.body.verificationStatus && req.user.role !== 'admin') {
      delete req.body.verificationStatus;
    }
    
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
    
    res.json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all bikes for a specific partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnerBikes = async (req, res) => {
  try {
    const bikes = await Bike.find({ partnerId: req.params.id });
    res.json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
    
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Only allow if the user is the partner or an admin
    if (partner.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update bank details' });
    }
    
    partner.bankDetails = {
      bankName,
      accountNumber,
      accountHolder,
      branchCode
    };
    
    await partner.save();
    
    res.json({ message: 'Bank details updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
