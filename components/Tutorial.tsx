'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  image?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Smart Budget Tracker! 🎉',
    description: 'Let\'s take a quick tour to help you get started with managing your finances effectively.',
    action: 'Get Started'
  },
  {
    id: 'dashboard',
    title: 'Your Financial Dashboard',
    description: 'This is your main dashboard where you can see an overview of your income, expenses, and financial trends at a glance.',
    target: 'dashboard-overview',
    position: 'bottom'
  },
  {
    id: 'add-transaction',
    title: 'Add Your First Transaction',
    description: 'Click the "Add Transaction" button to record your income or expenses. This helps track where your money comes from and goes.',
    target: 'add-transaction-btn',
    position: 'bottom',
    action: 'Try Adding a Transaction'
  },
  {
    id: 'transactions',
    title: 'View All Transactions',
    description: 'Navigate to the Transactions page to see all your financial activities. You can filter, search, and manage your transactions here.',
    target: 'nav-transactions',
    position: 'bottom'
  },
  {
    id: 'budgets',
    title: 'Set Up Your Budgets',
    description: 'Create budgets for different categories like Food, Transportation, Entertainment, etc. This helps you control your spending.',
    target: 'nav-budgets',
    position: 'bottom'
  },
  {
    id: 'categories',
    title: 'Manage Categories',
    description: 'Organize your spending into categories. You can view and manage your budget categories to better understand your spending patterns.',
    target: 'nav-categories',
    position: 'bottom'
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Visit Settings to update your profile, change currency preferences, set up notifications, and customize the app to your needs.',
    target: 'nav-settings',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You now know the basics of Smart Budget Tracker. Start by adding some transactions and setting up your first budget. Happy budgeting!',
    action: 'Start Budgeting'
  }
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function Tutorial({ isOpen, onClose, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const step = tutorialSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(`[data-tutorial="${step.target}"]`) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null);
      return;
    }

    // Add overlay styles
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
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

  const handleSkip = () => {
    onClose();
  };

  const getTooltipPosition = () => {
    if (!highlightedElement || !currentStepData.target) {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Ensure tooltip stays within viewport
    let top = 0;
    let left = 0;
    let transform = '';

    switch (position) {
      case 'top':
        top = Math.max(20, rect.top - 20);
        left = Math.min(Math.max(20, rect.left + rect.width / 2), viewportWidth - 400);
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = Math.min(rect.bottom + 20, viewportHeight - 200);
        left = Math.min(Math.max(20, rect.left + rect.width / 2), viewportWidth - 400);
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = Math.min(Math.max(20, rect.top + rect.height / 2), viewportHeight - 200);
        left = Math.max(20, rect.left - 20);
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = Math.min(Math.max(20, rect.top + rect.height / 2), viewportHeight - 200);
        left = Math.min(rect.right + 20, viewportWidth - 400);
        transform = 'translate(0, -50%)';
        break;
      default:
        top = Math.min(rect.bottom + 20, viewportHeight - 200);
        left = Math.min(Math.max(20, rect.left + rect.width / 2), viewportWidth - 400);
        transform = 'translate(-50%, 0)';
    }

    return {
      top,
      left,
      transform,
      position: 'fixed' as const
    };
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Highlight */}
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            border: '3px solid #3B82F6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tutorial Card */}
      <div
        className="fixed z-50 w-96 max-w-[90vw]"
        style={getTooltipPosition()}
      >
        <div className="bg-white rounded-xl border-2 border-blue-200 shadow-2xl p-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {!isFirstStep && (
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
                className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {currentStepData.action || (isLastStep ? 'Finish' : 'Next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}