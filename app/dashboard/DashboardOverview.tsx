'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTransactions } from '../contexts/TransactionContext';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartContainer from '@/components/dashboard/ChartContainer';
import QuickInsights from '@/components/dashboard/QuickInsights';
import SpendingAlerts from '@/components/SpendingAlerts';

type DateRange = 'day' | 'week' | 'month' | 'year';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRange>('month');
  const { formatCurrency } = useSettings();
  const { transactions, getTotalIncome, getTotalExpenses, getNetIncome } = useTransactions();

  // Calculate chart data based on selected range
  const chartData = useMemo(() => {
    const data: Record<string, { period: string; balance: number; income: number; expenses: number }> = {};
    
    // Helper function to get period key and label
    const getPeriodInfo = (date: Date, range: DateRange) => {
      switch (range) {
        case 'day':
          return {
            key: date.toISOString().slice(0, 13), // YYYY-MM-DDTHH (hour precision)
            label: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
          };
        case 'week':
          return {
            key: date.toISOString().slice(0, 10), // YYYY-MM-DD
            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          };
        case 'month':
          return {
            key: date.toISOString().slice(0, 7), // YYYY-MM
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          };
        case 'year':
          return {
            key: date.getFullYear().toString(),
            label: date.getFullYear().toString()
          };
        default:
          return { key: '', label: '' };
      }
    };

    // Initialize periods based on selected range
    const periodsToShow = selectedRange === 'day' ? 24 : // 24 hours
                         selectedRange === 'week' ? 7 : // 7 days
                         selectedRange === 'month' ? 12 : // 12 months
                         selectedRange === 'year' ? 5 : 12; // 5 years

    for (let i = periodsToShow - 1; i >= 0; i--) {
      const date = new Date();
      
      switch (selectedRange) {
        case 'day':
          date.setHours(date.getHours() - i);
          break;
        case 'week':
          date.setDate(date.getDate() - i);
          break;
        case 'month':
          date.setMonth(date.getMonth() - i);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - i);
          break;
      }
      
      const periodInfo = getPeriodInfo(date, selectedRange);
      data[periodInfo.key] = {
        period: periodInfo.label,
        balance: 0,
        income: 0,
        expenses: 0
      };
    }

    // Process transactions
    // First, calculate the starting balance (all transactions before our time range)
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
    
    // Calculate starting balance (all transactions before our time range)
    let startingBalance = transactions
      .filter(t => new Date(t.date) < startDate)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Process transactions within our time range and group by period
    const relevantTransactions = transactions
      .filter(t => new Date(t.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    relevantTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      let periodInfo;
      
      if (selectedRange === 'day') {
        // For day view, group by hour
        const hourDate = new Date(transactionDate);
        hourDate.setMinutes(0, 0, 0); // Reset to start of hour
        periodInfo = getPeriodInfo(hourDate, selectedRange);
      } else {
        periodInfo = getPeriodInfo(transactionDate, selectedRange);
      }
      
      if (data[periodInfo.key]) {
        if (transaction.amount > 0) {
          data[periodInfo.key].income += transaction.amount;
        } else {
          data[periodInfo.key].expenses += Math.abs(transaction.amount);
        }
      }
    });
    
    // Now calculate running balance for each period in chronological order
    const sortedPeriods = Object.keys(data).sort();
    let runningBalance = startingBalance;
    
    sortedPeriods.forEach(key => {
      const periodData = data[key];
      runningBalance += (periodData.income - periodData.expenses);
      periodData.balance = runningBalance;
    });

    return Object.values(data);
  }, [transactions, selectedRange]);

  const currentBalance = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthlyIncome = getTotalIncome();
  const monthlyExpenses = getTotalExpenses();
  const netSavings = getNetIncome();

  // Calculate previous month data for comparison
  const previousMonthData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const prevMonthKey = previousMonth.toISOString().slice(0, 7);
    
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const prevMonthTransactions = transactions.filter(t => t.date.startsWith(prevMonthKey));
    
    const currentIncome = currentMonthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const prevIncome = prevMonthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpenses = Math.abs(currentMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const prevExpenses = Math.abs(prevMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    
    return {
      incomeChange: prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome * 100) : 0,
      expenseChange: prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses * 100) : 0,
    };
  }, [transactions]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
        <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const insights = [
    {
      label: 'Total Transactions',
      value: transactions.length.toString(),
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      icon: 'ri-exchange-line',
      trend: 'neutral' as const
    },
    {
      label: 'Average Transaction',
      value: formatCurrency(transactions.length > 0 ? Math.abs(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length) : 0),
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      icon: 'ri-calculator-line',
      trend: 'neutral' as const
    },
    {
      label: 'Savings Rate',
      value: `${monthlyIncome > 0 ? ((netSavings / monthlyIncome) * 100).toFixed(1) : 0}%`,
      color: netSavings >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: 'ri-percent-line',
      trend: netSavings >= 0 ? ('up' as const) : ('down' as const)
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Balance"
          value={formatCurrency(currentBalance)}
          icon="ri-wallet-3-line"
          gradient="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700"
          iconBg="bg-blue-500"
          textColor="text-white"
        />
        
        <MetricCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon="ri-arrow-up-line"
          gradient="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600"
          iconBg="bg-green-500"
          textColor="text-white"
          change={{
            value: `${Math.abs(previousMonthData.incomeChange).toFixed(1)}%`,
            type: previousMonthData.incomeChange >= 0 ? 'increase' : 'decrease'
          }}
        />
        
        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon="ri-arrow-down-line"
          gradient="bg-gradient-to-br from-red-500 via-red-600 to-rose-600"
          iconBg="bg-red-500"
          textColor="text-white"
          change={{
            value: `${Math.abs(previousMonthData.expenseChange).toFixed(1)}%`,
            type: previousMonthData.expenseChange >= 0 ? 'increase' : 'decrease'
          }}
        />
        
        <MetricCard
          title="Net Savings"
          value={formatCurrency(netSavings)}
          icon="ri-savings-line"
          gradient={netSavings >= 0 
            ? "bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600"
            : "bg-gradient-to-br from-orange-500 via-orange-600 to-red-600"
          }
          iconBg={netSavings >= 0 ? "bg-purple-500" : "bg-orange-500"}
          textColor="text-white"
        />
      </div>

      {/* Chart */}
      <ChartContainer 
        title="Financial Trend"
        subtitle={`Track your balance over the last ${
          selectedRange === 'day' ? '24 hours' : 
          selectedRange === 'week' ? '7 days' : 
          selectedRange === 'month' ? '12 months' : 
          '5 years'
        }`}
      >
        {/* Date Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <i className="ri-calendar-line text-gray-500"></i>
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {([
              { key: 'day', label: '24H', icon: 'ri-time-line', tooltip: 'Last 24 hours (hourly)' },
              { key: 'week', label: '7D', icon: 'ri-calendar-week-line', tooltip: 'Last 7 days (daily)' },
              { key: 'month', label: '12M', icon: 'ri-calendar-line', tooltip: 'Last 12 months (monthly)' },
              { key: 'year', label: '5Y', icon: 'ri-calendar-event-line', tooltip: 'Last 5 years (yearly)' }
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
        
        {/* Period Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">Current Balance</span>
            </div>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {formatCurrency(chartData.length > 0 ? chartData[chartData.length - 1].balance : 0)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Total Income</span>
            </div>
            <p className="text-lg font-bold text-green-900 mt-1">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.income, 0))}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-700">Total Expenses</span>
            </div>
            <p className="text-lg font-bold text-red-900 mt-1">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.expenses, 0))}
            </p>
          </div>
        </div>
        
        <div className="h-80">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="ri-bar-chart-line text-4xl text-gray-300 mb-2"></i>
                <p className="text-gray-500">No data available for the selected period</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="period" 
                stroke="#64748b"
                fontSize={12}
                fontWeight={500}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                fontWeight={500}
                tickFormatter={(value) => {
                  const absValue = Math.abs(value);
                  if (absValue >= 1000) {
                    return formatCurrency(absValue / 1000) + 'k';
                  }
                  return formatCurrency(absValue);
                }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const label = name === 'balance' ? 'Balance' : 
                               name === 'income' ? 'Income' : 'Expenses';
                  return [formatCurrency(value), label];
                }}
                labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Area
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#balanceGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                strokeWidth={2}
                fill="transparent"
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: 'white' }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="transparent"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </ChartContainer>

      {/* Quick Insights */}
      <QuickInsights insights={insights} />

      {/* Spending Alerts */}
      <SpendingAlerts />
    </div>
  );
}