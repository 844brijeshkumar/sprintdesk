import { Task, TeamMember, SprintMeta } from '@/types/task.types';

export interface StatusDistributionItem {
  name: string;
  value: number;
  points: number;
  color: string;
}

export interface PriorityDistributionItem {
  priority: string;
  count: number;
  points: number;
  fill: string;
}

export interface AssigneeWorkloadItem {
  name: string;
  avatar: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalPoints: number;
  completedPoints: number;
}

export interface BurndownDataPoint {
  day: string;
  idealRemaining: number;
  actualRemaining: number;
}

export interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalPoints: number;
  completedPoints: number;
  inProgressPoints: number;
  remainingPoints: number;
  urgentIssues: number;
  teamVelocity: number;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: '#64748b', // slate-500
  todo: '#3b82f6', // blue-500
  in_progress: '#f59e0b', // amber-500
  done: '#10b981', // emerald-500
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444', // red-500
  high: '#f97316', // orange-500
  medium: '#3b82f6', // blue-500
  low: '#10b981', // emerald-500
};

/**
 * Transforms raw tasks into status distribution for Pie/Donut charts
 */
export function transformStatusDistribution(tasks: Task[]): StatusDistributionItem[] {
  const statusLabels: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  };

  const map: Record<string, { count: number; points: number }> = {
    backlog: { count: 0, points: 0 },
    todo: { count: 0, points: 0 },
    in_progress: { count: 0, points: 0 },
    done: { count: 0, points: 0 },
  };

  for (const task of tasks) {
    if (map[task.status]) {
      map[task.status].count += 1;
      map[task.status].points += task.storyPoints || 0;
    }
  }

  return (Object.keys(map) as (keyof typeof map)[]).map((key) => ({
    name: statusLabels[key] || key,
    value: map[key].count,
    points: map[key].points,
    color: STATUS_COLORS[key] || '#94a3b8',
  }));
}

/**
 * Transforms raw tasks into priority breakdown for Bar charts
 */
export function transformPriorityDistribution(tasks: Task[]): PriorityDistributionItem[] {
  const priorityLabels: Record<string, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const map: Record<string, { count: number; points: number }> = {
    urgent: { count: 0, points: 0 },
    high: { count: 0, points: 0 },
    medium: { count: 0, points: 0 },
    low: { count: 0, points: 0 },
  };

  for (const task of tasks) {
    if (map[task.priority]) {
      map[task.priority].count += 1;
      map[task.priority].points += task.storyPoints || 0;
    }
  }

  return (Object.keys(map) as (keyof typeof map)[]).map((key) => ({
    priority: priorityLabels[key] || key,
    count: map[key].count,
    points: map[key].points,
    fill: PRIORITY_COLORS[key] || '#94a3b8',
  }));
}

/**
 * Transforms tasks into team member workload distribution
 */
export function transformAssigneeWorkload(tasks: Task[], users: TeamMember[]): AssigneeWorkloadItem[] {
  const userMap = new Map<string, TeamMember>(users.map((u) => [u.id, u]));

  const aggregation: Record<
    string,
    { totalTasks: number; completedTasks: number; inProgressTasks: number; totalPoints: number; completedPoints: number }
  > = {};

  // Initialize for all team members
  for (const user of users) {
    aggregation[user.id] = {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      totalPoints: 0,
      completedPoints: 0,
    };
  }

  for (const task of tasks) {
    if (!aggregation[task.assigneeId]) {
      aggregation[task.assigneeId] = {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        totalPoints: 0,
        completedPoints: 0,
      };
    }
    const agg = aggregation[task.assigneeId];
    agg.totalTasks += 1;
    agg.totalPoints += task.storyPoints || 0;

    if (task.status === 'done') {
      agg.completedTasks += 1;
      agg.completedPoints += task.storyPoints || 0;
    } else if (task.status === 'in_progress') {
      agg.inProgressTasks += 1;
    }
  }

  return Object.entries(aggregation).map(([userId, agg]) => {
    const user = userMap.get(userId);
    return {
      name: user ? user.name.split(' ')[0] : userId,
      avatar: user?.avatar || '',
      totalTasks: agg.totalTasks,
      completedTasks: agg.completedTasks,
      inProgressTasks: agg.inProgressTasks,
      totalPoints: agg.totalPoints,
      completedPoints: agg.completedPoints,
    };
  });
}

/**
 * Computes 14-day sprint burndown curve based on sprint duration and tasks
 */
export function transformSprintBurndown(tasks: Task[], sprint: SprintMeta): BurndownDataPoint[] {
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0) || sprint.totalPoints || 42;
  const completedPoints = tasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const days = ['Day 1', 'Day 3', 'Day 5', 'Day 7', 'Day 9', 'Day 11', 'Day 14 (End)'];
  const numSteps = days.length;
  const idealStep = totalPoints / (numSteps - 1);

  // Progressive actual burndown simulating progress leading to current completed points
  const pointsRemaining = totalPoints - completedPoints;
  const simulatedDrops = [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1.0];

  return days.map((day, idx) => {
    const idealRemaining = Math.max(0, Math.round(totalPoints - idx * idealStep));
    // Calculate simulated actual curve matching the real completed state at today's mark
    const actualBurnedSoFar = completedPoints * simulatedDrops[idx];
    const actualRemaining = Math.max(0, Math.round(totalPoints - actualBurnedSoFar));

    return {
      day,
      idealRemaining,
      actualRemaining: idx <= 4 ? actualRemaining : (idx === 5 ? Math.round(pointsRemaining + 2) : pointsRemaining),
    };
  });
}

/**
 * Computes high-level KPI metrics summary
 */
export function calculateAnalyticsSummary(tasks: Task[]): AnalyticsSummary {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedPoints = tasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const inProgressPoints = tasks
    .filter((t) => t.status === 'in_progress')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const remainingPoints = totalPoints - completedPoints;
  const urgentIssues = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const teamVelocity = completedPoints; // points burned in sprint so far

  return {
    totalTasks,
    completedTasks,
    completionRate,
    totalPoints,
    completedPoints,
    inProgressPoints,
    remainingPoints,
    urgentIssues,
    teamVelocity,
  };
}
