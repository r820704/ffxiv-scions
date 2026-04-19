import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ITEM_TC_URL = 'https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-tc/main/Item.csv';
const ITEM_EN_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/Item.csv';

// ItemUICategory: 1..11 為武器類（主手）、84 為盾（PLD）
// 實作時以 datamining-tc ItemUICategory.csv 驗證一次，若範圍不對依實際值調整
const WEAPON_CATEGORIES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 84]);
const SHIELD_CATEGORY = 84;

async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

function parseRow(line) {
  const out = [];
  let buf = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { out.push(buf); buf = ''; continue; }
    buf += ch;
  }
  out.push(buf);
  return out;
}

function parseItemCsv(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 4) throw new Error('CSV too short');
  const cols = parseRow(lines[1]);
  const nameCol = cols.indexOf('Name');
  const ilvCol = cols.indexOf('Level{Item}');
  const iconCol = cols.indexOf('Icon');
  const categoryCol = cols.indexOf('ItemUICategory');
  if (nameCol < 0 || ilvCol < 0 || iconCol < 0 || categoryCol < 0) {
    throw new Error(`Missing required cols: name=${nameCol} ilv=${ilvCol} icon=${iconCol} cat=${categoryCol}`);
  }
  const map = new Map();
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const row = parseRow(line);
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

function detectStage(enName, itemLevel) {
  const name = enName.trim();
  if (name.startsWith('Antiquated ')) return 'antiquated';
  if (/ Anemos\b/.test(name)) return 'anemos';
  if (/ Pagos \+1$/.test(name)) return 'pagos+1';
  if (/ Pagos$/.test(name)) return 'pagos';
  if (/^Elemental .* \+2$/.test(name)) return 'elemental+2';
  if (/^Elemental .* \+1$/.test(name)) return 'elemental+1';
  if (/^Elemental /.test(name)) return 'elemental';
  if (/^Pyros /.test(name)) return 'pyros';
  if (/^Hydatos .* \+1$/.test(name)) return 'hydatos+1';
  if (/^Hydatos /.test(name)) return 'hydatos';
  if (/ Physeos\b/.test(name) || /^Physeos /.test(name)) return 'physeos';
  if (/^Eurekan /.test(name) && itemLevel === 405) return 'eureka';
  if (/^Eurekan /.test(name) && itemLevel === 400) return 'base-eureka';
  if (/ \+2$/.test(name) && itemLevel === 345) return 'anemos+2';
  if (/ \+1$/.test(name) && itemLevel === 340) return 'anemos+1';
  if (itemLevel === 335) return 'anemos-base';
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

async function main() {
  console.log('Fetching TC Item.csv...');
  const tcText = await fetchCsv(ITEM_TC_URL);
  console.log(`TC CSV: ${tcText.length} bytes`);
  console.log('Fetching EN Item.csv...');
  const enText = await fetchCsv(ITEM_EN_URL);
  console.log(`EN CSV: ${enText.length} bytes`);

  const tcMap = parseItemCsv(tcText);
  const enMap = parseItemCsv(enText);
  console.log(`TC items: ${tcMap.size}, EN items: ${enMap.size}`);

  const weapons = [];
  for (const [id, en] of enMap) {
    if (!WEAPON_CATEGORIES.has(en.category)) continue;
    const stage = detectStage(en.name, en.itemLevel);
    if (!stage) continue;
    const tc = tcMap.get(id);
    const tcName = tc?.name ?? '';
    const family = extractFamilyKey(en.name);
    const isShield = en.category === SHIELD_CATEGORY;
    weapons.push({
      id,
      chainId: null,
      job: null,
      isShield,
      stage,
      itemLevel: en.itemLevel,
      tcName,
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
  mkdirSync(resolve(REPO_ROOT, 'public/data'), { recursive: true });
  const jsonPath = resolve(REPO_ROOT, 'public/data/eureka-weapons.json');
  const jsonOut = weapons.map(({ _familyKey, _categoryId, ...rest }) => rest);
  writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2));
  console.log(`Wrote ${jsonOut.length} weapons to ${jsonPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
