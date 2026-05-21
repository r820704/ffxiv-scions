import { describe, it, expect } from 'vitest';
import { eurekaNmDrops, hasNotableDrops, getNotableDrops } from './eureka-nm-drops';
import { eurekaNms } from './eureka-nm-data';

describe('eurekaNmDrops', () => {
  it('every key matches an existing NM id', () => {
    const validIds = new Set(eurekaNms.map(n => n.id));
    for (const id of Object.keys(eurekaNmDrops)) {
      expect(validIds.has(id), `${id} must be a known NM id`).toBe(true);
    }
  });

  it('all drop entries have complete shape', () => {
    for (const [id, drops] of Object.entries(eurekaNmDrops)) {
      for (const d of drops) {
        expect(d.nameTw, `${id} drop missing nameTw`).toBeTruthy();
        expect(d.nameEn, `${id} drop missing nameEn`).toBeTruthy();
        expect([
          'accessory',
          'gear',
          'minion',
          'furniture',
          'card',
          'weapon-material',
          'logogram-manual',
          'crystal',
          'other',
        ]).toContain(d.kind);
        expect(typeof d.notable).toBe('boolean');
      }
    }
  });
});

describe('hasNotableDrops', () => {
  it('returns true when NM has ≥1 notable drop', () => {
    expect(hasNotableDrops('copycat-cassie')).toBe(true);
  });
  it('returns false for NMs without notable drops', () => {
    expect(hasNotableDrops('sabotender-corrido')).toBe(false);
  });
  it('returns false for unknown ids', () => {
    expect(hasNotableDrops('does-not-exist')).toBe(false);
  });
});

describe('getNotableDrops', () => {
  it('returns only notable drops for a known NM', () => {
    const drops = getNotableDrops('copycat-cassie');
    expect(drops.length).toBeGreaterThan(0);
    for (const d of drops) {
      expect(d.notable).toBe(true);
    }
  });

  it('returns empty array for NMs without notable drops', () => {
    expect(getNotableDrops('sabotender-corrido')).toEqual([]);
  });

  it('returns empty array for unknown ids', () => {
    expect(getNotableDrops('does-not-exist')).toEqual([]);
  });
});
