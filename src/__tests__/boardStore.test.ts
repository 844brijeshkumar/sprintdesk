import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '@/stores/boardStore';
import { MockDataPayload } from '@/types/task.types';

const MOCK_INITIAL_DATA: MockDataPayload = {
  sprint: {
    id: 'sprint-test',
    name: 'Sprint Test',
    goal: 'Test suite validation',
    startDate: '2026-08-01',
    endDate: '2026-08-14',
    totalPoints: 20,
  },
  users: [
    {
      id: 'u-1',
      name: 'Emily Johnson',
      username: 'emilys',
      email: 'emily@test.io',
      avatar: '',
      role: 'Engineer',
      department: 'Engineering',
    },
  ],
  tasks: [
    {
      id: 'TASK-101',
      title: 'Initial Todo Task',
      description: 'Test description',
      status: 'todo',
      priority: 'high',
      storyPoints: 5,
      assigneeId: 'u-1',
      tags: ['Test'],
      createdAt: '2026-08-01T00:00:00.000Z',
      dueDate: '2026-08-07T00:00:00.000Z',
      comments: [],
    },
  ],
};

describe('Zustand Board Store', () => {
  beforeEach(() => {
    // Reset store
    useBoardStore.setState({
      tasks: [],
      sprint: null,
      users: [],
      isInitialized: false,
      filters: { search: '', priority: 'all', assigneeId: 'all', tag: 'all' },
      activeTaskId: null,
      isDrawerOpen: false,
      isCreateModalOpen: false,
      createModalInitialStatus: 'todo',
    });
  });

  it('should seed initial mock sprint data correctly', () => {
    useBoardStore.getState().setInitialData(MOCK_INITIAL_DATA);

    const state = useBoardStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe('TASK-101');
    expect(state.sprint?.name).toBe('Sprint Test');
    expect(state.users).toHaveLength(1);
    expect(state.isInitialized).toBe(true);
  });

  it('should add a new task with sequential ID generation', () => {
    useBoardStore.getState().setInitialData(MOCK_INITIAL_DATA);

    const newTask = useBoardStore.getState().addTask({
      title: 'New Feature Implementation',
      description: 'Detailed scope',
      status: 'todo',
      priority: 'urgent',
      storyPoints: 8,
      assigneeId: 'u-1',
      tags: ['Feature', 'React'],
      dueDate: '2026-08-10',
    });

    expect(newTask.id).toBe('TASK-102');
    expect(newTask.title).toBe('New Feature Implementation');

    const tasks = useBoardStore.getState().tasks;
    expect(tasks).toHaveLength(2);
    expect(tasks.some((t) => t.id === 'TASK-102')).toBe(true);
  });

  it('should move a task between Kanban columns synchronously', () => {
    useBoardStore.getState().setInitialData(MOCK_INITIAL_DATA);

    expect(useBoardStore.getState().tasks[0].status).toBe('todo');

    // Move to in_progress
    useBoardStore.getState().moveTask('TASK-101', 'in_progress');
    expect(useBoardStore.getState().tasks.find((t) => t.id === 'TASK-101')?.status).toBe('in_progress');

    // Move to done
    useBoardStore.getState().moveTask('TASK-101', 'done');
    expect(useBoardStore.getState().tasks.find((t) => t.id === 'TASK-101')?.status).toBe('done');
  });

  it('should update task details and preserve remaining fields', () => {
    useBoardStore.getState().setInitialData(MOCK_INITIAL_DATA);

    useBoardStore.getState().updateTask('TASK-101', {
      title: 'Updated Title',
      storyPoints: 13,
      priority: 'urgent',
    });

    const updated = useBoardStore.getState().tasks.find((t) => t.id === 'TASK-101');
    expect(updated?.title).toBe('Updated Title');
    expect(updated?.storyPoints).toBe(13);
    expect(updated?.priority).toBe('urgent');
    expect(updated?.description).toBe('Test description'); // Preserved
  });

  it('should add comments to a task discussion thread', () => {
    useBoardStore.getState().setInitialData(MOCK_INITIAL_DATA);

    useBoardStore.getState().addComment('TASK-101', 'First review completed', 'u-1');

    const task = useBoardStore.getState().tasks.find((t) => t.id === 'TASK-101');
    expect(task?.comments).toHaveLength(1);
    expect(task?.comments[0].content).toBe('First review completed');
    expect(task?.comments[0].authorId).toBe('u-1');
  });

  it('should delete a task and close drawer if active', () => {
    useBoardStore.getState().setInitialData(MOCK_INITIAL_DATA);
    useBoardStore.getState().openDrawer('TASK-101');

    expect(useBoardStore.getState().isDrawerOpen).toBe(true);

    useBoardStore.getState().deleteTask('TASK-101');

    expect(useBoardStore.getState().tasks).toHaveLength(0);
    expect(useBoardStore.getState().isDrawerOpen).toBe(false);
    expect(useBoardStore.getState().activeTaskId).toBeNull();
  });
});
