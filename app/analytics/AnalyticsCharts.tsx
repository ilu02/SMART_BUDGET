'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '@/components/ui/Card';
import { useSettings } from '../contexts/SettingsContext';
import { useTransactions } from '../contexts/TransactionContext';
import { useMemo } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

export default function AnalyticsCharts() {
  const { formatCurrency } = useSettings();
  const { transactions } = useTransactions();

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter(t => t.amount < 0) // Only expenses
      .forEach(transaction => {
        const category = transaction.category;
        const amount = Math.abs(transaction.amount);
        categories[category] = (categories[category] || 0) + amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [transactions]);

  // Monthly spending trend
  const monthlySpending = useMemo(() => {
    const monthlyData: Record<string, { month: string; expenses: number; income: number }> = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      monthlyData[monthKey] = {
        month: monthName,
        expenses: 0,
        income: 0
      };
    }

    transactions.forEach(transaction => {
      const monthKey = transaction.date.slice(0, 7);
      if (monthlyData[monthKey]) {
        if (transaction.amount > 0) {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expenses += Math.abs(transaction.amount);
        }
      }
    });

    return Object.values(monthlyData);
  }, [transactions]);

  // Daily spending for the last 30 days
  const dailySpending = useMemo(() => {
    const dailyData: Record<string, { date: string; amount: number }> = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dailyData[dateKey] = {
        date: dateLabel,
        amount: 0
      };
    }

    transactions
      .filter(t => t.amount < 0) // Only expenses
      .forEach(transaction => {
        const dateKey = transaction.date;
        if (dailyData[dateKey]) {
          dailyData[dateKey].amount += Math.abs(transaction.amount);
        }
      });

    return Object.values(dailyData);
  }, [transactions]);

  // Income vs Expenses comparison
  const incomeVsExpenses = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return [
      { name: 'Income', value: totalIncome, color: '#10B981' },
      { name: 'Expenses', value: totalExpenses, color: '#EF4444' }
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Breakdown Pie Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Spending Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'expenses' ? 'Expenses' : 'Income']}
              />
              <Bar dataKey="expenses" fill="#EF4444" name="expenses" />
              <Bar dataKey="income" fill="#10B981" name="income" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Daily Spending Area Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Spending (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Spent']} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Income vs Expenses */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeVsExpenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }: any) => `${name}: ${formatCurrency(value)} (${((percent || 0) * 100).toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeVsExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}