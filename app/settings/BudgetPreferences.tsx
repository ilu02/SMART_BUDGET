'use client';

import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useBudgets } from '../contexts/BudgetContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const defaultCategories = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Health & Fitness',
  'Utilities',
  'Education',
  'Travel',
  'Insurance',
  'Savings'
];

const currencies = [
  { code: 'ZMW', symbol: 'K', name: 'Zambian Kwacha', position: 'before' },
  { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', position: 'after' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', position: 'before' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', position: 'before' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', position: 'before' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', position: 'before' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', position: 'before' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', position: 'after' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', position: 'before' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', position: 'after' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', position: 'after' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', position: 'after' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', position: 'after' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', position: 'before' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', position: 'before' }
];

// Budget template definitions
interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  categories: {
    category: string;
    percentage: number;
    icon: string;
    color: string;
    description?: string;
  }[];
  settings?: {
    rolloverUnused?: boolean;
    warningThreshold?: number;
    autoSavePercentage?: number;
    roundUpTransactions?: boolean;
  };
}

const budgetTemplates: BudgetTemplate[] = [
  {
    id: '50-30-20',
    name: '50/30/20 Rule',
    description: '50% needs, 30% wants, 20% savings',
    icon: 'ri-pie-chart-line',
    categories: [
      { category: 'Housing & Utilities', percentage: 25, icon: 'ri-home-line', color: '#3B82F6' },
      { category: 'Food & Groceries', percentage: 15, icon: 'ri-restaurant-line', color: '#10B981' },
      { category: 'Transportation', percentage: 10, icon: 'ri-car-line', color: '#F59E0B' },
      { category: 'Entertainment', percentage: 15, icon: 'ri-gamepad-line', color: '#EF4444' },
      { category: 'Shopping', percentage: 10, icon: 'ri-shopping-bag-line', color: '#8B5CF6' },
      { category: 'Dining Out', percentage: 5, icon: 'ri-restaurant-2-line', color: '#06B6D4' },
      { category: 'Emergency Fund', percentage: 10, icon: 'ri-shield-line', color: '#F97316' },
      { category: 'Savings & Investments', percentage: 10, icon: 'ri-bank-line', color: '#EC4899' }
    ],
    settings: {
      rolloverUnused: true,
      warningThreshold: 80,
      autoSavePercentage: 20
    }
  },
  {
    id: 'zero-based',
    name: 'Zero-Based Budget',
    description: 'Every dollar has a purpose',
    icon: 'ri-calculator-line',
    categories: [
      { category: 'Housing & Utilities', percentage: 30, icon: 'ri-home-line', color: '#3B82F6' },
      { category: 'Food & Groceries', percentage: 12, icon: 'ri-restaurant-line', color: '#10B981' },
      { category: 'Transportation', percentage: 15, icon: 'ri-car-line', color: '#F59E0B' },
      { category: 'Insurance', percentage: 8, icon: 'ri-shield-check-line', color: '#EF4444' },
      { category: 'Debt Payments', percentage: 10, icon: 'ri-bank-card-line', color: '#8B5CF6' },
      { category: 'Personal Care', percentage: 5, icon: 'ri-heart-line', color: '#06B6D4' },
      { category: 'Entertainment', percentage: 5, icon: 'ri-gamepad-line', color: '#F97316' },
      { category: 'Savings', percentage: 10, icon: 'ri-safe-line', color: '#EC4899' },
      { category: 'Miscellaneous', percentage: 5, icon: 'ri-more-line', color: '#64748B' }
    ],
    settings: {
      rolloverUnused: false,
      warningThreshold: 90,
      autoSavePercentage: 10
    }
  },
  {
    id: 'envelope',
    name: 'Envelope Method',
    description: 'Cash-based category budgeting',
    icon: 'ri-mail-line',
    categories: [
      { category: 'Rent/Mortgage', percentage: 28, icon: 'ri-home-line', color: '#3B82F6' },
      { category: 'Utilities', percentage: 7, icon: 'ri-flashlight-line', color: '#10B981' },
      { category: 'Groceries', percentage: 12, icon: 'ri-shopping-cart-line', color: '#F59E0B' },
      { category: 'Transportation', percentage: 12, icon: 'ri-car-line', color: '#EF4444' },
      { category: 'Healthcare', percentage: 8, icon: 'ri-heart-pulse-line', color: '#8B5CF6' },
      { category: 'Personal Care', percentage: 3, icon: 'ri-scissors-line', color: '#06B6D4' },
      { category: 'Entertainment', percentage: 8, icon: 'ri-movie-line', color: '#F97316' },
      { category: 'Clothing', percentage: 5, icon: 'ri-shirt-line', color: '#EC4899' },
      { category: 'Savings', percentage: 12, icon: 'ri-piggy-bank-line', color: '#64748B' },
      { category: 'Emergency Fund', percentage: 5, icon: 'ri-alarm-warning-line', color: '#DC2626' }
    ],
    settings: {
      rolloverUnused: true,
      warningThreshold: 85,
      roundUpTransactions: true
    }
  },
  {
    id: 'pay-yourself-first',
    name: 'Pay Yourself First',
    description: 'Savings-focused approach',
    icon: 'ri-coin-line',
    categories: [
      { category: 'Savings & Investments', percentage: 20, icon: 'ri-line-chart-line', color: '#10B981' },
      { category: 'Emergency Fund', percentage: 10, icon: 'ri-shield-line', color: '#EF4444' },
      { category: 'Housing & Utilities', percentage: 25, icon: 'ri-home-line', color: '#3B82F6' },
      { category: 'Food & Groceries', percentage: 15, icon: 'ri-restaurant-line', color: '#F59E0B' },
      { category: 'Transportation', percentage: 10, icon: 'ri-car-line', color: '#8B5CF6' },
      { category: 'Healthcare', percentage: 5, icon: 'ri-heart-pulse-line', color: '#06B6D4' },
      { category: 'Personal & Entertainment', percentage: 10, icon: 'ri-user-smile-line', color: '#F97316' },
      { category: 'Miscellaneous', percentage: 5, icon: 'ri-more-line', color: '#EC4899' }
    ],
    settings: {
      rolloverUnused: true,
      warningThreshold: 75,
      autoSavePercentage: 30
    }
  }
];

export default function BudgetPreferences() {
  const { budgetPreferences, updateBudgetPreferences, formatCurrency } = useSettings();
  const { addBudget, updateBudget, budgets, refreshBudgets } = useBudgets();
  const [newCategory, setNewCategory] = useState('');
  const [isApplyingTemplate, setIsApplyingTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const handlePeriodChange = (period: 'weekly' | 'monthly' | 'yearly') => {
    updateBudgetPreferences({ defaultBudgetPeriod: period });
    toast.success(`Default budget period changed to ${period}`);
  };

  const handleToggleRollover = () => {
    updateBudgetPreferences({ rolloverUnused: !budgetPreferences.rolloverUnused });
    toast.success(`Budget rollover ${!budgetPreferences.rolloverUnused ? 'enabled' : 'disabled'}`);
  };

  const handleToggleRoundUp = () => {
    updateBudgetPreferences({ roundUpTransactions: !budgetPreferences.roundUpTransactions });
    toast.success(`Round up transactions ${!budgetPreferences.roundUpTransactions ? 'enabled' : 'disabled'}`);
  };

  const handleToggleCategorize = () => {
    updateBudgetPreferences({ categorizeTransactions: !budgetPreferences.categorizeTransactions });
    toast.success(`Auto-categorize ${!budgetPreferences.categorizeTransactions ? 'enabled' : 'disabled'}`);
  };

  const handleWarningThresholdChange = (threshold: number) => {
    if (threshold >= 50 && threshold <= 100) {
      updateBudgetPreferences({ warningThreshold: threshold });
      toast.success(`Warning threshold set to ${threshold}%`);
    }
  };

  const handleAutoSaveChange = (percentage: number) => {
    if (percentage >= 0 && percentage <= 50) {
      updateBudgetPreferences({ autoSavePercentage: percentage });
      toast.success(`Auto-save percentage set to ${percentage}%`);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !budgetPreferences.defaultCategories.includes(newCategory.trim())) {
      updateBudgetPreferences({
        defaultCategories: [...budgetPreferences.defaultCategories, newCategory.trim()]
      });
      setNewCategory('');
      toast.success(`Category "${newCategory.trim()}" added`);
    } else if (budgetPreferences.defaultCategories.includes(newCategory.trim())) {
      toast.error('Category already exists');
    }
  };

  const handleRemoveCategory = (category: string) => {
    updateBudgetPreferences({
      defaultCategories: budgetPreferences.defaultCategories.filter(cat => cat !== category)
    });
    toast.success(`Category "${category}" removed`);
  };

  const handleResetCategories = () => {
    updateBudgetPreferences({ defaultCategories: [...defaultCategories] });
    toast.success('Categories reset to defaults');
  };

  const handleApplyTemplate = (template: BudgetTemplate) => {
    setSelectedTemplate(template);
    setMonthlyIncome('');
  };

  const handleConfirmTemplate = async () => {
    if (!selectedTemplate) return;
    
    if (!monthlyIncome || isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) {
      toast.error('Please enter a valid monthly income amount');
      return;
    }
    
    setIsApplyingTemplate(selectedTemplate.id);
    
    try {
      const income = Number(monthlyIncome);
      
      // Apply template settings to budget preferences
      if (selectedTemplate.settings) {
        updateBudgetPreferences({
          ...selectedTemplate.settings,
          defaultCategories: selectedTemplate.categories.map(cat => cat.category)
        });
      }
      
      // Create budgets for each category in the template
      const budgetPromises = selectedTemplate.categories.map(async (categoryTemplate) => {
        const budgetAmount = (income * categoryTemplate.percentage) / 100;
        
        // Check if budget already exists for this category
        const existingBudget = budgets.find(b => b.category === categoryTemplate.category);
        
        if (!existingBudget) {
          return addBudget({
            category: categoryTemplate.category,
            budget: budgetAmount,
            spent: 0,
            icon: categoryTemplate.icon,
            color: categoryTemplate.color,
            description: `${categoryTemplate.percentage}% of monthly income (${selectedTemplate.name})`
          }, true);
        } else {
          // Update existing budget amount
          await updateBudget(existingBudget.id, {
            budget: budgetAmount,
            description: `${categoryTemplate.percentage}% of monthly income (${selectedTemplate.name})`
          }, true);
        }
      });
      
      await Promise.all(budgetPromises);
      await refreshBudgets();
      
      toast.success(
        `${selectedTemplate.name} template applied successfully! Created budgets based on ${formatCurrency(income)} monthly income.`,
        { duration: 4000 }
      );
      
      setSelectedTemplate(null);
      setMonthlyIncome('');
      
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template. Please try again.');
    } finally {
      setIsApplyingTemplate(null);
    }
  };

  const handleCancelTemplate = () => {
    setSelectedTemplate(null);
    setMonthlyIncome('');
    setIsApplyingTemplate(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget Preferences</h2>
        <p className="text-gray-600">Configure your default budget settings and behavior</p>
      </div>

      {/* Currency Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency & Formatting</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={budgetPreferences.currency}
              onChange={(e) => {
                const selectedCurrency = currencies.find(c => c.code === e.target.value);
                if (selectedCurrency) {
                  updateBudgetPreferences({
                    currency: selectedCurrency.code,
                    currencySymbol: selectedCurrency.symbol,
                    currencyPosition: selectedCurrency.position as 'before' | 'after'
                  });
                  toast.success(`Currency changed to ${selectedCurrency.name}`);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Decimal Places */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimal Places
            </label>
            <select
              value={budgetPreferences.decimalPlaces}
              onChange={(e) => {
                updateBudgetPreferences({ decimalPlaces: parseInt(e.target.value) });
                toast.success(`Decimal places set to ${e.target.value}`);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>0 (1234)</option>
              <option value={2}>2 (1234.56)</option>
              <option value={3}>3 (1234.567)</option>
            </select>
          </div>

          {/* Thousands Separator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thousands Separator
            </label>
            <select
              value={budgetPreferences.thousandsSeparator}
              onChange={(e) => {
                updateBudgetPreferences({ thousandsSeparator: e.target.value as ',' | '.' | ' ' });
                toast.success('Thousands separator updated');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value=",">Comma (1,234.56)</option>
              <option value=".">Period (1.234,56)</option>
              <option value=" ">Space (1 234.56)</option>
            </select>
          </div>

          {/* Decimal Separator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Decimal Separator
            </label>
            <select
              value={budgetPreferences.decimalSeparator}
              onChange={(e) => {
                updateBudgetPreferences({ decimalSeparator: e.target.value as '.' | ',' });
                toast.success('Decimal separator updated');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value=".">Period (1234.56)</option>
              <option value=",">Comma (1234,56)</option>
            </select>
          </div>
        </div>

        {/* Currency Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Small Amount:</span>
              <div className="font-medium">{formatCurrency(123.45)}</div>
            </div>
            <div>
              <span className="text-gray-600">Large Amount:</span>
              <div className="font-medium">{formatCurrency(12345.67)}</div>
            </div>
            <div>
              <span className="text-gray-600">Negative:</span>
              <div className="font-medium text-red-600">{formatCurrency(-567.89)}</div>
            </div>
            <div>
              <span className="text-gray-600">Zero:</span>
              <div className="font-medium">{formatCurrency(0)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Default Budget Period */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Budget Period</h3>
        <div className="grid grid-cols-3 gap-4">
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period as any)}
              className={`p-4 rounded-lg border-2 transition-all ${
                budgetPreferences.defaultBudgetPeriod === period
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                  period === 'weekly' ? 'bg-green-100' :
                  period === 'monthly' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  <i className={`${
                    period === 'weekly' ? 'ri-calendar-line text-green-600' :
                    period === 'monthly' ? 'ri-calendar-2-line text-blue-600' :
                    'ri-calendar-event-line text-purple-600'
                  } text-xl`} aria-hidden="true"></i>
                </div>
                <span className="font-medium capitalize">{period}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Budget Behavior */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Behavior</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Rollover Unused Budget</h4>
              <p className="text-sm text-gray-500">Add unused budget from previous period to next period</p>
            </div>
            <button
              onClick={handleToggleRollover}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                budgetPreferences.rolloverUnused ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  budgetPreferences.rolloverUnused ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Round Up Transactions</h4>
              <p className="text-sm text-gray-500">Automatically round up transactions and save the difference</p>
            </div>
            <button
              onClick={handleToggleRoundUp}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                budgetPreferences.roundUpTransactions ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  budgetPreferences.roundUpTransactions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-Categorize Transactions</h4>
              <p className="text-sm text-gray-500">Automatically assign categories to new transactions</p>
            </div>
            <button
              onClick={handleToggleCategorize}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                budgetPreferences.categorizeTransactions ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  budgetPreferences.categorizeTransactions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Warning Threshold
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="50"
                max="100"
                value={budgetPreferences.warningThreshold}
                onChange={(e) => handleWarningThresholdChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 w-12">
                {budgetPreferences.warningThreshold}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Get warned when you've spent this percentage of your budget
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Save Percentage
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="50"
                value={budgetPreferences.autoSavePercentage}
                onChange={(e) => handleAutoSaveChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 w-12">
                {budgetPreferences.autoSavePercentage}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Automatically save this percentage of your income
            </p>
          </div>
        </div>
      </Card>

      {/* Default Categories */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Default Categories</h3>
          <Button variant="outline" size="sm" onClick={handleResetCategories}>
            Reset to Defaults
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1"
            />
            <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
              Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {budgetPreferences.defaultCategories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-sm font-medium text-gray-900">{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label={`Remove ${category} category`}
              >
                <i className="ri-close-line text-sm" aria-hidden="true"></i>
              </button>
            </div>
          ))}
        </div>

        {budgetPreferences.defaultCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <i className="ri-folder-line text-4xl mb-2" aria-hidden="true"></i>
            <p>No categories added yet</p>
          </div>
        )}
      </Card>

      {/* Budget Templates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Templates</h3>
        <p className="text-gray-600 mb-6">Quick-start templates based on common budgeting methods. These will create budgets based on your monthly income.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${template.icon} text-blue-600 text-lg`} aria-hidden="true"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                </div>
              </div>
              
              {/* Template Categories Preview */}
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Categories & Allocations</h5>
                <div className="space-y-1">
                  {template.categories.slice(0, 4).map((category) => (
                    <div key={category.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-600">{category.category}</span>
                      </div>
                      <span className="font-medium text-gray-900">{category.percentage}%</span>
                    </div>
                  ))}
                  {template.categories.length > 4 && (
                    <div className="text-xs text-gray-400 pt-1">
                      +{template.categories.length - 4} more categories
                    </div>
                  )}
                </div>
              </div>

              {/* Template Settings Preview */}
              {template.settings && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Includes Settings</h5>
                  <div className="space-y-1 text-xs text-gray-600">
                    {template.settings.rolloverUnused !== undefined && (
                      <div>• Rollover unused: {template.settings.rolloverUnused ? 'Yes' : 'No'}</div>
                    )}
                    {template.settings.warningThreshold && (
                      <div>• Warning at: {template.settings.warningThreshold}%</div>
                    )}
                    {template.settings.autoSavePercentage && (
                      <div>• Auto-save: {template.settings.autoSavePercentage}%</div>
                    )}
                    {template.settings.roundUpTransactions && (
                      <div>• Round up transactions</div>
                    )}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleApplyTemplate(template)}
                disabled={isApplyingTemplate === template.id}
              >
                {isApplyingTemplate === template.id ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2" aria-hidden="true"></i>
                    Applying...
                  </>
                ) : (
                  <>
                    <i className={`${template.icon} mr-2`} aria-hidden="true"></i>
                    Apply Template
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="ri-information-line text-blue-600 text-lg mt-0.5" aria-hidden="true"></i>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How Templates Work</h4>
              <p className="text-sm text-blue-700">
                When you apply a template, you'll be asked for your monthly income. The system will then create budget categories 
                with amounts calculated as percentages of your income. Existing budgets for the same categories will be updated.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Template Application Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className={`${selectedTemplate.icon} text-blue-600 text-xl`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Apply {selectedTemplate.name}</h3>
                    <p className="text-gray-500">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleCancelTemplate}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="ri-close-line text-2xl" aria-hidden="true"></i>
                </button>
              </div>

              {/* Monthly Income Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income ({budgetPreferences.currencySymbol})
                </label>
                <Input
                  type="number"
                  placeholder="Enter your monthly income"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used to calculate budget amounts based on the template percentages.
                </p>
              </div>

              {/* Budget Preview */}
              {monthlyIncome && !isNaN(Number(monthlyIncome)) && Number(monthlyIncome) > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Budget Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTemplate.categories.map((category) => {
                        const amount = (Number(monthlyIncome) * category.percentage) / 100;
                        return (
                          <div key={category.category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm text-gray-700">{category.category}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {category.percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Allocated:</span>
                        <span>{formatCurrency(Number(monthlyIncome))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Settings */}
              {selectedTemplate.settings && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Template Settings</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      {selectedTemplate.settings.rolloverUnused !== undefined && (
                        <div className="flex items-center space-x-2">
                          <i className="ri-arrow-right-line text-blue-600" aria-hidden="true"></i>
                          <span>Rollover unused budget: <strong>{selectedTemplate.settings.rolloverUnused ? 'Enabled' : 'Disabled'}</strong></span>
                        </div>
                      )}
                      {selectedTemplate.settings.warningThreshold && (
                        <div className="flex items-center space-x-2">
                          <i className="ri-arrow-right-line text-blue-600" aria-hidden="true"></i>
                          <span>Warning threshold: <strong>{selectedTemplate.settings.warningThreshold}%</strong></span>
                        </div>
                      )}
                      {selectedTemplate.settings.autoSavePercentage && (
                        <div className="flex items-center space-x-2">
                          <i className="ri-arrow-right-line text-blue-600" aria-hidden="true"></i>
                          <span>Auto-save percentage: <strong>{selectedTemplate.settings.autoSavePercentage}%</strong></span>
                        </div>
                      )}
                      {selectedTemplate.settings.roundUpTransactions && (
                        <div className="flex items-center space-x-2">
                          <i className="ri-arrow-right-line text-blue-600" aria-hidden="true"></i>
                          <span><strong>Round up transactions</strong> will be enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelTemplate}
                  className="flex-1"
                  disabled={isApplyingTemplate === selectedTemplate.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmTemplate}
                  className="flex-1"
                  disabled={!monthlyIncome || isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0 || isApplyingTemplate === selectedTemplate.id}
                >
                  {isApplyingTemplate === selectedTemplate.id ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2" aria-hidden="true"></i>
                      Applying Template...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line mr-2" aria-hidden="true"></i>
                      Apply Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}