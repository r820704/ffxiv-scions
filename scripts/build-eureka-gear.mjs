#!/usr/bin/env node
// Build-time: fetch datamining-tc CSVs and emit
// public/data/eureka-gear.json + public/data/eureka-materials.json.
// Run manually after game updates: `npm run build:data`.

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

async function fetchText(name) {
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

// Name-pattern → stage. First match wins. More-specific patterns must come
// before less-specific ones (e.g. `+2` must be matched before the plain prefix).
const STAGE_PATTERNS = [
  { stage: 'physeos',     test: (n) => /^元素.+?\+2$/.test(n) },
  { stage: 'elemental+1', test: (n) => /^元素.+?\+1$/.test(n) },
  { stage: 'elemental',   test: (n) => /^元素/.test(n) && !/\+\d$/.test(n) },
  { stage: 'hydatos+1',   test: (n) => /^豐水.+?\+1$/.test(n) },
  { stage: 'hydatos',     test: (n) => /^豐水/.test(n) && !/\+\d$/.test(n) },
  { stage: 'pyros',       test: (n) => /^湧火/.test(n) },
  { stage: 'pagos+1',     test: (n) => /·恆冰\+1$/.test(n) },
  { stage: 'pagos',       test: (n) => /·恆冰$/.test(n) },
  { stage: 'anemos',      test: (n) => /·常風$/.test(n) || (/^常風/.test(n) && !/·/.test(n)) },
  { stage: 'antique',     test: (n) => /^古代/.test(n) },
];

function detectStage(name) {
  // skip glamour dupes
  if (/（複製品）$/.test(name)) return null;
  // skip crystals themselves
  if (/水晶$/.test(name) || /晶簇$/.test(name)) return null;
  for (const p of STAGE_PATTERNS) {
    if (p.test(name)) return p.stage;
  }
  return null;
}

async function main() {
  const csvs = {};
  for (const [key, filename] of Object.entries(CSV_FILES)) {
    const text = await fetchText(filename);
    csvs[key] = parseCsv(text);
    console.log(`  ${key}: ${csvs[key].rows.length} rows, ${csvs[key].headers.length} cols`);
  }

  // ===== Item lookup =====
  const itemHeaders = csvs.item.headers;
  const itemIdIdx = itemHeaders.indexOf('#');
  const itemNameIdx = itemHeaders.indexOf('Name');
  const itemIconIdx = itemHeaders.indexOf('Icon');
  const itemIlvIdx = itemHeaders.indexOf('Level{Item}');
  const itemUiCatIdx = itemHeaders.indexOf('ItemUICategory');

  // itemById keyed by string id (as it comes from CSV)
  const itemById = new Map();
  for (const r of csvs.item.rows) {
    const id = r[itemIdIdx];
    if (!id) continue;
    itemById.set(id, {
      id: Number(id),
      name: r[itemNameIdx] ?? '',
      iconId: Number(r[itemIconIdx] ?? 0),
      itemLevel: Number(r[itemIlvIdx] ?? 0),
      uiCat: r[itemUiCatIdx] ?? '',
    });
  }

  // ===== Pass 1: find every gear item by name from Item.csv =====
  const gearIndex = new Map(); // itemId (number) -> gear base record (no cost yet)
  for (const [idStr, item] of itemById) {
    const stage = detectStage(item.name);
    if (!stage) continue;
    const slot = lookupSlot(item.uiCat);
    if (!slot) continue; // drop non-gear items that happen to match (e.g. 古代附魔墨水)
    gearIndex.set(item.id, {
      id: item.id,
      name: item.name,
      iconId: item.iconId,
      stage,
      slot,
      jobs: [],
      itemLevel: item.itemLevel,
      source: {
        npcId: 0,
        npcName: '',
        zone: '',
        specialShopId: 0,
      },
      cost: { materials: [] },
      tags: [],
    });
  }

  // ===== SpecialShop scan to enrich gear entries with cost + source =====
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

  // shopId → npcId list (for source info)
  const specialShopIds = new Set(
    csvs.specialShop.rows.map((r) => r[shopIdIdx]),
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

  const npcResIdx = csvs.eNpcResident.headers.indexOf('#');
  const npcResNameIdx = csvs.eNpcResident.headers.indexOf('Singular');
  const npcNameById = new Map(
    csvs.eNpcResident.rows.map((r) => [r[npcResIdx], r[npcResNameIdx]]),
  );

  // Walk every SpecialShop row × every receive slot; if received item is in
  // our gearIndex and we haven't filled its cost yet, fill it.
  let shopMatched = 0;
  for (const row of csvs.specialShop.rows) {
    const shopId = row[shopIdIdx];
    const npcIds = npcByShop.get(shopId) ?? [];
    for (const r of recIdxs) {
      const recvId = row[r.itemCol];
      if (!recvId || recvId === '0') continue;
      const gearEntry = gearIndex.get(Number(recvId));
      if (!gearEntry) continue;
      if (gearEntry.source.specialShopId !== 0) continue; // first match wins

      const materials = [];
      for (let k = 0; k < 3; k++) {
        const mId = row[r.costItemCols[k]];
        const mQty = row[r.costCountCols[k]];
        if (!mId || mId === '0') continue;
        materials.push({ materialId: Number(mId), quantity: Number(mQty) });
      }
      const npcId = npcIds[0];
      gearEntry.cost.materials = materials;
      gearEntry.source = {
        npcId: npcId ? Number(npcId) : 0,
        npcName: npcNameById.get(npcId) ?? '',
        zone: '',
        specialShopId: Number(shopId),
      };
      shopMatched++;
    }
  }

  // ===== Emit =====
  const gearOut = Array.from(gearIndex.values()).sort((a, b) => a.id - b.id);

  // Build materials table from all cost materials across all gear entries
  const materialIds = new Set();
  for (const g of gearOut) {
    for (const m of g.cost.materials) {
      materialIds.add(String(m.materialId));
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

  // Summary logs
  const byStage = {};
  const sourceUnknownByStage = {};
  for (const g of gearOut) {
    byStage[g.stage] = (byStage[g.stage] || 0) + 1;
    if (g.source.specialShopId === 0) {
      sourceUnknownByStage[g.stage] = (sourceUnknownByStage[g.stage] || 0) + 1;
    }
  }
  console.log(`\nemitted ${gearOut.length} gear entries, ${materialsOut.length} materials`);
  console.log(`shop-matched (have cost): ${shopMatched}`);
  console.log('by stage:', byStage);
  console.log('source unknown (not in SpecialShop) by stage:', sourceUnknownByStage);
  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
