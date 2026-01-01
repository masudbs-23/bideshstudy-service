const User = require('../models/User');
const OTP = require('../models/OTP');
const { STATUS_CODE, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/statusCode');
const { generateAccessToken, generateRefreshToken, generateOTP, generateResetToken } = require('../utils/generateTokens');
const { sendEmail } = require('../config/email');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(STATUS_CODE.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || 'student',
    });

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.create({
      email: user.email,
      otp,
      type: 'verification',
    });

    // Send OTP email
    try {
      await sendEmail(user.email, 'otpVerification', [otp, user.name || 'User']);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    res.status(STATUS_CODE.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: 'User is already verified.',
      });
    }

    // Generate and save new OTP
    const otp = generateOTP();
    await OTP.create({
      email: user.email,
      otp,
      type: 'verification',
    });

    // Send OTP email
    try {
      await sendEmail(user.email, 'otpVerification', [otp, user.name || 'User']);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.',
      });
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.OTP_RESENT,
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'verification',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_OTP,
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user verification status
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.OTP_VERIFIED,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.OTP_NOT_VERIFIED,
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_INVALID,
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_INVALID,
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.status(STATUS_CODE.OK).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
      });
    }
    next(error);
  }
};

/**
 * Forgot password - Send OTP
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.status(STATUS_CODE.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    await OTP.create({
      email: user.email,
      otp,
      type: 'password_reset',
    });

    // Send OTP email
    try {
      await sendEmail(user.email, 'passwordResetOTP', [otp, user.name || 'User']);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password - Using OTP
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'password_reset',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(STATUS_CODE.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_OTP,
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update password
    user.password = password;
    await user.save();

    res.status(STATUS_CODE.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};


