import * as THREE from 'three';
import { box, cylinder, group, lathe, mat, unclickable } from '../../engine/build.js';
import { glow } from './textures.js';

// Light sources that live in the room: flickering flames and the moonbeam through the
// dome slit. Everything here is decoration only.

const GLOW = glow();

// A flame: small emissive teardrop plus an additive glow sprite. Returns the group;
// pass it to lights.flame() to give it a real light and flicker.
export function flameMesh(scale = 1, color = 0xffc070) {
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.012 * scale, 10, 8),
    new THREE.MeshBasicMaterial({ color, toneMapped: false }),
  );
  core.scale.set(1, 2.2, 1);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: GLOW,
    color,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.55,
  }));
  halo.scale.setScalar(0.16 * scale);
  const flame = group(core, halo);
  flame.userData.halo = halo;
  unclickable(flame);
  return flame;
}

// Wall sconce: brass back plate, arm, oil font and a glass chimney with a flame.
// Built facing local +Z (towards the room once placed with atWall).
export function sconceMesh() {
  const brass = mat(0xb08d4a, { metalness: 0.9, roughness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xfff1d8,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    depthWrite: false,
  });
  const plate = cylinder(0.09, 0.09, 0.02, brass, 0, 0, 0.01, 24);
  plate.rotation.x = Math.PI / 2;
  const arm = box(0.025, 0.025, 0.22, brass, 0, -0.06, 0.12);
  const elbow = cylinder(0.018, 0.018, 0.1, brass, 0, -0.02, 0.23);
  const cup = lathe([[0, 0], [0.05, 0.005], [0.065, 0.04], [0.04, 0.07], [0.02, 0.08]], brass, 0, 0.02, 0.23, 20);
  const chimney = lathe([[0.025, 0], [0.045, 0.06], [0.035, 0.13], [0.028, 0.2]], glass, 0, 0.1, 0.23, 20);
  chimney.castShadow = false;
  const flame = flameMesh(1.1);
  flame.position.set(0, 0.14, 0.23);
  const s = group(plate, arm, elbow, cup, chimney, flame);
  s.userData.flame = flame;
  return s;
}

// Registers flames so they flicker, and optionally attaches a point light to each.
export function createLights(scene) {
  const flickers = [];

  function flame(flameGroup, { intensity = 0, color = 0xff9a4a, distance = 0, shadow = false, jitter = 1 } = {}) {
    let light = null;
    if (intensity > 0) {
      light = new THREE.PointLight(color, intensity, distance, 2);
      if (shadow) {
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        light.shadow.bias = -0.003;
        light.shadow.radius = 3;
      }
      scene.updateMatrixWorld(true);
      flameGroup.getWorldPosition(light.position);
      light.position.y += 0.05;
      scene.add(light);
    }
    const record = {
      light,
      base: intensity,
      halo: flameGroup.userData.halo,
      haloBase: flameGroup.userData.halo?.scale.x ?? 0,
      seed: flickers.length * 17.3,
      jitter,
    };
    flickers.push(record);
    // Changing record.base dims or raises the light without changing the light count.
    if (light) light.userData.flicker = record;
    return light;
  }

  function update(t) {
    for (const f of flickers) {
      const n = 1
        + 0.05 * f.jitter * Math.sin(t * 7.1 + f.seed)
        + 0.035 * f.jitter * Math.sin(t * 12.7 + f.seed * 1.7)
        + 0.03 * f.jitter * Math.sin(t * 23.3 + f.seed * 0.3);
      if (f.light) f.light.intensity = f.base * n;
      if (f.halo) f.halo.scale.setScalar(f.haloBase * (0.94 + (n - 1) * 1.5));
    }
  }

  return { flame, update };
}

// Moonlight through the dome slit: a shadow-casting directional light, and a soft visible
// beam.
export function createMoonbeam(scene, { moonPosition, roomRadius, wallHeight, slitHalfWidth }) {
  const dir = moonPosition.clone().normalize().negate(); // travel direction of the light

  const moon = new THREE.DirectionalLight(0x9cb2ff, 4.5);
  moon.position.copy(moonPosition).setLength(30);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 10, far: 60 });
  moon.shadow.bias = -0.0008;
  moon.shadow.normalBias = 0.02;
  moon.shadow.radius = 2;
  scene.add(moon, moon.target);

  // Where a ray entering the slit at point p leaves the room: floor, wall or dome.
  const domeCentre = new THREE.Vector3(0, wallHeight, 0);
  function exitT(p) {
    const hits = [];
    if (dir.y < 0) hits.push(-p.y / dir.y);
    const a = dir.x ** 2 + dir.z ** 2;
    const b = 2 * (p.x * dir.x + p.z * dir.z);
    const c = p.x ** 2 + p.z ** 2 - roomRadius ** 2;
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const t = (-b + Math.sqrt(disc)) / (2 * a);
      const y = p.y + dir.y * t;
      if (y >= 0 && y <= wallHeight) hits.push(t);
    }
    const ts = -2 * p.clone().sub(domeCentre).dot(dir);
    if (p.y + dir.y * ts >= wallHeight) hits.push(ts);
    return Math.min(...hits.filter((t) => t > 1e-3));
  }

  const slitPoint = (elev, side) => {
    const phi = side * slitHalfWidth;
    return new THREE.Vector3(
      -roomRadius * Math.cos(elev) * Math.cos(phi),
      wallHeight + roomRadius * Math.sin(elev),
      roomRadius * Math.cos(elev) * Math.sin(phi),
    );
  };

  // Beam volume: side sheets along both slit edges plus end caps, fading with distance.
  const STEPS = 14;
  const MAX_ELEV = THREE.MathUtils.degToRad(70);
  const rows = [];
  for (let i = 0; i <= STEPS; i++) {
    const elev = (i / STEPS) * MAX_ELEV;
    rows.push([-1, 1].map((side) => {
      const p = slitPoint(elev, side);
      return { p, q: p.clone().addScaledVector(dir, exitT(p)) };
    }));
  }
  const positions = [];
  const fades = [];
  const quad = (a, b, c, d, fa, fb, fc, fd) => {
    for (const [v, f] of [[a, fa], [b, fb], [c, fc], [a, fa], [c, fc], [d, fd]]) {
      positions.push(v.x, v.y, v.z);
      fades.push(f);
    }
  };
  for (let i = 0; i < STEPS; i++) {
    for (const s of [0, 1]) {
      const [e0, e1] = [rows[i][s], rows[i + 1][s]];
      quad(e0.p, e1.p, e1.q, e0.q, 1, 1, 0, 0);
    }
  }
  for (const i of [0, STEPS]) {
    const [l, r] = rows[i];
    quad(l.p, r.p, r.q, l.q, 1, 1, 0, 0);
  }
  const beamGeometry = new THREE.BufferGeometry();
  beamGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  beamGeometry.setAttribute('fade', new THREE.Float32BufferAttribute(fades, 1));
  beamGeometry.computeVertexNormals();

  const beam = new THREE.Mesh(beamGeometry, new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(0x8fa6ff) }, strength: { value: 0.14 } },
    vertexShader: /* glsl */ `
      attribute float fade;
      varying float vFade;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vFade = fade;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      uniform float strength;
      varying float vFade;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.4);
        float a = strength * facing * smoothstep(0.0, 0.7, vFade) * (0.35 + 0.65 * vFade);
        gl_FragColor = vec4(color * a, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }));
  beam.renderOrder = 2;
  beam.frustumCulled = false;

  unclickable(beam);
  scene.add(beam);

  return { light: moon };
}

// Glowing coals behind a stove door grille.
export function emberMaterial() {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.55, 0.15), toneMapped: false });
}

