import { describe, it, expect, afterEach } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useUrlSelectedWeathers } from './useUrlSelectedWeathers';
import { NIGHT_FILTER_KEY } from '@/data/eureka-nm-data';
import type { ReactNode } from 'react';

afterEach(cleanup);

function makeWrapper(initialEntry: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
}

describe('useUrlSelectedWeathers', () => {
  it('returns an empty Set when ?w= is missing', () => {
    const { result } = renderHook(() => useUrlSelectedWeathers(), {
      wrapper: makeWrapper('/eureka-weather'),
    });
    expect(result.current[0].size).toBe(0);
  });

  it('parses comma-separated weathers from ?w=', () => {
    const { result } = renderHook(() => useUrlSelectedWeathers(), {
      wrapper: makeWrapper('/eureka-weather?w=Fog,Blizzards'),
    });
    expect(result.current[0]).toEqual(new Set(['Fog', 'Blizzards']));
  });

  it('translates "night" token to NIGHT_FILTER_KEY internally', () => {
    const { result } = renderHook(() => useUrlSelectedWeathers(), {
      wrapper: makeWrapper('/eureka-weather?w=night'),
    });
    expect(result.current[0]).toEqual(new Set([NIGHT_FILTER_KEY]));
  });

  it('translates NIGHT_FILTER_KEY back to "night" when writing', () => {
    const { result } = renderHook(() => useUrlSelectedWeathers(), {
      wrapper: makeWrapper('/eureka-weather'),
    });
    act(() => {
      result.current[1](new Set([NIGHT_FILTER_KEY, 'Fog']));
    });
    // After update, internal Set should still contain NIGHT_FILTER_KEY
    expect(result.current[0].has(NIGHT_FILTER_KEY)).toBe(true);
    expect(result.current[0].has('Fog')).toBe(true);
  });

  it('removes the ?w= param when set to empty', () => {
    const { result } = renderHook(() => useUrlSelectedWeathers(), {
      wrapper: makeWrapper('/eureka-weather?w=Fog'),
    });
    expect(result.current[0].has('Fog')).toBe(true);
    act(() => {
      result.current[1](new Set());
    });
    expect(result.current[0].size).toBe(0);
  });
});
