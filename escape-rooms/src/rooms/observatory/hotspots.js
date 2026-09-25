import { openText } from '../../engine/ui.js';
import { openLetter } from './content/letter.js';
import { openClock } from './content/clock.js';
import { openDrawer } from './content/drawer.js';

// Everything clickable in the room. Puzzles not yet built show a descriptive placeholder.
export function createHotspots(o, game) {
  const text = (title, paragraphs, theme) => () => openText(game, { title, paragraphs, theme });

  return [
    { id: 'letter', object: o.letter, label: 'Letter', onUse: () => openLetter(game) },
    { id: 'clock', object: o.clock, label: 'Wall clock', onUse: () => openClock(game) },
    { id: 'drawer', object: o.drawer, label: 'Desk drawer', onUse: () => openDrawer(game) },
    {
      id: 'door',
      object: o.door,
      label: 'Door',
      onUse: text('The door', [
        'Heavy oak, bolted fast. Somewhere inside the wall you can hear gears waiting.',
        'Voss’s letter said it opens only when the great telescope finds her discovery.',
      ]),
    },
    {
      id: 'door-star',
      object: o.doorStar,
      label: 'Brass star',
      onUse: text('The star above the door', [
        'A polished brass star hangs above the door. At its heart, engraved in a flowing hand, is a single letter: V.',
      ], 'brass'),
    },
    {
      id: 'bookshelf',
      object: o.bookshelf,
      label: 'Bookshelf',
      onUse: text('The bookshelf', [
        'Rows of star atlases, almanacs and Society proceedings, most of them bristling with paper markers.',
        '(Searching the spines is coming in phase 3.)',
      ]),
    },
    {
      id: 'star-chart',
      object: o.starChart,
      label: 'Star chart',
      onUse: text('The star chart', [
        'A great chart of the northern sky, inked in gold on blue. The lines of height are labelled down the side, but someone has scraped away the hour markings along the top.',
        '(Interactive chart coming in phase 3.)',
      ], 'brass'),
    },
    {
      id: 'orrery',
      object: o.orrery,
      label: 'Orrery',
      onUse: text('The orrery', [
        'A clockwork model of the inner planets. Each ring turns in stiff clicks against a small brass marker. The base has a seam but no keyhole.',
        '(Puzzle coming in phase 3.)',
      ], 'brass'),
    },
    {
      id: 'telegram',
      object: o.telegram,
      label: 'Telegram',
      onUse: text('A telegram', [
        'A telegram form addressed to the Royal Astronomical Society. The message is nonsense, a string of jumbled letters.',
        '(Cipher puzzle coming in phase 3.)',
      ]),
    },
    {
      id: 'eyepiece-case',
      object: o.eyepieceCase,
      label: 'Eyepiece case',
      onUse: text('The eyepiece case', [
        'A velvet-lined case of spare eyepieces for the great telescope.',
        '(Search coming in phase 3.)',
      ], 'brass'),
    },
    {
      id: 'telescope',
      object: o.telescope,
      label: 'Great telescope',
      onUse: text('The great telescope', [
        'Twelve feet of brass aimed at the slit in the dome. On the mount are two dials, HOUR and HEIGHT, and beside the eyepiece is an empty socket where a lens should sit.',
        '(Final puzzle coming in phase 3.)',
      ], 'brass'),
    },
  ];
}
