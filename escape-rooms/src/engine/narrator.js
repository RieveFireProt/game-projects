import { el } from './ui.js';

// Recorded readings of the letters and notes, one file per id under /narration/.
// Only one plays at a time; closing a modal stops it.
export function createNarrator() {
  const player = new Audio();
  player.preload = 'none';
  let current = null;
  let volume = 1;

  function label(b) {
    const playing = current === b.dataset.id && !player.paused;
    b.classList.toggle('playing', playing);
    b.textContent = playing ? '■ Stop reading' : '▶ Read aloud';
  }
  const refresh = () => document.querySelectorAll('.narrate').forEach(label);
  player.addEventListener('ended', () => {
    current = null;
    refresh();
  });
  player.addEventListener('pause', refresh);
  player.addEventListener('play', refresh);

  function play(id) {
    current = id;
    player.src = `${import.meta.env.BASE_URL}narration/${id}.mp3`;
    player.volume = volume;
    player.play().catch(() => {
      current = null;
      refresh();
    });
    refresh();
  }

  function stop() {
    player.pause();
    current = null;
    refresh();
  }

  return {
    play,
    stop,
    setVolume(v) {
      volume = v;
      player.volume = v;
    },
    // A button that reads the given text aloud, and stops it again.
    button(id) {
      const b = el('button', {
        class: 'btn subtle small narrate',
        'data-id': id,
        onclick: () => (current === id && !player.paused ? stop() : play(id)),
      });
      label(b);
      return b;
    },
  };
}
