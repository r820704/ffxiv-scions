import { useState, useCallback } from 'react';
import { ALBUM_ORDER } from '@/data/album-order';

const LEARNED_KEY = 'eureka-album-learned';
const INVENTORY_KEY = 'eureka-album-inventory';

function loadLearned(): Set<string> {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLearned(set: Set<string>): void {
  localStorage.setItem(LEARNED_KEY, JSON.stringify([...set]));
}

function loadInventory(): Record<string, number> {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function saveInventory(inv: Record<string, number>): void {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
}

export function useAlbumState() {
  const [learnedSkills, setLearnedSkills] = useState<Set<string>>(loadLearned);
  const [inventory, setInventory] = useState<Record<string, number>>(loadInventory);

  const toggleLearned = useCallback((skillId: string) => {
    setLearnedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      saveLearned(next);
      return next;
    });
  }, []);

  const setItemCount = useCallback((itemId: string, count: number) => {
    setInventory((prev) => {
      const next = { ...prev, [itemId]: Math.max(0, count) };
      saveInventory(next);
      return next;
    });
  }, []);

  const learnAll = useCallback(() => {
    const all = new Set(ALBUM_ORDER);
    saveLearned(all);
    setLearnedSkills(all);
  }, []);

  const resetAll = useCallback(() => {
    const empty = new Set<string>();
    saveLearned(empty);
    setLearnedSkills(empty);
  }, []);

  return { learnedSkills, toggleLearned, learnAll, resetAll, inventory, setItemCount };
}
