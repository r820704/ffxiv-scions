import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNmTrackerPinned } from './useNmTrackerPinned';

beforeEach(() => localStorage.clear());

describe('useNmTrackerPinned', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useNmTrackerPinned());
    expect(result.current.pinned).toEqual([]);
    expect(result.current.isPinned('pazuzu')).toBe(false);
  });

  it('toggle pins then unpins', () => {
    const { result } = renderHook(() => useNmTrackerPinned());
    act(() => result.current.toggle('pazuzu'));
    expect(result.current.isPinned('pazuzu')).toBe(true);
    expect(result.current.pinned).toEqual(['pazuzu']);
    act(() => result.current.toggle('pazuzu'));
    expect(result.current.isPinned('pazuzu')).toBe(false);
    expect(result.current.pinned).toEqual([]);
  });

  it('supports multiple pins', () => {
    const { result } = renderHook(() => useNmTrackerPinned());
    act(() => result.current.toggle('pazuzu'));
    act(() => result.current.toggle('copycat-cassie'));
    expect(result.current.pinned).toContain('pazuzu');
    expect(result.current.pinned).toContain('copycat-cassie');
  });

  it('persists across re-mount via localStorage', () => {
    const { result, unmount } = renderHook(() => useNmTrackerPinned());
    act(() => result.current.toggle('pazuzu'));
    unmount();
    const { result: r2 } = renderHook(() => useNmTrackerPinned());
    expect(r2.current.isPinned('pazuzu')).toBe(true);
  });
});
