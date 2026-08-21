import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { useBoardStore } from '@/stores/boardStore';
import { useToastStore } from '@/stores/toastStore';
import { Task, TaskStatus, ColumnDefinition } from '@/types/task.types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { BoardFilters } from './BoardFilters';
import { TaskDrawer } from './TaskDrawer';
import { CreateTaskModal } from './CreateTaskModal';

const COLUMNS: ColumnDefinition[] = [
  { id: 'backlog', title: 'Backlog', description: 'Future sprint tasks', accentColor: 'bg-slate-400' },
  { id: 'todo', title: 'To Do', description: 'Ready for implementation', accentColor: 'bg-blue-500' },
  { id: 'in_progress', title: 'In Progress', description: 'Actively being developed', accentColor: 'bg-amber-500' },
  { id: 'done', title: 'Done', description: 'Passed review and QA', accentColor: 'bg-emerald-500' },
];

export function KanbanBoard() {
  const {
    tasks,
    users,
    filters,
    moveTask,
    openDrawer,
    openCreateModal,
  } = useBoardStore();

  const addToast = useToastStore((state) => state.addToast);
  const [activeDraggingTask, setActiveDraggingTask] = useState<Task | null>(null);

  // Configure sensors with 5px threshold to prevent accidental clicks from dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter tasks reactively based on search, priority, assignee, tag
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesId = task.id.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesDesc) return false;
      }

      // Priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Assignee
      if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) {
        return false;
      }

      // Tag
      if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Group filtered tasks by column
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    };

    for (const task of filteredTasks) {
      if (map[task.status]) {
        map[task.status].push(task);
      }
    }

    return map;
  }, [filteredTasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const foundTask = tasks.find((t) => t.id === active.id);
      if (foundTask) {
        setActiveDraggingTask(foundTask);
      }
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId === overId) return;

      // Check if dropped directly over a column container or a task inside a column
      const isOverColumn = COLUMNS.some((col) => col.id === overId);
      const overTask = tasks.find((t) => t.id === overId);

      const targetStatus: TaskStatus | null = isOverColumn
        ? (overId as TaskStatus)
        : overTask
        ? overTask.status
        : null;

      const currentTask = tasks.find((t) => t.id === activeId);

      if (targetStatus && currentTask && currentTask.status !== targetStatus) {
        // Move task synchronously to new column
        moveTask(activeId, targetStatus);
      }
    },
    [tasks, moveTask]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDraggingTask(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const isOverColumn = COLUMNS.some((col) => col.id === overId);
      const overTask = tasks.find((t) => t.id === overId);

      const targetStatus: TaskStatus = isOverColumn
        ? (overId as TaskStatus)
        : overTask
        ? overTask.status
        : 'todo';

      const currentTask = tasks.find((t) => t.id === activeId);

      if (currentTask) {
        moveTask(activeId, targetStatus);

        if (currentTask.status !== targetStatus) {
          addToast({
            title: 'Task Status Updated',
            message: `Moved ${activeId} to ${targetStatus.replace('_', ' ').toUpperCase()}`,
            type: targetStatus === 'done' ? 'success' : 'info',
            duration: 3000,
          });
        }
      }
    },
    [tasks, moveTask, addToast]
  );

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Search & Filter Bar */}
      <BoardFilters />

      {/* Kanban Columns with DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 items-start gap-4 overflow-x-auto pb-6 pt-1">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              users={users}
              onTaskClick={(taskId) => openDrawer(taskId)}
              onAddTask={(status) => openCreateModal(status)}
            />
          ))}
        </div>

        {/* Floating card overlay during active drag */}
        <DragOverlay>
          {activeDraggingTask ? (
            <TaskCard
              task={activeDraggingTask}
              users={users}
              isDraggingOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Drawer */}
      <TaskDrawer />

      {/* Create Task Modal */}
      <CreateTaskModal />
    </div>
  );
}
