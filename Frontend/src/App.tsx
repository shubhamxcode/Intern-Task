

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
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
