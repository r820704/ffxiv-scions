// scripts/build-og-image.mjs
//
// Re-generates the FFXIV Scions OG share card at public/brand/og-image.png.
// Edit the four strings in the EDITABLE block below (wordmark / features /
// slogan) and run:
//
//   node scripts/build-og-image.mjs
//
// ───────────────────────────────────────────────────────────────────────────
// REQUIRED FONTS (install once, system-wide so sharp/librsvg can find them):
//
//   # CJK fallback (provides Noto Sans/Serif CJK TC)
//   sudo apt install fonts-noto-cjk
//
//   # Noto Serif TC (matches the site's --font-title fallback chain)
//   sudo mkdir -p /usr/share/fonts/truetype/noto-serif-tc
//   sudo curl -L https://github.com/google/fonts/raw/main/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf \
//     -o /usr/share/fonts/truetype/noto-serif-tc/NotoSerifTC-VF.ttf
//
//   # LXGW WenKai 霞鶩文楷 (preferred --font-title)
//   sudo mkdir -p /usr/share/fonts/truetype/lxgw
//   sudo curl -L https://github.com/lxgw/LxgwWenKai/releases/latest/download/LXGWWenKai-Regular.ttf \
//     -o /usr/share/fonts/truetype/lxgw/LXGWWenKai-Regular.ttf
//
//   # Cinzel Decorative (English wordmark — matches the in-app PageHead)
//   sudo mkdir -p /usr/share/fonts/truetype/cinzel
//   sudo curl -L https://github.com/google/fonts/raw/main/ofl/cinzeldecorative/CinzelDecorative-Black.ttf \
//     -o /usr/share/fonts/truetype/cinzel/CinzelDecorative-Black.ttf
//
//   sudo fc-cache -f
//
// ───────────────────────────────────────────────────────────────────────────
// COMPOSITION (canvas 1200×630):
//
//   layer 0 — background: radial gradient (cx=22%, cy=50%, r=70%)
//             #1d1830 → #12101c → #08060f
//   layer 1 — warm amber glow (centred on lantern crystal, radius 560):
//             #ffe6a3@0.72 → #e8b362@0.42 → #8a5d28@0.20 → transparent
//   layer 2 — faint inset border ornament (rgba gold, inset 24, alpha 0.18)
//   layer 3 — lantern PNG (source = public/brand/favicon-512.png)
//             trimmed, resized to height 380, positioned left=200, top=-15
//             from centred (so the lantern sits up-left of canvas centre)
//   layer 4 — text (SVG):
//
//   wordmark
//     font           Cinzel Decorative, weight 900
//     font-size      115px
//     letter-spacing 6px
//     fill           #e8d8b0
//     y baselines    210 (top), 325 (bottom)
//     SCIONS right edge clears the canvas right by ~106px
//
//   features row
//     font           LXGW WenKai (霞鶩文楷)
//     font-size      36px
//     letter-spacing 2px
//     fill           #c9b88a
//     y baseline     415
//
//   slogan
//     font           LXGW WenKai
//     font-size      42px
//     letter-spacing 5px
//     fill           #e8d8b0
//     y baseline     490
//     visual centre  y ≈ 475 (used to position the diamond ornament)
//
//   diamond ornament
//     16×16 polygon centred on (textLeft+8, 475), fill = #c9b88a
//
//   textLeft (left edge of all four text rows) = 555
//
// ───────────────────────────────────────────────────────────────────────────

import sharp from 'sharp';

// ─────────── EDITABLE ───────────
const WORDMARK_TOP = 'FFXIV';
const WORDMARK_BOTTOM = 'SCIONS';
const FEATURES_ROW = '優雷卡天氣·文理技能·禁地兵裝';
const SLOGAN = '為你的冒險點一盞燈';
// ────────────────────────────────

const OUT = '/workspaces/FFXIV/public/brand/og-image.png';
const LANTERN = '/workspaces/FFXIV/public/brand/favicon-512.png';

const W = 1200;
const H = 630;

const TEXT_COLOR = '#e8d8b0';
const TEXT_MUTED = '#c9b88a';

// ── background radial gradient ──
const bgSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg" cx="22%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1d1830"/>
      <stop offset="55%" stop-color="#12101c"/>
      <stop offset="100%" stop-color="#08060f"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
</svg>`);

// ── faint inset border ornament ──
const borderSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}"
        fill="none" stroke="#bfa46a" stroke-opacity="0.18" stroke-width="1.2"/>
</svg>`);

// ── lantern ──
const LANTERN_HEIGHT = 380;
const lanternTrim = await sharp(LANTERN).trim().png().toBuffer();
const lantern = await sharp(lanternTrim)
  .resize({ height: LANTERN_HEIGHT, fit: 'inside' })
  .png()
  .toBuffer();
const lanternMeta = await sharp(lantern).metadata();
const lanternLeft = 200;
const lanternTop = Math.round((H - (lanternMeta.height ?? LANTERN_HEIGHT)) / 2) - 15;
const lanternHeightVisible = lanternMeta.height ?? LANTERN_HEIGHT;

// ── warm amber glow centred on the crystal ──
const glowCenterX = lanternLeft + (lanternMeta.width ?? LANTERN_HEIGHT) / 2;
const glowCenterY = lanternTop + lanternHeightVisible * 0.45;
const glowRadius = 560;
const glowSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="${glowCenterX}" cy="${glowCenterY}" r="${glowRadius}" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffe6a3" stop-opacity="0.72"/>
      <stop offset="22%" stop-color="#e8b362" stop-opacity="0.42"/>
      <stop offset="50%" stop-color="#8a5d28" stop-opacity="0.20"/>
      <stop offset="80%" stop-color="#3a2a18" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
</svg>`);

// ── text overlay ──
const textLeft = 555;
const textSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .wordmark {
      font-family: 'Cinzel Decorative';
      font-weight: 900;
      font-size: 115px;
      letter-spacing: 6px;
      fill: ${TEXT_COLOR};
    }
    .features {
      font-family: 'LXGW WenKai';
      font-size: 36px;
      letter-spacing: 2px;
      fill: ${TEXT_MUTED};
    }
    .slogan {
      font-family: 'LXGW WenKai';
      font-size: 42px;
      letter-spacing: 5px;
      fill: ${TEXT_COLOR};
    }
    .diamond {
      fill: ${TEXT_MUTED};
    }
  </style>
  <text x="${textLeft}" y="210" class="wordmark">${WORDMARK_TOP}</text>
  <text x="${textLeft}" y="325" class="wordmark">${WORDMARK_BOTTOM}</text>
  <text x="${textLeft}" y="415" class="features">${FEATURES_ROW}</text>
  <polygon
    points="${textLeft + 1},475 ${textLeft + 8},467 ${textLeft + 15},475 ${textLeft + 8},483"
    class="diamond"
  />
  <text x="${textLeft + 28}" y="490" class="slogan">${SLOGAN}</text>
</svg>`);

await sharp(bgSvg)
  .composite([
    { input: glowSvg, top: 0, left: 0 },
    { input: borderSvg, top: 0, left: 0 },
    { input: lantern, top: lanternTop, left: lanternLeft },
    { input: textSvg, top: 0, left: 0 },
  ])
  .png()
  .toFile(OUT);

console.log(`✓ ${OUT} (${W}×${H})`);
