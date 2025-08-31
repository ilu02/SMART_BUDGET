'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Budget {
  id?: number;
  category: string;
  budget: number;
  period: 'weekly' | 'monthly' | 'yearly';
  description?: string;
}

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget;
  onSave?: (budget: Budget) => void;
}

const defaultCategories = [
  { name: 'Food & Dining', icon: 'ri-restaurant-line', color: 'bg-blue-500' },
  { name: 'Transportation', icon: 'ri-gas-station-line', color: 'bg-teal-500' },
  { name: 'Entertainment', icon: 'ri-film-line', color: 'bg-pink-500' },
  { name: 'Shopping', icon: 'ri-shopping-bag-line', color: 'bg-red-500' },
  { name: 'Health & Fitness', icon: 'ri-heart-pulse-line', color: 'bg-orange-500' },
  { name: 'Utilities', icon: 'ri-flashlight-line', color: 'bg-yellow-500' },
  { name: 'Education', icon: 'ri-book-line', color: 'bg-indigo-500' },
  { name: 'Travel', icon: 'ri-plane-line', color: 'bg-purple-500' },
  { name: 'Insurance', icon: 'ri-shield-line', color: 'bg-gray-500' },
  { name: 'Other', icon: 'ri-more-line', color: 'bg-gray-400' }
];

const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

export default function AddBudgetModal({ 
  isOpen, 
  onClose, 
  budget, 
  onSave 
}: AddBudgetModalProps) {
  const { formatCurrency } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Budget>({
    category: '',
    budget: 0,
    period: 'monthly',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when modal opens
  useState(() => {
    if (isOpen) {
      if (budget) {
        setFormData(budget);
      } else {
        setFormData({
          category: '',
          budget: 0,
          period: 'monthly',
          description: ''
        });
      }
      setErrors({});
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.budget <= 0) {
      newErrors.budget = 'Budget amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, budget: amount }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) return;

    setLoading(true);
    try {
      // Find the selected category details
      const selectedCategory = defaultCategories.find(cat => cat.name === formData.category);
      
      const budgetData = {
        userId: user.id,
        category: formData.category,
        budget: formData.budget,
        icon: selectedCategory?.icon || 'ri-more-line',
        color: selectedCategory?.color || 'bg-gray-400',
        description: formData.description || ''
      };

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      const data = await response.json();

      if (response.ok) {
        if (onSave) {
          onSave(data.budget);
        }

        toast.success('Budget created successfully!');
        onClose();
      } else {
        toast.error(data.error || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to save budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {budget ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <p className="text-gray-600 mt-1">
            Set spending limits for different categories
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg p-1"
          aria-label="Close modal"
        >
          <i className="ri-close-line text-2xl" aria-hidden="true"></i>
        </button>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {defaultCategories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.name }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.category === category.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} text-white`}>
                      <i className={`${category.icon} text-sm`} aria-hidden="true"></i>
                    </div>
                    <span className="text-xs font-medium text-center">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Budget Amount */}
          <div>
            <Input
              label="Budget Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.budget || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              error={errors.budget}
              required
            />
            
            {/* Quick Amount Buttons */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickAmount(amount)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Budget Period
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, period: period as any }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.period === period
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                      period === 'weekly' ? 'bg-green-100' :
                      period === 'monthly' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <i className={`${
                        period === 'weekly' ? 'ri-calendar-line text-green-600' :
                        period === 'monthly' ? 'ri-calendar-2-line text-blue-600' :
                        'ri-calendar-event-line text-purple-600'
                      } text-lg`} aria-hidden="true"></i>
                    </div>
                    <span className="text-sm font-medium capitalize">{period}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add notes about this budget..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Budget Preview */}
          {formData.category && formData.budget > 0 && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Budget Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(formData.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium capitalize">{formData.period}</span>
                </div>
                {formData.period !== 'monthly' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly equivalent:</span>
                    <span className="font-medium text-gray-600">
                      {formatCurrency(
                        formData.period === 'weekly' 
                          ? formData.budget * 4.33 
                          : formData.budget / 12
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={loading || !formData.category || formData.budget <= 0}
        >
          {budget ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </Modal>
  );
}