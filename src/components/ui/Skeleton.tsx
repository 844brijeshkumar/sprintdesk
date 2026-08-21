import React from 'react';
import { cn } from '@/utils/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function BoardColumnSkeleton() {
  return (
    <div className="w-80 shrink-0 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 p-4 space-y-3">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
