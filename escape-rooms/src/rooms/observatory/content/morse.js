import { el } from '../../../engine/ui.js';

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

// The register's paper tape: ink marks for `text` (letters and spaces), short for a
// dot and long for a dash, with wider gaps between letters and words.
export function tapeSvg(text) {
  const DOT = 8;
  const DASH = 26;
  const GAP = 8;
  const LETTER = 26;
  const WORD = 60;
  let x = 30;
  const marks = [];
  for (const ch of text) {
    if (ch === ' ') {
      x += WORD - LETTER;
      continue;
    }
    for (const sym of MORSE[ch]) {
      const w = sym === '.' ? DOT : DASH;
      marks.push(`<rect x="${x}" y="27" width="${w}" height="6" rx="3"/>`);
      x += w + GAP;
    }
    x += LETTER - GAP;
  }
  const width = x + 30;
  return `<svg viewBox="0 0 ${width} 60" class="tape" role="img" aria-label="A paper tape of ink marks">
    <rect width="${width}" height="60" fill="#efe4c4" stroke="#b8a070"/>
    <line x1="0" y1="30" x2="${width}" y2="30" stroke="rgba(120,90,40,0.15)"/>
    <g fill="#1a2a50">${marks.join('')}</g>
  </svg>`;
}

// The telegraphist's code card from Voss's desk drawer.
export function renderMorseCard(body) {
  const rows = Object.entries(MORSE).map(([ch, code]) => el('div', { class: 'morse-row' },
    el('b', {}, ch),
    el('span', { class: 'morse-code' }, code.replace(/\./g, '●').replace(/-/g, '▬'))));
  body.append(
    el('div', { class: 'morse-card' },
      el('h3', {}, 'The Telegraph Code'),
      el('p', { class: 'morse-sub' }, '● a short mark    ▬ a long mark'),
      el('div', { class: 'morse-grid' }, rows)),
    el('p', { class: 'caption' }, 'A printed card, soft with handling. Someone has pencilled “Letters: a short pause. Words: a long one.” along the bottom.'));
}
