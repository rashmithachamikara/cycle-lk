// frontend-web/components/PartnerRegistrationPage/StepIndicator.tsx
import React from 'react';
import { StepIndicatorProps } from './types';

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels
}) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step <= currentStep ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <span className="text-xs text-gray-500 mt-1">{stepLabels[index]}</span>
            </div>
            {step < totalSteps && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;