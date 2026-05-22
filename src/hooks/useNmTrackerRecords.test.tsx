import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNmTrackerRecords } from './useNmTrackerRecords';

beforeEach(() => {
  localStorage.clear();
});

describe('useNmTrackerRecords', () => {
  it('starts empty when no storage', () => {
    const { result } = renderHook(() => useNmTrackerRecords());
    expect(result.current.records).toEqual({});
  });

  it('setPop sets popAt to now()', () => {
    const { result } = renderHook(() => useNmTrackerRecords());
    const before = Date.now();
    act(() => result.current.setPop('pazuzu'));
    const after = Date.now();
    const rec = result.current.records['pazuzu'];
    expect(rec).toBeDefined();
    expect(rec!.popAt).toBeGreaterThanOrEqual(before);
    expect(rec!.popAt).toBeLessThanOrEqual(after);
  });

  it('clear removes one NM', () => {
    const { result } = renderHook(() => useNmTrackerRecords());
    act(() => result.current.setPop('pazuzu'));
    act(() => result.current.clear('pazuzu'));
    expect(result.current.records['pazuzu']).toBeUndefined();
  });

  it('setCustom sets specific timestamp', () => {
    const { result } = renderHook(() => useNmTrackerRecords());
    act(() => result.current.setCustom('pazuzu', 1700000000000));
    expect(result.current.records['pazuzu']!.popAt).toBe(1700000000000);
  });

  it('clearAll wipes everything', () => {
    const { result } = renderHook(() => useNmTrackerRecords());
    act(() => result.current.setPop('pazuzu'));
    act(() => result.current.setPop('cassie'));
    act(() => result.current.clearAll());
    expect(result.current.records).toEqual({});
  });

  it('persists across re-mounts via localStorage', () => {
    const { result, unmount } = renderHook(() => useNmTrackerRecords());
    act(() => result.current.setPop('pazuzu'));
    unmount();
    const { result: r2 } = renderHook(() => useNmTrackerRecords());
    expect(r2.current.records['pazuzu']).toBeDefined();
  });
});
