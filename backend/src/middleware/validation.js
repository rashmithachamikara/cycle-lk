/**
 * Middleware for validating request data
 */

/**
 * Validate user registration request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validateUserRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  // Check required fields
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });
  if (!firstName) errors.push({ field: 'firstName', message: 'First name is required' });
  if (!lastName) errors.push({ field: 'lastName', message: 'Last name is required' });

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }

  // Validate password strength
  if (password && password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate login request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate bike creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validateBike = (req, res, next) => {
  const { name, type, hourlyRate } = req.body;
  const errors = [];

  if (!name) errors.push({ field: 'name', message: 'Bike name is required' });
  if (!type) errors.push({ field: 'type', message: 'Bike type is required' });
  if (!hourlyRate) errors.push({ field: 'hourlyRate', message: 'Hourly rate is required' });

  if (hourlyRate && isNaN(parseFloat(hourlyRate))) {
    errors.push({ field: 'hourlyRate', message: 'Hourly rate must be a number' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate booking creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validateBooking = (req, res, next) => {
  const { bikeId, startTime, endTime } = req.body;
  const errors = [];

  if (!bikeId) errors.push({ field: 'bikeId', message: 'Bike ID is required' });
  if (!startTime) errors.push({ field: 'startTime', message: 'Start time is required' });
  if (!endTime) errors.push({ field: 'endTime', message: 'End time is required' });

  // Note: userId is obtained from req.user.id (from auth middleware), not from request body

  // Validate dates
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime())) {
      errors.push({ field: 'startTime', message: 'Invalid start time format' });
    }
    
    if (isNaN(end.getTime())) {
      errors.push({ field: 'endTime', message: 'Invalid end time format' });
    }
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      errors.push({ field: 'endTime', message: 'End time must be after start time' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validate review creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validateReview = (req, res, next) => {
  const { bikeId, rating, comment } = req.body;
  const errors = [];

  if (!bikeId) errors.push({ field: 'bikeId', message: 'Bike ID is required' });
  if (!rating) errors.push({ field: 'rating', message: 'Rating is required' });

  // Validate rating is between 1 and 5
  if (rating && (rating < 1 || rating > 5)) {
    errors.push({ field: 'rating', message: 'Rating must be between 1 and 5' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
