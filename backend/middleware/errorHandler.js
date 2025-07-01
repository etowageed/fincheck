// backend/middlewares/errorHandler.js
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Extracting the value that caused the duplicate error
  // This typically looks like E11000 duplicate key error collection: mydb.users index: name_1 dup key: { name: "testuser" }
  // You might need to adjust based on the exact error structure for your duplicate errors.
  const value = err.keyValue ? Object.values(err.keyValue)[0] : 'unknown';
  const message = `Duplicate field value: '${value}'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // Mongoose validation errors have an 'errors' object with individual validation messages
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send specific message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    // 1) Log the original, full error for internal debugging
    console.error('ERROR 💥', err);

    // 2) Send generic message to the client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // Set default status code and status if not already defined
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // In development, send detailed error information
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // In production, transform specific errors into operational AppErrors
    // Use the original 'err' object, and reassign 'error' if transformed
    let error = err;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (error.code === 11000) {
      // MongoDB duplicate key error code
      error = handleDuplicateFieldsDB(error);
    } else if (error.name === 'ValidationError') {
      // Mongoose validation error
      error = handleValidationErrorDB(error);
    } else if (error.name === 'JsonWebTokenError') {
      // JWT invalid signature/malformed token
      error = handleJWTError();
    } else if (error.name === 'TokenExpiredError') {
      // JWT expired token
      error = handleJWTExpiredError();
    }
    // Add more specific error handling here for other known error types if needed

    // After potential transformation, send the error (which should now be operational
    // with a specific message if it was one of the handled types)
    sendErrorProd(error, res);
  }
};
