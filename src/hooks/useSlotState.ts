import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'eureka-slot-config';
const SLOT_COUNT = 8;

type SlotEntry = [string | null, string | null];

function createEmptyConfig(): SlotEntry[] {
  return Array.from({ length: SLOT_COUNT }, (): SlotEntry => [null, null]);
}

function loadConfig(): SlotEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyConfig();
    const parsed = JSON.parse(raw) as SlotEntry[];
    if (!Array.isArray(parsed) || parsed.length !== SLOT_COUNT) return createEmptyConfig();
    return parsed;
  } catch {
    return createEmptyConfig();
  }
}

function saveConfig(config: SlotEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function useSlotState() {
  const [slotConfig, setSlotConfig] = useState<SlotEntry[]>(loadConfig);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const selectSlot = useCallback((index: number) => {
    setSelectedSlot((prev) => (prev === index ? null : index));
  }, []);

  const addSkillToSelected = useCallback((skillId: string) => {
    setSlotConfig((prev) => {
      const targetIdx = selectedSlot ?? prev.findIndex(([a, b]) => a === null || b === null);
      if (targetIdx < 0 || targetIdx >= SLOT_COUNT) return prev;
      const slot = prev[targetIdx]!;
      let newSlot: SlotEntry;
      if (slot[0] === null) {
        newSlot = [skillId, null];
      } else if (slot[1] === null) {
        newSlot = [slot[0], skillId];
      } else {
        return prev; // full
      }
      const next = [...prev];
      next[targetIdx] = newSlot;
      saveConfig(next);
      return next;
    });
  }, [selectedSlot]);

  const clearSlot = useCallback((index: number) => {
    setSlotConfig((prev) => {
      const next = [...prev];
      next[index] = [null, null];
      saveConfig(next);
      return next;
    });
    setSelectedSlot((prev) => (prev === index ? null : prev));
  }, []);

  const resetAllSlots = useCallback(() => {
    const empty = createEmptyConfig();
    saveConfig(empty);
    setSlotConfig(empty);
    setSelectedSlot(null);
  }, []);

  const usedSkillIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [a, b] of slotConfig) {
      if (a) ids.add(a);
      if (b) ids.add(b);
    }
    return ids;
  }, [slotConfig]);

  return {
    slotConfig,
    selectedSlot,
    selectSlot,
    addSkillToSelected,
    clearSlot,
    resetAllSlots,
    usedSkillIds,
  };
}
