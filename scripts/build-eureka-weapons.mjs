import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ITEM_TC_URL = 'https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-tc/main/Item.csv';
const ITEM_EN_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/Item.csv';

// ItemUICategory:
//   1..10  = main-hand weapons (PLD sword=2, WAR axe=3, BRD bow=4, DRG lance=5, ...)
//   11     = shields (PLD off-hand)
//   84     = daggers/throwing weapons (NIN)
//   87     = DRK greatsword
//   88     = MCH firearm
//   89     = AST star globe
//   96     = SAM katana
//   97     = RDM rapier
//   98     = SCH book (codex)
const WEAPON_CATEGORIES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 84, 87, 88, 89, 96, 97, 98]);
const SHIELD_CATEGORY = 11;

async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

// Proper CSV tokenizer that treats the text as a stream so multi-line quoted
// fields (e.g. descriptions with embedded newlines) don't break row splitting.
// Produces one array of cells per row.
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

function parseItemCsv(text, variant) {
  // variant === 'tc'  → row0 numeric keys, row1 field names, row2 types, data from row3
  // variant === 'en'  → row0 field names, data from row1
  const rows = parseCsv(text);
  if (rows.length < 3) throw new Error('CSV too short');

  const headerLineIdx = variant === 'en' ? 0 : 1;
  const dataStartIdx = variant === 'en' ? 1 : 3;
  const ilvName = variant === 'en' ? 'LevelItem' : 'Level{Item}';

  const cols = rows[headerLineIdx];
  const nameCol = cols.indexOf('Name');
  const ilvCol = cols.indexOf(ilvName);
  const iconCol = cols.indexOf('Icon');
  const categoryCol = cols.indexOf('ItemUICategory');
  if (nameCol < 0 || ilvCol < 0 || iconCol < 0 || categoryCol < 0) {
    throw new Error(`Missing required cols (${variant}): name=${nameCol} ilv=${ilvCol} icon=${iconCol} cat=${categoryCol}`);
  }
  const map = new Map();
  for (let i = dataStartIdx; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;
    const id = Number(row[0]);
    if (!Number.isFinite(id)) continue;
    const name = row[nameCol] ?? '';
    if (!name) continue;
    map.set(id, {
      name,
      itemLevel: Number(row[ilvCol] ?? 0),
      iconId: Number(row[iconCol] ?? 0),
      category: Number(row[categoryCol] ?? 0),
    });
  }
  return map;
}

// Families hand-identified by inspecting CSV stage outputs. These anchor the
// ambiguous stages (anemos-base plain names, base-eureka plain names) so we
// don't pull in unrelated raid/event weapons with the same ilv.
const ANEMOS_FAMILIES = new Set([
  // Original 9 jobs' families + PLD shield
  'Aymur', 'Evalach', 'Failnaught', 'Farsha', 'Galatyn',
  'Lemegeton', 'Nagi', 'Ryunohige', 'Vanargand',
  'Sudarshana Chakra',
  // 6 remaining SB jobs (added 2026-04-25)
  'Caladbolg',      // DRK
  'Kiku-ichimonji', // SAM
  'Outsider',       // MCH
  'Organum',        // SCH
  'Pleiades',       // AST
  'Murgleis',       // RDM
]);
const EUREKA_FAMILIES = new Set([
  // Original jobs' base-eureka / eureka / physeos family names
  'Antea', 'Bellerophon', 'Circinae', 'Daboya', 'Dumuzis',
  'Kasasagi', 'Paikea', 'Rose Couverte', 'Shamash', 'Tuah',
  // 6 remaining jobs
  'Xiphias',    // DRK
  'Torigashira',// SAM
  'Mollfrith',  // MCH
  'Jebat',      // SCH
  'Albireo',    // AST
  'Brunello',   // RDM
]);

// Eureka upgrade materials. IDs verified against EN CSV.
const MATERIAL_IDS = {
  21801: { category: 'crystal', en: 'Protean Crystal' },
  21803: { category: 'crystal', en: "Anemos Crystal" },
  21802: { category: 'other',   en: "Pazuzu's Feather" },
  23309: { category: 'crystal', en: 'Frosted Protean Crystal' },
  22976: { category: 'crystal', en: 'Pagos Crystal' },
  22975: { category: 'other',   en: "Louhi's Ice" },
  24122: { category: 'crystal', en: 'Smoldering Protean Crystal' },
  24124: { category: 'crystal', en: 'Pyros Crystal' },
  24123: { category: 'other',   en: "Penthesilea's Flame" },
  24807: { category: 'crystal', en: 'Hydatos Crystal' },
  24806: { category: 'other',   en: 'Crystalline Scale' },
  24808: { category: 'token',   en: 'Eureka Fragment' },
};

function detectStage(enName, itemLevel) {
  const name = enName.trim();
  if (/\bReplica\b/.test(name)) return null; // ilv 1 glamour replicas

  if (name.startsWith('Antiquated ') && itemLevel === 290) return 'antiquated';

  // Anemos family chain (plain → +1 → +2 → Anemos → Pagos → Pagos+1)
  if (itemLevel === 355 && / Anemos$/.test(name)) return 'anemos';
  if (itemLevel === 365 && / Pagos \+1$/.test(name)) return 'pagos+1';
  if (itemLevel === 360 && / Pagos$/.test(name)) return 'pagos';
  if (itemLevel === 345 && / \+2$/.test(name)) {
    const base = name.replace(/ \+2$/, '');
    if (ANEMOS_FAMILIES.has(base)) return 'anemos+2';
  }
  if (itemLevel === 340 && / \+1$/.test(name)) {
    const base = name.replace(/ \+1$/, '');
    if (ANEMOS_FAMILIES.has(base)) return 'anemos+1';
  }
  if (itemLevel === 335 && ANEMOS_FAMILIES.has(name)) return 'anemos-base';

  // Elemental chain (generic weapon-type names)
  if (itemLevel === 380 && /^Elemental .* \+2$/.test(name)) return 'elemental+2';
  if (itemLevel === 375 && /^Elemental .* \+1$/.test(name)) return 'elemental+1';
  if (itemLevel === 370 && /^Elemental /.test(name)) return 'elemental';
  if (itemLevel === 385 && /^Pyros /.test(name)) return 'pyros';
  if (itemLevel === 395 && /^Hydatos .* \+1$/.test(name)) return 'hydatos+1';
  if (itemLevel === 390 && /^Hydatos /.test(name)) return 'hydatos';

  // Eureka/Physeos family chain
  if (itemLevel === 405 && / Physeos$/.test(name)) return 'physeos';
  if (itemLevel === 405 && / Eureka$/.test(name)) return 'eureka';
  if (itemLevel === 400 && EUREKA_FAMILIES.has(name)) return 'base-eureka';

  return null;
}

function extractFamilyKey(enName) {
  return enName
    .replace(/^Antiquated /, '')
    .replace(/^Elemental /, '').replace(/^Pyros /, '')
    .replace(/^Hydatos /, '').replace(/^Eurekan /, '')
    .replace(/ Anemos\b/, '').replace(/ Pagos\b/, '').replace(/ Physeos\b/, '')
    .replace(/ \+[12]$/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// family-key (lowercased, hyphenated per extractFamilyKey) → job
const FAMILY_TO_JOB = {
  // Stormblood antiquated / anemos series
  'galatyn': 'PLD', 'evalach': 'PLD',
  'farsha': 'WAR',
  'ryunohige': 'DRG',
  'sudarshana-chakra': 'MNK',
  'nagi': 'NIN',
  'failnaught': 'BRD',
  'vanargand': 'BLM',
  'lemegeton': 'SMN',
  'aymur': 'WHM',
  // 6 additional SB jobs (2026-04-25)
  'caladbolg': 'DRK',
  'kiku-ichimonji': 'SAM',
  'outsider': 'MCH',
  'organum': 'SCH',
  'pleiades': 'AST',
  'murgleis': 'RDM',
  // Elemental/Pyros/Hydatos series (generic weapon-type names)
  'sword': 'PLD', 'shield': 'PLD',
  'battleaxe': 'WAR',
  'lance': 'DRG',
  'knives': 'NIN',
  'knuckles': 'MNK',
  'harp-bow': 'BRD',
  'rod': 'BLM',
  'grimoire': 'SMN',
  'cane': 'WHM',
  // (Elemental-series generic names for the 6 added jobs — verified against EN CSV)
  'guillotine': 'DRK',
  'handgonne': 'MCH',
  'codex': 'SCH',
  'astrometer': 'AST',
  'blade': 'SAM',
  'tuck': 'RDM',
  // Eureka/Physeos series
  'antea': 'PLD', 'bellerophon': 'PLD',
  'shamash': 'WAR',
  'daboya': 'DRG',
  'dumuzis': 'MNK',
  'kasasagi': 'NIN',
  'circinae': 'BRD',
  'paikea': 'BLM',
  'tuah': 'SMN',
  'rose-couverte': 'WHM',
  // 6 additional Eureka-form families
  'xiphias': 'DRK',
  'torigashira': 'SAM',
  'mollfrith': 'MCH',
  'jebat': 'SCH',
  'albireo': 'AST',
  'brunello': 'RDM',
};

// Same job → same chainId across all generations. Key by job + Stormblood family.
const STORMBLOOD_FAMILY_BY_JOB = {
  PLD: 'galatyn', WAR: 'farsha', DRG: 'ryunohige',
  MNK: 'sudarshana-chakra', NIN: 'nagi',
  BRD: 'failnaught', BLM: 'vanargand',
  SMN: 'lemegeton', WHM: 'aymur',
  DRK: 'caladbolg', SAM: 'kiku-ichimonji', MCH: 'outsider',
  SCH: 'organum', AST: 'pleiades', RDM: 'murgleis',
};

function deriveJob(familyKey, isShield) {
  if (!familyKey) return null;
  // Try raw family first
  if (FAMILY_TO_JOB[familyKey]) return FAMILY_TO_JOB[familyKey];
  // Strip a trailing '-eureka' (handles antea-eureka, bellerophon-eureka, etc.)
  const stripped = familyKey.replace(/-eureka$/, '');
  if (FAMILY_TO_JOB[stripped]) return FAMILY_TO_JOB[stripped];
  return null;
}

function deriveChainId(familyKey, isShield) {
  const job = deriveJob(familyKey, isShield);
  if (!job) return null;
  const base = STORMBLOOD_FAMILY_BY_JOB[job];
  if (!base) return null;
  return isShield ? `${job.toLowerCase()}-${base}-shield` : `${job.toLowerCase()}-${base}`;
}

async function main() {
  // Load human-override file (empty object by default)
  const overridesPath = resolve(__dirname, 'eureka-weapon-overrides.json');
  const overrides = JSON.parse(readFileSync(overridesPath, 'utf8'));

  console.log('Fetching TC Item.csv...');
  const tcText = await fetchCsv(ITEM_TC_URL);
  console.log(`TC CSV: ${tcText.length} bytes`);
  console.log('Fetching EN Item.csv...');
  const enText = await fetchCsv(ITEM_EN_URL);
  console.log(`EN CSV: ${enText.length} bytes`);

  const tcMap = parseItemCsv(tcText, 'tc');
  const enMap = parseItemCsv(enText, 'en');
  console.log(`TC items: ${tcMap.size}, EN items: ${enMap.size}`);

  // Verify material IDs against EN CSV
  for (const [idStr, meta] of Object.entries(MATERIAL_IDS)) {
    const id = Number(idStr);
    const en = enMap.get(id);
    if (!en) { console.warn(`[materials] id ${id} missing from EN CSV`); continue; }
    if (en.name !== meta.en) {
      console.warn(`[materials] id ${id} EN mismatch: expected "${meta.en}", actual "${en.name}"`);
    }
  }

  const weapons = [];
  for (const [id, en] of enMap) {
    if (!WEAPON_CATEGORIES.has(en.category)) continue;
    const stage = detectStage(en.name, en.itemLevel);
    if (!stage) continue;
    const tc = tcMap.get(id);
    const tcName = tc?.name ?? '';
    const family = extractFamilyKey(en.name);
    const isShield = en.category === SHIELD_CATEGORY;

    // Derive job and chainId from family key, then apply overrides
    const derivedJob = deriveJob(family, isShield);
    const derivedChainId = deriveChainId(family, isShield);
    const ov = overrides[String(id)] ?? {};

    weapons.push({
      id,
      chainId: 'chainId' in ov ? ov.chainId : derivedChainId,
      job: 'job' in ov ? ov.job : derivedJob,
      isShield,
      stage: 'stage' in ov ? ov.stage : stage,
      itemLevel: en.itemLevel,
      tcName: 'tcName' in ov ? ov.tcName : tcName,
      enName: en.name,
      iconId: en.iconId,
      _familyKey: family,
      _categoryId: en.category,
    });
  }
  console.log(`Found ${weapons.length} candidate weapons.`);

  // Sort for stable review CSV
  weapons.sort((a, b) =>
    a._familyKey.localeCompare(b._familyKey) || a.itemLevel - b.itemLevel
  );

  // Review CSV
  mkdirSync(resolve(REPO_ROOT, 'docs'), { recursive: true });
  const reviewPath = resolve(REPO_ROOT, 'docs/eureka-weapons-review.csv');
  const header = 'id,category,ilv,stage,familyKey,enName,tcName\n';
  const rows = weapons
    .map((w) => `${w.id},${w._categoryId},${w.itemLevel},${w.stage},${w._familyKey},"${w.enName}","${w.tcName}"`)
    .join('\n');
  writeFileSync(reviewPath, header + rows + '\n');
  console.log(`Wrote review CSV to ${reviewPath}`);

  // Output JSON (chainId/job null for now; Task 5 fills them)
  mkdirSync(resolve(REPO_ROOT, 'src/data'), { recursive: true });
  const jsonPath = resolve(REPO_ROOT, 'src/data/eureka-weapons.json');
  const jsonOut = weapons.map(({ _familyKey, _categoryId, ...rest }) => rest);
  writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2));
  console.log(`Wrote ${jsonOut.length} weapons to ${jsonPath}`);

  // Output materials JSON
  const materials = [];
  for (const [idStr, meta] of Object.entries(MATERIAL_IDS)) {
    const id = Number(idStr);
    const tc = tcMap.get(id);
    const en = enMap.get(id);
    if (!tc || !en) continue; // warning already logged above
    materials.push({
      id,
      tcName: tc.name,
      enName: en.name,
      iconId: tc.iconId,
      category: meta.category,
    });
  }
  writeFileSync(
    resolve(REPO_ROOT, 'src/data/eureka-materials.json'),
    JSON.stringify(materials, null, 2),
  );
  console.log(`Wrote ${materials.length} materials`);
}

main().catch((e) => { console.error(e); process.exit(1); });
