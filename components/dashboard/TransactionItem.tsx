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
      className="group p-3 sm:p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-100/50"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        {/*
          This div now acts as a container for all content on the left side.
          'flex-1' and 'min-w-0' ensure it takes up as much space as possible but can also shrink,
          so it doesn't push against the price.
        */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${transaction.color} shadow-sm group-hover:shadow-md transition-shadow duration-200 flex-shrink-0`}>
            <i className={`${transaction.icon} text-base sm:text-lg`} aria-hidden="true"></i>
          </div>
          
          {/*
            This container holds the text content. 'flex-1' and 'min-w-0'
            allow it to handle its own content overflow, guaranteeing truncation
            when necessary.
          */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 text-sm sm:text-base truncate">
              {transaction.description}
            </p>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 mt-1 min-w-0">
              <span className="font-medium truncate">{transaction.category}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
              <span className="flex-shrink-0">{new Date(transaction.date).toLocaleDateString()}</span>
              {transaction.merchant && (
                <>
                  <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0 hidden sm:block"></span>
                  <span className="truncate hidden sm:block">{transaction.merchant}</span>
                </>
              )}
            </div>
            {transaction.tags && transaction.tags.length > 0 && (
              <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2 min-w-0">
                {transaction.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors duration-200 truncate max-w-20 sm:max-w-none"
                  >
                    {tag}
                  </span>
                ))}
                {transaction.tags.length > 2 && (
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                    +{transaction.tags.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/*
          This div holds the price. It has 'flex-shrink-0' to ensure it never gets compressed,
          and 'whitespace-nowrap' prevents the price from breaking onto a new line.
        */}
        <div className="text-right flex-shrink-0">
          <p className={`font-bold text-base sm:text-xl ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'} group-hover:scale-105 transition-transform duration-200 whitespace-nowrap`}>
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