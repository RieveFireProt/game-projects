import { el } from '../../../engine/ui.js';
import { FINAL_LETTER } from '../story.js';

// The door: bolted until the telescope finds the new star, then the way out.
export function openDoor(game) {
  const open = game.state.has('door.open');
  game.openModal({
    title: open ? 'The open door' : 'The door',
    theme: 'paper',
    render(body) {
      if (!open) {
        body.append(el('div', { class: 'prose' },
          el('p', {}, 'Heavy oak, bolted fast. Beside it, behind a brass grille, a train of gears sits waiting, and an iron rod runs from them under the floorboards towards the great telescope.'),
          el('p', {}, 'Voss’s letter said it opens only when the telescope is turned upon her discovery.')));
        return;
      }
      body.append(
        el('p', { class: 'caption' }, 'Cold night air drifts up a stone stairwell, and a lantern burns on the wall. Pinned to the inside of the door is one last letter.'),
        el('article', { class: 'letter handwritten' },
          el('p', { class: 'letter-head' }, FINAL_LETTER.heading),
          el('p', {}, FINAL_LETTER.greeting),
          FINAL_LETTER.body.map((p) => el('p', {}, p)),
          el('p', { class: 'signoff' }, FINAL_LETTER.signoff),
          el('p', { class: 'signature' }, FINAL_LETTER.signature)),
        el('div', { class: 'ts-actions' }, el('button', { class: 'btn', onclick: () => game.finish() }, 'Go down the stairs')));
    },
  });
}
