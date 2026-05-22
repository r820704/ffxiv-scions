import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNmTrackerNow } from './useNmTrackerNow';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useNmTrackerNow', () => {
  it('returns initial Date.now()', () => {
    const before = Date.now();
    const { result } = renderHook(() => useNmTrackerNow());
    expect(result.current).toBeGreaterThanOrEqual(before);
  });

  it('updates approximately every second', () => {
    const { result } = renderHook(() => useNmTrackerNow());
    const t0 = result.current;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBeGreaterThan(t0);
  });
});
