import { describe, it, expect } from 'vitest';
import { filterGear } from './eureka-gear-filter';
import type { EurekaGearItem, GearFilterState } from '@/types/eureka-gear';

function mk(p: Partial<EurekaGearItem>): EurekaGearItem {
  return {
    id: 1, name: '', iconId: 0, stage: 'anemos', slot: 'weapon', jobs: [],
    itemLevel: 0,
    source: { npcId: 0, npcName: 'NPC', zone: '', specialShopId: 0 },
    cost: { materials: [] }, tags: [],
    ...p,
  };
}

function baseFilter(overrides: Partial<GearFilterState> = {}): GearFilterState {
  return {
    search: '',
    stages: new Set(),
    slots: new Set(),
    jobs: new Set(),
    tags: new Set(),
    display: 'all',
    sort: 'stage',
    ...overrides,
  };
}

describe('filterGear', () => {
  const items = [
    mk({ id: 1, name: '嘉拉汀·常風', stage: 'anemos', slot: 'weapon', jobs: ['SAM'] }),
    mk({ id: 2, name: '常風頭冠',   stage: 'anemos', slot: 'head',   jobs: ['PLD'] }),
    mk({ id: 3, name: '湧火長劍',   stage: 'pyros',  slot: 'weapon', jobs: ['PLD','WAR'] }),
  ];

  it('returns all items under empty filter', () => {
    expect(filterGear(items, baseFilter(), {}, {}).length).toBe(3);
  });

  it('filters by stage', () => {
    const f = baseFilter({ stages: new Set(['pyros']) });
    expect(filterGear(items, f, {}, {}).map((i) => i.id)).toEqual([3]);
  });

  it('filters by slot', () => {
    const f = baseFilter({ slots: new Set(['head']) });
    expect(filterGear(items, f, {}, {}).map((i) => i.id)).toEqual([2]);
  });

  it('filters by job (any match)', () => {
    const f = baseFilter({ jobs: new Set(['PLD']) });
    expect(filterGear(items, f, {}, {}).map((i) => i.id).sort()).toEqual([2, 3]);
  });

  it('search matches item name substring', () => {
    expect(filterGear(items, baseFilter({ search: '頭冠' }), {}, {}).map((i) => i.id)).toEqual([2]);
  });

  it('display=affordable keeps only items inventory covers', () => {
    const items2 = [
      mk({ id: 1, cost: { materials: [{ materialId: 9, quantity: 3 }] } }),
      mk({ id: 2, cost: { materials: [{ materialId: 9, quantity: 99 }] } }),
    ];
    const f = baseFilter({ display: 'affordable' });
    expect(filterGear(items2, f, { 9: 5 }, {}).map((i) => i.id)).toEqual([1]);
  });

  it('display=unowned excludes owned', () => {
    const f = baseFilter({ display: 'unowned' });
    expect(filterGear(items, f, {}, { 1: true }).map((i) => i.id).sort()).toEqual([2, 3]);
  });

  it('display=owned keeps only owned', () => {
    const f = baseFilter({ display: 'owned' });
    expect(filterGear(items, f, {}, { 2: true }).map((i) => i.id)).toEqual([2]);
  });

  it('sort=stage orders by stage index', () => {
    const f = baseFilter({ sort: 'stage' });
    expect(filterGear(items, f, {}, {}).map((i) => i.stage)).toEqual(['anemos', 'anemos', 'pyros']);
  });

  it('sort=npc orders by npc name', () => {
    const byNpc = [
      mk({ id: 1, source: { npcId: 1, npcName: '乙', zone: '', specialShopId: 0 } }),
      mk({ id: 2, source: { npcId: 2, npcName: '甲', zone: '', specialShopId: 0 } }),
    ];
    const f = baseFilter({ sort: 'npc' });
    expect(filterGear(byNpc, f, {}, {}).map((i) => i.id)).toEqual([2, 1]);
  });
});
