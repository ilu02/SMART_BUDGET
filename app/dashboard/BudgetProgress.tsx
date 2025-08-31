
'use client';

import Link from 'next/link';

const budgets = [
  {
    category: 'Food & Dining',
    budget: 800,
    spent: 567,
    icon: 'ri-restaurant-line',
    color: 'bg-blue-500'
  },
  {
    category: 'Transportation',
    budget: 400,
    spent: 285,
    icon: 'ri-gas-station-line',
    color: 'bg-teal-500'
  },
  {
    category: 'Entertainment',
    budget: 200,
    spent: 178,
    icon: 'ri-film-line',
    color: 'bg-pink-500'
  },
  {
    category: 'Shopping',
    budget: 600,
    spent: 432,
    icon: 'ri-shopping-bag-line',
    color: 'bg-red-500'
  },
  {
    category: 'Health & Fitness',
    budget: 150,
    spent: 99,
    icon: 'ri-heart-pulse-line',
    color: 'bg-orange-500'
  }
];

export default function BudgetProgress() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Budget Progress</h2>
        <Link href="/budgets" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
          Manage
        </Link>
      </div>

      <div className="space-y-6">
        {budgets.map((budget, index) => {
          const percentage = (budget.spent / budget.budget) * 100;
          const isOverBudget = percentage > 100;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${budget.color} text-white`}>
                    <i className={`${budget.icon} text-sm`}></i>
                  </div>
                  <span className="font-medium text-gray-900">{budget.category}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${budget.spent} / ${budget.budget}
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
                <p className="text-xs text-red-600 mt-1">Over budget by ${(budget.spent - budget.budget).toFixed(2)}</p>
              )}
            </div>
          );
        })}
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
