//backend/src/controllers/bikeController.js
const { Bike, Partner, Location } = require('../models'); // Add Location to imports
const cloudinary = require('../config/cloudinary');


/**
 * Get all bikes with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBikes = async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, availability, partnerId, limit, sort } = req.query;

    // Build match filter for aggregation
    const match = {};
    if (type) match.type = type;
    if (partnerId) match.partnerId = partnerId;
    if (availability) match['availability.status'] = availability;
    if (minPrice || maxPrice) {
      match['pricing.perDay'] = {};
      if (minPrice) match['pricing.perDay'].$gte = Number(minPrice);
      if (maxPrice) match['pricing.perDay'].$lte = Number(maxPrice);
    }

    // Build sort options
    let sortOptions = {};
    if (sort === 'price-asc') {
      sortOptions['pricing.perDay'] = 1;
    } else if (sort === 'price-desc') {
      sortOptions['pricing.perDay'] = -1;
    } else if (sort === 'rating') {
      sortOptions['rating'] = -1;
    } else {
      sortOptions['rating'] = -1; // Default sort
    }

    // Aggregation pipeline
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'partners',
          localField: 'currentPartnerId',
          foreignField: '_id',
          as: 'partner'
        }
      },
      { $unwind: '$partner' },
      {
        $lookup: {
          from: 'locations',
          localField: 'partner.location',
          foreignField: '_id',
          as: 'locationObj'
        }
      },
      { $unwind: { path: '$locationObj', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          location: '$locationObj.name'
        }
      },
      // Filter by location name if provided
      ...(location ? [{ $match: { location: location } }] : []),
      { $sort: sortOptions },
      ...(limit ? [{ $limit: Number(limit) }] : [])
    ];

    const bikes = await Bike.aggregate(pipeline);

    res.json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * Get all bikes for the authenticated partner
 */
exports.getMyBikes = async (req, res) => {
  try {
    // Check if user exists and has partner role
    if (!req.user || !req.user.partnerId) {
      return res.status(403).json({ message: 'Authentication error: Partner could not be identified.' });
    }

    console.log(`User role: ${req.user.role}, User's Partner ID: ${req.user.partnerId}`);

    const partnerId = req.user.partnerId;
    const bikes = await Bike.find({ currentPartnerId: req.user.partnerId })
      .populate({
        path: 'currentPartnerId',
        select: 'companyName email phone location',
        populate: { path: 'location', select: 'name' }
      });
    const bikesWithLocationName = bikes.map(bike => ({
      ...bike.toObject(),
      location: bike.currentPartnerId?.location?.name || ''
    }));
    res.json(bikesWithLocationName || []);

  } catch (err) {
    console.error('Error in getMyBikes:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get bike by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id)
      .populate({
        path: 'currentPartnerId',
        select: 'companyName rating contact email phone location businessHours',
        populate: { path: 'location', select: 'name' }
      });
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    const bikeObj = bike.toObject();
    bikeObj.location = bike.currentPartnerId?.location?.name || '';
    res.json(bikeObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// /**
//  * Add a new bike
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// exports.addBike = async (req, res) => {
//   try {
//     const bike = new Bike(req.body);
    
//     // Validate partner exists
//     const partner = await Partner.findById(bike.partnerId);
//     if (!partner) {
//       return res.status(400).json({ message: 'Invalid partner ID' });
//     }
    
//     // Validate location exists
//     const location = await Location.findOne({ name: bike.location });
//     if (!location) {
//       return res.status(400).json({ message: 'Invalid location' });
//     }
    
//     // Save bike
//     await bike.save();
    
//     // Update partner's bike count
//     await Partner.findByIdAndUpdate(bike.partnerId, {
//       $inc: { bikeCount: 1 }
//     });
    
//     // Update location's bike count
//     await Location.findOneAndUpdate({ name: bike.location }, {
//       $inc: { bikeCount: 1 }
//     });
    
//     res.status(201).json(bike);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };





exports.addBike = async (req, res) => {
  // ====================================================================
  //  START: DEBUGGING LOGS - Add these lines
  // ====================================================================
  console.log('--- Inside addBike Controller ---');
  console.log('req.user:', req.user); // Should show the user and partnerId
  console.log('req.body:', req.body); // Should show text fields: name, type, etc.
  console.log('req.files:', req.files); // <<< THIS SHOULD NOW SHOW AN ARRAY OF FILE OBJECTS!
  console.log('---------------------------------');
  // ====================================================================
  //  END: DEBUGGING LOGS
  // ====================================================================




  try {
    if (!req.user || !req.user.partnerId) {
      console.error('Bike Controller: partnerId is missing from request. Auth middleware may have failed.');
      return res.status(403).json({ message: 'Authentication error: Partner could not be identified.' });
    }

    // Simple validation (can be replaced with a more robust library like Joi or express-validator)
    if (!req.body.name || !req.body.type) {
      return res.status(400).json({ message: 'Validation failed: Name and type are required.' });
    }

    const partnerId = req.user.partnerId;

    const {
      name,
      type,
      description,
      pricing,
      features,
      specifications,
      coordinates,
      availability
    } = req.body;

    // This logic should now work correctly because req.files will be populated
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            imageUrls.push({
                url: file.path,      // This is the URL from Cloudinary
                publicId: file.filename // This is the public_id from Cloudinary
            });
        });
      }

    const bike = new Bike({
      partnerId: req.user.partnerId,
      name,
      type,
      description,
      currentPartnerId: partnerId, // always use partner's location
      pricing,
      features: Array.isArray(features) ? features : [features],
      specifications,
      coordinates: coordinates || locationObj.coordinates, // fallback to location's coordinates
      images: imageUrls,
      'availability.status': availability?.status
    });

    await bike.save();

    await Partner.findByIdAndUpdate(req.user.partnerId, {
      $inc: { bikeCount: 1 }
    });

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(400).json({ message: 'Invalid partner ID' });
    }

    if (partner.location?._id) {
      await Location.findByIdAndUpdate(partner.location._id, {
        $inc: { bikeCount: 1 }
      });
    }

    res.status(201).json(bike);
  } catch (err) {
    console.error("Error in addBike controller:", err);
    res.status(500).json({ message: 'Server error while adding bike' });
  }
};





/**
 * Update a bike
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    // Only compare location if both exist
    if (
      req.body.location &&
      bike.location &&
      req.body.location.toString() !== bike.location.toString()
    ) {
      // Update old location's bike count (-1)
      await Location.findByIdAndUpdate(bike.location, {
        $inc: { bikeCount: -1 }
      });

      // Update new location's bike count (+1)
      await Location.findByIdAndUpdate(req.body.location, {
        $inc: { bikeCount: 1 }
      });
    }

    // Update bike
    const updatedBike = await Bike.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedBike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a bike
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    const partnerId = bike.partnerId;
    const locationId = bike.location;

    // Fix: use deleteOne instead of remove
    await Bike.deleteOne({ _id: bike._id });

    await Partner.findByIdAndUpdate(partnerId, {
      $inc: { bikeCount: -1 }
    });

    // Update location's bike count using ObjectId
    await Location.findByIdAndUpdate(locationId, {
      $inc: { bikeCount: -1 }
    });

    res.json({ message: 'Bike removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get featured bikes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFeaturedBikes = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const bikes = await Bike.find({ 'availability.status': 'available' })
      .sort({ rating: -1 })
      .limit(Number(limit))
      .populate({
        path: 'currentPartnerId',
        select: 'companyName rating location',
        populate: { path: 'location', select: 'name' }
      });
    const bikesWithLocationName = bikes.map(bike => ({
      ...bike.toObject(),
      location: bike.currentPartnerId?.location?.name || ''
    }));
    res.json(bikesWithLocationName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get bikes by partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBikesByPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    const bikes = await Bike.find({ currentPartnerId: partnerId })
      .populate({
        path: 'currentPartnerId',
        select: 'companyName rating location',
        populate: { path: 'location', select: 'name' }
      });
    const bikesWithLocationName = bikes.map(bike => ({
      ...bike.toObject(),
      location: bike.currentPartnerId?.location?.name || ''
    }));
    res.json(bikesWithLocationName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Upload bike images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadBikeImages = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    // Check if bike belongs to partner
    if (bike.partnerId.toString() !== req.user.partnerId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this bike' });
    }
    
    // Get file paths from multer
    const imagePaths = req.files.map(file => file.path);
    
    // Update bike with new images
    bike.images = bike.images.concat(imagePaths);
    await bike.save();
    
    res.json({ 
      message: 'Images uploaded successfully', 
      images: bike.images 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update bike availability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBikeAvailability = async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    // Check if bike belongs to partner
    if (bike.partnerId.toString() !== req.user.partnerId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this bike' });
    }
    
    // Update availability status
    bike.availability.status = req.body.status;
    
    // Update unavailable reason if status is unavailable
    if (req.body.status === 'unavailable' && req.body.reason) {
      bike.availability.reason = req.body.reason;
    } else if (req.body.status === 'available') {
      bike.availability.reason = ''; // Clear reason if available
    }
    
    // Update unavailable dates if provided
    if (req.body.unavailableDates) {
      bike.availability.unavailableDates = req.body.unavailableDates;
    }
    
    await bike.save();
    
    res.json({ 
      message: 'Bike availability updated', 
      availability: bike.availability 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
