import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    id, 
    icon, 
    showPasswordToggle,
    onTogglePassword,
    isPasswordVisible,
    ...props 
  }, ref) => {
    const inputId = id || `floating-input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="space-y-2">
        <div className="floating-input">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-4 pt-6 pb-2 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer placeholder:transparent transition-all duration-200',
              error && 'border-red-500 focus:ring-red-500 bg-red-50/50',
              showPasswordToggle && 'pr-12',
              className
            )}
            placeholder={label}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(errorId, helperId)}
            {...props}
          />
          <label 
            htmlFor={inputId} 
            className={cn(
              "absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-blue-500",
              error && "peer-focus:text-red-500 text-red-500"
            )}
          >
            {label}
          </label>
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-r-lg transition-colors"
            >
              <i className={isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true"></i>
            </button>
          )}
          
          {icon && !showPasswordToggle && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p id={helperId} className="text-sm text-gray-500 ml-1">
            {helperText}
          </p>
        )}
        
        {error && (
          <div id={errorId} className="error-container">
            <i className="ri-error-warning-line mt-0.5 mr-2 flex-shrink-0" aria-hidden="true"></i>
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };