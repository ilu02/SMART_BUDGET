import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  children: ReactNode;
  variant?: 'default' | 'warning' | 'error' | 'success' | 'info';
  className?: string;
}

export function Alert({ children, variant = 'default', className }: AlertProps) {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={cn(
      'rounded-lg border p-4',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}