import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { userCache } from '../config/userCache.js';
/**
 * Authentication middleware
 * Verifies JWT access token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid access token',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Access token is missing',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your session has expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED',
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'The provided token is invalid',
        });
      }
      throw error;
    }

    // Check if user still exists
    const userId = decoded.userId.toString(); 
    let user = userCache.get(userId);
    

    if (!user) {
      // Cache miss — go to DB
      console.log(`[Auth] Cache miss — fetching user ${userId} from DB`);
      user = await User.findById(userId);
    
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          message: 'The user belonging to this token no longer exists',
        });
      }

      // Cache user for next request
      userCache.set(userId, user, 60); // Cache for 60 seconds
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      userCache.del(userId);
      return res.status(401).json({
        success: false,
        error: 'Password changed',
        message: 'Password was recently changed. Please log in again.',
        code: 'PASSWORD_CHANGED',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if valid token is provided, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId.toString();
      
      let user = userCache.get(userId);
      if (!user) {
        user = await User.findById(userId);
        if (user) userCache.set(userId, user);
      }
    
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    } catch (error) {
      console.log('[OptionalAuth] Invalid token, continuing without auth');
    }

    next();
  } catch (error) {
    console.error('[OptionalAuth Middleware] Error:', error.message);
    next();
  }
};

/**
 * Role-based authorization middleware
 * Use after authenticate middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        message: 'Please log in first',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

export default authenticate;

