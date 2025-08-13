import config from '../config/app.js';
import githubService from '../services/githubService.js';
import { generateToken } from '../utils/helpers.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

/**
 * Get GitHub OAuth URL for authentication
 */
export const getAuthUrl = asyncHandler(async (req, res) => {
  const { redirect_uri } = req.query;
  
  // Validate redirect URI (optional security check)
  const allowedRedirects = [
    config.frontendUrl,
    `${config.frontendUrl}/auth/github/callback`
  ];
  
  if (redirect_uri && !allowedRedirects.includes(redirect_uri)) {
    throw new AppError('Invalid redirect URI', 400);
  }
  
  const state = Math.random().toString(36).substring(2); // Simple state for CSRF protection
  const authUrl = `${config.github.oauthUrl}/authorize?` +
    `client_id=${config.github.clientId}&` +
    `redirect_uri=${encodeURIComponent(redirect_uri || config.github.redirectUri)}&` +
    `scope=repo,user:email&` +
    `state=${state}`;
  
  res.json({
    authUrl,
    state,
    message: 'Redirect user to this URL for GitHub authentication'
  });
});

/**
 * Handle GitHub OAuth callback
 */
export const handleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.body;
  
  // Check for OAuth errors
  if (error) {
    throw new AppError(`GitHub OAuth error: ${error}`, 400);
  }
  
  // Validate required parameters
  if (!code) {
    throw new AppError('Authorization code is required', 400);
  }
  
  try {
    // Exchange code for access token
    const accessToken = await githubService.exchangeCodeForToken(code);
    
    // Get user information
    const githubUser = await githubService.getUser(accessToken);
    
    // Generate JWT token
    const token = generateToken(githubUser);
    
    // Prepare user data for response
    const userData = {
      id: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      name: githubUser.name,
      avatar: githubUser.avatar_url,
      bio: githubUser.bio,
      location: githubUser.location,
      company: githubUser.company,
      blog: githubUser.blog,
      publicRepos: githubUser.public_repos,
      followers: githubUser.followers,
      following: githubUser.following,
      createdAt: githubUser.created_at,
      accessToken // Include access token for GitHub API calls
    };
    
    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: userData
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Authentication failed', 500);
  }
});

/**
 * Refresh user data from GitHub
 */
export const refreshUser = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  try {
    // Get updated user information
    const githubUser = await githubService.getUser(accessToken);
    
    // Generate new JWT token
    const token = generateToken(githubUser);
    
    // Prepare updated user data
    const userData = {
      id: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      name: githubUser.name,
      avatar: githubUser.avatar_url,
      bio: githubUser.bio,
      location: githubUser.location,
      company: githubUser.company,
      blog: githubUser.blog,
      publicRepos: githubUser.public_repos,
      followers: githubUser.followers,
      following: githubUser.following,
      createdAt: githubUser.created_at,
      accessToken
    };
    
    res.json({
      success: true,
      message: 'User data refreshed successfully',
      token,
      user: userData
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to refresh user data', 500);
  }
});

/**
 * Verify JWT token
 */
export const verifyToken = asyncHandler(async (req, res) => {
  // Token is already verified by the authenticateToken middleware
  const user = req.user;
  
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    }
  });
});

/**
 * Logout user (client-side token removal)
 */
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

export default {
  getAuthUrl,
  handleCallback,
  refreshUser,
  verifyToken,
  logout
}; 