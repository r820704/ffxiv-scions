import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorageBool } from './useLocalStorageBool';

describe('useLocalStorageBool', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorageBool('key1', false));
    expect(result.current[0]).toBe(false);
  });

  it('returns the stored value if "true" is in localStorage', () => {
    localStorage.setItem('key2', 'true');
    const { result } = renderHook(() => useLocalStorageBool('key2', false));
    expect(result.current[0]).toBe(true);
  });

  it('returns the stored value if "false" is in localStorage even when default is true', () => {
    localStorage.setItem('key3', 'false');
    const { result } = renderHook(() => useLocalStorageBool('key3', true));
    expect(result.current[0]).toBe(false);
  });

  it('persists changes to localStorage', () => {
    const { result } = renderHook(() => useLocalStorageBool('key4', false));
    act(() => result.current[1](true));
    expect(localStorage.getItem('key4')).toBe('true');
    expect(result.current[0]).toBe(true);
  });

  it('treats non-bool stored values as default', () => {
    localStorage.setItem('key5', 'garbage');
    const { result } = renderHook(() => useLocalStorageBool('key5', false));
    expect(result.current[0]).toBe(false);
  });
});
