import { useEffect, useRef } from 'react';

interface OzmaLogoProps {
  size: number;
}

const TAU = Math.PI * 2;
const HOLD = 2500;
const EXPLODE = 500;
const CONVERGE = 600;
const CYCLE = HOLD + EXPLODE + CONVERGE;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SHAPE_NAMES = ['cube', 'pyramid', 'sphere'] as const; void SHAPE_NAMES;

// Moonlight Silver palette
const PALETTE = {
  cube: {
    left: [{ s: 0, c: 'rgba(120,125,135,0.88)' }, { s: 1, c: 'rgba(70,75,85,0.75)' }],
    right: [{ s: 0, c: 'rgba(135,140,152,0.85)' }, { s: 1, c: 'rgba(82,88,98,0.7)' }],
    top: [{ s: 0, c: 'rgba(195,200,215,0.92)' }, { s: 0.5, c: 'rgba(160,168,185,0.85)' }, { s: 1, c: 'rgba(130,138,155,0.78)' }],
    edge: 'rgba(210,215,228,0.7)',
    edgeG: 'rgba(197,182,157,0.5)',
    spec: { cx: -0.15, cy: -0.7, r: 0.1, c: ['rgba(255,255,255,0.95)', 'rgba(220,225,235,0.5)', 'rgba(200,205,220,0)'] },
  },
  pyr: {
    left: [{ s: 0, c: 'rgba(130,135,148,0.88)' }, { s: 1, c: 'rgba(68,72,85,0.72)' }],
    right: [{ s: 0, c: 'rgba(118,122,138,0.82)' }, { s: 1, c: 'rgba(60,65,78,0.65)' }],
    top: [{ s: 0, c: 'rgba(205,210,225,0.92)' }, { s: 1, c: 'rgba(165,170,188,0.82)' }],
    edge: 'rgba(205,210,225,0.7)',
    edgeG: 'rgba(197,182,157,0.5)',
  },
  sph: {
    body: [{ s: 0, c: 'rgba(180,185,200,0.95)' }, { s: 0.35, c: 'rgba(130,135,155,0.92)' }, { s: 0.75, c: 'rgba(80,85,100,0.88)' }, { s: 1, c: 'rgba(55,58,72,0.82)' }],
    rim: 'rgba(160,165,185,0.5)',
    edge: 'rgba(110,115,135,0.6)',
  },
  halo: { outer: 'rgba(180,185,205,0.3)', ring: 'rgba(215,220,235,0.8)' },
  burst: { c1: 'rgba(150,155,175,0.85)', c2: 'rgba(75,78,92,0.5)', edge: 'rgba(160,165,185,0.5)', core: ['rgba(255,255,255,0.95)', 'rgba(210,215,230,0.5)', 'rgba(190,195,215,0)'] },
  particleColors: ['#FFFFFF', '#D0D4E8', '#C0C5DA', '#E0E4F0', '#B8BCD0'],
};

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; decay: number; size: number; color: string;
}

interface Point { x: number; y: number }

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOutExpo(t: number) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function drawPoly(ctx: CanvasRenderingContext2D, pts: Point[], fill?: string | CanvasGradient, stroke?: string) {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

function drawHalo(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, time: number, intensity: number) {
  const pulse = 0.5 + 0.35 * Math.sin(time * 1.5);
  const I = pulse * intensity;
  ctx.save();
  ctx.globalAlpha = I * 0.2;
  ctx.strokeStyle = PALETTE.halo.outer;
  ctx.lineWidth = rx * 0.08;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx * 1.06, ry * 1.06, 0, 0, TAU); ctx.stroke();
  ctx.globalAlpha = I * 0.8;
  ctx.strokeStyle = PALETTE.halo.ring;
  ctx.lineWidth = rx * 0.02;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.stroke();
  for (const off of [0, Math.PI]) {
    const a = time * 0.9 + off;
    const sx = cx + rx * Math.cos(a), sy = cy + ry * Math.sin(a);
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx * 0.1);
    g.addColorStop(0, `rgba(255,255,255,${I})`);
    g.addColorStop(0.3, `rgba(190,195,215,${I * 0.5})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = I;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, rx * 0.1, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawCube(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, alpha: number, time: number) {
  const w = s * 0.28, h = s * 0.42;
  const topPts: Point[] = [{ x: cx, y: cy - h }, { x: cx + w, y: cy - h * 0.4 }, { x: cx, y: cy + h * 0.08 }, { x: cx - w, y: cy - h * 0.4 }];
  const leftPts: Point[] = [{ x: cx - w, y: cy - h * 0.4 }, { x: cx, y: cy + h * 0.08 }, { x: cx, y: cy + h * 0.7 }, { x: cx - w, y: cy + h * 0.22 }];
  const rightPts: Point[] = [{ x: cx + w, y: cy - h * 0.4 }, { x: cx, y: cy + h * 0.08 }, { x: cx, y: cy + h * 0.7 }, { x: cx + w, y: cy + h * 0.22 }];
  ctx.save(); ctx.globalAlpha = alpha;

  let g: CanvasGradient;
  g = ctx.createLinearGradient(cx - w, cy - h * 0.4, cx, cy + h * 0.7);
  PALETTE.cube.left.forEach(s => g.addColorStop(s.s, s.c));
  drawPoly(ctx, leftPts, g, PALETTE.cube.edge.replace('0.7', '0.4'));
  g = ctx.createLinearGradient(cx + w, cy - h * 0.4, cx, cy + h * 0.7);
  PALETTE.cube.right.forEach(s => g.addColorStop(s.s, s.c));
  drawPoly(ctx, rightPts, g, PALETTE.cube.edge.replace('0.7', '0.35'));
  g = ctx.createLinearGradient(cx, cy - h, cx, cy + h * 0.08);
  PALETTE.cube.top.forEach(s => g.addColorStop(s.s, s.c));
  drawPoly(ctx, topPts, g, PALETTE.cube.edge);

  // Sheen
  ctx.save();
  ctx.beginPath();
  topPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))); ctx.closePath();
  leftPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))); ctx.closePath();
  rightPts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))); ctx.closePath();
  ctx.clip();
  const sheenY = cy - h + h * 1.7 * ((Math.sin(time * 0.5) + 1) / 2);
  ctx.globalAlpha = alpha * 0.2;
  const shG = ctx.createLinearGradient(cx - w, sheenY - s * 0.08, cx + w, sheenY + s * 0.08);
  shG.addColorStop(0, 'rgba(255,255,255,0)'); shG.addColorStop(0.4, 'rgba(255,255,255,0.65)');
  shG.addColorStop(0.5, 'rgba(255,255,255,0.85)'); shG.addColorStop(0.6, 'rgba(255,255,255,0.65)');
  shG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shG; ctx.fillRect(cx - w - 5, sheenY - s * 0.06, w * 2 + 10, s * 0.12);
  ctx.restore();

  // Gold edges
  ctx.globalAlpha = alpha * 0.55; ctx.strokeStyle = PALETTE.cube.edgeG; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(cx, cy - h); ctx.lineTo(cx + w, cy - h * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - h); ctx.lineTo(cx - w, cy - h * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + h * 0.08); ctx.lineTo(cx, cy + h * 0.7); ctx.stroke();
  ctx.globalAlpha = alpha * 0.25; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - w, cy - h * 0.4); ctx.lineTo(cx - w, cy + h * 0.22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + w, cy - h * 0.4); ctx.lineTo(cx + w, cy + h * 0.22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - w, cy + h * 0.22); ctx.lineTo(cx, cy + h * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + w, cy + h * 0.22); ctx.lineTo(cx, cy + h * 0.7); ctx.stroke();

  // Specular
  const sp = PALETTE.cube.spec;
  ctx.globalAlpha = alpha * 0.85;
  const hlG = ctx.createRadialGradient(cx + w * sp.cx, cy + h * sp.cy, 0, cx + w * sp.cx, cy + h * sp.cy, s * sp.r);
  sp.c.forEach((c, i) => hlG.addColorStop(i === 0 ? 0 : i === 1 ? 0.3 : 1, c));
  ctx.fillStyle = hlG; ctx.beginPath(); ctx.arc(cx + w * sp.cx, cy + h * sp.cy, s * sp.r, 0, TAU); ctx.fill();

  ctx.restore();
}

function drawPyramid(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, alpha: number, time: number) {
  const w = s * 0.4, topY = cy - s * 0.25, botY = cy + s * 0.4;
  const midY = topY + (botY - topY) * 0.12;
  const leftFace: Point[] = [{ x: cx - w, y: topY }, { x: cx, y: midY }, { x: cx, y: botY }];
  const rightFace: Point[] = [{ x: cx + w, y: topY }, { x: cx, y: midY }, { x: cx, y: botY }];
  const topFace: Point[] = [{ x: cx - w, y: topY }, { x: cx + w, y: topY }, { x: cx + w * 0.06, y: midY }, { x: cx - w * 0.06, y: midY }];
  ctx.save(); ctx.globalAlpha = alpha;

  let g: CanvasGradient;
  g = ctx.createLinearGradient(cx - w, topY, cx, botY);
  PALETTE.pyr.left.forEach(s => g.addColorStop(s.s, s.c));
  drawPoly(ctx, leftFace, g, PALETTE.pyr.edge.replace('0.7', '0.4'));
  g = ctx.createLinearGradient(cx + w, topY, cx, botY);
  PALETTE.pyr.right.forEach(s => g.addColorStop(s.s, s.c));
  drawPoly(ctx, rightFace, g, PALETTE.pyr.edge.replace('0.7', '0.35'));
  g = ctx.createLinearGradient(cx, topY, cx, midY);
  PALETTE.pyr.top.forEach(s => g.addColorStop(s.s, s.c));
  drawPoly(ctx, topFace, g, PALETTE.pyr.edge);

  // Sheen
  ctx.save(); ctx.beginPath();
  leftFace.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))); ctx.closePath();
  rightFace.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))); ctx.closePath();
  ctx.clip();
  const sheenY = topY + (botY - topY) * ((Math.sin(time * 0.45) + 1) / 2);
  ctx.globalAlpha = alpha * 0.15;
  const shG = ctx.createLinearGradient(cx - w, sheenY - s * 0.06, cx + w, sheenY + s * 0.06);
  shG.addColorStop(0, 'rgba(255,255,255,0)'); shG.addColorStop(0.45, 'rgba(255,255,255,0.7)');
  shG.addColorStop(0.55, 'rgba(255,255,255,0.7)'); shG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shG; ctx.fillRect(cx - w - 5, sheenY - s * 0.05, w * 2 + 10, s * 0.1);
  ctx.restore();

  // Gold edges
  ctx.globalAlpha = alpha * 0.55; ctx.strokeStyle = PALETTE.pyr.edgeG; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(cx - w, topY); ctx.lineTo(cx + w, topY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - w, topY); ctx.lineTo(cx, botY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + w, topY); ctx.lineTo(cx, botY); ctx.stroke();

  // Specular
  ctx.globalAlpha = alpha * 0.75;
  const hlG = ctx.createRadialGradient(cx - w * 0.3, topY + 4, 0, cx - w * 0.3, topY + 4, s * 0.09);
  hlG.addColorStop(0, 'rgba(255,255,255,0.92)'); hlG.addColorStop(0.3, 'rgba(255,255,255,0.4)'); hlG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hlG; ctx.beginPath(); ctx.arc(cx - w * 0.3, topY + 4, s * 0.09, 0, TAU); ctx.fill();

  ctx.restore();
}

function drawSphere(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, alpha: number, time: number) {
  const r = s * 0.36;
  ctx.save(); ctx.globalAlpha = alpha;

  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
  PALETTE.sph.body.forEach(s => g.addColorStop(s.s, s.c));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = PALETTE.sph.edge; ctx.lineWidth = 1; ctx.stroke();

  // Sheen
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, TAU); ctx.clip();
  const sx1 = cx + Math.cos(time * 0.4) * r * 0.5, sy1 = cy + Math.sin(time * 0.4) * r * 0.3;
  ctx.globalAlpha = alpha * 0.15;
  const shG = ctx.createRadialGradient(sx1, sy1, 0, sx1, sy1, r * 0.6);
  shG.addColorStop(0, 'rgba(255,255,255,0.5)'); shG.addColorStop(0.3, 'rgba(255,255,255,0.15)'); shG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shG; ctx.beginPath(); ctx.arc(sx1, sy1, r * 0.6, 0, TAU); ctx.fill();
  ctx.restore();

  // Specular
  ctx.globalAlpha = alpha * 0.9;
  const hlG = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 0, cx - r * 0.3, cy - r * 0.35, r * 0.28);
  hlG.addColorStop(0, 'rgba(255,255,255,0.95)'); hlG.addColorStop(0.12, 'rgba(255,255,255,0.55)');
  hlG.addColorStop(0.35, 'rgba(255,255,255,0.12)'); hlG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hlG; ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.28, 0, TAU); ctx.fill();

  // Hot dot
  ctx.globalAlpha = alpha;
  const dG = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.38, 0, cx - r * 0.25, cy - r * 0.38, r * 0.08);
  dG.addColorStop(0, 'rgba(255,255,255,1)'); dG.addColorStop(0.4, 'rgba(255,255,255,0.5)'); dG.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = dG; ctx.beginPath(); ctx.arc(cx - r * 0.25, cy - r * 0.38, r * 0.08, 0, TAU); ctx.fill();

  // Rim
  ctx.globalAlpha = alpha * 0.3; ctx.strokeStyle = PALETTE.sph.rim; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, r - 1, 4.2, 6.0); ctx.stroke();

  ctx.restore();
}

function drawStarburst(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, alpha: number, _time: number, seed: number) {
  const rng = mulberry32(seed);
  const spikes = 10 + Math.floor(rng() * 4);
  const pts: Point[] = [];
  for (let i = 0; i < spikes; i++) {
    const a = (TAU * i) / spikes + (rng() - 0.5) * 0.3;
    const outerR = s * (0.28 + rng() * 0.2);
    const innerR = s * (0.06 + rng() * 0.08);
    pts.push({ x: cx + outerR * Math.cos(a), y: cy + outerR * Math.sin(a) });
    const a2 = a + (TAU / spikes) * 0.5;
    pts.push({ x: cx + innerR * Math.cos(a2), y: cy + innerR * Math.sin(a2) });
  }
  ctx.save(); ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.4);
  g.addColorStop(0, PALETTE.burst.c1); g.addColorStop(1, PALETTE.burst.c2);
  ctx.fillStyle = g; ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PALETTE.burst.edge; ctx.lineWidth = 1; ctx.stroke();

  ctx.globalAlpha = alpha * 0.9;
  const cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.12);
  PALETTE.burst.core.forEach((c, i) => cG.addColorStop(i === 0 ? 0 : i === 1 ? 0.3 : 1, c));
  ctx.fillStyle = cG; ctx.beginPath(); ctx.arc(cx, cy, s * 0.12, 0, TAU); ctx.fill();

  ctx.globalAlpha = alpha * 0.6;
  for (let i = 0; i < pts.length; i += 2) {
    const pt = pts[i]!;
    const tG = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, s * 0.03);
    tG.addColorStop(0, 'rgba(255,255,255,0.9)'); tG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = tG; ctx.beginPath(); ctx.arc(pt.x, pt.y, s * 0.03, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

const drawFuncs = [drawCube, drawPyramid, drawSphere];

export default function OzmaLogo({ size }: OzmaLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTransRef = useRef(-1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasSize = size * dpr;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    function spawnSpark(n: number) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, sp = 0.003 + Math.random() * 0.01;
        particlesRef.current.push({
          x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: 0.01 + Math.random() * 0.015,
          size: 0.01 + Math.random() * 0.03,
          color: PALETTE.particleColors[Math.floor(Math.random() * PALETTE.particleColors.length)] ?? '#FFFFFF',
        });
      }
    }

    function animate(ts: number) {
      if (!ctx) return;
      const w = canvasSize, h = canvasSize;
      const time = ts / 1000;
      const elapsed = ts % (CYCLE * 3);
      const cycleIdx = Math.floor(elapsed / CYCLE);
      const pos = elapsed - cycleIdx * CYCLE;
      const formIdx = cycleIdx % 3;

      let phase: 'hold' | 'explode' | 'converge';
      let t: number;

      if (pos < HOLD) {
        phase = 'hold'; t = 0;
      } else if (pos < HOLD + EXPLODE) {
        phase = 'explode'; t = (pos - HOLD) / EXPLODE;
        if (cycleIdx !== lastTransRef.current) { lastTransRef.current = cycleIdx; spawnSpark(40); }
        if (Math.random() < 0.4) spawnSpark(2);
      } else {
        phase = 'converge'; t = (pos - HOLD - EXPLODE) / CONVERGE;
      }

      // Update particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= p.decay; });

      // Render
      const cx = w / 2, cy = h / 2, s = w * 0.8;
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.45);
      bg.addColorStop(0, 'rgba(35,30,55,0.1)'); bg.addColorStop(1, 'rgba(18,16,28,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      const nextIdx = (formIdx + 1) % 3;
      const haloI = phase === 'hold' ? 1 : phase === 'explode' ? 1 + t * 0.8 : 1.8 - t * 0.8;
      drawHalo(ctx, cx, cy, w * 0.42, w * 0.1, time, haloI);

      if (phase === 'hold') {
        drawFuncs[formIdx]!(ctx, cx, cy, s, 1, time);
      } else if (phase === 'explode') {
        const et = easeOutExpo(t);
        if (1 - et > 0.01) drawFuncs[formIdx]!(ctx, cx, cy, s, 1 - et, time);
        drawStarburst(ctx, cx, cy, s, et, time, formIdx * 137 + 42);
      } else {
        const ct = easeInOutCubic(t);
        drawStarburst(ctx, cx, cy, s, 1 - ct, time, formIdx * 137 + 42);
        if (ct > 0.01) drawFuncs[nextIdx]!(ctx, cx, cy, s, ct, time);
      }

      // Edge glow during morph
      if (phase !== 'hold') {
        const intensity = phase === 'explode' ? t : 1 - t;
        ctx.save(); ctx.globalAlpha = intensity * 0.2;
        const eg = ctx.createRadialGradient(cx, cy, s * 0.12, cx, cy, s * 0.5);
        eg.addColorStop(0, 'rgba(200,200,220,0)'); eg.addColorStop(0.6, 'rgba(200,200,220,0)'); eg.addColorStop(1, 'rgba(200,200,220,0.5)');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, s * 0.5, 0, TAU); ctx.fill();
        ctx.restore();
      }

      // Particles
      const scale = w * 0.75;
      particlesRef.current.forEach(p => {
        if (p.life <= 0) return;
        const px2 = cx + p.x * scale, py2 = cy + p.y * scale, pS = p.size * scale;
        ctx.globalAlpha = p.life * 0.8;
        const pg = ctx.createRadialGradient(px2, py2, 0, px2, py2, pS);
        pg.addColorStop(0, p.color); pg.addColorStop(1, 'rgba(150,150,200,0)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px2, py2, pS, 0, TAU); ctx.fill();
      });
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}
