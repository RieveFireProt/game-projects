import { el } from '../../../engine/ui.js';
import { CLOCK_TIME } from './clock.js';

const COMBINATION = `${CLOCK_TIME.hours}${CLOCK_TIME.minutes}`.padStart(4, '0');
const CONTENTS = ['journal', 'cipher-wheel'];
const UNLOCK_DELAY_MS = 1100;

export function openDrawer(game) {
  game.openModal({
    title: 'The desk drawer',
    theme: 'brass',
    render(body) {
      let alive = true;
      const draw = () => body.replaceChildren(game.state.has('drawer.open') ? contents() : lock());

      function lock() {
        const digits = [0, 0, 0, 0];
        const wheels = el('div', { class: 'combo' });
        const plate = el('div', { class: 'lock-plate' },
          el('p', { class: 'engraving' }, 'E · V'),
          wheels,
          el('p', { class: 'caption' }, 'A brass combination lock with four wheels. The drawer will not budge.'));

        digits.forEach((_, i) => {
          const digitEl = el('div', { class: 'combo-digit' }, '0');
          const turn = (step) => {
            digits[i] = (digits[i] + step + 10) % 10;
            digitEl.textContent = digits[i];
            check();
          };
          wheels.append(el('div', {
            class: 'combo-wheel',
            onwheel: (e) => { e.preventDefault(); turn(e.deltaY > 0 ? -1 : 1); },
          },
          el('button', { class: 'combo-btn', 'aria-label': 'Turn up', onclick: () => turn(1) }, '▲'),
          digitEl,
          el('button', { class: 'combo-btn', 'aria-label': 'Turn down', onclick: () => turn(-1) }, '▼')));
        });

        function check() {
          if (digits.join('') !== COMBINATION) return;
          plate.classList.add('unlocked');
          plate.inert = true;
          game.state.set('drawer.open');
          setTimeout(() => alive && draw(), UNLOCK_DELAY_MS);
        }

        return plate;
      }

      function contents() {
        const remaining = CONTENTS.filter((id) => !game.state.has(`taken.${id}`));
        if (!remaining.length) return el('p', { class: 'caption' }, 'The drawer is empty now.');

        return el('div', {},
          el('p', { class: 'caption' }, 'The drawer slides open. Inside:'),
          el('div', { class: 'item-cards' }, remaining.map((id) => {
            const item = game.room.items[id];
            return el('button', {
              class: 'item-card',
              onclick: () => {
                game.state.set(`taken.${id}`);
                game.state.addItem(id);
                game.hud.toast(`${item.name} added to your satchel`);
                draw();
              },
            },
            el('span', { class: 'icon' }, item.icon),
            el('span', { class: 'name' }, item.name),
            el('span', { class: 'desc' }, item.description),
            el('span', { class: 'take' }, 'Take'));
          })));
      }

      draw();
      return () => (alive = false);
    },
  });
}
