import { el } from '../../../engine/ui.js';

// Two brass rings of letters. The outer ring (marked CLEAR) is fixed; the inner ring
// (marked SECRET) turns. Its setting is kept in the game state.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const STEP = 360 / 26;

export const wheelOffset = (state) => state.get('wheel.offset', 0);

// Plain letter shown on the outer ring above a given inner (cipher) letter.
export function decodeLetter(state, c) {
  const i = ALPHABET.indexOf(c);
  return i < 0 ? c : ALPHABET[(i + wheelOffset(state) + 26) % 26];
}

export function cipherWheel(game, { size = 420, onTurn } = {}) {
  const { state } = game;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '-218 -218 436 436');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.classList.add('cipher-wheel');

  const ring = (letters, r, cls) => letters.split('').map((ch, i) => {
    const a = (i * STEP * Math.PI) / 180;
    return `<text x="${Math.sin(a) * r}" y="${-Math.cos(a) * r}" transform="rotate(${i * STEP} ${Math.sin(a) * r} ${-Math.cos(a) * r})" class="${cls}">${ch}</text>`;
  }).join('');
  const spokes = Array.from({ length: 26 }, (_, i) => {
    const a = ((i + 0.5) * STEP * Math.PI) / 180;
    return `<line x1="${Math.sin(a) * 150}" y1="${-Math.cos(a) * 150}" x2="${Math.sin(a) * 196}" y2="${-Math.cos(a) * 196}"/>`;
  }).join('');

  svg.innerHTML = `
    <defs>
      <radialGradient id="cwOuter" cx="40%" cy="35%"><stop offset="0" stop-color="#e8c878"/><stop offset="1" stop-color="#8a6420"/></radialGradient>
      <radialGradient id="cwInner" cx="40%" cy="35%"><stop offset="0" stop-color="#7a5a2a"/><stop offset="1" stop-color="#3a2810"/></radialGradient>
    </defs>
    <circle r="214" fill="url(#cwOuter)" stroke="#4a3208" stroke-width="3"/>
    <g stroke="rgba(60,40,10,0.5)" stroke-width="1.2">${spokes}</g>
    ${ring(ALPHABET, 178, 'cw-outer')}
    <text y="205" class="cw-mark">CLEAR</text>
    <g class="cw-inner-ring">
      <circle r="150" fill="url(#cwInner)" stroke="#c9a24a" stroke-width="3"/>
      ${ring(ALPHABET, 128, 'cw-inner')}
      <text y="60" class="cw-mark inner">SECRET</text>
      <circle r="18" fill="#c9a24a" stroke="#4a3208" stroke-width="2"/>
    </g>`;

  const inner = svg.querySelector('.cw-inner-ring');
  let angle = wheelOffset(state) * STEP;
  const show = () => (inner.style.transform = `rotate(${angle}deg)`);
  const turn = (step) => {
    angle += step * STEP;
    state.set('wheel.offset', (wheelOffset(state) + step + 26) % 26);
    show();
    onTurn?.();
  };
  show();

  // Drag the inner ring round; it settles on the nearest letter.
  let drag = null;
  const angleAt = (e) => {
    const r = svg.getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  };
  inner.addEventListener('pointerdown', (e) => {
    drag = { start: angleAt(e), base: angle, moved: 0 };
    inner.setPointerCapture(e.pointerId);
    inner.classList.add('dragging');
  });
  inner.addEventListener('pointermove', (e) => {
    if (!drag) return;
    let d = angleAt(e) - drag.start;
    d = ((d + 540) % 360) - 180;
    angle = drag.base + d;
    show();
  });
  inner.addEventListener('pointerup', () => {
    if (!drag) return;
    inner.classList.remove('dragging');
    const steps = Math.round((angle - drag.base) / STEP);
    angle = drag.base;
    drag = null;
    if (steps) turn(steps);
    else show();
  });

  const controls = el('div', { class: 'cw-controls' },
    el('button', { class: 'combo-btn', 'aria-label': 'Turn inner ring anticlockwise', onclick: () => turn(-1) }, '⟲'),
    el('span', { class: 'cw-hint' }, 'Drag the inner ring, or use the arrows'),
    el('button', { class: 'combo-btn', 'aria-label': 'Turn inner ring clockwise', onclick: () => turn(1) }, '⟳'));

  return el('div', { class: 'cw-wrap' }, svg, controls);
}

export function renderCipherWheel(body, game) {
  body.append(cipherWheel(game), el('p', { class: 'caption' },
    'Two brass rings of letters. The outer ring is stamped CLEAR, the inner SECRET, and the inner ring turns.'));
}
