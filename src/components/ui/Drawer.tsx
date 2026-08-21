import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'lg',
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const portalRoot = document.getElementById('portal-root') || document.body;

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          className={cn(
            'flex h-full w-screen flex-col border-l border-slate-200 bg-white shadow-2xl transition-all',
            'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 animate-slide-left',
            widths[width],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-800">
            <div className="space-y-1 pr-4 text-left">
              {typeof title === 'string' ? (
                <h2 id="drawer-title" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
              ) : (
                title
              )}
              {description && (
                <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 text-left">{children}</div>

          {/* Optional Footer */}
          {footer && (
            <div className="border-t border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  );
}
