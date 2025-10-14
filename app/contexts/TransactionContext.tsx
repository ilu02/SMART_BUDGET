'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
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
  // Legacy fields for compatibility
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



// Category to icon/color mapping
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

  const setBudgetRefreshCallback = useCallback((callback: () => Promise<void>) => {
    setBudgetRefreshCallbackState(() => callback);
  }, []);

  // Load transactions from database when user is authenticated
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
        // Add legacy fields for compatibility
        const transactionsWithLegacyFields = data.transactions.map((transaction: Transaction) => ({
          ...transaction,
          merchant: transaction.description, // Use description as merchant for compatibility
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

  // Load transactions when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user, isAuthenticated, loadTransactions]);

  const checkBudgetsExist = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      const response = await fetch(`/api/budgets?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.budgets && data.budgets.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking budgets:', error);
      return false;
    }
  }, [user?.id]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return false;
    }

    // Check if budgets exist before allowing transaction creation
    const budgetsExist = await checkBudgetsExist();
    if (!budgetsExist) {
      toast.error('Create a budget first before adding incomes or expenses.');
      return false;
    }

    // Ensure budgetId is provided for expenses
    if (transactionData.type === 'expense' && !transactionData.budgetId) {
      toast.error('Please select a budget for this expense.');
      return false;
    }

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionData,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new transaction to local state with legacy fields
        const newTransaction = {
          ...data.transaction,
          merchant: data.transaction.description,
          tags: [data.transaction.category.toLowerCase()],
          icon: categoryMapping[data.transaction.category]?.icon || 'ri-more-line',
          color: categoryMapping[data.transaction.category]?.color || 'text-gray-600 bg-gray-50'
        };
        setTransactions(prev => [newTransaction, ...prev]);

        // Refresh budgets if callback is set and this is an expense
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setTransactions(prev => prev.map(transaction => {
          if (transaction.id === id) {
            const updated = { ...transaction, ...updates };
            // Update icon and color if category changed
            if (updates.category) {
              updated.icon = categoryMapping[updates.category]?.icon || 'ri-more-line';
              updated.color = categoryMapping[updates.category]?.color || 'text-gray-600 bg-gray-50';
            }
            return updated;
          }
          return transaction;
        }));
        
        // Refresh budgets if callback is set and this affects expenses
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
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
        
        // Refresh budgets if callback is set
        if (budgetRefreshCallback) {
          await budgetRefreshCallback();
        }
        
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
      // Delete transactions one by one (could be optimized with a batch delete endpoint)
      const deletePromises = ids.map(id => 
        fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      );
      
      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map(r => r.json()));
      
      const successfulDeletes = results.filter(r => r.success).length;
      
      if (successfulDeletes > 0) {
        // Update local state
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

  const getTransactionsByCategory = (category: string): Transaction[] => {
    return transactions.filter(transaction => transaction.category === category);
  };

  const getTransactionsByBudget = (budgetId: string): Transaction[] => {
    return transactions.filter(transaction => transaction.budgetId === budgetId);
  };

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
        // Add legacy fields for compatibility
        const transactionsWithLegacyFields = data.transactions.map((transaction: Transaction) => ({
          ...transaction,
          merchant: transaction.description, // Use description as merchant for compatibility
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

  const getTotalIncome = (): number => {
    return transactions
      .filter(transaction => transaction.amount > 0)
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTotalExpenses = (): number => {
    return Math.abs(transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((total, transaction) => total + transaction.amount, 0));
  };

  const getNetIncome = (): number => {
    return getTotalIncome() - getTotalExpenses();
  };

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