'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'handcrafted';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  animated?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  animated = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-dark-bg-secondary text-dark-text-primary border border-dark-border-primary',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
    handcrafted: 'bg-gradient-to-r from-heritage-500 to-heritage-600 text-white shadow-lg font-handcrafted',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

