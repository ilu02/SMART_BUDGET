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
      <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl h-fit max-h-[calc(100vh-12rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <Skeleton className="h-6 sm:h-7 w-32 sm:w-48" />
          <Skeleton className="h-6 w-16 sm:w-20" />
        </div>
        <div className="space-y-3 sm:space-y-4 flex-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-24 sm:w-36 mb-2" />
                  <Skeleton className="h-3 w-20 sm:w-28" />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl h-fit flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="text-center py-8 sm:py-12 flex-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <i className="ri-exchange-line text-2xl sm:text-3xl text-blue-600" aria-hidden="true"></i>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No transactions yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto px-4">
            Start tracking your expenses by adding your first transaction and get insights into your spending.
          </p>
          <Link href="/transactions">
            <Button size="lg" className="shadow-lg hover:shadow-xl">
              <i className="ri-add-line mr-2" aria-hidden="true"></i>
              <span className="hidden sm:inline">Add Your First Transaction</span>
              <span className="sm:hidden">Add Transaction</span>
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
    <Card className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-fit max-h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">Recent Transactions</h2>
          <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Your latest financial activity</p>
        </div>
        <Link href="/transactions" className="flex-shrink-0 ml-4">
          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 hidden sm:flex">
            <i className="ri-arrow-right-line mr-2" aria-hidden="true"></i>
            <span>View All</span>
          </Button>
          <Button variant="outline" size="sm" className="p-2 sm:hidden hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Button>
        </Link>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
          {recentTransactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction}
              onClick={() => {
                console.log('Transaction clicked:', transaction.id);
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Weekly Summary */}
      <div className="mt-6 pt-4 sm:pt-6 border-t border-gray-200 flex-shrink-0">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <i className="ri-calendar-week-line mr-2 text-blue-600" aria-hidden="true"></i>
            <span className="hidden sm:inline">This Week Summary</span>
            <span className="sm:hidden">This Week</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* Income Section */}
            <div className="text-center flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 flex-shrink-0">
                <i className="ri-arrow-up-line text-green-600 text-base sm:text-lg" aria-hidden="true"></i>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 flex-shrink-0">Income</p>
              <p className="font-bold text-lg sm:text-xl text-green-600 min-w-0 truncate">
                +{formatCurrency(weeklyIncome)}
              </p>
            </div>
            {/* Expenses Section */}
            <div className="text-center flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 flex-shrink-0">
                <i className="ri-arrow-down-line text-red-600 text-base sm:text-lg" aria-hidden="true"></i>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 flex-shrink-0">Expenses</p>
              <p className="font-bold text-lg sm:text-xl text-red-600 min-w-0 truncate">
                -{formatCurrency(weeklyExpenses)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}