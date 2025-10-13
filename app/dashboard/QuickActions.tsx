'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AddTransactionModal from '../../components/AddTransactionModal';
import { useSettings } from '../contexts/SettingsContext';
import { useTransactions } from '../contexts/TransactionContext';
import toast from 'react-hot-toast';

export default function QuickActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const { budgetPreferences, formatCurrency } = useSettings();
  const { transactions } = useTransactions();

  // Calculate current month amounts dynamically
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = Math.abs(currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    const net = income - expenses;

    return { income, expenses, net };
  }, [transactions]);

  const handleExportData = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    try {
      // Create CSV content with more detailed information
      const headers = ['Date', 'Description', 'Amount', 'Category', 'Type', 'Balance Impact'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(transaction => [
          new Date(transaction.date).toLocaleDateString(),
          `"${transaction.description}"`,
          transaction.amount,
          `"${transaction.category}"`,
          transaction.type,
          transaction.type === 'income' ? `+${transaction.amount}` : `-${transaction.amount}`
        ].join(','))
      ].join('\n');

      // Add summary at the end
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const netBalance = totalIncome - totalExpenses;

      const summaryContent = [
        '',
        'SUMMARY',
        `Total Income,${totalIncome}`,
        `Total Expenses,${totalExpenses}`,
        `Net Balance,${netBalance}`,
        `Export Date,"${new Date().toLocaleString()}"`,
        `Transaction Period,"All transactions (${transactions.length} total)"`
      ].join('\n');

      const finalContent = csvContent + '\n' + summaryContent;

      // Create and download file
      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `smart_budget_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${transactions.length} transactions successfully!`);
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
      console.error('Export error:', error);
    }
  };

  const currencySymbol = budgetPreferences.currencySymbol || '$';

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
      action: handleExportData
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
              <p className="text-2xl font-bold text-green-600">+{formatCurrency(currentMonthData.income)}</p>
              <p className="text-xs text-gray-500">Income</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">-{formatCurrency(currentMonthData.expenses)}</p>
              <p className="text-xs text-gray-500">Expenses</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className={`text-lg font-bold ${currentMonthData.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {currentMonthData.net >= 0 ? '+' : ''}{formatCurrency(currentMonthData.net)} Net
            </p>
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

function InfoItem({ label, value, isEditing, name, onChange, type = 'text' }: { label: string, value: string, isEditing: boolean, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            aria-label={label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <p className="text-gray-900 font-medium">{value}</p>
        )}
      </div>
    );
  }
  
  function SelectItem({ label, value, isEditing, name, onChange, options }: { label: string, value: string, isEditing: boolean, name: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
        {isEditing ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            aria-label={label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <p className="text-gray-900 font-medium">{value}</p>
        )}
      </div>
    );
  }