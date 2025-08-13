import jwt from 'jsonwebtoken';
import config from '../config/app.js';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid access token in the Authorization header'
    });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          error: 'Invalid token',
          message: 'The provided token is invalid.'
        });
      }

      return res.status(403).json({ 
        error: 'Token verification failed',
        message: 'Unable to verify the provided token.'
      });
    }

    // Add user info to request object
    req.user = user;
    next();
  });
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

export default { authenticateToken, optionalAuth }; 