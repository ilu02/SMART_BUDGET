'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  budget?: number;
  spent: number;
  isCustom: boolean;
  description?: string;
}

const defaultCategories: Category[] = [
  {
    id: 1,
    name: 'Food & Dining',
    icon: 'ri-restaurant-line',
    color: 'bg-blue-500',
    budget: 800,
    spent: 567,
    isCustom: false,
    description: 'Restaurants, groceries, and food delivery'
  },
  {
    id: 2,
    name: 'Transportation',
    icon: 'ri-gas-station-line',
    color: 'bg-teal-500',
    budget: 400,
    spent: 285,
    isCustom: false,
    description: 'Gas, public transport, and ride-sharing'
  },
  {
    id: 3,
    name: 'Entertainment',
    icon: 'ri-film-line',
    color: 'bg-pink-500',
    budget: 200,
    spent: 178,
    isCustom: false,
    description: 'Movies, games, and leisure activities'
  },
  {
    id: 4,
    name: 'Shopping',
    icon: 'ri-shopping-bag-line',
    color: 'bg-red-500',
    budget: 600,
    spent: 432,
    isCustom: false,
    description: 'Clothes, electronics, and general shopping'
  },
  {
    id: 5,
    name: 'Health & Fitness',
    icon: 'ri-heart-pulse-line',
    color: 'bg-orange-500',
    budget: 150,
    spent: 99,
    isCustom: false,
    description: 'Gym, supplements, and medical expenses'
  },
  {
    id: 6,
    name: 'Utilities',
    icon: 'ri-flashlight-line',
    color: 'bg-yellow-500',
    budget: 250,
    spent: 234,
    isCustom: false,
    description: 'Electricity, water, internet, and phone'
  }
];

const availableIcons = [
  'ri-home-line',
  'ri-car-line',
  'ri-plane-line',
  'ri-book-line',
  'ri-music-line',
  'ri-gamepad-line',
  'ri-shopping-cart-line',
  'ri-gift-line',
  'ri-heart-line',
  'ri-star-line',
  'ri-sun-line',
  'ri-moon-line',
  'ri-fire-line',
  'ri-leaf-line',
  'ri-water-line',
  'ri-lightning-line',
  'ri-shield-line',
  'ri-tools-line',
  'ri-palette-line',
  'ri-camera-line'
];

const availableColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-gray-500'
];

export default function CategoriesPage() {
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState<Category | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'ri-star-line',
    color: 'bg-blue-500',
    description: ''
  });

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/budgets?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        // Convert budgets to categories format
        const budgetCategories: Category[] = data.budgets.map((budget: any, index: number) => ({
          id: budget.id,
          name: budget.category,
          icon: budget.icon,
          color: budget.color,
          budget: budget.budget,
          spent: budget.spent,
          isCustom: false,
          description: budget.description || ''
        }));
        
        setCategories(budgetCategories);
      } else {
        console.error('Failed to fetch categories:', data.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name.');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Create a budget entry for the new category with a default budget of 0
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          category: newCategory.name,
          budget: 0, // Default budget amount
          icon: newCategory.icon,
          color: newCategory.color,
          description: newCategory.description
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new category to local state
        const category: Category = {
          id: data.budget.id,
          name: data.budget.category,
          icon: data.budget.icon,
          color: data.budget.color,
          budget: data.budget.budget,
          spent: 0,
          isCustom: true,
          description: data.budget.description || ''
        };

        setCategories(prev => [...prev, category]);
        setNewCategory({ name: '', icon: 'ri-star-line', color: 'bg-blue-500', description: '' });
        setIsAddModalOpen(false);
        toast.success('Category created successfully!');
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategory.name.trim()) {
      toast.error('Please enter a category name.');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Update the budget entry for the category
      const response = await fetch('/api/budgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingCategory.id,
          category: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
          description: newCategory.description
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { 
                ...cat, 
                name: newCategory.name,
                icon: newCategory.icon,
                color: newCategory.color,
                description: newCategory.description
              }
            : cat
        ));

        setEditingCategory(null);
        setNewCategory({ name: '', icon: 'ri-star-line', color: 'bg-blue-500', description: '' });
        setIsAddModalOpen(false);
        toast.success('Category updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    if (!category.isCustom) {
      toast.error('Cannot delete default categories.');
      return;
    }

    if (category.spent > 0) {
      toast.error('Cannot delete categories with existing transactions.');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Delete the budget entry for the category
      const response = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setCategories(prev => prev.filter(cat => cat.id !== id));
        toast.success('Category deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleSetBudget = (category: Category) => {
    setBudgetCategory(category);
    setBudgetAmount('');
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetCategory || !budgetAmount.trim()) {
      toast.error('Please enter a budget amount.');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid budget amount.');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Update the budget entry
      const response = await fetch('/api/budgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: budgetCategory.id,
          budget: amount
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setCategories(prev => prev.map(cat => 
          cat.id === budgetCategory.id 
            ? { ...cat, budget: amount }
            : cat
        ));

        setBudgetCategory(null);
        setBudgetAmount('');
        setIsBudgetModalOpen(false);
        toast.success('Budget set successfully!');
      } else {
        toast.error(data.error || 'Failed to set budget');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      toast.error('Failed to set budget');
    }
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setBudgetCategory(null);
    setBudgetAmount('');
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setNewCategory({ name: '', icon: 'ri-star-line', color: 'bg-blue-500', description: '' });
  };

  const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Categories</h1>
            <p className="text-gray-600 mt-2">Manage your spending categories and budgets</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <i className="ri-add-line mr-2" aria-hidden="true"></i>
            Add Category
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-folder-line text-blue-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-wallet-line text-green-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-arrow-up-line text-red-600 text-lg" aria-hidden="true"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color} text-white`}>
                    <i className={`${category.icon} text-xl`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                    aria-label="Edit category"
                  >
                    <i className="ri-edit-line" aria-hidden="true"></i>
                  </button>
                  {category.isCustom && (
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      aria-label="Delete category"
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true"></i>
                    </button>
                  )}
                </div>
              </div>

              {category.budget && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Budget Progress</span>
                    <span className="font-medium">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (category.spent / category.budget) > 0.9 
                          ? 'bg-red-500' 
                          : (category.spent / category.budget) > 0.7 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((category.spent / category.budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{((category.spent / category.budget) * 100).toFixed(1)}% used</span>
                    <span>{formatCurrency(category.budget - category.spent)} remaining</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transactions</span>
                <span className="font-medium">{formatCurrency(category.spent)} spent</span>
              </div>

              {!category.budget && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleSetBudget(category)}
                  >
                    <i className="ri-add-line mr-2" aria-hidden="true"></i>
                    Set Budget
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Add/Edit Category Modal */}
        <Modal isOpen={isAddModalOpen} onClose={handleCloseModal}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg p-1"
              aria-label="Close modal"
            >
              <i className="ri-close-line text-2xl" aria-hidden="true"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <Input
                  label="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter category description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newCategory.icon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${icon} text-xl text-gray-600`} aria-hidden="true"></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-lg ${color} border-2 transition-all ${
                        newCategory.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preview
                </label>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${newCategory.color} text-white`}>
                    <i className={`${newCategory.icon} text-xl`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {newCategory.name || 'Category Name'}
                    </h3>
                    {newCategory.description && (
                      <p className="text-sm text-gray-500">{newCategory.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                className="flex-1"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Set Budget Modal */}
        <Modal isOpen={isBudgetModalOpen} onClose={handleCloseBudgetModal}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Set Budget for {budgetCategory?.name}
            </h2>
            <button
              onClick={handleCloseBudgetModal}
              className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg p-1"
              aria-label="Close modal"
            >
              <i className="ri-close-line text-2xl" aria-hidden="true"></i>
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Budget Amount */}
              <div>
                <Input
                  label="Budget Amount"
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Set a monthly budget limit for this category
                </p>
              </div>

              {/* Category Preview */}
              {budgetCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${budgetCategory.color} text-white`}>
                      <i className={`${budgetCategory.icon} text-xl`} aria-hidden="true"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{budgetCategory.name}</h3>
                      {budgetCategory.description && (
                        <p className="text-sm text-gray-500">{budgetCategory.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={handleCloseBudgetModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBudget}
                className="flex-1"
              >
                Set Budget
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}