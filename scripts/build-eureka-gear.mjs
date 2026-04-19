#!/usr/bin/env node
// Build-time: fetch datamining-tc CSVs and emit
// public/data/eureka-gear.json + public/data/eureka-materials.json.
// Run manually after game updates: `npm run build:data`.

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(REPO_ROOT, 'public/data');

const CSV_BASE =
  'https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-tc/main';

const CSV_FILES = {
  item: 'Item.csv',
  specialShop: 'SpecialShop.csv',
  eNpcResident: 'ENpcResident.csv',
  eNpcBase: 'ENpcBase.csv',
  placeName: 'PlaceName.csv',
};

async function fetchCsv(name) {
  const url = `${CSV_BASE}/${name}`;
  process.stdout.write(`fetching ${name} ... `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const text = await res.text();
  process.stdout.write(`${(text.length / 1024).toFixed(1)} KB\n`);
  return text;
}

// datamining-tc CSV format:
//   row 0: numeric column keys
//   row 1: column names
//   row 2: column types
//   row 3+: data rows
// Values may be quoted; quoted fields may contain "," and escape "" -> ".
function parseCsv(text) {
  const lines = splitCsvLines(text);
  if (lines.length < 4) throw new Error('CSV too short');
  const headers = parseCsvLine(lines[1]);
  const rows = lines.slice(3).map(parseCsvLine);
  return { headers, rows };
}

function splitCsvLines(text) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      cur += c;
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      if (cur.length) out.push(cur);
      cur = '';
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      cur += c;
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function indexBy(rows, headers, keyCol) {
  const keyIdx = headers.indexOf(keyCol);
  if (keyIdx < 0) throw new Error(`header ${keyCol} not found`);
  const map = new Map();
  for (const r of rows) map.set(r[keyIdx], r);
  return { map, keyIdx };
}

const STAGE_PREFIX = [
  { stage: 'antique',   match: /^古代/ },
  { stage: 'anemos',    match: /^阿涅摩斯/ },
  { stage: 'pagos',     match: /^帕格斯/ },
  { stage: 'pyros',     match: /^皮洛斯/ },
  { stage: 'hydatos',   match: /^海達托斯/ },
  { stage: 'elemental', match: /^元素/ },
  { stage: 'physeos',   match: /^菲塞歐斯/ },
];

function detectStage(name) {
  for (const { stage, match } of STAGE_PREFIX) {
    if (match.test(name)) return stage;
  }
  return null;
}

// Datamining-tc (TC) ItemUICategory IDs verified empirically against 元素/古代
// Eureka items in Item.csv. These differ from the generic XIVAPI numbering
// the plan used; the plan's table was off by ~3 for armour and missed some
// weapon categories. See concerns in the Task 4 report.
const UI_CAT_TO_SLOT = {
  // weapons (one handed / two handed / class specific)
  '1':  'weapon', // fists (指虎)
  '2':  'weapon', // sword (劍)
  '3':  'weapon', // axe (戰斧)
  '4':  'weapon', // bow (弓)
  '5':  'weapon', // lance (龍槍)
  '6':  'weapon',
  '7':  'weapon', // staff (法杖)
  '8':  'weapon',
  '9':  'weapon', // cane (牧杖)
  '10': 'weapon', // grimoire (魔導書)
  '11': 'weapon', // shield (盾) — grouped as weapon for MVP
  '84': 'weapon', // dagger (匕首)
  '87': 'weapon', // gunblade (斷頭劍)
  '88': 'weapon', // firearm (手砲)
  '89': 'weapon', // nouliths/astrolabe (天儀)
  '96': 'weapon', // samurai katana (武士刀)
  '97': 'weapon', // rapier (刺劍)
  '98': 'weapon', // grimoire variant (魔導典)
  // armour
  '34': 'head',
  '35': 'body',
  '36': 'legs',
  '37': 'hands',
  '38': 'feet',
};

function lookupSlot(itemUiCat) {
  return UI_CAT_TO_SLOT[itemUiCat] ?? null;
}

function pathToFileUrl(p) {
  return new URL(`file://${p}`);
}

async function main() {
  const csvs = {};
  for (const [key, filename] of Object.entries(CSV_FILES)) {
    const text = await fetchCsv(filename);
    csvs[key] = parseCsv(text);
    console.log(`  ${key}: ${csvs[key].rows.length} rows, ${csvs[key].headers.length} cols`);
  }

  const itemHeaders = csvs.item.headers;
  const itemIdIdx = itemHeaders.indexOf('#');
  const itemNameIdx = itemHeaders.indexOf('Name');
  const itemIconIdx = itemHeaders.indexOf('Icon');
  const itemIlvIdx = itemHeaders.indexOf('Level{Item}');
  const itemUiCatIdx = itemHeaders.indexOf('ItemUICategory');

  const itemById = new Map();
  for (const r of csvs.item.rows) {
    itemById.set(r[itemIdIdx], {
      id: Number(r[itemIdIdx]),
      name: r[itemNameIdx],
      iconId: Number(r[itemIconIdx] ?? 0),
      itemLevel: Number(r[itemIlvIdx] ?? 0),
      uiCat: r[itemUiCatIdx],
    });
  }

  const placeNameIdx = csvs.placeName.headers.indexOf('#');
  const placeTextIdx = csvs.placeName.headers.indexOf('Name');
  const placeNameById = new Map(
    csvs.placeName.rows.map((r) => [r[placeNameIdx], r[placeTextIdx]]),
  );

  const npcResIdx = csvs.eNpcResident.headers.indexOf('#');
  const npcResNameIdx = csvs.eNpcResident.headers.indexOf('Singular');
  const npcNameById = new Map(
    csvs.eNpcResident.rows.map((r) => [r[npcResIdx], r[npcResNameIdx]]),
  );

  const specialShopIds = new Set(
    csvs.specialShop.rows.map((r) => r[csvs.specialShop.headers.indexOf('#')]),
  );
  const npcBaseRowIdIdx = csvs.eNpcBase.headers.indexOf('#');
  const npcDataCols = csvs.eNpcBase.headers
    .map((h, i) => ({ h, i }))
    .filter((x) => /^ENpcData\[\d+\]$/.test(x.h))
    .map((x) => x.i);
  const shopsByNpc = new Map();
  for (const r of csvs.eNpcBase.rows) {
    const npcId = r[npcBaseRowIdIdx];
    const shops = new Set();
    for (const c of npcDataCols) {
      const v = r[c];
      if (specialShopIds.has(v)) shops.add(v);
    }
    if (shops.size) shopsByNpc.set(npcId, shops);
  }

  const npcByShop = new Map();
  for (const [npcId, shops] of shopsByNpc) {
    for (const s of shops) {
      if (!npcByShop.has(s)) npcByShop.set(s, []);
      npcByShop.get(s).push(npcId);
    }
  }

  const shopHeaders = csvs.specialShop.headers;
  const shopIdIdx = shopHeaders.indexOf('#');
  const recIdxs = [];
  for (let i = 0; i < shopHeaders.length; i++) {
    const m = /^Item\{Receive\}\[(\d+)\]\[0\]$/.exec(shopHeaders[i]);
    if (m) recIdxs.push({ n: Number(m[1]), itemCol: i });
  }
  for (const r of recIdxs) {
    r.countCol = shopHeaders.indexOf(`Count{Receive}[${r.n}][0]`);
    r.costItemCols = [0, 1, 2].map((k) =>
      shopHeaders.indexOf(`Item{Cost}[${r.n}][${k}]`),
    );
    r.costCountCols = [0, 1, 2].map((k) =>
      shopHeaders.indexOf(`Count{Cost}[${r.n}][${k}]`),
    );
  }

  const tagsModule = await import(
    pathToFileUrl(resolve(REPO_ROOT, 'src/data/eureka-gear-tags.ts'))
  ).catch(() => ({ GEAR_TAGS: [] }));
  const gearTags = tagsModule.GEAR_TAGS ?? [];

  const gearOut = [];
  const materialIds = new Set();
  let slotMisses = 0;

  for (const row of csvs.specialShop.rows) {
    const shopId = row[shopIdIdx];
    const npcIds = npcByShop.get(shopId) ?? [];
    for (const r of recIdxs) {
      const recvId = row[r.itemCol];
      if (!recvId || recvId === '0') continue;
      const item = itemById.get(recvId);
      if (!item) continue;
      const stage = detectStage(item.name);
      if (!stage) continue;
      const slot = lookupSlot(item.uiCat);
      if (!slot) {
        slotMisses++;
        console.warn(`  slot miss: ${item.name} (UI cat ${item.uiCat})`);
        continue;
      }
      const materials = [];
      for (let k = 0; k < 3; k++) {
        const mId = row[r.costItemCols[k]];
        const mQty = row[r.costCountCols[k]];
        if (!mId || mId === '0') continue;
        materials.push({ materialId: Number(mId), quantity: Number(mQty) });
        materialIds.add(mId);
      }
      const npcId = npcIds[0];
      const entry = {
        id: item.id,
        name: item.name,
        iconId: item.iconId,
        stage,
        slot,
        jobs: [],
        itemLevel: item.itemLevel,
        source: {
          npcId: npcId ? Number(npcId) : 0,
          npcName: npcNameById.get(npcId) ?? '',
          zone: '',
          specialShopId: Number(shopId),
        },
        cost: { materials },
        tags: [],
      };
      const tagEntry = gearTags.find((t) => t.itemId === entry.id);
      if (tagEntry) {
        entry.tags = tagEntry.tags;
        if (tagEntry.setName) entry.setName = tagEntry.setName;
        if (tagEntry.stageOverride) entry.stage = tagEntry.stageOverride;
      }
      gearOut.push(entry);
    }
  }

  const materialsOut = [];
  for (const mid of materialIds) {
    const item = itemById.get(mid);
    if (!item) continue;
    materialsOut.push({
      id: item.id,
      name: item.name,
      iconId: item.iconId,
      category: 'unknown',
    });
  }
  materialsOut.sort((a, b) => a.id - b.id);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    resolve(OUT_DIR, 'eureka-gear.json'),
    JSON.stringify(gearOut, null, 2),
  );
  writeFileSync(
    resolve(OUT_DIR, 'eureka-materials.json'),
    JSON.stringify(materialsOut, null, 2),
  );

  console.log(
    `\nemitted ${gearOut.length} gear entries, ${materialsOut.length} materials` +
      (slotMisses ? ` (${slotMisses} slot misses)` : ''),
  );
  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
