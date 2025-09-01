'use client';

import { useEffect } from 'react';
import { useBudgets } from './BudgetContext';
import { useTransactions } from './TransactionContext';

export function BudgetTransactionSync({ children }: { children: React.ReactNode }) {
  const { refreshBudgets } = useBudgets();
  const { setBudgetRefreshCallback } = useTransactions();

  useEffect(() => {
    // Set up the callback so transactions can refresh budgets
    setBudgetRefreshCallback(refreshBudgets);
  }, [refreshBudgets, setBudgetRefreshCallback]);

  return <>{children}</>;
}