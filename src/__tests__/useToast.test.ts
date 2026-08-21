import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';
import { useToastStore } from '@/stores/toastStore';

describe('useToast Hook & Toast Store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => {
      useToastStore.getState().clearToasts();
    });
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it('should add a toast to the state when calling success/error/info/warning', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Task Created', 'Task TASK-101 created successfully');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Task Created');
    expect(result.current.toasts[0].message).toBe('Task TASK-101 created successfully');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should automatically remove the toast after specified timeout duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Auto Disappearing', 'Will expire in 2000ms', 2000);
    });

    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward 1900ms - toast should still exist
    act(() => {
      vi.advanceTimersByTime(1900);
    });
    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward past 2000ms - toast should be auto-removed
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('should allow manually dismissing a toast by ID before timeout', () => {
    const { result } = renderHook(() => useToast());

    let toastId = '';
    act(() => {
      toastId = result.current.warning('Alert', 'Warning message', 10000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should support multiple concurrent toasts with independent lifecycles', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Toast 1', 'Quick', 1000);
      result.current.error('Toast 2', 'Longer', 3000);
    });

    expect(result.current.toasts).toHaveLength(2);

    // Advance 1500ms -> Toast 1 removed, Toast 2 remains
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');

    // Advance remaining -> Toast 2 removed
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});
