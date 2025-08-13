import express from 'express';
import githubController from '../controllers/githubController.js';

const router = express.Router();

/**
 * @route   POST /api/github/repositories
 * @desc    Get user repositories
 * @access  Private
 */
router.post('/repositories', githubController.getRepositories);

/**
 * @route   POST /api/github/:owner/:repo/contents
 * @desc    Get repository contents (files and folders)
 * @access  Private
 */
router.post('/:owner/:repo/contents', githubController.getRepositoryContents);

/**
 * @route   POST /api/github/:owner/:repo/file/*
 * @desc    Get file content by path
 * @access  Private
 */
router.post('/:owner/:repo/file/*', (req, res, next) => {
  // Extract the file path from the wildcard
  req.params.path = req.params[0];
  next();
}, githubController.getFileContent);

/**
 * @route   POST /api/github/:owner/:repo/files
 * @desc    Get multiple file contents
 * @access  Private
 */
router.post('/:owner/:repo/files', githubController.getMultipleFiles);

/**
 * @route   POST /api/github/:owner/:repo/branch
 * @desc    Create a new branch
 * @access  Private
 */
router.post('/:owner/:repo/branch', githubController.createBranch);

/**
 * @route   POST /api/github/:owner/:repo/create-file
 * @desc    Create a new file in repository
 * @access  Private
 */
router.post('/:owner/:repo/create-file', githubController.createFile);

/**
 * @route   POST /api/github/:owner/:repo/pull-request
 * @desc    Create a pull request
 * @access  Private
 */
router.post('/:owner/:repo/pull-request', githubController.createPullRequest);

export default router; 