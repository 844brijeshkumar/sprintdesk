import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  BarChart3,
  LogOut,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBoardStore } from '@/stores/boardStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const sprint = useBoardStore((state) => state.sprint);
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/board', label: 'Kanban Board', icon: KanbanSquare },
    { to: '/analytics', label: 'Sprint Analytics', icon: BarChart3 },
  ];

  const userPhoto =
    user?.avatar ||
    user?.image ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.username || 'Emily Johnson';

  const userRole = user?.role || 'Lead Frontend Architect';

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 ease-in-out md:static md:translate-x-0',
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800 transition-all',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {isCollapsed ? (
            /* Minimized state: Only the open sidebar icon (no logo) */
            <button
              type="button"
              onClick={toggleCollapsed}
              title="Open sidebar"
              aria-label="Open sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          ) : (
            /* Expanded state: Brand logo, text, and minimize button */
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-600/30">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                      SprintDesk
                    </span>
                    <span className="rounded bg-brand-100 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">Enterprise Sprint Suite</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleCollapsed}
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
                className="hidden md:flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Sprint active status chip (visible in expanded mode) */}
        {!isCollapsed && (
          <div className="p-4 transition-opacity duration-200">
            <div className="rounded-xl border border-brand-200/60 bg-brand-50/50 p-3 dark:border-brand-900/60 dark:bg-brand-950/30 text-left">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-900 dark:text-brand-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Sprint
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {sprint ? sprint.id.toUpperCase() : 'SPRINT-24'}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                {sprint?.name || 'Sprint 24: Real-time Sync'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-3 py-3 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center rounded-xl transition-all text-sm font-medium',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs dark:bg-brand-950/70 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <span className="pointer-events-none absolute left-full ml-2 z-50 hidden rounded-md bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-md dark:bg-slate-800 group-hover:block whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User info & logout */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          {isCollapsed ? (
            /* Minimized bottom: only login user photo with online green dot */
            <div className="flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                title={`Logged in as ${displayName} (Online) • Click to logout`}
                aria-label={`User profile: ${displayName}`}
                className="group relative flex items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <div className="relative">
                  <img
                    src={userPhoto}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/30 dark:ring-brand-400/30 shadow-sm"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                    title="Online"
                  />
                </div>
              </button>
            </div>
          ) : (
            /* Expanded bottom: full user info and logout action */
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={userPhoto}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-500/20 dark:ring-brand-400/20"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
                    title="Online"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate capitalize">
                    {user?.role || 'admin'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                title="Log out"
                aria-label="Log out"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Verification Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        description="Are you sure you want to log out?"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmLogout}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Log Out
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-850/60">
            <img
              src={userPhoto}
              alt={displayName}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-500/30"
            />
            <div className="min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || `${user?.username || 'user'}@sprintdesk.io`}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You will be signed out of your current session and returned to the login screen. Any active sprint data and local changes are safely persisted.
          </p>
        </div>
      </Modal>
    </>
  );
}
