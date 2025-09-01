'use client';

import { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { Card } from '@/components/ui/Card';
import AnalyticsCharts from './AnalyticsCharts';
import { useTransactions } from '../contexts/TransactionContext';
import { useSettings } from '../contexts/SettingsContext';

type DateRange = 'day' | 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState<DateRange>('month');
  const { transactions, getTotalIncome, getTotalExpenses, getNetIncome } = useTransactions();
  const { formatCurrency } = useSettings();

  // Filter transactions based on selected date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedRange) {
      case 'day':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, selectedRange]);

  // Calculate stats based on filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = Math.abs(filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));
    
  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  // Calculate some quick stats
  const averageTransaction = filteredTransactions.length > 0 
    ? filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / filteredTransactions.length 
    : 0;

  const largestExpense = Math.max(
    ...filteredTransactions.filter(t => t.amount < 0).map(t => Math.abs(t.amount)), 
    0
  );

  const mostActiveCategory = filteredTransactions.length > 0 
    ? filteredTransactions
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    : {};

  const topCategory = Object.entries(mostActiveCategory)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Detailed insights into your spending patterns and financial trends
              </p>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center mt-4 sm:mt-0 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:mr-4">
                <i className="ri-calendar-line text-gray-500"></i>
                <span className="text-sm font-medium text-gray-700">Time Period:</span>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
                {([
                  { key: 'day', label: '24H', icon: 'ri-time-line', tooltip: 'Last 24 hours' },
                  { key: 'week', label: '7D', icon: 'ri-calendar-week-line', tooltip: 'Last 7 days' },
                  { key: 'month', label: '12M', icon: 'ri-calendar-line', tooltip: 'Last 12 months' },
                  { key: 'year', label: '5Y', icon: 'ri-calendar-event-line', tooltip: 'Last 5 years' }
                ] as { key: DateRange; label: string; icon: string; tooltip: string }[]).map((range) => (
                  <button
                    key={range.key}
                    onClick={() => setSelectedRange(range.key)}
                    title={range.tooltip}
                    className={`flex items-center space-x-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      selectedRange === range.key
                        ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <i className={`${range.icon} text-sm`}></i>
                    <span>{range.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Period Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Period Overview - {
                selectedRange === 'day' ? 'Last 24 Hours' : 
                selectedRange === 'week' ? 'Last 7 Days' : 
                selectedRange === 'month' ? 'Last 12 Months' : 
                'Last 5 Years'
              }
            </h2>
            <div className="text-sm text-gray-600">
              {filteredTransactions.length} transactions
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              <p className="text-sm text-gray-600">Total Income</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </p>
              <p className="text-sm text-gray-600">Net Income</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-line-chart-line text-blue-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-calculator-line text-green-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(averageTransaction)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Largest Expense</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(largestExpense)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-pie-chart-line text-purple-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {topCategory}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-green-600" aria-hidden="true"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-sm text-gray-500">
              From {filteredTransactions.filter(t => t.amount > 0).length} income transactions
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-down-line text-red-600" aria-hidden="true"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-sm text-gray-500">
              From {filteredTransactions.filter(t => t.amount < 0).length} expense transactions
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Net Income</h3>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <i className={`${
                  netIncome >= 0 ? 'ri-trending-up-line text-green-600' : 'ri-trending-down-line text-red-600'
                }`} aria-hidden="true"></i>
              </div>
            </div>
            <p className={`text-3xl font-bold mb-2 ${
              netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(netIncome)}
            </p>
            <p className="text-sm text-gray-500">
              {netIncome >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
            </p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Insights</h2>
          <AnalyticsCharts 
            transactions={filteredTransactions} 
            selectedRange={selectedRange}
          />
        </div>

        {/* Insights and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="ri-lightbulb-line mr-2 text-yellow-500" aria-hidden="true"></i>
              Financial Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  savingsRate >= 20 ? 'bg-green-500' : savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">Savings Rate Analysis</p>
                  <p className="text-sm text-gray-600">
                    {savingsRate >= 20 
                      ? 'Excellent! You\'re saving over 20% of your income.'
                      : savingsRate >= 10
                      ? 'Good savings rate. Consider increasing to 20% if possible.'
                      : 'Your savings rate is below 10%. Try to reduce expenses or increase income.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  filteredTransactions.length >= 20 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">Transaction Volume</p>
                  <p className="text-sm text-gray-600">
                    You have {filteredTransactions.length} transactions in the selected period. 
                    {filteredTransactions.length >= 20 
                      ? ' Great data for accurate insights!'
                      : ' More transactions would provide better analytics.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Spending Pattern</p>
                  <p className="text-sm text-gray-600">
                    Your most active category is "{topCategory}". 
                    Consider if this aligns with your financial goals.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="ri-target-line mr-2 text-blue-500" aria-hidden="true"></i>
              Recommendations
            </h3>
            <div className="space-y-4">
              {savingsRate < 20 && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="font-medium text-yellow-800 mb-1">Increase Savings Rate</p>
                  <p className="text-sm text-yellow-700">
                    Aim for a 20% savings rate by reducing discretionary spending or finding additional income sources.
                  </p>
                </div>
              )}

              {largestExpense > averageTransaction * 5 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-medium text-red-800 mb-1">Review Large Expenses</p>
                  <p className="text-sm text-red-700">
                    Your largest expense ({formatCurrency(largestExpense)}) is significantly above average. 
                    Consider if this was necessary or could be avoided in the future.
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-1">Budget Optimization</p>
                <p className="text-sm text-blue-700">
                  Based on your spending patterns, consider setting up budgets for your top spending categories 
                  to better control expenses.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800 mb-1">Track Progress</p>
                <p className="text-sm text-green-700">
                  Continue logging all transactions to get more accurate insights and track your financial progress over time.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}