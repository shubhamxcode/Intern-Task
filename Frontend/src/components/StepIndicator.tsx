import React from 'react';
import { Check } from 'lucide-react';
import { useAppStore } from '../context/useAppStore';

const steps = [
  { id: 'repositories', name: 'Select Repository', description: 'Choose a repository' },
  { id: 'files', name: 'Select Files', description: 'Pick code files' },
  { id: 'summaries', name: 'Test Summaries', description: 'Review test ideas' },
  { id: 'tests', name: 'Generate Tests', description: 'Create test code' },
  { id: 'review', name: 'Review & Submit', description: 'Create pull request' },
];

const StepIndicator: React.FC = () => {
  const { currentStep } = useAppStore();

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, stepIndex) => {
          const status = getStepStatus(stepIndex);
          const isLast = stepIndex === steps.length - 1;

          return (
            <li key={step.id} className={`relative ${!isLast ? 'pr-8 sm:pr-20' : ''}`}>
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div
                    className={`h-0.5 w-full ${
                      status === 'completed' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}

              {/* Step Circle */}
              <div className="relative flex items-center justify-center">
                {status === 'completed' ? (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                ) : status === 'current' ? (
                  <div className="h-8 w-8 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-gray-300 rounded-full" />
                  </div>
                )}

                {/* Step Labels */}
                <div className="absolute top-10 text-center">
                  <div
                    className={`text-sm font-medium ${
                      status === 'current' ? 'text-blue-600' : 
                      status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator; 