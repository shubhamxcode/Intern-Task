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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.name || user?.username}
          </h1>
          <p className="text-gray-600">
            Generate test cases for your repositories using AI.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage; 