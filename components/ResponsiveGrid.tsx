'use client';

import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '' 
}: ResponsiveGridProps) {
  
  const gapClasses = {
    'sm': 'gap-2 sm:gap-3',
    'md': 'gap-4 sm:gap-6',
    'lg': 'gap-6 sm:gap-8',
    'xl': 'gap-8 sm:gap-10'
  };

  const gridClasses = [
    'grid',
    `grid-cols-${cols.mobile || 1}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}