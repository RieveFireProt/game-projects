import { el } from '../../../engine/ui.js';
import { ECLIPSE_NOTE, PORTRAIT_NOTE, SAUCER_NOTE, SIGHTINGS, SLEEVE_NOTE } from '../story.js';
import { itemCards, noteArticle } from './common.js';

// Small places around the room where Voss left something: a pocket, a saucer, the
// back of a picture, a flowerpot, the dome rail, the cabinet and the priest-hole.

// A two-step look: `first` is shown, and a button reveals `then()`.
function lookCloser(game, { title, theme = 'paper', intro, action, flag, then }) {
  game.openModal({
    title,
    theme,
    render(body) {
      const draw = () => {
        if (flag && game.state.has(flag)) {
          body.replaceChildren(...then(draw));
          return;
        }
        body.replaceChildren(
          el('p', { class: 'caption' }, intro),
          el('div', { class: 'ts-actions' }, el('button', {
            class: 'btn',
            onclick: () => {
              game.sfx?.('paper');
              game.state.set(flag);
              draw();
            },
          }, action)));
      };
      draw();
    },
  });
}

export const openCoatStand = (game) => lookCloser(game, {
  title: 'The coat stand',
  intro: 'Voss’s heavy travelling cloak, smelling of sea air and pipe smoke. Something crackles in one of its pockets.',
  action: 'Search the pocket',
  flag: 'found.eclipse-note',
  then: () => [noteArticle(game, ECLIPSE_NOTE, 'note-eclipse')],
});

export const openSideTable = (game) => lookCloser(game, {
  title: 'The side table',
  intro: 'A cup of tea, stone cold, and a pipe. The saucer sits a little proud of the table, as if something is under it.',
  action: 'Lift the saucer',
  flag: 'found.saucer-note',
  then: () => [noteArticle(game, SAUCER_NOTE, 'note-saucer')],
});

export const openPortrait = (game) => lookCloser(game, {
  title: 'The portrait',
  intro: 'A stern woman with a small brass telescope. The resemblance to Voss is unmistakable. The picture hangs slightly askew on its nail.',
  action: 'Turn it over',
  flag: 'found.portrait-note',
  then: () => [noteArticle(game, PORTRAIT_NOTE, 'note-portrait')],
});

export const openFern = (game) => lookCloser(game, {
  title: 'The fern',
  theme: 'brass',
  intro: 'A fern in a tall pot, the only living thing up here besides you two. It could use some water. The soil round its roots has been disturbed.',
  action: 'Feel in the soil',
  flag: 'found.saturn',
  then: (draw) => [
    el('p', { class: 'caption' }, game.state.has('taken.saturn')
      ? 'Just soil, and a fern that could use some water.'
      : 'Your fingers close on something small, round and cold: a tiny brass planet with a ring around it.'),
    itemCards(game, ['saturn'], draw),
  ],
});

export const openLadder = (game) => lookCloser(game, {
  title: 'Up the ladder',
  theme: 'brass',
  intro: 'A ladder up to the rail the dome turns on. The rungs are slick with grease.',
  action: 'Climb up to the rail',
  flag: 'found.rail',
  then: (draw) => [
    railView(game.state.has('taken.cabinet-key')),
    el('p', { class: 'caption' }, game.state.has('taken.cabinet-key')
      ? 'Iron wheels and grease. Nothing else up here.'
      : 'Up among the iron wheels the dome rides on, a small brass key hangs from a loop of string.'),
    itemCards(game, ['cabinet-key'], draw),
  ],
});

function railView(taken) {
  const view = el('div', { class: 'rail-view' });
  const wheels = [120, 380, 640].map((x) => `
    <g transform="translate(${x} 170)">
      <rect x="-70" y="-60" width="140" height="26" fill="#1f2a26"/>
      <circle r="44" fill="#2a2a2e" stroke="#101014" stroke-width="6"/>
      <circle r="12" fill="#8a6a34"/>
    </g>`).join('');
  view.innerHTML = `<svg viewBox="0 0 760 300" role="img" aria-label="The dome rail">
    <rect width="760" height="300" fill="#140f0a"/>
    <path d="M0 40 Q380 0 760 40 L760 110 Q380 70 0 110 Z" fill="#3a2a1a"/>
    ${wheels}
    <rect x="0" y="214" width="760" height="20" fill="#1f2a26"/>
    ${taken ? '' : `<g transform="translate(508 120)">
      <path d="M0 0 L0 60" stroke="#c8b890" stroke-width="2"/>
      <circle cx="0" cy="72" r="12" fill="none" stroke="#c49a50" stroke-width="5"/>
      <rect x="-3" y="84" width="6" height="40" fill="#c49a50"/>
      <rect x="0" y="110" width="12" height="5" fill="#c49a50"/><rect x="0" y="118" width="9" height="5" fill="#c49a50"/>
    </g>`}
  </svg>`;
  return view;
}

// The glass-fronted instrument cabinet, locked until the key comes down from the rail.
export function openCabinet(game) {
  game.openModal({
    title: 'The instrument cabinet',
    theme: 'brass',
    render(body) {
      const { state } = game;
      const draw = () => {
        if (!state.has('cabinet.open')) {
          body.replaceChildren(
            el('p', { class: 'caption' }, 'Sextants, a spyglass, an astrolabe, a little brass microscope. The glass door is locked; the keyhole is small and brass.'),
            state.hasItem('cabinet-key')
              ? el('div', { class: 'ts-actions' }, el('button', {
                class: 'btn',
                onclick: () => {
                  state.removeItem('cabinet-key');
                  state.set('cabinet.open');
                  draw();
                },
              }, 'Unlock it with the small brass key'))
              : null);
          return;
        }
        const left = !state.has('taken.ruby-glass');
        body.replaceChildren(
          el('p', { class: 'caption' }, left
            ? 'The glass door swings open. Among the instruments is a wooden box of spectroscope slides; all but one of the slots are empty. The last holds a square of deep red glass.'
            : 'Sextants, a spyglass, an astrolabe and an empty box of slides.'),
          itemCards(game, ['ruby-glass'], draw));
      };
      draw();
    },
  });
}

// The priest-hole beside the bookcase, once the books have opened it.
export function openNiche(game) {
  game.state.set('sighting.1');
  const s = SIGHTINGS[0];
  game.openModal({
    title: 'The priest-hole',
    theme: 'brass',
    render(body) {
      body.append(
        el('p', { class: 'caption' }, 'A cavity in the thickness of the wall, smelling of old stone. Propped inside is a card in Voss’s hand.'),
        el('article', { class: 'sighting-card handwritten' }, game.narrator?.button('sighting-1'), el('h3', {}, s.title), el('p', {}, s.text)));
    },
  });
}

// The gramophone. The needle can be lifted and set down again; the sleeve holds a note.
export function openGramophone(game) {
  game.openModal({
    title: 'The gramophone',
    theme: 'brass',
    render(body) {
      const { state } = game;
      const draw = () => {
        const playing = !state.has('gramophone.off');
        const disc = el('div', { class: `record${playing ? ' spinning' : ''}` }, el('div', { class: 'record-label' },
          el('small', {}, 'BERLINER GRAMOPHONE'), el('b', {}, 'Nocturne Waltz'), el('small', {}, 'pianoforte')));
        body.replaceChildren(
          el('div', { class: 'gramophone-view' }, disc),
          el('p', { class: 'caption' }, playing
            ? 'A slow waltz turns under the needle, thin and far away through the horn.'
            : 'The record sits still. The needle arm rests on its hook.'),
          el('div', { class: 'ts-actions' },
            el('button', { class: 'btn', onclick: () => { state.set('gramophone.off', playing); draw(); } }, playing ? 'Lift the needle' : 'Set the needle down'),
            !state.has('found.sleeve-note') && el('button', {
              class: 'btn subtle',
              onclick: () => { game.sfx?.('paper'); state.set('found.sleeve-note'); draw(); },
            }, 'Look in the record sleeve')),
          state.has('found.sleeve-note') && noteArticle(game, SLEEVE_NOTE, 'note-sleeve'));
      };
      draw();
    },
  });
}
