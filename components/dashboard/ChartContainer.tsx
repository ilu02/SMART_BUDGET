'use client';

import { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function ChartContainer({ title, subtitle, children, actions }: ChartContainerProps) {
  return (
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
      
      <div className="relative">
        {/* Chart background with subtle grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 rounded-xl -m-4"></div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </Card>
  );
}