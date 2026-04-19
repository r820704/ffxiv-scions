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

async function main() {
  const csvs = {};
  for (const [key, filename] of Object.entries(CSV_FILES)) {
    const text = await fetchCsv(filename);
    csvs[key] = parseCsv(text);
    console.log(`  ${key}: ${csvs[key].rows.length} rows, ${csvs[key].headers.length} cols`);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  // Placeholder — Task 4 implements transforms.
  writeFileSync(
    resolve(OUT_DIR, 'eureka-gear.json'),
    JSON.stringify([], null, 2),
  );
  writeFileSync(
    resolve(OUT_DIR, 'eureka-materials.json'),
    JSON.stringify([], null, 2),
  );

  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
