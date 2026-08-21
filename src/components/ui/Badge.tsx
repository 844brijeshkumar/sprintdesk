import React from 'react';
import { cn } from '@/utils/cn';
import { TaskPriority, TaskStatus } from '@/types/task.types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'slate' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-md select-none';

  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    primary: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50 dark:border-red-800/50',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    outline: 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const configs: Record<TaskPriority, { label: string; variant: BadgeProps['variant']; dot: string }> = {
    urgent: { label: 'Urgent', variant: 'danger', dot: 'bg-red-500' },
    high: { label: 'High', variant: 'warning', dot: 'bg-orange-500' },
    medium: { label: 'Medium', variant: 'primary', dot: 'bg-brand-500' },
    low: { label: 'Low', variant: 'slate', dot: 'bg-emerald-500' },
  };

  const config = configs[priority] || configs.low;

  return (
    <Badge variant={config.variant} size="sm">
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      <span>{config.label}</span>
    </Badge>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const configs: Record<TaskStatus, { label: string; variant: BadgeProps['variant'] }> = {
    backlog: { label: 'Backlog', variant: 'slate' },
    todo: { label: 'To Do', variant: 'primary' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    done: { label: 'Done', variant: 'success' },
  };

  const config = configs[status] || configs.backlog;

  return (
    <Badge variant={config.variant} size="sm">
      <span>{config.label}</span>
    </Badge>
  );
}
