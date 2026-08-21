import { MockDataPayload } from '@/types/task.types';
import rawMockData from '@/data/mock-data.json';

export const taskService = {
  /**
   * Fetches the initial mock sprint dataset
   */
  async fetchInitialData(): Promise<MockDataPayload> {
    // Simulate brief network latency for realistic TanStack Query loading state demonstration
    await new Promise((resolve) => setTimeout(resolve, 300));
    return JSON.parse(JSON.stringify(rawMockData)) as MockDataPayload;
  },
};
