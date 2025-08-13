import axios from 'axios';
import config from '../config/app.js';
import { AppError } from '../middlewares/errorHandler.js';

class GitHubService {
  constructor() {
    this.baseURL = config.github.apiUrl;
    this.oauthURL = config.github.oauthUrl;
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(`${this.oauthURL}/access_token`, {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code: code
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data.error) {
        throw new AppError(`GitHub OAuth error: ${response.data.error_description}`, 400);
      }

      return response.data.access_token;
    } catch (error) {
      if (error.isAxiosError) {
        throw new AppError('Failed to exchange code for token', 400);
      }
      throw error;
    }
  }

  /**
   * Get authenticated user information
   */
  async getUser(accessToken) {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token', 401);
      }
      throw new AppError('Failed to get user information', 500);
    }
  }

  /**
   * Get user repositories
   */
  async getUserRepositories(accessToken, page = 1, perPage = 30) {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        params: {
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc'
        }
      });

      return {
        repositories: response.data,
        totalCount: response.headers['x-total-count'] || response.data.length,
        hasNextPage: response.data.length === perPage
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token', 401);
      }
      throw new AppError('Failed to get repositories', 500);
    }
  }

  /**
   * Get repository contents (files and folders)
   */
  async getRepositoryContents(accessToken, owner, repo, path = '') {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError('Repository or path not found', 404);
      }
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token', 401);
      }
      throw new AppError('Failed to get repository contents', 500);
    }
  }

  /**
   * Get file content by path
   */
  async getFileContent(accessToken, owner, repo, path) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.data.type !== 'file') {
        throw new AppError('Path is not a file', 400);
      }

      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      
      return {
        content,
        name: response.data.name,
        path: response.data.path,
        size: response.data.size,
        sha: response.data.sha
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new AppError('File not found', 404);
      }
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token', 401);
      }
      throw error;
    }
  }

  /**
   * Get multiple file contents
   */
  async getMultipleFileContents(accessToken, owner, repo, filePaths) {
    try {
      const filePromises = filePaths.map(path => 
        this.getFileContent(accessToken, owner, repo, path)
      );

      const results = await Promise.allSettled(filePromises);
      
      return results.map((result, index) => ({
        path: filePaths[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      throw new AppError('Failed to get file contents', 500);
    }
  }

  /**
   * Create a new file in repository
   */
  async createFile(accessToken, owner, repo, path, content, message, branch = 'main') {
    try {
      const response = await axios.put(`${this.baseURL}/repos/${owner}/${repo}/contents/${path}`, {
        message,
        content: Buffer.from(content).toString('base64'),
        branch
      }, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        throw new AppError('File already exists or invalid content', 422);
      }
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token', 401);
      }
      throw new AppError('Failed to create file', 500);
    }
  }

  /**
   * Check if user has write permissions to repository
   */
  async checkRepositoryPermissions(accessToken, owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const repository = response.data;
      
      // Check if the repository allows pull requests
      if (!repository.permissions?.push && !repository.permissions?.admin) {
        throw new AppError('Insufficient permissions to create pull request in this repository', 403);
      }
      
      // Check if repository is archived
      if (repository.archived) {
        throw new AppError('Cannot create pull request in archived repository', 422);
      }
      
      return repository;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.response?.status === 404) {
        throw new AppError('Repository not found or access denied', 404);
      }
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token', 401);
      }
      throw new AppError('Failed to check repository permissions', 500);
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(accessToken, owner, repo, title, body, head, base) {
    // If no base branch specified, get the default branch
    if (!base) {
      try {
        const repoResponse = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        base = repoResponse.data.default_branch;
        console.log('Using default branch as base:', base);
      } catch (error) {
        base = 'main'; // fallback
        console.log('Could not get default branch, using main as base');
      }
    }
    try {
      const response = await axios.post(`${this.baseURL}/repos/${owner}/${repo}/pulls`, {
        title,
        body,
        head,
        base
      }, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Pull request creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 422) {
        const errorMsg = error.response?.data?.message || 'Pull request validation failed';
        throw new AppError(`Pull request failed: ${errorMsg}`, 422);
      }
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token for pull request', 401);
      }
      if (error.response?.status === 403) {
        throw new AppError('Insufficient permissions to create pull request', 403);
      }
      throw new AppError(`Failed to create pull request: ${error.message}`, 500);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(accessToken, owner, repo, branchName, fromBranch = 'main') {
    try {
      // First, try to get the default branch of the repository
      let defaultBranch = fromBranch;
      try {
        const repoResponse = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        defaultBranch = repoResponse.data.default_branch;
        console.log('Using default branch:', defaultBranch);
      } catch (error) {
        console.log('Could not get default branch, using:', fromBranch);
      }

      // Get the SHA of the from branch
      const branchResponse = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const sha = branchResponse.data.object.sha;

      // Create new branch
      const response = await axios.post(`${this.baseURL}/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha
      }, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Branch creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 422) {
        const errorMsg = error.response?.data?.message || 'Branch already exists or invalid name';
        throw new AppError(`Branch creation failed: ${errorMsg}`, 422);
      }
      if (error.response?.status === 401) {
        throw new AppError('Invalid GitHub access token for branch creation', 401);
      }
      if (error.response?.status === 403) {
        throw new AppError('Insufficient permissions to create branch', 403);
      }
      throw new AppError(`Failed to create branch: ${error.message}`, 500);
    }
  }

  /**
   * Filter code files from repository contents
   */
  filterCodeFiles(contents) {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go',
      '.php', '.rb', '.swift', '.kt', '.scala', '.rust', '.vue', '.html', '.css',
      '.scss', '.sass', '.less', '.sql', '.sh', '.bash', '.ps1', '.json', '.xml',
      '.yaml', '.yml', '.md', '.txt'
    ];

    return contents.filter(item => {
      if (item.type !== 'file') return false;
      const extension = item.name.substring(item.name.lastIndexOf('.'));
      return codeExtensions.includes(extension.toLowerCase());
    });
  }
}

export default new GitHubService(); 