import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'approve'
  | 'revision'
  | 'reject'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-medium rounded-[10px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E88932]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#E88932] hover:bg-[#D47621] text-white shadow-2xs border border-transparent',
    secondary:
      'bg-[#263640] hover:bg-[#18232B] text-white shadow-2xs border border-transparent',
    outline:
      'bg-white hover:bg-[#F4F6F5] text-[#18232B] border border-[#E2E8E8]',
    ghost:
      'bg-transparent hover:bg-[#F4F6F5] text-[#263640] border border-transparent',
    approve:
      'bg-[#397C69] hover:bg-[#2F6857] text-white shadow-2xs border border-transparent',
    revision:
      'bg-[#D5A33D] hover:bg-[#BF8F2C] text-white shadow-2xs border border-transparent',
    reject:
      'bg-[#B94C45] hover:bg-[#9E3D37] text-white shadow-2xs border border-transparent',
    danger:
      'bg-[#B94C45] hover:bg-[#9E3D37] text-white shadow-2xs border border-transparent',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-[34px] px-3 text-xs gap-1.5',
    md: 'h-[42px] px-4 text-xs gap-2',
    lg: 'h-[46px] px-5 text-sm gap-2',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="shrink-0 flex items-center">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0 flex items-center">{icon}</span>
      )}
    </button>
  );
};

