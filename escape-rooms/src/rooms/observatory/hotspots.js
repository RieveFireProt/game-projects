import { openText } from '../../engine/ui.js';
import { openLetter } from './content/letter.js';
import { openClock } from './content/clock.js';
import { openDrawer } from './content/drawer.js';
import { openDoor } from './content/door.js';
import { openBookshelf } from './content/bookshelf.js';
import { openStarChart } from './content/starChart.js';
import { openOrrery } from './content/orrery.js';
import { openTelegram } from './content/telegram.js';
import { openEyepieceCase } from './content/eyepieceCase.js';
import { openTelescope } from './content/telescope.js';
import { openTrunk } from './content/trunk.js';
import { openMapChest } from './content/mapChest.js';
import { openRedSheet } from './content/redSheet.js';
import {
  openCabinet, openCoatStand, openFern, openGramophone, openLadder, openNiche, openPortrait, openSideTable,
} from './content/places.js';

// Everything clickable in the room that matters. Flavour objects are wired up in room.js.
export function createHotspots(o, game) {
  const text = (title, paragraphs, theme) => () => openText(game, { title, paragraphs, theme });

  return [
    { id: 'letter', object: o.letter, label: 'Letter', onUse: () => openLetter(game) },
    { id: 'clock', object: o.clock, label: 'Wall clock', onUse: () => openClock(game) },
    { id: 'red-sheet', object: o.redSheet, label: 'Sheet of red scribbles', onUse: () => openRedSheet(game) },
    { id: 'drawer', object: o.drawer, label: 'Desk drawer', onUse: () => openDrawer(game) },
    // The rest of the desk leads to the drawer too, so it's never fiddly to hit.
    { id: 'desk', object: o.desk, label: 'Desk', onUse: () => openDrawer(game) },
    { id: 'door', object: o.door, label: 'Door', onUse: () => openDoor(game) },
    {
      id: 'door-star',
      object: o.doorStar,
      label: 'Brass star',
      onUse: text('The star above the door', [
        'A polished brass star hangs above the door. At its heart, engraved in a flowing hand, is a single letter: V.',
      ], 'brass'),
    },
    { id: 'bookshelf', object: o.bookshelf, label: 'Bookshelf', onUse: () => openBookshelf(game) },
    { id: 'niche', object: o.niche, label: 'Priest-hole', onUse: () => openNiche(game), enabled: () => game.state.has('shelf.open') },
    { id: 'star-chart', object: o.starChart, label: 'Star chart', onUse: () => openStarChart(game) },
    { id: 'orrery', object: o.orrery, label: 'Orrery', onUse: () => openOrrery(game) },
    { id: 'telegram', object: o.telegraph, label: 'Telegraph', onUse: () => openTelegram(game) },
    { id: 'eyepiece-case', object: o.eyepieceCase, label: 'Eyepiece case', onUse: () => openEyepieceCase(game) },
    { id: 'telescope', object: o.telescope, label: 'Great telescope', onUse: () => openTelescope(game) },
    { id: 'trunk', object: o.trunk, label: 'Steamer trunk', onUse: () => openTrunk(game) },
    { id: 'map-chest', object: o.mapChest, label: 'Map chest', onUse: () => openMapChest(game) },
    { id: 'coat-stand', object: o.coatStand, label: 'Coat stand', onUse: () => openCoatStand(game) },
    { id: 'side-table', object: o.sideTable, label: 'Side table', onUse: () => openSideTable(game) },
    { id: 'portrait', object: o.portrait, label: 'Portrait', onUse: () => openPortrait(game) },
    { id: 'fern', object: o.fern, label: 'Fern', onUse: () => openFern(game) },
    { id: 'ladder', object: o.ladder, label: 'Ladder', onUse: () => openLadder(game) },
    { id: 'cabinet', object: o.cabinet, label: 'Instrument cabinet', onUse: () => openCabinet(game) },
    { id: 'gramophone', object: o.gramophone, label: 'Gramophone', onUse: () => openGramophone(game) },
  ];
}
