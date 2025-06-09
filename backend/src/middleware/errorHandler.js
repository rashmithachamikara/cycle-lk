/**
 * Error handling middleware
 */

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}

/**
 * Handle 404 not found errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.notFound = (req, res, next) => {
  const error = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Handle mongoose validation errors
 * @param {Error} err - Error object
 * @returns {ApiError} - Formatted API error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message
  }));
  return new ApiError(400, 'Validation Error', errors);
};

/**
 * Handle mongoose duplicate key errors
 * @param {Error} err - Error object
 * @returns {ApiError} - Formatted API error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ApiError(400, `Duplicate value: ${value} for field ${field} already exists.`);
};

/**
 * Handle JWT token errors
 * @param {Error} err - Error object
 * @returns {ApiError} - Formatted API error
 */
const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please log in again.');
};

/**
 * Handle JWT expired token errors
 * @returns {ApiError} - Formatted API error
 */
const handleJWTExpiredError = () => {
  return new ApiError(401, 'Your token has expired. Please log in again.');
};

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error
  console.error(err);

  let error = { ...err };
  error.message = err.message;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'An unexpected error occurred',
    errors: error.errors || [],
    timestamp: new Date()
  });
};

/**
 * Create a custom API error
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Array} errors - Array of error objects
 * @returns {ApiError} - API error object
 */
exports.createError = (statusCode, message, errors) => {
  return new ApiError(statusCode, message, errors);
};

/**
 * Handle async errors with try-catch
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
exports.asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
