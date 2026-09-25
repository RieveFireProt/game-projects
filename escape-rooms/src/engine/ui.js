// Tiny DOM helpers shared by all modal content.

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) node.setAttribute(key, '');
    else if (value !== false && value != null) node.setAttribute(key, value);
  }
  node.append(...children.flat().filter((c) => c != null && c !== false));
  return node;
}

// A plain modal of paragraphs; used for flavour text and not-yet-built puzzles.
export function openText(game, { title, paragraphs, theme = 'paper' }) {
  game.openModal({
    title,
    theme,
    render(body) {
      body.append(el('div', { class: 'prose' }, paragraphs.map((p) => el('p', {}, p))));
    },
  });
}
