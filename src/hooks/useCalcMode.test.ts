import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalcMode } from './useCalcMode';

const STORAGE_KEY = 'eureka-calc-mode';

beforeEach(() => {
  localStorage.clear();
});

describe('useCalcMode', () => {
  it('should default to album when no value stored', () => {
    const { result } = renderHook(() => useCalcMode());
    expect(result.current.calcMode).toBe('album');
  });

  it('should restore from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'slots');
    const { result } = renderHook(() => useCalcMode());
    expect(result.current.calcMode).toBe('slots');
  });

  it('should persist on change', () => {
    const { result } = renderHook(() => useCalcMode());
    act(() => result.current.setCalcMode('slots'));
    expect(result.current.calcMode).toBe('slots');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('slots');
  });

  it('should fallback to album when stored value is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'bogus');
    const { result } = renderHook(() => useCalcMode());
    expect(result.current.calcMode).toBe('album');
  });
});
