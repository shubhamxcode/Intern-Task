import githubService from '../services/githubService.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { isTextFile } from '../utils/helpers.js';

/**
 * Get user repositories
 */
export const getRepositories = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  const { page = 1, per_page = 30 } = req.query;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  const result = await githubService.getUserRepositories(
    accessToken, 
    parseInt(page), 
    parseInt(per_page)
  );
  
  // Filter out fork repositories if requested
  const { exclude_forks } = req.query;
  let repositories = result.repositories;
  
  if (exclude_forks === 'true') {
    repositories = repositories.filter(repo => !repo.fork);
  }
  
  // Add additional metadata
  const enhancedRepos = repositories.map(repo => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    owner: {
      login: repo.owner.login,
      avatar: repo.owner.avatar_url
    },
    htmlUrl: repo.html_url,
    language: repo.language,
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    size: repo.size,
    defaultBranch: repo.default_branch,
    openIssuesCount: repo.open_issues_count,
    hasIssues: repo.has_issues,
    hasWiki: repo.has_wiki,
    fork: repo.fork,
    archived: repo.archived,
    disabled: repo.disabled,
    pushedAt: repo.pushed_at,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at
  }));
  
  res.json({
    success: true,
    repositories: enhancedRepos,
    pagination: {
      page: parseInt(page),
      perPage: parseInt(per_page),
      total: result.totalCount,
      hasNextPage: result.hasNextPage
    }
  });
});

/**
 * Get repository contents (files and folders)
 */
export const getRepositoryContents = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  const { owner, repo } = req.params;
  const { path = '' } = req.query;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  const contents = await githubService.getRepositoryContents(accessToken, owner, repo, path);
  
  // Separate files and folders
  const folders = contents.filter(item => item.type === 'dir');
  const files = contents.filter(item => item.type === 'file');
  
  // Filter and enhance code files
  const codeFiles = githubService.filterCodeFiles(files).map(file => ({
    name: file.name,
    path: file.path,
    size: file.size,
    type: file.type,
    downloadUrl: file.download_url,
    htmlUrl: file.html_url,
    isTextFile: isTextFile(file.name)
  }));
  
  // Enhance folders
  const enhancedFolders = folders.map(folder => ({
    name: folder.name,
    path: folder.path,
    type: folder.type,
    htmlUrl: folder.html_url
  }));
  
  res.json({
    success: true,
    path: path || '/',
    folders: enhancedFolders,
    files: codeFiles,
    totalFiles: files.length,
    totalCodeFiles: codeFiles.length
  });
});

/**
 * Get file content
 */
export const getFileContent = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  const { owner, repo, path } = req.params;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!owner || !repo || !path) {
    throw new AppError('Repository owner, name, and file path are required', 400);
  }
  
  const fileData = await githubService.getFileContent(accessToken, owner, repo, path);
  
  res.json({
    success: true,
    file: {
      name: fileData.name,
      path: fileData.path,
      size: fileData.size,
      content: fileData.content,
      sha: fileData.sha
    }
  });
});

/**
 * Get multiple file contents
 */
export const getMultipleFiles = asyncHandler(async (req, res) => {
  const { accessToken, filePaths } = req.body;
  const { owner, repo } = req.params;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
    throw new AppError('File paths array is required', 400);
  }
  
  if (filePaths.length > 10) {
    throw new AppError('Maximum 10 files can be fetched at once', 400);
  }
  
  const results = await githubService.getMultipleFileContents(accessToken, owner, repo, filePaths);
  
  const successfulFiles = results.filter(result => result.success);
  const failedFiles = results.filter(result => !result.success);
  
  res.json({
    success: true,
    files: successfulFiles.map(result => ({
      path: result.path,
      name: result.data.name,
      content: result.data.content,
      size: result.data.size,
      sha: result.data.sha
    })),
    errors: failedFiles.map(result => ({
      path: result.path,
      error: result.error
    })),
    summary: {
      total: filePaths.length,
      successful: successfulFiles.length,
      failed: failedFiles.length
    }
  });
});

/**
 * Create a new branch
 */
export const createBranch = asyncHandler(async (req, res) => {
  const { accessToken, branchName, fromBranch = 'main' } = req.body;
  const { owner, repo } = req.params;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  if (!branchName) {
    throw new AppError('Branch name is required', 400);
  }
  
  // Validate branch name
  const branchNameRegex = /^[a-zA-Z0-9._/-]+$/;
  if (!branchNameRegex.test(branchName)) {
    throw new AppError('Invalid branch name format', 400);
  }
  
  const branch = await githubService.createBranch(accessToken, owner, repo, branchName, fromBranch);
  
  res.json({
    success: true,
    message: 'Branch created successfully',
    branch: {
      name: branchName,
      ref: branch.ref,
      sha: branch.object.sha,
      url: branch.url
    }
  });
});

/**
 * Create a new file in repository
 */
export const createFile = asyncHandler(async (req, res) => {
  const { accessToken, path, content, message, branch = 'main' } = req.body;
  const { owner, repo } = req.params;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  if (!path || !content || !message) {
    throw new AppError('File path, content, and commit message are required', 400);
  }
  
  const result = await githubService.createFile(accessToken, owner, repo, path, content, message, branch);
  
  res.json({
    success: true,
    message: 'File created successfully',
    file: {
      name: result.content.name,
      path: result.content.path,
      sha: result.content.sha,
      size: result.content.size,
      htmlUrl: result.content.html_url
    },
    commit: {
      sha: result.commit.sha,
      message: result.commit.message,
      htmlUrl: result.commit.html_url
    }
  });
});

/**
 * Create a pull request
 */
export const createPullRequest = asyncHandler(async (req, res) => {
  const { accessToken, title, body, head, base = 'main' } = req.body;
  const { owner, repo } = req.params;
  
  if (!accessToken) {
    throw new AppError('GitHub access token is required', 400);
  }
  
  if (!owner || !repo) {
    throw new AppError('Repository owner and name are required', 400);
  }
  
  if (!title || !head) {
    throw new AppError('Pull request title and head branch are required', 400);
  }
  
  const pullRequest = await githubService.createPullRequest(accessToken, owner, repo, title, body, head, base);
  
  res.json({
    success: true,
    message: 'Pull request created successfully',
    pullRequest: {
      id: pullRequest.id,
      number: pullRequest.number,
      title: pullRequest.title,
      body: pullRequest.body,
      state: pullRequest.state,
      htmlUrl: pullRequest.html_url,
      diffUrl: pullRequest.diff_url,
      patchUrl: pullRequest.patch_url,
      head: {
        ref: pullRequest.head.ref,
        sha: pullRequest.head.sha
      },
      base: {
        ref: pullRequest.base.ref,
        sha: pullRequest.base.sha
      },
      user: {
        login: pullRequest.user.login,
        avatar: pullRequest.user.avatar_url
      },
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at
    }
  });
});

export default {
  getRepositories,
  getRepositoryContents,
  getFileContent,
  getMultipleFiles,
  createBranch,
  createFile,
  createPullRequest
}; 