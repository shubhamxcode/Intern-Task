import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiService from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  accessToken: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  handleGitHubCallback: (code: string, state?: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearAuthData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User, token: string) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          const token = localStorage.getItem('auth_token');
          const userData = localStorage.getItem('user_data');
          
          if (token && userData) {
            // Verify token is still valid with timeout
            try {
              // Add timeout to prevent hanging
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Token verification timeout')), 5000)
              );
              
              await Promise.race([
                apiService.verifyToken(),
                timeoutPromise
              ]);
              
              const user = JSON.parse(userData);
              set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
              });
            } catch (error) {
              console.warn('Token verification failed, clearing auth:', error);
              // Token is invalid or verification failed, clear storage
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear any potentially corrupted data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      loginWithGitHub: async () => {
        try {
          set({ isLoading: true });
          
          const redirectUri = import.meta.env.VITE_GITHUB_OAUTH_CALLBACK_URL || 
                             `${window.location.origin}/auth/github/callback`;
          
          // Add timeout for OAuth URL request
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OAuth URL request timeout')), 10000)
          );
          
          const response = await Promise.race([
            apiService.getGitHubAuthUrl(redirectUri),
            timeoutPromise
          ]);
          
          const { authUrl, state } = response as { authUrl: string; state: string };
          
          if (!authUrl || !state) {
            throw new Error('Invalid OAuth response from server');
          }
          
          // Store state for verification
          sessionStorage.setItem('github_oauth_state', state);
          
          // Redirect to GitHub OAuth
          window.location.href = authUrl;
        } catch (error) {
          console.error('GitHub login error:', error);
          set({ isLoading: false });
          // Re-throw with more context
          throw new Error(`GitHub login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },

      handleGitHubCallback: async (code: string, state?: string) => {
        try {
          set({ isLoading: true });
          
          // Verify state parameter
          const storedState = sessionStorage.getItem('github_oauth_state');
          if (state && storedState && state !== storedState) {
            throw new Error('Invalid state parameter');
          }
          
          // Clear stored state
          sessionStorage.removeItem('github_oauth_state');
          
          // Exchange code for token
          const response = await apiService.handleGitHubCallback(code, state);
          
          if (response.success && response.token && response.user) {
            get().setUser(response.user, response.token);
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('GitHub callback error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      refreshUserData: async () => {
        try {
          const { user } = get();
          if (!user?.accessToken) {
            throw new Error('No access token available');
          }

          const response = await apiService.refreshUser(user.accessToken);
          
          if (response.success && response.token && response.user) {
            get().setUser(response.user, response.token);
          }
        } catch (error) {
          console.error('User refresh error:', error);
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      clearAuthData: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        sessionStorage.removeItem('github_oauth_state');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        console.log('Authentication data cleared');
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 