'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import toast from 'react-hot-toast';

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  userId: string;
  budgetId?: string;
  createdAt?: string;
  updatedAt?: string;
  merchant?: string;
  tags?: string[];
  notes?: string;
  icon?: string;
  color?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteMultipleTransactions: (ids: string[]) => Promise<void>;
  getTransactionsByCategory: (category: string) => Transaction[];
  getTransactionsByBudget: (budgetId: string) => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetIncome: () => number;
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  loadTransactionsByBudget: (budgetId: string) => Promise<void>;
  checkBudgetsExist: () => Promise<boolean>;
  setBudgetRefreshCallback: (callback: () => Promise<void>) => void;
}

const categoryMapping: Record<string, { icon: string; color: string }> = {
  'Food & Dining': { icon: 'ri-restaurant-line', color: 'text-blue-600 bg-blue-50' },
  'Transportation': { icon: 'ri-gas-station-line', color: 'text-teal-600 bg-teal-50' },
  'Entertainment': { icon: 'ri-film-line', color: 'text-pink-600 bg-pink-50' },
  'Shopping': { icon: 'ri-shopping-bag-line', color: 'text-red-600 bg-red-50' },
  'Health & Fitness': { icon: 'ri-heart-pulse-line', color: 'text-orange-600 bg-orange-50' },
  'Utilities': { icon: 'ri-flashlight-line', color: 'text-yellow-600 bg-yellow-50' },
  'Education': { icon: 'ri-book-line', color: 'text-indigo-600 bg-indigo-50' },
  'Travel': { icon: 'ri-plane-line', color: 'text-purple-600 bg-purple-50' },
  'Income': { icon: 'ri-money-dollar-circle-line', color: 'text-green-600 bg-green-50' },
  'Other': { icon: 'ri-more-line', color: 'text-gray-600 bg-gray-50' }
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetRefreshCallback, setBudgetRefreshCallbackState] = useState<(() => Promise<void>) | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const setBudgetRefreshCallback = useCallback((callback: () => Promise<void>) => {
    setBudgetRefreshCallbackState(() => callback);
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/transactions?userId=${user.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const transactionsWithLegacyFields = data.transactions.map((transaction: Transaction) => ({
          ...transaction,
          merchant: transaction.description,
          tags: [transaction.category.toLowerCase()],
          icon: categoryMapping[transaction.category]?.icon || 'ri-more-line',
          color: categoryMapping[transaction.category]?.color || 'text-gray-600 bg-gray-50'
        }));
        setTransactions(transactionsWithLegacyFields);
      } else {
        console.error('Failed to load transactions:', data.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user, isAuthenticated, loadTransactions]);

  const checkBudgetsExist = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/budgets?userId=${user.id}`);
      const data = await response.json();
      return response.ok && data.success && data.budgets && data.budgets.length > 0;
    } catch (error) {
      console.error('Error checking budgets:', error);
      return false;
    }
  }, [user?.id]);

  const addTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    const budgetsExist = await checkBudgetsExist();
    if (!budgetsExist) {
      toast.error('Create a budget first before adding incomes or expenses.');
      return false;
    }

    if (transactionData.type === 'expense' && !transactionData.budgetId) {
      toast.error('Please select a budget for this expense.');
      return false;
    }

    // --- FIX: Preserve the local time exactly as selected by the user ---
    let correctedDateString = transactionData.date;

    if (correctedDateString.includes('T') && !correctedDateString.endsWith('Z')) {
      correctedDateString = correctedDateString + ':00';
    } else if (!correctedDateString.includes('T')) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      correctedDateString = `${correctedDateString}T${hours}:${minutes}:00`;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          date: correctedDateString,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newTransaction = {
          ...data.transaction,
          merchant: data.transaction.description,
          tags: [data.transaction.category.toLowerCase()],
          icon: categoryMapping[data.transaction.category]?.icon || 'ri-more-line',
          color: categoryMapping[data.transaction.category]?.color || 'text-gray-600 bg-gray-50'
        };
        setTransactions(prev => [newTransaction, ...prev]);

        // Add notifications from API response
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notification: any) => {
            addNotification(notification);
          });
        }

        if (budgetRefreshCallback && transactionData.type === 'expense') {
          await budgetRefreshCallback();
        }

        toast.success('Transaction added successfully!');
        return true;
      } else {
        toast.error(data.error || 'Failed to add transaction');
        return false;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      return false;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactions(prev =>
          prev.map(transaction => {
            if (transaction.id === id) {
              const updated = { ...transaction, ...updates };
              if (updates.category) {
                updated.icon = categoryMapping[updates.category]?.icon || 'ri-more-line';
                updated.color = categoryMapping[updates.category]?.color || 'text-gray-600 bg-gray-50';
              }
              return updated;
            }
            return transaction;
          })
        );

        if (budgetRefreshCallback && (updates.amount !== undefined || updates.budgetId !== undefined)) {
          await budgetRefreshCallback();
        }

        toast.success('Transaction updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok && data.success) {
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
        if (budgetRefreshCallback) await budgetRefreshCallback();
        toast.success('Transaction deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const deleteMultipleTransactions = async (ids: string[]) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const deletePromises = ids.map(id =>
        fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      );

      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map(r => r.json()));
      const successfulDeletes = results.filter(r => r.success).length;

      if (successfulDeletes > 0) {
        setTransactions(prev => prev.filter(transaction => !ids.includes(transaction.id)));
        toast.success(`${successfulDeletes} transaction${successfulDeletes > 1 ? 's' : ''} deleted successfully!`);
      }

      if (successfulDeletes < ids.length) {
        toast.error(`Failed to delete ${ids.length - successfulDeletes} transaction(s)`);
      }
    } catch (error) {
      console.error('Error deleting transactions:', error);
      toast.error('Failed to delete transactions');
    }
  };

  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  const getTransactionsByCategory = (category: string): Transaction[] =>
    transactions.filter(transaction => transaction.category === category);

  const getTransactionsByBudget = (budgetId: string): Transaction[] =>
    transactions.filter(transaction => transaction.budgetId === budgetId);

  const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const loadTransactionsByBudget = useCallback(async (budgetId: string) => {
    if (!user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/transactions?userId=${user.id}&budgetId=${budgetId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const transactionsWithLegacyFields = data.transactions.map((transaction: Transaction) => ({
          ...transaction,
          merchant: transaction.description,
          tags: [transaction.category.toLowerCase()],
          icon: categoryMapping[transaction.category]?.icon || 'ri-more-line',
          color: categoryMapping[transaction.category]?.color || 'text-gray-600 bg-gray-50'
        }));
        setTransactions(transactionsWithLegacyFields);
      } else {
        console.error('Failed to load transactions:', data.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getTotalIncome = (): number =>
    transactions.filter(t => t.amount > 0).reduce((total, t) => total + t.amount, 0);

  const getTotalExpenses = (): number =>
    Math.abs(transactions.filter(t => t.amount < 0).reduce((total, t) => total + t.amount, 0));

  const getNetIncome = (): number => getTotalIncome() - getTotalExpenses();

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        deleteMultipleTransactions,
        getTransactionsByCategory,
        getTransactionsByBudget,
        getTransactionsByDateRange,
        getTotalIncome,
        getTotalExpenses,
        getNetIncome,
        loading,
        refreshTransactions,
        loadTransactionsByBudget,
        checkBudgetsExist,
        setBudgetRefreshCallback
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
