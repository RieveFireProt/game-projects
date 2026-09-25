import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Small helpers for building rooms out of primitives. Room-agnostic.

export const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts });

export function shadowed(mesh, cast = true) {
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

export function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = shadowed(new THREE.Mesh(geometry, material));
  m.position.set(x, y, z);
  return m;
}

export const box = (w, h, d, material, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z);

export const cylinder = (rTop, rBottom, h, material, x, y, z, segments = 32) =>
  mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material, x, y, z);

export const sphere = (r, material, x, y, z, segments = 24) =>
  mesh(new THREE.SphereGeometry(r, segments, Math.max(8, segments * 0.66)), material, x, y, z);

// A lathed (turned) solid from [radius, height] pairs: table legs, vases, finials.
export const lathe = (profile, material, x, y, z, segments = 32) =>
  mesh(new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segments), material, x, y, z);

export function group(...children) {
  const g = new THREE.Group();
  if (children.length) g.add(...children);
  return g;
}

// Positions and rotates in one call; returns the object for chaining.
export function place(object, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) {
  object.position.set(x, y, z);
  object.rotation.set(rx, ry, rz);
  return object;
}

// Four legs at the corners of a w×d rectangle.
export const legs = (w, d, h, thickness, material, inset = 0) =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) =>
    box(thickness, h, thickness, material, sx * (w / 2 - inset), h / 2, sz * (d / 2 - inset)));

// Seeded random so rooms look the same every load.
export function seededRandom(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// Removes an object from raycasting (decoration that should never block clicks).
export function unclickable(object) {
  object.traverse((o) => (o.raycast = () => {}));
  return object;
}

// Collapses static meshes into one mesh per material to cut draw calls. Nodes flagged
// with userData.keep (hotspots, moving parts) survive as nodes and are merged
// internally on their own, so they can still move and highlight independently.
export function mergeStatic(node) {
  node.updateMatrixWorld(true);
  const toLocal = node.matrixWorld.clone().invert();
  const buckets = new Map();
  const kept = [];

  const mergeable = (o) => o.isMesh && o.visible && !Array.isArray(o.material) && !o.material.isShaderMaterial
    && o.raycast === THREE.Mesh.prototype.raycast;

  (function visit(o) {
    for (const child of [...o.children]) {
      if (child.userData.keep) {
        kept.push(child);
        continue;
      }
      if (mergeable(child)) {
        const geometry = child.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(toLocal, child.matrixWorld));
        const key = [child.material.uuid, child.castShadow, child.receiveShadow, Boolean(geometry.index),
          Object.keys(geometry.attributes).sort().join()].join('|');
        if (!buckets.has(key)) buckets.set(key, { source: child, geometries: [], meshes: [] });
        buckets.get(key).geometries.push(geometry);
        buckets.get(key).meshes.push(child);
      }
      visit(child);
    }
  })(node);

  for (const { source, geometries, meshes } of buckets.values()) {
    const combined = geometries.length > 1 ? mergeGeometries(geometries) : null;
    geometries.forEach((g) => g.dispose());
    if (!combined) continue;
    const m = new THREE.Mesh(combined, source.material);
    m.castShadow = source.castShadow;
    m.receiveShadow = source.receiveShadow;
    node.add(m);
    for (const original of meshes) {
      // Anything hanging off the mesh (a flame, a light) moves to a bare stand-in.
      if (original.children.length) {
        const standIn = new THREE.Object3D();
        standIn.position.copy(original.position);
        standIn.quaternion.copy(original.quaternion);
        standIn.scale.copy(original.scale);
        standIn.add(...original.children);
        original.parent.add(standIn);
      }
      original.removeFromParent();
    }
  }
  kept.forEach(mergeStatic);
  return node;
}
