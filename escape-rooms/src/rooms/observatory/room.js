import * as THREE from 'three';
import { buildGeometry, ROOM_RADIUS, STAIRS } from './geometry.js';
import { createHotspots } from './hotspots.js';
import { items } from './items.js';
import { puzzles } from './puzzles.js';
import { openLetter } from './content/letter.js';
import { POSITIONS } from './content/orreryData.js';
import { ringStop } from './content/orrery.js';
import { HEIGHTS, HOURS, telescopeHeight, telescopeHour } from './content/telescope.js';
import { tilted } from './content/bookshelf.js';

const TAU = Math.PI * 2;

// Which sounds a state change makes: [pattern, [sound, delay seconds]...].
const SOUNDS = [
  [/^drawer\.open$/, ['clunk', 0], ['slide', 0.45]],
  [/^case\.open$/, ['creak', 0]],
  [/^(found|taken)\./, ['paper', 0]],
  [/^page\.assembled$/, ['chime', 0.2]],
  [/^orrery\.ring\./, ['tick', 0]],
  [/^orrery\.saturn$/, ['clunk', 0]],
  [/^orrery\.solved$/, ['chime', 0.3], ['slide', 0.8]],
  [/^wheel\.offset$/, ['tick', 0]],
  [/^telegram\.decoded$/, ['chime', 0]],
  [/^trunk\.open$/, ['clunk', 0], ['creak', 0.4]],
  [/^mapchest\.open$/, ['clunk', 0], ['slide', 0.4]],
  [/^cabinet\.open$/, ['clunk', 0], ['creak', 0.3]],
  [/^shelf\.open$/, ['clunk', 0.2], ['grind', 0.5]],
  [/^sighting\./, ['chime', 0]],
  [/^chart\.solved$/, ['chime', 0]],
  [/^telescope\.lens$/, ['clunk', 0]],
  [/^telescope\.(hour|height)$/, ['ratchet', 0]],
  [/^telescope\.solved$/, ['discovery', 0]],
  [/^door\.open$/, ['gears', 1.2]],
];
const BOOK_TIP = 0.32;
const DOOR_SWING = 1.75;
const RECORD_SPIN = (78 / 60) * TAU; // a 78 rpm record, in radians per second

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
    ...o.leverBooks.flatMap((books, shelf) => books.map((pivot, slot) => ({
      obj: pivot.rotation, key: 'x', rate: 8, target: () => (tilted(state, shelf) === slot ? BOOK_TIP : 0),
    }))),
    { obj: o.nicheDoor.rotation, key: 'y', target: () => (state.has('shelf.open') ? -1.9 : 0), rate: 1.5 },
    { obj: o.mapDrawer.position, key: 'z', target: () => (state.has('mapchest.open') ? 0.3 : 0), rate: 3 },
    { obj: o.cabinetDoor.rotation, key: 'y', target: () => (state.has('cabinet.open') ? -1.7 : 0), rate: 2 },
    { obj: o.trunkLid.rotation, key: 'x', target: () => (state.has('trunk.open') ? -1.75 : 0), rate: 2 },
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
    o.saturnBall.visible = state.has('orrery.saturn');
    o.telescopeLens.visible = state.has('telescope.lens');
    // Dimmed rather than hidden: toggling visibility would recompile every lit material.
    o.stairLight.userData.flicker.base = state.has('door.open') ? o.stairLight.userData.onIntensity : 0;
  }

  // The chart on the wall shows the players' threads.
  let chartKey = '';
  function syncChart() {
    const threads = state.get('chart.threads', []);
    const key = JSON.stringify([threads, state.has('chart.solved')]);
    if (key === chartKey) return;
    chartKey = key;
    geometry.redrawChart({ threads, solved: state.has('chart.solved') });
  }

  // Snap everything to the saved state on load.
  for (const f of followers) f.obj[f.key] = f.target();
  syncVisibility();
  syncChart();
  state.on(syncVisibility);
  state.on(syncChart);

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
    // Waypoints for the walk out through the door, down to the landing and round the
    // turn, skirting the telescope on the way.
    exitPath(from) {
      const eye = 1.6;
      const { top, upperLanding, landingX, landingY, w } = STAIRS;
      const turnX = landingX + w / 2;
      const points = [new THREE.Vector3(from.x, eye, from.z)];
      const a = Math.atan2(from.z, from.x);
      if (Math.abs(a) > Math.PI / 3) points.push(new THREE.Vector3(Math.cos(a / 2) * 3.6, eye, Math.sin(a / 2) * 3.6));
      points.push(
        new THREE.Vector3(4.7, eye, 0),
        new THREE.Vector3(ROOM_RADIUS - 0.1, eye, 0),
        new THREE.Vector3(top + upperLanding * 0.8, eye, 0),
        new THREE.Vector3(landingX - 0.2, eye + landingY + 0.1, -0.05),
        new THREE.Vector3(turnX - 0.1, eye + landingY, 0.05),
        new THREE.Vector3(turnX, eye + landingY - 0.2, w / 2 + 0.45),
        new THREE.Vector3(turnX, eye + landingY - 0.65, w / 2 + 1.5),
      );
      return points;
    },
    firePosition: geometry.firePosition,
    gramophonePosition: geometry.gramophonePosition,
    musicPlaying: () => !state.has('gramophone.off'),
    soundsFor(type, detail) {
      if (type === 'hint') return [['paper', 0]];
      if (type !== 'flag') return [];
      return SOUNDS.find(([pattern]) => pattern.test(detail))?.slice(1) ?? [];
    },
    // Returns true while anything is moving, so shadows can be refreshed.
    update(dt) {
      time += dt;
      geometry.update(time);
      if (!state.has('gramophone.off')) o.record.rotation.y -= RECORD_SPIN * dt;
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
