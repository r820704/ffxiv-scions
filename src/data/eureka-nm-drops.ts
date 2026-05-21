import type { NmDropItem } from '@/types/nm-drop';

// Source: ffxiv.consolegameswiki.com (per-NM FATE loot tables).
// TC names sourced from thewakingsands/ffxiv-datamining-tc Item.csv (item IDs noted inline).
// See THIRD-PARTY-NOTICES for license details.
//
// Anemos/Pagos/Pyros/Hydatos drops audited 2026-05-21.
// Excludes: zone Crystal fragments, standard zone Lockboxes, Pyros 文理碎晶, Hydatos 豐水晶簇,
// per user data design. Some NMs (e.g. King Igloo, Holy Cow) only drop currency/lockbox and
// thus have no entry here.
//
// labelTw is the tooltip annotation rendered as '（labelTw）' after each name; '' suppresses parens.
export const eurekaNmDrops: Record<string, NmDropItem[]> = {
  // ========== Eureka Anemos ==========

  // Lv 2 (the Lord of Anemos)
  'lord-of-anemos': [
    { nameTw: '常風王子', nameEn: 'the Prince of Anemos', kind: 'minion', labelTw: '寵物', notable: true }, // 21919
  ],

  // Lv 4 (the Emperor of Anemos)
  'emperor-of-anemos': [
    { nameTw: '皇帝飛蟲的薄翼髮飾', nameEn: 'Emperor Hairpin', kind: 'accessory', labelTw: '防具', notable: true }, // 22360
  ],

  // Lv 11 (Serket)
  serket: [
    { nameTw: '毒蠍格鬥服', nameEn: 'Scorpion Harness', kind: 'gear', labelTw: '防具', notable: true }, // 22358
    { nameTw: '米斯拉人偶', nameEn: 'Wind-up Mithra', kind: 'minion', labelTw: '寵物', notable: true }, // 21917
  ],

  // Lv 15 (Simurgh's Strider)
  'simurghs-strider': [
    { nameTw: '闊步高筒靴', nameEn: 'Strider Boots', kind: 'gear', labelTw: '防具,城內衝刺效果時間延長10秒', notable: true }, // 22359
  ],

  // Lv 17 (Fafnir)
  fafnir: [
    { nameTw: '迷你法夫納', nameEn: 'Wind-up Fafnir', kind: 'minion', labelTw: '寵物', notable: true }, // 21918
  ],

  // Lv 20 boss (Pazuzu)
  pazuzu: [
    { nameTw: '帕祖祖的羽毛', nameEn: "Pazuzu's Feather", kind: 'accessory', labelTw: '素材', notable: true }, // 21802
    { nameTw: '帕祖祖的祭壇', nameEn: 'Altar to Pazuzu', kind: 'furniture', labelTw: '家具', notable: true }, // 21852
    { nameTw: '九宮幻卡：帕祖祖', nameEn: 'Pazuzu Card', kind: 'card', labelTw: '', notable: true }, // 23912
  ],

  // ========== Eureka Pagos ==========

  // Lv 20 (the Snow Queen)
  'snow-queen': [
    { nameTw: '九宮幻卡：雪童子', nameEn: 'Yukinko Card', kind: 'card', labelTw: '', notable: true }, // 23046
  ],

  // Lv 26 (Hakutaku)
  hakutaku: [
    { nameTw: '視覺尖角帽', nameEn: 'Optical Hat', kind: 'accessory', labelTw: '防具, 優雷卡專用效果, 滿足條件才會掉落', notable: true }, // 22974
  ],

  // Lv 30 (King Arthro)
  'king-arthro': [
    { nameTw: '閃襲指環', nameEn: 'Blitzring', kind: 'accessory', labelTw: '戒指, 優雷卡專用效果', notable: true }, // 36121
  ],

  // Lv 33 (Hadhayosh)
  hadhayosh: [
    { nameTw: '凶惡巨獸之角', nameEn: 'Behemoth Horn', kind: 'other', labelTw: '素材', notable: true }, // 6155
    { nameTw: '凶惡巨獸的毛皮', nameEn: 'Behemoth Pelt', kind: 'other', labelTw: '素材', notable: true }, // 23342
  ],

  // Lv 36 (Copycat Cassie)
  'copycat-cassie': [
    { nameTw: '凱西耳墜', nameEn: 'Cassie Earring', kind: 'accessory', labelTw: '耳飾, 優雷卡專用效果', notable: true }, // 22973
  ],

  // Lv 37 (Louhi)
  louhi: [
    { nameTw: '婁希的冰片', nameEn: "Louhi's Ice", kind: 'other', labelTw: '素材', notable: true }, // 22975
    { nameTw: '九宮幻卡：婁希', nameEn: 'Louhi Card', kind: 'card', labelTw: '', notable: true }, // 23050
  ],

  // ========== Eureka Pyros ==========

  // Lv 41 (Graffiacane)
  graffiacane: [
    { nameTw: '卡爾克', nameEn: 'Calca', kind: 'minion', labelTw: '寵物', notable: true }, // 14098
  ],

  // Lv 48 (Lamebrix Strikebocks)
  'lamebrix-strikebocks': [
    { nameTw: '雷姆普里克斯骰子', nameEn: "Lamebrix's Dice", kind: 'other', labelTw: '火島三寶', notable: true }, // 24285
  ],

  // Lv 50 (Lumber Jack)
  'lumber-jack': [
    { nameTw: '艾爾凡人偶', nameEn: 'Wind-up Elvaan', kind: 'minion', labelTw: '寵物', notable: true }, // 24000
  ],

  // Lv 52 (Ying-Yang)
  'ying-yang': [
    { nameTw: '陰·陽的皮膜', nameEn: "Ying-Yang's Tissue", kind: 'other', labelTw: '火島三寶', notable: true }, // 24286
  ],

  // Lv 53 (Skoll)
  skoll: [
    { nameTw: '斯庫爾的牙', nameEn: "Skoll's Claw", kind: 'other', labelTw: '火島三寶', notable: true }, // 24287
  ],

  // Lv 54 (Penthesilea)
  penthesilea: [
    { nameTw: '九宮幻卡：彭忒西勒亞', nameEn: 'Penthesilea Card', kind: 'card', labelTw: '', notable: true }, // 23913
    { nameTw: '彭忒西勒亞的火種', nameEn: "Penthesilea's Flame", kind: 'other', labelTw: '素材', notable: true }, // 24123
  ],

  // ========== Eureka Hydatos ==========

  // Lv 57 (Molech)
  molech: [
    { nameTw: '摩洛的角', nameEn: "Molech's Horn", kind: 'other', labelTw: '水島三寶', notable: true }, // 24817
  ],

  // Lv 61 (King Goldemar)
  'king-goldemar': [
    { nameTw: '戈爾德馬爾的角', nameEn: "Goldemar's Horn", kind: 'other', labelTw: '水島三寶', notable: true }, // 24818
    { nameTw: '九宮幻卡：矮儒', nameEn: 'Dvergr Card', kind: 'card', labelTw: '', notable: true }, // 24870
  ],

  // Lv 64 (Ceto)
  ceto: [
    { nameTw: '刻托的爪子', nameEn: "Ceto's Claw", kind: 'other', labelTw: '水島三寶', notable: true }, // 24819
  ],

  // Lv 65 (Provenance Watcher)
  'provenance-watcher': [
    { nameTw: '水晶龍之鱗', nameEn: 'Crystalline Scale', kind: 'other', labelTw: '素材', notable: true }, // 24806
    { nameTw: '九宮幻卡：起源守望者', nameEn: 'Provenance Watcher Card', kind: 'card', labelTw: '', notable: true }, // 24873
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
