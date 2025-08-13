import React from 'react';
import { useAppStore } from '../context/useAppStore';
import { Check } from 'lucide-react';

const StepIndicator: React.FC = () => {
  const { currentStep } = useAppStore();

  const steps = [
    { id: 1, key: 'repositories', title: 'Repository', description: 'Select repo' },
    { id: 2, key: 'files', title: 'Files', description: 'Choose files' },
    { id: 3, key: 'summaries', title: 'Analysis', description: 'AI review' },
    { id: 4, key: 'tests', title: 'Tests', description: 'Generate code' },
    { id: 5, key: 'review', title: 'Review', description: 'Create PR' }
  ];

  const stepKeyToNumber: Record<string, number> = {
    'repositories': 1,
    'files': 2,
    'summaries': 3,
    'tests': 4,
    'review': 5
  };

  const getStepStatus = (stepId: number) => {
    const currentNum = stepKeyToNumber[currentStep] || 1;
    if (stepId < currentNum) return 'completed';
    if (stepId === currentNum) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                  ${status === 'completed' 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : status === 'current'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-2">
                  <div className={`text-xs font-medium
                    ${status === 'current' || status === 'completed'
                      ? 'text-gray-900' 
                      : 'text-gray-500'
                    }
                  `}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-px mx-4 bg-gray-200 relative">
                  <div 
                    className={`h-full ${
                      step.id < (stepKeyToNumber[currentStep] || 1) ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator; 