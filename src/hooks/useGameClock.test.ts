import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameClock } from './useGameClock';

describe('useGameClock', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns eorzea time for initial now', () => {
    vi.setSystemTime(new Date('2026-04-18T00:00:00Z'));
    const { result } = renderHook(() => useGameClock());
    expect(result.current.eorzeaTime.hours).toBeGreaterThanOrEqual(0);
    expect(result.current.eorzeaTime.hours).toBeLessThan(24);
  });

  it('updates after 1 second tick', () => {
    const { result } = renderHook(() => useGameClock());
    const first = result.current.now;
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.now).toBeGreaterThan(first);
  });
});
