'use client';

import { Budget } from '../contexts/BudgetContext';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
}

const transactionHistory = [
  { id: 1, date: '2023-10-26', description: 'Grocery Store', amount: -75.50 },
  { id: 2, date: '2023-10-24', description: 'Restaurant', amount: -42.00 },
  { id: 3, date: '2023-10-22', description: 'Coffee Shop', amount: -5.25 },
  { id: 4, date: '2023-10-20', description: 'Food Delivery', amount: -25.00 },
];

export default function HistoryModal({ isOpen, onClose, budget }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History</h2>
        <p className="text-gray-600 mb-6">
          Showing history for the <strong>{budget.category}</strong> category.
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transactionHistory.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{tx.description}</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </div>
              <p className={`font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
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
