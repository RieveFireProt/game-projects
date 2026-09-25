import { el } from '../../../engine/ui.js';
import { TELEGRAM } from '../story.js';
import { cipherWheel } from './cipherWheel.js';
import { tapeSvg } from './morse.js';

// The telegraph: the register's tape holds Voss's last message, in Morse and
// enciphered. The form below has a row to pencil in the tape's letters and a row
// for the clear text; the clear row is what counts. The wheel sits alongside once found.
export function openTelegram(game) {
  game.openModal({
    title: 'The telegraph',
    theme: 'paper',
    render(body) {
      const { state } = game;
      const letters = TELEGRAM.cipher.replace(/ /g, '');
      const rows = ['tape', 'clear'].map((row) => ({
        row,
        saved: state.get(`telegram.${row}`, '').padEnd(letters.length, ' '),
        inputs: [],
      }));
      const [tape, clear] = rows;
      const decoded = () => state.has('telegram.decoded');

      const message = el('div', { class: 'tg-message' });
      let index = 0;
      for (const word of TELEGRAM.cipher.split(' ')) {
        const w = el('div', { class: 'tg-word' });
        for (let k = 0; k < word.length; k++) {
          const i = index++;
          const cell = el('div', { class: 'tg-cell' });
          for (const r of rows) {
            const input = el('input', {
              class: `tg-input ${r.row}`,
              value: r.saved[i].trim(),
              'aria-label': `${r.row === 'tape' ? 'Tape' : 'Clear'} letter ${i + 1}`,
              autocomplete: 'off',
              spellcheck: 'false',
            });
            input.addEventListener('focus', () => input.select());
            input.addEventListener('input', () => {
              input.value = input.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase();
              if (input.value) r.inputs[i + 1]?.focus();
              save();
            });
            input.addEventListener('keydown', (e) => {
              e.stopPropagation(); // keep typing from reaching the game
              if (e.key === 'Escape') game.modal.close();
              if (e.key === 'Backspace' && !input.value) r.inputs[i - 1]?.focus();
              if (e.key === 'ArrowLeft') r.inputs[i - 1]?.focus();
              if (e.key === 'ArrowRight') r.inputs[i + 1]?.focus();
            });
            r.inputs.push(input);
            cell.append(input);
          }
          w.append(cell);
        }
        message.append(w);
      }

      const status = el('p', { class: 'tg-status' });
      function save() {
        for (const r of rows) state.set(`telegram.${r.row}`, r.inputs.map((x) => x.value || ' ').join(''));
        if (!decoded() && state.get('telegram.clear') === TELEGRAM.plain.replace(/ /g, '')) {
          state.set('telegram.decoded');
          game.hud.toast('The message is decoded');
        }
        show();
      }
      function show() {
        message.classList.toggle('solved', decoded());
        clear.inputs.forEach((x) => (x.readOnly = decoded()));
        status.textContent = decoded() ? `“${sentence(TELEGRAM.plain)}.”` : '';
      }

      const register = el('div', { class: 'register' });
      register.innerHTML = tapeSvg(TELEGRAM.cipher);
      const form = el('article', { class: 'telegram' },
        el('header', { class: 'tg-head' },
          el('div', { class: 'tg-crown' }, 'POST OFFICE TELEGRAPHS'),
          el('div', { class: 'tg-fields' },
            el('span', {}, 'Handed in at ', el('b', {}, TELEGRAM.handedIn)),
            el('span', {}, 'To ', el('b', {}, TELEGRAM.to)))),
        el('div', { class: 'tg-rowlabels' }, el('span', {}, 'Tape'), el('span', {}, 'Clear')),
        message,
        el('p', { class: 'tg-from' }, `From ${TELEGRAM.from}`),
        status);

      const side = state.hasItem('cipher-wheel')
        ? el('div', { class: 'tg-side' }, cipherWheel(game, { size: 330 }))
        : el('p', { class: 'caption tg-side' }, 'Even read off the tape, the letters would be nonsense. You would need some way of turning them back into words.');

      body.append(
        el('p', { class: 'caption' }, 'The register beside the telegraph key has printed the last message sent on a strip of paper tape. A blank form lies ready for a copy.'),
        register,
        el('div', { class: 'tg-layout' }, form, side));
      show();
    },
  });
}

const sentence = (s) => s.charAt(0) + s.slice(1).toLowerCase();
