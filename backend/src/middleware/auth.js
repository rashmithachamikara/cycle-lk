// const jwt = require('jsonwebtoken');
// const config = require('../config/db');
// const { User } = require('../models');

// /**
//  * Middleware to authenticate JWT token
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  * @param {Function} next - Express next function
//  */
// exports.auth = (allowedRoles = []) => {
//   return async (req, res, next) => {
//     // Log incoming request
//     console.log(`Auth middleware: Request received - ${req.method} ${req.originalUrl || req.url}`);
    
//     // Safety check to ensure req is properly initialized
//     if (!req || typeof req !== 'object') {
//       console.error('Auth middleware: Invalid request object');
//       return res.status(500).json({ message: 'Invalid request object' });
//     }

//     // Get token from header - ensuring headers exists
//     const headers = req.headers || {};
//     const token = headers['x-auth-token'] || (req.get ? req.get('x-auth-token') : null);

//     // Check if no token
//     if (!token) {
//       console.error('Auth middleware: No token provided');
//       return res.status(401).json({ message: 'No token, authorization denied' });
//     }

//     try {
//       // Verify token
//       const decoded = jwt.verify(token, config.jwtSecret);
      
//       // Add user from payload
//       req.user = decoded.user;
      
//       // If no roles are specified, just authenticate
//       if (allowedRoles.length === 0) {
//         return next();
//       }
      
//       // Check user role if roles are specified
//       const user = await User.findById(req.user.id);
      
//       if (!user) {
//         console.error(`Auth middleware: User not found - ID: ${req.user.id}`);
//         return res.status(404).json({ message: 'User not found' });
//       }
      
//       if (!allowedRoles.includes(user.role)) {
//         console.error(`Auth middleware: Access denied for user ${req.user.id} with role ${user.role}. Required: ${allowedRoles.join(' or ')}`);
//         return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
//       }
      
//       next();
//     } catch (err) {
//       console.error('Auth middleware: Token validation error:', err.message);
//       res.status(401).json({ message: 'Token is not valid' });
//     }
//   };
// };



const jwt = require('jsonwebtoken');
const config = require('../config/db'); // Assuming this holds your jwtSecret
const { User, Partner } = require('../models'); // <-- Import the Partner model

/**
 * Middleware to authenticate JWT token and authorize roles.
 * If the role is 'partner', it also finds and attaches the partnerId.
 */
exports.auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    console.log(`Auth middleware: Request received - ${req.method} ${req.originalUrl}`);

    const token = req.header('x-auth-token');

    if (!token) {
      console.error('Auth middleware: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded.user; // req.user now has { id: 'user_id_from_token' }

      if (allowedRoles.length === 0) {
        return next();
      }
      
      const user = await User.findById(req.user.id);
      console.log(`Auth middleware: User found - ID: ${user._id}, Role: ${user.role}`);
      
      if (!user) {
        console.error(`Auth middleware: User not found - ID: ${req.user.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!allowedRoles.includes(user.role)) {
        console.error(`Auth middleware: Access denied for user ${user._id} with role ${user.role}.`);
        return res.status(403).json({ message: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
      }

      // ====================================================================
      //  START: NEW LOGIC TO FIND AND ATTACH PARTNER ID
      // ====================================================================
      // If the user's role is 'partner', we MUST find their partner profile
      // to get the partnerId needed by the bike controller.
      if (user.role === 'partner') {
        const partnerProfile = await Partner.findOne({ userId: user._id });

        if (!partnerProfile) {
          console.error(`Auth middleware: User ${user._id} has 'partner' role but no matching partner profile could be found.`);
          return res.status(403).json({ message: 'Access denied: Partner profile not found.' });
        }

        // Attach the Partner's MongoDB _id to the request object.
        // This makes it available in the bikeController.
        req.user.partnerId = partnerProfile._id;
        console.log(`Auth middleware: Partner profile found. Attached partnerId: ${req.user.partnerId} userId: ${user._id}`);
      }
      // ====================================================================
      //  END: NEW LOGIC
      // ====================================================================
      
      next();
    } catch (err) {
      console.error('Auth middleware: Token validation error:', err.message);
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
        console.error(`userAccess middleware: User not found - ID: ${req.user.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.role !== 'admin') {
        console.error(`userAccess middleware: Access denied for user ${req.user.id} with role ${user.role}`);
        return res.status(403).json({ message: 'Access denied.' });
      }
      
      next();
    } catch (err) {
      console.error('userAccess middleware: Server error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
};
