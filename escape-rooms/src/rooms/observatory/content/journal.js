import { el } from '../../../engine/ui.js';
import { JOURNAL } from '../story.js';

export function renderJournal(body) {
  let page = 0;
  const pageEl = el('div', { class: 'journal-page handwritten' });
  const counter = el('span', { class: 'page-count' });
  const prev = el('button', { class: 'btn subtle', onclick: () => go(-1) }, '← Previous');
  const next = el('button', { class: 'btn subtle', onclick: () => go(1) }, 'Next →');

  function go(step) {
    page = Math.max(0, Math.min(JOURNAL.length - 1, page + step));
    show();
  }

  function show() {
    const entry = JOURNAL[page];
    pageEl.classList.toggle('torn', Boolean(entry.torn));
    pageEl.replaceChildren(
      ...(entry.date ? [el('h3', {}, entry.date)] : []),
      ...entry.text.map((t) => el('p', {}, t)));
    counter.textContent = `${page + 1} / ${JOURNAL.length}`;
    prev.disabled = page === 0;
    next.disabled = page === JOURNAL.length - 1;
  }

  const onKey = (e) => {
    if (e.code === 'ArrowLeft') go(-1);
    if (e.code === 'ArrowRight') go(1);
  };
  window.addEventListener('keydown', onKey);

  body.append(el('div', { class: 'journal' }, pageEl, el('nav', { class: 'pager' }, prev, counter, next)));
  show();
  return () => window.removeEventListener('keydown', onKey);
}
