import { el } from '../engine/ui.js';

// Non-AI hint panel: walks each reachable puzzle's ladder one step at a time.
export function openHints(game) {
  game.openModal({
    title: 'Ask for a hint',
    theme: 'brass',
    render(body) {
      const draw = () => {
        const open = game.room.puzzles.filter((p) => p.available(game.state) && !p.solved(game.state));
        body.replaceChildren(
          el('p', { class: 'caption' }, 'Hints are revealed one step at a time. The last step gives the answer.'),
          ...(open.length ? open.map(card) : [el('p', {}, 'Nothing to hint at right now.')]),
        );
      };

      const card = (puzzle) => {
        const level = game.state.hintLevel(puzzle.id);
        const total = puzzle.hints.length;
        const label = level === total - 1 ? 'Show the answer' : `Reveal hint ${level + 1} of ${total}`;
        return el('section', { class: 'hint-card' },
          el('h3', {}, puzzle.title),
          level > 0 && el('ol', {}, puzzle.hints.slice(0, level).map((h) => el('li', {}, h))),
          level < total && el('button', {
            class: 'btn',
            onclick: () => { game.state.revealHint(puzzle.id); draw(); },
          }, label));
      };

      draw();
    },
  });
}
