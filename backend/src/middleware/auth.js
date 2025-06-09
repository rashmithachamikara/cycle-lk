const jwt = require('jsonwebtoken');
const config = require('../config/db');
const { User } = require('../models');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    // Safety check to ensure req is properly initialized
    if (!req || typeof req !== 'object') {
      return res.status(500).json({ message: 'Invalid request object' });
    }

    // Get token from header - ensuring headers exists
    const headers = req.headers || {};
    const token = headers['x-auth-token'] || (req.get ? req.get('x-auth-token') : null);

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Add user from payload
      req.user = decoded.user;
      
      // If no roles are specified, just authenticate
      if (allowedRoles.length === 0) {
        return next();
      }
      
      // Check user role if roles are specified
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
      }
      
      next();  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
  };
};

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.admin = exports.auth(['admin']);

/**
 * Middleware to check if user is a partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.partner = exports.auth(['partner', 'admin']);

/**
 * Middleware to check if user is accessing their own data or is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.userAccess = () => {
  return async (req, res, next) => {
    try {
      // Allow if user is accessing their own data
      if (req.user && req.user.id === req.params.id) {
        return next();
      }
      
      // Check if user is admin
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
      }
      
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};
