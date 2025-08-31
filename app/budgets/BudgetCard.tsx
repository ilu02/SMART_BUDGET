
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditBudgetModal from './EditBudgetModal';
import HistoryModal from './HistoryModal';
import AddTransactionModal from '../../components/AddTransactionModal';
import { useSettings } from '../contexts/SettingsContext';
import { useBudgets } from '../contexts/BudgetContext';

interface Budget {
  id: string;
  category: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
  description?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BudgetCardProps {
  budget: Budget;
}

export default function BudgetCard({ budget }: BudgetCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const { formatCurrency } = useSettings();
  const { refreshBudgets } = useBudgets();
  const router = useRouter();
  const percentage = (budget.spent / budget.budget) * 100;
  const remaining = budget.budget - budget.spent;
  const isOverBudget = percentage > 100;
  const isNearLimit = percentage > 80 && percentage <= 100;

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-600';
    if (isNearLimit) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return budget.color;
  };

  const handleViewTransactions = () => {
    router.push(`/transactions?budgetId=${budget.id}&category=${encodeURIComponent(budget.category)}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-hover">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${budget.color} text-white`}>
              <i className={`${budget.icon} text-lg`}></i>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{budget.category}</h3>
              <p className="text-sm text-gray-500">{budget.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            aria-label={showDetails ? 'Hide details' : 'Show details'}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className={`ri-${showDetails ? 'eye-off' : 'eye'}-line`}></i>
          </button>
        </div>

        {/* Amount Display */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(budget.spent)}</span>
            <span className="text-sm text-gray-500">of {formatCurrency(budget.budget)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${getStatusColor()}`}>
              {percentage.toFixed(0)}% used
            </span>
            <span className={`${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'left' : 'over'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressBarColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.min(percentage, 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${budget.category} budget usage`}
            ></div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          {isOverBudget && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <i className="ri-alert-line"></i>
              <span className="text-sm font-medium">Over budget by {formatCurrency(budget.spent - budget.budget)}</span>
            </div>
          )}
          {isNearLimit && !isOverBudget && (
            <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
              <i className="ri-warning-line"></i>
              <span className="text-sm font-medium">Approaching budget limit</span>
            </div>
          )}
          {!isNearLimit && !isOverBudget && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <i className="ri-check-line"></i>
              <span className="text-sm font-medium">On track</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button onClick={() => setIsAddExpenseOpen(true)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
            <i className="ri-subtract-line mr-2"></i>
            Add Expense
          </button>
          <button onClick={handleViewTransactions} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <i className="ri-list-check-line mr-2"></i>
            Transactions
          </button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="flex space-x-2 mt-2">
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <i className="ri-edit-line mr-2"></i>
            Edit
          </button>
          <button onClick={() => setIsHistoryModalOpen(true)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <i className="ri-history-line mr-2"></i>
            History
          </button>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Daily Average</span>
                <p className="font-medium text-gray-900">{formatCurrency(budget.spent / 30)}</p>
              </div>
              <div>
                <span className="text-gray-500">Days Left</span>
                <p className="font-medium text-gray-900">15 days</p>
              </div>
              <div>
                <span className="text-gray-500">Projected Spend</span>
                <p className="font-medium text-gray-900">{formatCurrency(budget.spent * 2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Transaction</span>
                <p className="font-medium text-gray-900">2 days ago</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        budget={budget}
      />
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        budget={budget}
      />
      <AddTransactionModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        defaultBudgetId={budget.id}
        defaultCategory={budget.category}
        onSave={async () => {
          setIsAddExpenseOpen(false);
          // Refresh the budget data
          await refreshBudgets();
        }}
      />
    </div>
  );
}
