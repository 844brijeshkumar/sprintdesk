import { useMemo } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import {
  transformStatusDistribution,
  transformPriorityDistribution,
  transformAssigneeWorkload,
  transformSprintBurndown,
  calculateAnalyticsSummary,
} from '@/utils/analyticsTransformers';
import { MetricCard } from '@/components/analytics/MetricCard';
import { BurndownChart } from '@/components/analytics/BurndownChart';
import { StatusPieChart } from '@/components/analytics/StatusPieChart';
import { PriorityBarChart } from '@/components/analytics/PriorityBarChart';
import { WorkloadBarChart } from '@/components/analytics/WorkloadBarChart';
import { Activity, Target, Zap, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { tasks, users, sprint } = useBoardStore();

  // Memoized data transformations for Recharts
  const statusData = useMemo(() => transformStatusDistribution(tasks), [tasks]);
  const priorityData = useMemo(() => transformPriorityDistribution(tasks), [tasks]);
  const workloadData = useMemo(() => transformAssigneeWorkload(tasks, users), [tasks, users]);
  const burndownData = useMemo(
    () =>
      transformSprintBurndown(
        tasks,
        sprint || {
          id: 'sprint-24',
          name: 'Sprint 24',
          goal: '',
          startDate: '2026-08-10',
          endDate: '2026-08-24',
          totalPoints: 42,
        }
      ),
    [tasks, sprint]
  );
  const summary = useMemo(() => calculateAnalyticsSummary(tasks), [tasks]);

  return (
    <div className="space-y-6 text-left pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
          Sprint Analytics & Velocity
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Live metric visualizations calculated in real-time from the Kanban board state. Dragging tasks updates these charts immediately.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Sprint Completion"
          value={`${summary.completionRate}%`}
          subValue={`${summary.completedTasks} of ${summary.totalTasks} issues done`}
          icon={<Target className="h-5 w-5" />}
          trend={{ value: '+4.2%', isPositive: true }}
          accentColor="bg-emerald-600"
        />

        <MetricCard
          label="Burned Story Points"
          value={`${summary.completedPoints} pts`}
          subValue={`of ${summary.totalPoints} committed points`}
          icon={<Zap className="h-5 w-5" />}
          trend={{ value: 'Target: 42 pts', isPositive: true }}
          accentColor="bg-brand-600"
        />

        <MetricCard
          label="In-Flight Points"
          value={`${summary.inProgressPoints} pts`}
          subValue={`${summary.remainingPoints} points remaining`}
          icon={<Activity className="h-5 w-5" />}
          accentColor="bg-amber-600"
        />

        <MetricCard
          label="Urgent Incomplete"
          value={summary.urgentIssues}
          subValue="require immediate attention"
          icon={<AlertCircle className="h-5 w-5" />}
          accentColor={summary.urgentIssues > 0 ? 'bg-red-600' : 'bg-slate-600'}
        />
      </div>

      {/* Primary Visualizations: Burndown & Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BurndownChart data={burndownData} />
        </div>
        <div>
          <StatusPieChart data={statusData} />
        </div>
      </div>

      {/* Secondary Visualizations: Priority Breakdown & Team Workload */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PriorityBarChart data={priorityData} />
        <WorkloadBarChart data={workloadData} />
      </div>
    </div>
  );
}
