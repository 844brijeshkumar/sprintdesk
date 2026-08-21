import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, GripVertical } from 'lucide-react';
import { Task, TeamMember } from '@/types/task.types';
import { PriorityBadge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface TaskCardProps {
  task: Task;
  users: TeamMember[];
  onClick?: () => void;
  isDraggingOverlay?: boolean;
}

export function TaskCard({ task, users, onClick, isDraggingOverlay = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isDraggingOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = users.find((u) => u.id === task.assigneeId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all text-left select-none',
        'hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        isDragging && 'opacity-40 ring-2 ring-brand-500 scale-[0.98]',
        isDraggingOverlay && 'shadow-2xl ring-2 ring-brand-500 rotate-1 cursor-grabbing bg-white dark:bg-slate-900 z-50',
        !isDraggingOverlay && 'cursor-pointer'
      )}
    >
      {/* Top row: ID, Priority, Drag Handle */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
            {task.id}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>

        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag task handle"
          className="rounded p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 mb-1.5">
        {task.title}
      </h4>

      {/* Task Description Preview */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Story Points, Comments, Assignee */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-mono font-medium" title="Story Points">
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded bg-slate-100 px-1 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {task.storyPoints || 1}
            </span>
            <span>pts</span>
          </span>

          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[11px]" title={`${task.comments.length} comments`}>
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task.comments.length}</span>
            </span>
          )}
        </div>

        {assignee && (
          <div className="flex items-center gap-1.5" title={assignee.name}>
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
