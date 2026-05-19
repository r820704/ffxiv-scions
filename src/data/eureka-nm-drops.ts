import type { NmDropItem } from '@/types/nm-drop';

// Source: ffxiv.consolegameswiki.com (per-NM drop tables) + community references.
// TC names sourced from thewakingsands/ffxiv-datamining-tc Item.csv where verifiable; fallback EN otherwise.
// See THIRD-PARTY-NOTICES for license details.
//
// MVP scope: only entries with high-confidence NM ids (verified against eureka-nm-data.ts)
// and well-documented iconic drops are included. User will audit and expand.
export const eurekaNmDrops: Record<string, NmDropItem[]> = {
  // Eureka Anemos — Lv 20 boss
  pazuzu: [
    {
      nameTw: "帕祖祖之羽",
      nameEn: "Pazuzu's Feather",
      kind: 'accessory',
      notable: true,
    },
  ],

  // Eureka Pagos — Lv 36 boss (Blizzards weather)
  'copycat-cassie': [
    {
      nameTw: "凱西耳環",
      nameEn: "Cassie's Earring",
      kind: 'accessory',
      notable: true,
    },
  ],

  // Eureka Pyros — Lv 53 boss (Blizzards weather)
  skoll: [
    {
      nameTw: "斯庫爾之牙",
      nameEn: "Skoll's Tooth",
      kind: 'accessory',
      notable: true,
    },
  ],

  // Eureka Pyros — Lv 54 boss (Heat Waves weather)
  penthesilea: [
    {
      nameTw: "彭忒西勒亞之冠",
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
