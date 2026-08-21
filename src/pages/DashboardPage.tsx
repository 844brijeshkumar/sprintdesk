import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  KanbanSquare,
  BarChart3,
  Flame,
  Users,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { Task } from '@/types/task.types';
import { calculateAnalyticsSummary } from '@/utils/analyticsTransformers';
import { MetricCard } from '@/components/analytics/MetricCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { TaskDrawer } from '@/components/board/TaskDrawer';
import { CreateTaskModal } from '@/components/board/CreateTaskModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, sprint, users, openDrawer, openCreateModal } = useBoardStore();

  const metrics = useMemo(() => calculateAnalyticsSummary(tasks), [tasks]);

  const columns: ColumnDef<Task>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'Issue ID',
        sortable: true,
        render: (task) => (
          <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
            {task.id}
          </span>
        ),
      },
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        render: (task) => (
          <div className="max-w-md truncate font-medium text-slate-800 dark:text-slate-200">
            {task.title}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (task) => <StatusBadge status={task.status} />,
      },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        render: (task) => <PriorityBadge priority={task.priority} />,
      },
      {
        key: 'storyPoints',
        header: 'Points',
        sortable: true,
        render: (task) => (
          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
            {task.storyPoints} pts
          </span>
        ),
      },
      {
        key: 'assigneeId',
        header: 'Assignee',
        render: (task) => {
          const assignee = users.find((u) => u.id === task.assigneeId);
          return assignee ? (
            <div className="flex items-center gap-2">
              <img
                src={assignee.avatar}
                alt={assignee.name}
                className="h-5 w-5 rounded-full object-cover"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                {assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Unassigned</span>
          );
        },
      },
    ],
    [users]
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 text-white shadow-xl dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-brand-300 border border-brand-500/30">
              ACTIVE SPRINT
            </span>
            <span className="text-xs text-slate-400">Ends Aug 24, 2026</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {sprint?.name || 'Sprint 24: Real-time Collaboration & Auth'}
          </h2>
          <p className="max-w-2xl text-xs text-slate-300 sm:text-sm">
            {sprint?.goal ||
              'Deliver hardened enterprise auth flow, real-time board sync, and burndown analytics dashboard.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/board')}
            leftIcon={<KanbanSquare className="h-4 w-4" />}
            className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
          >
            Kanban Board
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openCreateModal('todo')}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Sprint Completion"
          value={`${metrics.completionRate}%`}
          subValue={`${metrics.completedTasks}/${metrics.totalTasks} issues done`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={{ value: '+8.4%', isPositive: true }}
          accentColor="bg-emerald-600"
        />

        <MetricCard
          label="Velocity Points"
          value={metrics.completedPoints}
          subValue={`of ${metrics.totalPoints} total story pts`}
          icon={<Flame className="h-5 w-5" />}
          trend={{ value: 'On track', isPositive: true }}
          accentColor="bg-brand-600"
        />

        <MetricCard
          label="In-Flight Work"
          value={metrics.inProgressPoints}
          subValue={`${tasks.filter((t) => t.status === 'in_progress').length} active tickets`}
          icon={<Clock className="h-5 w-5" />}
          accentColor="bg-amber-600"
        />

        <MetricCard
          label="Active Engineers"
          value={users.length}
          subValue="4 cross-functional members"
          icon={<Users className="h-5 w-5" />}
          accentColor="bg-indigo-600"
        />
      </div>

      {/* Main Content Split: Sprint Tasks Table & Team Roster */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Sprint Tasks Table (2 columns) */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sprint Backlog & Issues</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any row to open the full task detail drawer and edit.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/board')}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="text-xs text-brand-600 dark:text-brand-400"
            >
              View Full Board
            </Button>
          </div>

          <DataTable<Task>
            data={tasks}
            columns={columns}
            pageSize={6}
            onRowClick={(task) => openDrawer(task.id)}
          />
        </div>

        {/* Right: Team Roster & Velocity shortcuts */}
        <div className="space-y-6">
          {/* Team Workload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Sprint Team</CardTitle>
              <span className="text-xs text-slate-400">{users.length} members</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.map((member) => {
                const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
                const doneCount = memberTasks.filter((t) => t.status === 'done').length;

                return (
                  <div key={member.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-800"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{member.role}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {doneCount}/{memberTasks.length}
                      </span>
                      <p className="text-[10px] text-slate-400">tasks done</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Analytics Teaser */}
          <Card className="bg-gradient-to-br from-brand-900/40 via-slate-900 to-slate-900 border-brand-800/40">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-brand-400">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Live Visualization</span>
              </div>
              <h4 className="text-sm font-semibold text-white">Sprint Burndown & Velocity</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live Recharts analytics synchronized in real-time with Kanban board drag-and-drop state.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/analytics')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full mt-2"
              >
                Open Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Drawer & Create Modal */}
      <TaskDrawer />
      <CreateTaskModal />
    </div>
  );
}
