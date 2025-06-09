const { Location } = require('../models');

/**
 * Get all locations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get location by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new location (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createLocation = async (req, res) => {
  try {
    const { name, city, province, coordinates } = req.body;
    
    // Check if location with the same name exists
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(400).json({ message: 'Location with this name already exists' });
    }
    
    const location = new Location({
      name,
      city,
      province,
      coordinates
    });
    
    await location.save();
    
    res.status(201).json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a location (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a location (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    await location.remove();
    
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Search locations by name or city
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.searchLocations = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const locations = await Location.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { province: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);
    
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
