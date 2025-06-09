const { Bike, Partner, Location } = require('../models');

/**
 * Get all bikes with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBikes = async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, available, partnerId, limit, sort } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (location) filter.location = location;
    if (type) filter.type = type;
    if (partnerId) filter.partnerId = partnerId;
    if (available === 'true') filter['availability.status'] = true;
    
    if (minPrice || maxPrice) {
      filter['pricing.perDay'] = {};
      if (minPrice) filter['pricing.perDay'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.perDay'].$lte = Number(maxPrice);
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
    
    // Create the query
    let query = Bike.find(filter)
      .populate('partnerId', 'companyName rating')
      .sort(sortOptions);
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(Number(limit));
    }
    
    const bikes = await query;
    res.json(bikes);
  } catch (err) {
    console.error(err);
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
      .populate('partnerId', 'companyName rating contact email phone location businessHours');
      
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }
    
    res.json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add a new bike
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addBike = async (req, res) => {
  try {
    const bike = new Bike(req.body);
    
    // Validate partner exists
    const partner = await Partner.findById(bike.partnerId);
    if (!partner) {
      return res.status(400).json({ message: 'Invalid partner ID' });
    }
    
    // Validate location exists
    const location = await Location.findOne({ name: bike.location });
    if (!location) {
      return res.status(400).json({ message: 'Invalid location' });
    }
    
    // Save bike
    await bike.save();
    
    // Update partner's bike count
    await Partner.findByIdAndUpdate(bike.partnerId, {
      $inc: { bikeCount: 1 }
    });
    
    // Update location's bike count
    await Location.findOneAndUpdate({ name: bike.location }, {
      $inc: { bikeCount: 1 }
    });
    
    res.status(201).json(bike);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
    
    // Check if the location is being changed
    if (req.body.location && req.body.location !== bike.location) {
      // Update old location's bike count (-1)
      await Location.findOneAndUpdate({ name: bike.location }, {
        $inc: { bikeCount: -1 }
      });
      
      // Update new location's bike count (+1)
      await Location.findOneAndUpdate({ name: req.body.location }, {
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
    const location = bike.location;
    
    await bike.remove();
    
    // Update partner's bike count
    await Partner.findByIdAndUpdate(partnerId, {
      $inc: { bikeCount: -1 }
    });
    
    // Update location's bike count
    await Location.findOneAndUpdate({ name: location }, {
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
    
    // Get top rated bikes that are available
    const bikes = await Bike.find({ 'availability.status': true })
      .sort({ rating: -1 })
      .limit(Number(limit))
      .populate('partnerId', 'companyName rating');
      
    res.json(bikes);
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
    
    // Validate partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    const bikes = await Bike.find({ partnerId });
    res.json(bikes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
