import ReactDOM from 'react-dom';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';
import { ToastMessage, ToastType } from '@/types/notification.types';
import { cn } from '@/utils/cn';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-brand-500 shrink-0" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-500/30',
  error: 'border-red-500/30 bg-red-50/90 dark:bg-red-950/40 dark:border-red-500/30',
  warning: 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/40 dark:border-amber-500/30',
  info: 'border-brand-500/30 bg-brand-50/90 dark:bg-brand-950/40 dark:border-brand-500/30',
};

export function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all',
        'animate-slide-up text-left',
        BORDER_COLORS[toast.type]
      )}
    >
      <div className="mt-0.5">{ICONS[toast.type]}</div>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="rounded-lg p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  const portalRoot = document.getElementById('portal-root') || document.body;

  return ReactDOM.createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    portalRoot
  );
}
