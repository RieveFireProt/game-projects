import { el } from '../../../engine/ui.js';
import { PICTOGRAMS } from './symbols.js';

// The brass-rimmed lens from the orrery, with a small symbol engraved on its rim.
export function lensSvg(size = 320) {
  return `
  <svg viewBox="-160 -160 320 320" width="${size}" height="${size}" role="img" aria-label="A brass-rimmed lens">
    <defs>
      <radialGradient id="lensGlass" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="rgba(235,245,255,0.95)"/>
        <stop offset="0.35" stop-color="rgba(150,185,230,0.55)"/>
        <stop offset="1" stop-color="rgba(40,60,100,0.8)"/>
      </radialGradient>
      <linearGradient id="lensRim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f2d890"/><stop offset="0.5" stop-color="#a47a2c"/><stop offset="1" stop-color="#e2c070"/>
      </linearGradient>
    </defs>
    <circle r="150" fill="url(#lensRim)" stroke="#5a4010" stroke-width="3"/>
    <circle r="112" fill="url(#lensGlass)" stroke="#6a4c14" stroke-width="4"/>
    <ellipse cx="-38" cy="-46" rx="34" ry="16" transform="rotate(-35 -38 -46)" fill="rgba(255,255,255,0.45)"/>
    <g transform="translate(0 131) scale(0.9)">
      <path d="${PICTOGRAMS.lyre}" fill="none" stroke="#3a2808" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;
}

export function renderLens(body) {
  const view = el('div', { class: 'lens-view' });
  view.innerHTML = lensSvg(360);
  body.append(view, el('p', { class: 'caption' },
    'A finely ground lens in a heavy brass rim. A small symbol is engraved into the brass.'));
}
