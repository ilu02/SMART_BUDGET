'use client';

import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  gradient: string;
  iconBg: string;
  textColor: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  children?: ReactNode;
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  gradient, 
  iconBg, 
  textColor,
  change,
  children 
}: MetricCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full bg-white/10"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <i className={`${icon} text-xl text-white`} aria-hidden="true"></i>
          </div>
          {change && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              change.type === 'increase' 
                ? 'bg-green-100/80 text-green-700' 
                : change.type === 'decrease' 
                ? 'bg-red-100/80 text-red-700' 
                : 'bg-gray-100/80 text-gray-700'
            }`}>
              <i className={`${
                change.type === 'increase' 
                  ? 'ri-arrow-up-line' 
                  : change.type === 'decrease' 
                  ? 'ri-arrow-down-line' 
                  : 'ri-subtract-line'
              } text-xs`} aria-hidden="true"></i>
              <span>{change.value}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className={`text-3xl font-bold ${textColor} tracking-tight`}>{value}</p>
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-white/20">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}