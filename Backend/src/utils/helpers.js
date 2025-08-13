import jwt from 'jsonwebtoken';
import config from '../config/app.js';

/**
 * Generate JWT token for user
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.login,
      email: user.email,
      avatar: user.avatar_url
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize filename for safe file operations
 */
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Generate unique branch name for test cases
 */
export const generateBranchName = (prefix = 'test-cases') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate GitHub repository URL
 */
export const isValidGitHubUrl = (url) => {
  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
  return githubRegex.test(url);
};

/**
 * Extract owner and repo from GitHub URL
 */
export const parseGitHubUrl = (url) => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
};

/**
 * Delay function for rate limiting
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let attempt = 1;
  
  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const delayMs = baseDelay * Math.pow(2, attempt - 1);
      await delay(delayMs);
      attempt++;
    }
  }
};

/**
 * Validate test case summary object
 */
export const validateTestSummary = (summary) => {
  const required = ['id', 'title', 'description', 'type', 'file'];
  const missing = required.filter(field => !summary[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  const validTypes = ['unit', 'integration', 'e2e', 'performance'];
  if (!validTypes.includes(summary.type)) {
    throw new Error(`Invalid test type: ${summary.type}`);
  }
  
  const validPriorities = ['high', 'medium', 'low'];
  if (summary.priority && !validPriorities.includes(summary.priority)) {
    throw new Error(`Invalid priority: ${summary.priority}`);
  }
  
  return true;
};

/**
 * Check if file is a text file based on extension
 */
export const isTextFile = (filename) => {
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go',
    '.php', '.rb', '.swift', '.kt', '.scala', '.rust', '.vue', '.html', '.css',
    '.scss', '.sass', '.less', '.sql', '.sh', '.bash', '.ps1', '.json', '.xml',
    '.yaml', '.yml', '.md', '.txt', '.dockerfile', '.gitignore', '.env'
  ];
  
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return textExtensions.includes(extension);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove sensitive information from user object
 */
export const sanitizeUser = (user) => {
  const { access_token, ...sanitized } = user;
  return sanitized;
};

export default {
  generateToken,
  isValidEmail,
  sanitizeFilename,
  generateBranchName,
  formatFileSize,
  isValidGitHubUrl,
  parseGitHubUrl,
  delay,
  retry,
  validateTestSummary,
  isTextFile,
  truncateText,
  deepClone,
  sanitizeUser
}; 