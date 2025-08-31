'use client';

import { useState } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onStartTutorial }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-wallet-3-line text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Smart Budget Tracker! 🎉
          </h2>
          <p className="text-gray-600">
            Your personal finance management just got easier. Let's get you started!
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-money-dollar-circle-line text-green-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Track Income & Expenses</h3>
              <p className="text-sm text-gray-600">Record all your financial transactions easily</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-pie-chart-line text-blue-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Set Smart Budgets</h3>
              <p className="text-sm text-gray-600">Create budgets and monitor your spending</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-bar-chart-line text-purple-600 text-sm"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Analyze Trends</h3>
              <p className="text-sm text-gray-600">Get insights into your spending patterns</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={onStartTutorial}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Take the Tour (2 minutes)
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Skip for Now
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can always access the tutorial from the Help menu
          </p>
        </div>
      </div>
    </div>
  );
}