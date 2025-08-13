import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';
import LoadingSpinner from '../components/LoadingSpinner';

const GitHubCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGitHubCallback } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Check for required code parameter
        if (!code) {
          throw new Error('Authorization code not received');
        }

        // Handle the callback
        await handleGitHubCallback(code, state || undefined);
        
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);

      } catch (err) {
        console.error('GitHub callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to home page after a delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleGitHubCallback, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authenticating with GitHub
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your credentials...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome to Test Case Generator. You'll be redirected to your dashboard shortly.
              </p>
              <div className="flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'Unable to authenticate with GitHub. Please try again.'}
              </p>
              <p className="text-sm text-gray-500">
                You'll be redirected to the home page in a few seconds...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubCallbackPage; 