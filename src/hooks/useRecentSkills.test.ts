import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSkills } from './useRecentSkills';

const STORAGE_KEY = 'eureka-recent-skills';

describe('useRecentSkills', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start empty when nothing in storage', () => {
    const { result } = renderHook(() => useRecentSkills());
    expect(result.current.recentIds).toEqual([]);
  });

  it('should push a new skill to the front', () => {
    const { result } = renderHook(() => useRecentSkills());
    act(() => result.current.pushRecent('skill-a'));
    expect(result.current.recentIds).toEqual(['skill-a']);
  });

  it('should move an existing skill to the front without duplicates', () => {
    const { result } = renderHook(() => useRecentSkills());
    act(() => {
      result.current.pushRecent('skill-a');
      result.current.pushRecent('skill-b');
      result.current.pushRecent('skill-a');
    });
    expect(result.current.recentIds).toEqual(['skill-a', 'skill-b']);
  });

  it('should cap the list at 8 entries', () => {
    const { result } = renderHook(() => useRecentSkills());
    act(() => {
      for (let i = 1; i <= 10; i++) result.current.pushRecent(`skill-${i}`);
    });
    expect(result.current.recentIds).toHaveLength(8);
    expect(result.current.recentIds[0]).toBe('skill-10');
    expect(result.current.recentIds).not.toContain('skill-1');
    expect(result.current.recentIds).not.toContain('skill-2');
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useRecentSkills());
    act(() => result.current.pushRecent('skill-x'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['skill-x']);
  });

  it('should load existing entries from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['skill-y', 'skill-z']));
    const { result } = renderHook(() => useRecentSkills());
    expect(result.current.recentIds).toEqual(['skill-y', 'skill-z']);
  });

  it('should fall back to empty array on malformed storage', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    const { result } = renderHook(() => useRecentSkills());
    expect(result.current.recentIds).toEqual([]);
  });

  it('should clear all entries', () => {
    const { result } = renderHook(() => useRecentSkills());
    act(() => {
      result.current.pushRecent('skill-a');
      result.current.clearRecent();
    });
    expect(result.current.recentIds).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([]));
  });
});
