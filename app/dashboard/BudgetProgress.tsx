
'use client';

import Link from 'next/link';
import { useBudgets } from '../contexts/BudgetContext';
import { useSettings } from '../contexts/SettingsContext';

export default function BudgetProgress() {
  const { budgets, loading } = useBudgets();
  const { formatCurrency } = useSettings();

  // Show first 5 budgets or all if less
  const displayBudgets = budgets.slice(0, 5);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Budget Progress</h2>
        <Link href="/budgets" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
          Manage
        </Link>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-gray-500">Loading budgets...</div>
        ) : displayBudgets.length === 0 ? (
          <div className="text-center text-gray-500">No budgets found</div>
        ) : (
          displayBudgets.map((budget, index) => {
            const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
            const isOverBudget = percentage > 100;

            return (
              <div key={budget.id || index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${budget.color} text-white`}>
                      <i className={`${budget.icon} text-sm`}></i>
                    </div>
                    <span className="font-medium text-gray-900">{budget.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                    </p>
                    <p className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                      {percentage.toFixed(0)}% used
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : budget.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-600 mt-1">Over budget by {formatCurrency(budget.spent - budget.budget)}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <i className="ri-lightbulb-line text-blue-600"></i>
          <span className="text-sm font-medium text-blue-900">Tip</span>
        </div>
        <p className="text-sm text-blue-800 mt-1">
          You're doing great! Try to keep entertainment spending under control this month.
        </p>
      </div>
    </div>
  );
}
