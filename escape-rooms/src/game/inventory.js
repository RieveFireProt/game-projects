import { el } from '../engine/ui.js';

export function openItem(game, id) {
  const item = game.room.items[id];
  game.openModal({
    title: item.title ?? item.name,
    theme: item.theme,
    render: (body, api) => item.render(body, game, api),
  });
}

export function openSatchel(game) {
  const ids = game.state.inventory;
  game.openModal({
    title: 'Your satchel',
    theme: 'brass',
    render(body) {
      if (!ids.length) {
        body.append(el('p', { class: 'caption' }, 'Your satchel is empty.'));
        return;
      }
      body.append(el('div', { class: 'item-cards' }, ids.map((id) => {
        const item = game.room.items[id];
        return el('button', { class: 'item-card', onclick: () => openItem(game, id) },
          el('span', { class: 'icon' }, item.icon),
          el('span', { class: 'name' }, item.name),
          el('span', { class: 'desc' }, item.description));
      })));
    },
  });
}
