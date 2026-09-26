import { LETTER } from '../story.js';
import { noteArticle } from './common.js';

export function openLetter(game) {
  game.openModal({
    title: 'A letter on the desk',
    theme: 'paper',
    render(body) {
      body.append(noteArticle(game, LETTER, 'letter'));
    },
  });
}
