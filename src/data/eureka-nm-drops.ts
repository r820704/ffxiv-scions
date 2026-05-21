import type { NmDropItem } from '@/types/nm-drop';

// Source: ffxiv.consolegameswiki.com (per-NM FATE loot tables).
// TC names sourced from thewakingsands/ffxiv-datamining-tc Item.csv; fallback EN otherwise.
// See THIRD-PARTY-NOTICES for license details.
//
// Anemos drops audited 2026-05-21 against Item.csv (item IDs included as inline comments).
// Pagos/Pyros lieutenant accessories still use EN fallback pending audit.
// Excludes 常風水晶碎片 and 常風地帶上鎖的寶箱 per data design.
export const eurekaNmDrops: Record<string, NmDropItem[]> = {
  // Eureka Anemos — Lv 2 (the Lord of Anemos)
  'lord-of-anemos': [
    { nameTw: '常風王子', nameEn: 'the Prince of Anemos', kind: 'minion', notable: true }, // 21919
  ],

  // Eureka Anemos — Lv 4 (the Emperor of Anemos)
  'emperor-of-anemos': [
    { nameTw: '皇帝飛蟲的薄翼髮飾', nameEn: 'Emperor Hairpin', kind: 'accessory', notable: true }, // 22360
  ],

  // Eureka Anemos — Lv 11 (Serket)
  serket: [
    { nameTw: '毒蠍格鬥服', nameEn: 'Scorpion Harness', kind: 'gear', notable: true }, // 22358
    { nameTw: '米斯拉人偶', nameEn: 'Wind-up Mithra', kind: 'minion', notable: true }, // 21917
  ],

  // Eureka Anemos — Lv 15 (Simurgh's Strider)
  'simurghs-strider': [
    { nameTw: '闊步高筒靴', nameEn: 'Strider Boots', kind: 'gear', notable: true }, // 22359
  ],

  // Eureka Anemos — Lv 17 (Fafnir)
  fafnir: [
    { nameTw: '迷你法夫納', nameEn: 'Wind-up Fafnir', kind: 'minion', notable: true }, // 21918
  ],

  // Eureka Anemos — Lv 20 boss (Pazuzu)
  pazuzu: [
    { nameTw: '帕祖祖的羽毛', nameEn: "Pazuzu's Feather", kind: 'accessory', notable: true }, // 21802
    { nameTw: '帕祖祖的祭壇', nameEn: 'Altar to Pazuzu', kind: 'furniture', notable: true }, // 21852
    { nameTw: '九宮幻卡：帕祖祖', nameEn: 'Pazuzu Card', kind: 'card', notable: true }, // 23912
  ],

  // Eureka Pagos — Lv 36 boss (Blizzards weather)
  'copycat-cassie': [
    {
      nameTw: "Cassie's Earring",
      nameEn: "Cassie's Earring",
      kind: 'accessory',
      notable: true,
    },
  ],

  // Eureka Pyros — Lv 53 boss (Blizzards weather)
  skoll: [
    {
      nameTw: "Skoll's Tooth",
      nameEn: "Skoll's Tooth",
      kind: 'accessory',
      notable: true,
    },
  ],

  // Eureka Pyros — Lv 54 boss (Heat Waves weather)
  penthesilea: [
    {
      nameTw: "Penthesilea's Crown",
      nameEn: "Penthesilea's Crown",
      kind: 'accessory',
      notable: true,
    },
  ],
};

export function hasNotableDrops(nmId: string): boolean {
  const drops = eurekaNmDrops[nmId];
  return drops != null && drops.some(d => d.notable);
}

export function getNotableDrops(nmId: string): NmDropItem[] {
  const drops = eurekaNmDrops[nmId];
  return drops ? drops.filter(d => d.notable) : [];
}
