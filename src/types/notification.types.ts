export type NotificationType = 'task' | 'review' | 'info' | 'success' | 'warning';

export interface NotificationItem {
  id: string | number;
  title: string;
  message?: string;
  body?: string;
  createdAt?: string;
  timestamp?: string;
  read: boolean;
  type: NotificationType;
  link?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}
