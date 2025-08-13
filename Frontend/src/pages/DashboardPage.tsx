import React, { useEffect } from 'react';
import { useAuthStore } from '../context/useAuthStore';
import { useAppStore } from '../context/useAppStore';
import Header from '../components/Header';
import StepIndicator from '../components/StepIndicator';
import RepositorySelector from '../components/RepositorySelector';
import FileSelector from '../components/FileSelector';
import TestSummariesView from '../components/TestSummariesView';
import TestCodeView from '../components/TestCodeView';
import ReviewAndSubmit from '../components/ReviewAndSubmit';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentStep, reset } = useAppStore();

  useEffect(() => {
    // Reset app state when component mounts
    return () => {
      // Cleanup function can be added here if needed
    };
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'repositories':
        return <RepositorySelector />;
      case 'files':
        return <FileSelector />;
      case 'summaries':
        return <TestSummariesView />;
      case 'tests':
        return <TestCodeView />;
      case 'review':
        return <ReviewAndSubmit />;
      default:
        return <RepositorySelector />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || user.username}!
          </h1>
          <p className="text-gray-600">
            Generate comprehensive test cases for your repositories using AI.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 