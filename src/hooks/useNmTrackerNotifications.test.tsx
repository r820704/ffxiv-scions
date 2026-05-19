import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNmTrackerNotifications } from './useNmTrackerNotifications';

const originalNotification = (globalThis as { Notification?: unknown }).Notification;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  if (originalNotification) {
    (globalThis as { Notification?: unknown }).Notification = originalNotification;
  } else {
    delete (globalThis as { Notification?: unknown }).Notification;
  }
});

describe('useNmTrackerNotifications', () => {
  it('returns enabled=false by default when no localStorage', () => {
    const { result } = renderHook(() =>
      useNmTrackerNotifications({ pinned: [], records: {} })
    );
    expect(result.current.enabled).toBe(false);
  });

  it('returns empty upcomingEntries when no pinned NMs', () => {
    const { result } = renderHook(() =>
      useNmTrackerNotifications({ pinned: [], records: {} })
    );
    expect(result.current.upcomingEntries).toEqual([]);
  });

  it('persists enabled state to localStorage', async () => {
    // Mock Notification API as granted
    (globalThis as { Notification?: unknown }).Notification = Object.assign(
      function () {},
      { permission: 'granted', requestPermission: async () => 'granted' as NotificationPermission },
    );
    const { result } = renderHook(() =>
      useNmTrackerNotifications({ pinned: [], records: {} })
    );
    await act(async () => {
      await result.current.setEnabled(true);
    });
    expect(localStorage.getItem('eureka-nm-tracker-notification-enabled')).toBe('true');
  });

  it('returns supported=false when Notification API absent', () => {
    delete (globalThis as { Notification?: unknown }).Notification;
    const { result } = renderHook(() =>
      useNmTrackerNotifications({ pinned: [], records: {} })
    );
    expect(result.current.supported).toBe(false);
  });
});
