import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useBoardStore } from '@/stores/boardStore';
import { NotificationDropdown } from './NotificationDropdown';

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const sprint = useBoardStore((state) => state.sprint);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left items: Mobile toggle + Breadcrumb / Sprint Goal */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block text-left">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {sprint?.name || 'Sprint 24 Workspace'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
            {sprint?.goal || 'Deliver hardened enterprise auth flow and interactive Kanban board.'}
          </p>
        </div>
      </div>

      {/* Right actions: Theme Toggle, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Notification Dropdown */}
        <NotificationDropdown />
      </div>
    </header>
  );
}
