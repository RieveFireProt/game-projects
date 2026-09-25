import { el } from '../../../engine/ui.js';

export const CLOCK_TIME = { hours: 11, minutes: 47 };

export function openClock(game) {
  game.openModal({
    title: 'The wall clock',
    theme: 'brass',
    render(body) {
      const face = el('div', { class: 'clock-view' });
      face.innerHTML = clockSvg(CLOCK_TIME.hours, CLOCK_TIME.minutes);
      body.append(face, el('p', { class: 'caption' },
        'An old wall clock. The pendulum hangs motionless; whenever it stopped, it has not moved since.'));
    },
  });
}

function clockSvg(hours, minutes) {
  const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = minutes * 6;
  const polar = (deg, r) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [150 + Math.cos(a) * r, 150 + Math.sin(a) * r];
  };

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const [x1, y1] = polar(i * 6, i % 5 ? 128 : 122);
    const [x2, y2] = polar(i * 6, 134);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${i % 5 ? 1 : 2.5}" />`;
  }).join('');
  const labels = numerals.map((n, i) => {
    const [x, y] = polar(i * 30, 104);
    return `<text x="${x}" y="${y}">${n}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 300 300" role="img" aria-label="A clock showing ${hours}:${minutes}">
      <circle cx="150" cy="150" r="146" fill="#6b4a22" />
      <circle cx="150" cy="150" r="138" fill="#efe4c8" stroke="#3a2a14" stroke-width="2" />
      <g stroke="#2b1d0e">${ticks}</g>
      <g class="numerals" fill="#2b1d0e">${labels}</g>
      <g fill="#1d140a">
        <path transform="rotate(${hourAngle} 150 150)" d="M144 162 L150 82 L156 162 Z" />
        <path transform="rotate(${minuteAngle} 150 150)" d="M147 166 L150 34 L153 166 Z" />
        <circle cx="150" cy="150" r="7" fill="#b08d4a" />
      </g>
    </svg>`;
}
