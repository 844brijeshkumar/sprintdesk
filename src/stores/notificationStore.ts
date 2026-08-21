import { create } from 'zustand';
import { NotificationItem } from '@/types/notification.types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isDropdownOpen: boolean;

  setNotifications: (items: NotificationItem[]) => void;
  mergeIncomingNotifications: (incoming: NotificationItem[]) => NotificationItem[];
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  toggleDropdown: (open?: boolean) => void;
  removeNotification: (id: string | number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isDropdownOpen: false,

  setNotifications: (items) => {
    const unread = items.filter((n) => !n.read).length;
    set({ notifications: items, unreadCount: unread });
  },

  mergeIncomingNotifications: (incoming) => {
    const current = get().notifications;
    const currentIds = new Set(current.map((n) => String(n.id)));

    // Find items that are genuinely new
    const brandNewItems = incoming.filter((item) => !currentIds.has(String(item.id)));

    if (brandNewItems.length === 0 && current.length > 0) {
      return [];
    }

    // If store was empty, set all incoming
    if (current.length === 0) {
      const unread = incoming.filter((n) => !n.read).length;
      set({ notifications: incoming, unreadCount: unread });
      return [];
    }

    // Merge new items at the top
    const updatedNotifications = [...brandNewItems, ...current];
    const unread = updatedNotifications.filter((n) => !n.read).length;
    set({ notifications: updatedNotifications, unreadCount: unread });

    return brandNewItems;
  },

  markAsRead: (id: string | number) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        String(n.id) === String(id) ? { ...n, read: true } : n
      );
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  toggleDropdown: (open) => {
    set((state) => ({
      isDropdownOpen: typeof open === 'boolean' ? open : !state.isDropdownOpen,
    }));
  },

  removeNotification: (id: string | number) => {
    set((state) => {
      const updated = state.notifications.filter((n) => String(n.id) !== String(id));
      const unread = updated.filter((n) => !n.read).length;
      return { notifications: updated, unreadCount: unread };
    });
  },
}));
