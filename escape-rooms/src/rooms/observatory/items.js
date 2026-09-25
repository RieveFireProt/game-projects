import { el } from '../../engine/ui.js';
import { renderJournal } from './content/journal.js';
import { renderCipherWheel } from './content/cipherWheel.js';
import { renderOrreryPage, renderTornPage } from './content/tornPage.js';
import { renderLens } from './content/lens.js';
import { renderMorseCard } from './content/morse.js';
import { renderAlmanac } from './content/almanac.js';

const described = (text) => (body) => body.append(el('p', { class: 'prose caption' }, text));

// Everything that can go in the satchel. render(body, game, api) draws the inspect view.
export const items = {
  journal: {
    name: 'Voss’s Journal',
    title: 'The journal of Elara Voss',
    icon: '📓',
    description: 'Leather-bound and well thumbed.',
    theme: 'paper',
    render: renderJournal,
  },
  'morse-card': {
    name: 'Telegraph Code Card',
    icon: '📇',
    description: 'A printed card of dots and dashes.',
    theme: 'paper',
    render: renderMorseCard,
  },
  'cipher-wheel': {
    name: 'Cipher Wheel',
    icon: '⚙️',
    description: 'Two brass rings of letters, one inside the other.',
    theme: 'brass',
    render: renderCipherWheel,
  },
  'page-left': {
    name: 'Torn Half-Page',
    title: 'A torn half-page',
    icon: '📄',
    description: 'Found under the lining of the eyepiece case.',
    theme: 'brass',
    render: renderTornPage,
  },
  'page-right': {
    name: 'Torn Half-Page',
    title: 'A torn half-page',
    icon: '📄',
    description: 'Found between the pages of Voss’s own book.',
    theme: 'brass',
    render: renderTornPage,
  },
  'orrery-page': {
    name: 'The Orrery Page',
    icon: '📜',
    description: 'The missing journal page, pieced back together.',
    theme: 'brass',
    render: renderOrreryPage,
  },
  almanac: {
    name: 'Almanac Page',
    icon: '📰',
    description: 'A page cut from this year’s Nautical Almanac.',
    theme: 'paper',
    render: renderAlmanac,
  },
  saturn: {
    name: 'Little Saturn',
    icon: '🪐',
    description: 'A tiny brass planet with a ring round it.',
    theme: 'brass',
    render: described('A tiny brass Saturn, ring and all, with a hole bored through it to fit on a post. Soil is still caught in the ring.'),
  },
  'cabinet-key': {
    name: 'Small Brass Key',
    icon: '🗝️',
    description: 'Hung on a loop of string up on the dome rail.',
    theme: 'brass',
    render: described('A small brass key on a loop of string, a little greasy from the dome wheels.'),
  },
  'ruby-glass': {
    name: 'Ruby Glass',
    icon: '🟥',
    description: 'A square of deep red glass from the spectroscope set.',
    theme: 'brass',
    render: described('A square of deep ruby glass from a set of spectroscope slides. Through it, the world turns red and anything red disappears into it.'),
  },
  lens: {
    name: 'Brass Lens',
    icon: '🔘',
    description: 'A finely ground lens in a heavy brass rim.',
    theme: 'brass',
    render: renderLens,
  },
};
