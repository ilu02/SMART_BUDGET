'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTransactions } from '../contexts/TransactionContext';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartContainer from '@/components/dashboard/ChartContainer';
import QuickInsights from '@/components/dashboard/QuickInsights';
import SpendingAlerts from '@/components/SpendingAlerts';

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useSettings();
  const { transactions, getTotalIncome, getTotalExpenses, getNetIncome } = useTransactions();

  // Calculate monthly data for the chart
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; balance: number; income: number; expenses: number }> = {};
    
    // Initialize last 7 months
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthName,
        balance: 0,
        income: 0,
        expenses: 0
      };
    }

    // Process transactions
    let runningBalance = 0;
    transactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(transaction => {
        const monthKey = transaction.date.slice(0, 7);
        if (monthlyData[monthKey]) {
          if (transaction.amount > 0) {
            monthlyData[monthKey].income += transaction.amount;
          } else {
            monthlyData[monthKey].expenses += Math.abs(transaction.amount);
          }
          runningBalance += transaction.amount;
          monthlyData[monthKey].balance = runningBalance;
        }
      });

    return Object.values(monthlyData);
  }, [transactions]);

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
        subtitle="Track your balance over the last 7 months"
      >
        <div className="h-80">
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
                dataKey="month" 
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
                formatter={(value: number) => [formatCurrency(value), 'Balance']}
                labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#balanceGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 3, fill: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Quick Insights */}
      <QuickInsights insights={insights} />

      {/* Spending Alerts */}
      <SpendingAlerts />
    </div>
  );
}