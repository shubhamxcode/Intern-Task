import aiService from '../services/aiService.js';
import githubService from '../services/githubService.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { validateTestSummary, generateBranchName, sanitizeFilename } from '../utils/helpers.js';

/**
 * Generate test case summaries for selected files
 */
export const generateSummaries = asyncHandler(async (req, res) => {
  const { accessToken, files, owner, repo } = req.body;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new AppError('Files array is required and cannot be empty', 400);
  }
  
  if (files.length > 5) {
    throw new AppError('Maximum 5 files can be processed at once', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  try {
    // Get file contents from GitHub
    const filePaths = files.map(file => file.path);
    const fileResults = await githubService.getMultipleFileContents(accessToken, owner, repo, filePaths);
    
    const successfulFiles = fileResults.filter(result => result.success);
    const failedFiles = fileResults.filter(result => !result.success);
    
    if (successfulFiles.length === 0) {
      throw new AppError('No files could be fetched successfully', 400);
    }
    
    // Prepare files for AI processing
    const filesForAI = successfulFiles.map(result => ({
      path: result.path,
      content: result.data.content,
      name: result.data.name,
      size: result.data.size
    }));
    
    // Generate test case summaries using AI
    const summaries = await aiService.generateTestCaseSummaries(filesForAI);
    
    // Validate and enhance summaries
    const validatedSummaries = summaries.map(summary => {
      try {
        validateTestSummary(summary);
        return {
          ...summary,
          framework: aiService.detectTestingFramework(summary.file, 'react'),
          createdAt: new Date().toISOString()
        };
      } catch (error) {
        console.warn(`Invalid test summary: ${error.message}`, summary);
        return null;
      }
    }).filter(Boolean);
    
    res.json({
      success: true,
      message: 'Test case summaries generated successfully',
      summaries: validatedSummaries,
      metadata: {
        totalFiles: files.length,
        processedFiles: successfulFiles.length,
        failedFiles: failedFiles.length,
        generatedSummaries: validatedSummaries.length,
        errors: failedFiles.map(f => ({ path: f.path, error: f.error }))
      }
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to generate test case summaries', 500);
  }
});

/**
 * Generate actual test code for a specific test case summary
 */
export const generateTestCode = asyncHandler(async (req, res) => {
  const { accessToken, testSummary, owner, repo, framework } = req.body;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!testSummary) {
    throw new AppError('Test summary is required', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  try {
    // Validate test summary
    validateTestSummary(testSummary);
    
    // Get the source file content
    const fileData = await githubService.getFileContent(accessToken, owner, repo, testSummary.file);
    
    // Determine testing framework
    const detectedFramework = framework || aiService.detectTestingFramework(testSummary.file, 'react');
    
    // Generate test code using AI
    const testCode = await aiService.generateTestCode(testSummary, fileData.content, detectedFramework);
    
    res.json({
      success: true,
      message: 'Test code generated successfully',
      testCode: {
        fileName: testCode.fileName,
        content: testCode.content,
        framework: testCode.framework,
        sourceFile: testSummary.file,
        testSummary: testCode.testSummary,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to generate test code', 500);
  }
});

/**
 * Generate test code for multiple summaries
 */
export const generateMultipleTests = asyncHandler(async (req, res) => {
  const { accessToken, testSummaries, owner, repo, framework } = req.body;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!testSummaries || !Array.isArray(testSummaries) || testSummaries.length === 0) {
    throw new AppError('Test summaries array is required and cannot be empty', 400);
  }
  
  if (testSummaries.length > 10) {
    throw new AppError('Maximum 10 test cases can be generated at once', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  try {
    const results = [];
    const errors = [];
    
    // Process each test summary
    for (const summary of testSummaries) {
      try {
        validateTestSummary(summary);
        
        // Get source file content
        const fileData = await githubService.getFileContent(accessToken, owner, repo, summary.file);
        
        // Determine framework
        const detectedFramework = framework || aiService.detectTestingFramework(summary.file, 'react');
        
        // Generate test code
        const testCode = await aiService.generateTestCode(summary, fileData.content, detectedFramework);
        
        results.push({
          summary,
          testCode: {
            fileName: testCode.fileName,
            content: testCode.content,
            framework: testCode.framework,
            sourceFile: summary.file
          },
          success: true
        });
        
      } catch (error) {
        errors.push({
          summary,
          error: error.message,
          success: false
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Test code generation completed',
      results,
      errors,
      summary: {
        total: testSummaries.length,
        successful: results.length,
        failed: errors.length
      }
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to generate multiple test codes', 500);
  }
});

/**
 * Create a pull request with generated test files
 */
export const createTestPullRequest = asyncHandler(async (req, res) => {
  const { 
    accessToken, 
    testFiles, 
    owner, 
    repo, 
    title = 'Add AI-generated test cases',
    description = 'This PR adds test cases generated by the Test Case Generator application.'
  } = req.body;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!testFiles || !Array.isArray(testFiles) || testFiles.length === 0) {
    throw new AppError('Test files array is required and cannot be empty', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  try {
    // Generate unique branch name
    const branchName = generateBranchName('ai-generated-tests');
    
    // Create new branch
    await githubService.createBranch(accessToken, owner, repo, branchName);
    
    const createdFiles = [];
    const errors = [];
    
    // Create test files in the new branch
    for (const testFile of testFiles) {
      try {
        const sanitizedFileName = sanitizeFilename(testFile.fileName);
        const filePath = `tests/${sanitizedFileName}`;
        
        const commitMessage = `Add test file: ${sanitizedFileName}`;
        
        const result = await githubService.createFile(
          accessToken,
          owner,
          repo,
          filePath,
          testFile.content,
          commitMessage,
          branchName
        );
        
        createdFiles.push({
          fileName: sanitizedFileName,
          path: filePath,
          sha: result.content.sha,
          htmlUrl: result.content.html_url
        });
        
      } catch (error) {
        errors.push({
          fileName: testFile.fileName,
          error: error.message
        });
      }
    }
    
    if (createdFiles.length === 0) {
      throw new AppError('No test files could be created', 500);
    }
    
    // Create pull request
    const prBody = `${description}\n\n## Generated Test Files\n\n` +
      createdFiles.map(file => `- \`${file.path}\``).join('\n') +
      `\n\n## Summary\n- Total files: ${testFiles.length}\n- Successfully created: ${createdFiles.length}\n- Failed: ${errors.length}` +
      (errors.length > 0 ? `\n\n## Errors\n${errors.map(e => `- ${e.fileName}: ${e.error}`).join('\n')}` : '');
    
    const pullRequest = await githubService.createPullRequest(
      accessToken,
      owner,
      repo,
      title,
      prBody,
      branchName
    );
    
    res.json({
      success: true,
      message: 'Pull request created successfully with test files',
      pullRequest: {
        id: pullRequest.id,
        number: pullRequest.number,
        title: pullRequest.title,
        htmlUrl: pullRequest.html_url,
        branch: branchName
      },
      files: {
        created: createdFiles,
        errors: errors
      },
      summary: {
        totalFiles: testFiles.length,
        createdFiles: createdFiles.length,
        failedFiles: errors.length
      }
    });
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create pull request with test files', 500);
  }
});

/**
 * Get supported testing frameworks
 */
export const getSupportedFrameworks = asyncHandler(async (req, res) => {
  const frameworks = {
    'javascript': ['jest', 'vitest', 'mocha', 'jasmine'],
    'typescript': ['jest', 'vitest', 'mocha'],
    'python': ['pytest', 'unittest', 'nose2'],
    'java': ['junit', 'testng'],
    'csharp': ['xunit', 'nunit', 'mstest'],
    'go': ['testing', 'ginkgo'],
    'php': ['phpunit', 'codeception'],
    'ruby': ['rspec', 'minitest']
  };
  
  res.json({
    success: true,
    frameworks,
    defaultFrameworks: {
      '.js': 'jest',
      '.jsx': 'jest',
      '.ts': 'jest',
      '.tsx': 'jest',
      '.py': 'pytest',
      '.java': 'junit',
      '.cs': 'xunit',
      '.go': 'testing',
      '.php': 'phpunit',
      '.rb': 'rspec'
    }
  });
});

export default {
  generateSummaries,
  generateTestCode,
  generateMultipleTests,
  createTestPullRequest,
  getSupportedFrameworks
}; 