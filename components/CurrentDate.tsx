'use client';

import { useState, useEffect } from 'react';

export default function CurrentDate() {
  const [currentDate, setCurrentDate] = useState<{
    month: string;
    year: string;
    day: string;
  }>({ month: '', year: '', day: '' });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const month = now.toLocaleDateString('en-US', { month: 'long' });
      const year = now.getFullYear().toString();
      const day = now.getDate().toString();

      setCurrentDate({ month, year, day });
    };

    updateDate();
    
    // Update every minute to keep it current
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center space-x-2 text-gray-600">
      {/* Calendar icon */}
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
        <i className="ri-calendar-line text-sm text-gray-500" aria-hidden="true"></i>
      </div>
      
      {/* Date info */}
      <div className="flex flex-col">
        <div className="text-sm font-medium text-gray-900">
          {currentDate.month} {currentDate.year}
        </div>
        <div className="text-xs text-gray-500">
          Today, {currentDate.day}
        </div>
      </div>
    </div>
  );
}