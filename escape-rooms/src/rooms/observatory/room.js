import { buildGeometry, ROOM_RADIUS } from './geometry.js';
import { createHotspots } from './hotspots.js';
import { items } from './items.js';
import { puzzles } from './puzzles.js';
import { openLetter } from './content/letter.js';

// Assembles the observatory: geometry, hotspots, items, puzzles, and the
// visual changes that follow game state (e.g. the drawer sliding open).
export function buildObservatory(scene, game) {
  const geometry = buildGeometry(scene);
  const { colliders, spawn, objects, flavor } = geometry;
  const { drawer } = objects;

  function drawerTarget() {
    return game.state.has('drawer.open') ? drawer.userData.openZ : drawer.userData.closedZ;
  }
  drawer.position.z = drawerTarget();

  let time = 0;
  return {
    radius: ROOM_RADIUS,
    colliders,
    spawn,
    items,
    puzzles,
    hotspots: [
      ...createHotspots(objects, game),
      ...flavor.map((f, i) => ({ id: `flavor-${i}`, object: f.object, label: f.label, onUse: () => game.hud.say(f.line) })),
    ],
    intro: () => openLetter(game),
    // Returns true while anything is moving, so shadows can be refreshed.
    update(dt) {
      time += dt;
      geometry.update(time);
      const gap = drawerTarget() - drawer.position.z;
      drawer.position.z += gap * (1 - Math.exp(-6 * dt));
      return Math.abs(gap) > 1e-4;
    },
  };
}
