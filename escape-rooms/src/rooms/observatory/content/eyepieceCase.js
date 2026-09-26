import { el } from '../../../engine/ui.js';

// The case of spare eyepieces. Half of the torn page is tucked under the lining.
export function openEyepieceCase(game) {
  game.state.set('case.open');
  game.openModal({
    title: 'The eyepiece case',
    theme: 'brass',
    render(body) {
      const found = () => game.state.has('found.page-left');
      const view = el('div', { class: 'case-view' });
      const caption = el('p', { class: 'caption' });

      const draw = () => {
        view.innerHTML = caseSvg(found());
        caption.textContent = found()
          ? 'Four spare eyepieces in their velvet beds, and a loose corner of lining where the page was hidden.'
          : 'Four spare eyepieces in their velvet beds. One corner of the lining has lifted a little.';
        view.querySelector('.hidden-page')?.addEventListener('click', take);
      };

      function take() {
        game.state.set('found.page-left');
        game.state.addItem('page-left');
        game.hud.toast(`${game.room.items['page-left'].name} added to your satchel`);
        draw();
      }

      body.append(view, caption);
      draw();
    },
  });
}

function caseSvg(found) {
  const eyepiece = (x, y, r) => `
    <g transform="translate(${x} ${y})">
      <circle r="${r + 10}" fill="#4a0c1a"/>
      <circle r="${r}" fill="url(#brassGrad)" stroke="#5a4210" stroke-width="2"/>
      <circle r="${r * 0.55}" fill="#1a1a22" stroke="#8a6d2e" stroke-width="3"/>
      <circle r="${r * 0.25}" cx="${-r * 0.15}" cy="${-r * 0.15}" fill="rgba(160,190,255,0.35)"/>
    </g>`;
  return `
  <svg viewBox="0 0 800 520" role="img" aria-label="The open eyepiece case">
    <defs>
      <radialGradient id="brassGrad" cx="35%" cy="35%"><stop offset="0" stop-color="#f0d890"/><stop offset="1" stop-color="#8a6420"/></radialGradient>
      <linearGradient id="velvet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a1a2c"/><stop offset="1" stop-color="#4a0c18"/></linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a2e1c"/><stop offset="1" stop-color="#3a160c"/></linearGradient>
    </defs>
    <rect x="40" y="40" width="720" height="440" rx="16" fill="url(#wood)" stroke="#c9a24a" stroke-width="6"/>
    <rect x="70" y="70" width="660" height="380" rx="8" fill="url(#velvet)"/>
    ${eyepiece(180, 200, 42)}${eyepiece(330, 200, 36)}${eyepiece(470, 200, 30)}${eyepiece(600, 200, 26)}
    <rect x="110" y="310" width="580" height="4" fill="rgba(0,0,0,0.35)"/>
    ${found
      ? '<path d="M600 450 L730 450 L730 340 Q680 380 640 400 Z" fill="#5a1020" stroke="rgba(0,0,0,0.4)"/>'
      : `<g class="hidden-page" role="button" aria-label="Lift the lining" style="cursor:pointer">
          <path d="M610 450 L715 330 L745 360 L660 460 Z" fill="#e8dcbc" stroke="#8a7a5a" stroke-width="1.5"/>
          <path d="M630 440 L720 345 M640 448 L728 356" stroke="rgba(40,30,20,0.4)" stroke-width="1.5"/>
          <path d="M600 450 L730 450 L730 350 Q690 400 640 420 Z" fill="#6a1426" stroke="rgba(0,0,0,0.4)"/>
          <circle cx="700" cy="380" r="46" fill="transparent"/>
        </g>`}
    ${[[40, 40], [760, 40], [40, 480], [760, 480]].map(([x, y]) => `<rect x="${x - 16}" y="${y - 16}" width="32" height="32" rx="4" fill="#c9a24a"/>`).join('')}
  </svg>`;
}
