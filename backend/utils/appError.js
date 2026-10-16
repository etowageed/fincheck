// backend/utils/appError.js
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Mark as operational error
    // Optional structured details (e.g. { code: 'QUOTA_EXHAUSTED', featureKey, limit })
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
