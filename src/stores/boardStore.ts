import { create } from 'zustand';
import { Task, TaskStatus, MockDataPayload, SprintMeta, TeamMember, BoardFilters, TaskComment } from '@/types/task.types';

interface BoardState {
  tasks: Task[];
  sprint: SprintMeta | null;
  users: TeamMember[];
  isInitialized: boolean;
  filters: BoardFilters;
  activeTaskId: string | null;
  isDrawerOpen: boolean;
  isCreateModalOpen: boolean;
  createModalInitialStatus: TaskStatus;

  // Actions
  setInitialData: (payload: MockDataPayload) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus, targetIndex?: number) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, content: string, authorId: string) => void;
  setFilters: (filters: Partial<BoardFilters>) => void;
  resetFilters: () => void;
  openDrawer: (taskId: string) => void;
  closeDrawer: () => void;
  openCreateModal: (initialStatus?: TaskStatus) => void;
  closeCreateModal: () => void;
}

const INITIAL_FILTERS: BoardFilters = {
  search: '',
  priority: 'all',
  assigneeId: 'all',
  tag: 'all',
};

export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  sprint: null,
  users: [],
  isInitialized: false,
  filters: INITIAL_FILTERS,
  activeTaskId: null,
  isDrawerOpen: false,
  isCreateModalOpen: false,
  createModalInitialStatus: 'todo',

  setInitialData: (payload: MockDataPayload) => {
    // Only initialize once unless force-seeded
    set({
      tasks: payload.tasks,
      sprint: payload.sprint,
      users: payload.users,
      isInitialized: true,
    });
  },

  moveTask: (taskId: string, targetStatus: TaskStatus, targetIndex?: number) => {
    set((state) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return state;

      const currentTask = state.tasks[taskIndex];
      const updatedTask = { ...currentTask, status: targetStatus };

      // Remove from current list
      const remainingTasks = state.tasks.filter((t) => t.id !== taskId);

      // If targetIndex is specified within the column
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        // Find indices of tasks with targetStatus
        const columnTasks = remainingTasks.filter((t) => t.status === targetStatus);
        const targetTaskInColumn = columnTasks[targetIndex];

        if (targetTaskInColumn) {
          const insertGlobalIndex = remainingTasks.findIndex((t) => t.id === targetTaskInColumn.id);
          const newTasks = [...remainingTasks];
          newTasks.splice(insertGlobalIndex, 0, updatedTask);
          return { tasks: newTasks };
        }
      }

      // Default: append to the end of the array
      return {
        tasks: [...remainingTasks, updatedTask],
      };
    });
  },

  addTask: (taskInput) => {
    const state = get();
    // Generate next TASK-ID
    const existingNumbers = state.tasks
      .map((t) => {
        const match = t.id.match(/TASK-(\d+)/);
        return match ? parseInt(match[1], 10) : 100;
      })
      .filter(Boolean);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 100;
    const newId = `TASK-${maxNumber + 1}`;

    const newTask: Task = {
      ...taskInput,
      id: newId,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    set((s) => ({
      tasks: [newTask, ...s.tasks],
    }));

    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    }));
  },

  deleteTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
      isDrawerOpen: state.activeTaskId === taskId ? false : state.isDrawerOpen,
    }));
  },

  addComment: (taskId: string, content: string, authorId: string) => {
    const newComment: TaskComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      authorId,
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, comments: [...task.comments, newComment] } : task
      ),
    }));
  },

  setFilters: (newFilters: Partial<BoardFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: INITIAL_FILTERS });
  },

  openDrawer: (taskId: string) => {
    set({ activeTaskId: taskId, isDrawerOpen: true });
  },

  closeDrawer: () => {
    set({ isDrawerOpen: false, activeTaskId: null });
  },

  openCreateModal: (initialStatus = 'todo') => {
    set({ isCreateModalOpen: true, createModalInitialStatus: initialStatus });
  },

  closeCreateModal: () => {
    set({ isCreateModalOpen: false });
  },
}));
