import * as THREE from 'three';
import { mat } from '../../engine/build.js';
import { domeBoards, floorboards, persianRug, stoneWall, wainscot, woodGrain } from './textures.js';

// Shared materials for the observatory. Wood colours are tints over a neutral grain.

const grain = woodGrain(5).map;
const grainFine = woodGrain(9).map;
grainFine.repeat.set(2, 2);

// A second view of a texture's canvas with its own repeat.
function reuse(tex) {
  const copy = (t) => t && Object.assign(t.clone(), { needsUpdate: true });
  return { map: copy(tex.map), bump: copy(tex.bump) };
}

function surface(tex, repeat, opts) {
  tex.map.repeat.set(...repeat);
  if (tex.bump) tex.bump.repeat.set(...repeat);
  return new THREE.MeshStandardMaterial({ map: tex.map, bumpMap: tex.bump ?? null, ...opts });
}

const stone = stoneWall();

export const M = {
  floor: surface(floorboards(), [5, 5], { roughness: 0.72, bumpScale: 2 }),
  stone: surface(stone, [14, 3], { roughness: 0.95, bumpScale: 4, side: THREE.BackSide }),
  stoneFront: surface(reuse(stone), [1, 2.4], { roughness: 0.95, bumpScale: 4 }),
  wainscot: surface(wainscot(), [63, 1], { roughness: 0.6, bumpScale: 3, side: THREE.BackSide }),
  dome: surface(domeBoards(), [48, 3], { roughness: 0.9, side: THREE.BackSide }),
  rug: surface(persianRug(), [1, 1], { roughness: 1 }),

  wood: mat(0xa0683e, { map: grain, roughness: 0.6 }),
  darkWood: mat(0x5a3822, { map: grain, roughness: 0.55 }),
  mahogany: mat(0x5e2a1c, { map: grainFine, roughness: 0.4 }),
  oak: mat(0xb4885a, { map: grain, roughness: 0.65 }),
  paintedIron: mat(0x1f2a26, { metalness: 0.5, roughness: 0.55 }),

  brass: mat(0xc49a50, { metalness: 0.9, roughness: 0.28 }),
  darkBrass: mat(0x8a6a34, { metalness: 0.85, roughness: 0.4 }),
  iron: mat(0x2a2a2e, { metalness: 0.65, roughness: 0.45 }),
  blackIron: mat(0x151517, { metalness: 0.5, roughness: 0.6 }),
  steel: mat(0x9aa0a8, { metalness: 0.9, roughness: 0.25 }),

  paper: mat(0xeee2c6, { roughness: 1 }),
  leather: mat(0x5a2616, { roughness: 0.55 }),
  greenLeather: mat(0x2d4a30, { roughness: 0.6 }),
  velvet: mat(0x6a1428, { roughness: 1 }),
  wool: mat(0x2a2a33, { roughness: 1 }),
  cream: mat(0xefe4c8, { roughness: 0.6 }),
  china: mat(0xf2efe6, { roughness: 0.25 }),
  wax: mat(0xf3ead2, { roughness: 0.7 }),
  coal: mat(0x121212, { roughness: 0.9 }),
  plant: mat(0x3d6b2f, { roughness: 0.8, side: THREE.DoubleSide }),
  glass: new THREE.MeshStandardMaterial({
    color: 0xd8e4ec,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0.1,
    depthWrite: false,
  }),
};

// Stone with its own texture scale, for walls of other sizes (door surround, stairwell).
export function stoneView(repeatU, repeatV, side = THREE.FrontSide) {
  return surface(reuse(stone), [repeatU, repeatV], { roughness: 0.95, bumpScale: 4, side });
}
