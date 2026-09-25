import { renderJournal } from './content/journal.js';
import { renderCipherWheel } from './content/cipherWheel.js';
import { renderOrreryPage, renderTornPage } from './content/tornPage.js';
import { renderLens } from './content/lens.js';

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
  lens: {
    name: 'Brass Lens',
    icon: '🔘',
    description: 'A finely ground lens in a heavy brass rim.',
    theme: 'brass',
    render: renderLens,
  },
};
