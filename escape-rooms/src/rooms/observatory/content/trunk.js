import { el } from '../../../engine/ui.js';
import { TRUNK_LABELS, TRUNK_WORD } from '../story.js';
import { comboLock, itemCards } from './common.js';

const LABEL_COLORS = ['#b8462e', '#2e5a8a', '#c89a2e', '#3a6a3a'];
const CONTENTS = ['cipher-wheel'];
const UNLOCK_DELAY_MS = 1100;

// Voss's steamer trunk, its lid held by a four-wheel letter lock. The labels pasted on
// its front are the eclipses she chased; the lock wants them in the order she saw them.
export function openTrunk(game) {
  game.openModal({
    title: 'The steamer trunk',
    theme: 'brass',
    render(body) {
      let alive = true;
      const { state } = game;
      const labels = el('div', { class: 'trunk-labels' }, TRUNK_LABELS.map((name, i) => el('div', {
        class: 'trunk-label',
        style: `--label:${LABEL_COLORS[i]}; --tilt:${(i - 1.5) * 4}deg`,
      }, el('small', {}, 'TOTAL ECLIPSE EXPEDITION'), el('b', {}, name))));

      const draw = () => body.replaceChildren(labels, state.has('trunk.open') ? contents() : lock());
      const lock = () => comboLock(game, {
        symbols: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        answer: TRUNK_WORD,
        engraving: 'WHERE THE SHADOW FOUND ME',
        caption: 'A brass lock of four lettered wheels holds the lid shut.',
        onOpen: () => {
          state.set('trunk.open');
          setTimeout(() => alive && draw(), UNLOCK_DELAY_MS);
        },
      });
      function contents() {
        const left = CONTENTS.filter((id) => !state.has(`taken.${id}`)).length;
        return el('div', {},
          el('p', { class: 'caption' }, left
            ? 'The lid swings up on eclipse photographs, a folded sun-shade and, packed in a sock, a brass wheel.'
            : 'Eclipse photographs, a folded sun-shade and a sock with nothing in it.'),
          itemCards(game, CONTENTS, draw));
      }
      draw();
      return () => (alive = false);
    },
  });
}
