// Source: snorux/EurekaHelper (XIV/Zones/*.cs, mob coordinates).
// TC mob names from thewakingsands/ffxiv-datamining-tc (BNpcName.csv).
// EN mob names cross-referenced via xivapi/ffxiv-datamining (csv/en/BNpcName.csv).
// See THIRD-PARTY-NOTICES.md for license details.
//
// One-shot script. Run: npm run build:nm-spawn
// Output: src/data/eureka-nm-spawn-data.ts (committed by hand after review).

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const EUREKA_HELPER_BASE =
  'https://raw.githubusercontent.com/snorux/EurekaHelper/main/EurekaHelper/XIV/Zones';
const ZONE_FILES = [
  { name: 'Anemos',  url: `${EUREKA_HELPER_BASE}/EurekaAnemos.cs` },
  { name: 'Pagos',   url: `${EUREKA_HELPER_BASE}/EurekaPagos.cs` },
  { name: 'Pyros',   url: `${EUREKA_HELPER_BASE}/EurekaPyros.cs` },
  { name: 'Hydatos', url: `${EUREKA_HELPER_BASE}/EurekaHydatos.cs` },
];

const TC_BNPC_URL =
  'https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-tc/main/BNpcName.csv';
const EN_BNPC_URL =
  'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/BNpcName.csv';

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

// Stream-style CSV tokenizer (handles quoted fields with embedded commas/newlines).
// Reused from scripts/build-eureka-weapons.mjs.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let buf = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { buf += '"'; i++; continue; }
        inQ = false;
        continue;
      }
      buf += ch;
      continue;
    }
    if (ch === '"') { inQ = true; continue; }
    if (ch === ',') { row.push(buf); buf = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') {
      row.push(buf);
      rows.push(row);
      row = [];
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.length || row.length) { row.push(buf); rows.push(row); }
  return rows;
}

// Build a BNpcName map from EN CSV: lowercased singular name → row key (numeric).
// Header layout (EN): key,Singular,Plural,Adjective,...  data starts at row 1.
// Multiple keys may share the same singular; we keep the smallest key as
// canonical (matches the "primary" entry, others are usually dupes).
function buildEnNameToKey(text) {
  const rows = parseCsv(text);
  const header = rows[0];
  const keyCol = 0;
  const singularCol = header.indexOf('Singular');
  if (singularCol < 0) throw new Error('EN BNpcName: missing Singular column');
  const map = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 2) continue;
    const key = Number(r[keyCol]);
    const name = r[singularCol] ?? '';
    if (!Number.isFinite(key) || !name) continue;
    const norm = name.trim().toLowerCase();
    if (!norm) continue;
    if (!map.has(norm) || map.get(norm) > key) map.set(norm, key);
  }
  return map;
}

// Build a BNpcName map from TC CSV: row key (numeric) → TC singular name.
// Header layout (TC): col 0 is the numeric key column, remaining columns are
// numeric indices.
//   row 0 = numeric column indices ("key","0","1","2",...)
//   row 1 = field names ("#","Singular","Adjective",...) — used to locate Singular
//   row 2 = column types
//   data starts at row 3; data row col 0 = numeric key, col 1 = TC singular name.
// We look up the Singular column index by scanning rows[1] (the field-names row)
// rather than hardcoding col 1 — mirrors buildEnNameToKey and protects against
// upstream column reordering.
function buildTcKeyToName(text) {
  const rows = parseCsv(text);
  if (rows.length < 4) throw new Error('TC BNpcName: too short');
  const fieldNames = rows[1] ?? [];
  const singularCol = fieldNames.indexOf('Singular');
  if (singularCol < 0) throw new Error('TC BNpcName: missing Singular column');
  const map = new Map();
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length <= singularCol) continue;
    const key = Number(r[0]);
    const name = r[singularCol] ?? '';
    if (!Number.isFinite(key) || !name) continue;
    map.set(key, name);
  }
  return map;
}

// Normalize an English NM name into the kebab id format used by
// src/data/eureka-nm-data.ts. Examples:
//   "Pazuzu"                     -> "pazuzu"
//   "the Lord of Anemos"         -> "lord-of-anemos"
//   "The Snow Queen"             -> "snow-queen"
//   "Simurgh's Strider"          -> "simurghs-strider"
//   "Mindertaur/Eldertaur"       -> "mindertaur-eldertaur"
//   "Ying-Yang"                  -> "ying-yang"
//   "Judgemental Julika"         -> "judgemental-julika"  (note typo, see ALIASES)
function nmNameToIdCandidate(name) {
  return name
    .trim()
    .replace(/^[Tt]he /, '')
    .toLowerCase()
    // Strip apostrophes WITHOUT inserting a separator so "Simurgh's Strider"
    // collapses to "simurghs-strider" (matches the repo's id format).
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Manual aliases for cases where EurekaHelper's spelling diverges from this
// repo's eureka-nm-data ids. Map: EurekaHelper-derived candidate id -> repo id.
const NM_ID_ALIASES = {
  // EurekaHelper has typo "Judgemental Julika"; repo uses "Judgmental Julika"
  'judgemental-julika': 'judgmental-julika',
};

// Parse src/data/eureka-nm-data.ts as text and extract { id, nameEn } pairs.
// Robust against re-ordering as long as each entry has `id: '...'` followed
// by `nameEn: '...'` on the same line (the file's current shape).
function parseNmDataIds(tsText) {
  const ids = new Set();
  const re = /id:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(tsText)) !== null) {
    ids.add(m[1]);
  }
  return ids;
}

// Parse a single EurekaHelper "new(...)" NM row.
// Field order (from XIV/Zones/Eureka*.cs):
//   trackerId, position, territory, lgb, fateName, nmName, shortName,
//   Vector2(nmX,nmY), triggerMobName, Vector2(trigX,trigY),
//   weather1, weather2, element1, element2, bool, sortOrder
// Returns { nmName, trigger: { name, x, y } } or null if line is malformed.
function parseNmRow(line) {
  // Strip leading "new(" and trailing "),".
  const inner = line.match(/new\(\s*(.+?)\s*\)\s*,?\s*$/);
  if (!inner) return null;

  // Easier than a full C# tokenizer: pull the two trigger-related fields by
  // anchoring on the second nested Vector2(...) call. The line shape is:
  //   <head>, "<nmName>", "<short>", new Vector2(<nx>,<ny>), "<triggerMob>", new Vector2(<tx>,<ty>), <tail>
  // We grab nmName as the 6th comma-separated string literal at the top level,
  // and triggerMob + Vector2 by regex.
  const stringLiterals = [];
  // Match "..."  (handles escaped quotes; in practice EurekaHelper data has none).
  const strRe = /"((?:[^"\\]|\\.)*)"/g;
  let sm;
  while ((sm = strRe.exec(line)) !== null) stringLiterals.push(sm[1]);
  // Order in the line: [fateName, nmName, shortName, triggerMobName].
  // (Vector2(...) calls have no string literals.)
  if (stringLiterals.length < 4) return null;
  const nmName = stringLiterals[1];
  const triggerMobName = stringLiterals[3];

  // Find the two Vector2(...) calls. Second one is the trigger position.
  // Note: trigger-less FATEs (Ovni, Tristitia, Bunny FATEs) use `Vector2.Zero`
  // (a static field, not `new Vector2(...)`) for both nm and trigger positions
  // and `null` for triggerMobName. This regex only matches the
  // `new Vector2(...)` form, so those rows naturally yield `vecs.length < 2`
  // and we skip them here. Such NMs (e.g. Ovni) will not appear in the output
  // and are expected to surface as missing-id warnings in main().
  const vecRe = /new\s+Vector2\(\s*(-?\d+(?:\.\d+)?)\s*f?\s*,\s*(-?\d+(?:\.\d+)?)\s*f?\s*\)/g;
  const vecs = [];
  let vm;
  while ((vm = vecRe.exec(line)) !== null) {
    vecs.push({ x: Number(vm[1]), y: Number(vm[2]) });
  }
  if (vecs.length < 2) return null;
  const triggerCoord = vecs[1];

  return { nmName, trigger: { name: triggerMobName, x: triggerCoord.x, y: triggerCoord.y } };
}

function extractNmRows(zoneText) {
  const rows = [];
  // Match indented "new(<digits>, <digits>, <digits>, <digits>, ..." lines (one per NM).
  // The 4-integer-field prefix is the discriminator: NM rows in
  // EurekaHelper's XIV/Zones/Eureka*.cs files start with four integer fields
  // (trackerId, position, territory, lgb). The other `new(...)` constructor
  // calls in those files are ElementalPositions blocks, whose first fields
  // are floats like `1.5f` — so requiring `\d+,\s*\d+,\s*\d+,\s*\d+,` reliably
  // filters them out. Without this discriminator the regex would over-match
  // ElementalPositions rows and produce malformed parses.
  const re = /^\s+new\(\d+,\s*\d+,\s*\d+,\s*\d+,.*$/gm;
  let m;
  while ((m = re.exec(zoneText)) !== null) {
    const parsed = parseNmRow(m[0]);
    if (parsed) rows.push(parsed);
  }
  return rows;
}

async function main() {
  console.log('Fetching EurekaHelper zone files...');
  const zoneTexts = await Promise.all(
    ZONE_FILES.map(async (z) => ({ ...z, text: await fetchText(z.url) })),
  );
  for (const z of zoneTexts) console.log(`  ${z.name}: ${z.text.length} bytes`);

  console.log('Fetching BNpcName CSVs...');
  const [enText, tcText] = await Promise.all([fetchText(EN_BNPC_URL), fetchText(TC_BNPC_URL)]);
  console.log(`  EN BNpcName: ${enText.length} bytes`);
  console.log(`  TC BNpcName: ${tcText.length} bytes`);

  const enNameToKey = buildEnNameToKey(enText);
  const tcKeyToName = buildTcKeyToName(tcText);
  console.log(`  EN entries: ${enNameToKey.size}, TC entries: ${tcKeyToName.size}`);

  // Read existing eureka-nm-data.ts to know which ids are valid.
  const nmDataPath = resolve(REPO_ROOT, 'src/data/eureka-nm-data.ts');
  const nmDataText = readFileSync(nmDataPath, 'utf8');
  const validIds = parseNmDataIds(nmDataText);
  console.log(`Loaded ${validIds.size} NM ids from eureka-nm-data.ts`);

  // Collect all NM rows across all 4 zones, group by NM id.
  const byId = new Map(); // id -> { trigger: MobSpawn[] }
  let totalRows = 0;
  const unmatchedNms = [];

  for (const zone of zoneTexts) {
    const rows = extractNmRows(zone.text);
    console.log(`  ${zone.name}: ${rows.length} NM rows`);
    totalRows += rows.length;

    for (const row of rows) {
      let candidate = nmNameToIdCandidate(row.nmName);
      if (NM_ID_ALIASES[candidate]) candidate = NM_ID_ALIASES[candidate];

      if (!validIds.has(candidate)) {
        unmatchedNms.push({ zone: zone.name, nmName: row.nmName, candidate });
        continue;
      }

      // Look up the trigger mob's TC name.
      const enKey = row.trigger.name.trim().toLowerCase();
      const bnpcKey = enNameToKey.get(enKey);
      let nameTw;
      if (bnpcKey == null) {
        console.warn(
          `[mob] No BNpcName key for "${row.trigger.name}" (NM: ${row.nmName}); falling back to EN.`,
        );
        nameTw = row.trigger.name;
      } else {
        const tcName = tcKeyToName.get(bnpcKey);
        if (!tcName) {
          console.warn(
            `[mob] BNpcName key ${bnpcKey} for "${row.trigger.name}" missing TC entry; falling back to EN.`,
          );
          nameTw = row.trigger.name;
        } else {
          nameTw = tcName;
        }
      }

      // Aggregate trigger mob spawns by mob name. Some NMs share trigger mob
      // entries across the same row; group by EN name and append coords.
      if (!byId.has(candidate)) byId.set(candidate, { trigger: [] });
      const info = byId.get(candidate);
      let bucket = info.trigger.find((b) => b.nameEn === row.trigger.name);
      if (!bucket) {
        bucket = { nameTw, nameEn: row.trigger.name, coords: [] };
        info.trigger.push(bucket);
      }
      bucket.coords.push({ x: row.trigger.x, y: row.trigger.y });
    }
  }

  console.log(`Parsed ${totalRows} total NM rows, matched ${byId.size} ids.`);
  if (unmatchedNms.length > 0) {
    console.warn(`Unmatched NMs (no id in eureka-nm-data.ts):`);
    for (const u of unmatchedNms) {
      console.warn(`  [${u.zone}] "${u.nmName}" -> candidate id "${u.candidate}"`);
    }
  }

  // Diff: repo NM ids that did NOT make it into the output. Most commonly
  // these are trigger-less FATEs (e.g. Ovni in Hydatos) whose EurekaHelper
  // rows use `Vector2.Zero` and `null` triggerMobName, which parseNmRow
  // skips. Surface them so we don't silently drop spawn data.
  const missingIds = [...validIds].filter((id) => !byId.has(id));
  if (missingIds.length > 0) {
    console.warn(`Repo NMs with no spawn data (${missingIds.length}):`);
    for (const id of missingIds) console.warn(`  ${id}`);
  }

  // Sort keys alphabetically for stable output.
  const sortedIds = [...byId.keys()].sort();

  // Render TS file.
  const lines = [];
  lines.push('// Source: snorux/EurekaHelper (XIV/Zones/*.cs, mob coordinates).');
  lines.push('// TC mob names from thewakingsands/ffxiv-datamining-tc (BNpcName.csv).');
  lines.push('// Auto-generated by scripts/build-eureka-nm-spawn.mjs.');
  lines.push('// See THIRD-PARTY-NOTICES.md for license details.');
  lines.push('//');
  lines.push('// To regenerate: npm run build:nm-spawn');
  lines.push('');
  lines.push('export interface MobSpawn {');
  lines.push('  nameTw: string;');
  lines.push('  nameEn: string;');
  lines.push('  coords: Array<{ x: number; y: number }>;');
  lines.push('}');
  lines.push('');
  lines.push('export interface NmSpawnInfo {');
  lines.push('  trigger: MobSpawn[];');
  lines.push('}');
  lines.push('');
  lines.push('export const nmSpawnInfo: Record<string, NmSpawnInfo> = {');
  for (const id of sortedIds) {
    const info = byId.get(id);
    lines.push(`  ${JSON.stringify(id)}: {`);
    lines.push('    trigger: [');
    for (const m of info.trigger) {
      const coordsStr = m.coords
        .map((c) => `{ x: ${c.x}, y: ${c.y} }`)
        .join(', ');
      lines.push(
        `      { nameTw: ${JSON.stringify(m.nameTw)}, nameEn: ${JSON.stringify(m.nameEn)}, coords: [${coordsStr}] },`,
      );
    }
    lines.push('    ],');
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');

  const outPath = resolve(REPO_ROOT, 'src/data/eureka-nm-spawn-data.ts');
  mkdirSync(resolve(REPO_ROOT, 'src/data'), { recursive: true });
  writeFileSync(outPath, lines.join('\n'));
  console.log(`Wrote ${sortedIds.length} entries to ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
