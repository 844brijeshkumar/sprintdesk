import React from 'react';
import { cn } from '@/utils/cn';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: string;
}

export function MetricCard({ label, value, subValue, icon, trend, accentColor = 'bg-brand-500' }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-900 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs', accentColor)}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
        {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={cn(
              'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400">vs planned velocity</span>
        </div>
      )}
    </div>
  );
}
