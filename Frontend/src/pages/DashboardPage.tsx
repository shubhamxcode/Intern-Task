import React from 'react';
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
  const { currentStep } = useAppStore();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || user?.username}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Generate test cases for your repositories using AI-powered analysis.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8">
          <StepIndicator />
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 