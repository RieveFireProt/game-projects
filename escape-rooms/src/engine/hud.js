import { el } from './ui.js';

// On-screen chrome: crosshair, hover label, timer, satchel bar, toasts, musings, pause screen.
export function createHud() {
  const $ = (id) => document.getElementById(id);
  const crosshair = $('crosshair');
  const prompt = $('prompt');
  const overlay = $('overlay');
  const timer = $('timer');
  const bar = $('inventory-bar');
  const toastEl = $('toast');
  const musing = $('musing');
  let currentPrompt = null;
  let toastTimeout = null;
  let musingTimeout = null;

  return {
    setPrompt(label) {
      if (label === currentPrompt) return;
      currentPrompt = label;
      prompt.textContent = label ?? '';
      prompt.hidden = !label;
      crosshair.classList.toggle('active', Boolean(label));
    },
    showOverlay(mode) {
      overlay.dataset.mode = mode;
      overlay.hidden = false;
    },
    hideOverlay() {
      overlay.hidden = true;
    },
    setTimer(ms) {
      const s = Math.floor(ms / 1000);
      timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    },
    renderInventory(items) {
      bar.replaceChildren(
        ...items.map((item, i) =>
          el('div', { class: 'slot', title: item.name },
            el('span', { class: 'icon' }, item.icon),
            el('span', { class: 'key' }, String(i + 1)))),
      );
    },
    toast(message) {
      toastEl.textContent = message;
      toastEl.hidden = false;
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => (toastEl.hidden = true), 3500);
    },
    // A passing thought about something that's only atmosphere.
    say(line) {
      musing.textContent = line;
      musing.hidden = false;
      musing.classList.remove('fading');
      void musing.offsetWidth; // restart the fade-in animation
      clearTimeout(musingTimeout);
      musingTimeout = setTimeout(() => (musing.hidden = true), 3000 + line.length * 45);
    },
    onClick(id, fn) {
      $(id).addEventListener('click', fn);
    },
  };
}
