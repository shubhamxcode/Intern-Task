import React, { useState, useEffect } from 'react';
import { Search, Star, GitFork, Lock, Globe, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  owner: {
    login: string;
    avatar: string;
  };
  htmlUrl: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  defaultBranch: string;
  pushedAt: string;
  createdAt: string;
  updatedAt: string;
}

const RepositorySelector: React.FC = () => {
  const { user } = useAuthStore();
  const { repositories, setRepositories, setSelectedRepository, setCurrentStep } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [excludeForks, setExcludeForks] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    if (repositories.length === 0) {
      loadRepositories();
    }
  }, []);

  const loadRepositories = async () => {
    if (!user?.accessToken) {
      toast.error('No access token available');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getRepositories(user.accessToken, 1, 50, excludeForks);
      setRepositories(response.repositories);
      toast.success(`Loaded ${response.repositories.length} repositories`);
    } catch (error) {
      console.error('Failed to load repositories:', error);
      toast.error('Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositorySelect = (repository: Repository) => {
    setSelectedRepository(repository);
    setCurrentStep('files');
    toast.success(`Selected repository: ${repository.name}`);
  };

  const refreshRepositories = () => {
    setRepositories([]);
    loadRepositories();
  };

  // Filter repositories based on search and filters
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = !selectedLanguage || repo.language === selectedLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  // Get unique languages for filter
  const languages = [...new Set(repositories.map(repo => repo.language).filter(Boolean))].sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Select a Repository
          </h2>
          <p className="text-gray-600">
            Choose a repository to generate test cases for its code files.
          </p>
        </div>
        <button
          onClick={refreshRepositories}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Languages</option>
            {languages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Exclude Forks Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="excludeForks"
            checked={excludeForks}
            onChange={(e) => {
              setExcludeForks(e.target.checked);
              if (repositories.length > 0) {
                loadRepositories();
              }
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="excludeForks" className="ml-2 text-sm text-gray-700">
            Exclude forked repositories
          </label>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading repositories...</p>
        </div>
      )}

      {/* Repositories Grid */}
      {!isLoading && (
        <>
          {filteredRepositories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedLanguage 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No repositories available in your GitHub account.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredRepositories.length} of {repositories.length} repositories
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleRepositorySelect(repo)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {repo.private ? (
                            <Lock className="w-4 h-4 text-gray-400 mr-2" />
                          ) : (
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {repo.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {repo.description || 'No description available'}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {repo.language && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {repo.language}
                          </span>
                        )}
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {repo.stargazersCount}
                        </div>
                        <div className="flex items-center">
                          <GitFork className="w-4 h-4 mr-1" />
                          {repo.forksCount}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(repo.updatedAt)}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Default branch: {repo.defaultBranch}</span>
                        <span>{repo.private ? 'Private' : 'Public'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RepositorySelector; 