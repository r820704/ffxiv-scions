// Cross-check our Eureka gear data against the canonical datamining sources.
//
// What it covers (auto-checkable):
//   1. src/data/eureka-weapons.json     — tcName / enName per Item ID
//   2. src/data/eureka-materials.json   — tcName / enName per Item ID
//   3. src/data/eureka-chains.ts        — displayName base ≡ anemos-base tcName
//   4. src/data/eureka-armor-names.ts   — anemos armor base names exist in TC
//   5. src/data/eureka-armor-names.ts   — elemental armor base names exist in TC
//
// What it does NOT cover (needs in-game / wiki verification):
//   - Stage upgrade material quantities  (src/data/eureka-stage-costs.ts)
//   - Armor upgrade material quantities  (src/data/eureka-armor-costs.ts)
//
// Usage:
//   npm run audit:data
//
// Exit code: 1 if any issue found, 0 if clean.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const TC_URL = 'https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-tc/main/Item.csv';
const EN_URL = 'https://raw.githubusercontent.com/xivapi/ffxiv-datamining/master/csv/en/Item.csv';

function parseCsv(text) {
  const rows = [];
  let row = [], buf = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { buf += '"'; i++; } else inQ = false; }
      else buf += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(buf); buf = ''; }
      else if (ch === '\n') { row.push(buf); rows.push(row); row = []; buf = ''; }
      else if (ch !== '\r') buf += ch;
    }
  }
  if (buf || row.length) { row.push(buf); rows.push(row); }
  return rows;
}

// SaintCoinach-style CSV layout:
//   row 0: index numbers (0,1,2,...)
//   row 1: column names ('Singular','Name','Icon',...)
//   row 2: column types
//   row 3+: data
// Use the column literally named "Name" to match the build-eureka-weapons.mjs convention.
async function loadItemMap(url, variant) {
  const txt = await fetch(url).then((r) => r.text());
  const rows = parseCsv(txt);
  let headerIdx = -1;
  for (const idx of [0, 1, 2]) {
    if (rows[idx] && rows[idx].some((c) => c === 'Name')) { headerIdx = idx; break; }
  }
  if (headerIdx < 0) throw new Error(`(${variant}) cannot find "Name" header column`);
  const cols = rows[headerIdx];
  const nameCol = cols.indexOf('Name');
  const singularCol = cols.indexOf('Singular');
  const dataStart = headerIdx + 2;
  const map = new Map();
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;
    const id = Number(row[0]);
    if (!Number.isFinite(id)) continue;
    const name = row[nameCol] ?? row[singularCol] ?? '';
    if (!name) continue;
    map.set(id, name);
  }
  return map;
}

const weapons = JSON.parse(readFileSync(resolve(REPO_ROOT, 'src/data/eureka-weapons.json'), 'utf8'));
const materials = JSON.parse(readFileSync(resolve(REPO_ROOT, 'src/data/eureka-materials.json'), 'utf8'));
const chainsTs = readFileSync(resolve(REPO_ROOT, 'src/data/eureka-chains.ts'), 'utf8');
const armorTs = readFileSync(resolve(REPO_ROOT, 'src/data/eureka-armor-names.ts'), 'utf8');

const chains = [];
const chainRe = /\{\s*chainId:\s*'([^']+)',\s*job:\s*'([^']+)',\s*isShield:\s*(true|false),\s*displayName:\s*'([^']+)'(?:,\s*mirrorsChainId:\s*'([^']+)')?\s*\}/g;
let cm;
while ((cm = chainRe.exec(chainsTs))) {
  chains.push({ chainId: cm[1], job: cm[2], isShield: cm[3] === 'true', displayName: cm[4], mirrorsChainId: cm[5] });
}

const anemosArmor = {};
const anemosBlock = armorTs.match(/ANEMOS_ARMOR_BASE_NAMES[\s\S]*?\n\};/);
if (anemosBlock) {
  const rowRe = /(\w{3}):\s*\{\s*head:\s*'([^']+)',\s*body:\s*'([^']+)',\s*hands:\s*'([^']+)',\s*legs:\s*'([^']+)',\s*feet:\s*'([^']+)'\s*\}/g;
  let r;
  while ((r = rowRe.exec(anemosBlock[0]))) {
    anemosArmor[r[1]] = { head: r[2], body: r[3], hands: r[4], legs: r[5], feet: r[6] };
  }
}

const elementalArmor = {};
const elementalBlock = armorTs.match(/ELEMENTAL_ARMOR_SLOT_NAMES[\s\S]*?\n\};/);
if (elementalBlock) {
  const rowRe = /(\w+):\s*\{\s*head:\s*'([^']+)',\s*body:\s*'([^']+)',\s*hands:\s*'([^']+)',\s*legs:\s*'([^']+)',\s*feet:\s*'([^']+)'\s*\}/g;
  let r;
  while ((r = rowRe.exec(elementalBlock[0]))) {
    elementalArmor[r[1]] = { head: r[2], body: r[3], hands: r[4], legs: r[5], feet: r[6] };
  }
}

console.log('Fetching Item.csv (TC + EN)...');
const [tcMap, enMap] = await Promise.all([loadItemMap(TC_URL, 'TC'), loadItemMap(EN_URL, 'EN')]);
console.log(`TC: ${tcMap.size} items, EN: ${enMap.size} items\n`);

const issues = [];

// 1. Weapons
console.log('=== AUDIT 1: weapons.json tcName / enName ===');
let weaponTcMismatch = 0, weaponEnMismatch = 0, weaponMissing = 0;
for (const w of weapons) {
  const canonTc = tcMap.get(w.id);
  const canonEn = enMap.get(w.id);
  if (!canonTc && !canonEn) {
    issues.push(`[WEAPON ${w.id}] missing in BOTH TC and EN datamining: ${w.tcName} / ${w.enName}`);
    weaponMissing++;
    continue;
  }
  if (canonTc !== undefined && canonTc !== w.tcName) {
    issues.push(`[WEAPON ${w.id}] tcName mismatch: ours="${w.tcName}" canonical="${canonTc}" (chain=${w.chainId}, stage=${w.stage})`);
    weaponTcMismatch++;
  }
  if (canonEn !== undefined && canonEn !== w.enName) {
    issues.push(`[WEAPON ${w.id}] enName mismatch: ours="${w.enName}" canonical="${canonEn}" (chain=${w.chainId}, stage=${w.stage})`);
    weaponEnMismatch++;
  }
}
console.log(`  Checked: ${weapons.length} weapons | tcName mismatches: ${weaponTcMismatch} | enName mismatches: ${weaponEnMismatch} | missing: ${weaponMissing}\n`);

// 2. Materials
console.log('=== AUDIT 2: materials.json tcName / enName ===');
let matTcMismatch = 0, matEnMismatch = 0;
for (const mat of materials) {
  const canonTc = tcMap.get(mat.id);
  const canonEn = enMap.get(mat.id);
  if (canonTc !== undefined && canonTc !== mat.tcName) {
    issues.push(`[MAT ${mat.id}] tcName mismatch: ours="${mat.tcName}" canonical="${canonTc}"`);
    matTcMismatch++;
  }
  if (canonEn !== undefined && canonEn !== mat.enName) {
    issues.push(`[MAT ${mat.id}] enName mismatch: ours="${mat.enName}" canonical="${canonEn}"`);
    matEnMismatch++;
  }
}
console.log(`  Checked: ${materials.length} materials | tcName mismatches: ${matTcMismatch} | enName mismatches: ${matEnMismatch}\n`);

// 3. Chain displayName base
console.log('=== AUDIT 3: chains.ts displayName base ≡ anemos-base tcName ===');
let chainDisplayMismatch = 0;
for (const ch of chains) {
  const parts = ch.displayName.split(' · ');
  if (parts.length < 2) {
    issues.push(`[CHAIN ${ch.chainId}] displayName format unexpected: "${ch.displayName}"`);
    chainDisplayMismatch++;
    continue;
  }
  const base = parts[parts.length - 1].trim();
  const anemosBase = weapons.find((w) => w.chainId === ch.chainId && w.stage === 'anemos-base');
  if (!anemosBase) {
    issues.push(`[CHAIN ${ch.chainId}] no anemos-base weapon in weapons.json`);
    chainDisplayMismatch++;
    continue;
  }
  if (anemosBase.tcName !== base) {
    issues.push(`[CHAIN ${ch.chainId}] displayName base="${base}" but anemos-base.tcName="${anemosBase.tcName}"`);
    chainDisplayMismatch++;
  }
}
console.log(`  Checked: ${chains.length} chains | mismatches: ${chainDisplayMismatch}\n`);

// 4 + 5. Armor names (reverse lookup: each hardcoded base name must appear in TC Item.csv)
const tcNameToItems = new Map();
for (const [id, name] of tcMap) {
  if (!tcNameToItems.has(name)) tcNameToItems.set(name, []);
  tcNameToItems.get(name).push(id);
}

console.log('=== AUDIT 4: anemos armor base names exist in TC datamining ===');
let anemosFound = 0, anemosMissing = 0;
for (const [job, slots] of Object.entries(anemosArmor)) {
  for (const [slot, name] of Object.entries(slots)) {
    if ((tcNameToItems.get(name) ?? []).length === 0) {
      issues.push(`[ARMOR-ANEMOS ${job}/${slot}] name "${name}" NOT FOUND in TC Item.csv`);
      anemosMissing++;
    } else {
      anemosFound++;
    }
  }
}
console.log(`  Checked: ${Object.keys(anemosArmor).length} jobs × 5 slots = ${Object.keys(anemosArmor).length * 5} | found: ${anemosFound} | missing: ${anemosMissing}\n`);

console.log('=== AUDIT 5: elemental armor base names exist in TC datamining ===');
let elementalFound = 0, elementalMissing = 0;
for (const [set, slots] of Object.entries(elementalArmor)) {
  for (const [slot, name] of Object.entries(slots)) {
    if ((tcNameToItems.get(name) ?? []).length === 0) {
      issues.push(`[ARMOR-ELEMENTAL ${set}/${slot}] name "${name}" NOT FOUND in TC Item.csv`);
      elementalMissing++;
    } else {
      elementalFound++;
    }
  }
}
console.log(`  Checked: ${Object.keys(elementalArmor).length} sets × 5 slots = ${Object.keys(elementalArmor).length * 5} | found: ${elementalFound} | missing: ${elementalMissing}\n`);

// Summary
console.log('=== SUMMARY ===');
if (issues.length === 0) {
  console.log('All auto-checkable data aligned with canonical sources. 0 issues.');
} else {
  console.log(`Found ${issues.length} issue(s):`);
  for (const i of issues) console.log('  - ' + i);
}

// Write report to tmp/audit/ (gitignored)
const tmpDir = resolve(REPO_ROOT, 'tmp/audit');
mkdirSync(tmpDir, { recursive: true });
const report = [
  '# Eureka Gear data audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  `TC source: ${TC_URL}`,
  `EN source: ${EN_URL}`,
  '',
  '## Counts',
  '',
  `- Weapons checked: ${weapons.length} — tcName mismatches: ${weaponTcMismatch} | enName mismatches: ${weaponEnMismatch} | missing: ${weaponMissing}`,
  `- Materials checked: ${materials.length} — tcName mismatches: ${matTcMismatch} | enName mismatches: ${matEnMismatch}`,
  `- Chains checked: ${chains.length} — displayName base mismatches: ${chainDisplayMismatch}`,
  `- Anemos armor names: ${anemosFound}/${anemosFound + anemosMissing} found in TC datamining`,
  `- Elemental armor names: ${elementalFound}/${elementalFound + elementalMissing} found in TC datamining`,
  '',
  '## Issues',
  '',
  ...(issues.length === 0 ? ['_None._'] : issues.map((i) => `- ${i}`)),
].join('\n');
writeFileSync(resolve(tmpDir, 'eureka-data-audit.md'), report);
console.log(`\nReport: tmp/audit/eureka-data-audit.md`);

process.exit(issues.length === 0 ? 0 : 1);
