import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /**
   * When true, render the child element (e.g. next/link) as the "button" so we
   * don't create invalid nesting like <a><button/></a>.
   */
  asChild?: boolean;
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

  const composedClassName = clsx(
    'btn', // from globals.css
    `btn-${variant}`,
    `btn-${size}`,
    {
      'btn-disabled cursor-not-allowed': disabled || isLoading,
    },
    className
  );

  const childInner =
    asChild && React.isValidElement(children) ? (children as any).props?.children : children;

  const contents = (
    <>
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {childInner}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </>
  );

  if (asChild) {
    if (!React.isValidElement(children)) {
      // Fall back to a real button if the caller didn't pass an element.
      return (
        <button className={composedClassName} disabled={disabled || isLoading} {...buttonProps}>
          {contents}
        </button>
      );
    }

    const child = children as React.ReactElement<any>;
    const childProps = child.props ?? {};

    return React.cloneElement(child, {
      ...buttonProps,
      className: clsx(composedClassName, childProps.className),
      // Links can't be truly disabled; keep semantics + styling consistent.
      'aria-disabled': disabled || isLoading || childProps['aria-disabled'],
      tabIndex:
        disabled || isLoading
          ? -1
          : typeof childProps.tabIndex === 'number'
            ? childProps.tabIndex
            : undefined,
      onClick: (e: any) => {
        if (disabled || isLoading) {
          e?.preventDefault?.();
          e?.stopPropagation?.();
          return;
        }
        childProps.onClick?.(e);
        buttonProps.onClick?.(e);
      },
      children: contents,
    });
  }

  return (
    <button
      className={composedClassName}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {contents}
    </button>
  );
}
