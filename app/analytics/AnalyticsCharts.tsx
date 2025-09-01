'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '@/components/ui/Card';
import { useSettings } from '../contexts/SettingsContext';
import { useMemo } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

type DateRange = 'day' | 'week' | 'month' | 'year';

interface AnalyticsChartsProps {
  transactions: any[];
  selectedRange: DateRange;
}

export default function AnalyticsCharts({ transactions, selectedRange }: AnalyticsChartsProps) {
  const { formatCurrency } = useSettings();

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

  // Dynamic spending trend based on selected range
  const trendData = useMemo(() => {
    const data: Record<string, { period: string; expenses: number; income: number }> = {};
    
    // Helper function to get period info
    const getPeriodInfo = (date: Date, range: DateRange) => {
      switch (range) {
        case 'day':
          return {
            key: date.toISOString().slice(0, 13), // YYYY-MM-DDTHH
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

    // Initialize periods
    const periodsToShow = selectedRange === 'day' ? 24 : 
                         selectedRange === 'week' ? 7 : 
                         selectedRange === 'month' ? 12 : 5;

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
        expenses: 0,
        income: 0
      };
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      let periodInfo;
      
      if (selectedRange === 'day') {
        const hourDate = new Date(transactionDate);
        hourDate.setMinutes(0, 0, 0);
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

    return Object.values(data);
  }, [transactions, selectedRange]);

  // Spending pattern chart (expenses only)
  const spendingPattern = useMemo(() => {
    const data: Record<string, { period: string; amount: number }> = {};
    
    // Helper function to get period info for spending pattern
    const getPeriodInfo = (date: Date, range: DateRange) => {
      switch (range) {
        case 'day':
          return {
            key: date.toISOString().slice(0, 13), // YYYY-MM-DDTHH
            label: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
          };
        case 'week':
          return {
            key: date.toISOString().slice(0, 10), // YYYY-MM-DD
            label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
          };
        case 'month':
          return {
            key: date.toISOString().slice(0, 10), // YYYY-MM-DD
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
        case 'year':
          return {
            key: date.toISOString().slice(0, 7), // YYYY-MM
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          };
        default:
          return { key: '', label: '' };
      }
    };

    // Initialize periods for spending pattern
    const periodsToShow = selectedRange === 'day' ? 24 : 
                         selectedRange === 'week' ? 7 : 
                         selectedRange === 'month' ? 30 : 12;

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
          date.setDate(date.getDate() - i);
          break;
        case 'year':
          date.setMonth(date.getMonth() - i);
          break;
      }
      
      const periodInfo = getPeriodInfo(date, selectedRange);
      data[periodInfo.key] = {
        period: periodInfo.label,
        amount: 0
      };
    }

    // Process expense transactions only
    transactions
      .filter(t => t.amount < 0)
      .forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        let periodInfo;
        
        if (selectedRange === 'day') {
          const hourDate = new Date(transactionDate);
          hourDate.setMinutes(0, 0, 0);
          periodInfo = getPeriodInfo(hourDate, selectedRange);
        } else {
          periodInfo = getPeriodInfo(transactionDate, selectedRange);
        }
        
        if (data[periodInfo.key]) {
          data[periodInfo.key].amount += Math.abs(transaction.amount);
        }
      });

    return Object.values(data);
  }, [transactions, selectedRange]);

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

  // Check if we have data for the selected period
  const hasData = transactions.length > 0;

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 col-span-full">
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <i className="ri-bar-chart-line text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">No data available for the selected period</p>
              <p className="text-sm text-gray-400 mt-1">Try selecting a different time range</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Breakdown Pie Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending by Category
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({selectedRange === 'day' ? '24H' : 
              selectedRange === 'week' ? '7D' : 
              selectedRange === 'month' ? '12M' : '5Y'})
          </span>
        </h3>
        <div className="h-80">
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="ri-pie-chart-line text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-500">No expense categories found</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </Card>

      {/* Dynamic Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedRange === 'day' ? 'Hourly Trend (24H)' : 
           selectedRange === 'week' ? 'Daily Trend (7D)' : 
           selectedRange === 'month' ? 'Monthly Trend (12M)' : 
           'Yearly Trend (5Y)'}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
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

      {/* Spending Pattern Area Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Spending Pattern - {selectedRange === 'day' ? 'Last 24 Hours' : 
                              selectedRange === 'week' ? 'Last 7 Days' : 
                              selectedRange === 'month' ? 'Last 30 Days' : 
                              'Last 12 Months'}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
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