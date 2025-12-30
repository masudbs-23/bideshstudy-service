/**
 * Centralized HTTP Status Codes
 * Used throughout the application for consistent API responses
 */

const STATUS_CODE = {
  // Success Codes
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Error Codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error Codes
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: "Registration successful. Please verify your OTP.",
  OTP_VERIFIED: "OTP verified successfully.",
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logout successful.",
  PASSWORD_RESET_SENT: "Password reset link sent to your email.",
  PASSWORD_RESET_SUCCESS: "Password reset successful.",
  PROFILE_UPDATED: "Profile updated successfully.",
  DOCUMENT_UPLOADED: "Document uploaded successfully.",
  DOCUMENT_DELETED: "Document deleted successfully.",
  APPLICATION_SUBMITTED: "Application submitted successfully.",
  APPLICATION_UPDATED: "Application updated successfully.",
  EVENT_BOOKED: "Event booked successfully.",
  MESSAGE_SENT: "Message sent successfully.",
  INSTITUTION_CREATED: "Institution created successfully.",
  INSTITUTION_UPDATED: "Institution updated successfully.",
  INSTITUTION_DELETED: "Institution deleted successfully.",
  EVENT_CREATED: "Event created successfully.",
  EVENT_UPDATED: "Event updated successfully.",
  EVENT_DELETED: "Event deleted successfully.",
};

const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_NOT_FOUND: "User not found.",
  USER_ALREADY_EXISTS: "User already exists with this email or mobile.",
  INVALID_OTP: "Invalid or expired OTP.",
  OTP_EXPIRED: "OTP has expired. Please request a new one.",
  OTP_NOT_VERIFIED: "Please verify your OTP first.",
  TOKEN_EXPIRED: "Token has expired.",
  TOKEN_INVALID: "Invalid token.",
  UNAUTHORIZED_ACCESS: "Unauthorized access.",
  FORBIDDEN_ACCESS: "You don't have permission to access this resource.",
  PASSWORD_MISMATCH: "Current password is incorrect.",
  PASSWORD_RESET_TOKEN_INVALID: "Invalid or expired password reset token.",

  // Validation Errors
  VALIDATION_ERROR: "Validation error.",
  INVALID_INPUT: "Invalid input provided.",
  MISSING_REQUIRED_FIELDS: "Missing required fields.",
  INVALID_EMAIL: "Invalid email format.",
  INVALID_MOBILE: "Invalid mobile number format.",
  INVALID_PASSWORD: "Password must be at least 8 characters long.",

  // Document Errors
  DOCUMENT_NOT_FOUND: "Document not found.",
  DOCUMENT_UPLOAD_FAILED: "Failed to upload document.",
  INVALID_FILE_TYPE: "Invalid file type.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",

  // Institution Errors
  INSTITUTION_NOT_FOUND: "Institution not found.",
  INSTITUTION_ALREADY_EXISTS: "Institution with this name already exists.",

  // Application Errors
  APPLICATION_NOT_FOUND: "Application not found.",
  APPLICATION_ALREADY_EXISTS: "You have already applied to this institution.",
  INVALID_APPLICATION_STATUS: "Invalid application status.",

  // Event Errors
  EVENT_NOT_FOUND: "Event not found.",
  EVENT_ALREADY_BOOKED: "You have already booked this event.",
  EVENT_FULL: "Event is fully booked.",
  EVENT_EXPIRED: "Event has expired.",

  // Chat Errors
  CONVERSATION_NOT_FOUND: "Conversation not found.",
  MESSAGE_NOT_FOUND: "Message not found.",

  // General Errors
  INTERNAL_SERVER_ERROR: "Internal server error.",
  DATABASE_ERROR: "Database error occurred.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  NOT_FOUND: "Resource not found.",
};

module.exports = {
  STATUS_CODE,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
};


