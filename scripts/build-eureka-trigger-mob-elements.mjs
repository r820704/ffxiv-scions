// Source: snorux/EurekaHelper (XIV/Zones/*.cs, EurekaElement values).
// See THIRD-PARTY-NOTICES.md for license details.
//
// One-shot script. Run: npm run build:trigger-elements
// Updates `element` field in src/data/eureka-trigger-mob-data.ts in place,
// preserving hand-written per-entry comments. Exits non-zero if any entry in
// the TS file is not present in EurekaHelper, so missing data is loud.

import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const TS_FILE = resolve(REPO_ROOT, 'src/data/eureka-trigger-mob-data.ts');

const EUREKA_HELPER_BASE =
  'https://raw.githubusercontent.com/snorux/EurekaHelper/main/EurekaHelper/XIV/Zones';
const ZONE_FILES = [
  `${EUREKA_HELPER_BASE}/EurekaAnemos.cs`,
  `${EUREKA_HELPER_BASE}/EurekaPagos.cs`,
  `${EUREKA_HELPER_BASE}/EurekaPyros.cs`,
  `${EUREKA_HELPER_BASE}/EurekaHydatos.cs`,
];

// Each EurekaFate entry has the shape:
//   "<NM name>", "<abbr>", new Vector2(...), "<trigger mob name>", new Vector2(...),
//   EurekaWeather.X, EurekaWeather.Y, EurekaElement.<NM elem>, EurekaElement.<trigger elem>, ...
// We capture the trigger mob name and the SECOND EurekaElement.
const TRIGGER_RE =
  /"([^"]+)",\s*new Vector2\([^)]+\),\s*EurekaWeather\.\w+,\s*EurekaWeather\.\w+,\s*EurekaElement\.\w+,\s*EurekaElement\.(\w+)/g;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

async function loadElementMap() {
  const map = new Map();
  for (const url of ZONE_FILES) {
    const text = await fetchText(url);
    for (const m of text.matchAll(TRIGGER_RE)) {
      const name = m[1];
      const elem = m[2];
      if (elem === 'Unknown') continue;
      map.set(name, elem);
    }
  }
  return map;
}

function applyEdits(ts, elementMap) {
  const found = new Set();
  const missing = [];

  // Match each entry line: indent + "Name": { ... },  optional trailing comment
  const ENTRY_RE = /^(\s*)"([^"]+)":\s*(\{[^}]*\})(,?)([^\n]*)$/gm;

  const updated = ts.replace(ENTRY_RE, (full, indent, name, body, comma, trailing) => {
    if (!elementMap.has(name)) {
      missing.push(name);
      return full;
    }
    found.add(name);
    const elem = elementMap.get(name);

    // Update or insert element field.
    let newBody;
    if (/element:\s*'[^']+'/.test(body)) {
      newBody = body.replace(/element:\s*'[^']+'/, `element: '${elem}'`);
    } else {
      // Insert before nmTw to keep field order stable.
      newBody = body.replace(/,\s*nmTw:/, `, element: '${elem}', nmTw:`);
    }

    // Drop "// element: not found" trailing comment if present.
    const newTrailing = trailing.replace(/\s*\/\/\s*element: not found\s*$/, '');

    return `${indent}"${name}": ${newBody}${comma}${newTrailing}`;
  });

  return { updated, found: found.size, missing };
}

async function main() {
  const elementMap = await loadElementMap();
  console.log(`EurekaHelper: ${elementMap.size} trigger mob → element entries`);

  const ts = readFileSync(TS_FILE, 'utf8');
  const { updated, found, missing } = applyEdits(ts, elementMap);

  if (missing.length) {
    console.error(`\nMissing in EurekaHelper (entries left untouched):`);
    for (const n of missing) console.error(`  - ${n}`);
    process.exitCode = 1;
  }

  if (updated === ts) {
    console.log('No changes.');
    return;
  }
  writeFileSync(TS_FILE, updated);
  console.log(`Wrote ${TS_FILE} (${found} entries updated).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
