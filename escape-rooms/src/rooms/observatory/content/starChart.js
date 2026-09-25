import { el } from '../../../engine/ui.js';
import { drawPictogram } from './symbols.js';

// Voss's chart of the northern sky. Lines of height (declination) are labelled down
// the side; the hour markings along the top have been scraped away. The same drawing
// is used for the chart on the wall and for the close-up.

const MAX_DEC = 80;

// Stars as [x fraction across the chart, declination, size], lines as index pairs.
const CONSTELLATIONS = [
  {
    icon: 'lyre', at: [0.515, 40],
    stars: [[0.56, 40, 5], [0.575, 41.6, 1.6], [0.57, 37.4, 2], [0.587, 36.4, 1.8], [0.588, 32.8, 2.2], [0.571, 33.4, 2.2]],
    lines: [[0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [5, 2]],
    ring: 0,
  },
  {
    icon: 'swan', at: [0.735, 62],
    stars: [[0.7, 58, 3.4], [0.72, 52, 2.4], [0.745, 47, 2], [0.765, 44, 2.4], [0.68, 49, 2.2], [0.765, 55, 2.2], [0.79, 57, 1.6]],
    lines: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5], [5, 6]],
  },
  {
    icon: 'eagle', at: [0.855, 15],
    stars: [[0.8, 9, 3.6], [0.793, 11, 1.8], [0.807, 6.8, 1.8], [0.775, 13.5, 2], [0.835, 3.2, 1.8], [0.785, 3, 1.6]],
    lines: [[3, 1], [1, 0], [0, 2], [2, 4], [0, 5]],
  },
  {
    icon: 'club', at: [0.47, 26],
    stars: [[0.4, 30.5, 2.2], [0.43, 31.5, 2.2], [0.425, 37.5, 2], [0.395, 36.8, 2], [0.37, 44, 1.6], [0.455, 45, 1.6], [0.36, 22, 1.8], [0.445, 21.5, 1.8]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [2, 5], [0, 6], [1, 7]],
  },
  {
    icon: 'crown', at: [0.29, 20],
    stars: [[0.26, 27, 1.6], [0.27, 29.4, 1.8], [0.284, 30.6, 2.6], [0.3, 30, 1.8], [0.312, 28.2, 1.6], [0.318, 26.4, 1.5]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  {
    icon: 'crook', at: [0.095, 12],
    stars: [[0.15, 19, 4], [0.17, 27, 2], [0.162, 33.5, 1.8], [0.14, 38.5, 2], [0.12, 31, 1.8], [0.13, 24.5, 1.8]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    icon: 'bear', at: [0.12, 70],
    stars: [[0.03, 62, 2.4], [0.065, 61, 2.2], [0.1, 57.5, 2.2], [0.14, 55.5, 2.4], [0.165, 50.5, 2.2], [0.215, 52.5, 2.2], [0.205, 58.5, 2.4]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  },
  {
    icon: 'serpent', at: [0.37, 76],
    stars: [[0.28, 66, 1.8], [0.33, 70, 2], [0.39, 68, 1.8], [0.45, 63.5, 2], [0.5, 60, 1.8], [0.55, 57.5, 2], [0.6, 54, 2.2], [0.625, 52, 2.4], [0.615, 56, 2], [0.59, 57, 1.8]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 6]],
  },
];

export function drawStarChart(g, W, H) {
  const k = W / 1600; // scale factor for strokes and type
  const L = 150 * k;
  const R = W - 50 * k;
  const T = 100 * k;
  const B = H - 80 * k;
  const X = (f) => L + f * (R - L);
  const Y = (dec) => B - (dec / MAX_DEC) * (B - T);
  const rand = seeded(3);

  const bg = g.createRadialGradient(W * 0.5, H * 0.45, 50 * k, W * 0.5, H * 0.5, W * 0.7);
  bg.addColorStop(0, '#1d2a48');
  bg.addColorStop(1, '#0e1628');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Milky Way: a soft band from the Swan down through the Eagle.
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    const t = rand();
    const x = X(0.64 + t * 0.22) + (rand() - 0.5) * 120 * k;
    const y = Y(75 - t * 75) + (rand() - 0.5) * 60 * k;
    const r = (40 + rand() * 90) * k;
    const blob = g.createRadialGradient(x, y, 0, x, y, r);
    blob.addColorStop(0, 'rgba(120,140,190,0.07)');
    blob.addColorStop(1, 'rgba(120,140,190,0)');
    g.fillStyle = blob;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.restore();

  // Grid: lines of height labelled; hour lines unlabelled.
  g.strokeStyle = 'rgba(214,186,120,0.5)';
  g.fillStyle = '#d9b86a';
  g.lineWidth = 2 * k;
  g.font = `${30 * k}px Palatino, 'Palatino Linotype', Georgia, serif`;
  g.textAlign = 'right';
  g.textBaseline = 'middle';
  for (let dec = 0; dec <= MAX_DEC; dec += 10) {
    g.beginPath();
    g.moveTo(L, Y(dec));
    g.lineTo(R, Y(dec));
    g.stroke();
    g.fillText(dec === 0 ? '0°' : `+${dec}°`, L - 16 * k, Y(dec));
  }
  g.lineWidth = 1.2 * k;
  g.strokeStyle = 'rgba(214,186,120,0.3)';
  for (let h = 0; h <= 12; h++) {
    const x = L + (h / 12) * (R - L);
    g.beginPath();
    g.moveTo(x, T);
    g.lineTo(x, B);
    g.stroke();
  }

  // Scraped-off hour labels along the top.
  for (let h = 0; h <= 12; h++) {
    const x = L + (h / 12) * (R - L);
    g.strokeStyle = 'rgba(200,190,170,0.35)';
    g.lineWidth = 2 * k;
    for (let s = 0; s < 7; s++) {
      g.beginPath();
      const y = T - 48 * k + rand() * 26 * k;
      g.moveTo(x - 22 * k + rand() * 6 * k, y);
      g.lineTo(x + 22 * k - rand() * 6 * k, y + (rand() - 0.5) * 12 * k);
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(x - 26 * k, T - 56 * k, 52 * k, 40 * k);
  }

  // Faint field stars.
  for (let i = 0; i < 700; i++) {
    const r = (rand() ** 3 * 2.2 + 0.6) * k;
    g.fillStyle = `rgba(243,236,214,${0.35 + rand() * 0.5})`;
    g.beginPath();
    g.arc(L + rand() * (R - L), T + rand() * (B - T), r, 0, Math.PI * 2);
    g.fill();
  }

  // Constellations: stick figures, stars, and a pictogram naming each.
  for (const c of CONSTELLATIONS) {
    g.strokeStyle = 'rgba(243,236,214,0.5)';
    g.lineWidth = 2 * k;
    for (const [a, b] of c.lines) {
      g.beginPath();
      g.moveTo(X(c.stars[a][0]), Y(c.stars[a][1]));
      g.lineTo(X(c.stars[b][0]), Y(c.stars[b][1]));
      g.stroke();
    }
    for (const [f, dec, size] of c.stars) {
      const glow = g.createRadialGradient(X(f), Y(dec), 0, X(f), Y(dec), size * 3 * k);
      glow.addColorStop(0, 'rgba(255,250,235,0.5)');
      glow.addColorStop(1, 'rgba(255,250,235,0)');
      g.fillStyle = glow;
      g.fillRect(X(f) - size * 3 * k, Y(dec) - size * 3 * k, size * 6 * k, size * 6 * k);
      g.fillStyle = '#fbf6e6';
      g.beginPath();
      g.arc(X(f), Y(dec), size * 1.6 * k, 0, Math.PI * 2);
      g.fill();
    }
    if (c.ring !== undefined) {
      const [f, dec] = c.stars[c.ring];
      g.strokeStyle = '#d9b86a';
      g.lineWidth = 2 * k;
      g.beginPath();
      g.arc(X(f), Y(dec), 16 * k, 0, Math.PI * 2);
      g.stroke();
    }
    g.strokeStyle = '#e2c275';
    g.lineWidth = 2.6;
    drawPictogram(g, c.icon, X(c.at[0]), Y(c.at[1]), 1.15 * k);
  }

  // Title cartouche and border.
  g.fillStyle = '#d9b86a';
  g.textAlign = 'center';
  g.font = `italic ${34 * k}px Palatino, 'Palatino Linotype', Georgia, serif`;
  g.fillText('The Northern Heavens', W / 2, H - 38 * k);
  g.strokeStyle = '#b08d4a';
  g.lineWidth = 10 * k;
  g.strokeRect(5 * k, 5 * k, W - 10 * k, H - 10 * k);
  g.lineWidth = 2 * k;
  g.strokeRect(20 * k, 20 * k, W - 40 * k, H - 40 * k);
}

function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// Close-up with a magnifying loupe that follows the pointer.
export function openStarChart(game) {
  game.openModal({
    title: 'The star chart',
    theme: 'brass',
    render(body) {
      const chart = el('canvas', { class: 'chart-canvas', width: 1600, height: 1100 });
      drawStarChart(chart.getContext('2d'), 1600, 1100);
      const loupe = el('canvas', { class: 'chart-loupe', width: 240, height: 240, hidden: true });
      const lg = loupe.getContext('2d');
      const frame = el('div', { class: 'chart-frame' }, chart, loupe);

      chart.addEventListener('pointermove', (e) => {
        const r = chart.getBoundingClientRect();
        const sx = ((e.clientX - r.left) / r.width) * chart.width;
        const sy = ((e.clientY - r.top) / r.height) * chart.height;
        const span = 150;
        lg.clearRect(0, 0, 240, 240);
        lg.save();
        lg.beginPath();
        lg.arc(120, 120, 118, 0, Math.PI * 2);
        lg.clip();
        lg.drawImage(chart, sx - span / 2, sy - span / 2, span, span, 0, 0, 240, 240);
        lg.restore();
        loupe.hidden = false;
        loupe.style.left = `${e.clientX - r.left - 120}px`;
        loupe.style.top = `${e.clientY - r.top - 120}px`;
      });
      chart.addEventListener('pointerleave', () => (loupe.hidden = true));

      body.append(frame, el('p', { class: 'caption' },
        'Constellations inked in gold, each marked with a small symbol. The lines of height are labelled down the side, but the hour markings along the top have been scraped away.'));
    },
  });
}
