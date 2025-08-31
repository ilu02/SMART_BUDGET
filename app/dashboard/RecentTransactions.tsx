'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useSettings } from '../contexts/SettingsContext';
import { useTransactions } from '../contexts/TransactionContext';
import TransactionItem from '@/components/dashboard/TransactionItem';

export default function RecentTransactions() {
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettings();
  const { transactions } = useTransactions();

  // Get the 6 most recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-36 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="ri-exchange-line text-3xl text-blue-600" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No transactions yet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Start tracking your expenses by adding your first transaction and get insights into your spending.
          </p>
          <Link href="/transactions">
            <Button size="lg" className="shadow-lg hover:shadow-xl">
              <i className="ri-add-line mr-2" aria-hidden="true"></i>
              Add Your First Transaction
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Calculate weekly stats
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyIncome = recentTransactions
    .filter(t => new Date(t.date) >= weekAgo && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const weeklyExpenses = Math.abs(recentTransactions
    .filter(t => new Date(t.date) >= weekAgo && t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));

  return (
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Transactions</h2>
          <p className="text-gray-600">Your latest financial activity</p>
        </div>
        <Link href="/transactions">
          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
            <i className="ri-arrow-right-line mr-2" aria-hidden="true"></i>
            View All
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {recentTransactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction}
            onClick={() => {
              // Handle transaction click
              console.log('Transaction clicked:', transaction.id);
            }}
          />
        ))}
      </div>

      {/* Weekly Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="ri-calendar-week-line mr-2 text-blue-600" aria-hidden="true"></i>
            This Week Summary
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-arrow-up-line text-green-600 text-lg" aria-hidden="true"></i>
              </div>
              <p className="text-sm text-gray-600 mb-1">Income</p>
              <p className="font-bold text-xl text-green-600">
                +{formatCurrency(weeklyIncome)}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-arrow-down-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <p className="text-sm text-gray-600 mb-1">Expenses</p>
              <p className="font-bold text-xl text-red-600">
                -{formatCurrency(weeklyExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}