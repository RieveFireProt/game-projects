import { el } from '../../../engine/ui.js';
import { BOOKS } from '../story.js';

const SPINE_COLORS = ['#5b2320', '#23395b', '#2f4a2a', '#6b5a2a', '#3b2a4a', '#7a4a22', '#1e1e24', '#4a2a1a'];
const PER_SHELF = 9;

// Search the spines. Pulling out Voss's own book yields half of the torn page.
export function openBookshelf(game) {
  game.openModal({
    title: 'The bookshelf',
    theme: 'brass',
    render(body) {
      const note = el('p', { class: 'caption shelf-note' }, 'Star atlases, almanacs and Society proceedings. Choose a book to take down.');
      const shelves = el('div', { class: 'shelves' });

      BOOKS.forEach(([title, author, line], i) => {
        const isVoss = line === null;
        if (i % PER_SHELF === 0) shelves.append(el('div', { class: 'shelf' }));
        const spine = el('button', {
          class: `spine${isVoss && game.state.has('found.page-right') ? ' pulled' : ''}`,
          style: `--spine:${SPINE_COLORS[(i * 5) % SPINE_COLORS.length]}; --h:${82 + ((i * 37) % 18)}%`,
          title: `${title} — ${author}`,
          onclick: () => pull(),
        },
        el('span', { class: 'spine-title' }, title),
        el('span', { class: 'spine-author' }, author));
        shelves.lastChild.append(spine);

        function pull() {
          shelves.querySelectorAll('.spine.out').forEach((s) => s.classList.remove('out'));
          spine.classList.add('out');
          if (!isVoss) {
            note.replaceChildren(el('em', {}, `${title}. `), line);
            return;
          }
          if (game.state.has('found.page-right')) {
            note.textContent = 'Voss’s own book. You have already taken what was hidden inside.';
            return;
          }
          note.replaceChildren(
            el('span', {}, 'Voss’s own book. As you open it, a folded half-page slips from between the leaves.'),
            el('button', {
              class: 'btn take-btn',
              onclick: () => {
                game.state.set('found.page-right');
                game.state.addItem('page-right');
                game.hud.toast(`${game.room.items['page-right'].name} added to your satchel`);
                note.textContent = 'You tuck the torn half-page into your satchel.';
                spine.classList.add('pulled');
              },
            }, 'Take the half-page'));
        }
      });
      body.append(shelves, note);
    },
  });
}
