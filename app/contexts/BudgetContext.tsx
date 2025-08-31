'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface Budget {
  id: string;
  category: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
  description?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetByCategory: (category: string) => Budget | undefined;
  getTotalBudget: () => number;
  getTotalSpent: () => number;
  getTotalRemaining: () => number;
  getOverallProgress: () => number;
  loading: boolean;
  refreshBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Load budgets from database when user is authenticated
  const loadBudgets = useCallback(async () => {
    if (!user?.id) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/budgets?userId=${user.id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setBudgets(data.budgets);
      } else {
        console.error('Failed to load budgets:', data.error);
        setBudgets([]);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load budgets when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadBudgets();
    } else {
      setBudgets([]);
      setLoading(false);
    }
  }, [user, isAuthenticated, loadBudgets]);

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...budgetData,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBudgets(prev => [...prev, data.budget]);
        toast.success('Budget added successfully!');
      } else {
        toast.error(data.error || 'Failed to add budget');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget');
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
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
        setBudgets(prev => prev.map(budget => 
          budget.id === id ? { ...budget, ...updates } : budget
        ));
        toast.success('Budget updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBudgets(prev => prev.filter(budget => budget.id !== id));
        toast.success('Budget deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const refreshBudgets = useCallback(async () => {
    await loadBudgets();
  }, [loadBudgets]);

  const getBudgetByCategory = (category: string): Budget | undefined => {
    return budgets.find(budget => budget.category === category);
  };

  const getTotalBudget = (): number => {
    return budgets.reduce((total, budget) => total + budget.budget, 0);
  };

  const getTotalSpent = (): number => {
    return budgets.reduce((total, budget) => total + budget.spent, 0);
  };

  const getTotalRemaining = (): number => {
    return getTotalBudget() - getTotalSpent();
  };

  const getOverallProgress = (): number => {
    const totalBudget = getTotalBudget();
    if (totalBudget === 0) return 0;
    return (getTotalSpent() / totalBudget) * 100;
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetByCategory,
        getTotalBudget,
        getTotalSpent,
        getTotalRemaining,
        getOverallProgress,
        loading,
        refreshBudgets
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
}