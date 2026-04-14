import { useState, useCallback } from 'react';

const SLOTS_KEY = 'eureka-skill-slots';

export type SkillSlotRow = [string | null, string | null];
export type SkillSlots = SkillSlotRow[];

const EMPTY_SLOTS: SkillSlots = Array.from({ length: 6 }, () => [null, null]);

function loadSlots(): SkillSlots {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (!raw) return EMPTY_SLOTS.map(row => [...row]);
    const parsed = JSON.parse(raw) as SkillSlots;
    if (!Array.isArray(parsed) || parsed.length !== 6) return EMPTY_SLOTS.map(row => [...row]);
    return parsed;
  } catch {
    return EMPTY_SLOTS.map(row => [...row]);
  }
}

function saveSlots(slots: SkillSlots): void {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
}

export function useSkillSlots() {
  const [slots, setSlots] = useState<SkillSlots>(loadSlots);

  const setSlot = useCallback((row: number, col: 0 | 1, skillId: string | null) => {
    setSlots((prev) => {
      const next = prev.map(r => [...r] as SkillSlotRow);
      next[row]![col] = skillId;
      saveSlots(next);
      return next;
    });
  }, []);

  const clearSlot = useCallback((row: number, col: 0 | 1) => {
    setSlot(row, col, null);
  }, [setSlot]);

  const resetSlots = useCallback(() => {
    const empty = EMPTY_SLOTS.map(row => [...row]) as SkillSlots;
    saveSlots(empty);
    setSlots(empty);
  }, []);

  return { slots, setSlot, clearSlot, resetSlots };
}
