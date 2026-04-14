// src/__tests__/album-helpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeCrystalNeeds,
  computeRemainingCost,
  LOGOGRAM_FIXED_ORDER,
} from '@/utils/album-helpers';
import { eurekaData } from '@/data/eureka-data';
import { ALBUM_ORDER } from '@/data/album-order';
import type { LogogramPrice } from '@/types/eureka';

describe('LOGOGRAM_FIXED_ORDER', () => {
  it('should contain all logogram IDs from eurekaData', () => {
    const allLogogramIds = eurekaData.logograms.map((l) => l.id);
    expect(LOGOGRAM_FIXED_ORDER).toEqual(allLogogramIds);
  });

  it('should have exactly 9 entries', () => {
    expect(LOGOGRAM_FIXED_ORDER).toHaveLength(9);
  });
});

describe('ALBUM_ORDER', () => {
  it('should contain exactly 56 entries', () => {
    expect(ALBUM_ORDER).toHaveLength(56);
  });

  it('should contain only valid logosAction IDs', () => {
    const validIds = new Set(eurekaData.logosActions.map((a) => a.id));
    for (const id of ALBUM_ORDER) {
      expect(validIds.has(id), `${id} not found in logosActions`).toBe(true);
    }
  });
});

describe('computeCrystalNeeds', () => {
  it('should return zero needs when all skills are learned', () => {
    const allLearned = new Set(ALBUM_ORDER);
    const needs = computeCrystalNeeds(allLearned);
    for (const id of LOGOGRAM_FIXED_ORDER) {
      expect(needs[id]).toBe(0);
    }
  });

  it('should return total needs when no skills are learned', () => {
    const noneLearned = new Set<string>();
    const needs = computeCrystalNeeds(noneLearned);
    const totalNeeds = Object.values(needs).reduce((a, b) => a + b, 0);
    expect(totalNeeds).toBeGreaterThan(0);
  });

  it('should aggregate mneme needs to logogram level', () => {
    const needs = computeCrystalNeeds(new Set());
    // All keys should be logogram IDs, not mneme IDs
    for (const key of Object.keys(needs)) {
      expect(LOGOGRAM_FIXED_ORDER).toContain(key);
    }
  });

  it('should exclude learned skills from needs', () => {
    const allLearned = new Set(ALBUM_ORDER);
    const oneLearned = new Set([ALBUM_ORDER[0]!]);
    const needsAll = computeCrystalNeeds(allLearned);
    const needsOne = computeCrystalNeeds(oneLearned);
    const needsNone = computeCrystalNeeds(new Set());
    const totalAll = Object.values(needsAll).reduce((a, b) => a + b, 0);
    const totalOne = Object.values(needsOne).reduce((a, b) => a + b, 0);
    const totalNone = Object.values(needsNone).reduce((a, b) => a + b, 0);
    expect(totalAll).toBe(0);
    expect(totalOne).toBeLessThan(totalNone);
  });
});

describe('computeRemainingCost', () => {
  const mockPrices: LogogramPrice[] = eurekaData.logograms.map((l) => ({
    itemId: l.itemId,
    price: 1000,
    worldName: 'TestWorld',
    lastUpdated: Date.now(),
    listings: [{ pricePerUnit: 1000, quantity: 999, worldName: 'TestWorld' }],
  }));

  it('should return 0 when all skills learned', () => {
    const allLearned = new Set(ALBUM_ORDER);
    const cost = computeRemainingCost(allLearned, {}, mockPrices);
    expect(cost).toBe(0);
  });

  it('should deduct inventory from cost (inventory keyed by logogram ID)', () => {
    const learned = new Set<string>();
    const noInv = computeRemainingCost(learned, {}, mockPrices);
    const fullInv: Record<string, number> = {};
    LOGOGRAM_FIXED_ORDER.forEach((id) => { fullInv[id] = 999; });
    const withInv = computeRemainingCost(learned, fullInv, mockPrices);
    expect(withInv).toBe(0);
    expect(noInv).toBeGreaterThan(0);
  });

  it('should return null when prices unavailable', () => {
    const cost = computeRemainingCost(new Set(), {}, []);
    expect(cost).toBeNull();
  });
});


