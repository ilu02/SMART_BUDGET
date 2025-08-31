'use client';

import { useState } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your financial overview. See your total income, expenses, and recent activity at a glance.',
    icon: 'ri-dashboard-3-line'
  },
  {
    id: 'add-transaction',
    title: 'Add Transactions',
    description: 'Click "Add Transaction" to record income or expenses. You can also use keyboard shortcut Ctrl+N.',
    icon: 'ri-add-circle-line',
    action: 'Try adding a transaction now!'
  },
  {
    id: 'transactions',
    title: 'View All Transactions',
    description: 'Navigate to Transactions to see all your financial activities. Filter and search to find specific entries.',
    icon: 'ri-list-check-line'
  },
  {
    id: 'budgets',
    title: 'Create Budgets',
    description: 'Set up budgets for different categories like Food, Transportation, etc. Track your spending against your limits.',
    icon: 'ri-pie-chart-line'
  },
  {
    id: 'categories',
    title: 'Manage Categories',
    description: 'Organize your spending into categories. View spending patterns and budget performance by category.',
    icon: 'ri-folder-line'
  },
  {
    id: 'analytics',
    title: 'Analyze Your Data',
    description: 'Get insights into your spending patterns with charts and reports. Understand where your money goes.',
    icon: 'ri-bar-chart-line'
  },
  {
    id: 'settings',
    title: 'Customize Settings',
    description: 'Update your profile, change currency preferences, and customize the app to fit your needs.',
    icon: 'ri-settings-3-line'
  }
];

interface TutorialSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TutorialSidebar({ isOpen, onClose, onComplete }: TutorialSidebarProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Getting Started Guide</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="ri-close-line text-gray-500 text-xl"></i>
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Current Step */}
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className={`${currentStepData.icon} text-blue-600 text-xl`}></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentStepData.description}
                </p>
                {currentStepData.action && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">
                      💡 {currentStepData.action}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step List */}
          <div className="px-6 pb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">All Steps</h4>
            <div className="space-y-2">
              {tutorialSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-blue-50 border border-blue-200'
                      : completedSteps.has(index)
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : completedSteps.has(index)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {completedSteps.has(index) ? (
                        <i className="ri-check-line"></i>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      index === currentStep
                        ? 'text-blue-900'
                        : completedSteps.has(index)
                        ? 'text-green-900'
                        : 'text-gray-700'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {isLastStep ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}