

import  { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/useAuthStore';
import LoadingSpinner from './components/LoadingSpinner';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import GitHubCallbackPage from './pages/GitHubCallbackPage';
import './App.css';

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing auth...');
    initializeAuth().catch(error => {
      console.error('Auth initialization failed:', error);
      setInitError(error.message || 'Failed to initialize authentication');
    });
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing application...</p>
          {initError && (
            <p className="mt-2 text-red-600 text-sm">Error: {initError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
          />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
