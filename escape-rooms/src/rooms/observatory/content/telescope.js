import { el } from '../../../engine/ui.js';
import { lensSvg } from './lens.js';

// The great telescope: seat the lens, set HOUR and HEIGHT, and look.

export const HOURS = 24;
export const HEIGHTS = [-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const TARGET = { hour: 19, height: 40 };
const REVEAL_MS = 2600;

export const telescopeHour = (state) => state.get('telescope.hour', 6);
export const telescopeHeight = (state) => state.get('telescope.height', 0);
const formatHeight = (h) => (h > 0 ? `+${h}°` : `${h}°`);

export function openTelescope(game) {
  game.openModal({
    title: 'The great telescope',
    theme: 'brass',
    render(body, api) {
      const { state } = game;
      let cleanupView = null;

      function panel() {
        cleanupView?.();
        cleanupView = null;
        api.setTitle('The great telescope');
        const seated = state.has('telescope.lens');

        const socket = el('div', { class: 'ts-socket' });
        if (seated) {
          socket.innerHTML = lensSvg(150);
          socket.append(el('p', { class: 'ts-label' }, 'Lens seated'));
        } else {
          socket.append(el('div', { class: 'ts-empty' }), el('p', { class: 'ts-label' }, 'Empty lens socket'));
          if (state.hasItem('lens')) {
            socket.append(el('button', {
              class: 'btn small',
              onclick: () => {
                state.removeItem('lens');
                state.set('telescope.lens');
                game.hud.toast('The lens clicks into its socket');
                panel();
              },
            }, 'Seat the lens'));
          }
        }

        const dial = (label, value, format, step, index) => el('div', { class: 'ts-dial' },
          el('p', { class: 'ts-label' }, label),
          el('div', { class: 'ts-knob', style: `--turn:${index}` }, el('span', { class: 'ts-value' }, format(value))),
          el('div', { class: 'ts-buttons' },
            el('button', { class: 'combo-btn', 'aria-label': `${label} down`, onclick: () => step(-1) }, '◀'),
            el('button', { class: 'combo-btn', 'aria-label': `${label} up`, onclick: () => step(1) }, '▶')));

        const hour = telescopeHour(state);
        const height = telescopeHeight(state);
        const setHour = (d) => {
          state.set('telescope.hour', (hour + d + HOURS) % HOURS);
          panel();
        };
        const setHeight = (d) => {
          const i = Math.max(0, Math.min(HEIGHTS.length - 1, HEIGHTS.indexOf(height) + d));
          state.set('telescope.height', HEIGHTS[i]);
          panel();
        };

        body.replaceChildren(
          el('div', { class: 'ts-panel' },
            socket,
            dial('HOUR', hour, (v) => String(v), setHour, hour / HOURS),
            dial('HEIGHT', height, formatHeight, setHeight, (HEIGHTS.indexOf(height) + 1) / (HEIGHTS.length + 1))),
          el('div', { class: 'ts-actions' },
            el('button', { class: 'btn', onclick: look }, 'Look through the eyepiece')),
          el('p', { class: 'caption' }, state.has('telescope.solved')
            ? 'Still aimed at her discovery.'
            : 'Twelve feet of brass aimed at the slit in the dome. Two setting dials, HOUR and HEIGHT, and a socket beside the eyepiece.'));
      }

      function look() {
        const seated = state.has('telescope.lens');
        const onTarget = seated && telescopeHour(state) === TARGET.hour && telescopeHeight(state) === TARGET.height;
        const view = el('canvas', { class: 'eyepiece', width: 520, height: 520 });
        const caption = el('p', { class: 'caption' });
        const back = el('button', { class: 'btn subtle', onclick: panel }, 'Step back');
        body.replaceChildren(el('div', { class: 'eyepiece-wrap' }, view), caption, el('div', { class: 'ts-actions' }, back));
        api.setTitle('Through the eyepiece');

        const mode = !seated ? 'blur' : onTarget ? 'discovery' : 'field';
        cleanupView = animateView(view, mode, telescopeHour(state) * 97 + telescopeHeight(state) + 11);
        caption.textContent = {
          blur: 'A soft, formless blur. The telescope is missing something.',
          field: 'Stars drift past, sharp and cold. Nothing that looks new.',
          discovery: 'The Lyre, and bright Vega at its head…',
        }[mode];

        if (mode === 'discovery') {
          back.hidden = true;
          setTimeout(() => {
            if (!body.contains(view)) return;
            caption.textContent = '…and beside it, a small blue-white star that is on no chart in the world. Behind you, deep in the walls, gears begin to turn.';
            state.set('telescope.solved');
            state.set('door.open');
            back.textContent = 'Step back from the eyepiece';
            back.onclick = () => game.modal.close();
            back.hidden = false;
          }, REVEAL_MS);
        }
      }

      panel();
      return () => cleanupView?.();
    },
  });
}

// Draws the view through the eyepiece; returns a cleanup function.
function animateView(canvas, mode, seed) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const C = W / 2;
  const rand = seeded(seed);
  const field = Array.from({ length: mode === 'discovery' ? 140 : 220 }, () => [rand() * W, rand() * W, rand() ** 3 * 2.4 + 0.5]);
  // Lyra: Vega and the small parallelogram below it.
  const lyra = [[C - 40, C - 90, 7], [C - 5, C - 72, 2.6], [C - 12, C + 2, 3], [C + 30, C + 12, 3], [C + 36, C + 92, 3.4], [C - 6, C + 82, 3.4]];
  let frame = 0;
  let raf = 0;

  function draw() {
    frame++;
    g.save();
    g.fillStyle = '#02030a';
    g.fillRect(0, 0, W, W);
    g.beginPath();
    g.arc(C, C, C - 4, 0, Math.PI * 2);
    g.clip();
    const sky = g.createRadialGradient(C, C, 0, C, C, C);
    sky.addColorStop(0, '#0b1230');
    sky.addColorStop(1, '#03050d');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, W);

    const drift = mode === 'field' ? frame * 0.08 : 0;
    const blur = mode === 'blur' ? 14 : 0;
    for (const [x, y, r] of field) star(g, (x + drift) % W, y, mode === 'blur' ? r * 3 : r, blur, '#f6f2e4', 1);
    if (mode === 'discovery') {
      for (const [x, y, r] of lyra) star(g, x, y, r, 0, '#fffaf0', 1);
      const pulse = 0.75 + 0.25 * Math.sin(frame * 0.08);
      star(g, C - 78, C - 58, 4.2 * pulse, 0, '#bcd4ff', pulse);
    }
    // Vignette and the eyepiece's brass edge.
    const vignette = g.createRadialGradient(C, C, C * 0.6, C, C, C);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = vignette;
    g.fillRect(0, 0, W, W);
    g.restore();
    g.strokeStyle = '#8a6d2e';
    g.lineWidth = 8;
    g.beginPath();
    g.arc(C, C, C - 4, 0, Math.PI * 2);
    g.stroke();
    raf = requestAnimationFrame(draw);
  }
  draw();
  return () => cancelAnimationFrame(raf);
}

function star(g, x, y, r, blur, color, alpha) {
  const glow = g.createRadialGradient(x, y, 0, x, y, r * 4 + blur);
  glow.addColorStop(0, color);
  glow.addColorStop(0.25, `rgba(200,215,255,${0.35 * alpha})`);
  glow.addColorStop(1, 'rgba(200,215,255,0)');
  g.globalAlpha = blur ? 0.35 : alpha;
  g.fillStyle = glow;
  g.fillRect(x - r * 4 - blur, y - r * 4 - blur, (r * 4 + blur) * 2, (r * 4 + blur) * 2);
  g.globalAlpha = 1;
}

function seeded(seed) {
  seed = Math.abs(Math.floor(seed)) % 2147483646 + 1;
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
