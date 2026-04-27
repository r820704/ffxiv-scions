import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNmSearch } from './useNmSearch';

describe('useNmSearch', () => {
  it('returns empty array for empty query', () => {
    const { result } = renderHook(() => useNmSearch(''));
    expect(result.current).toEqual([]);
  });

  it('matches by Chinese name (substring)', () => {
    const { result } = renderHook(() => useNmSearch('帕祖祖'));
    expect(result.current.some((n) => n.id === 'pazuzu')).toBe(true);
  });

  it('matches by English name (case-insensitive)', () => {
    const { result } = renderHook(() => useNmSearch('PAZUZU'));
    expect(result.current.some((n) => n.id === 'pazuzu')).toBe(true);
  });

  it('matches by alias', () => {
    const { result } = renderHook(() => useNmSearch('Cassie'));
    expect(result.current.some((n) => n.id === 'copycat-cassie')).toBe(true);
  });

  it('matches partial / substring queries', () => {
    const { result } = renderHook(() => useNmSearch('ing'));
    // King Hazmat / King Igloo / King Arthro / King Goldemar / Snow Queen — multiple "King" / "Queen" matches
    expect(result.current.length).toBeGreaterThan(2);
  });

  it('returns empty array when no match', () => {
    const { result } = renderHook(() => useNmSearch('zzzqqqxxx'));
    expect(result.current).toEqual([]);
  });

  it('trims whitespace', () => {
    const { result } = renderHook(() => useNmSearch('   '));
    expect(result.current).toEqual([]);
  });
});
