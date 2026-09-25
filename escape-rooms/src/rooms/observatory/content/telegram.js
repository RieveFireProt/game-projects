import { el } from '../../../engine/ui.js';
import { TELEGRAM } from '../story.js';
import { cipherWheel } from './cipherWheel.js';

// The enciphered telegram, with space under each letter to write the decoding.
// If the players carry the cipher wheel it sits alongside.
export function openTelegram(game) {
  game.openModal({
    title: 'A telegram',
    theme: 'paper',
    render(body) {
      const { state } = game;
      const letters = TELEGRAM.cipher.replace(/ /g, '');
      const saved = state.get('telegram.guess', '').padEnd(letters.length, ' ');
      const inputs = [];
      const decoded = () => state.has('telegram.decoded');

      const message = el('div', { class: 'tg-message' });
      let index = 0;
      for (const word of TELEGRAM.cipher.split(' ')) {
        const w = el('div', { class: 'tg-word' });
        for (const ch of word) {
          const i = index++;
          const input = el('input', {
            class: 'tg-input',
            value: saved[i].trim(),
            'aria-label': `Decoded letter ${i + 1}`,
            autocomplete: 'off',
            spellcheck: 'false',
          });
          input.addEventListener('focus', () => input.select());
          input.addEventListener('input', () => {
            input.value = input.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase();
            if (input.value) inputs[i + 1]?.focus();
            save();
          });
          input.addEventListener('keydown', (e) => {
            e.stopPropagation(); // keep typing from reaching the game (journal keys, Esc aside)
            if (e.key === 'Escape') game.modal.close();
            if (e.key === 'Backspace' && !input.value) inputs[i - 1]?.focus();
            if (e.key === 'ArrowLeft') inputs[i - 1]?.focus();
            if (e.key === 'ArrowRight') inputs[i + 1]?.focus();
          });
          inputs.push(input);
          w.append(el('div', { class: 'tg-cell' }, el('span', { class: 'tg-cipher' }, ch), input));
        }
        message.append(w);
      }

      const status = el('p', { class: 'tg-status' });
      function save() {
        const guess = inputs.map((x) => x.value || ' ').join('');
        state.set('telegram.guess', guess);
        if (!decoded() && guess === TELEGRAM.plain.replace(/ /g, '')) {
          state.set('telegram.decoded');
          game.hud.toast('The telegram is decoded');
        }
        show();
      }
      function show() {
        message.classList.toggle('solved', decoded());
        inputs.forEach((x) => (x.readOnly = decoded()));
        status.textContent = decoded() ? `“${sentence(TELEGRAM.plain)}.”` : '';
      }

      const form = el('article', { class: 'telegram' },
        el('header', { class: 'tg-head' },
          el('div', { class: 'tg-crown' }, 'POST OFFICE TELEGRAPHS'),
          el('div', { class: 'tg-fields' },
            el('span', {}, 'Handed in at ', el('b', {}, TELEGRAM.handedIn)),
            el('span', {}, 'To ', el('b', {}, TELEGRAM.to)))),
        message,
        el('p', { class: 'tg-from' }, `From ${TELEGRAM.from}`),
        status);

      const side = state.hasItem('cipher-wheel')
        ? el('div', { class: 'tg-side' }, cipherWheel(game, { size: 330 }))
        : el('p', { class: 'caption tg-side' }, 'Nonsense letters. You would need some way of turning them back into words.');

      body.append(el('div', { class: 'tg-layout' }, form, side));
      show();
    },
  });
}

const sentence = (s) => s.charAt(0) + s.slice(1).toLowerCase();
