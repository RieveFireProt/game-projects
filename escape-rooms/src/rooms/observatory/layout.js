import * as THREE from 'three';

// Room dimensions and wall placement. Angles run from +X (the door) towards +Z;
// the dome's observing slit faces -X (180°).

export const ROOM_RADIUS = 6;
export const WALL_HEIGHT = 4;
export const SLIT_HALF_WIDTH = 0.16; // radians
export const DOOR_GAP = 1.2 / ROOM_RADIUS; // radians of wall left open behind the door

// Puts an object `inset` metres in from the wall at `angleDeg`, turned so local +Z faces the centre.
export function atWall(object, angleDeg, inset, y = 0) {
  const a = THREE.MathUtils.degToRad(angleDeg);
  const r = ROOM_RADIUS - inset;
  object.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
  object.rotation.y = Math.atan2(-object.position.x, -object.position.z);
  return object;
}

// Circular collider around an object's floor position.
export const colliderAt = (object, r) => ({ x: object.position.x, z: object.position.z, r });
