import { Plus } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { Button } from '@/components/ui/Button';

export default function BoardPage() {
  const { sprint, openCreateModal } = useBoardStore();

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Board Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-left">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            {sprint?.name || 'Sprint 24 Board'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag cards across columns to update task progress. Click any card to edit details or post comments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openCreateModal('todo')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Main Kanban Board Area */}
      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  );
}
