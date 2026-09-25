import * as THREE from 'three';
import { box, cylinder, group, lathe, legs, mat, mesh, place, seededRandom, shadowed, sphere } from '../../engine/build.js';
import { M } from './materials.js';
import { flameMesh } from './lighting.js';
import { bookSpine, label, scribbles } from './textures.js';

// The furniture the puzzles hang off. Each builder faces local +Z (towards the
// room centre once placed with atWall) and returns the pieces hotspots need.

export const DRAWER_TRAVEL = 0.32;
const DESK_TOP = 0.79;

// A flat sheet of paper lying on a surface.
function sheet(w, h, map, x, y, z, rz = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map, roughness: 1 }));
  m.rotation.set(-Math.PI / 2, 0, rz);
  m.position.set(x, y, z);
  m.receiveShadow = true;
  return m;
}

// Brass knob / drawer pull.
const knob = (x, y, z) => sphere(0.014, M.brass, x, y, z, 10);

export function buildDesk() {
  const desk = group(
    box(1.64, 0.05, 0.82, M.mahogany, 0, DESK_TOP - 0.025, 0),
    box(1.42, 0.004, 0.6, M.greenLeather, 0, DESK_TOP + 0.001, 0.02),
    box(0.66, 0.5, 0.03, M.mahogany, 0, 0.47, -0.36), // modesty panel
  );
  // Two pedestals of drawers either side of the kneehole.
  for (const sx of [-1, 1]) {
    const x = sx * 0.555;
    desk.add(box(0.46, 0.7, 0.74, M.mahogany, x, 0.39, 0), box(0.5, 0.05, 0.78, M.darkWood, x, 0.025, 0));
    for (let i = 0; i < 3; i++) {
      const y = 0.17 + i * 0.205;
      desk.add(box(0.4, 0.17, 0.02, M.darkWood, x, y, 0.375), knob(x, y, 0.395));
    }
  }

  // The locked centre drawer with its four-wheel combination plate.
  const drawer = group(
    box(0.58, 0.12, 0.7, M.mahogany, 0, 0.66, 0),
    box(0.62, 0.14, 0.025, M.darkWood, 0, 0.66, 0.36),
    box(0.16, 0.07, 0.01, M.brass, 0, 0.66, 0.378),
  );
  for (let i = 0; i < 4; i++) {
    const wheel = cylinder(0.011, 0.011, 0.012, M.darkBrass, -0.045 + i * 0.03, 0.66, 0.385, 12);
    drawer.add(wheel);
  }
  drawer.userData.closedZ = 0;
  drawer.userData.openZ = DRAWER_TRAVEL;

  const letter = sheet(0.21, 0.29, scribbles(3), -0.36, DESK_TOP + 0.006, 0.14, 0.2);

  // Student lamp: brass font, stem and a green glass shade that glows.
  const shadeMat = mat(0x2f6a3a, { emissive: 0x3a5a18, emissiveIntensity: 0.6, roughness: 0.3, side: THREE.DoubleSide });
  const lamp = group(
    lathe([[0, 0], [0.1, 0], [0.1, 0.02], [0.06, 0.04], [0.02, 0.05]], M.brass, 0, DESK_TOP, 0),
    cylinder(0.01, 0.01, 0.36, M.brass, 0, DESK_TOP + 0.2, 0),
    lathe([[0.03, 0], [0.16, -0.12], [0.165, -0.13], [0.07, 0.01]], shadeMat, 0, DESK_TOP + 0.43, 0, 28),
    sphere(0.045, M.brass, 0, DESK_TOP + 0.08, 0, 16),
  );
  lamp.position.set(0.56, 0, -0.2);
  lamp.traverse((o) => (o.castShadow = false));
  const lampFlame = flameMesh(1.4, 0xffd08a);
  lampFlame.position.set(0, DESK_TOP + 0.37, 0);
  lamp.add(lampFlame);

  // Desk clutter.
  const inkwell = group(
    box(0.07, 0.045, 0.07, M.glass, 0, DESK_TOP + 0.023, 0),
    box(0.055, 0.03, 0.055, mat(0x0a0a18, { roughness: 0.2 }), 0, DESK_TOP + 0.017, 0),
    cylinder(0.02, 0.022, 0.015, M.brass, 0, DESK_TOP + 0.052, 0, 12),
  );
  inkwell.position.set(0.12, 0, -0.26);
  const quill = mesh(new THREE.ConeGeometry(0.012, 0.28, 6), mat(0xf2ede0, { roughness: 1 }), 0.19, DESK_TOP + 0.1, -0.27);
  quill.rotation.set(0.2, 0, -0.6);

  const books = group();
  const bookColors = [0x5b2320, 0x23395b, 0x2f4a2a];
  [0.05, 0.045, 0.06].reduce((y, h, i) => {
    const b = box(0.26 - i * 0.02, h, 0.19 - i * 0.01, mat(bookColors[i], { roughness: 0.7 }), 0, y + h / 2, 0);
    b.rotation.y = (i - 1) * 0.18;
    books.add(b);
    return y + h;
  }, DESK_TOP);
  books.position.set(-0.6, 0, -0.2);

  const notes = [
    sheet(0.2, 0.26, scribbles(21), 0.2, DESK_TOP + 0.004, 0.1, -0.35),
    sheet(0.2, 0.26, scribbles(22), 0.26, DESK_TOP + 0.005, 0.02, -0.1),
  ];
  const spectacles = group(
    ...[-0.022, 0.022].map((x) => {
      const rim = mesh(new THREE.TorusGeometry(0.017, 0.0025, 6, 20), M.brass, x, 0, 0);
      rim.rotation.x = Math.PI / 2;
      return rim;
    }),
  );
  spectacles.position.set(-0.06, DESK_TOP + 0.004, 0.2);
  spectacles.rotation.y = 0.5;

  // Bentwood chair, pushed back as if someone left in a hurry.
  const chair = group(
    cylinder(0.21, 0.21, 0.04, M.darkWood, 0, 0.46, 0),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => {
      const leg = cylinder(0.014, 0.018, 0.46, M.darkWood, sx * 0.15, 0.23, sz * 0.15, 8);
      leg.rotation.set(sz * 0.08, 0, -sx * 0.08);
      return leg;
    }),
    ...[-0.13, 0.13].map((x) => cylinder(0.014, 0.014, 0.5, M.darkWood, x, 0.72, 0.17, 8)),
    ...[-0.05, 0.05].map((x) => cylinder(0.008, 0.008, 0.4, M.darkWood, x, 0.68, 0.18, 6)),
  );
  const backrest = mesh(new THREE.TorusGeometry(0.14, 0.016, 8, 24, Math.PI), M.darkWood, 0, 0.9, 0.17);
  chair.add(backrest);
  place(chair, -0.62, 0, 0.8, 0.6 + Math.PI);

  desk.add(drawer, letter, lamp, inkwell, quill, books, ...notes, spectacles, chair);
  return { desk, drawer, letter, lamp, lampFlame, chair };
}

// Vienna regulator style wall clock. Face and hands must keep showing the frozen time.
export function buildClock({ hours, minutes }) {
  const case_ = group(
    box(0.5, 1.1, 0.14, M.mahogany, 0, 0, 0),
    box(0.58, 0.06, 0.18, M.darkWood, 0, 0.58, 0),
    box(0.58, 0.06, 0.18, M.darkWood, 0, -0.58, 0),
    mesh(new THREE.ConeGeometry(0.3, 0.14, 4, 1), M.darkWood, 0, 0.68, 0),
    lathe([[0, 0], [0.025, 0.02], [0.012, 0.06], [0, 0.08]], M.brass, 0, 0.74, 0, 12),
    lathe([[0, 0], [0.03, -0.03], [0.012, -0.08], [0, -0.1]], M.brass, 0, -0.61, 0, 12),
  );
  case_.children[3].rotation.y = Math.PI / 4;
  case_.children[3].scale.z = 0.3;

  const face = cylinder(0.2, 0.2, 0.02, M.cream, 0, 0.22, 0.075, 48);
  face.rotation.x = Math.PI / 2;
  const bezel = mesh(new THREE.TorusGeometry(0.205, 0.018, 8, 48), M.brass, 0, 0.22, 0.088);

  // Numeral ticks as small bars around the face.
  const ticks = group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const t = box(0.008, 0.03, 0.004, M.iron, Math.sin(a) * 0.165, 0.22 + Math.cos(a) * 0.165, 0.087);
    t.rotation.z = -a;
    ticks.add(t);
  }

  // Clockwise as seen from the front = negative Z rotation.
  const hand = (length, width, degrees) => {
    const geometry = new THREE.BoxGeometry(width, length, 0.006);
    geometry.translate(0, length / 2 - 0.02, 0);
    const m = new THREE.Mesh(geometry, M.blackIron);
    m.position.set(0, 0.22, 0.092);
    m.rotation.z = -THREE.MathUtils.degToRad(degrees);
    return m;
  };

  // Glass door over the pendulum, and the pendulum hanging dead still.
  const glassDoor = box(0.4, 0.62, 0.005, M.glass, 0, -0.2, 0.073);
  glassDoor.castShadow = false;
  const pendulum = group(
    box(0.012, 0.42, 0.006, M.darkBrass, 0, -0.18, 0.05),
    cylinder(0.06, 0.06, 0.012, M.brass, 0, -0.4, 0.05, 28),
  );
  pendulum.children[1].rotation.x = Math.PI / 2;
  const back = box(0.42, 0.64, 0.005, mat(0x2a1a10), 0, -0.2, 0.04);

  return group(case_, back, pendulum, glassDoor, face, bezel, ticks,
    hand(0.11, 0.016, (hours + minutes / 60) * 30), hand(0.17, 0.01, minutes * 6),
    sphere(0.012, M.brass, 0, 0.22, 0.095, 10));
}

// Tall bookcase. Returns the book Voss wrote so it can slide out once found.
export function buildBookshelf() {
  const rand = seededRandom(42);
  const spine = bookSpine();
  const colors = [0x6b2420, 0x23395b, 0x2f4a2a, 0x6b5a2a, 0x3b2a4a, 0x7a4a22, 0x1e1e24];
  const bookMats = colors.map((c) => mat(c, { map: spine, roughness: 0.75 }));
  const shelf = group(
    box(1.4, 2.2, 0.03, M.darkWood, 0, 1.1, -0.185),
    box(0.05, 2.3, 0.42, M.mahogany, -0.7, 1.15, 0),
    box(0.05, 2.3, 0.42, M.mahogany, 0.7, 1.15, 0),
    box(1.56, 0.08, 0.48, M.mahogany, 0, 2.32, 0.01),
    box(1.5, 0.04, 0.46, M.darkWood, 0, 2.26, 0.01),
    box(1.45, 0.1, 0.42, M.darkWood, 0, 0.05, 0),
  );
  let vossBook = null;
  for (let row = 0; row < 5; row++) {
    const y = 0.1 + row * 0.43;
    shelf.add(box(1.36, 0.03, 0.38, M.mahogany, 0, y, 0));
    let x = -0.66;
    let index = 0;
    while (x < 0.6) {
      // Leave the odd gap with a leaning book, like a real shelf.
      if (rand() < 0.05 && x < 0.4) {
        const w = 0.04;
        const lean = box(w, 0.3, 0.24, bookMats[Math.floor(rand() * bookMats.length)], x + 0.1, y + 0.16, 0.02);
        lean.rotation.z = -0.35;
        shelf.add(lean);
        x += 0.16;
        continue;
      }
      const w = 0.03 + rand() * 0.035;
      const h = 0.25 + rand() * 0.11;
      const isVoss = row === 2 && index === 13;
      const material = isVoss ? mat(0x234030, { map: spine, roughness: 0.6 }) : bookMats[Math.floor(rand() * bookMats.length)];
      const book = box(w, h, 0.25, material, x + w / 2, y + 0.015 + h / 2, 0.02);
      if (isVoss) {
        vossBook = book;
        book.userData.homeZ = book.position.z;
      }
      shelf.add(book);
      x += w + 0.003;
      index++;
    }
  }
  return { shelf, vossBook };
}

export function buildStarChart(texture) {
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.98), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 }));
  chart.position.z = 0.03;
  chart.receiveShadow = true;
  const frame = group(
    box(1.52, 0.06, 0.05, M.darkBrass, 0, 0.52, 0.02),
    box(1.52, 0.06, 0.05, M.darkBrass, 0, -0.52, 0.02),
    box(0.06, 1.1, 0.05, M.darkBrass, -0.74, 0, 0.02),
    box(0.06, 1.1, 0.05, M.darkBrass, 0.74, 0, 0.02),
  );
  return { starChart: group(box(1.5, 1.08, 0.02, M.darkWood), chart, frame), chartMesh: chart };
}

// Tripod table with the orrery and a candle. Planet pivots turn with the puzzle.
export function buildOrrery() {
  const table = group(
    cylinder(0.5, 0.5, 0.04, M.mahogany, 0, 0.75, 0, 48),
    mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 64), M.darkWood, 0, 0.75, 0),
    lathe([[0.03, 0], [0.06, 0.05], [0.045, 0.2], [0.07, 0.3], [0.05, 0.45], [0.035, 0.6], [0.06, 0.63], [0, 0.63]], M.darkWood, 0, 0.1, 0),
  );
  table.children[1].rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const foot = box(0.04, 0.05, 0.36, M.darkWood, 0, 0, 0);
    foot.geometry.translate(0, 0, 0.18);
    const pivot = group(foot);
    pivot.position.y = 0.14;
    pivot.rotation.set(0.35, (i / 3) * Math.PI * 2, 0);
    table.add(pivot);
  }

  // Base drum with a hidden drawer that slides out when the puzzle is solved.
  const orrery = group(
    cylinder(0.17, 0.19, 0.08, M.darkWood, 0, 0.81, 0, 40),
    mesh(new THREE.TorusGeometry(0.175, 0.006, 6, 48), M.brass, 0, 0.85, 0),
    cylinder(0.12, 0.14, 0.03, M.brass, 0, 0.865, 0, 40),
    cylinder(0.012, 0.012, 0.26, M.brass, 0, 1.0, 0, 10),
    box(0.012, 0.02, 0.02, M.brass, 0, 0.9, 0.12), // the marker
  );
  orrery.children[1].rotation.x = Math.PI / 2;
  const baseDrawer = group(
    box(0.12, 0.05, 0.14, M.darkWood, 0, 0.81, 0.08),
    box(0.1, 0.004, 0.1, M.velvet, 0, 0.837, 0.08),
  );
  baseDrawer.userData.closedZ = 0;
  baseDrawer.userData.openZ = 0.13;
  const baseLens = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 24), mat(0xcfe0ff, { metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0.845, 0.08);
  baseLens.userData.keep = true;
  baseDrawer.userData.lens = baseLens;
  baseDrawer.add(baseLens);
  orrery.add(baseDrawer);

  const sun = sphere(0.05, mat(0xe8b44a, { emissive: 0x9a5a0a, emissiveIntensity: 0.8, metalness: 0.4, roughness: 0.3 }), 0, 1.15, 0);
  orrery.add(sun);

  const planetColors = [0x9a9a9a, 0xd8c08a, 0x3f78b8, 0xb0502a];
  const planets = [];
  [0.1, 0.16, 0.23, 0.3].forEach((radius, i) => {
    const y = 1.08 - i * 0.03;
    const ring = mesh(new THREE.TorusGeometry(radius, 0.003, 6, 64), M.brass, 0, y, 0);
    ring.rotation.x = Math.PI / 2;
    const arm = box(radius, 0.004, 0.006, M.brass, radius / 2, 0, 0);
    const post = cylinder(0.003, 0.003, 0.03, M.brass, radius, 0.015, 0, 6);
    const planet = sphere(0.016 + i * 0.004, mat(planetColors[i], { roughness: 0.5 }), radius, 0.035, 0, 16);
    const pivot = group(arm, post, planet);
    pivot.position.y = y;
    orrery.add(ring, pivot);
    planets.push(pivot);
  });

  const candle = group(
    lathe([[0, 0], [0.05, 0], [0.05, 0.01], [0.015, 0.02], [0.012, 0.08], [0.03, 0.09], [0.03, 0.1], [0.012, 0.1]], M.brass, 0, 0.77, 0, 16),
    cylinder(0.012, 0.012, 0.1, M.wax, 0, 0.92, 0, 10),
  );
  const candleFlame = flameMesh(0.9);
  candleFlame.position.set(0, 0.99, 0);
  candle.add(candleFlame);
  candle.position.set(0.3, 0, -0.18);

  table.add(candle, orrery);
  return { table, orrery, planets, baseDrawer, candleFlame };
}

export function buildTelegramTable() {
  const table = group(
    box(0.62, 0.035, 0.62, M.mahogany, 0, 0.74, 0),
    box(0.54, 0.08, 0.54, M.darkWood, 0, 0.68, 0),
    ...legs(0.56, 0.56, 0.66, 0.04, M.darkWood, 0.02),
  );
  // Telegraph key and sounder on a small board.
  const key = group(
    box(0.2, 0.02, 0.1, M.darkWood, 0, 0.768, 0),
    box(0.14, 0.008, 0.012, M.brass, 0, 0.788, 0),
    cylinder(0.014, 0.014, 0.012, mat(0x111111), 0.07, 0.798, 0, 12),
    cylinder(0.008, 0.008, 0.03, M.brass, -0.06, 0.79, 0, 8),
  );
  const sounder = group(
    box(0.12, 0.015, 0.08, M.darkWood, 0, 0.765, 0),
    cylinder(0.016, 0.016, 0.05, M.brass, -0.03, 0.795, 0, 10),
    cylinder(0.016, 0.016, 0.05, M.brass, 0.03, 0.795, 0, 10),
    box(0.1, 0.008, 0.02, M.brass, 0, 0.825, 0),
  );
  place(key, 0.13, 0, -0.16, 0.2);
  place(sounder, -0.14, 0, -0.18, -0.1);
  const telegraphKey = group(key, sounder);
  table.add(telegraphKey);

  const telegram = sheet(0.22, 0.16, scribbles(9, { w: 320, h: 230, paper: '#e6d6a8', header: 'POST OFFICE TELEGRAPHS', top: 26 }), -0.06, 0.762, 0.1, -0.15);
  return { table, telegram, telegraphKey };
}

// The great telescope: cast-iron pier, fork mount, brass tube aimed at the slit.
// Dials face +X, towards the door side where players arrive.
export function buildTelescope() {
  const pier = group(
    lathe([[0.55, 0], [0.55, 0.06], [0.42, 0.1], [0.3, 0.2], [0.24, 0.32], [0.2, 1.1], [0.26, 1.2], [0.3, 1.26], [0.3, 1.3], [0, 1.3]], M.paintedIron, 0, 0, 0, 40),
  );
  for (const y of [0.34, 1.16]) {
    const band = mesh(new THREE.TorusGeometry(y > 1 ? 0.235 : 0.235, 0.015, 8, 40), M.brass, 0, y, 0);
    band.rotation.x = Math.PI / 2;
    pier.add(band);
  }
  // Bolts around the foot.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pier.add(cylinder(0.022, 0.022, 0.03, M.brass, Math.cos(a) * 0.48, 0.07, Math.sin(a) * 0.48, 8));
  }

  const head = group(
    cylinder(0.3, 0.32, 0.05, M.brass, 0, 1.325, 0, 40),
    box(0.44, 0.3, 0.44, M.paintedIron, 0, 1.5, 0),
    box(0.1, 0.5, 0.14, M.paintedIron, 0, 1.85, -0.3),
    box(0.1, 0.5, 0.14, M.paintedIron, 0, 1.85, 0.3),
    cylinder(0.05, 0.05, 0.72, M.brass, 0, 2.0, 0, 16),
  );
  head.children[4].rotation.x = Math.PI / 2;

  // Setting dials with pointers that turn with the puzzle.
  const dialFace = (text) => {
    const t = label(text, { w: 128, h: 128, bg: '#caa35a', color: '#2b1d0e', size: 0.16, weight: 'bold' });
    return new THREE.MeshStandardMaterial({ map: t, metalness: 0.6, roughness: 0.35 });
  };
  const dial = (z, text) => {
    const d = cylinder(0.1, 0.1, 0.025, [M.brass, dialFace(text), M.brass], 0.23, 1.5, z, 32);
    d.rotation.z = -Math.PI / 2;
    d.rotation.y = 0;
    const pointer = box(0.004, 0.08, 0.012, M.blackIron, 0, 0.04, 0);
    const pointerPivot = group(pointer);
    pointerPivot.position.set(0.245, 1.5, z);
    pointerPivot.rotation.x = 0;
    return { d, pointerPivot };
  };
  const hourDial = dial(-0.11, 'HOUR');
  const heightDial = dial(0.11, 'HEIGHT');
  head.add(hourDial.d, hourDial.pointerPivot, heightDial.d, heightDial.pointerPivot);

  // Tube, tilted 40° off vertical towards the slit (-X); eyepiece end low on the +X side.
  const tube = group(
    cylinder(0.14, 0.12, 3.2, M.brass, 0, 0.4, 0, 40),
    cylinder(0.165, 0.165, 0.45, M.darkBrass, 0, 1.95, 0, 40),
    cylinder(0.04, 0.05, 0.2, M.blackIron, 0, -1.28, 0, 16),
    cylinder(0.025, 0.03, 0.1, M.brass, 0, -1.42, 0, 16),
    cylinder(0.035, 0.035, 0.6, M.brass, 0.2, 0.4, 0, 16), // finder
  );
  for (const y of [-1.0, -0.2, 0.9, 1.72]) {
    const band = mesh(new THREE.TorusGeometry(0.145 - (y + 1) * 0.006, 0.014, 8, 40), M.darkBrass, 0, y, 0);
    band.rotation.x = Math.PI / 2;
    tube.add(band);
  }
  for (const y of [0.2, 0.6]) tube.add(box(0.07, 0.03, 0.03, M.darkBrass, 0.16, y, 0));
  // Focusing knobs.
  tube.add(cylinder(0.02, 0.02, 0.14, M.brass, 0, -1.22, 0, 12));
  tube.children.at(-1).rotation.x = Math.PI / 2;

  // Lens socket beside the eyepiece, empty until the lens is seated.
  const socket = group(
    box(0.04, 0.12, 0.12, M.darkBrass, 0.15, -0.95, 0),
    mesh(new THREE.TorusGeometry(0.045, 0.01, 8, 24), M.brass, 0.175, -0.95, 0),
  );
  socket.children[1].rotation.y = Math.PI / 2;
  const lens = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 24), mat(0xcfe0ff, { metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.75 }), 0.178, -0.95, 0);
  lens.rotation.z = Math.PI / 2;
  lens.visible = false;
  tube.add(socket, lens);

  tube.position.y = 2.0;
  tube.rotation.z = THREE.MathUtils.degToRad(40);

  const telescope = group(pier, head, tube);
  return { telescope, tube, lens, hourPointer: hourDial.pointerPivot, heightPointer: heightDial.pointerPivot };
}

// Iron-studded oak door on a hinge pivot, in a stone surround, with the brass
// locking gears beside it and the star plaque above.
export function buildDoor() {
  const leaf = group(box(1.1, 2.2, 0.08, M.oak, 0.55, 1.1, 0));
  for (let i = 1; i < 5; i++) leaf.add(box(0.012, 2.2, 0.085, M.darkWood, i * 0.22, 1.1, 0));
  for (const y of [0.45, 1.75]) {
    leaf.add(box(0.9, 0.07, 0.095, M.blackIron, 0.45, y, 0));
    for (let i = 0; i < 5; i++) leaf.add(sphere(0.014, M.blackIron, 0.08 + i * 0.2, y, 0.05, 8));
  }
  const ring = mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 24), M.blackIron, 0.95, 1.0, 0.07);
  leaf.add(ring, cylinder(0.035, 0.035, 0.02, M.blackIron, 0.95, 1.07, 0.05, 12));
  leaf.children.at(-1).rotation.x = Math.PI / 2;
  const hinge = group(leaf);
  hinge.position.x = -0.55;

  const surround = group(
    box(0.3, 2.5, 0.5, M.stoneFront, -0.72, 1.25, -0.15),
    box(0.3, 2.5, 0.5, M.stoneFront, 0.72, 1.25, -0.15),
    box(1.74, 0.34, 0.5, M.stoneFront, 0, 2.37, -0.15),
    box(1.0, 0.06, 0.4, M.stoneFront, 0, 0.0, -0.1),
  );

  // Gear train in a brass-framed recess to the right of the door.
  const gearMat = M.darkBrass;
  const gear = (r, teeth, x, y) => {
    const g = group(cylinder(r, r, 0.03, gearMat, 0, 0, 0, 32), cylinder(r * 0.25, r * 0.25, 0.05, M.brass, 0, 0, 0, 12));
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      g.add(box(0.025, 0.03, r * 0.22, gearMat, Math.sin(a) * r, 0, Math.cos(a) * r).rotateY(a));
    }
    g.rotation.x = Math.PI / 2;
    g.position.set(x, y, 0.06);
    return g;
  };
  const gears = group(
    box(0.5, 0.9, 0.06, M.darkWood, 0, 0, 0),
    box(0.52, 0.03, 0.08, M.brass, 0, 0.45, 0.01),
    box(0.52, 0.03, 0.08, M.brass, 0, -0.45, 0.01),
    gear(0.13, 14, -0.05, 0.2),
    gear(0.08, 9, 0.12, 0.02),
    gear(0.11, 12, -0.02, -0.2),
    box(0.03, 0.03, 0.34, M.iron, -0.28, -0.2, 0.06),
  );
  gears.position.set(1.18, 1.25, 0.05);

  const door = group(surround, hinge, gears);

  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.08 : 0.19;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const [x, y] = [Math.cos(a) * r, Math.sin(a) * r];
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  const star = shadowed(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }), M.brass));
  const letter = new THREE.Mesh(
    new THREE.CircleGeometry(0.065, 32),
    new THREE.MeshStandardMaterial({ map: label('V', { w: 128, h: 128, bg: '#b89048', color: '#2a1a08', size: 0.8, font: 'Palatino, Georgia, serif' }), metalness: 0.7, roughness: 0.35 }),
  );
  letter.position.z = 0.041;
  const doorStar = group(star, letter);
  doorStar.position.set(0, 2.82, 0.02);

  return { door, hinge, doorStar };
}

// Packing crate the telescope arrived in, with the eyepiece case on top.
export function buildEyepieceCase() {
  const crate = group(box(0.5, 0.48, 0.5, M.oak, 0, 0.24, 0));
  for (const y of [0.06, 0.42]) {
    for (const s of [-1, 1]) {
      crate.add(box(0.52, 0.06, 0.03, M.wood, 0, y, s * 0.255), box(0.03, 0.06, 0.52, M.wood, s * 0.255, y, 0));
    }
  }
  const stencil = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshStandardMaterial({
    map: label('WITH CARE\nTHIS WAY UP', { w: 256, h: 128, color: 'rgba(30,20,10,0.8)', size: 0.3, font: 'Courier New, monospace', weight: 'bold' }),
    transparent: true,
    roughness: 1,
  }));
  stencil.position.set(0, 0.24, 0.252);
  crate.add(stencil);

  const lid = group(box(0.36, 0.035, 0.24, M.mahogany, 0, 0.0175, 0.12), box(0.06, 0.02, 0.015, M.brass, 0, 0, 0.245));
  lid.position.set(0, 0.56, -0.12);
  lid.userData.closedX = 0;
  lid.userData.openX = -1.9;
  const eyepieceCase = group(
    box(0.36, 0.08, 0.24, M.mahogany, 0, 0.52, 0),
    box(0.33, 0.004, 0.21, M.velvet, 0, 0.559, 0),
    lid,
  );
  for (let i = 0; i < 4; i++) {
    eyepieceCase.add(cylinder(0.018, 0.018, 0.04, M.brass, -0.11 + i * 0.07, 0.56, 0.02, 12));
  }
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    eyepieceCase.add(box(0.025, 0.085, 0.025, M.brass, x * 0.17, 0.52, z * 0.11));
  }
  return { crate, eyepieceCase, lid };
}
