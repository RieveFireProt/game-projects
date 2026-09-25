import { el } from '../../../engine/ui.js';
import { NIGHT_OF_DISCOVERY, NUMERALS, PLANETS, POSITIONS } from './orreryData.js';

// The orrery page from Voss's journal, torn in two. Players drag and turn the
// halves until the torn edges meet; the halves then become one item.

const W = 400;
const H = 540;
const CX = 200;
const CY = 300;
const RINGS = [45, 75, 105, 135];
const SNAP = 40; // SVG units; generous so the join never feels fiddly

const TEAR = (() => {
  const offsets = [-6, 7, -3, 10, -8, 4, -10, 6, 2, -7, 9, -4, 5, -9, 3, 8, -5, 6, -2, 10, -6, 4, -8, 7, -3, 5, -6, 8, -4, 3, 0];
  return offsets.map((dx, i) => [CX + dx, (i / (offsets.length - 1)) * H]);
})();
const LEFT_CLIP = [[0, 0], ...TEAR, [0, H]];
const RIGHT_CLIP = [[W, 0], ...TEAR, [W, H]];
const points = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const polar = (stop, r) => {
  const a = (stop / POSITIONS) * Math.PI * 2;
  return [CX + Math.sin(a) * r, CY - Math.cos(a) * r];
};

// The diagram itself, in page coordinates.
function pageContent() {
  const numerals = NUMERALS.map((n, i) => {
    const [x, y] = polar(i, 162);
    return `<text x="${x}" y="${y}" class="pg-numeral">${n}</text>`;
  }).join('');
  const rings = RINGS.map((r) => `<circle cx="${CX}" cy="${CY}" r="${r}" class="pg-ring"/>`).join('');
  const planets = PLANETS.map((p, i) => {
    const [x, y] = polar(NIGHT_OF_DISCOVERY[i], RINGS[i]);
    return `<circle cx="${x}" cy="${y}" r="9" fill="${p.color}" stroke="#2b1d0e" stroke-width="1.5"/>
      <text x="${x + 15}" y="${y - 10}" class="pg-symbol">${p.symbol}</text>`;
  }).join('');
  const legend = PLANETS.map((p, i) => `<text x="${40 + i * 88}" y="${H - 34}" class="pg-legend">${p.symbol} ${p.name}</text>`).join('');
  return `
    <rect width="${W}" height="${H}" fill="url(#paper)"/>
    <text x="${W / 2}" y="48" class="pg-title">The orrery, as the planets stood</text>
    <text x="${W / 2}" y="76" class="pg-sub">on the night of the 9th</text>
    <line x1="${CX - 150}" y1="${CY}" x2="${CX + 150}" y2="${CY}" class="pg-guide"/>
    <line x1="${CX}" y1="${CY - 150}" x2="${CX}" y2="${CY + 150}" class="pg-guide"/>
    ${rings}
    <circle cx="${CX}" cy="${CY}" r="14" fill="#e8b44a" stroke="#8a5a10" stroke-width="2"/>
    <path d="M${CX - 8} ${CY - 180} L${CX + 8} ${CY - 180} L${CX} ${CY - 166} Z" fill="#2b1d0e"/>
    <text x="${CX + 14}" y="${CY - 186}" class="pg-note">marker</text>
    ${numerals}${planets}${legend}
    <text x="${W / 2}" y="${H - 10}" class="pg-note">count each ring from the marker</text>`;
}

const DEFS = `
  <defs>
    <radialGradient id="paper" cx="45%" cy="40%" r="75%">
      <stop offset="0" stop-color="#f4e9d0"/><stop offset="0.8" stop-color="#e2d0a6"/><stop offset="1" stop-color="#c8b080"/>
    </radialGradient>
    <clipPath id="clip-left"><polygon points="${points(LEFT_CLIP)}"/></clipPath>
    <clipPath id="clip-right"><polygon points="${points(RIGHT_CLIP)}"/></clipPath>
    <filter id="piece-shadow"><feDropShadow dx="3" dy="6" stdDeviation="5" flood-opacity="0.55"/></filter>
  </defs>`;

const half = (side) => `
  <g filter="url(#piece-shadow)">
    <g clip-path="url(#clip-${side})">${pageContent()}</g>
    <polyline points="${points(TEAR)}" fill="none" stroke="rgba(120,90,50,0.6)" stroke-width="2"/>
  </g>`;

// The whole page, once assembled.
export function renderOrreryPage(body) {
  const view = el('div', { class: 'page-view' });
  view.innerHTML = `<svg viewBox="-20 -20 ${W + 40} ${H + 40}" class="journal-sheet">${DEFS}
    <g filter="url(#piece-shadow)">${pageContent()}</g>
    <polyline points="${points(TEAR)}" fill="none" stroke="rgba(120,90,50,0.45)" stroke-width="1.5"/></svg>`;
  body.append(view, el('p', { class: 'caption' }, 'The two halves of the journal page, pieced together.'));
}

// Workspace for fitting the halves together (opened from either half in the satchel).
export function renderTornPage(body, game, api) {
  const hasLeft = game.state.hasItem('page-left');
  const hasRight = game.state.hasItem('page-right');
  const caption = el('p', { class: 'caption' });
  const wrap = el('div', { class: 'assembly' });
  body.append(wrap, caption);

  const HOME = { x: 110, y: 40 };
  const svg = svgEl('svg', { viewBox: '0 0 1000 620', class: 'assembly-board' });
  svg.innerHTML = DEFS;
  wrap.append(svg);

  if (!(hasLeft && hasRight)) {
    const side = hasLeft ? 'left' : 'right';
    const g = svgEl('g', { transform: side === 'left' ? `translate(${HOME.x} ${HOME.y})` : `translate(${HOME.x + 350} ${HOME.y}) rotate(180 ${W * 0.75} ${H / 2})` });
    g.innerHTML = half(side);
    svg.append(g);
    caption.textContent = 'Half of a torn journal page. Without the other half it makes little sense.';
    return;
  }

  // Left half sits still; the right half starts upside down, off to one side.
  const left = svgEl('g', { transform: `translate(${HOME.x} ${HOME.y})` });
  left.innerHTML = half('left');
  const right = svgEl('g', { class: 'draggable' });
  right.innerHTML = half('right');
  svg.append(left, right);
  const piece = { x: 560, y: 60, rot: 180 };
  const place = () => right.setAttribute('transform', `translate(${piece.x} ${piece.y}) rotate(${piece.rot} ${W * 0.75} ${H / 2})`);
  place();

  let done = false;
  const turn = () => {
    if (done) return;
    piece.rot = (piece.rot + 90) % 360;
    place();
    check();
  };
  let drag = null;
  const toSvg = (e) => {
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };
  right.addEventListener('pointerdown', (e) => {
    if (e.button === 2 || done) return;
    e.preventDefault();
    const p = toSvg(e);
    drag = { dx: p.x - piece.x, dy: p.y - piece.y };
    right.setPointerCapture(e.pointerId);
  });
  right.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toSvg(e);
    piece.x = p.x - drag.dx;
    piece.y = p.y - drag.dy;
    place();
  });
  right.addEventListener('pointerup', () => {
    drag = null;
    check();
  });
  right.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    turn();
  });
  right.addEventListener('dblclick', turn);

  function check() {
    if (done || piece.rot !== 0 || Math.hypot(piece.x - HOME.x, piece.y - HOME.y) > SNAP) return;
    done = true;
    piece.x = HOME.x;
    piece.y = HOME.y;
    right.classList.add('snapping');
    place();
    wrap.classList.add('joined');
    game.state.set('page.assembled');
    game.state.removeItem('page-left');
    game.state.removeItem('page-right');
    game.state.addItem('orrery-page');
    right.classList.remove('draggable');
    caption.textContent = 'The torn edges meet exactly. The orrery page is whole again.';
    setTimeout(() => body.contains(wrap) && api.setTitle('The orrery page'), 300);
  }

  caption.replaceChildren(
    el('span', {}, 'Drag the right half into place. '),
    el('button', { class: 'btn subtle small', onclick: turn }, 'Turn it'),
    el('span', {}, ' (or right-click / double-click the piece).'));
}

function svgEl(tag, attrs) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}
