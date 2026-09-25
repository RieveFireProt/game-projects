import * as THREE from 'three';

// Grey-box geometry for the observatory. Everything is built from primitives;
// the atmosphere pass will swap in textures and proper models.
//
// Layout: circular room centred on the origin. Angles run from +X (the door)
// towards +Z. The dome's observing slit faces -X, and the telescope points at it.

export const ROOM_RADIUS = 6;
const WALL_HEIGHT = 4;
const SLIT_HALF_WIDTH = 0.16; // radians
const DRAWER_TRAVEL = 0.32;

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts });
const M = {
  floor: mat(0x3b2a1e, { roughness: 0.85 }),
  plaster: mat(0x6e6252, { roughness: 0.95 }),
  darkWood: mat(0x2e1f15, { roughness: 0.7 }),
  wood: mat(0x5a3b24, { roughness: 0.65 }),
  brass: mat(0xb08d4a, { metalness: 0.85, roughness: 0.35 }),
  iron: mat(0x2a2a2e, { metalness: 0.6, roughness: 0.5 }),
  dome: mat(0x262b36, { roughness: 0.9, side: THREE.BackSide }),
  paper: mat(0xe9dcc0, { roughness: 1 }),
  rug: mat(0x5a1f1f, { roughness: 1 }),
};

function shadowed(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const mesh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(rTop, rBottom, h, material, x = 0, y = 0, z = 0, segments = 32) {
  const mesh = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material));
  mesh.position.set(x, y, z);
  return mesh;
}

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// A spot `inset` metres in from the wall at `angleDeg`, turned so local +Z faces the centre.
function atWall(object, angleDeg, inset, y = 0) {
  const a = THREE.MathUtils.degToRad(angleDeg);
  const r = ROOM_RADIUS - inset;
  object.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
  object.rotation.y = Math.atan2(-object.position.x, -object.position.z);
  return object;
}

// Seeded random so the room looks the same every load.
function seededRandom(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function buildShell(scene) {
  const floor = new THREE.Mesh(new THREE.CircleGeometry(ROOM_RADIUS, 64), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.3, 48), M.rug);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.005;
  rug.receiveShadow = true;

  const wallMat = M.plaster.clone();
  wallMat.side = THREE.BackSide;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(ROOM_RADIUS, ROOM_RADIUS, WALL_HEIGHT, 64, 1, true), wallMat);
  wall.position.y = WALL_HEIGHT / 2;
  wall.receiveShadow = true;

  const panelMat = M.darkWood.clone();
  panelMat.side = THREE.BackSide;
  const wainscot = new THREE.Mesh(new THREE.CylinderGeometry(ROOM_RADIUS - 0.02, ROOM_RADIUS - 0.02, 1, 64, 1, true), panelMat);
  wainscot.position.y = 0.5;

  // Hemisphere with a meridian gap: the observing slit, facing -X.
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(ROOM_RADIUS, 64, 24, SLIT_HALF_WIDTH, Math.PI * 2 - SLIT_HALF_WIDTH * 2, 0, Math.PI / 2),
    M.dome,
  );
  dome.position.y = WALL_HEIGHT;

  const domeRing = shadowed(new THREE.Mesh(new THREE.TorusGeometry(ROOM_RADIUS - 0.06, 0.08, 8, 96), M.darkWood));
  domeRing.rotation.x = Math.PI / 2;
  domeRing.position.y = WALL_HEIGHT;

  scene.add(floor, rug, wall, wainscot, dome, domeRing);
}

function buildSky(scene) {
  const rand = seededRandom(7);
  const positions = [];
  for (let i = 0; i < 1800; i++) {
    const theta = rand() * Math.PI * 2;
    const y = rand() * 0.95 + 0.05;
    const r = Math.sqrt(1 - y * y);
    positions.push(Math.cos(theta) * r * 90, y * 90, Math.sin(theta) * r * 90);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, fog: false }));
  stars.raycast = () => {};

  const moon = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xf4f1e0, fog: false }));
  moon.position.set(-70, 42, 4);

  scene.add(stars, moon);
}

function buildLights(scene) {
  scene.add(new THREE.HemisphereLight(0x5a6a90, 0x2a1c10, 1.1));

  const moonlight = new THREE.DirectionalLight(0x9fb4ff, 1.0);
  moonlight.position.set(-10, 8, 0);
  scene.add(moonlight);

  const lights = [];
  const warm = (color, intensity, x, y, z, castShadow = false) => {
    const light = new THREE.PointLight(color, intensity, 0, 2);
    light.position.set(x, y, z);
    if (castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.002;
    }
    scene.add(light);
    lights.push(light);
    return light;
  };
  return { warm, lights };
}

function buildDesk() {
  const desk = group(
    box(1.6, 0.06, 0.8, M.wood, 0, 0.76, 0),
    ...[[-0.74, -0.34], [0.74, -0.34], [-0.74, 0.34], [0.74, 0.34]].map(([x, z]) => box(0.06, 0.73, 0.06, M.darkWood, x, 0.365, z)),
    box(1.5, 0.5, 0.04, M.darkWood, 0, 0.5, -0.36), // modesty panel
  );

  const drawer = group(
    box(0.6, 0.14, 0.7, M.wood, 0, 0.65, 0),
    box(0.64, 0.17, 0.03, M.darkWood, 0, 0.65, 0.36),
    box(0.08, 0.06, 0.03, M.brass, 0, 0.65, 0.385),
  );
  drawer.userData.closedZ = 0;
  drawer.userData.openZ = DRAWER_TRAVEL;

  const letter = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), M.paper);
  letter.rotation.set(-Math.PI / 2, 0, 0.2);
  letter.position.set(-0.4, 0.792, 0.12);
  letter.receiveShadow = true;

  const lamp = group(
    cylinder(0.08, 0.1, 0.03, M.brass, 0, 0.805, 0),
    cylinder(0.012, 0.012, 0.35, M.brass, 0, 0.98, 0),
    cylinder(0.07, 0.16, 0.14, mat(0x3d5a3a, { emissive: 0x1a2a10 }), 0, 1.16, 0),
  );
  lamp.position.set(0.55, 0, -0.18);
  lamp.traverse((o) => (o.castShadow = false));

  const chair = group(
    box(0.45, 0.05, 0.45, M.wood, 0, 0.46, 0),
    box(0.45, 0.5, 0.04, M.wood, 0, 0.73, 0.22),
    ...[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z]) => box(0.04, 0.46, 0.04, M.darkWood, x, 0.23, z)),
  );
  chair.position.set(-0.62, 0, 0.78);
  chair.rotation.y = 0.6;

  desk.add(drawer, letter, lamp, chair);
  return { desk, drawer, letter, lamp };
}

function buildClock() {
  const face = cylinder(0.24, 0.24, 0.03, mat(0xefe4c8), 0, 0.22, 0.08, 48);
  face.rotation.x = Math.PI / 2;
  const bezel = shadowed(new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.02, 8, 48), M.brass));
  bezel.position.set(0, 0.22, 0.095);

  // Hands frozen at 11:47. Clockwise as seen from the front = negative Z rotation.
  const hand = (length, width, degrees) => {
    const geometry = new THREE.BoxGeometry(width, length, 0.008);
    geometry.translate(0, length / 2 - 0.02, 0);
    const mesh = new THREE.Mesh(geometry, M.iron);
    mesh.position.set(0, 0.22, 0.1);
    mesh.rotation.z = -THREE.MathUtils.degToRad(degrees);
    return mesh;
  };

  return group(
    box(0.6, 1.1, 0.14, M.darkWood, 0, 0, 0),
    face,
    bezel,
    hand(0.14, 0.018, (11 + 47 / 60) * 30),
    hand(0.2, 0.012, 47 * 6),
    cylinder(0.01, 0.01, 0.3, M.brass, 0, -0.2, 0.075),
    cylinder(0.06, 0.06, 0.015, M.brass, 0, -0.36, 0.08),
  );
}

function buildBookshelf() {
  const rand = seededRandom(42);
  const colors = [0x5b2320, 0x23395b, 0x2f4a2a, 0x6b5a2a, 0x3b2a4a, 0x7a4a22];
  const shelf = group(
    box(1.4, 2.2, 0.04, M.darkWood, 0, 1.1, -0.18),
    box(0.04, 2.2, 0.4, M.darkWood, -0.68, 1.1, 0),
    box(0.04, 2.2, 0.4, M.darkWood, 0.68, 1.1, 0),
  );
  for (let row = 0; row < 5; row++) {
    const y = 0.05 + row * 0.44;
    shelf.add(box(1.32, 0.03, 0.38, M.darkWood, 0, y, 0));
    for (let x = -0.62; x < 0.6;) {
      const w = 0.035 + rand() * 0.04;
      const h = 0.26 + rand() * 0.1;
      const color = colors[Math.floor(rand() * colors.length)];
      shelf.add(box(w, h, 0.26, mat(color), x + w / 2, y + 0.015 + h / 2, 0.02));
      x += w + 0.004;
    }
  }
  return shelf;
}

function starChartTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 720;
  const g = canvas.getContext('2d');
  const rand = seededRandom(3);

  g.fillStyle = '#16213a';
  g.fillRect(0, 0, canvas.width, canvas.height);
  g.strokeStyle = 'rgba(210,190,130,0.35)';
  g.lineWidth = 2;
  for (let y = 60; y < canvas.height; y += 100) g.strokeRect(0, y, canvas.width, 0);
  for (let x = 64; x < canvas.width; x += 128) g.strokeRect(x, 0, 0, canvas.height);

  g.fillStyle = '#f3ecd6';
  for (let i = 0; i < 420; i++) {
    g.beginPath();
    g.arc(rand() * canvas.width, rand() * canvas.height, rand() * 2 + 0.5, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = 'rgba(243,236,214,0.6)';
  for (let c = 0; c < 6; c++) {
    let x = rand() * 900 + 60;
    let y = rand() * 600 + 60;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (rand() - 0.5) * 140;
      y += (rand() - 0.5) * 140;
      g.lineTo(x, y);
      g.fillRect(x - 3, y - 3, 6, 6);
    }
    g.stroke();
  }
  g.strokeStyle = '#b08d4a';
  g.lineWidth = 14;
  g.strokeRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildStarChart() {
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.98), new THREE.MeshStandardMaterial({ map: starChartTexture(), roughness: 0.9 }));
  chart.position.z = 0.03;
  return group(box(1.5, 1.08, 0.04, M.darkWood), chart);
}

function buildOrrery() {
  const table = group(
    cylinder(0.5, 0.5, 0.04, M.wood, 0, 0.75, 0, 48),
    cylinder(0.05, 0.08, 0.73, M.darkWood, 0, 0.365, 0),
    cylinder(0.3, 0.3, 0.03, M.darkWood, 0, 0.015, 0),
  );

  const orrery = group(
    cylinder(0.14, 0.18, 0.1, M.brass, 0, 0.82, 0),
    cylinder(0.012, 0.012, 0.3, M.brass, 0, 1.0, 0),
  );
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), mat(0xe8b44a, { emissive: 0x7a4a0a, metalness: 0.3 }));
  sun.position.y = 1.15;
  orrery.add(sun);

  const planetColors = [0x9a9a9a, 0xd8c08a, 0x4a7ab0, 0xb0502a];
  const planets = [];
  [0.12, 0.19, 0.26, 0.33].forEach((radius, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.004, 6, 64), M.brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.1 - i * 0.02;
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.018 + i * 0.004, 16, 12), mat(planetColors[i], { roughness: 0.5 }));
    const pivot = group(planet);
    planet.position.x = radius;
    pivot.position.y = ring.position.y;
    pivot.rotation.y = i * 1.3;
    orrery.add(ring, pivot);
    planets.push(pivot);
  });

  const candle = group(
    cylinder(0.05, 0.06, 0.02, M.brass, 0, 0.78, 0),
    cylinder(0.018, 0.018, 0.14, M.paper, 0, 0.86, 0),
  );
  candle.position.set(0.3, 0, 0.2);

  table.add(candle);
  return { table, orrery, planets };
}

function buildTelegramTable() {
  const table = group(
    box(0.6, 0.04, 0.6, M.wood, 0, 0.74, 0),
    ...[[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].map(([x, z]) => box(0.04, 0.72, 0.04, M.darkWood, x, 0.36, z)),
    box(0.18, 0.06, 0.12, M.darkWood, 0.14, 0.79, -0.14),
    box(0.1, 0.012, 0.02, M.brass, 0.14, 0.825, -0.12),
  );
  const telegram = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), mat(0xe2d3a8));
  telegram.rotation.set(-Math.PI / 2, 0, -0.15);
  telegram.position.set(-0.08, 0.762, 0.08);
  return { table, telegram };
}

function buildTelescope() {
  const pier = group(
    cylinder(0.45, 0.55, 0.12, M.iron, 0, 0.06, 0),
    cylinder(0.22, 0.3, 1.2, M.iron, 0, 0.66, 0),
    box(0.5, 0.3, 0.5, M.iron, 0, 1.4, 0),
  );

  // Dials face +X, towards the room's entrance side.
  const dial = (z) => {
    const d = cylinder(0.11, 0.11, 0.03, M.brass, 0.26, 1.4, z);
    d.rotation.z = Math.PI / 2;
    return d;
  };
  pier.add(dial(-0.13), dial(0.13));

  // Tube tilted 40° off vertical towards the slit (-X).
  const tube = group(
    cylinder(0.2, 0.26, 3.2, M.brass, 0, 0.6, 0),
    cylinder(0.27, 0.27, 0.12, M.darkWood, 0, 2.1, 0),
    cylinder(0.05, 0.05, 0.2, M.iron, 0, -1.08, 0),
  );
  tube.position.y = 1.7;
  tube.rotation.z = THREE.MathUtils.degToRad(40);

  return group(pier, tube);
}

function buildDoor() {
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.07 : 0.17;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const [x, y] = [Math.cos(a) * r, Math.sin(a) * r];
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  const star = shadowed(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: false }), M.brass));
  star.position.set(0, 2.62, 0.02);
  const doorStar = group(star);

  const door = group(
    box(1.1, 2.2, 0.1, M.darkWood, 0, 1.1, 0),
    box(1.3, 0.12, 0.14, M.wood, 0, 2.26, 0),
    box(0.1, 2.3, 0.14, M.wood, -0.6, 1.15, 0),
    box(0.1, 2.3, 0.14, M.wood, 0.6, 1.15, 0),
    cylinder(0.035, 0.035, 0.06, M.brass, 0.4, 1.05, 0.08),
  );
  return { door, doorStar };
}

function buildEyepieceCase() {
  const crate = box(0.5, 0.5, 0.5, M.wood, 0, 0.25, 0);
  const eyepieceCase = group(
    box(0.36, 0.1, 0.24, M.darkWood, 0, 0.55, 0),
    box(0.06, 0.03, 0.02, M.brass, 0, 0.56, 0.125),
  );
  return { crate, eyepieceCase };
}

export function buildGeometry(scene) {
  scene.background = new THREE.Color(0x05070d);
  scene.fog = new THREE.FogExp2(0x0b0d14, 0.03);

  buildShell(scene);
  buildSky(scene);
  const { warm } = buildLights(scene);

  const { desk, drawer, letter, lamp } = buildDesk();
  atWall(desk, 60, 0.7);
  const clock = atWall(buildClock(), 60, 0.08, 2.1);

  const bookshelf = atWall(buildBookshelf(), 115, 0.24);
  const starChart = atWall(buildStarChart(), 160, 0.04, 1.9);

  const { table: orreryTable, orrery, planets } = buildOrrery();
  atWall(orreryTable, 215, 1.7);
  orreryTable.add(orrery);

  const { table: telegramTable, telegram } = buildTelegramTable();
  atWall(telegramTable, 290, 1.0);
  telegramTable.add(telegram);

  const telescope = buildTelescope();

  const { door, doorStar } = buildDoor();
  atWall(door, 0, 0.06);
  atWall(doorStar, 0, 0.06);

  const { crate, eyepieceCase } = buildEyepieceCase();
  const crateGroup = group(crate, eyepieceCase);
  crateGroup.position.set(0.9, 0, -1.0);
  crateGroup.rotation.y = 0.4;

  scene.add(desk, clock, bookshelf, starChart, orreryTable, telegramTable, telescope, door, doorStar, crateGroup);

  // Light sources, placed after their furniture so world positions are known.
  scene.updateMatrixWorld(true);
  const lampPos = lamp.localToWorld(new THREE.Vector3(0, 1.1, 0));
  warm(0xffb060, 9, lampPos.x, lampPos.y, lampPos.z, true);
  const candlePos = orreryTable.localToWorld(new THREE.Vector3(0.3, 0.98, 0.2));
  warm(0xff9a4a, 3, candlePos.x, candlePos.y, candlePos.z);
  // Wall sconces so the far side of the room stays readable.
  for (const angle of [0, 140, 250]) {
    const a = THREE.MathUtils.degToRad(angle);
    warm(0xff9a4a, 3, Math.cos(a) * (ROOM_RADIUS - 0.4), 2.4, Math.sin(a) * (ROOM_RADIUS - 0.4));
  }

  const colliderAt = (object, r) => ({ x: object.position.x, z: object.position.z, r });
  const colliders = [
    { x: 0, z: 0, r: 0.75 },
    colliderAt(desk, 0.75),
    colliderAt(bookshelf, 0.7),
    colliderAt(orreryTable, 0.6),
    colliderAt(telegramTable, 0.45),
    colliderAt(crateGroup, 0.35),
  ];

  return {
    colliders,
    spawn: { x: 4.2, z: 1.3, yaw: THREE.MathUtils.degToRad(75) },
    objects: { desk, drawer, letter, clock, bookshelf, starChart, orrery, planets, telegram, telescope, door, doorStar, eyepieceCase },
  };
}
