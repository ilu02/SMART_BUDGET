'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useSettings } from '../app/contexts/SettingsContext';
import { Transaction, useTransactions } from '../app/contexts/TransactionContext';
import { useBudgets } from '../app/contexts/BudgetContext';
import toast from 'react-hot-toast';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSave?: (transaction: Transaction) => void;
  defaultBudgetId?: string;
  defaultCategory?: string;
}

const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: string } = {
    'Food & Dining': 'ri-restaurant-line',
    'Food': 'ri-restaurant-line',
    'Transportation': 'ri-gas-station-line',
    'Entertainment': 'ri-film-line',
    'Shopping': 'ri-shopping-bag-line',
    'Health & Fitness': 'ri-heart-pulse-line',
    'Healthcare': 'ri-heart-pulse-line',
    'Utilities': 'ri-flashlight-line',
    'Education': 'ri-book-line',
    'Travel': 'ri-plane-line',
    'Income': 'ri-money-dollar-circle-line',
    'Savings': 'ri-piggy-bank-line',
    'Insurance': 'ri-shield-check-line',
    'Other': 'ri-more-line'
  };
  return iconMap[categoryName] || 'ri-more-line';
};

const getCategoryColor = (index: number) => {
  const colors = [
    'bg-blue-500', 'bg-teal-500', 'bg-pink-500', 'bg-red-500',
    'bg-orange-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500',
    'bg-green-500', 'bg-gray-500'
  ];
  return colors[index % colors.length];
};

const quickAmounts = [10, 25, 50, 100, 250, 500];

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onSave,
  defaultBudgetId,
  defaultCategory
}: AddTransactionModalProps) {
  const { formatCurrency, budgetPreferences } = useSettings();
  const { addTransaction, updateTransaction, checkBudgetsExist } = useTransactions();
  const { budgets } = useBudgets();
  const [loading, setLoading] = useState(false);
  const [budgetsExist, setBudgetsExist] = useState(true);

  // Create categories from settings
  const categories = [
    ...budgetPreferences.defaultCategories.map((name, index) => ({
      name,
      icon: getCategoryIcon(name),
      color: getCategoryColor(index)
    })),
    { name: 'Income', icon: 'ri-money-dollar-circle-line', color: 'bg-green-500' },
    { name: 'Other', icon: 'ri-more-line', color: 'bg-gray-500' }
  ];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Transaction>({
    id: '', // Use empty string instead of 0
    description: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    tags: [],
    type: 'expense',
    notes: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-categorization function
  const suggestCategory = (description: string, merchant: string): string => {
    if (!budgetPreferences.categorizeTransactions) return '';
    
    const text = `${description} ${merchant}`.toLowerCase();
    
    // Category keywords mapping
    const categoryKeywords: Record<string, string[]> = {
      'Food & Dining': ['food', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'grocery', 'supermarket', 'dining', 'lunch', 'dinner', 'breakfast', 'starbucks', 'mcdonalds', 'subway', 'kfc'],
      'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'train', 'parking', 'car', 'vehicle', 'transport', 'metro', 'subway'],
      'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'concert', 'theater', 'music', 'streaming'],
      'Shopping': ['amazon', 'store', 'shop', 'mall', 'clothing', 'clothes', 'shoes', 'electronics', 'target', 'walmart'],
      'Health & Fitness': ['doctor', 'hospital', 'pharmacy', 'medicine', 'gym', 'fitness', 'health', 'medical', 'dentist'],
      'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility', 'bill', 'power', 'electricity'],
      'Education': ['school', 'university', 'course', 'book', 'education', 'tuition', 'learning'],
      'Travel': ['hotel', 'flight', 'travel', 'vacation', 'trip', 'booking', 'airbnb'],
      'Insurance': ['insurance', 'premium', 'policy'],
      'Savings': ['savings', 'investment', 'deposit', 'transfer']
    };

    // Find matching category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (budgetPreferences.defaultCategories.includes(category)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          return category;
        }
      }
    }

    return '';
  };

  // Check if budgets exist when modal opens
  useEffect(() => {
    if (isOpen) {
      const checkBudgets = async () => {
        const exist = await checkBudgetsExist();
        setBudgetsExist(exist);
      };
      checkBudgets();
    }
  }, [isOpen, checkBudgetsExist]);

  // Auto-categorization effect
  useEffect(() => {
    if (budgetPreferences.categorizeTransactions && formData.description && !formData.category) {
      const suggestedCategory = suggestCategory(formData.description, formData.merchant);
      if (suggestedCategory) {
        setFormData(prev => ({ ...prev, category: suggestedCategory }));
        toast.success(`Auto-categorized as "${suggestedCategory}"`);
      }
    }
  }, [formData.description, formData.merchant, budgetPreferences.categorizeTransactions]);

  // Initialize form data when modal opens or transaction changes
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          ...transaction,
          amount: Math.abs(transaction.amount) // Always show positive amount in form
        });
        setStep(1);
      } else {
        setFormData({
          id: '', // Use empty string instead of 0
          description: '',
          category: defaultCategory || '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          merchant: '',
          tags: [],
          type: 'expense',
          notes: '',
          budgetId: defaultBudgetId || undefined
        });
        setStep(1);
      }
      setErrors({});
      setTagInput('');
    }
  }, [isOpen, transaction, defaultBudgetId, defaultCategory]);

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
      if (formData.amount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
      // Require budget selection for expenses
      if (formData.type === 'expense' && !formData.budgetId) {
        newErrors.budgetId = 'Please select a budget for this expense';
      }
    }

    if (stepNumber === 2) {
      if (!formData.date) {
        newErrors.date = 'Date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleQuickAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      let finalAmount = formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
      let roundUpAmount = 0;

      // Apply round-up for expenses if enabled
      if (budgetPreferences.roundUpTransactions && formData.type === 'expense') {
        const originalAmount = Math.abs(formData.amount);
        const roundedAmount = Math.ceil(originalAmount);
        roundUpAmount = roundedAmount - originalAmount;
        
        if (roundUpAmount > 0) {
          finalAmount = -roundedAmount; // Use rounded amount for expense
          toast.success(`Rounded up by ${formatCurrency(roundUpAmount)} - saved to your account!`);
        }
      }

      const transactionData = {
        description: formData.description,
        category: formData.category,
        amount: finalAmount,
        date: formData.date,
        type: formData.type,
        budgetId: formData.budgetId,
        notes: formData.notes
      };

      let success = false;
      
      if (transaction?.id) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData);
        success = true;
      } else {
        // Add new transaction
        success = await addTransaction(transactionData);
      }

      if (success) {
        if (onSave) {
          onSave({ ...formData, amount: finalAmount } as Transaction);
        }
        onClose();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
        
        {/* Transaction Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <i className="ri-arrow-down-line text-xl" aria-hidden="true"></i>
                <span className="font-medium">Expense</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <i className="ri-arrow-up-line text-xl" aria-hidden="true"></i>
                <span className="font-medium">Income</span>
              </div>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="e.g., Grocery shopping, Salary, Coffee"
            error={errors.description}
            required
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            error={errors.amount}
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

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((category) => (
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

        {/* Budget Selection - Only for expenses */}
        {formData.type === 'expense' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Budget <span className="text-red-500">*</span>
            </label>
            {!budgetsExist ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <i className="ri-alert-line text-yellow-600"></i>
                  <p className="text-sm text-yellow-800">
                    No budgets found. Please create a budget first before adding expenses.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {budgets.map((budget) => (
                    <button
                      key={budget.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budgetId: budget.id }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.budgetId === budget.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${budget.color} text-white`}>
                            <i className={`${budget.icon} text-lg`} aria-hidden="true"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{budget.category}</h4>
                            <p className="text-sm text-gray-600">{budget.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                (budget.spent / budget.budget) * 100 > 90 ? 'bg-red-500' :
                                (budget.spent / budget.budget) * 100 > 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min((budget.spent / budget.budget) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.budgetId && (
                  <p className="mt-2 text-sm text-red-600">{errors.budgetId}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
        
        {/* Date */}
        <div className="mb-6">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            error={errors.date}
            required
          />
        </div>

        {/* Merchant */}
        <div className="mb-6">
          <Input
            label="Merchant/Source"
            value={formData.merchant}
            onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
            placeholder="e.g., Whole Foods, Tech Corp, Starbucks"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex space-x-2 mb-3">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              size="sm"
            >
              Add
            </Button>
          </div>
          
          {/* Display Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <i className="ri-close-line text-sm" aria-hidden="true"></i>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes about this transaction..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Transaction</h3>
        
        <Card className="p-6 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.type === 'income' ? 'Income' : 'Expense'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Description:</span>
              <span className="font-medium">{formData.description}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className={`font-bold text-lg ${
                formData.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.type === 'income' ? '+' : '-'}{formatCurrency(formData.amount)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Category:</span>
              <div className="flex items-center space-x-2">
                {(() => {
                  const category = categories.find(cat => cat.name === formData.category);
                  return category ? (
                    <>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${category.color} text-white`}>
                        <i className={`${category.icon} text-xs`} aria-hidden="true"></i>
                      </div>
                      <span className="font-medium">{formData.category}</span>
                    </>
                  ) : (
                    <span className="font-medium">{formData.category}</span>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span>
            </div>
            
            {formData.merchant && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Merchant:</span>
                <span className="font-medium">{formData.merchant}</span>
              </div>
            )}
            
            {formData.tags.length > 0 && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600">Tags:</span>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {formData.notes && (
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600">Notes:</span>
                <span className="font-medium text-right max-w-xs">{formData.notes}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <p className="text-gray-600 mt-1">
            Step {step} of 3
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

      {/* Progress Indicator */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber < step 
                  ? 'bg-blue-600 text-white' 
                  : stepNumber === step 
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNumber < step ? (
                  <i className="ri-check-line" aria-hidden="true"></i>
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Details
          </span>
          <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Additional
          </span>
          <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Review
          </span>
        </div>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              <i className="ri-arrow-left-line mr-2" aria-hidden="true"></i>
              Back
            </Button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              Next
              <i className="ri-arrow-right-line ml-2" aria-hidden="true"></i>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {transaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}