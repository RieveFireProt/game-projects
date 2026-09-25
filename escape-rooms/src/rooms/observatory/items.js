import { el } from '../../engine/ui.js';
import { renderJournal } from './content/journal.js';

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
    render(body) {
      body.append(el('p', { class: 'caption' },
        'Two brass rings of letters, one inside the other. The inner ring turns. (Interactive wheel coming in phase 3.)'));
    },
  },
};
