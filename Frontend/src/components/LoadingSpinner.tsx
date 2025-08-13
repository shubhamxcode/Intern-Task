import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'var(--color-primary)',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={`loading-spinner ${sizeClasses[size]} ${className}`}
      style={{ 
        borderTopColor: color,
        borderColor: color === 'var(--color-primary)' ? 'var(--color-gray-200)' : 'rgba(0,0,0,0.1)'
      }}
    />
  );
};

export default LoadingSpinner; 