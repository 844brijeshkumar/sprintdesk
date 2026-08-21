import { useState, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckSquare,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { NotificationItem, NotificationType } from '@/types/notification.types';
import { cn } from '@/utils/cn';

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case 'task':
      return <CheckSquare className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />;
    case 'review':
      return <Eye className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />;
    case 'success':
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />;
    case 'warning':
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />;
    case 'info':
    default:
      return <Info className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />;
  }
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(20);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const displayedNotifications = notifications.slice(0, displayLimit);
  const hasMore = notifications.length > displayLimit;

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + 20);
  };

  const formatRelativeTime = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Recently';
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-2xl focus:outline-none dark:border-slate-800 dark:bg-slate-900 z-50 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="primary" size="sm">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((item: NotificationItem) => (
                <div
                  key={String(item.id)}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    'group relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer',
                    item.read
                      ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850/50'
                      : 'bg-brand-50/30 hover:bg-brand-50/60 dark:bg-brand-950/20 dark:hover:bg-brand-950/30'
                  )}
                >
                  {/* Left Icon / Read indicator */}
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <NotificationTypeIcon type={item.type} />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                        {!item.read && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0" />
                        )}
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeTime(item.createdAt || item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.message || item.body}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    aria-label="Remove notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                No notifications right now.
              </div>
            )}
          </div>

          {/* Footer with Load More if pagination needed */}
          {hasMore && (
            <div className="border-t border-slate-100 p-2.5 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
              <Button variant="ghost" size="xs" onClick={handleLoadMore} className="w-full">
                Load More Notifications ({notifications.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
