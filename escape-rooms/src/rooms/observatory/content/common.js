import { el } from '../../../engine/ui.js';

// Pieces shared by many modals: handwritten notes, "take it" item cards, locks.

// A handwritten note or letter. `narrate` is the id of its recorded reading, if any.
export function noteArticle(game, note, narrate) {
  return el('article', { class: 'letter handwritten' },
    narrate && game.narrator?.button(narrate),
    note.heading && el('p', { class: 'letter-head' }, note.heading),
    note.greeting && el('p', {}, note.greeting),
    note.body.map((p) => el('p', {}, p)),
    note.signoff && el('p', { class: 'signoff' }, note.signoff),
    note.signature && el('p', { class: 'signature' }, note.signature));
}

// Cards for items lying somewhere, each taken with a click (recorded as taken.<id>).
// Calls after() once something is taken.
export function itemCards(game, ids, after) {
  const remaining = ids.filter((id) => !game.state.has(`taken.${id}`));
  return el('div', { class: 'item-cards' }, remaining.map((id) => {
    const item = game.room.items[id];
    return el('button', {
      class: 'item-card',
      onclick: () => {
        game.state.set(`taken.${id}`);
        game.state.addItem(id);
        game.hud.toast(`${item.name} added to your satchel`);
        after?.();
      },
    },
    el('span', { class: 'icon' }, item.icon),
    el('span', { class: 'name' }, item.name),
    el('span', { class: 'desc' }, item.description),
    el('span', { class: 'take' }, 'Take'));
  }));
}

// A plate of turning wheels (digits or letters). Calls onOpen() once the wheels read
// `answer`. Scroll or click the arrows to turn a wheel.
export function comboLock(game, { symbols, answer, engraving, caption, onOpen }) {
  const values = Array.from(answer, () => 0);
  const wheels = el('div', { class: 'combo' });
  const plate = el('div', { class: 'lock-plate' },
    engraving && el('p', { class: 'engraving' }, engraving),
    wheels,
    caption && el('p', { class: 'caption' }, caption));

  values.forEach((_, i) => {
    const face = el('div', { class: 'combo-digit' }, symbols[0]);
    const turn = (step) => {
      game.sfx?.('tick');
      values[i] = (values[i] + step + symbols.length) % symbols.length;
      face.textContent = symbols[values[i]];
      if (values.map((v) => symbols[v]).join('') === answer) {
        plate.classList.add('unlocked');
        plate.inert = true;
        onOpen();
      }
    };
    wheels.append(el('div', {
      class: 'combo-wheel',
      onwheel: (e) => { e.preventDefault(); turn(e.deltaY > 0 ? -1 : 1); },
    },
    el('button', { class: 'combo-btn', 'aria-label': 'Turn up', onclick: () => turn(1) }, '▲'),
    face,
    el('button', { class: 'combo-btn', 'aria-label': 'Turn down', onclick: () => turn(-1) }, '▼')));
  });
  return plate;
}

// A directional lock: push the shackle N, E, S or W in the right order. Wrong
// sequences spring back once they reach the full length.
export function directionalLock(game, { answer, engraving, caption, onOpen }) {
  let entered = [];
  const slots = el('div', { class: 'dir-slots' });
  const dirs = { N: '▲', E: '▶', S: '▼', W: '◀' };
  const plate = el('div', { class: 'lock-plate dir-lock' },
    engraving && el('p', { class: 'engraving' }, engraving),
    el('div', { class: 'dir-pad' },
      ...['N', 'W', 'E', 'S'].map((d) => el('button', {
        class: `dir-btn dir-${d}`,
        'aria-label': `Push ${d}`,
        onclick: () => push(d),
      }, el('span', {}, dirs[d]), el('small', {}, d))),
      el('div', { class: 'dir-hub' })),
    slots,
    caption && el('p', { class: 'caption' }, caption));

  function show() {
    slots.replaceChildren(...answer.map((_, i) => el('span', { class: 'dir-slot' }, entered[i] ?? '·')));
  }
  function push(d) {
    game.sfx?.('tick');
    entered.push(d);
    show();
    if (entered.length < answer.length) return;
    if (entered.join('') === answer.join('')) {
      plate.classList.add('unlocked');
      plate.inert = true;
      onOpen();
      return;
    }
    plate.classList.add('wrong');
    plate.inert = true;
    setTimeout(() => {
      entered = [];
      plate.classList.remove('wrong');
      plate.inert = false;
      show();
    }, 700);
  }
  show();
  return plate;
}
