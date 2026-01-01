const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general API routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for OTP requests
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 requests per 10 minutes
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait for 10 minutes before requesting another OTP.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil((options.resetTime - Date.now()) / 1000); // seconds until reset
    const minutes = Math.ceil(retryAfter / 60);
    res.status(options.statusCode).json({
      success: false,
      message: `Too many OTP requests. Please wait for ${minutes} minute${minutes > 1 ? 's' : ''} before requesting another OTP.`,
    });
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  otpLimiter,
};


