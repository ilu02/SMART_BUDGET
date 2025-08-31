'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ResponsiveContainer({ 
  children, 
  maxWidth = '7xl', 
  padding = 'md',
  className = '' 
}: ResponsiveContainerProps) {
  
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  const paddingClasses = {
    'none': '',
    'sm': 'px-2 sm:px-4',
    'md': 'px-4 sm:px-6 lg:px-8',
    'lg': 'px-6 sm:px-8 lg:px-12',
    'xl': 'px-8 sm:px-12 lg:px-16'
  };

  return (
    <div className={`
      mx-auto w-full
      ${maxWidthClasses[maxWidth]}
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}