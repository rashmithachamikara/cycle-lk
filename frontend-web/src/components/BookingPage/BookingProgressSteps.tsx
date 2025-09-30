import { CheckCircle } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface BookingProgressStepsProps {
  currentStep: number;
  steps: Step[];
}

const BookingProgressSteps = ({ currentStep, steps }: BookingProgressStepsProps) => {
  return (
    <div className="bg-white shadow-sm border-b mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ">
        {/* Desktop view */}
        <div className="hidden sm:flex items-start justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center min-w-[180px]">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-200 ${
                    currentStep >= step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  style={{ minWidth: 40, minHeight: 40 }}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`font-medium ${
                      currentStep >= step.number ? 'text-emerald-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center">
                  <div
                    className={`h-1 w-16 mx-4 rounded-full transition-colors duration-200 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Mobile view */}
        <div className="flex sm:hidden flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : currentStep === step.number
                      ? 'bg-emerald-400 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center font-medium text-emerald-600">
            {steps.find(step => step.number === currentStep)?.title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProgressSteps;
