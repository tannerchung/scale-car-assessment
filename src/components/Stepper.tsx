import React from 'react';

interface Step {
  id: number;
  label: string;
  icon: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const status = 
            currentStep > step.id
              ? 'complete'
              : currentStep === step.id
                ? 'current'
                : 'upcoming';

          return (
            <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              {index !== steps.length - 1 && (
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div 
                    className={`h-0.5 w-full ${
                      status === 'complete' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
              
              <div className="relative flex items-center justify-center">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full
                  text-lg font-medium
                  ${status === 'complete' 
                    ? 'bg-blue-600 text-white' 
                    : status === 'current'
                      ? 'bg-white border-2 border-blue-600 text-blue-600'
                      : 'bg-white border-2 border-gray-300 text-gray-500'}">
                  <span className="text-xl">{step.icon}</span>
                  
                  {status === 'complete' && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </span>
                  )}
                </span>
                
                <span className="absolute mt-24 text-center w-max text-sm font-medium
                  ${status === 'complete' 
                    ? 'text-blue-600' 
                    : status === 'current'
                      ? 'text-blue-600'
                      : 'text-gray-500'}">
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;