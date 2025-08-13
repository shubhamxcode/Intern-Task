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
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Select a Repository
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Choose a repository to generate test cases for its code files.
          </p>
        </div>
        <button
          onClick={refreshRepositories}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl shadow-sm text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 hover:shadow-md"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm min-w-0 sm:min-w-[150px] text-sm sm:text-base"
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
          <label htmlFor="excludeForks" className="ml-3 text-sm text-gray-700">
            Exclude forked repositories
          </label>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading repositories...</p>
        </div>
      )}

      {/* Repositories Grid */}
      {!isLoading && (
        <>
          {filteredRepositories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No repositories found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedLanguage 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No repositories available in your GitHub account.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-sm text-gray-600 bg-blue-50/50 rounded-lg px-4 py-2 border border-blue-100">
                Showing <span className="font-semibold text-blue-700">{filteredRepositories.length}</span> of <span className="font-semibold">{repositories.length}</span> repositories
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="group bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer hover:bg-white/90 hover:-translate-y-1"
                    onClick={() => handleRepositorySelect(repo)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-3">
                          {repo.private ? (
                            <Lock className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                          ) : (
                            <Globe className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                            {repo.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {repo.description || 'No description available'}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 ml-4 flex-shrink-0 transition-all duration-300" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-3">
                        {repo.language && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                            {repo.language}
                          </span>
                        )}
                        <div className="flex items-center text-xs">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {repo.stargazersCount}
                        </div>
                        <div className="flex items-center text-xs">
                          <GitFork className="w-3 h-3 mr-1 text-gray-400" />
                          {repo.forksCount}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(repo.updatedAt)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        repo.private 
                          ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Branch:</span> {repo.defaultBranch}
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