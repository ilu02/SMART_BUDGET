'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import AddTransactionModal from '../../components/AddTransactionModal';
import { useSettings } from '../contexts/SettingsContext';
import { useTransactions, Transaction } from '../contexts/TransactionContext';
import { useBudgets } from '../contexts/BudgetContext';

const categories = [
  'All Categories',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Health & Fitness',
  'Education',
  'Income',
  'Utilities',
  'Travel',
  'Other'
];

export default function TransactionsPageContent() {
  const { formatCurrency } = useSettings();
  const {
    transactions,
    deleteTransaction,
    deleteMultipleTransactions,
    updateTransaction,
    addTransaction,
    loading,
    loadTransactionsByBudget,
    refreshTransactions
  } = useTransactions();
  const { budgets } = useBudgets();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [budgetCategoryName, setBudgetCategoryName] = useState<string | null>(null);
  const [selectedBudgetFilter, setSelectedBudgetFilter] = useState('All Budgets');
  const [dateRange, setDateRange] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  // Helper function to get budget info for a transaction
  const getBudgetInfo = (transaction: Transaction) => {
    if (!transaction.budgetId || transaction.type !== 'expense') return null;
    return budgets.find(budget => budget.id === transaction.budgetId);
  };

  // Handle URL parameters for budget filtering
  useEffect(() => {
    const budgetId = searchParams.get('budgetId');
    const category = searchParams.get('category');

    if (budgetId) {
      setSelectedBudgetId(budgetId);
      setBudgetCategoryName(category);
      if (category) {
        setSelectedCategory(category);
      }
      // Load transactions for this specific budget
      loadTransactionsByBudget(budgetId);
    } else {
      // Load all transactions if no budget filter
      refreshTransactions();
    }
  }, [searchParams, loadTransactionsByBudget, refreshTransactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.merchant && transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.tags && transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      // Category filter
      const matchesCategory = selectedCategory === 'All Categories' ||
        transaction.category === selectedCategory;

      // Budget filter
      const matchesBudget = selectedBudgetFilter === 'All Budgets' ||
        (selectedBudgetFilter === 'No Budget' && !transaction.budgetId) ||
        (selectedBudgetFilter === 'With Budget' && transaction.budgetId) ||
        (transaction.budgetId && budgets.find(b => b.id === transaction.budgetId)?.category === selectedBudgetFilter);

      // Date range filter
      const transactionDate = new Date(transaction.date);
      const today = new Date();
      let matchesDate = true;

      if (dateRange === 'today') {
        matchesDate = transactionDate.toDateString() === today.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = transactionDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = transactionDate >= monthAgo;
      }

      // Amount range filter
      const matchesAmount =
        (amountRange.min === '' || Math.abs(transaction.amount) >= parseFloat(amountRange.min)) &&
        (amountRange.max === '' || Math.abs(transaction.amount) <= parseFloat(amountRange.max));

      return matchesSearch && matchesCategory && matchesBudget && matchesDate && matchesAmount;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, selectedCategory, dateRange, amountRange, sortBy, sortOrder]);

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredAndSortedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredAndSortedTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.length > 0) {
      deleteMultipleTransactions(selectedTransactions);
      setSelectedTransactions([]);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = (transactionData: Transaction) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    setEditingTransaction(undefined);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(undefined);
  };

  const totalIncome = filteredAndSortedTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredAndSortedTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="ml-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>

          {/* Transactions List Skeleton */}
          <Card className="p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedBudgetId ? `${budgetCategoryName} Budget Transactions` : 'Transactions'}
            </h1>
            <p className="text-gray-600 mt-2">
              {selectedBudgetId
                ? `Manage transactions for your ${budgetCategoryName} budget`
                : 'Search, filter, and manage your financial transactions'
              }
            </p>
            {selectedBudgetId && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push('/transactions');
                    setSelectedBudgetId(null);
                    setBudgetCategoryName(null);
                    setSelectedCategory('All Categories');
                  }}
                >
                  <i className="ri-arrow-left-line mr-2" aria-hidden="true"></i>
                  Back to All Transactions
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {selectedTransactions.length > 0 && (
              <Button variant="danger" onClick={handleBulkDelete}>
                <i className="ri-delete-bin-line mr-2" aria-hidden="true"></i>
                Delete ({selectedTransactions.length})
              </Button>
            )}
            <Button onClick={() => setIsAddModalOpen(true)}>
              <i className="ri-add-line mr-2" aria-hidden="true"></i>
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Budget Information Section */}
        {selectedBudgetId && budgets.find(b => b.id === selectedBudgetId) && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            {(() => {
              const budget = budgets.find(b => b.id === selectedBudgetId);
              if (!budget) return null;

              const budgetTransactions = filteredAndSortedTransactions.filter(t => t.budgetId === selectedBudgetId);
              const spent = budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
              const remaining = budget.budget - spent;
              const percentage = budget.budget > 0 ? (spent / budget.budget) * 100 : 0;

              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: budget.color }}>
                        <i className={`${budget.icon} text-white text-xl`} aria-hidden="true"></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{budget.category} Budget</h3>
                        <p className="text-gray-600">{budgetTransactions.length} transactions in this budget</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Budget Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Budget Amount</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(budget.budget)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Spent</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(spent)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(remaining)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-green-600 text-xl" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-down-line text-red-600 text-xl" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-calculator-line text-blue-600 text-xl" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Amount</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                id="search"
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budgetFilter" className="block text-sm font-medium text-gray-700 mb-1">Budget Filter</label>
              <select
                id="budgetFilter"
                value={selectedBudgetFilter}
                onChange={(e) => setSelectedBudgetFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All Budgets">All Budgets</option>
                <option value="No Budget">No Budget</option>
                <option value="With Budget">With Budget</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.category}>{budget.category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="1000"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex space-x-2">
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="description">Description</option>
                  <option value="category">Category</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3"
                >
                  <i className={`ri-sort-${sortOrder === 'asc' ? 'asc' : 'desc'}-line`} aria-hidden="true"></i>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Transactions ({filteredAndSortedTransactions.length})
            </h2>
            {filteredAndSortedTransactions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedTransactions.length === filteredAndSortedTransactions.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>

          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-file-list-line text-6xl text-gray-300 mb-4" aria-hidden="true"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your filters or add a new transaction.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    selectedTransactions.includes(transaction.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} style={{ backgroundColor: transaction.color || '#6B7280' }}>
                      <i className={`${transaction.icon || 'ri-money-dollar-circle-line'} text-sm`} aria-hidden="true"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        {transaction.merchant && (
                          <span className="text-sm text-gray-500">• {transaction.merchant}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        {getBudgetInfo(transaction) && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">{getBudgetInfo(transaction)?.category}</span>
                          </>
                        )}
                        {transaction.tags && transaction.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex flex-wrap gap-1">
                              {transaction.tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransaction(transaction)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <i className="ri-edit-line" aria-hidden="true"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          defaultBudgetId={selectedBudgetId || undefined}
          defaultCategory={budgetCategoryName || undefined}
        />
      </div>
    </div>
  );
}