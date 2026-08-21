import { Search, X } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { TaskPriority } from '@/types/task.types';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function BoardFilters() {
  const { filters, setFilters, resetFilters, users } = useBoardStore();

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🔵 Medium' },
    { value: 'low', label: '🟢 Low' },
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    ...users.map((u) => ({
      value: u.id,
      label: u.name,
    })),
  ];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.priority !== 'all' ||
    filters.assigneeId !== 'all' ||
    filters.tag !== 'all';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Left: Search input */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Filter tasks by title, ID, or description..."
          className="w-full rounded-lg border border-slate-300 bg-slate-50/50 py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:focus:bg-slate-900"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => setFilters({ search: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right: Select dropdowns & reset */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="w-40">
          <Select
            value={filters.priority}
            onChange={(val) => setFilters({ priority: val as TaskPriority | 'all' })}
            options={priorityOptions}
          />
        </div>

        <div className="w-44">
          <Select
            value={filters.assigneeId}
            onChange={(val) => setFilters({ assigneeId: val as string })}
            options={assigneeOptions}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            leftIcon={<X className="h-3.5 w-3.5" />}
            className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
