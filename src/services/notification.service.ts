import rawMockData from '@/data/mock-data.json';
import { NotificationItem } from '@/types/notification.types';

export const notificationService = {
  /**
   * Fetches latest notifications from mock dataset
   */
  async fetchLatestNotifications(_limit = 15): Promise<NotificationItem[]> {
    // Simulate brief network latency for realistic query demonstration
    await new Promise((resolve) => setTimeout(resolve, 150));
    const items = (rawMockData.notifications || []) as NotificationItem[];
    return JSON.parse(JSON.stringify(items));
  },
};
