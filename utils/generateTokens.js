const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

/**
 * Generate OTP (6-digit)
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate password reset token
 */
const generateResetToken = () => {
  return jwt.sign({ type: 'password_reset' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateResetToken,
};

