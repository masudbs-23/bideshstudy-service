const { STATUS_CODE, ERROR_MESSAGES } = require('../utils/statusCode');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: STATUS_CODE.NOT_FOUND };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: STATUS_CODE.CONFLICT };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: ERROR_MESSAGES.TOKEN_INVALID, statusCode: STATUS_CODE.UNAUTHORIZED };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: ERROR_MESSAGES.TOKEN_EXPIRED, statusCode: STATUS_CODE.UNAUTHORIZED };
  }

  res.status(error.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(STATUS_CODE.NOT_FOUND);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};


