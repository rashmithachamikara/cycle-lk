const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/db');

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user with email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with hashed password
    user = new User({
      ...req.body
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user with email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    // Don't allow password updates through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.remove();
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Submit ID document for verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.submitIdDocument = async (req, res) => {
  try {
    const { documentType, documentNumber } = req.body;
    const documentImage = req.file ? req.file.path : null;
    
    // Validate required fields
    if (!documentType || !documentNumber || !documentImage) {
      return res.status(400).json({ message: 'Please provide document type, number and image' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's verification status
    user.verificationStatus.idDocument = {
      isVerified: false,
      status: 'pending',
      documentType,
      documentNumber,
      documentImage,
      submittedAt: new Date()
    };

    await user.save();

    res.json({ 
      message: 'Document submitted for verification',
      verificationStatus: {
        idDocument: user.verificationStatus.idDocument
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get ID document verification status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getIdDocumentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      verificationStatus: {
        idDocument: user.verificationStatus.idDocument || {
          isVerified: false,
          status: 'not_submitted'
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Approve ID document verification (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.approveIdDocument = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.verificationStatus.idDocument || user.verificationStatus.idDocument.status !== 'pending') {
      return res.status(400).json({ message: 'No pending ID document verification found' });
    }

    // Update verification status
    user.verificationStatus.idDocument.isVerified = true;
    user.verificationStatus.idDocument.status = 'approved';
    user.verificationStatus.idDocument.verifiedAt = new Date();
    user.verificationStatus.idDocument.approvedBy = req.user.id; // Assuming req.user contains the admin's ID

    await user.save();

    res.json({
      message: 'ID document verified successfully',
      verificationStatus: {
        idDocument: user.verificationStatus.idDocument
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reject ID document verification with reason (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.rejectIdDocument = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.verificationStatus.idDocument || user.verificationStatus.idDocument.status !== 'pending') {
      return res.status(400).json({ message: 'No pending ID document verification found' });
    }

    // Update verification status
    user.verificationStatus.idDocument.isVerified = false;
    user.verificationStatus.idDocument.status = 'rejected';
    user.verificationStatus.idDocument.rejectionReason = rejectionReason;

    await user.save();

    res.json({
      message: 'ID document verification rejected',
      verificationStatus: {
        idDocument: user.verificationStatus.idDocument
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all pending ID document verifications (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPendingVerifications = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find users with pending verification
    const users = await User.find({
      'verificationStatus.idDocument.status': 'pending'
    })
    .select('firstName lastName email verificationStatus.idDocument')
    .skip(skip)
    .limit(limit);

    const count = await User.countDocuments({
      'verificationStatus.idDocument.status': 'pending'
    });

    res.json({
      count,
      verifications: users.map(user => ({
        userId: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        idDocument: user.verificationStatus.idDocument
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
