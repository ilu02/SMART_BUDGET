'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Budget, useBudgets } from '../contexts/BudgetContext';
import { useSettings } from '../contexts/SettingsContext';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  onSave: (id: string, updates: Partial<Budget>) => void;
}

export default function EditBudgetModal({ isOpen, onClose, budget, onSave }: EditBudgetModalProps) {
  const [newBudget, setNewBudget] = useState(budget.budget);
  const { currencySymbol } = useSettings();

  useEffect(() => {
    setNewBudget(budget.budget);
  }, [budget]);

  const handleSave = async () => {
    if (newBudget <= 0) {
      toast.error('Budget amount must be a positive number.');
      return;
    }
    
    // Pass the id and the new budget amount in an object to match the onSave prop type
    onSave(budget.id, { budget: newBudget });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Budget</h2>
        <p className="text-gray-600 mb-6">
          Adjust the budget for the <strong>{budget.category}</strong> category.
        </p>

        <div>
          <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Budget Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              {currencySymbol}
            </span>
            <input
              id="budgetAmount"
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}