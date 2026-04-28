// Source: SQUARE ENIX game assets (via XIVAPI / datamining mirrors).
// One-shot: downloads 4 Eureka zone map images, resizes to 1024×1024, and
// re-encodes as WebP @ q=80 into public/data/eureka-maps/.
// See THIRD-PARTY-NOTICES.md for license details.
//
// To run: npm run fetch:maps

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(REPO_ROOT, 'public/data/eureka-maps');

// Map metadata resolved via XIVAPI:
//   curl https://xivapi.com/territorytype/<id> -> .Map.MapFilename
// Eureka Anemos  : territory 732 -> map 414, /m/z3fa/z3fa.00.jpg
// Eureka Pagos   : territory 763 -> map 467, /m/z3fb/z3fb.00.jpg
// Eureka Pyros   : territory 795 -> map 484, /m/z3fc/z3fc.00.jpg
// Eureka Hydatos : territory 827 -> map 515, /m/z3fd/z3fd.01.jpg
//
// XIVAPI hosts the unpacked client image at https://xivapi.com<MapFilename>.
// Source format is JPEG at 2048×2048; we downscale to 1024×1024 and re-encode
// as WebP @ q=80 — the modal renders at ~400px so the source is wildly
// oversized, and WebP cuts the per-file size from ~900KB to ~120KB.
const ZONES = [
  { id: 'anemos',  url: 'https://xivapi.com/m/z3fa/z3fa.00.jpg' },
  { id: 'pagos',   url: 'https://xivapi.com/m/z3fb/z3fb.00.jpg' },
  { id: 'pyros',   url: 'https://xivapi.com/m/z3fc/z3fc.00.jpg' },
  { id: 'hydatos', url: 'https://xivapi.com/m/z3fd/z3fd.01.jpg' },
];

const TARGET_SIZE = 1024;
const WEBP_QUALITY = 80;

async function fetchMap(zone) {
  const outPath = resolve(OUT_DIR, `${zone.id}.webp`);
  if (existsSync(outPath)) {
    console.log(`[skip] ${zone.id}.webp already exists at ${outPath}`);
    return { zone: zone.id, status: 'skipped' };
  }

  try {
    const res = await fetch(zone.url);
    if (!res.ok) {
      console.warn(
        `[warn] failed to fetch ${zone.id}: HTTP ${res.status} from ${zone.url}.\n` +
        `       Manually download from ${zone.url} and run again.`,
      );
      return { zone: zone.id, status: 'failed' };
    }
    const srcBuf = Buffer.from(await res.arrayBuffer());
    const out = await sharp(srcBuf)
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'cover' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    writeFileSync(outPath, out);
    console.log(
      `[ok]   ${zone.id}.webp  src=${srcBuf.length}B  out=${out.length}B  -> ${outPath}`,
    );
    return { zone: zone.id, status: 'ok', srcBytes: srcBuf.length, outBytes: out.length };
  } catch (err) {
    console.warn(
      `[warn] failed to fetch ${zone.id}: ${err?.message ?? err}.\n` +
      `       Manually download from ${zone.url} and run again.`,
    );
    return { zone: zone.id, status: 'error' };
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Output dir: ${OUT_DIR}`);

  const results = [];
  for (const zone of ZONES) {
    results.push(await fetchMap(zone));
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const failed = results.length - ok - skipped;
  console.log(`\nDone. ok=${ok}, skipped=${skipped}, failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });
