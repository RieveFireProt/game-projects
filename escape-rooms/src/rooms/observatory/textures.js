import * as THREE from 'three';
import { seededRandom } from '../../engine/build.js';

// Procedural canvas textures for the observatory. Each returns { map, bump? }
// with the texture already set to repeat; callers set .repeat for their surface.

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, g: c.getContext('2d') };
}

function texture(c, { srgb = true, repeat = [1, 1] } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
}

const hsl = (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

// Draws fn at x, x - w and x + w so shapes crossing an edge tile seamlessly.
function wrapX(w, x, fn) {
  fn(x);
  if (x < 0) fn(x + w);
  fn(x - w);
}

// Wavy grain lines along a strip (x0..x1, y0..y1), horizontal.
function grain(g, rand, x0, y0, x1, y1, { count = 26, dark = 0.18, light = 0.08 } = {}) {
  const h = y1 - y0;
  for (let i = 0; i < count; i++) {
    const y = y0 + rand() * h;
    const amp = 1 + rand() * 4;
    const freq = 0.004 + rand() * 0.01;
    const phase = rand() * 10;
    g.strokeStyle = rand() < 0.7 ? `rgba(0,0,0,${rand() * dark})` : `rgba(255,230,190,${rand() * light})`;
    g.lineWidth = 0.6 + rand() * 1.8;
    g.beginPath();
    for (let x = x0; x <= x1; x += 8) {
      const yy = y + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 3.1) * amp * 0.3;
      if (x === x0) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
  }
}

export function floorboards() {
  const W = 1024;
  const PLANK = 128;
  const { c, g } = canvas(W);
  const { c: bc, g: bg } = canvas(W);
  const rand = seededRandom(11);
  bg.fillStyle = '#fff';
  bg.fillRect(0, 0, W, W);

  for (let row = 0; row < W / PLANK; row++) {
    const y = row * PLANK;
    let x = -rand() * 500;
    while (x < W) {
      const len = 380 + rand() * 520;
      const light = 20 + rand() * 9;
      const hue = 24 + rand() * 8;
      wrapX(W, x, (px) => {
        g.save();
        g.beginPath();
        g.rect(px, y, len, PLANK);
        g.clip();
        g.fillStyle = hsl(hue, 42, light);
        g.fillRect(px, y, len, PLANK);
        grain(g, seededRandom(Math.floor(x * 7 + row * 131) + 5000), px, y, px + len, y + PLANK, { count: 34 });
        // Worn centre line where feet have passed.
        const wear = g.createLinearGradient(0, y, 0, y + PLANK);
        wear.addColorStop(0, 'rgba(0,0,0,0.12)');
        wear.addColorStop(0.5, 'rgba(255,220,170,0.04)');
        wear.addColorStop(1, 'rgba(0,0,0,0.12)');
        g.fillStyle = wear;
        g.fillRect(px, y, len, PLANK);
        g.restore();
        // Seams and nails.
        g.fillStyle = 'rgba(10,5,2,0.85)';
        g.fillRect(px, y, 3, PLANK);
        g.fillRect(px, y, len, 3);
        g.fillStyle = 'rgba(20,12,6,0.9)';
        for (const nx of [px + 16, px + len - 16]) {
          g.beginPath();
          g.arc(nx, y + 30, 3, 0, Math.PI * 2);
          g.arc(nx, y + PLANK - 30, 3, 0, Math.PI * 2);
          g.fill();
        }
        bg.fillStyle = '#000';
        bg.fillRect(px, y, 4, PLANK);
        bg.fillRect(px, y, len, 4);
      });
      x += len;
    }
  }
  return { map: texture(c), bump: texture(bc, { srgb: false }) };
}

export function stoneWall() {
  const W = 1024;
  const H = 512;
  const COURSE = H / 4;
  const MORTAR = 7;
  const { c, g } = canvas(W, H);
  const { c: bc, g: bg } = canvas(W, H);
  const rand = seededRandom(23);
  g.fillStyle = hsl(34, 14, 30);
  g.fillRect(0, 0, W, H);
  bg.fillStyle = '#111';
  bg.fillRect(0, 0, W, H);

  for (let row = 0; row < 4; row++) {
    const y = row * COURSE;
    let x = -rand() * 300;
    while (x < W) {
      const len = 190 + rand() * 200;
      const light = 36 + rand() * 12;
      const hue = 30 + rand() * 10;
      const seed = 1 + Math.floor(rand() * 1e6);
      wrapX(W, x, (px) => {
        const bx = px + MORTAR / 2;
        const by = y + MORTAR / 2;
        const bw = len - MORTAR;
        const bh = COURSE - MORTAR;
        const r = seededRandom(seed);
        g.save();
        g.beginPath();
        g.roundRect(bx, by, bw, bh, 5);
        g.clip();
        g.fillStyle = hsl(hue, 16, light);
        g.fillRect(bx, by, bw, bh);
        for (let i = 0; i < 260; i++) {
          g.fillStyle = r() < 0.5 ? `rgba(0,0,0,${r() * 0.12})` : `rgba(255,245,225,${r() * 0.08})`;
          const s = 1 + r() * 4;
          g.fillRect(bx + r() * bw, by + r() * bh, s, s);
        }
        // Soft stain blotches.
        for (let i = 0; i < 3; i++) {
          const cx = bx + r() * bw;
          const cy = by + r() * bh;
          const rad = 20 + r() * 50;
          const stain = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
          stain.addColorStop(0, `rgba(40,30,20,${0.05 + r() * 0.1})`);
          stain.addColorStop(1, 'rgba(40,30,20,0)');
          g.fillStyle = stain;
          g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
        }
        // Chiselled edges: light top, dark bottom.
        g.fillStyle = 'rgba(255,240,215,0.10)';
        g.fillRect(bx, by, bw, 5);
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.fillRect(bx, by + bh - 6, bw, 6);
        g.restore();

        bg.fillStyle = `rgb(${200 + r() * 40},${200 + r() * 40},${200 + r() * 40})`;
        bg.beginPath();
        bg.roundRect(bx, by, bw, bh, 8);
        bg.fill();
      });
      x += len;
    }
  }
  return { map: texture(c), bump: texture(bc, { srgb: false }) };
}

export function wainscot() {
  const W = 512;
  const { c, g } = canvas(W);
  const { c: bc, g: bg } = canvas(W);
  const rand = seededRandom(31);
  g.fillStyle = hsl(22, 38, 14);
  g.fillRect(0, 0, W, W);
  // Vertical grain for stiles, horizontal for rails.
  g.save();
  g.translate(W, 0);
  g.rotate(Math.PI / 2);
  grain(g, rand, 0, 0, W, W, { count: 70, dark: 0.25, light: 0.06 });
  g.restore();

  const [x0, y0, x1, y1] = [58, 70, W - 58, W - 60];
  const bevel = 22;
  bg.fillStyle = '#666';
  bg.fillRect(0, 0, W, W);
  // Bevels: light top/left, dark bottom/right.
  const face = (color, pts) => {
    g.fillStyle = color;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.fill();
  };
  face('rgba(255,215,160,0.10)', [[x0, y0], [x1, y0], [x1 - bevel, y0 + bevel], [x0 + bevel, y0 + bevel]]);
  face('rgba(255,215,160,0.06)', [[x0, y0], [x0 + bevel, y0 + bevel], [x0 + bevel, y1 - bevel], [x0, y1]]);
  face('rgba(0,0,0,0.35)', [[x0, y1], [x0 + bevel, y1 - bevel], [x1 - bevel, y1 - bevel], [x1, y1]]);
  face('rgba(0,0,0,0.25)', [[x1, y0], [x1, y1], [x1 - bevel, y1 - bevel], [x1 - bevel, y0 + bevel]]);
  g.fillStyle = 'rgba(255,220,170,0.05)';
  g.fillRect(x0 + bevel, y0 + bevel, x1 - x0 - bevel * 2, y1 - y0 - bevel * 2);
  g.strokeStyle = 'rgba(0,0,0,0.55)';
  g.lineWidth = 3;
  g.strokeRect(x0, y0, x1 - x0, y1 - y0);
  // Joint lines between neighbouring panels.
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.fillRect(0, 0, 3, W);

  const grad = bg.createLinearGradient(x0, y0, x0 + bevel, y0 + bevel);
  grad.addColorStop(0, '#444');
  grad.addColorStop(1, '#eee');
  bg.fillStyle = grad;
  bg.fillRect(x0, y0, x1 - x0, y1 - y0);
  bg.fillStyle = '#eee';
  bg.fillRect(x0 + bevel, y0 + bevel, x1 - x0 - bevel * 2, y1 - y0 - bevel * 2);
  return { map: texture(c), bump: texture(bc, { srgb: false }) };
}

export function domeBoards() {
  const W = 512;
  const { c, g } = canvas(W);
  const rand = seededRandom(47);
  const boards = 4;
  const bw = W / boards;
  for (let i = 0; i < boards; i++) {
    g.fillStyle = hsl(205, 14, 22 + rand() * 5);
    g.fillRect(i * bw, 0, bw, W);
    g.save();
    g.translate((i + 1) * bw, 0);
    g.rotate(Math.PI / 2);
    grain(g, rand, 0, 0, W, bw, { count: 10, dark: 0.12, light: 0.04 });
    g.restore();
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(i * bw, 0, 3, W);
  }
  return { map: texture(c) };
}

// Neutral grain meant to be tinted by the material colour.
export function woodGrain(seed = 5) {
  const W = 512;
  const { c, g } = canvas(W);
  const rand = seededRandom(seed);
  g.fillStyle = '#d8d0c4';
  g.fillRect(0, 0, W, W);
  grain(g, rand, 0, 0, W, W, { count: 90, dark: 0.22, light: 0.1 });
  return { map: texture(c) };
}

export function persianRug() {
  const W = 1024;
  const C = W / 2;
  const { c, g } = canvas(W);
  const rand = seededRandom(59);
  const RED = '#6e1c1a';
  const NAVY = '#1c2440';
  const GOLD = '#c19a4b';
  const IVORY = '#d9c9a3';

  g.fillStyle = RED;
  g.fillRect(0, 0, W, W);

  const ring = (r, width, color) => {
    g.strokeStyle = color;
    g.lineWidth = width;
    g.beginPath();
    g.arc(C, C, r, 0, Math.PI * 2);
    g.stroke();
  };
  const around = (r, count, fn) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      g.save();
      g.translate(C + Math.cos(a) * r, C + Math.sin(a) * r);
      g.rotate(a + Math.PI / 2);
      fn(i);
      g.restore();
    }
  };
  const diamond = (s, color) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, -s);
    g.lineTo(s * 0.6, 0);
    g.lineTo(0, s);
    g.lineTo(-s * 0.6, 0);
    g.fill();
  };
  const star = (points, r1, r2, color) => {
    g.fillStyle = color;
    g.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? r2 : r1;
      const a = (i / (points * 2)) * Math.PI * 2;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.fill();
  };

  // Field scattered with small motifs.
  for (let i = 0; i < 420; i++) {
    const a = rand() * Math.PI * 2;
    const r = 150 + Math.sqrt(rand()) * 250;
    g.save();
    g.translate(C + Math.cos(a) * r, C + Math.sin(a) * r);
    g.rotate(a);
    diamond(5 + rand() * 4, rand() < 0.5 ? 'rgba(193,154,75,0.55)' : 'rgba(28,36,64,0.7)');
    g.restore();
  }

  // Borders from the outside in.
  ring(C - 20, 40, NAVY);
  around(C - 20, 72, (i) => diamond(12, i % 2 ? GOLD : IVORY));
  ring(C - 44, 4, GOLD);
  ring(C - 62, 26, '#4a1210');
  around(C - 62, 48, () => star(4, 9, 4, GOLD));
  ring(C - 78, 3, IVORY);

  // Central medallion.
  g.save();
  g.translate(C, C);
  star(16, 170, 120, NAVY);
  star(16, 150, 110, GOLD);
  star(16, 140, 104, NAVY);
  star(8, 96, 60, RED);
  star(8, 70, 40, GOLD);
  star(8, 52, 30, NAVY);
  g.beginPath();
  g.fillStyle = IVORY;
  g.arc(0, 0, 12, 0, Math.PI * 2);
  g.fill();
  g.restore();
  around(128, 16, () => diamond(10, IVORY));

  // Wool fuzz and wear.
  for (let i = 0; i < 16000; i++) {
    g.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,235,200,0.05)';
    g.fillRect(rand() * W, rand() * W, 2, 2);
  }
  const wear = g.createRadialGradient(C, C, 40, C, C, C);
  wear.addColorStop(0, 'rgba(255,230,200,0.06)');
  wear.addColorStop(1, 'rgba(0,0,0,0.15)');
  g.fillStyle = wear;
  g.fillRect(0, 0, W, W);
  return { map: texture(c) };
}

// Soft round glow for flames and lamp chimneys (additive sprites).
export function glow() {
  const W = 128;
  const { c, g } = canvas(W);
  const grad = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.15, 'rgba(255,255,255,0.6)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, W);
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// The moon, with a few maria so it doesn't read as a lamp.
export function moonFace() {
  const W = 256;
  const { c, g } = canvas(W);
  const rand = seededRandom(71);
  g.fillStyle = '#f1eedf';
  g.fillRect(0, 0, W, W);
  for (let i = 0; i < 14; i++) {
    const x = 40 + rand() * 176;
    const y = 40 + rand() * 176;
    const r = 10 + rand() * 40;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(120,125,135,0.35)');
    grad.addColorStop(1, 'rgba(120,125,135,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// Paper covered in illegible handwriting, for documents seen from across the room.
export function scribbles(seed, { w = 256, h = 360, paper = '#efe3c6', ink = 'rgba(40,28,18,0.75)', top = 30, header = null } = {}) {
  const { c, g } = canvas(w, h);
  const rand = seededRandom(seed);
  g.fillStyle = paper;
  g.fillRect(0, 0, w, h);
  const edge = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  edge.addColorStop(0, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(90,60,20,0.25)');
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
  if (header) {
    g.fillStyle = 'rgba(30,30,40,0.85)';
    g.font = `bold ${Math.round(w / 16)}px Georgia, serif`;
    g.textAlign = 'center';
    g.fillText(header, w / 2, top);
    g.fillRect(w * 0.1, top + 8, w * 0.8, 2);
    top += 30;
  }
  g.strokeStyle = ink;
  g.lineWidth = 1.4;
  for (let y = top; y < h - 30; y += 18) {
    let x = 18 + rand() * 10;
    const end = w - 18 - (rand() < 0.2 ? rand() * w * 0.5 : 0);
    g.beginPath();
    g.moveTo(x, y);
    while (x < end) {
      const word = 12 + rand() * 30;
      for (let i = 0; i < word; i += 3) g.lineTo(x + i, y + Math.sin(i * 1.3 + rand()) * 3 - rand() * 2);
      x += word + 6;
      g.moveTo(x, y);
    }
    g.stroke();
  }
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// Crisp text on a plain ground: plaques, labels, stencils.
export function label(text, { w = 256, h = 64, bg = null, color = '#2b1d0e', font = 'Georgia, serif', weight = '', size = 0.55 } = {}) {
  const { c, g } = canvas(w, h);
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.fillStyle = color;
  g.font = `${weight} ${Math.round(h * size)}px ${font}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const lines = text.split('\n');
  lines.forEach((line, i) => g.fillText(line, w / 2, h * ((i + 0.5) / lines.length)));
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// Cloth-bound book spine: gold bands and a title panel, tinted by material colour.
export function bookSpine() {
  const { c, g } = canvas(64, 256);
  const rand = seededRandom(83);
  g.fillStyle = '#d0c8bc';
  g.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(0,0,0,${rand() * 0.06})`;
    g.fillRect(rand() * 64, rand() * 256, 2, 2);
  }
  g.fillStyle = '#e8c878';
  for (const y of [18, 26, 222, 230]) g.fillRect(0, y, 64, 4);
  g.fillStyle = 'rgba(20,10,5,0.55)';
  g.fillRect(10, 60, 44, 70);
  g.fillStyle = '#e8c878';
  for (let y = 72; y < 122; y += 12) g.fillRect(18, y, 28, 3);
  return texture(c);
}

// One-off painted texture: draw(g, w, h, rand) on a fresh canvas.
export function paint(w, h, draw, seed = 1) {
  const { c, g } = canvas(w, h);
  draw(g, w, h, seededRandom(seed));
  const t = texture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
