// The large overlay where every clue and puzzle is shown.
// render(body, api) builds the content and may return a cleanup function.

export function createModal() {
  const root = document.getElementById('modal');
  const panel = root.querySelector('.modal-panel');
  const titleEl = root.querySelector('.modal-title');
  const body = root.querySelector('.modal-body');
  const closeListeners = [];
  let cleanup = null;
  let isOpen = false;

  root.querySelector('.modal-close').addEventListener('click', close);
  root.querySelector('.modal-backdrop').addEventListener('click', close);

  // Opening while already open swaps the content without firing onClose.
  function open({ title, theme = 'paper', render }) {
    cleanup?.();
    panel.className = `modal-panel theme-${theme}`;
    titleEl.textContent = title;
    body.replaceChildren();
    body.scrollTop = 0;
    root.hidden = false;
    isOpen = true;
    const api = { close, setTitle: (t) => (titleEl.textContent = t) };
    cleanup = render(body, api) || null;
  }

  function close() {
    if (!isOpen) return;
    cleanup?.();
    cleanup = null;
    isOpen = false;
    root.hidden = true;
    body.replaceChildren();
    closeListeners.forEach((fn) => fn());
  }

  return {
    open,
    close,
    isOpen: () => isOpen,
    onClose: (fn) => closeListeners.push(fn),
  };
}
