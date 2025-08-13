import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   GET /api/auth/github-url
 * @desc    Get GitHub OAuth authorization URL
 * @access  Public
 */
router.get('/github-url', authController.getAuthUrl);

/**
 * @route   POST /api/auth/github/callback
 * @desc    Handle GitHub OAuth callback
 * @access  Public
 */
router.post('/github/callback', authController.handleCallback);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh user data from GitHub
 * @access  Public
 */
router.post('/refresh', authController.refreshUser);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token on client)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

export default router; 