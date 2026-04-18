import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlotState } from './useSlotState';

const STORAGE_KEY = 'eureka-slot-config';

beforeEach(() => {
  localStorage.clear();
});

describe('useSlotState', () => {
  it('should initialize with 8 empty slots', () => {
    const { result } = renderHook(() => useSlotState());
    expect(result.current.slotConfig).toHaveLength(8);
    for (const slot of result.current.slotConfig) {
      expect(slot).toEqual([null, null]);
    }
    expect(result.current.selectedSlot).toBeNull();
  });

  it('should add a skill to an empty slot', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(0));
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));
    expect(result.current.slotConfig[0]).toEqual(['wisdom-aetherweaver', null]);
  });

  it('should add a second skill to a slot with one skill', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(0));
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));
    act(() => result.current.addSkillToSelected('wisdom-martialist'));
    expect(result.current.slotConfig[0]).toEqual(['wisdom-aetherweaver', 'wisdom-martialist']);
  });

  it('should not add a third skill to a full slot', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(0));
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));
    act(() => result.current.addSkillToSelected('wisdom-martialist'));
    act(() => result.current.addSkillToSelected('wisdom-guardian'));
    expect(result.current.slotConfig[0]).toEqual(['wisdom-aetherweaver', 'wisdom-martialist']);
  });

  it('should clear a slot', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(0));
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));
    act(() => result.current.clearSlot(0));
    expect(result.current.slotConfig[0]).toEqual([null, null]);
  });

  it('should toggle slot selection', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(2));
    expect(result.current.selectedSlot).toBe(2);
    act(() => result.current.selectSlot(2));
    expect(result.current.selectedSlot).toBeNull();
  });

  it('should switch selection to a different slot', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(2));
    act(() => result.current.selectSlot(5));
    expect(result.current.selectedSlot).toBe(5);
  });

  it('should auto-select first empty slot when no slot is selected', () => {
    const { result } = renderHook(() => useSlotState());
    // No slot selected, addSkillToSelected should auto-select slot 0
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));
    expect(result.current.slotConfig[0]).toEqual(['wisdom-aetherweaver', null]);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(0));
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0]).toEqual(['wisdom-aetherweaver', null]);
  });

  it('should restore from localStorage', () => {
    const saved: [string | null, string | null][] = Array.from({ length: 8 }, () => [null, null]);
    saved[3] = ['wisdom-guardian', 'wisdom-ordained'];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const { result } = renderHook(() => useSlotState());
    expect(result.current.slotConfig[3]).toEqual(['wisdom-guardian', 'wisdom-ordained']);
  });

  it('should provide usedSkillIds computed from config', () => {
    const { result } = renderHook(() => useSlotState());
    act(() => result.current.selectSlot(0));
    act(() => result.current.addSkillToSelected('wisdom-aetherweaver'));
    act(() => result.current.selectSlot(1));
    act(() => result.current.addSkillToSelected('wisdom-guardian'));
    expect(result.current.usedSkillIds).toEqual(
      new Set(['wisdom-aetherweaver', 'wisdom-guardian'])
    );
  });
});
