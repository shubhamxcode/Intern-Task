import React, { useState } from 'react';
import { Code, LogOut, User, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import LoadingSpinner from './LoadingSpinner';

const Header: React.FC = () => {
  const { user, logout, refreshUserData, isLoading } = useAuthStore();
  const { reset } = useAppStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    reset();
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Code className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">Test Case Generator</h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg p-2 hover:bg-gray-50"
            >
              <img
                className="w-8 h-8 rounded-full"
                src={user.avatar}
                alt={user.name || user.username}
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.username}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="mr-4">
                        📚 {user.publicRepos} repos
                      </span>
                      <span className="mr-4">
                        👥 {user.followers} followers
                      </span>
                      <span>
                        👤 {user.following} following
                      </span>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <a
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    View GitHub Profile
                  </a>

                  {/* Refresh Data */}
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRefreshing ? (
                      <LoadingSpinner size="sm" className="mr-3" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-3" />
                    )}
                    Refresh Data
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" className="mr-3" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-3" />
                    )}
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 