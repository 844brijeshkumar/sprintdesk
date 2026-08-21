import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { useBoardStore } from '@/stores/boardStore';

export function useTaskData() {
  const isInitialized = useBoardStore((state) => state.isInitialized);
  const setInitialData = useBoardStore((state) => state.setInitialData);

  const query = useQuery({
    queryKey: ['sprint-mock-data'],
    queryFn: () => taskService.fetchInitialData(),
    staleTime: Infinity, // Handed off to Zustand for local client state
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (query.data && !isInitialized) {
      setInitialData(query.data);
    }
  }, [query.data, isInitialized, setInitialData]);

  return {
    ...query,
    isInitialLoading: query.isLoading && !isInitialized,
  };
}
