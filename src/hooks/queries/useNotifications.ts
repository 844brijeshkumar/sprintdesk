import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { useNotificationStore } from '@/stores/notificationStore';
import { useToastStore } from '@/stores/toastStore';

export function useNotifications(pollIntervalMs = 15000) {
  const [isTabActive, setIsTabActive] = useState(!document.hidden);
  const mergeIncoming = useNotificationStore((state) => state.mergeIncomingNotifications);
  const addToast = useToastStore((state) => state.addToast);

  // Track Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const query = useQuery({
    queryKey: ['notifications-poll'],
    queryFn: () => notificationService.fetchLatestNotifications(15),
    refetchInterval: isTabActive ? pollIntervalMs : false,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });

  useEffect(() => {
    if (query.data && query.data.length > 0) {
      const newItems = mergeIncoming(query.data);
      
      // Fire toast notification for freshly received items
      if (newItems.length > 0) {
        const latest = newItems[0];
        addToast({
          title: 'Sprint Activity Update',
          message: latest.title,
          type: latest.type === 'warning' ? 'warning' : 'info',
          duration: 5000,
        });
      }
    }
  }, [query.data, mergeIncoming, addToast]);

  return {
    ...query,
    isPollingActive: isTabActive,
  };
}
