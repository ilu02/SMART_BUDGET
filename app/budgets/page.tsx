'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import BudgetCard from './BudgetCard';
import AddBudgetModal from './AddBudgetModal';
import EditBudgetModal from './EditBudgetModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useSettings } from '../contexts/SettingsContext';
import { useBudgets, Budget } from '../contexts/BudgetContext';
import toast from 'react-hot-toast';

export default function BudgetsPage() {
  const { formatCurrency } = useSettings();
  const {
    budgets,
    loading,
    getTotalBudget,
    getTotalSpent,
    getTotalRemaining,
    getOverallProgress,
    refreshBudgets,
    updateBudget
  } = useBudgets();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const totalRemaining = getTotalRemaining();
  const overallProgress = getOverallProgress();

  const handleBudgetUpdate = async (id: string, updates: Partial<Budget>) => {
    try {
      await updateBudget(id, updates);
      refreshBudgets();
      toast.success('Budget updated successfully!');
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast.error('Failed to update budget.');
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBudget(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="ml-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar Skeleton */}
          <div className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="w-full h-3 rounded-full mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Budget Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6" />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="flex-1 h-8" />
                  <Skeleton className="flex-1 h-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-wallet-3-line text-4xl text-blue-600" aria-hidden="true"></i>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start managing your finances by creating your first budget. Set spending limits for different categories to stay on track.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} size="lg">
              <i className="ri-add-line mr-2" aria-hidden="true"></i>
              Create Your First Budget
            </Button>
          </div>
        </div>
        <AddBudgetModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => refreshBudgets()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Budget Overview</h1>
              <p className="text-gray-600">Monitor your spending across all categories</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    selectedPeriod === 'month'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setSelectedPeriod('year')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    selectedPeriod === 'year'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  This Year
                </button>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)} className="shadow-sm">
                <i className="ri-add-line mr-2" aria-hidden="true"></i>
                Add Budget
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-wallet-line text-blue-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-down-line text-green-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRemaining)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-pie-chart-line text-purple-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{overallProgress.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Budget Progress</h3>
            <span className="text-sm text-gray-600">{overallProgress.toFixed(1)}% used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${overallProgress > 90 ? 'bg-red-500' : overallProgress > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>{formatCurrency(totalBudget)} budgeted</span>
          </div>
        </div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEditBudget(budget)}
              onSave={handleBudgetUpdate}
            />
          ))}
        </div>

        {/* Budget Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-blue-600 text-lg" aria-hidden="true"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Budget Management Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <i className="ri-check-line text-blue-600 mt-0.5" aria-hidden="true"></i>
                  <span>Review and adjust your budgets monthly based on spending patterns</span>
                </div>
                <div className="flex items-start space-x-2">
                  <i className="ri-check-line text-blue-600 mt-0.5" aria-hidden="true"></i>
                  <span>Set realistic budget amounts that align with your income</span>
                </div>
                <div className="flex items-start space-x-2">
                  <i className="ri-check-line text-blue-600 mt-0.5" aria-hidden="true"></i>
                  <span>Use the 50-30-20 rule: needs, wants, and savings</span>
                </div>
                <div className="flex items-start space-x-2">
                  <i className="ri-check-line text-blue-600 mt-0.5" aria-hidden="true"></i>
                  <span>Track your progress weekly to stay on target</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => refreshBudgets()}
      />

      {/* Edit Budget Modal */}
      {selectedBudget && (
        <EditBudgetModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          budget={selectedBudget}
          onSave={handleBudgetUpdate}
        />
      )}
    </div>
  );
}