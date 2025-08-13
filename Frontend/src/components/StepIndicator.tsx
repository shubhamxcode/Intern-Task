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
                  flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 text-sm font-bold transition-all duration-300 shadow-lg
                  ${status === 'completed' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-500 text-white shadow-green-500/25' 
                    : status === 'current'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-blue-500/25 scale-110'
                    : 'bg-white border-gray-300 text-gray-400 shadow-gray-200/50'
                  }
                `}>
                  {status === 'completed' ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    step.id
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-3 sm:mt-4">
                  <div className={`text-xs sm:text-sm font-semibold transition-colors duration-300
                    ${status === 'current' 
                      ? 'text-blue-700' 
                      : status === 'completed'
                      ? 'text-green-700'
                      : 'text-gray-500'
                    }
                  `}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-gray-200 relative rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-in-out ${
                      step.id < (stepKeyToNumber[currentStep] || 1) 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 w-full' 
                        : step.id === (stepKeyToNumber[currentStep] || 1)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 w-1/2'
                        : 'bg-gray-200 w-0'
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