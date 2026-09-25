import { el } from '../../../engine/ui.js';
import { LETTER } from '../story.js';

export function openLetter(game) {
  game.openModal({
    title: 'A letter on the desk',
    theme: 'paper',
    render(body) {
      body.append(el('article', { class: 'letter handwritten' },
        el('p', { class: 'letter-head' }, LETTER.heading),
        el('p', {}, LETTER.greeting),
        LETTER.body.map((p) => el('p', {}, p)),
        el('p', { class: 'signoff' }, LETTER.signoff),
        el('p', { class: 'signature' }, LETTER.signature)));
    },
  });
}
