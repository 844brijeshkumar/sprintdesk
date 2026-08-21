import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const baseStyles = 'rounded-xl border transition-all duration-200';

  const variants = {
    default: 'bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-800/80 shadow-sm',
    elevated: 'bg-white border-slate-200 shadow-md dark:bg-slate-900 dark:border-slate-800',
    glass: 'bg-white/70 backdrop-blur-md border-white/20 dark:bg-slate-900/70 dark:border-slate-800/50 shadow-sm',
    interactive:
      'bg-white border-slate-200/80 hover:border-brand-500/50 hover:shadow-md dark:bg-slate-900 dark:border-slate-800/80 dark:hover:border-brand-500/50 cursor-pointer shadow-sm',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/60', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}
