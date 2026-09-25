import { el } from '../../../engine/ui.js';
import { CLOCK_TIME } from './clock.js';
import { comboLock, itemCards } from './common.js';

const COMBINATION = `${CLOCK_TIME.hours}${CLOCK_TIME.minutes}`.padStart(4, '0');
const CONTENTS = ['journal', 'morse-card'];
const UNLOCK_DELAY_MS = 1100;

export function openDrawer(game) {
  game.openModal({
    title: 'The desk drawer',
    theme: 'brass',
    render(body) {
      let alive = true;
      const draw = () => body.replaceChildren(game.state.has('drawer.open') ? contents() : lock());

      const lock = () => comboLock(game, {
        symbols: '0123456789',
        answer: COMBINATION,
        engraving: 'E · V',
        caption: 'A brass combination lock with four wheels. The drawer will not budge.',
        onOpen: () => {
          game.state.set('drawer.open');
          setTimeout(() => alive && draw(), UNLOCK_DELAY_MS);
        },
      });

      function contents() {
        if (CONTENTS.every((id) => game.state.has(`taken.${id}`))) return el('p', { class: 'caption' }, 'The drawer is empty now.');
        return el('div', {}, el('p', { class: 'caption' }, 'The drawer slides open. Inside:'), itemCards(game, CONTENTS, draw));
      }

      draw();
      return () => (alive = false);
    },
  });
}
