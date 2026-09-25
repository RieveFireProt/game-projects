import { el } from '../../../engine/ui.js';
import { NIGHT_OF_DISCOVERY, NUMERALS, PLANETS, POSITIONS } from './orreryData.js';
import { lensSvg } from './lens.js';

const RINGS = [70, 115, 160, 205];
const UNLOCK_DELAY_MS = 900;

export const ringFlag = (i) => `orrery.ring.${i}`;
export const ringStop = (state, i) => state.get(ringFlag(i), PLANETS[i].start);

// Turn each planet's ring in clicks until they stand as they did on the night of the
// discovery. The base then opens to reveal the lens.
export function openOrrery(game) {
  game.openModal({
    title: 'The orrery',
    theme: 'brass',
    render(body) {
      const { state } = game;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '-280 -280 560 560');
      svg.classList.add('orrery-svg');
      const controls = el('div', { class: 'orrery-controls' });
      const caption = el('p', { class: 'caption' });
      const reward = el('div', { class: 'orrery-reward' });
      let alive = true;

      const numerals = NUMERALS.map((n, i) => {
        const a = (i / POSITIONS) * Math.PI * 2;
        return `<text x="${Math.sin(a) * 245}" y="${-Math.cos(a) * 245}" class="orr-numeral">${n}</text>
          <line x1="${Math.sin(a) * 222}" y1="${-Math.cos(a) * 222}" x2="${Math.sin(a) * 232}" y2="${-Math.cos(a) * 232}" class="orr-tick"/>`;
      }).join('');
      svg.innerHTML = `
        <defs>
          <radialGradient id="orrBase" cx="40%" cy="35%"><stop offset="0" stop-color="#6a4a24"/><stop offset="1" stop-color="#2a1a0c"/></radialGradient>
          <radialGradient id="orrSun" cx="35%" cy="35%"><stop offset="0" stop-color="#fff0b0"/><stop offset="1" stop-color="#d08a20"/></radialGradient>
        </defs>
        <circle r="268" fill="url(#orrBase)" stroke="#c9a24a" stroke-width="6"/>
        <circle r="228" fill="none" stroke="rgba(201,162,74,0.5)" stroke-width="1.5"/>
        ${numerals}
        <path d="M-12 -262 L12 -262 L0 -236 Z" fill="#e8cf8a" stroke="#6a4a14"/>
        ${RINGS.map((r, i) => `<circle r="${r}" class="orr-track" data-ring="${i}"/>`).join('')}
        ${PLANETS.map((p, i) => `
          <g class="orr-planet" data-ring="${i}">
            <line x1="0" y1="0" x2="0" y2="${-RINGS[i]}" class="orr-arm"/>
            <circle cy="${-RINGS[i]}" r="${13 + i * 2}" fill="${p.color}" stroke="#1a1208" stroke-width="2"/>
            <text y="${-RINGS[i] + 5}" class="orr-sym">${p.symbol}</text>
          </g>`).join('')}
        <circle r="30" fill="url(#orrSun)" stroke="#8a5a10" stroke-width="3"/>`;

      const planetEls = [...svg.querySelectorAll('.orr-planet')];
      // Track cumulative angles so the CSS transition always turns the short way.
      const angles = PLANETS.map((_, i) => ringStop(state, i) * (360 / POSITIONS));

      function turn(i, step) {
        if (state.has('orrery.solved')) return;
        const stop = (ringStop(state, i) + step + POSITIONS) % POSITIONS;
        state.set(ringFlag(i), stop);
        angles[i] += step * (360 / POSITIONS);
        draw();
        check();
      }

      function check() {
        if (!PLANETS.every((_, i) => ringStop(state, i) === NIGHT_OF_DISCOVERY[i])) return;
        state.set('orrery.solved');
        svg.classList.add('solved');
        setTimeout(() => alive && draw(), UNLOCK_DELAY_MS);
      }

      function draw() {
        planetEls.forEach((g, i) => (g.style.transform = `rotate(${angles[i]}deg)`));
        const solved = state.has('orrery.solved');
        controls.inert = solved;
        caption.textContent = solved
          ? 'With a soft click, a shallow drawer slides out of the orrery’s base.'
          : 'Each ring turns in stiff clicks against the brass marker. Click a ring to turn it, right-click to turn it back.';
        reward.replaceChildren();
        if (solved && !state.has('taken.lens')) {
          const card = el('button', {
            class: 'item-card',
            onclick: () => {
              state.set('taken.lens');
              state.addItem('lens');
              game.hud.toast(`${game.room.items.lens.name} added to your satchel`);
              draw();
            },
          });
          card.innerHTML = lensSvg(64);
          card.append(el('span', { class: 'name' }, game.room.items.lens.name), el('span', { class: 'take' }, 'Take'));
          reward.append(card);
        } else if (solved) {
          reward.append(el('p', { class: 'caption' }, 'The drawer in the base is empty now.'));
        }
      }

      svg.addEventListener('click', (e) => {
        const ring = e.target.closest('[data-ring]');
        if (ring) turn(Number(ring.dataset.ring), 1);
      });
      svg.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const ring = e.target.closest('[data-ring]');
        if (ring) turn(Number(ring.dataset.ring), -1);
      });

      PLANETS.forEach((p, i) => controls.append(el('div', { class: 'orr-row' },
        el('button', { class: 'combo-btn', 'aria-label': `Turn ${p.name} back`, onclick: () => turn(i, -1) }, '◀'),
        el('span', { class: 'orr-name' }, `${p.symbol} ${p.name}`),
        el('button', { class: 'combo-btn', 'aria-label': `Turn ${p.name} on`, onclick: () => turn(i, 1) }, '▶'))));

      if (state.has('orrery.solved')) svg.classList.add('solved');
      body.append(el('div', { class: 'orrery-layout' }, svg, el('div', {}, controls, reward)), caption);
      draw();
      return () => (alive = false);
    },
  });
}
