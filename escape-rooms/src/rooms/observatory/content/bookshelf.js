import { el } from '../../../engine/ui.js';
import { BOOKS, BOOKS_PER_SHELF, LEVER_BOOKS } from '../story.js';

const SPINE_COLORS = ['#5b2320', '#23395b', '#2f4a2a', '#6b5a2a', '#3b2a4a', '#7a4a22', '#1e1e24', '#4a2a1a'];
export const SHELVES = BOOKS.length / BOOKS_PER_SHELF;

// Which book is tipped forward on each shelf (index within the shelf, or -1).
export const tilted = (state, shelf) => state.get(`shelf.tilt.${shelf}`, -1);
const leverIndex = (shelf) => BOOKS.slice(shelf * BOOKS_PER_SHELF, (shelf + 1) * BOOKS_PER_SHELF)
  .findIndex(([title]) => LEVER_BOOKS.includes(title));

// Tip a book forward to look at it. One book per shelf can lean out at a time; the
// right four together work the old latch on the priest-hole beside the case.
export function openBookshelf(game) {
  game.openModal({
    title: 'The bookshelf',
    theme: 'brass',
    render(body) {
      const { state } = game;
      const note = el('p', { class: 'caption shelf-note' }, 'Star atlases, almanacs and Society proceedings. Tip a book forward to look at it.');
      const shelves = el('div', { class: 'shelves' });
      const spines = [];

      BOOKS.forEach(([title, author, line], i) => {
        const shelf = Math.floor(i / BOOKS_PER_SHELF);
        const slot = i % BOOKS_PER_SHELF;
        const isVoss = line === null;
        if (slot === 0) shelves.append(el('div', { class: 'shelf' }));
        const spine = el('button', {
          class: 'spine',
          style: `--spine:${isVoss ? '#234030' : SPINE_COLORS[(i * 5) % SPINE_COLORS.length]}; --h:${82 + ((i * 37) % 18)}%`,
          title: `${title} — ${author}`,
          onclick: () => tip(),
        },
        el('span', { class: 'spine-title' }, title),
        el('span', { class: 'spine-author' }, author));
        spines.push(spine);
        shelves.lastChild.append(spine);

        function tip() {
          game.sfx?.('tick');
          state.set(`shelf.tilt.${shelf}`, tilted(state, shelf) === slot ? -1 : slot);
          show();
          if (tilted(state, shelf) !== slot) {
            note.textContent = 'You push the book back into line.';
            return;
          }
          if (!isVoss) note.replaceChildren(el('em', {}, `${title}. `), line);
          else if (state.has('found.page-right')) note.textContent = 'Voss’s own book. You have already taken what was hidden inside.';
          else {
            note.replaceChildren(
              el('span', {}, 'Voss’s own book. As you tip it out, a folded half-page slips from between the leaves.'),
              el('button', {
                class: 'btn take-btn',
                onclick: () => {
                  state.set('found.page-right');
                  state.addItem('page-right');
                  game.hud.toast(`${game.room.items['page-right'].name} added to your satchel`);
                  note.textContent = 'You tuck the torn half-page into your satchel.';
                },
              }, 'Take the half-page'));
          }
          check();
        }
      });

      function show() {
        spines.forEach((s, i) => s.classList.toggle('out', tilted(state, Math.floor(i / BOOKS_PER_SHELF)) === i % BOOKS_PER_SHELF));
      }

      function check() {
        if (state.has('shelf.open')) return;
        for (let s = 0; s < SHELVES; s++) if (tilted(state, s) !== leverIndex(s)) return;
        state.set('shelf.open');
        shelves.classList.add('unlocked');
        setTimeout(() => {
          if (body.contains(note)) note.textContent = 'With the fourth book, something gives. Beside the bookcase, stone grinds heavily against stone.';
        }, 400);
      }

      body.append(shelves, note);
      show();
    },
  });
}
