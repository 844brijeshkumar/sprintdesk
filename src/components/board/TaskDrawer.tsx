import React, { useState, useEffect } from 'react';
import { Trash2, Send, Tag } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';
import { useToastStore } from '@/stores/toastStore';
import { TaskStatus, TaskPriority } from '@/types/task.types';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';

export function TaskDrawer() {
  const {
    tasks,
    users,
    activeTaskId,
    isDrawerOpen,
    closeDrawer,
    updateTask,
    deleteTask,
    addComment,
  } = useBoardStore();

  const addToast = useToastStore((state) => state.addToast);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentAuthorId, setCommentAuthorId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (activeTask) {
      setTitle(activeTask.title);
      setDescription(activeTask.description || '');
      setStatus(activeTask.status);
      setPriority(activeTask.priority);
      setStoryPoints(activeTask.storyPoints || 1);
      setAssigneeId(activeTask.assigneeId || (users[0]?.id ?? ''));
      setTagsInput((activeTask.tags || []).join(', '));
      setCommentText('');
      setCommentAuthorId(users[0]?.id ?? '');
      setShowDeleteConfirm(false);
    }
  }, [activeTask, users]);

  if (!activeTask) return null;

  const handleSaveChanges = () => {
    if (!title.trim()) {
      addToast({ title: 'Validation Error', message: 'Task title cannot be empty', type: 'error' });
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateTask(activeTask.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      storyPoints: Number(storyPoints) || 1,
      assigneeId,
      tags: parsedTags,
    });

    addToast({ title: 'Task Updated', message: `${activeTask.id} has been updated.`, type: 'success' });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(activeTask.id, commentText.trim(), commentAuthorId || users[0]?.id);
    setCommentText('');
    addToast({ title: 'Comment Added', message: 'New comment posted to task discussion.', type: 'info' });
  };

  const handleDelete = () => {
    deleteTask(activeTask.id);
    addToast({ title: 'Task Deleted', message: `${activeTask.id} was permanently removed.`, type: 'info' });
    closeDrawer();
  };

  const statusOptions = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟠 High' },
    { value: 'medium', label: '🔵 Medium' },
    { value: 'low', label: '🟢 Low' },
  ];

  const assigneeOptions = users.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.role.split(' ')[0]})`,
  }));

  const pointsOptions = [1, 2, 3, 5, 8, 13].map((pts) => ({
    value: pts,
    label: `${pts} Points`,
  }));

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      width="xl"
      title={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {activeTask.id}
          </span>
          <StatusBadge status={activeTask.status} />
          <PriorityBadge priority={activeTask.priority} />
        </div>
      }
      description={`Created on ${new Date(activeTask.createdAt).toLocaleDateString()}`}
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Delete Task
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                <Button variant="danger" size="xs" onClick={handleDelete}>
                  Yes, Delete
                </Button>
                <Button variant="outline" size="xs" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={closeDrawer}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Title Input */}
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief task title..."
          required
        />

        {/* Description Textarea */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description, acceptance criteria, or technical notes..."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Status, Priority, Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as TaskStatus)}
            options={statusOptions}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(v) => setPriority(v as TaskPriority)}
            options={priorityOptions}
          />
          <Select
            label="Estimate"
            value={storyPoints}
            onChange={(v) => setStoryPoints(Number(v))}
            options={pointsOptions}
          />
        </div>

        {/* Assignee & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(v) => setAssigneeId(String(v))}
            options={assigneeOptions}
          />
          <Input
            label="Tags (Comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Frontend, Auth, a11y..."
            leftIcon={<Tag className="h-4 w-4" />}
          />
        </div>

        {/* Comments Section */}
        <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Activity & Comments ({activeTask.comments?.length || 0})
            </h4>
          </div>

          {/* Existing Comments */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {activeTask.comments && activeTask.comments.length > 0 ? (
              activeTask.comments.map((comment) => {
                const author = users.find((u) => u.id === comment.authorId);
                return (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-850/60"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={author?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                          alt={author?.name || 'User'}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {author?.name || 'Team Member'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-7">{comment.content}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No comments yet. Be the first to post!</p>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment or update..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>
                Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Drawer>
  );
}
