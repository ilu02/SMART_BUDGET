
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddTransactionModal from '../../components/AddTransactionModal';

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const actions = [
    {
      title: 'Add Transaction',
      description: 'Record a new expense or income',
      icon: 'ri-add-circle-line',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setIsModalOpen(true)
    },
    {
      title: 'View Analytics',
      description: 'Check your spending patterns',
      icon: 'ri-line-chart-line',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => router.push('/analytics')
    },
    {
      title: 'Set Budget',
      description: 'Create or update budgets',
      icon: 'ri-target-line',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => router.push('/budgets')
    },
    {
      title: 'Export Data',
      description: 'Download your financial data',
      icon: 'ri-download-line',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => alert('Export feature coming soon!')
    }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="space-y-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`w-full p-4 rounded-lg text-white transition-colors cursor-pointer ${action.color}`}
            >
              <div className="flex items-center space-x-3">
                <i className={`${action.icon} text-xl`}></i>
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">This Month</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">+$5,800</p>
              <p className="text-xs text-gray-500">Income</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">-$4,000</p>
              <p className="text-xs text-gray-500">Expenses</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-lg font-bold text-blue-600">+$1,800 Net</p>
            <p className="text-xs text-gray-500">This month's savings</p>
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
