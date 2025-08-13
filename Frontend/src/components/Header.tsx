import  { useState } from 'react';
import { LogOut, User, ExternalLink, RefreshCw, Code, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, logout, refreshUserData } = useAuthStore();
  const { reset: resetAppStore } = useAppStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    try {
      setIsDropdownOpen(false);
      
      // Clear app data first
      console.log('🧹 Resetting app store...');
      resetAppStore();
      
      // Then logout (which clears auth data)
      console.log('🚪 Logging out...');
      logout();
      
      toast.success('Signed out successfully - all data cleared');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out. Please try again.');
      
      // Force clear data even if there's an error
      try {
        resetAppStore();
        logout();
        navigate('/', { replace: true });
      } catch (forceError) {
        console.error('Force logout error:', forceError);
        // Last resort - reload the page to clear everything
        window.location.href = '/';
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setIsDropdownOpen(false);
      setIsRefreshing(true);
      toast.loading('Refreshing user data...');
      await refreshUserData();
      toast.dismiss();
      toast.success('User data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.dismiss();
      toast.error('Failed to refresh user data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              TestCraft
            </span>
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group border border-gray-200 hover:border-gray-300 hover:shadow-sm"
              >
                <img
                  src={user.avatar || `https://github.com/${user.username}.png`}
                  alt={user.name || user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200 group-hover:ring-gray-300 transition-all shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = `https://github.com/${user.username}.png`;
                  }}
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name || user.username}
                  </div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 py-2 z-20 animate-in fade-in-0 zoom-in-95 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || `https://github.com/${user.username}.png`}
                          alt={user.name || user.username}
                          className="w-10 h-10 rounded-full shadow-lg ring-2 ring-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = `https://github.com/${user.username}.png`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.name || user.username}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <a
                        href={`https://github.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                      >
                        <User className="w-4 h-4 mr-3 text-gray-500 group-hover:text-gray-700" />
                        View GitHub Profile
                        <ExternalLink className="w-3 h-3 ml-auto text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                      
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-4 h-4 mr-3 text-gray-500 group-hover:text-gray-700 transition-all duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                      >
                        <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-0.5 transition-transform" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-0 {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in-0 0.2s ease-out, zoom-in-95 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;