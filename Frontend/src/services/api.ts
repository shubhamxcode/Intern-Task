import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API base configuration with validation
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Validate environment variables
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    baseUrl: API_BASE_URL,
    callbackUrl: import.meta.env.VITE_GITHUB_OAUTH_CALLBACK_URL,
    environment: import.meta.env.MODE
  });
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        
        // Handle specific error codes
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          console.warn('Token expired or invalid, clearing auth data');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          sessionStorage.removeItem('github_oauth_state');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
          
          const errorMsg = error.response?.data?.message || 'Session expired. Please log in again.';
          toast.error(errorMsg);
        } else if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait a moment.');
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async getGitHubAuthUrl(redirectUri?: string): Promise<{ authUrl: string; state: string }> {
    const response = await this.api.get('/auth/github-url', {
      params: redirectUri ? { redirect_uri: redirectUri } : {},
    });
    return response.data;
  }

  async handleGitHubCallback(code: string, state?: string): Promise<{ success: boolean; token: string; user: any; message?: string }> {
    const response = await this.api.post('/auth/github/callback', { code, state });
    return response.data;
  }

  async verifyToken(): Promise<{ success: boolean; user: any; message?: string }> {
    const response = await this.api.get('/auth/verify');
    return response.data;
  }

  async refreshUser(accessToken: string): Promise<{ success: boolean; token: string; user: any; message?: string }> {
    const response = await this.api.post('/auth/refresh', { accessToken });
    return response.data;
  }

  // GitHub endpoints
  async getRepositories(
    accessToken: string, 
    page = 1, 
    perPage = 30, 
    excludeForks = false
  ): Promise<{ repositories: any[]; pagination: any }> {
    const response = await this.api.post('/github/repositories', 
      { accessToken },
      { params: { page, per_page: perPage, exclude_forks: excludeForks } }
    );
    return response.data;
  }

  async getRepositoryContents(
    accessToken: string,
    owner: string,
    repo: string,
    path = ''
  ): Promise<{ folders: any[]; files: any[]; path: string }> {
    const response = await this.api.post(`/github/${owner}/${repo}/contents`, 
      { accessToken },
      { params: { path } }
    );
    return response.data;
  }

  async getFileContent(
    accessToken: string,
    owner: string,
    repo: string,
    path: string
  ): Promise<{ file: any }> {
    const response = await this.api.post(`/github/${owner}/${repo}/file/${path}`, {
      accessToken,
    });
    return response.data;
  }

  async getMultipleFiles(
    accessToken: string,
    owner: string,
    repo: string,
    filePaths: string[]
  ): Promise<{ files: any[]; errors: any[]; summary: any }> {
    const response = await this.api.post(`/github/${owner}/${repo}/files`, {
      accessToken,
      filePaths,
    });
    return response.data;
  }

  // Test case generation endpoints
  async generateTestSummaries(
    accessToken: string,
    files: Array<{ path: string }>,
    owner: string,
    repo: string
  ): Promise<{ summaries: any[]; metadata: any }> {
    const response = await this.api.post('/test-cases/generate-summaries', {
      accessToken,
      files,
      owner,
      repo,
    });
    return response.data;
  }

  async generateTestCode(
    accessToken: string,
    testSummary: any,
    owner: string,
    repo: string,
    framework?: string
  ): Promise<{ testCode: any }> {
    const response = await this.api.post('/test-cases/generate-code', {
      accessToken,
      testSummary,
      owner,
      repo,
      framework,
    });
    return response.data;
  }

  async generateMultipleTests(
    accessToken: string,
    testSummaries: any[],
    owner: string,
    repo: string,
    framework?: string
  ): Promise<{ results: any[]; errors: any[]; summary: any }> {
    const response = await this.api.post('/test-cases/generate-multiple', {
      accessToken,
      testSummaries,
      owner,
      repo,
      framework,
    });
    return response.data;
  }

  async createTestPullRequest(
    accessToken: string,
    testFiles: Array<{ fileName: string; content: string }>,
    owner: string,
    repo: string,
    title?: string,
    description?: string
  ): Promise<{ pullRequest: any; files: any; summary: any }> {
    const response = await this.api.post('/test-cases/create-pull-request', {
      accessToken,
      testFiles,
      owner,
      repo,
      title,
      description,
    });
    return response.data;
  }

  async getSupportedFrameworks(): Promise<{ frameworks: any; defaultFrameworks: any }> {
    const response = await this.api.get('/test-cases/supported-frameworks');
    return response.data;
  }

  // GitHub operations
  async createBranch(
    accessToken: string,
    owner: string,
    repo: string,
    branchName: string,
    fromBranch = 'main'
  ): Promise<{ branch: any }> {
    const response = await this.api.post(`/github/${owner}/${repo}/branch`, {
      accessToken,
      branchName,
      fromBranch,
    });
    return response.data;
  }

  async createFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch = 'main'
  ): Promise<{ file: any; commit: any }> {
    const response = await this.api.post(`/github/${owner}/${repo}/create-file`, {
      accessToken,
      path,
      content,
      message,
      branch,
    });
    return response.data;
  }

  async createPullRequest(
    accessToken: string,
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base = 'main'
  ): Promise<{ pullRequest: any }> {
    const response = await this.api.post(`/github/${owner}/${repo}/pull-request`, {
      accessToken,
      title,
      body,
      head,
      base,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 