// Source: ffxiv.consolegameswiki.com / FFXIV community Eureka guides.
// Element values are populated by scripts/build-eureka-trigger-mob-elements.mjs
// from snorux/EurekaHelper (game-datamined `EurekaElement` values).
// See THIRD-PARTY-NOTICES.md for license details.
//
// Manual data: trigger mob attributes (level + time-of-day + element) for Eureka NM trigger mobs.
// Keyed by the mob's English name as it appears in eureka-nm-spawn-data.ts.
//
// Spawn weather of the trigger mob can be derived from the NM's own trigger weather
// (the mob only appears under the same weather), so no separate weather field here.
//
// Source-priority rule for level discrepancies between consolegameswiki pages:
// the zone page's FATE table records the Elemental Level (EL) at which the mob
// counts toward the NM trigger; the mob's own page records its base object level.
// The trigger mechanic uses the EL value, so the zone page wins when they disagree.
// Cross-checked against guide.contentachievers.com EL listings.

export interface TriggerMobAttrs {
  nameTw: string;  // Traditional Chinese name from datamining-tc
  level: number;
  timeOfDay?: 'day' | 'night';
  element?: 'Fire' | 'Ice' | 'Wind' | 'Earth' | 'Lightning' | 'Water'; // Eureka elemental affinity from snorux/EurekaHelper
  nmTw: string; // Traditional Chinese name of the NM this mob triggers
}

export const triggerMobAttrs: Record<string, TriggerMobAttrs> = {
  // ===== Anemos (Lv 1-20) =====

  // Sabotender Corrido — /wiki/Flowering_Sabotender_(Eureka_Anemos)
  // Mob page /wiki/Flowering_Sabotender describes the Southern Thanalan variant; Anemos zone-page table lists Lv 6.
  "Flowering Sabotender": { nameTw: "開花仙人掌怪", level: 6, element: 'Wind', nmTw: "寇里多仙人掌怪" },

  // The Lord of Anemos — /wiki/Sea_Bishop
  "Sea Bishop": { nameTw: "海祭司", level: 7, element: 'Water', nmTw: "常風領主" },

  // Teles — /wiki/Anemos_Harpeia
  "Anemos Harpeia": { nameTw: "常風哈佩亞鳥妖", level: 8, element: 'Wind', nmTw: "忒勒斯" },

  // The Emperor of Anemos — /wiki/Darner
  "Darner": { nameTw: "晏蜓", level: 9, element: 'Wind', nmTw: "常風皇帝" },

  // Callisto — /wiki/Val_Bear
  "Val Bear": { nameTw: "瓦爾巨熊", level: 10, element: 'Earth', nmTw: "卡利斯托" },

  // Number — /wiki/Pneumaflayer
  "Pneumaflayer": { nameTw: "奪靈魔", level: 11, element: 'Lightning', nmTw: "群偶" },

  // Jahannam — /wiki/Typhoon_Sprite
  "Typhoon Sprite": { nameTw: "颱風元精", level: 12, element: 'Wind', nmTw: "哲罕南" },

  // Amemet — /wiki/Abraxas_(Enemy)
  "Abraxas": { nameTw: "阿蔔拉克薩斯", level: 13, element: 'Fire', nmTw: "阿米特" },

  // Caym — /wiki/Stalker_Ziz
  "Stalker Ziz": { nameTw: "追蹤席茲", level: 14, element: 'Ice', nmTw: "蓋因" },

  // Bombadeel — /wiki/Traveling_Gourmand
  "Traveling Gourmand": { nameTw: "古老貪吃鬼", level: 15, timeOfDay: 'night', element: 'Earth', nmTw: "龐巴德" },

  // Serket — /wiki/Khor_Claw
  "Khor Claw": { nameTw: "河道巨鉗蝦", level: 16, element: 'Earth', nmTw: "塞爾凱特" },

  // Judgmental Julika — /wiki/Henbane
  "Henbane": { nameTw: "天仙子", level: 17, element: 'Ice', nmTw: "武斷魔花茱莉卡" },

  // The White Rider — /wiki/Duskfall_Dullahan
  "Duskfall Dullahan": { nameTw: "黃昏無頭騎士", level: 18, timeOfDay: 'night', element: 'Lightning', nmTw: "白騎士" },

  // Polyphemus — /wiki/Monoeye
  "Monoeye": { nameTw: "獨眼怪", level: 19, element: 'Ice', nmTw: "波呂斐摩斯" },

  // Simurgh's Strider — /wiki/Old_World_Zu
  "Old World Zu": { nameTw: "舊世界祖", level: 20, element: 'Fire', nmTw: "闊步西牟鳥" },

  // King Hazmat — /wiki/Anemos_Anala
  "Anemos Anala": { nameTw: "常風阿那羅", level: 21, element: 'Fire', nmTw: "極其危險物質" },

  // Fafnir — /wiki/Fossil_Dragon
  "Fossil Dragon": { nameTw: "龍化石", level: 22, timeOfDay: 'night', element: 'Fire', nmTw: "法夫納" },

  // Amarok — /wiki/Voidscale
  "Voidscale": { nameTw: "虛無鱗龍", level: 23, element: 'Ice', nmTw: "阿瑪洛克" },

  // Lamashtu — /wiki/Val_Specter
  "Val Specter": { nameTw: "瓦爾妖影", level: 24, timeOfDay: 'night', element: 'Wind', nmTw: "拉瑪什圖" },

  // Pazuzu — /wiki/Shadow_Wraith
  "Shadow Wraith": { nameTw: "暗影幽靈", level: 25, timeOfDay: 'night', element: 'Fire', nmTw: "帕祖祖" },

  // ===== Pagos (Lv 20-35) =====

  // The Snow Queen — /wiki/Yukinko_(Enemy)
  "Yukinko": { nameTw: "雪童子", level: 25, element: 'Ice', nmTw: "雪之女王" },

  // Taxim — /wiki/Demon_of_the_Incunable
  // Zone page (FATE EL) lists Lv 26; mob's own page lists Lv 27 (base level). Trigger uses EL.
  "Demon of the Incunable": { nameTw: "珍卷惡魔", level: 26, timeOfDay: 'night', element: 'Wind', nmTw: "塔克西姆" },

  // Ash Dragon — /wiki/Blood_Demon
  "Blood Demon": { nameTw: "血魔", level: 27, element: 'Fire', nmTw: "灰燼龍" },

  // Glavoid — /wiki/Val_Worm
  "Val Worm": { nameTw: "瓦爾蠕蟲", level: 28, element: 'Earth', nmTw: "Glavoid" },

  // Anapos — /wiki/Snowmelt_Sprite
  // Zone page (FATE EL) lists Lv 29; mob's own page lists Lv 28 (base level). Trigger uses EL.
  "Snowmelt Sprite": { nameTw: "融雪元精", level: 29, element: 'Water', nmTw: "安娜波" },

  // Hakutaku — /wiki/Blubber_Eyes
  "Blubber Eyes": { nameTw: "啜泣百目妖", level: 30, element: 'Fire', nmTw: "白澤" },

  // King Igloo — /wiki/Huwasi
  "Huwasi": { nameTw: "胡瓦西", level: 31, element: 'Ice', nmTw: "雪屋王" },

  // Asag — /wiki/Wandering_Opken
  "Wandering Opken": { nameTw: "徘徊歐浦肯", level: 32, element: 'Lightning', nmTw: "阿薩格" },

  // Surabhi — /wiki/Pagos_Billygoat
  "Pagos Billygoat": { nameTw: "恆冰公山羊", level: 33, element: 'Earth', nmTw: "蘇羅毗" },

  // King Arthro — /wiki/Val_Snipper
  "Val Snipper": { nameTw: "瓦爾利螯陸蟹", level: 34, element: 'Water', nmTw: "亞瑟羅王" },

  // Mindertaur, Eldertaur — /wiki/Lab_Minotaur
  "Lab Minotaur": { nameTw: "研究所米諾陶洛斯", level: 35, element: 'Wind', nmTw: "牛頭魔長老／看守" },

  // Holy Cow — /wiki/Elder_Buffalo
  "Elder Buffalo": { nameTw: "古老水牛", level: 36, element: 'Wind', nmTw: "優雷卡聖牛" },

  // Hadhayosh — /wiki/Lesser_Void_Dragon
  "Lesser Void Dragon": { nameTw: "虛無小龍", level: 37, element: 'Lightning', nmTw: "哈達約什" },

  // Horus — /wiki/Void_Vouivre
  "Void Vouivre": { nameTw: "虛無薇薇爾飛龍", level: 38, element: 'Fire', nmTw: "荷魯斯" },

  // Arch Angra Mainyu — /wiki/Gawper
  "Gawper": { nameTw: "瞪視之眼", level: 39, element: 'Wind', nmTw: "總領安格拉·曼紐" },

  // Louhi — /wiki/Val_Corpse
  // Zone page (FATE EL) lists Lv 40; mob's own page lists Lv 39 (base level). Trigger uses EL.
  "Val Corpse": { nameTw: "瓦爾腐屍", level: 40, timeOfDay: 'night', element: 'Ice', nmTw: "婁希" },

  // Copycat Cassie — /wiki/Ameretat
  "Ameretat": { nameTw: "阿米雷戴", level: 40, element: 'Ice', nmTw: "複製魔花凱西" },

  // ===== Pyros (Lv 35-50) =====

  // Leucosia — /wiki/Pyros_Bhoot
  // Zone page (FATE EL) lists Lv 40; mob's own page lists Lv 38 (base level). Trigger uses EL.
  "Pyros Bhoot": { nameTw: "湧火浮靈", level: 40, timeOfDay: 'night', element: 'Ice', nmTw: "琉科西亞" },

  // Flauros — /wiki/Thunderstorm_Sprite
  "Thunderstorm Sprite": { nameTw: "雷暴元精", level: 41, element: 'Lightning', nmTw: "佛勞洛斯" },

  // The Sophist — /wiki/Pyros_Apanda
  "Pyros Apanda": { nameTw: "湧火阿班達", level: 42, element: 'Earth', nmTw: "詭辯者" },

  // Graffiacane — /wiki/Valking
  "Valking": { nameTw: "瓦爾維京人偶", level: 43, element: 'Lightning', nmTw: "格拉菲亞卡內" },

  // Askalaphos — /wiki/Overdue_Tome
  "Overdue Tome": { nameTw: "過期魔導書", level: 44, element: 'Earth', nmTw: "阿斯卡拉福斯" },

  // Grand Duke Batym — /wiki/Dark_Troubadour
  "Dark Troubadour": { nameTw: "暗黑行吟者", level: 45, timeOfDay: 'night', element: 'Earth', nmTw: "巴欽大公爵" },

  // Aetolus — /wiki/Islandhander
  "Islandhander": { nameTw: "瓦爾獨爪妖禽", level: 46, element: 'Wind', nmTw: "艾托洛斯" },

  // Lesath — /wiki/Bird_Eater
  "Bird Eater": { nameTw: "食鳥者", level: 47, element: 'Wind', nmTw: "來薩特" },

  // Eldthurs — /wiki/Pyros_Crab
  "Pyros Crab": { nameTw: "湧火陸蟹", level: 48, element: 'Fire', nmTw: "火巨人艾爾德塞斯" },

  // Iris — /wiki/Northern_Swallow
  "Northern Swallow": { nameTw: "北境鹽藍燕", level: 49, element: 'Water', nmTw: "伊麗絲" },

  // Lamebrix Strikebocks — /wiki/Illuminati_Escapee
  "Illuminati Escapee": { nameTw: "青藍之手逃亡者", level: 50, element: 'Lightning', nmTw: "傭兵雷姆普里克斯" },

  // Dux — /wiki/Matanga_Castaway
  "Matanga Castaway": { nameTw: "遺棄象魔", level: 51, element: 'Fire', nmTw: "閃電督軍" },

  // Lumber Jack (Weeping Willow) — /wiki/Pyros_Treant
  "Pyros Treant": { nameTw: "湧火樹妖", level: 52, element: 'Lightning', nmTw: "樵夫傑科" },

  // Glaukopis — /wiki/Val_Skatene
  "Val Skatene": { nameTw: "瓦爾斯卡尼特", level: 53, element: 'Wind', nmTw: "明眸" },

  // Ying-Yang — /wiki/Pyros_Hecteyes
  "Pyros Hecteyes": { nameTw: "湧火百目妖", level: 54, element: 'Water', nmTw: "陰·陽" },

  // Penthesilea — /wiki/Val_Bloodglider
  "Val Bloodglider": { nameTw: "瓦爾血飛蛾", level: 55, element: 'Fire', nmTw: "彭忒西勒亞" },

  // Skoll — /wiki/Pyros_Shuck
  "Pyros Shuck": { nameTw: "湧火狗靈", level: 55, element: 'Earth', nmTw: "斯庫爾" },

  // ===== Hydatos (Lv 50-60) =====

  // Khalamari (and Haokah share trigger) — /wiki/Xzomit
  "Xzomit": { nameTw: "左米特", level: 55, element: 'Water', nmTw: "卡拉墨魚" },

  // Stegodon — /wiki/Hydatos_Primelephas
  "Hydatos Primelephas": { nameTw: "豐水曙象", level: 56, element: 'Earth', nmTw: "劍齒象" },

  // Molech — /wiki/Val_Nullchu
  "Val Nullchu": { nameTw: "瓦爾爛泥食腐獸", level: 57, timeOfDay: 'night', element: 'Earth', nmTw: "摩洛" },

  // Piasa — /wiki/Vivid_Gastornis
  "Vivid Gastornis": { nameTw: "多彩冠恐鳥", level: 58, element: 'Wind', nmTw: "皮艾薩邪鳥" },

  // Frostmane — /wiki/Northern_Tiger
  "Northern Tiger": { nameTw: "北方猛虎", level: 59, element: 'Earth', nmTw: "霜鬃獵魔" },

  // Daphne — /wiki/Dark_Void_Monk
  "Dark Void Monk": { nameTw: "暗黑虛無鬼魚", level: 60, element: 'Water', nmTw: "達佛涅" },

  // King Goldemar — /wiki/Hydatos_Wraith
  // Zone page (FATE EL) lists Lv 61; mob's own page lists Lv 60 (base level). Trigger uses EL.
  "Hydatos Wraith": { nameTw: "豐水幽靈", level: 61, timeOfDay: 'night', element: 'Lightning', nmTw: "戈爾德馬爾王" },

  // Leuke — /wiki/Tigerhawk
  "Tigerhawk": { nameTw: "虎鷹", level: 62, element: 'Wind', nmTw: "琉刻" },

  // Barong — /wiki/Laboratory_Lion
  "Laboratory Lion": { nameTw: "研究所雄獅", level: 63, element: 'Earth', nmTw: "巴龍" },

  // Ceto — /wiki/Hydatos_Delphyne
  "Hydatos Delphyne": { nameTw: "豐水達菲妮", level: 64, element: 'Fire', nmTw: "刻托" },

  // Provenance Watcher — /wiki/Crystal_Claw
  "Crystal Claw": { nameTw: "水晶爪", level: 65, element: 'Fire', nmTw: "起源守望者" },
};
