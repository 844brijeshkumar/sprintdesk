import { useCallback } from 'react';
import { useToastStore } from '@/stores/toastStore';
import { ToastType } from '@/types/notification.types';

export function useToast() {
  const { toasts, addToast, removeToast, clearToasts } = useToastStore();

  const show = useCallback(
    (title: string, message?: string, type: ToastType = 'info', duration = 4000) => {
      return addToast({ title, message, type, duration });
    },
    [addToast]
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ title, message, type: 'success', duration });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ title, message, type: 'error', duration });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ title, message, type: 'info', duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return addToast({ title, message, type: 'warning', duration });
    },
    [addToast]
  );

  const dismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  return {
    toasts,
    show,
    success,
    error,
    info,
    warning,
    dismiss,
    clearToasts,
  };
}
