import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Task, TaskStatus, TeamMember, ColumnDefinition } from '@/types/task.types';
import { TaskCard } from './TaskCard';
import { cn } from '@/utils/cn';

export interface KanbanColumnProps {
  column: ColumnDefinition;
  tasks: Task[];
  users: TeamMember[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({ column, tasks, users, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-[500px] w-80 shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3.5 transition-colors',
        'dark:border-slate-800/80 dark:bg-slate-900/40',
        isOver && 'border-brand-500/60 bg-brand-50/20 dark:bg-brand-950/20 ring-2 ring-brand-500/20'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', column.accentColor)} />
          <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {column.title}
          </h3>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-200/80 px-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 font-mono" title="Total Story Points">
            {totalPoints} pts
          </span>
          <button
            type="button"
            onClick={() => onAddTask(column.id)}
            aria-label={`Add task to ${column.title}`}
            className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task List container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              users={users}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 p-4 text-center dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500">Drop tasks here</p>
            <button
              type="button"
              onClick={() => onAddTask(column.id)}
              className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              + Create task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
