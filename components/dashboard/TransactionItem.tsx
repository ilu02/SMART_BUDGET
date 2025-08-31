'use client';

import { Transaction } from '../../app/contexts/TransactionContext';
import { useSettings } from '../../app/contexts/SettingsContext';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export default function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const { formatCurrency } = useSettings();

  return (
    <div 
      className="group p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-100/50"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.color} shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
            <i className={`${transaction.icon} text-lg`} aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 text-base">
              {transaction.description}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span className="font-medium">{transaction.category}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{new Date(transaction.date).toLocaleDateString()}</span>
              {transaction.merchant && (
                <>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{transaction.merchant}</span>
                </>
              )}
            </div>
            {transaction.tags.length > 0 && (
              <div className="flex items-center space-x-2 mt-2">
                {transaction.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
                {transaction.tags.length > 2 && (
                  <span className="text-xs text-gray-400 font-medium">
                    +{transaction.tags.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-xl ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'} group-hover:scale-105 transition-transform duration-200`}>
            {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {transaction.type === 'income' ? 'Income' : 'Expense'}
          </p>
        </div>
      </div>
    </div>
  );
}