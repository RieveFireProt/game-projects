import * as THREE from 'three';
import { box, cylinder, group, mergeStatic, mesh, place, seededRandom, unclickable } from '../../engine/build.js';
import { ROOM_RADIUS, WALL_HEIGHT, SLIT_HALF_WIDTH, DOOR_GAP, atWall, colliderAt } from './layout.js';
import { M, stoneView } from './materials.js';
import { createLights, createMoonbeam, flameMesh, sconceMesh } from './lighting.js';
import { glow, moonFace } from './textures.js';
import { CLOCK_TIME } from './content/clock.js';
import { drawStarChart } from './content/starChart.js';
import { FLAVOR } from './story.js';
import * as F from './furniture.js';
import * as D from './decor.js';

// Assembles the observatory: a stone tower room under a planked dome, lit by oil
// lamps, a stove and moonlight through the observing slit.

export { ROOM_RADIUS };

const MOON_POSITION = new THREE.Vector3(-70, 42, 4);
const DOOR_HEIGHT = 2.2;
const DOOR_STAR_HEIGHT = 2.82;
const TAU = Math.PI * 2;

// A band of wall (open cylinder, seen from inside) that leaves the doorway clear.
function wallBand(radius, height, y, material, gap = DOOR_GAP) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 128, 1, true, Math.PI / 2 + gap / 2, TAU - gap);
  const band = mesh(geometry, material, 0, y + height / 2, 0);
  band.castShadow = true;
  return band;
}

// A horizontal moulding running round the wall from fromDeg to toDeg.
function moulding(radius, tube, y, material, fromDeg, toDeg) {
  const arc = THREE.MathUtils.degToRad(toDeg - fromDeg);
  const torus = mesh(new THREE.TorusGeometry(radius, tube, 6, 160, arc), material);
  torus.rotation.x = Math.PI / 2;
  const g = group(torus);
  g.rotation.y = -THREE.MathUtils.degToRad(fromDeg);
  g.position.y = y;
  return g;
}

function buildShell(scene) {
  const floor = new THREE.Mesh(new THREE.CircleGeometry(ROOM_RADIUS, 96), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.4, 64), M.rug);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.006;
  rug.receiveShadow = true;

  const doorDeg = THREE.MathUtils.radToDeg(DOOR_GAP / 2) + 2;
  const wall = wallBand(ROOM_RADIUS, WALL_HEIGHT, 0, M.stone);
  const aboveDoor = mesh(
    new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, WALL_HEIGHT - DOOR_HEIGHT, 8, 1, true, Math.PI / 2 - DOOR_GAP / 2, DOOR_GAP),
    stoneView(0.6, 1.8, THREE.BackSide),
    0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, 0,
  );
  const wainscot = wallBand(ROOM_RADIUS - 0.03, 1, 0, M.wainscot);
  const skirting = wallBand(ROOM_RADIUS - 0.05, 0.14, 0, M.darkWood.clone());
  skirting.material.side = THREE.BackSide;
  const chairRail = moulding(ROOM_RADIUS - 0.05, 0.03, 1.0, M.darkWood, doorDeg + 6, 360 - doorDeg - 6);
  const cornice = moulding(ROOM_RADIUS - 0.08, 0.09, WALL_HEIGHT - 0.04, M.darkWood, 0, 360);

  // Planked dome with the observing slit along the -X meridian.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(ROOM_RADIUS, 96, 32, SLIT_HALF_WIDTH, TAU - SLIT_HALF_WIDTH * 2, 0, Math.PI / 2),
    M.dome,
  );
  dome.position.y = WALL_HEIGHT;
  dome.castShadow = true;
  dome.receiveShadow = true;

  // Iron ribs every 22.5°, heavier ones framing the slit.
  const ribs = group();
  const rib = (deg, tube, material) => {
    const torus = mesh(new THREE.TorusGeometry(ROOM_RADIUS - 0.06, tube, 6, 40, Math.PI / 2), material);
    const g = group(torus);
    g.rotation.y = -THREE.MathUtils.degToRad(deg);
    ribs.add(g);
  };
  const slitDeg = THREE.MathUtils.radToDeg(SLIT_HALF_WIDTH);
  for (let deg = 0; deg < 360; deg += 22.5) if (Math.abs(deg - 180) > slitDeg + 5) rib(deg, 0.04, M.darkWood);
  rib(180 - slitDeg - 0.8, 0.08, M.paintedIron);
  rib(180 + slitDeg + 0.8, 0.08, M.paintedIron);
  ribs.position.y = WALL_HEIGHT;

  // Dome track: the ring the dome rides on, with bogie wheels.
  const track = moulding(ROOM_RADIUS - 0.1, 0.07, WALL_HEIGHT + 0.02, M.paintedIron, 0, 360);
  const bogies = group();
  for (let deg = 10; deg < 360; deg += 30) {
    const wheel = cylinder(0.09, 0.09, 0.05, M.iron, 0, 0, 0, 16);
    wheel.rotation.x = Math.PI / 2;
    const b = group(wheel, box(0.26, 0.05, 0.1, M.paintedIron, 0, -0.07, 0));
    atWall(b, deg, 0.22, WALL_HEIGHT - 0.1);
    bogies.add(b);
  }

  // Zenith boss where the ribs meet.
  const boss = cylinder(0.25, 0.3, 0.12, M.paintedIron, 0, WALL_HEIGHT + ROOM_RADIUS - 0.08, 0, 24);

  scene.add(floor, rug, wall, aboveDoor, wainscot, skirting, chairRail, cornice, dome, ribs, track, bogies, boss);
}

function buildSky(scene) {
  const rand = seededRandom(7);
  const positions = [];
  const colors = [];
  for (let i = 0; i < 2600; i++) {
    const theta = rand() * TAU;
    const y = rand() * 0.95 + 0.05;
    const r = Math.sqrt(1 - y * y);
    positions.push(Math.cos(theta) * r * 90, y * 90, Math.sin(theta) * r * 90);
    const warm = rand();
    const b = 0.5 + rand() * 0.5;
    colors.push(b * (0.85 + warm * 0.15), b * 0.9, b * (1 - warm * 0.2));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, fog: false }));

  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 16), new THREE.MeshBasicMaterial({ map: moonFace(), fog: false }));
  moon.position.copy(MOON_POSITION);
  moon.lookAt(0, 0, 0);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glow(), color: 0x8fa0d0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5, fog: false,
  }));
  halo.position.copy(MOON_POSITION);
  halo.scale.setScalar(26);
  scene.add(unclickable(stars), unclickable(moon), unclickable(halo));
}

// The stairwell revealed when the door swings open at the end.
function buildStairwell(scene) {
  const w = 1.3;
  const start = ROOM_RADIUS - 0.02;
  const length = 3;
  const walls = mesh(new THREE.BoxGeometry(length, 4, w), stoneView(1.5, 4, THREE.BackSide), start + length / 2, 0.5, 0);
  const landing = box(1.0, 1.5, w, stoneView(0.5, 0.75), start + 0.5, -0.75, 0);
  const steps = group();
  for (let i = 0; i < 8; i++) {
    const top = -0.18 * (i + 1);
    steps.add(box(0.3, 1.5 + top, w, stoneView(0.15, 0.4), start + 1.15 + i * 0.3, (top - 1.5) / 2, 0));
  }
  const flame = flameMesh(1.2);
  flame.position.set(start + 0.8, 1.9, w / 2 - 0.12);
  const bracket = box(0.06, 0.2, 0.12, M.blackIron, start + 0.8, 1.8, w / 2 - 0.06);
  scene.add(walls, landing, steps, flame, bracket);
  return { flame };
}

export function buildGeometry(scene) {
  scene.background = new THREE.Color(0x05070d);
  scene.fog = new THREE.FogExp2(0x100c0a, 0.018);

  buildShell(scene);
  buildSky(scene);
  const stairwell = buildStairwell(scene);

  scene.add(new THREE.HemisphereLight(0x8a90b0, 0x4a3020, 0.7));
  const lights = createLights(scene);
  createMoonbeam(scene, {
    moonPosition: MOON_POSITION,
    roomRadius: ROOM_RADIUS,
    wallHeight: WALL_HEIGHT,
    slitHalfWidth: SLIT_HALF_WIDTH,
  });

  // --- Puzzle furniture ------------------------------------------------------

  const { desk, drawer, letter, lampFlame, chair: deskChair } = F.buildDesk();
  atWall(desk, 60, 0.7);
  const clock = atWall(F.buildClock(CLOCK_TIME), 60, 0.08, 2.1);

  const { shelf: bookshelf, vossBook } = F.buildBookshelf();
  atWall(bookshelf, 115, 0.24);

  const { starChart, chartMesh } = F.buildStarChart(starChartTexture());
  atWall(starChart, 160, 0.04, 1.9);

  const { table: orreryTable, orrery, planets, baseDrawer, candleFlame } = F.buildOrrery();
  atWall(orreryTable, 215, 1.7);

  const { table: telegramTable, telegram, telegraphKey } = F.buildTelegramTable();
  atWall(telegramTable, 290, 1.0);
  telegramTable.add(telegram);

  const { telescope, lens: telescopeLens, hourPointer, heightPointer } = F.buildTelescope();

  const { door, hinge: doorHinge, doorStar } = F.buildDoor();
  atWall(door, 0, 0);
  atWall(doorStar, 0, 0.02, DOOR_STAR_HEIGHT);

  const { crate, eyepieceCase, lid: eyepieceLid } = F.buildEyepieceCase();
  const crateGroup = place(group(crate, eyepieceCase), 0.95, 0, -1.05, 0.4);

  scene.add(desk, clock, bookshelf, starChart, orreryTable, telegramTable, telescope, door, doorStar, crateGroup);

  // --- Decoration ------------------------------------------------------------

  const flavor = [];
  const colliders = [];
  const decor = (object, { at, inset = 0, y = 0, turn = 0, collide = 0, say = null, label = null }) => {
    if (at !== undefined) atWall(object, at, inset, y);
    object.rotation.y += turn;
    scene.add(object);
    if (collide) colliders.push(colliderAt(object, collide));
    if (say) flavor.push({ object, label, line: FLAVOR[say] });
    return object;
  };

  decor(D.coatStand(), { at: 22, inset: 0.35, collide: 0.3, say: 'coatStand', label: 'Coat stand' });
  decor(D.portrait(), { at: 80, inset: 0.02, y: 1.95, say: 'portrait', label: 'Portrait' });
  decor(D.globe(), { at: 92, inset: 0.8, turn: 0.6, collide: 0.35, say: 'globe', label: 'Globe' });
  decor(D.bookPile(8), { at: 124, inset: 0.45, turn: 0.3 });
  const mapChest = decor(D.mapChest(), { at: 137, inset: 0.32, collide: 0.55, say: 'mapChest', label: 'Map chest' });
  decor(D.winch(), { at: 176, inset: 0.02, say: 'winch', label: 'Dome winch' });
  decor(D.ladder(3.9, 0.85), { at: 189, inset: 0.02, collide: 0, say: 'ladder', label: 'Ladder' });
  colliders.push(colliderAt(atWall(new THREE.Object3D(), 189, 0.6), 0.3));
  decor(D.instrumentCabinet(), { at: 203, inset: 0.24, collide: 0.45, say: 'cabinet', label: 'Instrument cabinet' });
  decor(D.engraving('moon'), { at: 222, inset: 0.02, y: 2.05, say: 'moon', label: 'Engraving' });
  const stove = decor(D.stove(), { at: 239, inset: 0.55, collide: 0.45, say: 'stove', label: 'Stove' });
  decor(D.runner(1.3, 1.9, 3), { at: 265, inset: 1.2, turn: -0.3 });
  decor(D.armchair(), { at: 262, inset: 1.0, turn: -0.5, collide: 0.5, say: 'armchair', label: 'Armchair' });
  const side = D.sideTable();
  decor(side.table, { at: 272, inset: 1.05, collide: 0.28, say: 'teacup', label: 'Side table' });
  decor(D.engraving('saturn'), { at: 280, inset: 0.02, y: 2.05, say: 'saturn', label: 'Engraving' });
  decor(D.fern(), { at: 305, inset: 0.35, collide: 0.25, say: 'fern', label: 'Fern' });
  decor(D.trunk(), { at: 321, inset: 0.4, collide: 0.5, say: 'trunk', label: 'Steamer trunk' });
  decor(D.barometer(), { at: 344, inset: 0.03, y: 1.55, say: 'barometer', label: 'Barometer' });
  decor(D.bookPile(4), { at: 330, inset: 1.0, turn: 1.2 });
  const obsChair = place(D.observingChair(), 1.35, 0, 0.55, -Math.PI / 2);
  decor(obsChair, { collide: 0.3, say: 'observingChair', label: 'Observing stool' });

  flavor.push(
    { object: telegraphKey, label: 'Telegraph key', line: FLAVOR.telegraph },
    { object: crate, label: 'Packing crate', line: FLAVOR.crate },
    { object: deskChair, label: 'Desk chair', line: FLAVOR.deskChair },
  );

  // --- Lights --------------------------------------------------------------

  for (const deg of [35, 102, 140, 252, 335]) {
    const sconce = atWall(sconceMesh(), deg, 0, 2.15);
    scene.add(sconce);
    lights.flame(sconce.userData.flame, { intensity: 5, color: 0xffa050 });
  }
  lights.flame(lampFlame, { intensity: 7, color: 0xffb566, shadow: true });
  lights.flame(candleFlame, { intensity: 1.6, color: 0xff9a40, jitter: 2 });
  mapChest.userData.flames.forEach((f, i) => lights.flame(f, { intensity: i === 1 ? 1.2 : 0, color: 0xff9a40, jitter: 2 }));
  lights.flame(stove.userData.ember, { intensity: 3, color: 0xff6428, jitter: 3 });
  const stairLight = lights.flame(stairwell.flame, { intensity: 4, color: 0xffa050 });
  stairLight.userData.onIntensity = 4;

  // --- Collisions ------------------------------------------------------------

  scene.updateMatrixWorld(true);
  const chairWorld = deskChair.getWorldPosition(new THREE.Vector3());
  colliders.push(
    { x: 0, z: 0, r: 0.72 },
    colliderAt(desk, 0.8),
    { x: chairWorld.x, z: chairWorld.z, r: 0.3 },
    colliderAt(bookshelf, 0.7),
    colliderAt(orreryTable, 0.6),
    colliderAt(telegramTable, 0.45),
    colliderAt(crateGroup, 0.38),
  );

  // Everything that moves or can be clicked keeps its own node; the rest is merged.
  const objects = {
    desk, drawer, letter, clock, bookshelf, vossBook, starChart, chartMesh, orrery, planets, baseDrawer,
    telegram, telescope, telescopeLens, hourPointer, heightPointer, door, doorHinge, doorStar,
    eyepieceCase, eyepieceLid, stairLight,
  };
  for (const o of [...Object.values(objects).flat(), ...flavor.map((f) => f.object)]) o.userData.keep = true;
  mergeStatic(scene);

  return {
    colliders,
    flavor,
    firePosition: stove.userData.ember.getWorldPosition(new THREE.Vector3()),
    spawn: { x: 4.2, z: 1.3, yaw: THREE.MathUtils.degToRad(75) },
    update(t) {
      lights.update(t);
    },
    objects,
  };
}

function starChartTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 704;
  drawStarChart(canvas.getContext('2d'), canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
