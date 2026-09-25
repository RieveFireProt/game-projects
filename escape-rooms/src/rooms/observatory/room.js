import { buildGeometry, ROOM_RADIUS } from './geometry.js';
import { createHotspots } from './hotspots.js';
import { items } from './items.js';
import { puzzles } from './puzzles.js';
import { openLetter } from './content/letter.js';

// Assembles the observatory: geometry, hotspots, items, puzzles, and the
// visual changes that follow game state (e.g. the drawer sliding open).
export function buildObservatory(scene, game) {
  const { colliders, spawn, objects } = buildGeometry(scene);
  const { drawer } = objects;

  function drawerTarget() {
    return game.state.has('drawer.open') ? drawer.userData.openZ : drawer.userData.closedZ;
  }
  drawer.position.z = drawerTarget();

  return {
    radius: ROOM_RADIUS,
    colliders,
    spawn,
    items,
    puzzles,
    hotspots: createHotspots(objects, game),
    intro: () => openLetter(game),
    update(dt) {
      drawer.position.z += (drawerTarget() - drawer.position.z) * (1 - Math.exp(-6 * dt));
    },
  };
}
