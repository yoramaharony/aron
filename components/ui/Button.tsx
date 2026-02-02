import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Safety: avoid leaking non-DOM props into the real <button>.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { asChild, ...buttonProps } = props as any;

  return (
    <button
      className={clsx(
        'btn', // from globals.css
        `btn-${variant}`,
        `btn-${size}`,
        {
          'opacity-50 cursor-not-allowed': disabled || isLoading,
        },
        className
      )}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
}
