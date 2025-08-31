'use client';

import { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
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

export default function BudgetPreferences() {
  const { budgetPreferences, updateBudgetPreferences, formatCurrency } = useSettings();
  const [newCategory, setNewCategory] = useState('');

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
        <p className="text-gray-600 mb-4">Quick-start templates based on common budgeting methods</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">50/30/20 Rule</h4>
            <p className="text-sm text-gray-500 mb-3">50% needs, 30% wants, 20% savings</p>
            <Button variant="outline" size="sm" className="w-full">
              Apply Template
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Zero-Based Budget</h4>
            <p className="text-sm text-gray-500 mb-3">Every dollar has a purpose</p>
            <Button variant="outline" size="sm" className="w-full">
              Apply Template
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Envelope Method</h4>
            <p className="text-sm text-gray-500 mb-3">Cash-based category budgeting</p>
            <Button variant="outline" size="sm" className="w-full">
              Apply Template
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Pay Yourself First</h4>
            <p className="text-sm text-gray-500 mb-3">Savings-focused approach</p>
            <Button variant="outline" size="sm" className="w-full">
              Apply Template
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}