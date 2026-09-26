import { el } from '../../../engine/ui.js';
import { SIGHTINGS } from '../story.js';

const W = 900;
const H = 560;
const GLASS = 130; // radius of the ruby glass, in sheet pixels

// Pale blue writing buried under a storm of red ink. Through red glass the red ink
// fades into the paper and the blue turns dark, so the hidden lines stand out.
function drawSheet(g) {
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  g.fillStyle = '#efe3c6';
  g.fillRect(0, 0, W, H);
  const s = SIGHTINGS[1];
  const lines = [`${s.title}:`, ...wrap(s.text, 30)];
  g.font = "44px 'Segoe Script', 'Lucida Handwriting', 'Brush Script MT', cursive";
  g.textBaseline = 'middle';
  g.fillStyle = '#a4b6e2';
  lines.forEach((line, i) => g.fillText(line, 70, 110 + i * 80));
  // Decoy words in red, then a storm of red strokes over everything.
  const letters = 'abcdefghiklmnoprstuvwy';
  for (let i = 0; i < 160; i++) {
    g.fillStyle = `rgb(${232 + rand() * 20},${40 + rand() * 90},${50 + rand() * 80})`;
    g.save();
    g.translate(rand() * W, rand() * H);
    g.rotate((rand() - 0.5) * 0.5);
    g.fillText(Array.from({ length: 3 + Math.floor(rand() * 6) }, () => letters[Math.floor(rand() * letters.length)]).join(''), 0, 0);
    g.restore();
  }
  for (let i = 0; i < 1800; i++) {
    g.strokeStyle = `rgb(${230 + rand() * 25},${50 + rand() * 110},${60 + rand() * 100})`;
    g.lineWidth = 1.5 + rand() * 4;
    g.beginPath();
    const [x, y] = [rand() * W, rand() * H];
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (rand() - 0.5) * 80, y + (rand() - 0.5) * 80, x + (rand() - 0.5) * 120, y + (rand() - 0.5) * 60);
    g.stroke();
  }
}

function wrap(text, width) {
  const out = [''];
  for (const word of text.split(' ')) {
    if ((out.at(-1) + ' ' + word).trim().length > width) out.push(word);
    else out[out.length - 1] = (out.at(-1) + ' ' + word).trim();
  }
  return out;
}

// What the sheet looks like through ruby glass: only the red channel survives.
function filtered(source) {
  const c = el('canvas', { width: W, height: H });
  const g = c.getContext('2d');
  g.drawImage(source, 0, 0);
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.max(0, Math.min(1, (d[i] - 160) / 70));
    d[i] = 30 + v * 200;
    d[i + 1] = v * 30;
    d[i + 2] = v * 25;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function openRedSheet(game) {
  game.openModal({
    title: 'A sheet covered in red ink',
    theme: 'paper',
    render(body) {
      const { state } = game;
      const sheet = el('canvas', { class: 'red-sheet', width: W, height: H });
      drawSheet(sheet.getContext('2d'));
      const wrapEl = el('div', { class: 'red-sheet-wrap' }, sheet);
      const caption = el('p', { class: 'caption' });
      body.append(wrapEl, caption);

      if (!state.hasItem('ruby-glass')) {
        caption.textContent = state.has('sighting.2')
          ? 'Voss’s red crosshatching. Through the ruby glass, the second sighting was written underneath.'
          : 'Someone has scrawled over this sheet in red ink until nothing underneath can be made out. There is a paler writing below it, in blue, drowned in the red.';
        return;
      }

      const lens = el('canvas', { class: 'ruby-glass', width: GLASS * 2, height: GLASS * 2 });
      const lg = lens.getContext('2d');
      const view = filtered(sheet);
      let pos = { x: W - GLASS * 0.8, y: H - GLASS * 0.8 }; // resting on the corner of the sheet
      let drag = null;
      wrapEl.append(lens);
      caption.textContent = 'Drag the ruby glass across the sheet.';

      function place() {
        lg.clearRect(0, 0, GLASS * 2, GLASS * 2);
        lg.save();
        lg.beginPath();
        lg.rect(0, 0, GLASS * 2, GLASS * 2);
        lg.clip();
        lg.drawImage(view, pos.x - GLASS, pos.y - GLASS, GLASS * 2, GLASS * 2, 0, 0, GLASS * 2, GLASS * 2);
        lg.restore();
        lens.style.left = `${((pos.x - GLASS) / W) * 100}%`;
        lens.style.top = `${((pos.y - GLASS) / H) * 100}%`;
        lens.style.width = `${((GLASS * 2) / W) * 100}%`;
      }
      const toSheet = (e) => {
        const r = sheet.getBoundingClientRect();
        return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
      };
      lens.addEventListener('pointerdown', (e) => {
        const p = toSheet(e);
        drag = { dx: p.x - pos.x, dy: p.y - pos.y };
        lens.setPointerCapture(e.pointerId);
      });
      lens.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const p = toSheet(e);
        pos = { x: Math.max(0, Math.min(W, p.x - drag.dx)), y: Math.max(0, Math.min(H, p.y - drag.dy)) };
        place();
        // Once the glass has passed over the writing, the sighting counts as read.
        if (pos.y < 420 && pos.x < 700 && !state.has('sighting.2')) state.set('sighting.2');
      });
      lens.addEventListener('pointerup', () => (drag = null));
      place();
    },
  });
}
