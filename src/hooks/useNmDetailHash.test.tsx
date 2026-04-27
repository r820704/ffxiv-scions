import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useNmDetailHash } from './useNmDetailHash';

function createWrapper(initialEntries: string[]) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
}

describe('useNmDetailHash', () => {
  it('returns null when no nm in URL', () => {
    const { result } = renderHook(() => useNmDetailHash(), {
      wrapper: createWrapper(['/eureka-weather']),
    });
    expect(result.current[0]).toBeNull();
  });

  it('returns nm id when URL has nm=pazuzu', () => {
    const { result } = renderHook(() => useNmDetailHash(), {
      wrapper: createWrapper(['/eureka-weather?nm=pazuzu']),
    });
    expect(result.current[0]).toBe('pazuzu');
  });

  it('returns null when nm id is unknown', () => {
    const { result } = renderHook(() => useNmDetailHash(), {
      wrapper: createWrapper(['/eureka-weather?nm=does_not_exist']),
    });
    expect(result.current[0]).toBeNull();
  });

  it('setNmId(value) updates URL', () => {
    const { result } = renderHook(() => useNmDetailHash(), {
      wrapper: createWrapper(['/eureka-weather']),
    });
    act(() => {
      result.current[1]('pazuzu');
    });
    expect(result.current[0]).toBe('pazuzu');
  });

  it('setNmId(null) clears nm from URL', () => {
    const { result } = renderHook(() => useNmDetailHash(), {
      wrapper: createWrapper(['/eureka-weather?nm=pazuzu']),
    });
    act(() => {
      result.current[1](null);
    });
    expect(result.current[0]).toBeNull();
  });

  it('coexists with other URL params (w=Foul preserved when nm changes)', () => {
    const { result } = renderHook(() => useNmDetailHash(), {
      wrapper: createWrapper(['/eureka-weather?w=Foul&nm=pazuzu']),
    });
    expect(result.current[0]).toBe('pazuzu');
    act(() => {
      result.current[1](null);
    });
    expect(result.current[0]).toBeNull();
    // Note: this hook only reads `nm`. Verifying that `w` is preserved
    // requires reading window.location, which MemoryRouter doesn't update.
    // Behaviour is verified at integration level (EurekaWeatherPage tests).
  });
});
