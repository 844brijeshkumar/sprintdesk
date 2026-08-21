import React, { useState, useEffect } from 'react';
import { useBoardStore } from '@/stores/boardStore';
import { useToastStore } from '@/stores/toastStore';
import { TaskStatus, TaskPriority } from '@/types/task.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tag } from 'lucide-react';

export function CreateTaskModal() {
  const { isCreateModalOpen, closeCreateModal, createModalInitialStatus, addTask, users } = useBoardStore();
  const addToast = useToastStore((state) => state.addToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCreateModalOpen) {
      setTitle('');
      setDescription('');
      setStatus(createModalInitialStatus || 'todo');
      setPriority('medium');
      setStoryPoints(3);
      setAssigneeId(users[0]?.id || 'u-1');
      setTagsInput('');
      setError('');
    }
  }, [isCreateModalOpen, createModalInitialStatus, users]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newTask = addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      storyPoints: Number(storyPoints) || 1,
      assigneeId: assigneeId || users[0]?.id || 'u-1',
      tags,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    addToast({
      title: 'Task Created',
      message: `${newTask.id}: "${newTask.title}" was added to ${status.replace('_', ' ')}.`,
      type: 'success',
    });

    closeCreateModal();
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
    label: `${pts} Story Points`,
  }));

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      title="Create New Sprint Task"
      description="Add an issue or task to the current sprint backlog."
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={closeCreateModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Implement user authentication flow"
          error={error}
          required
          autoFocus
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description, requirements, or reproduction steps..."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Column"
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
            label="Story Points"
            value={storyPoints}
            onChange={(v) => setStoryPoints(Number(v))}
            options={pointsOptions}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(v) => setAssigneeId(String(v))}
            options={assigneeOptions}
          />
          <Input
            label="Tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Frontend, Security, Bug..."
            leftIcon={<Tag className="h-4 w-4" />}
          />
        </div>
      </form>
    </Modal>
  );
}
