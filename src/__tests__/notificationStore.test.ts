import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from '@/types/notification.types';

const mockNotifications: NotificationItem[] = [
  {
    id: 101,
    title: 'Task assigned',
    message: "You have been assigned to 'Build Kanban board'.",
    type: 'task',
    read: false,
    createdAt: '2026-08-19T11:10:00Z',
  },
  {
    id: 102,
    title: 'Review requested',
    message: "A review has been requested for 'Create analytics dashboard'.",
    type: 'review',
    read: false,
    createdAt: '2026-08-19T13:30:00Z',
  },
  {
    id: 103,
    title: 'Task completed',
    message: "'Implement authentication flow' has been completed.",
    type: 'task',
    read: true,
    createdAt: '2026-08-18T16:20:00Z',
  },
  {
    id: 104,
    title: 'Review requested',
    message: "A review has been requested for 'Accessibility audit'.",
    type: 'review',
    read: false,
    createdAt: '2026-08-19T14:00:00Z',
  },
];

describe('NotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isDropdownOpen: false,
    });
  });

  it('correctly sets notifications and calculates unread count', () => {
    const { setNotifications } = useNotificationStore.getState();
    setNotifications(mockNotifications);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(4);
    expect(state.unreadCount).toBe(3); // items 101, 102, 104 are unread
  });

  it('marks single notification as read by id', () => {
    const { setNotifications, markAsRead } = useNotificationStore.getState();
    setNotifications(mockNotifications);

    markAsRead(101);

    const state = useNotificationStore.getState();
    expect(state.notifications.find((n) => n.id === 101)?.read).toBe(true);
    expect(state.unreadCount).toBe(2);
  });

  it('marks all notifications as read', () => {
    const { setNotifications, markAllAsRead } = useNotificationStore.getState();
    setNotifications(mockNotifications);

    markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.notifications.every((n) => n.read)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('removes a notification and updates unread count', () => {
    const { setNotifications, removeNotification } = useNotificationStore.getState();
    setNotifications(mockNotifications);

    removeNotification(102);

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(3);
    expect(state.notifications.find((n) => n.id === 102)).toBeUndefined();
    expect(state.unreadCount).toBe(2);
  });
});
