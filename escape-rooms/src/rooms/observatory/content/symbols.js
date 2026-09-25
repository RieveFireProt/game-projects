// Constellation pictograms, drawn in a 40×40 box centred on the origin.
// The same path strings feed SVG (<path d>) and canvas (new Path2D(d)).

export const PICTOGRAMS = {
  lyre: 'M-9 13 C-17 3 -16 -9 -9 -15 M9 13 C17 3 16 -9 9 -15 M-11 13 L11 13 M-11 -13 L11 -13 M-4 -13 L-4 13 M0 -13 L0 13 M4 -13 L4 13',
  swan: 'M0 -17 L0 17 M-17 -3 C-8 -7 8 -7 17 -3 M0 -17 C-4 -20 -9 -17 -7 -13',
  eagle: 'M-17 6 L0 -12 L17 6 M0 -12 L0 15 M-6 15 L6 15 M-10 -1 L-6 4 M10 -1 L6 4',
  crown: 'M-14 9 L-14 -5 L-7 3 L0 -10 L7 3 L14 -5 L14 9 Z',
  club: 'M-2 16 L2 16 L4 -5 C11 -9 8 -18 0 -17 C-8 -18 -11 -9 -4 -5 Z',
  serpent: 'M-17 10 C-9 -14 -1 18 7 -4 C10 -12 14 -14 17 -12 M17 -12 L14 -15 M17 -12 L14 -9',
  bear: 'M-15 -7 L-8 -9 L-2 -7 L4 -4 L5 7 L16 9 L15 -2 L4 -4',
  crook: 'M0 17 L0 -8 C0 -18 11 -18 11 -8',
};

export function pictogramSvg(name, { size = 40, stroke = 'currentColor', width = 2.4 } = {}) {
  return `<svg viewBox="-20 -20 40 40" width="${size}" height="${size}" aria-hidden="true">
    <path d="${PICTOGRAMS[name]}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function drawPictogram(g, name, x, y, scale = 1) {
  g.save();
  g.translate(x, y);
  g.scale(scale, scale);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.stroke(new Path2D(PICTOGRAMS[name]));
  g.restore();
}
