const jwt = require('jsonwebtoken');
const { STATUS_CODE, ERROR_MESSAGES } = require('../utils/statusCode');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    if (!user.isVerified) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.OTP_NOT_VERIFIED,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
      });
    }
    return res.status(STATUS_CODE.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.TOKEN_INVALID,
    });
  }
};

/**
 * Check if user has admin role
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(STATUS_CODE.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
    });
  }
  next();
};

/**
 * Check if user has student role
 */
const authorizeStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(STATUS_CODE.FORBIDDEN).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN_ACCESS,
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isVerified) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeStudent,
  optionalAuth,
};


