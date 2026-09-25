import * as THREE from 'three';

const EYE_HEIGHT = 1.6;
const BODY_RADIUS = 0.3;
const WALK_SPEED = 2.2; // m/s
const LOOK_SPEED = 0.0022; // radians per pixel
const MAX_PITCH = 1.45;

const KEYS = {
  forward: ['KeyW', 'ArrowUp'],
  back: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
};

// First-person walker confined to a circular room with circular obstacles.
export function createPlayer({ camera, domElement, roomRadius, colliders, spawn }) {
  const position = new THREE.Vector3(spawn.x, 0, spawn.z);
  const velocity = new THREE.Vector3();
  const wish = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const keys = new Set();
  const lockListeners = [];
  let yaw = spawn.yaw ?? 0;
  let pitch = 0;

  const isLocked = () => document.pointerLockElement === domElement;
  const held = (action) => KEYS[action].some((k) => keys.has(k));

  document.addEventListener('pointerlockchange', () => {
    const locked = isLocked();
    if (!locked) keys.clear();
    lockListeners.forEach((fn) => fn(locked));
  });
  document.addEventListener('mousemove', (e) => {
    if (!isLocked()) return;
    yaw -= e.movementX * LOOK_SPEED;
    pitch = THREE.MathUtils.clamp(pitch - e.movementY * LOOK_SPEED, -MAX_PITCH, MAX_PITCH);
  });
  window.addEventListener('keydown', (e) => isLocked() && keys.add(e.code));
  window.addEventListener('keyup', (e) => keys.delete(e.code));

  function resolveCollisions() {
    const maxR = roomRadius - BODY_RADIUS;
    const d = Math.hypot(position.x, position.z);
    if (d > maxR) {
      position.x *= maxR / d;
      position.z *= maxR / d;
    }
    for (const c of colliders) {
      const dx = position.x - c.x;
      const dz = position.z - c.z;
      const dist = Math.hypot(dx, dz);
      const min = c.r + BODY_RADIUS;
      if (dist < min && dist > 1e-6) {
        position.x = c.x + (dx / dist) * min;
        position.z = c.z + (dz / dist) * min;
      }
    }
  }

  function update(dt) {
    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    wish.set(0, 0, 0);
    if (held('forward')) wish.add(forward);
    if (held('back')) wish.sub(forward);
    if (held('right')) wish.add(right);
    if (held('left')) wish.sub(right);
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(WALK_SPEED);

    velocity.lerp(wish, 1 - Math.exp(-12 * dt));
    position.addScaledVector(velocity, dt);
    resolveCollisions();

    camera.position.set(position.x, EYE_HEIGHT, position.z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  function lock() {
    try {
      domElement.requestPointerLock()?.catch?.(() => {});
    } catch {
      // Browser refused (e.g. too soon after Esc); caller falls back to the pause screen.
    }
  }

  function unlock() {
    if (isLocked()) document.exitPointerLock();
  }

  function teleport(x, z, newYaw, newPitch = 0) {
    position.set(x, 0, z);
    velocity.set(0, 0, 0);
    yaw = newYaw;
    pitch = newPitch;
    update(0);
  }

  return { update, lock, unlock, isLocked, teleport, onLockChange: (fn) => lockListeners.push(fn) };
}
