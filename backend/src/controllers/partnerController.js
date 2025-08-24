// backend/controllers/partnerController.js
const { Partner, User, Bike } = require('../models');
const cloudinary = require('../config/cloudinary');

/**
 * Get all partners with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPartners = async (req, res) => {
  try {
    console.log('Attempting to fetch partners from database...');
    
    const { locationId, location, verified } = req.query;
  
    // Test database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Connection state:', mongoose.connection.readyState);
      return res.status(500).json({ 
        message: 'Database connection error'
      });
    }

    console.log('Database connected, fetching partners...');
    
    // Build filter object
    const filter = {};
    
    // Filter by location ID (ObjectId reference)
    if (locationId) {
      filter.location = locationId;
      console.log('Filtering by locationId:', locationId);
    }
    
    // Filter by verification status
    if (verified !== undefined) {
      filter.verified = verified === 'true';
      console.log('Filtering by verified status:', filter.verified);
    }
    
    const partners = await Partner.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('location', 'name coordinates') // Populate location details
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
      .populate('userId', 'firstName lastName email phone')
      .populate('location', 'name coordinates'); // Populate location details
      
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
 * Get partners by location ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPartnersByLocationId = async (req, res) => {
  try {
    const { locationId } = req.params;
    console.log('Fetching partners for location ID:', locationId);
    
    const partners = await Partner.find({ location: locationId })
      .populate('userId', 'firstName lastName email phone')
      .populate('location', 'name coordinates')
      .lean();
      
    console.log(`Found ${partners.length} partners for location:`, locationId);
    res.json(partners);
  } catch (error) {
    console.error('Error in getPartnersByLocationId:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Search partners by query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.searchPartners = async (req, res) => {
  try {
    const { q, location, verified } = req.query;
    console.log('Searching partners with query:', q);
    
    // Build search filter
    const filter = {};
    
    // Text search
    if (q) {
      filter.$or = [
        { companyName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { specialties: { $in: [new RegExp(q, 'i')] } },
        { features: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Location filter
    if (location) {
      filter.location = location;
    }
    
    // Verification filter
    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }
    
    const partners = await Partner.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('location', 'name coordinates')
      .lean();
      
    console.log(`Found ${partners.length} partners matching search criteria`);
    res.json(partners);
  } catch (error) {
    console.error('Error in searchPartners:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Register a new partner with image upload support
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
      // serviceCities, // removed
      // serviceLocations, // removed
      mapLocation, // new
      location, // now ObjectId string
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
    console.log('req.files:', req.files); // Debug log for uploaded files
    
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
    
    // Process uploaded images
    const images = {
      logo: null,
      storefront: null,
      gallery: []
    };

    if (req.files) {
      console.log('Processing uploaded files:', Object.keys(req.files));
      
      // Process logo image
      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.files.logo[0];
        images.logo = {
          url: logoFile.path,
          publicId: logoFile.filename
        };
        console.log('Logo processed:', images.logo);
      }
      
      // Process storefront image (required)
      if (req.files.storefront && req.files.storefront[0]) {
        const storefrontFile = req.files.storefront[0];
        images.storefront = {
          url: storefrontFile.path,
          publicId: storefrontFile.filename
        };
        console.log('Storefront processed:', images.storefront);
      } else {
        return res.status(400).json({ message: 'Storefront image is required' });
      }
      
      // Process gallery images
      if (req.files.gallery && req.files.gallery.length > 0) {
        images.gallery = req.files.gallery.map(file => ({
          url: file.path,
          publicId: file.filename
        }));
        console.log('Gallery processed:', images.gallery.length, 'images');
      }
    } else {
      return res.status(400).json({ message: 'Storefront image is required' });
    }
    
    // Parse JSON fields if they're strings (from FormData)
    let parsedMapLocation = mapLocation;
    let parsedBusinessHours = businessHours;
    let parsedSpecialties = specialties;
    let parsedFeatures = features;

    try {
      if (typeof mapLocation === 'string') {
        parsedMapLocation = JSON.parse(mapLocation);
      }
      if (typeof businessHours === 'string') {
        parsedBusinessHours = JSON.parse(businessHours);
      }
      if (typeof specialties === 'string') {
        parsedSpecialties = JSON.parse(specialties);
      }
      if (typeof features === 'string') {
        parsedFeatures = JSON.parse(features);
      }
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      // Continue with original values if parsing fails
    }
    
    // Create partner profile with all fields
    const partnerData = {
      userId,
      companyName,
      category: category || undefined,
      description: description || undefined,
      // mapLocation replaces serviceCities/serviceLocations
      mapLocation: parsedMapLocation || undefined,
      // location is now an ObjectId string (reference)
      location: location || undefined,
      address: address || companyAddress, // Support both field names
      contactPerson: contactPerson || undefined,
      phone: phone || contactPhone || user.phone,
      email: email || user.email,
      businessHours: parsedBusinessHours || undefined,
      specialties: parsedSpecialties || [],
      features: parsedFeatures || [],
      yearsActive: yearsActive ? Number(yearsActive) : 0,
      images: images, // Add processed images
      status: 'pending'
    };

    // Remove undefined fields
    Object.keys(partnerData).forEach(key => {
      if (partnerData[key] === undefined) {
        delete partnerData[key];
      }
    });
    
    console.log('Partner data to save:', partnerData);
    
    const partner = new Partner(partnerData);
    await partner.save();
    
    // Update user role to partner
    user.role = 'partner';
    await user.save();
    
    console.log('Successfully registered partner:', companyName);
    res.status(201).json(partner);
  } catch (error) {
    console.error('Error in registerPartner:', error);
    
    // If there was an error, try to cleanup uploaded images from cloudinary
    if (req.files) {
      const cleanupPromises = [];
      
      if (req.files.logo) {
        req.files.logo.forEach(file => {
          if (file.filename) {
            cleanupPromises.push(cloudinary.uploader.destroy(file.filename));
          }
        });
      }
      
      if (req.files.storefront) {
        req.files.storefront.forEach(file => {
          if (file.filename) {
            cleanupPromises.push(cloudinary.uploader.destroy(file.filename));
          }
        });
      }
      
      if (req.files.gallery) {
        req.files.gallery.forEach(file => {
          if (file.filename) {
            cleanupPromises.push(cloudinary.uploader.destroy(file.filename));
          }
        });
      }
      
      // Execute cleanup (don't wait for it)
      Promise.all(cleanupPromises).catch(cleanupError => {
        console.error('Error cleaning up uploaded images:', cleanupError);
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Update partner information with image support
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePartner = async (req, res) => {
  try {
    console.log('Updating partner:', req.params.id);
    console.log('req.files:', req.files); // Debug log for uploaded files
    
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Don't allow updating userId
    if (req.body.userId) {
      delete req.body.userId;
    }
    
    // Don't allow updating verification status unless admin
    if (req.body.verificationStatus && req.user && req.user.role !== 'admin') {
      delete req.body.verificationStatus;
    }
    
    const updateData = { ...req.body };
    
    // Parse JSON fields if they're strings (from FormData)
    try {
      if (typeof updateData.mapLocation === 'string') {
        updateData.mapLocation = JSON.parse(updateData.mapLocation);
      }
      if (typeof updateData.businessHours === 'string') {
        updateData.businessHours = JSON.parse(updateData.businessHours);
      }
      if (typeof updateData.specialties === 'string') {
        updateData.specialties = JSON.parse(updateData.specialties);
      }
      if (typeof updateData.features === 'string') {
        updateData.features = JSON.parse(updateData.features);
      }
      if (updateData.yearsActive) {
        updateData.yearsActive = Number(updateData.yearsActive);
      }
    } catch (parseError) {
      console.error('Error parsing JSON fields in update:', parseError);
    }

    // Remove legacy fields if present
    delete updateData.serviceCities;
    delete updateData.serviceLocations;

    // Process uploaded images if any
    if (req.files) {
      const currentImages = partner.images || { logo: null, storefront: null, gallery: [] };
      
      // Process logo image
      if (req.files.logo && req.files.logo[0]) {
        // Delete old logo from cloudinary if exists
        if (currentImages.logo && currentImages.logo.publicId) {
          try {
            await cloudinary.uploader.destroy(currentImages.logo.publicId);
          } catch (error) {
            console.error('Error deleting old logo:', error);
          }
        }
        
        const logoFile = req.files.logo[0];
        currentImages.logo = {
          url: logoFile.path,
          publicId: logoFile.filename
        };
      }
      
      // Process storefront image
      if (req.files.storefront && req.files.storefront[0]) {
        // Delete old storefront from cloudinary if exists
        if (currentImages.storefront && currentImages.storefront.publicId) {
          try {
            await cloudinary.uploader.destroy(currentImages.storefront.publicId);
          } catch (error) {
            console.error('Error deleting old storefront:', error);
          }
        }
        
        const storefrontFile = req.files.storefront[0];
        currentImages.storefront = {
          url: storefrontFile.path,
          publicId: storefrontFile.filename
        };
      }
      
      // Process gallery images (append to existing)
      if (req.files.gallery && req.files.gallery.length > 0) {
        const newGalleryImages = req.files.gallery.map(file => ({
          url: file.path,
          publicId: file.filename
        }));
        currentImages.gallery = [...(currentImages.gallery || []), ...newGalleryImages];
      }
      
      updateData.images = currentImages;
    }
    
    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    console.log('Successfully updated partner:', updatedPartner.companyName);
    res.json(updatedPartner);
  } catch (error) {
    console.error('Error in updatePartner:', error);
    
    // Cleanup uploaded images on error
    if (req.files) {
      const cleanupPromises = [];
      
      Object.values(req.files).flat().forEach(file => {
        if (file.filename) {
          cleanupPromises.push(cloudinary.uploader.destroy(file.filename));
        }
      });
      
      Promise.all(cleanupPromises).catch(cleanupError => {
        console.error('Error cleaning up uploaded images:', cleanupError);
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

/**
 * Delete a gallery image from partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { partnerId, imageIndex } = req.params;
    
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Check authorization (partner owner or admin)
    if (req.user && partner.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this partner' });
    }
    
    if (!partner.images || !partner.images.gallery || !partner.images.gallery[imageIndex]) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const imageToDelete = partner.images.gallery[imageIndex];
    
    // Delete from cloudinary
    if (imageToDelete.publicId) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.publicId);
      } catch (error) {
        console.error('Error deleting image from cloudinary:', error);
      }
    }
    
    // Remove from array
    partner.images.gallery.splice(imageIndex, 1);
    await partner.save();
    
    res.json({ 
      message: 'Image deleted successfully',
      gallery: partner.images.gallery
    });
  } catch (error) {
    console.error('Error in deleteGalleryImage:', error);
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