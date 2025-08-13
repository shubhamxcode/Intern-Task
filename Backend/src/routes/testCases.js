import express from 'express';
import testCaseController from '../controllers/testCaseController.js';

const router = express.Router();

/**
 * @route   POST /api/test-cases/generate-summaries
 * @desc    Generate test case summaries for selected files
 * @access  Private
 */
router.post('/generate-summaries', testCaseController.generateSummaries);

/**
 * @route   POST /api/test-cases/generate-code
 * @desc    Generate actual test code for a specific test case summary
 * @access  Private
 */
router.post('/generate-code', testCaseController.generateTestCode);

/**
 * @route   POST /api/test-cases/generate-multiple
 * @desc    Generate test code for multiple summaries
 * @access  Private
 */
router.post('/generate-multiple', testCaseController.generateMultipleTests);

/**
 * @route   POST /api/test-cases/create-pull-request
 * @desc    Create a pull request with generated test files
 * @access  Private
 */
router.post('/create-pull-request', testCaseController.createTestPullRequest);

/**
 * @route   GET /api/test-cases/supported-frameworks
 * @desc    Get supported testing frameworks
 * @access  Private
 */
router.get('/supported-frameworks', testCaseController.getSupportedFrameworks);

export default router; 