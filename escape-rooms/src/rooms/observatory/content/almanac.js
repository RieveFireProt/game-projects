import { el } from '../../../engine/ui.js';
import { ALMANAC } from '../story.js';

// The loose Almanac page from the map chest: where the slow outer planets stood.
export function renderAlmanac(body) {
  body.append(
    el('div', { class: 'almanac' },
      el('h3', {}, ALMANAC.title),
      el('p', { class: 'almanac-sub' }, ALMANAC.subtitle),
      el('table', {},
        el('thead', {}, el('tr', {}, el('th', {}, 'Planet'), ALMANAC.dates.map((d) => el('th', {}, `Oct. ${d}`)))),
        el('tbody', {}, ALMANAC.rows.map(([name, symbol, values]) => el('tr', {},
          el('td', {}, `${symbol} ${name}`),
          values.map((v) => el('td', {}, `${v}°`)))))),
      el('p', { class: 'almanac-pencil handwritten' }, ALMANAC.pencil)),
    el('p', { class: 'caption' }, 'A page cut from this year’s Nautical Almanac.'));
}
