import { el } from '../../../engine/ui.js';
import { COMPASS_FROM_PAGE, ROUTE, SIGHTINGS } from '../story.js';
import { directionalLock, itemCards } from './common.js';

const DRAWERS = [
  'Charts of the Irish Sea, spotted with damp.',
  'Admiralty soundings off the Lizard, in a hand too small to read.',
  null, // the Kestrel Point chart
  'Tide tables for the coast, years out of date.',
  'A folder of pressed seaweed. Not everything here is about the sky.',
];
const CONTENTS = ['almanac'];
const ANSWER = ROUTE.legs.map((d) => COMPASS_FROM_PAGE[d]);
const UNLOCK_DELAY_MS = 900;

// A chest of shallow chart drawers. One holds a coast chart with Voss's road home
// pencilled on it; the locked bottom drawer holds the Almanac and a sighting.
export function openMapChest(game) {
  game.openModal({
    title: 'The map chest',
    theme: 'brass',
    render(body) {
      let alive = true;
      let open = null;
      const { state } = game;
      const view = el('div', { class: 'chest-view' });
      const list = el('div', { class: 'chest-drawers' });

      function draw() {
        list.replaceChildren(
          ...DRAWERS.map((_, i) => el('button', {
            class: `chest-drawer${open === i ? ' open' : ''}`,
            onclick: () => { open = i; game.sfx?.('slide'); draw(); },
          }, el('span', { class: 'pull' }), el('span', {}, `Drawer ${i + 1}`))),
          el('button', {
            class: `chest-drawer locked${open === 'locked' ? ' open' : ''}`,
            onclick: () => { open = 'locked'; draw(); },
          }, el('span', { class: 'pull' }), el('span', {}, state.has('mapchest.open') ? 'Bottom drawer' : 'Bottom drawer (locked)')));
        view.replaceChildren(...content());
      }

      function content() {
        if (open === null) return [el('p', { class: 'caption' }, 'Six shallow drawers of charts. The bottom one has a brass lock set into it, with a knob that pushes up, down, left and right.')];
        if (open === 'locked') {
          if (!state.has('mapchest.open')) {
            return [directionalLock(game, {
              answer: ANSWER,
              engraving: 'THE ROAD HOME, AS THE COMPASS HAS IT',
              caption: 'Push the knob once for each stretch of road, landmark to landmark.',
              onOpen: () => {
                state.set('mapchest.open');
                setTimeout(() => alive && draw(), UNLOCK_DELAY_MS);
              },
            })];
          }
          state.set('sighting.3');
          const s = SIGHTINGS[2];
          return [
            el('p', { class: 'caption' }, 'The bottom drawer slides out. On top of a loose Almanac page lies a card in Voss’s hand:'),
            el('article', { class: 'sighting-card handwritten' }, game.narrator?.button('sighting-3'), el('h3', {}, s.title), el('p', {}, s.text)),
            itemCards(game, CONTENTS, draw),
          ];
        }
        if (DRAWERS[open]) return [el('p', { class: 'caption' }, DRAWERS[open])];
        const chart = el('div', { class: 'coast-chart' });
        chart.innerHTML = coastChartSvg();
        return [chart, el('p', { class: 'caption' }, 'A chart of Kestrel Point. Someone has pencilled a road from the harbour up to the tower.')];
      }

      body.append(el('div', { class: 'chest-layout' }, list, view));
      draw();
      return () => (alive = false);
    },
  });
}

// The chart: coastline, landmarks, the pencilled road and a compass rose turned so that
// north points to the right of the page.
export function coastChartSvg() {
  const STEP = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const LEN = [120, 130, 110, 90, 140, 150];
  let [x, y] = [130, 470];
  const points = [[x, y]];
  ROUTE.legs.forEach((d, i) => {
    x += STEP[d][0] * LEN[i];
    y += STEP[d][1] * LEN[i];
    points.push([x, y]);
  });
  const road = points.map(([px, py]) => `${px},${py}`).join(' ');
  const marks = points.map(([px, py], i) => {
    const name = ROUTE.landmarks[i];
    const last = i === points.length - 1;
    const below = i === 0 || ROUTE.legs[i] === 'up' || ROUTE.legs[i - 1] === 'down';
    return `<g>${last
      ? `<rect x="${px - 12}" y="${py - 24}" width="24" height="28" fill="#6a5238" stroke="#2b1d0e"/><path d="M${px - 16} ${py - 24} Q${px} ${py - 44} ${px + 16} ${py - 24} Z" fill="#8a7050" stroke="#2b1d0e"/>`
      : `<circle cx="${px}" cy="${py}" r="7" fill="#2b1d0e"/>`}
      <text x="${px + 12}" y="${below ? py + 26 : py - 14}" class="cc-label">${name}</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 900 560" role="img" aria-label="A chart of Kestrel Point">
    <defs>
      <radialGradient id="ccPaper" cx="45%" cy="40%" r="80%"><stop offset="0" stop-color="#f1e5c6"/><stop offset="1" stop-color="#d4bf8e"/></radialGradient>
    </defs>
    <rect width="900" height="560" fill="url(#ccPaper)" stroke="#6a5238" stroke-width="4"/>
    <path d="M0 520 C80 500 60 540 150 530 C260 520 300 548 420 540 C520 534 560 556 640 530 C720 504 760 380 820 330 C850 300 880 200 900 180 L900 560 L0 560 Z" fill="#a9c3c0" opacity="0.8"/>
    <path d="M0 520 C80 500 60 540 150 530 C260 520 300 548 420 540 C520 534 560 556 640 530 C720 504 760 380 820 330 C850 300 880 200 900 180" fill="none" stroke="#4a5a5a" stroke-width="2"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${40 + i * 60} ${548 - (i % 3) * 4} q8 -6 16 0 q8 6 16 0" fill="none" stroke="#6a8a8a" stroke-width="1.2"/>`).join('')}
    <text x="450" y="46" class="cc-title">Kestrel Point &amp; the road home from the harbour</text>
    <polyline points="${road}" fill="none" stroke="#3a2a18" stroke-width="3" stroke-dasharray="10 7" stroke-linejoin="round"/>
    ${marks}
    <g transform="translate(760 110)">
      <circle r="52" fill="rgba(255,250,235,0.5)" stroke="#6a5238" stroke-width="2"/>
      <path d="M0 -8 L60 0 L0 8 Z" fill="#2b1d0e"/>
      <path d="M0 -8 L-44 0 L0 8 Z" fill="none" stroke="#2b1d0e" stroke-width="2"/>
      <path d="M-8 0 L0 -40 L8 0 Z" fill="none" stroke="#2b1d0e" stroke-width="2"/>
      <path d="M-8 0 L0 40 L8 0 Z" fill="none" stroke="#2b1d0e" stroke-width="2"/>
      <text x="74" y="7" class="cc-rose">N</text>
    </g>
  </svg>`;
}
