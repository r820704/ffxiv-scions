import type { NmDropItem } from '@/types/nm-drop';

// Source: ffxiv.consolegameswiki.com (per-NM drop tables) + community references.
// TC names sourced from thewakingsands/ffxiv-datamining-tc Item.csv where verifiable; fallback EN otherwise.
// See THIRD-PARTY-NOTICES for license details.
//
// MVP scope: only entries with high-confidence NM ids (verified against eureka-nm-data.ts)
// and well-documented iconic drops are included. Per CLAUDE.md rule
// "若拆包資料中尚無該詞的繁中翻譯，不要使用，等官方資料更新後再加入",
// nameTw is set equal to nameEn until the user audits each entry against Item.csv.
// User will audit + populate proper TC names.
export const eurekaNmDrops: Record<string, NmDropItem[]> = {
  // Eureka Anemos — Lv 20 boss
  pazuzu: [
    {
      nameTw: "Pazuzu's Feather",
      nameEn: "Pazuzu's Feather",
      kind: 'accessory',
      notable: true,
    },
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
