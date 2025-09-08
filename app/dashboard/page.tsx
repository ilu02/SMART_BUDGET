'use client';

import Header from '../../components/Header';
import ResponsiveLayout from '../../components/ResponsiveLayout';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import DashboardOverview from './DashboardOverview';
import RecentTransactions from './RecentTransactions';
import QuickActions from './QuickActions';
import AddTransactionModal from '../../components/AddTransactionModal';
import TutorialSidebar from '../../components/TutorialSidebar';
import WelcomeModal from '../../components/WelcomeModal';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransactions } from '../contexts/TransactionContext';
import { useTutorial } from '../../hooks/useTutorial';
import toast from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

export default function DashboardPage() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>([]);
  const router = useRouter();
  const { addTransaction, transactions } = useTransactions();
  const { showTutorial, showWelcome, closeTutorial, closeWelcome, completeTutorial, startTutorial } = useTutorial();
  const { budgetPreferences } = useSettings();
  const currencySymbol = budgetPreferences.currencySymbol || '';

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
        `Export Date,"${new Date().toLocaleString()}"`
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

  const handleSaveTransaction = (transactionData: any) => {
    addTransaction(transactionData);
    setIsAddTransactionOpen(false);
  };

  const handleSaveIncome = (transactionData: any) => {
    addTransaction({ ...transactionData, type: 'income' });
    setIsAddIncomeOpen(false);
  };

  const handleQuickExpense = (amount: number, description: string, category: string) => {
    const transaction = {
      amount,
      description,
      category,
      type: 'expense' as const,
      date: new Date().toISOString(),
      id: Date.now().toString()
    };
    addTransaction(transaction);
    toast.success(`Added ${description} - $${amount}`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if no input is focused and Ctrl/Cmd is pressed
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((event.ctrlKey || event.metaKey)) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            setIsAddTransactionOpen(true);
            break;
          case 'i':
            event.preventDefault();
            setIsAddIncomeOpen(true);
            break;
          case 'e':
            event.preventDefault();
            handleExportData();
            break;
          case 'a':
            event.preventDefault();
            router.push('/analytics');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, handleExportData]);

  const quickActions = [
    {
      label: 'Add Expense',
      icon: 'ri-subtract-line',
      variant: 'primary' as const,
      onClick: () => setIsAddTransactionOpen(true),
      shortcut: 'Ctrl+N'
    },
    {
      label: 'Add Income',
      icon: 'ri-add-circle-line',
      variant: 'secondary' as const,
      onClick: () => setIsAddIncomeOpen(true),
      shortcut: 'Ctrl+I'
    },
    {
      label: 'View Analytics',
      icon: 'ri-pie-chart-line',
      variant: 'secondary' as const,
      onClick: () => router.push('/analytics'),
      shortcut: 'Ctrl+A'
    },
    {
      label: 'Export Data',
      icon: 'ri-download-line',
      variant: 'outline' as const,
      onClick: handleExportData,
      shortcut: 'Ctrl+E'
    }
  ];

  return (
    <ResponsiveLayout className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 respect-motion-preference">
      <Header />
      <ResponsiveContainer padding="md" className="py-4 sm:py-6 lg:py-8 landscape-compact">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <i className="ri-dashboard-3-line text-white text-lg sm:text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <h1 className="text-responsive-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-responsive-base text-gray-600 mt-1 hidden sm:block">
                Welcome back! Here's your financial overview at a glance.
              </p>
              <p className="text-responsive-sm text-gray-600 mt-1 sm:hidden">
                Your financial overview
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <ResponsiveGrid 
          cols={{ mobile: 1, tablet: 1, desktop: 4 }} 
          gap="lg" 
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          {/* Left Column - Main Overview */}
          <div className="lg:col-span-3 space-responsive-lg" data-tutorial="dashboard-overview">
            <DashboardOverview />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-responsive-lg">
            <RecentTransactions />
          </div>
        </ResponsiveGrid>

        {/* Quick Actions */}
        <QuickActions />

        {/* Quick Expense Shortcuts */}
        <div className="mt-6 sm:mt-8 card-responsive">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h3 className="text-responsive-lg font-semibold text-gray-900">Quick Expense Shortcuts</h3>
              <p className="text-responsive-sm text-gray-600 hidden sm:block">Add common expenses with one click</p>
              <p className="text-responsive-xs text-gray-600 sm:hidden">Quick expenses</p>
            </div>
          </div>
          <ResponsiveGrid cols={{ mobile: 2, tablet: 4, desktop: 6 }} gap="md">
            {[
              { amount: 5, description: 'Coffee', category: 'Food & Dining', icon: 'ri-cup-line', color: 'bg-amber-500' },
              { amount: 15, description: 'Lunch', category: 'Food & Dining', icon: 'ri-restaurant-line', color: 'bg-orange-500' },
              { amount: 10, description: 'Gas', category: 'Transportation', icon: 'ri-gas-station-line', color: 'bg-blue-500' },
              { amount: 25, description: 'Groceries', category: 'Food & Dining', icon: 'ri-shopping-cart-line', color: 'bg-green-500' },
              { amount: 12, description: 'Parking', category: 'Transportation', icon: 'ri-parking-line', color: 'bg-purple-500' },
              { amount: 8, description: 'Snacks', category: 'Food & Dining', icon: 'ri-cake-3-line', color: 'bg-pink-500' }
            ].map((expense, index) => (
              <button
                key={index}
                onClick={() => handleQuickExpense(expense.amount, expense.description, expense.category)}
                className="touch-target flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${expense.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200`}>
                  <i className={`${expense.icon} text-white text-base sm:text-lg`}></i>
                </div>
                <span className="text-responsive-xs font-medium text-gray-900 text-center">{expense.description}</span>
                <span className="text-xs text-gray-500">{currencySymbol}{expense.amount}</span>
              </button>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Keyboard Shortcuts Help - Hidden on mobile */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 hidden md:block print-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="ri-keyboard-line text-gray-600"></i>
              <span className="text-responsive-sm font-medium text-gray-700">Keyboard Shortcuts</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span><kbd className="px-2 py-1 bg-white rounded border">Ctrl+N</kbd> Add Expense</span>
              <span><kbd className="px-2 py-1 bg-white rounded border">Ctrl+I</kbd> Add Income</span>
              <span><kbd className="px-2 py-1 bg-white rounded border">Ctrl+A</kbd> Analytics</span>
              <span><kbd className="px-2 py-1 bg-white rounded border">Ctrl+E</kbd> Export</span>
            </div>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSave={handleSaveTransaction}
      />

      {/* Add Income Modal */}
      <AddTransactionModal 
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
        onSave={handleSaveIncome}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={closeWelcome}
        onStartTutorial={startTutorial}
      />

      {/* Tutorial */}
      <TutorialSidebar
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />
    </ResponsiveLayout>
  );
}