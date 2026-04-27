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
  level: number;
  timeOfDay?: 'day' | 'night';
  race?: string; // English race/family name from consolegameswiki (for future icon mapping)
}

export const triggerMobAttrs: Record<string, TriggerMobAttrs> = {
  // ===== Anemos (Lv 1-20) =====

  // Sabotender Corrido — /wiki/Flowering_Sabotender (Eureka Anemos entry on /wiki/The_Forbidden_Land,_Eureka_Anemos)
  // Mob page /wiki/Flowering_Sabotender describes the Southern Thanalan variant; Anemos zone-page table lists Lv 6.
  "Flowering Sabotender": { level: 6, race: 'Seedkin' },

  // The Lord of Anemos — /wiki/Sea_Bishop
  "Sea Bishop": { level: 7, race: 'Wavekin' },

  // Teles — /wiki/Anemos_Harpeia
  "Anemos Harpeia": { level: 8, race: 'Cloudkin' },

  // The Emperor of Anemos — /wiki/Darner
  "Darner": { level: 9, race: 'Vilekin' },

  // Callisto — /wiki/Val_Bear
  "Val Bear": { level: 10, race: 'Beastkin' },

  // Number — /wiki/Pneumaflayer
  "Pneumaflayer": { level: 11, race: 'Voidsent' },

  // Jahannam — /wiki/Typhoon_Sprite (NM trigger weather: Gales)
  "Typhoon Sprite": { level: 12, race: 'Elemental' },

  // Amemet — /wiki/Abraxas_(Enemy)
  "Abraxas": { level: 13, race: 'Scalekin' },

  // Caym — /wiki/Stalker_Ziz
  "Stalker Ziz": { level: 14, race: 'Scalekin' },

  // Bombadeel — /wiki/Traveling_Gourmand
  "Traveling Gourmand": { level: 15, timeOfDay: 'night', race: 'Ashkin' },

  // Serket — /wiki/Khor_Claw (consolegameswiki lists no race for this enemy)
  "Khor Claw": { level: 16 },

  // Judgmental Julika — /wiki/Henbane
  "Henbane": { level: 17, race: 'Seedkin' },

  // The White Rider — /wiki/Duskfall_Dullahan
  "Duskfall Dullahan": { level: 18, timeOfDay: 'night', race: 'Soulkin' },

  // Polyphemus — /wiki/Monoeye
  "Monoeye": { level: 19, race: 'Spoken' },

  // Simurgh's Strider — /wiki/Old_World_Zu
  "Old World Zu": { level: 20, race: 'Cloudkin' },

  // King Hazmat — /wiki/Anemos_Anala
  "Anemos Anala": { level: 21, race: 'Elemental' },

  // Fafnir — /wiki/Fossil_Dragon
  "Fossil Dragon": { level: 22, timeOfDay: 'night', race: 'Ashkin' },

  // Amarok — /wiki/Voidscale (consolegameswiki lists no race for this enemy)
  "Voidscale": { level: 23 },

  // Lamashtu — /wiki/Val_Specter
  "Val Specter": { level: 24, timeOfDay: 'night', race: 'Ashkin' },

  // Pazuzu — /wiki/Shadow_Wraith
  "Shadow Wraith": { level: 25, timeOfDay: 'night', race: 'Ashkin' },

  // ===== Pagos (Lv 20-35) =====

  // The Snow Queen — /wiki/Yukinko_(Enemy)
  "Yukinko": { level: 25, race: 'Seedkin' },

  // Taxim — /wiki/Demon_of_the_Incunable
  // Mob page lists Lv 27; zone page lists Lv 26 — preferring mob page per source-priority rule.
  "Demon of the Incunable": { level: 27, timeOfDay: 'night', race: 'Voidsent' },

  // Ash Dragon — /wiki/Blood_Demon
  "Blood Demon": { level: 27, race: 'Voidsent' },

  // Glavoid — /wiki/Val_Worm
  "Val Worm": { level: 28, race: 'Vilekin' },

  // Anapos — /wiki/Snowmelt_Sprite (NM trigger weather: Fog)
  // Mob page lists Lv 28; zone page lists Lv 29 — preferring mob page per source-priority rule.
  "Snowmelt Sprite": { level: 28, race: 'Elemental' },

  // Hakutaku — /wiki/Blubber_Eyes
  "Blubber Eyes": { level: 30, race: 'Voidsent' },

  // King Igloo — /wiki/Huwasi
  "Huwasi": { level: 31, race: 'Soulkin' },

  // Asag — /wiki/Wandering_Opken
  "Wandering Opken": { level: 32, race: 'Spoken' },

  // Surabhi — /wiki/Pagos_Billygoat
  "Pagos Billygoat": { level: 33, race: 'Beastkin' },

  // King Arthro — /wiki/Val_Snipper (NM trigger weather: Fog)
  "Val Snipper": { level: 34, race: 'Megalocrab' },

  // Mindertaur, Eldertaur — /wiki/Lab_Minotaur
  "Lab Minotaur": { level: 35, race: 'Minotaur' },

  // Holy Cow — /wiki/Elder_Buffalo
  "Elder Buffalo": { level: 36, race: 'Beastkin' },

  // Hadhayosh — /wiki/Lesser_Void_Dragon (NM trigger weather: Thunder)
  "Lesser Void Dragon": { level: 37, race: 'Dragon' },

  // Horus — /wiki/Void_Vouivre (NM trigger weather: Heat Waves)
  "Void Vouivre": { level: 38, race: 'Vouivre' },

  // Arch Angra Mainyu — /wiki/Gawper
  "Gawper": { level: 39, race: 'Ahriman' },

  // Louhi — /wiki/Val_Corpse
  // Mob page lists Lv 39; zone page lists Lv 40 — preferring mob page per source-priority rule.
  "Val Corpse": { level: 39, timeOfDay: 'night', race: 'Ashkin' },

  // Copycat Cassie — /wiki/Ameretat (NM trigger weather: Blizzards)
  "Ameretat": { level: 40, race: 'Seedkin' },

  // ===== Pyros (Lv 35-50) =====

  // Leucosia — /wiki/Pyros_Bhoot
  // Mob page lists Lv 38; zone page lists Lv 40 — preferring mob page per source-priority rule.
  "Pyros Bhoot": { level: 38, timeOfDay: 'night', race: 'Ashkin' },

  // Flauros — /wiki/Thunderstorm_Sprite (NM trigger weather: Thunder)
  "Thunderstorm Sprite": { level: 41, race: 'Elemental' },

  // The Sophist — /wiki/Pyros_Apanda
  "Pyros Apanda": { level: 42, race: 'Voidsent' },

  // Graffiacane — /wiki/Valking
  "Valking": { level: 43, race: 'Soulkin' },

  // Askalaphos — /wiki/Overdue_Tome (NM trigger weather: Umbral Wind)
  "Overdue Tome": { level: 44, race: 'Soulkin' },

  // Grand Duke Batym — /wiki/Dark_Troubadour
  "Dark Troubadour": { level: 45, timeOfDay: 'night', race: 'Voidsent' },

  // Aetolus — /wiki/Islandhander
  "Islandhander": { level: 46, race: 'Cloudkin' },

  // Lesath — /wiki/Bird_Eater
  "Bird Eater": { level: 47, race: 'Vilekin' },

  // Eldthurs — /wiki/Pyros_Crab
  "Pyros Crab": { level: 48, race: 'Scalekin' },

  // Iris — /wiki/Northern_Swallow
  "Northern Swallow": { level: 49, race: 'Wavekin' },

  // Lamebrix Strikebocks — /wiki/Illuminati_Escapee
  "Illuminati Escapee": { level: 50, race: 'Chimera' },

  // Dux — /wiki/Matanga_Castaway (NM trigger weather: Thunder)
  "Matanga Castaway": { level: 51, race: 'Matanga' },

  // Lumber Jack (Weeping Willow) — /wiki/Pyros_Treant
  "Pyros Treant": { level: 52, race: 'Seedkin' },

  // Glaukopis — /wiki/Val_Skatene
  "Val Skatene": { level: 53, race: 'Cloudkin' },

  // Ying-Yang — /wiki/Pyros_Hecteyes
  "Pyros Hecteyes": { level: 54, race: 'Voidsent' },

  // Penthesilea — /wiki/Val_Bloodglider (NM trigger weather: Heat Waves)
  "Val Bloodglider": { level: 55, race: 'Vilekin' },

  // Skoll — /wiki/Pyros_Shuck (NM trigger weather: Blizzards)
  "Pyros Shuck": { level: 55, race: 'Beastkin' },

  // ===== Hydatos (Lv 50-60) =====

  // Khalamari (and Haokah share trigger) — /wiki/Xzomit
  "Xzomit": { level: 55, race: 'Wavekin' },

  // Stegodon — /wiki/Hydatos_Primelephas
  "Hydatos Primelephas": { level: 56, race: 'Scalekin' },

  // Molech — /wiki/Val_Nullchu
  "Val Nullchu": { level: 57, timeOfDay: 'night', race: 'Seedkin' },

  // Piasa — /wiki/Vivid_Gastornis
  "Vivid Gastornis": { level: 58, race: 'Cloudkin' },

  // Frostmane — /wiki/Northern_Tiger
  "Northern Tiger": { level: 59, race: 'Beastkin' },

  // Daphne — /wiki/Dark_Void_Monk
  "Dark Void Monk": { level: 60, race: 'Voidsent' },

  // King Goldemar — /wiki/Hydatos_Wraith
  // Mob page lists Lv 60; zone page lists Lv 61 — preferring mob page per source-priority rule.
  "Hydatos Wraith": { level: 60, timeOfDay: 'night', race: 'Ashkin' },

  // Leuke — /wiki/Tigerhawk
  "Tigerhawk": { level: 62, race: 'Vilekin' },

  // Barong — /wiki/Laboratory_Lion
  "Laboratory Lion": { level: 63, race: 'Beastkin' },

  // Ceto — /wiki/Hydatos_Delphyne
  "Hydatos Delphyne": { level: 64, race: 'Chimera' },

  // Provenance Watcher — /wiki/Crystal_Claw
  "Crystal Claw": { level: 65, race: 'Vilekin' },
};
