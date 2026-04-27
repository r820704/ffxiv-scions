// Source: ffxiv.consolegameswiki.com / FFXIV community Eureka guides.
// See THIRD-PARTY-NOTICES.md for license details.
//
// Manual data: trigger mob attributes (level + time-of-day + race) for Eureka NM trigger mobs.
// Keyed by the mob's English name as it appears in eureka-nm-spawn-data.ts.
//
// Spawn weather of the trigger mob can be derived from the NM's own trigger weather
// (the mob only appears under the same weather), so no separate weather field here.
//
// Race is the broad classification from each mob's consolegameswiki page (e.g. Voidsent,
// Beastkin, Elemental). Where the wiki only lists a specific family without a broader
// race (e.g. "Megalocrab", "Minotaur", "Matanga", "Dragon", "Vouivre", "Ahriman",
// "Chimera"), we record that value as-is — it doubles as both race and family on the
// wiki for those entries. Empty/undefined when consolegameswiki lists "no race specified".

export interface TriggerMobAttrs {
  nameTw: string;  // Traditional Chinese name from datamining-tc
  level: number;
  timeOfDay?: 'day' | 'night';
  race?: string; // English race/family name from consolegameswiki (for future icon mapping)
}

export const triggerMobAttrs: Record<string, TriggerMobAttrs> = {
  // ===== Anemos (Lv 1-20) =====

  // Sabotender Corrido — /wiki/Flowering_Sabotender (Eureka Anemos entry on /wiki/The_Forbidden_Land,_Eureka_Anemos)
  // Mob page /wiki/Flowering_Sabotender describes the Southern Thanalan variant; Anemos zone-page table lists Lv 6.
  "Flowering Sabotender": { nameTw: "開花仙人掌怪", level: 6, race: 'Seedkin' },

  // The Lord of Anemos — /wiki/Sea_Bishop
  "Sea Bishop": { nameTw: "海祭司", level: 7, race: 'Wavekin' },

  // Teles — /wiki/Anemos_Harpeia
  "Anemos Harpeia": { nameTw: "常風哈佩亞鳥妖", level: 8, race: 'Cloudkin' },

  // The Emperor of Anemos — /wiki/Darner
  "Darner": { nameTw: "晏蜓", level: 9, race: 'Vilekin' },

  // Callisto — /wiki/Val_Bear
  "Val Bear": { nameTw: "瓦爾巨熊", level: 10, race: 'Beastkin' },

  // Number — /wiki/Pneumaflayer
  "Pneumaflayer": { nameTw: "奪靈魔", level: 11, race: 'Voidsent' },

  // Jahannam — /wiki/Typhoon_Sprite (NM trigger weather: Gales)
  "Typhoon Sprite": { nameTw: "颱風元精", level: 12, race: 'Elemental' },

  // Amemet — /wiki/Abraxas_(Enemy)
  "Abraxas": { nameTw: "阿蔔拉克薩斯", level: 13, race: 'Scalekin' },

  // Caym — /wiki/Stalker_Ziz
  "Stalker Ziz": { nameTw: "追蹤席茲", level: 14, race: 'Scalekin' },

  // Bombadeel — /wiki/Traveling_Gourmand
  "Traveling Gourmand": { nameTw: "古老貪吃鬼", level: 15, timeOfDay: 'night', race: 'Ashkin' },

  // Serket — /wiki/Khor_Claw (consolegameswiki lists no race for this enemy)
  "Khor Claw": { nameTw: "河道巨鉗蝦", level: 16 },

  // Judgmental Julika — /wiki/Henbane
  "Henbane": { nameTw: "天仙子", level: 17, race: 'Seedkin' },

  // The White Rider — /wiki/Duskfall_Dullahan
  "Duskfall Dullahan": { nameTw: "黃昏無頭騎士", level: 18, timeOfDay: 'night', race: 'Soulkin' },

  // Polyphemus — /wiki/Monoeye
  "Monoeye": { nameTw: "獨眼怪", level: 19, race: 'Spoken' },

  // Simurgh's Strider — /wiki/Old_World_Zu
  "Old World Zu": { nameTw: "舊世界祖", level: 20, race: 'Cloudkin' },

  // King Hazmat — /wiki/Anemos_Anala
  "Anemos Anala": { nameTw: "常風阿那羅", level: 21, race: 'Elemental' },

  // Fafnir — /wiki/Fossil_Dragon
  "Fossil Dragon": { nameTw: "龍化石", level: 22, timeOfDay: 'night', race: 'Ashkin' },

  // Amarok — /wiki/Voidscale (consolegameswiki lists no race for this enemy)
  "Voidscale": { nameTw: "虛無鱗龍", level: 23 },

  // Lamashtu — /wiki/Val_Specter
  "Val Specter": { nameTw: "瓦爾妖影", level: 24, timeOfDay: 'night', race: 'Ashkin' },

  // Pazuzu — /wiki/Shadow_Wraith
  "Shadow Wraith": { nameTw: "暗影幽靈", level: 25, timeOfDay: 'night', race: 'Ashkin' },

  // ===== Pagos (Lv 20-35) =====

  // The Snow Queen — /wiki/Yukinko_(Enemy)
  "Yukinko": { nameTw: "雪童子", level: 25, race: 'Seedkin' },

  // Taxim — /wiki/Demon_of_the_Incunable
  // Mob page lists Lv 27; zone page lists Lv 26 — preferring mob page per source-priority rule.
  "Demon of the Incunable": { nameTw: "珍卷惡魔", level: 27, timeOfDay: 'night', race: 'Voidsent' },

  // Ash Dragon — /wiki/Blood_Demon
  "Blood Demon": { nameTw: "血魔", level: 27, race: 'Voidsent' },

  // Glavoid — /wiki/Val_Worm
  "Val Worm": { nameTw: "瓦爾蠕蟲", level: 28, race: 'Vilekin' },

  // Anapos — /wiki/Snowmelt_Sprite (NM trigger weather: Fog)
  // Mob page lists Lv 28; zone page lists Lv 29 — preferring mob page per source-priority rule.
  "Snowmelt Sprite": { nameTw: "融雪元精", level: 28, race: 'Elemental' },

  // Hakutaku — /wiki/Blubber_Eyes
  "Blubber Eyes": { nameTw: "啜泣百目妖", level: 30, race: 'Voidsent' },

  // King Igloo — /wiki/Huwasi
  "Huwasi": { nameTw: "胡瓦西", level: 31, race: 'Soulkin' },

  // Asag — /wiki/Wandering_Opken
  "Wandering Opken": { nameTw: "徘徊歐浦肯", level: 32, race: 'Spoken' },

  // Surabhi — /wiki/Pagos_Billygoat
  "Pagos Billygoat": { nameTw: "恆冰公山羊", level: 33, race: 'Beastkin' },

  // King Arthro — /wiki/Val_Snipper (NM trigger weather: Fog)
  "Val Snipper": { nameTw: "瓦爾利螯陸蟹", level: 34, race: 'Megalocrab' },

  // Mindertaur, Eldertaur — /wiki/Lab_Minotaur
  "Lab Minotaur": { nameTw: "研究所米諾陶洛斯", level: 35, race: 'Minotaur' },

  // Holy Cow — /wiki/Elder_Buffalo
  "Elder Buffalo": { nameTw: "古老水牛", level: 36, race: 'Beastkin' },

  // Hadhayosh — /wiki/Lesser_Void_Dragon (NM trigger weather: Thunder)
  "Lesser Void Dragon": { nameTw: "虛無小龍", level: 37, race: 'Dragon' },

  // Horus — /wiki/Void_Vouivre (NM trigger weather: Heat Waves)
  "Void Vouivre": { nameTw: "虛無薇薇爾飛龍", level: 38, race: 'Vouivre' },

  // Arch Angra Mainyu — /wiki/Gawper
  "Gawper": { nameTw: "瞪視之眼", level: 39, race: 'Ahriman' },

  // Louhi — /wiki/Val_Corpse
  // Mob page lists Lv 39; zone page lists Lv 40 — preferring mob page per source-priority rule.
  "Val Corpse": { nameTw: "瓦爾腐屍", level: 39, timeOfDay: 'night', race: 'Ashkin' },

  // Copycat Cassie — /wiki/Ameretat (NM trigger weather: Blizzards)
  "Ameretat": { nameTw: "阿米雷戴", level: 40, race: 'Seedkin' },

  // ===== Pyros (Lv 35-50) =====

  // Leucosia — /wiki/Pyros_Bhoot
  // Mob page lists Lv 38; zone page lists Lv 40 — preferring mob page per source-priority rule.
  "Pyros Bhoot": { nameTw: "湧火浮靈", level: 38, timeOfDay: 'night', race: 'Ashkin' },

  // Flauros — /wiki/Thunderstorm_Sprite (NM trigger weather: Thunder)
  "Thunderstorm Sprite": { nameTw: "雷暴元精", level: 41, race: 'Elemental' },

  // The Sophist — /wiki/Pyros_Apanda
  "Pyros Apanda": { nameTw: "湧火阿班達", level: 42, race: 'Voidsent' },

  // Graffiacane — /wiki/Valking
  "Valking": { nameTw: "瓦爾維京人偶", level: 43, race: 'Soulkin' },

  // Askalaphos — /wiki/Overdue_Tome (NM trigger weather: Umbral Wind)
  "Overdue Tome": { nameTw: "過期魔導書", level: 44, race: 'Soulkin' },

  // Grand Duke Batym — /wiki/Dark_Troubadour
  "Dark Troubadour": { nameTw: "暗黑行吟者", level: 45, timeOfDay: 'night', race: 'Voidsent' },

  // Aetolus — /wiki/Islandhander
  "Islandhander": { nameTw: "瓦爾獨爪妖禽", level: 46, race: 'Cloudkin' },

  // Lesath — /wiki/Bird_Eater
  "Bird Eater": { nameTw: "食鳥者", level: 47, race: 'Vilekin' },

  // Eldthurs — /wiki/Pyros_Crab
  "Pyros Crab": { nameTw: "湧火陸蟹", level: 48, race: 'Scalekin' },

  // Iris — /wiki/Northern_Swallow
  "Northern Swallow": { nameTw: "北境鹽藍燕", level: 49, race: 'Wavekin' },

  // Lamebrix Strikebocks — /wiki/Illuminati_Escapee
  "Illuminati Escapee": { nameTw: "青藍之手逃亡者", level: 50, race: 'Chimera' },

  // Dux — /wiki/Matanga_Castaway (NM trigger weather: Thunder)
  "Matanga Castaway": { nameTw: "遺棄象魔", level: 51, race: 'Matanga' },

  // Lumber Jack (Weeping Willow) — /wiki/Pyros_Treant
  "Pyros Treant": { nameTw: "湧火樹妖", level: 52, race: 'Seedkin' },

  // Glaukopis — /wiki/Val_Skatene
  "Val Skatene": { nameTw: "瓦爾斯卡尼特", level: 53, race: 'Cloudkin' },

  // Ying-Yang — /wiki/Pyros_Hecteyes
  "Pyros Hecteyes": { nameTw: "湧火百目妖", level: 54, race: 'Voidsent' },

  // Penthesilea — /wiki/Val_Bloodglider (NM trigger weather: Heat Waves)
  "Val Bloodglider": { nameTw: "瓦爾血飛蛾", level: 55, race: 'Vilekin' },

  // Skoll — /wiki/Pyros_Shuck (NM trigger weather: Blizzards)
  "Pyros Shuck": { nameTw: "湧火狗靈", level: 55, race: 'Beastkin' },

  // ===== Hydatos (Lv 50-60) =====

  // Khalamari (and Haokah share trigger) — /wiki/Xzomit
  "Xzomit": { nameTw: "左米特", level: 55, race: 'Wavekin' },

  // Stegodon — /wiki/Hydatos_Primelephas
  "Hydatos Primelephas": { nameTw: "豐水曙象", level: 56, race: 'Scalekin' },

  // Molech — /wiki/Val_Nullchu
  "Val Nullchu": { nameTw: "瓦爾爛泥食腐獸", level: 57, timeOfDay: 'night', race: 'Seedkin' },

  // Piasa — /wiki/Vivid_Gastornis
  "Vivid Gastornis": { nameTw: "多彩冠恐鳥", level: 58, race: 'Cloudkin' },

  // Frostmane — /wiki/Northern_Tiger
  "Northern Tiger": { nameTw: "北方猛虎", level: 59, race: 'Beastkin' },

  // Daphne — /wiki/Dark_Void_Monk
  "Dark Void Monk": { nameTw: "暗黑虛無鬼魚", level: 60, race: 'Voidsent' },

  // King Goldemar — /wiki/Hydatos_Wraith
  // Mob page lists Lv 60; zone page lists Lv 61 — preferring mob page per source-priority rule.
  "Hydatos Wraith": { nameTw: "豐水幽靈", level: 60, timeOfDay: 'night', race: 'Ashkin' },

  // Leuke — /wiki/Tigerhawk
  "Tigerhawk": { nameTw: "虎鷹", level: 62, race: 'Vilekin' },

  // Barong — /wiki/Laboratory_Lion
  "Laboratory Lion": { nameTw: "研究所雄獅", level: 63, race: 'Beastkin' },

  // Ceto — /wiki/Hydatos_Delphyne
  "Hydatos Delphyne": { nameTw: "豐水達菲妮", level: 64, race: 'Chimera' },

  // Provenance Watcher — /wiki/Crystal_Claw
  "Crystal Claw": { nameTw: "水晶爪", level: 65, race: 'Vilekin' },
};
