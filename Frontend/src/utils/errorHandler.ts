import toast from 'react-hot-toast';

export interface ErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  code?: string;
  message?: string;
}

export const handleApiError = (error: ErrorResponse, context = 'Operation') => {
  console.error(`❌ ${context} failed:`, error);
  
  let errorMessage = `${context} failed. Please try again.`;
  let shouldLogout = false;
  
  if (error?.response?.status === 401) {
    errorMessage = 'Authentication expired. Please sign in again.';
    shouldLogout = true;
  } else if (error?.response?.status === 403) {
    errorMessage = 'Access denied. Insufficient permissions.';
    shouldLogout = true;
  } else if (error?.response?.status === 422) {
    errorMessage = 'Invalid request data.';
  } else if (error?.response?.status === 429) {
    errorMessage = 'Too many requests. Please wait a moment before trying again.';
  } else if (error?.response?.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
  } else if (error?.code === 'NETWORK_ERROR') {
    errorMessage = 'Network error. Please check your internet connection.';
  } else if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  toast.error(errorMessage);
  
  if (shouldLogout) {
    console.log('🚨 Critical authentication error - initiating auto-logout');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Delay navigation to let user see the error message
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
  
  return {
    message: errorMessage,
    shouldLogout,
    statusCode: error?.response?.status
  };
};

export const isAuthError = (error: ErrorResponse): boolean => {
  return error?.response?.status === 401 || error?.response?.status === 403;
};

export const isServerError = (error: ErrorResponse): boolean => {
  return (error?.response?.status || 0) >= 500;
};

export const isNetworkError = (error: ErrorResponse): boolean => {
  return error?.code === 'NETWORK_ERROR' || !error?.response;
}; 