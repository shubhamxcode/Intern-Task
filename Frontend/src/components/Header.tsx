import  { useState } from 'react';
import { LogOut, User, ExternalLink, RefreshCw, Code, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, logout, refreshUserData } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    try {
      setIsDropdownOpen(false);
      logout();
      toast.success('Signed out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
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
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              TestCraft
            </span>
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-all duration-200 group border border-slate-700/40 hover:border-slate-600/60"
              >
                <img
                  src={user.avatar || `https://github.com/${user.username}.png`}
                  alt={user.name || user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-slate-600 group-hover:ring-slate-500 transition-all shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = `https://github.com/${user.username}.png`;
                  }}
                />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-slate-200">
                    {user.name || user.username}
                  </div>
                  <div className="text-xs text-slate-400">@{user.username}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/60 py-2 z-20 animate-in fade-in-0 zoom-in-95 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-700/60">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar || `https://github.com/${user.username}.png`}
                          alt={user.name || user.username}
                          className="w-10 h-10 rounded-full shadow-lg ring-2 ring-slate-600"
                          onError={(e) => {
                            e.currentTarget.src = `https://github.com/${user.username}.png`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200 truncate">
                            {user.name || user.username}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            @{user.username}
                          </div>
                          {user.email && (
                            <div className="text-xs text-slate-400 truncate">
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
                        className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-slate-200 transition-all duration-200 group"
                      >
                        <User className="w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-300" />
                        View GitHub Profile
                        <ExternalLink className="w-3 h-3 ml-auto text-slate-400 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                      
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-slate-200 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-4 h-4 mr-3 text-slate-400 group-hover:text-slate-300 transition-all duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-700/60 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200 group"
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