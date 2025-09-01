'use client';

import { useState, useEffect } from 'react';
import { Budget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
}

export default function HistoryModal({ isOpen, onClose, budget }: HistoryModalProps) {
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && budget && user) {
      fetchTransactions();
    }
  }, [isOpen, budget, user]);

  const fetchTransactions = async () => {
    if (!user?.id || !budget.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/transactions?userId=${user.id}&budgetId=${budget.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        console.error('Failed to fetch transactions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History</h2>
        <p className="text-gray-600 mb-6">
          Showing history for the <strong>{budget.category}</strong> category.
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-file-list-line text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">No transactions found for this category.</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{tx.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-medium ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
