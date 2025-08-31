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

export default function TransactionsPage() {
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
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [budgetCategoryName, setBudgetCategoryName] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

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
        transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'All Categories' || 
        transaction.category === selectedCategory;

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

      return matchesSearch && matchesCategory && matchesDate && matchesAmount;
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

  const handleSelectTransaction = (id: number) => {
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-exchange-line text-blue-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAndSortedTransactions.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-green-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-down-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (Highest)</option>
                <option value="amount-asc">Amount (Lowest)</option>
                <option value="description-asc">Description (A-Z)</option>
                <option value="description-desc">Description (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Amount Range */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 whitespace-nowrap">Amount Range:</span>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-24"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-24"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setDateRange('all');
                setAmountRange({ min: '', max: '' });
                setSortBy('date');
                setSortOrder('desc');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedTransactions.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <h2 className="text-xl font-semibold text-gray-900">
                Transactions ({filteredAndSortedTransactions.length})
              </h2>
            </div>
          </div>

          {filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-gray-400" aria-hidden="true"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <i className="ri-add-line mr-2" aria-hidden="true"></i>
                Add Your First Transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors ${
                    selectedTransactions.includes(transaction.id) ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.color}`}>
                      <i className={`${transaction.icon} text-lg`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.merchant}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                      {transaction.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {transaction.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <p className={`font-semibold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                        aria-label="Edit transaction"
                      >
                        <i className="ri-edit-line" aria-hidden="true"></i>
                      </button>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        aria-label="Delete transaction"
                      >
                        <i className="ri-delete-bin-line" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        transaction={editingTransaction}
        onSave={handleSaveTransaction}
        defaultBudgetId={selectedBudgetId}
        defaultCategory={budgetCategoryName}
      />
    </div>
  );
}