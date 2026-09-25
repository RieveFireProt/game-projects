import * as THREE from 'three';
import { buildGeometry, ROOM_RADIUS } from './geometry.js';
import { createHotspots } from './hotspots.js';
import { items } from './items.js';
import { puzzles } from './puzzles.js';
import { openLetter } from './content/letter.js';
import { POSITIONS } from './content/orreryData.js';
import { ringStop } from './content/orrery.js';
import { HEIGHTS, HOURS, telescopeHeight, telescopeHour } from './content/telescope.js';

const TAU = Math.PI * 2;

// Which sounds a state change makes: [pattern, [sound, delay seconds]...].
const SOUNDS = [
  [/^drawer\.open$/, ['clunk', 0], ['slide', 0.45]],
  [/^case\.open$/, ['creak', 0]],
  [/^(found|taken)\./, ['paper', 0]],
  [/^page\.assembled$/, ['chime', 0.2]],
  [/^orrery\.ring\./, ['tick', 0]],
  [/^orrery\.solved$/, ['chime', 0.3], ['slide', 0.8]],
  [/^wheel\.offset$/, ['tick', 0]],
  [/^telegram\.decoded$/, ['chime', 0]],
  [/^telescope\.lens$/, ['clunk', 0]],
  [/^telescope\.(hour|height)$/, ['ratchet', 0]],
  [/^telescope\.solved$/, ['discovery', 0]],
  [/^door\.open$/, ['gears', 1.2]],
];
const BOOK_PULL = 0.12;
const DOOR_SWING = 1.75;

// Assembles the observatory: geometry, hotspots, items, puzzles, and the visual
// changes that follow game state (drawers sliding, planets turning, the door opening).
export function buildObservatory(scene, game) {
  const geometry = buildGeometry(scene);
  const { colliders, spawn, objects: o, flavor } = geometry;
  const { state } = game;

  // Each entry eases one property towards a state-driven target.
  // angle: true takes the short way round.
  const followers = [
    { obj: o.drawer.position, key: 'z', target: () => (state.has('drawer.open') ? o.drawer.userData.openZ : o.drawer.userData.closedZ) },
    { obj: o.vossBook.position, key: 'z', target: () => o.vossBook.userData.homeZ + (state.has('found.page-right') ? BOOK_PULL : 0) },
    { obj: o.eyepieceLid.rotation, key: 'x', target: () => (state.has('case.open') ? o.eyepieceLid.userData.openX : 0), rate: 4 },
    ...o.planets.map((pivot, i) => ({
      obj: pivot.rotation, key: 'y', angle: true, rate: 5,
      // Stop I points at the marker (+Z); stops advance clockwise seen from above.
      target: () => -Math.PI / 2 - ringStop(state, i) * (TAU / POSITIONS),
    })),
    { obj: o.baseDrawer.position, key: 'z', target: () => (state.has('orrery.solved') ? o.baseDrawer.userData.openZ : 0), rate: 3 },
    { obj: o.hourPointer.rotation, key: 'x', angle: true, target: () => -(telescopeHour(state) / HOURS) * TAU },
    {
      obj: o.heightPointer.rotation, key: 'x',
      target: () => -(HEIGHTS.indexOf(telescopeHeight(state)) / (HEIGHTS.length - 1) - 0.5) * Math.PI * 1.5,
    },
    { obj: o.doorHinge.rotation, key: 'y', target: () => (state.has('door.open') ? DOOR_SWING : 0), rate: 0.9 },
  ];

  function syncVisibility() {
    o.baseDrawer.userData.lens.visible = !state.has('taken.lens');
    o.telescopeLens.visible = state.has('telescope.lens');
    // Dimmed rather than hidden: toggling visibility would recompile every lit material.
    o.stairLight.userData.flicker.base = state.has('door.open') ? o.stairLight.userData.onIntensity : 0;
  }

  // Snap everything to the saved state on load.
  for (const f of followers) f.obj[f.key] = f.target();
  syncVisibility();
  state.on(syncVisibility);

  let time = 0;
  return {
    radius: ROOM_RADIUS,
    colliders,
    spawn,
    items,
    puzzles,
    hotspots: [
      ...createHotspots(o, game),
      ...flavor.map((f, i) => ({ id: `flavor-${i}`, object: f.object, label: f.label, onUse: () => game.hud.say(f.line) })),
    ],
    intro: () => openLetter(game),
    // Waypoints for the walk out through the door and down the stairs, skirting the telescope.
    exitPath(from) {
      const eye = 1.6;
      const points = [new THREE.Vector3(from.x, eye, from.z)];
      const a = Math.atan2(from.z, from.x);
      if (Math.abs(a) > Math.PI / 3) points.push(new THREE.Vector3(Math.cos(a / 2) * 3.6, eye, Math.sin(a / 2) * 3.6));
      points.push(
        new THREE.Vector3(4.7, eye, 0),
        new THREE.Vector3(ROOM_RADIUS - 0.1, eye, 0),
        new THREE.Vector3(ROOM_RADIUS + 1.0, eye - 0.1, 0),
        new THREE.Vector3(ROOM_RADIUS + 2.0, eye - 0.65, 0),
      );
      return points;
    },
    firePosition: geometry.firePosition,
    soundsFor(type, detail) {
      if (type === 'hint') return [['paper', 0]];
      if (type !== 'flag') return [];
      return SOUNDS.find(([pattern]) => pattern.test(detail))?.slice(1) ?? [];
    },
    // Returns true while anything is moving, so shadows can be refreshed.
    update(dt) {
      time += dt;
      geometry.update(time);
      let moving = false;
      for (const f of followers) {
        let gap = f.target() - f.obj[f.key];
        if (f.angle) gap = ((((gap + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
        if (Math.abs(gap) < 1e-4) continue;
        f.obj[f.key] += gap * (1 - Math.exp(-(f.rate ?? 6) * dt));
        moving = true;
      }
      return moving;
    },
  };
}
