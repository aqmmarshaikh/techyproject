import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        'bg-[#FF3D88] hover:bg-[#E02D73] text-white shadow-sm hover:shadow active:scale-[0.98]',
      secondary:
        'bg-[#0F1B3D] hover:bg-[#182B5C] text-white shadow-sm hover:shadow active:scale-[0.98]',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 active:scale-[0.98]',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs font-medium rounded-lg gap-1.5',
      md: 'h-10 px-4 text-sm font-medium rounded-xl gap-2',
      lg: 'h-12 px-6 text-base font-medium rounded-xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-sans transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

