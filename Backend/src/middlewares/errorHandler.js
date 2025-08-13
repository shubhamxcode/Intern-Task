import config from '../config/app.js';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : 'Hidden in production',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    status: 500,
    message: 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = Object.values(err.errors).map(e => e.message);
  }

  if (err.name === 'CastError') {
    error.status = 400;
    error.message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    error.status = 409;
    error.message = 'Duplicate field value';
  }

  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Handle Axios errors (API calls)
  if (err.isAxiosError) {
    error.status = err.response?.status || 500;
    error.message = err.response?.data?.message || 'External API Error';
    
    if (err.response?.status === 401) {
      error.message = 'Unauthorized access to external API';
    } else if (err.response?.status === 403) {
      error.message = 'Forbidden access to external API';
    } else if (err.response?.status === 404) {
      error.message = 'External resource not found';
    } else if (err.response?.status >= 500) {
      error.message = 'External service unavailable';
    }
  }

  // Handle custom application errors
  if (err.statusCode) {
    error.status = err.statusCode;
    error.message = err.message;
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Create custom application error
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default { errorHandler, AppError, asyncHandler }; 