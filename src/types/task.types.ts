import { NotificationItem } from './notification.types';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
}

export interface SprintMeta {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number;
  assigneeId: string;
  tags: string[];
  createdAt: string;
  dueDate: string;
  comments: TaskComment[];
}

export interface MockDataPayload {
  sprint: SprintMeta;
  users: TeamMember[];
  tasks: Task[];
  notifications?: NotificationItem[];
}

export interface BoardFilters {
  search: string;
  priority: TaskPriority | 'all';
  assigneeId: string | 'all';
  tag: string | 'all';
}

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  description: string;
  accentColor: string;
}
