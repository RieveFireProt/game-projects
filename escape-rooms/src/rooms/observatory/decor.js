import * as THREE from 'three';
import { box, cylinder, group, lathe, legs, mat, mesh, place, seededRandom, sphere } from '../../engine/build.js';
import { M } from './materials.js';
import { emberMaterial, flameMesh } from './lighting.js';
import { label, paint } from './textures.js';

// Furniture and bric-a-brac that exists for atmosphere only. Builders face local +Z.
// Nothing here may look like a clue: no other clocks, lenses, letters or numbers.

export function coatStand() {
  const stand = group(
    lathe([[0.03, 0], [0.03, 1.6], [0.045, 1.65], [0.035, 1.75], [0, 1.8]], M.darkWood, 0, 0, 0, 12),
  );
  for (let i = 0; i < 3; i++) {
    const foot = box(0.04, 0.04, 0.32, M.darkWood, 0, 0.02, 0.14);
    const pivot = group(foot);
    pivot.rotation.y = (i / 3) * Math.PI * 2 + 0.5;
    stand.add(pivot);
  }
  for (let i = 0; i < 4; i++) {
    const hook = mesh(new THREE.TorusGeometry(0.06, 0.01, 6, 12, Math.PI), M.brass, 0, 1.62, 0);
    hook.rotation.set(0, (i / 4) * Math.PI * 2, Math.PI / 2);
    hook.translateX(-0.06);
    stand.add(hook);
  }
  // A long wool cloak and a scarf.
  const cloak = mesh(new THREE.CylinderGeometry(0.06, 0.24, 0.95, 20, 1, true, 0, Math.PI * 1.5), mat(0x4a3526, { roughness: 1, side: THREE.DoubleSide }), 0.02, 1.12, 0.1);
  cloak.rotation.y = -Math.PI * 0.3;
  const scarf = mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 20), mat(0x7a2a24, { roughness: 1 }), 0, 1.56, 0.08);
  scarf.rotation.x = Math.PI / 2.4;
  const tail = box(0.1, 0.5, 0.02, mat(0x7a2a24, { roughness: 1 }), 0.06, 1.3, 0.17);
  const hat = group(
    cylinder(0.14, 0.14, 0.01, M.wool, 0, 0, 0, 24),
    sphere(0.09, M.wool, 0, 0.02, 0, 16),
  );
  hat.children[1].scale.y = 0.8;
  place(hat, -0.06, 1.8, -0.02, 0, 0.2, 0.3);
  const umbrella = group(
    cylinder(0.012, 0.012, 0.8, M.blackIron, 0, 0.4, 0, 6),
    mesh(new THREE.ConeGeometry(0.06, 0.6, 8, 1, true), mat(0x151515, { roughness: 0.8, side: THREE.DoubleSide }), 0, 0.45, 0),
    mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), M.darkWood, 0.03, 0.8, 0),
  );
  place(umbrella, -0.25, 0, 0.05, 0, 0, 0.12);
  stand.add(cloak, scarf, tail, hat, umbrella);
  return stand;
}

export function mapChest() {
  const chest = group(
    box(1.2, 0.84, 0.6, M.mahogany, 0, 0.44, 0),
    box(1.26, 0.04, 0.66, M.darkWood, 0, 0.88, 0),
    box(1.22, 0.04, 0.62, M.darkWood, 0, 0.02, 0),
  );
  for (let i = 0; i < 6; i++) {
    const y = 0.12 + i * 0.125;
    chest.add(box(1.1, 0.1, 0.02, M.darkWood, 0, y, 0.3));
    for (const x of [-0.3, 0.3]) chest.add(box(0.1, 0.018, 0.02, M.brass, x, y, 0.315));
  }
  // Rolled charts and a small stack on top.
  const rand = seededRandom(13);
  for (let i = 0; i < 4; i++) {
    const roll = cylinder(0.035, 0.035, 0.7 + rand() * 0.2, M.paper, -0.25 + i * 0.07, 0.94, -0.05 + rand() * 0.1, 12);
    roll.rotation.set(0, 0.2 * (rand() - 0.5), Math.PI / 2);
    roll.position.y = 0.935 + (i % 2) * 0.05;
    chest.add(roll);
  }
  chest.add(box(0.3, 0.06, 0.24, mat(0x3a2a1a), 0.38, 0.93, 0.05));

  // Three-branch candelabrum. Flames are returned so they can flicker.
  const candelabrum = group(
    lathe([[0, 0], [0.07, 0], [0.07, 0.015], [0.02, 0.03], [0.015, 0.2], [0.025, 0.22], [0, 0.23]], M.brass, 0, 0, 0, 16),
    box(0.26, 0.012, 0.012, M.brass, 0, 0.2, 0),
  );
  const flames = [];
  for (const x of [-0.13, 0, 0.13]) {
    const top = x === 0 ? 0.3 : 0.26;
    candelabrum.add(
      cylinder(0.018, 0.012, 0.02, M.brass, x, top - 0.05, 0, 10),
      cylinder(0.011, 0.011, 0.07, M.wax, x, top, 0, 8),
      x === 0 ? box(0.012, 0.08, 0.012, M.brass, 0, 0.24, 0) : box(0.012, 0.05, 0.012, M.brass, x, 0.22, 0),
    );
    const flame = flameMesh(0.8);
    flame.position.set(x, top + 0.05, 0);
    candelabrum.add(flame);
    flames.push(flame);
  }
  candelabrum.position.set(-0.4, 0.9, 0.05);
  chest.add(candelabrum);
  chest.userData.flames = flames;
  return chest;
}

// Dome shutter winch mounted on the wall under the slit, with its chain.
export function winch() {
  const w = group(
    box(0.4, 0.5, 0.04, M.paintedIron, 0, 1.1, 0.02),
    cylinder(0.16, 0.16, 0.04, M.darkBrass, 0, 1.15, 0.08, 28),
    cylinder(0.05, 0.05, 0.08, M.iron, 0, 1.15, 0.12, 12),
    box(0.03, 0.22, 0.03, M.iron, 0.09, 1.08, 0.17),
    cylinder(0.02, 0.02, 0.12, M.darkWood, 0.09, 0.98, 0.22, 8),
    cylinder(0.01, 0.01, 2.8, M.blackIron, -0.12, 2.6, 0.04, 6),
  );
  w.children[1].rotation.x = Math.PI / 2;
  w.children[2].rotation.x = Math.PI / 2;
  w.children[4].rotation.x = Math.PI / 2;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const tooth = box(0.03, 0.03, 0.04, M.darkBrass, Math.cos(a) * 0.17, 1.15 + Math.sin(a) * 0.17, 0.08);
    tooth.rotation.z = a;
    w.add(tooth);
  }
  return w;
}

export function ladder(height = 3.9, footInset = 0.85) {
  const length = Math.hypot(height, footInset);
  const lean = Math.atan2(footInset, height);
  const rails = group();
  for (const x of [-0.22, 0.22]) rails.add(box(0.05, length, 0.07, M.oak, x, length / 2, 0));
  for (let y = 0.3; y < length - 0.1; y += 0.3) {
    const rung = cylinder(0.018, 0.018, 0.44, M.oak, 0, y, 0, 8);
    rung.rotation.z = Math.PI / 2;
    rails.add(rung);
  }
  rails.rotation.x = -lean;
  rails.position.z = footInset;
  return group(rails);
}

// Pot-bellied stove with a glowing grate, flue pipe up the wall and a coal scuttle.
export function stove() {
  const body = lathe([[0, 0], [0.22, 0], [0.24, 0.05], [0.3, 0.25], [0.31, 0.4], [0.26, 0.6], [0.2, 0.7], [0.21, 0.74], [0.12, 0.8], [0.1, 0.84], [0, 0.84]], M.blackIron, 0, 0.14, 0, 32);
  const s = group(body);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    s.add(cylinder(0.025, 0.035, 0.16, M.blackIron, Math.sin(a) * 0.17, 0.08, Math.cos(a) * 0.17, 8));
  }
  // Grate: glowing coals behind iron bars.
  const embers = box(0.2, 0.1, 0.02, emberMaterial(), 0, 0.43, 0.285);
  s.add(embers);
  for (let i = 0; i < 5; i++) s.add(box(0.012, 0.12, 0.02, M.blackIron, -0.08 + i * 0.04, 0.43, 0.3));
  s.add(box(0.26, 0.02, 0.04, M.blackIron, 0, 0.5, 0.29), box(0.26, 0.02, 0.04, M.blackIron, 0, 0.36, 0.29));
  s.add(mesh(new THREE.TorusGeometry(0.31, 0.012, 6, 40), M.brass, 0, 0.54, 0).rotateX(Math.PI / 2));
  // Flue: up, then back into the wall.
  s.add(cylinder(0.07, 0.07, 2.4, M.blackIron, 0, 2.18, 0, 16));
  const elbow = cylinder(0.07, 0.07, 0.5, M.blackIron, 0, 3.38, -0.25, 16);
  elbow.rotation.x = Math.PI / 2;
  s.add(elbow);
  const scuttle = group(
    cylinder(0.12, 0.1, 0.26, M.blackIron, 0, 0.13, 0, 16),
    cylinder(0.11, 0.11, 0.02, M.coal, 0, 0.25, 0, 16),
    mesh(new THREE.TorusGeometry(0.1, 0.008, 6, 16, Math.PI), M.brass, 0, 0.26, 0),
  );
  place(scuttle, 0.5, 0, 0.1);
  const ember = new THREE.Object3D();
  ember.position.set(0, 0.45, 0.4);
  s.add(scuttle, ember);
  s.userData.ember = ember;
  return s;
}

// Deep wingback armchair in worn leather.
export function armchair() {
  const leather = M.leather;
  const c = group(
    box(0.7, 0.14, 0.62, leather, 0, 0.36, 0.02),
    box(0.62, 0.08, 0.56, mat(0x6a2e1a, { roughness: 0.5 }), 0, 0.47, 0.05),
    box(0.7, 0.72, 0.14, leather, 0, 0.75, -0.26),
    box(0.12, 0.26, 0.6, leather, -0.35, 0.53, 0.02),
    box(0.12, 0.26, 0.6, leather, 0.35, 0.53, 0.02),
    cylinder(0.07, 0.07, 0.62, leather, -0.35, 0.66, 0.02, 14),
    cylinder(0.07, 0.07, 0.62, leather, 0.35, 0.66, 0.02, 14),
    box(0.1, 0.4, 0.3, leather, -0.36, 0.95, -0.14),
    box(0.1, 0.4, 0.3, leather, 0.36, 0.95, -0.14),
    ...legs(0.62, 0.52, 0.3, 0.05, M.darkWood, 0.02),
  );
  c.children[5].rotation.x = Math.PI / 2;
  c.children[6].rotation.x = Math.PI / 2;
  c.children[2].rotation.x = -0.12;
  return c;
}

export function sideTable() {
  const t = group(
    cylinder(0.24, 0.24, 0.03, M.mahogany, 0, 0.6, 0, 28),
    lathe([[0.02, 0], [0.04, 0.1], [0.025, 0.3], [0.04, 0.5], [0.03, 0.59], [0, 0.59]], M.darkWood, 0, 0, 0, 16),
    cylinder(0.18, 0.2, 0.03, M.darkWood, 0, 0.015, 0, 24),
  );
  const cup = group(
    cylinder(0.07, 0.05, 0.012, M.china, 0, 0.621, 0, 24),
    lathe([[0, 0], [0.028, 0], [0.04, 0.05], [0.042, 0.06]], M.china, 0, 0.627, 0, 20),
    cylinder(0.037, 0.037, 0.002, mat(0x4a2a10, { roughness: 0.1 }), 0, 0.672, 0, 20),
    mesh(new THREE.TorusGeometry(0.015, 0.004, 6, 12), M.china, 0.045, 0.655, 0),
  );
  cup.position.set(-0.05, 0, 0.05);
  const pipe = group(
    cylinder(0.018, 0.015, 0.035, M.darkWood, 0, 0.635, 0, 12),
    cylinder(0.005, 0.005, 0.14, mat(0x1a1a1a), 0.07, 0.625, 0, 6),
  );
  pipe.children[1].rotation.z = Math.PI / 2 - 0.15;
  pipe.position.set(0.1, 0, -0.08);
  const book = box(0.14, 0.03, 0.2, mat(0x5a2a2a, { roughness: 0.7 }), 0.08, 0.63, 0.1);
  book.rotation.y = 0.4;
  t.add(cup, pipe, book);
  return { table: t, cup };
}

// Terrestrial globe on a tripod stand with a brass meridian.
export function globe() {
  const map = paint(512, 256, (g, w, h, rand) => {
    g.fillStyle = '#6f8a7a';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8c69a';
    for (let i = 0; i < 9; i++) {
      const cx = rand() * w;
      const cy = 40 + rand() * (h - 80);
      g.beginPath();
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const r = 20 + rand() * 40;
        g.lineTo(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r);
      }
      g.fill();
    }
    g.strokeStyle = 'rgba(60,40,20,0.35)';
    for (let x = 0; x < w; x += w / 12) g.strokeRect(x, 0, 0, h);
    for (let y = 0; y < h; y += h / 6) g.strokeRect(0, y, w, 0);
    g.fillStyle = 'rgba(120,80,30,0.25)';
    g.fillRect(0, 0, w, h);
  }, 17);
  const ball = sphere(0.24, new THREE.MeshStandardMaterial({ map, roughness: 0.45 }), 0, 1.02, 0, 32);
  ball.rotation.z = 0.41;
  const meridian = mesh(new THREE.TorusGeometry(0.265, 0.012, 8, 48), M.brass, 0, 1.02, 0);
  meridian.rotation.set(0, Math.PI / 2, 0.41);
  const horizon = mesh(new THREE.TorusGeometry(0.29, 0.02, 6, 48), M.darkWood, 0, 1.0, 0);
  horizon.rotation.x = Math.PI / 2;
  const stand = group(
    lathe([[0.04, 0], [0.06, 0.1], [0.035, 0.35], [0.05, 0.55], [0.03, 0.72], [0, 0.72]], M.darkWood, 0, 0.05, 0, 16),
  );
  for (let i = 0; i < 3; i++) {
    const foot = box(0.04, 0.05, 0.3, M.darkWood, 0, 0, 0.15);
    const pivot = group(foot);
    pivot.position.y = 0.06;
    pivot.rotation.set(0.25, (i / 3) * Math.PI * 2, 0);
    stand.add(pivot);
  }
  for (const a of [0, Math.PI]) stand.add(box(0.02, 0.28, 0.02, M.darkWood, Math.cos(a) * 0.28, 0.9, Math.sin(a) * 0.28));
  return group(stand, ball, meridian, horizon);
}

export function trunk() {
  const t = group(
    box(0.9, 0.45, 0.5, mat(0x3a2a1a, { roughness: 0.7 }), 0, 0.26, 0),
    mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 20, 1, false, 0, Math.PI), mat(0x3a2a1a, { roughness: 0.7 }), 0, 0.485, 0),
  );
  t.children[1].rotation.set(0, 0, Math.PI / 2);
  t.children[1].scale.set(0.45, 1, 1);
  for (const x of [-0.28, 0.28]) {
    t.add(box(0.06, 0.47, 0.52, M.leather, x, 0.26, 0));
  }
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) t.add(box(0.06, 0.06, 0.06, M.brass, x * 0.44, 0.06, z * 0.24));
  t.add(box(0.08, 0.06, 0.02, M.brass, 0, 0.46, 0.255));
  // Shipping labels: place names only.
  const labels = [['MADEIRA', '#b8462e'], ['CAPE TOWN', '#2e5a8a'], ['TENERIFE', '#c89a2e']];
  labels.forEach(([name, color], i) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), new THREE.MeshStandardMaterial({
      map: label(name, { w: 160, h: 100, bg: color, color: '#f4ead2', size: 0.2, weight: 'bold' }),
      roughness: 1,
    }));
    place(l, -0.14 + i * 0.16, 0.25 + (i % 2) * 0.06, 0.252, 0, 0, (i - 1) * 0.15);
    t.add(l);
  });
  // An unlit hurricane lantern on the lid.
  const lantern = group(
    cylinder(0.06, 0.07, 0.04, M.blackIron, 0, 0.02, 0, 12),
    lathe([[0.03, 0], [0.055, 0.06], [0.045, 0.14], [0.03, 0.18]], M.glass, 0, 0.04, 0, 12),
    cylinder(0.04, 0.05, 0.04, M.blackIron, 0, 0.24, 0, 12),
    mesh(new THREE.TorusGeometry(0.05, 0.005, 6, 12, Math.PI), M.blackIron, 0, 0.26, 0),
  );
  lantern.position.set(0.25, 0.6, -0.02);
  t.add(lantern);
  return t;
}

// Oval portrait of a stern woman with a small telescope.
export function portrait() {
  const map = paint(256, 320, (g, w, h) => {
    const bg = g.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h / 2, h * 0.6);
    bg.addColorStop(0, '#4a4a38');
    bg.addColorStop(1, '#1a1a12');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#16120c';
    g.beginPath();
    g.ellipse(w / 2, h * 0.95, w * 0.42, h * 0.35, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#b89a7a';
    g.beginPath();
    g.ellipse(w / 2, h * 0.38, 38, 50, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2a1e14';
    g.beginPath();
    g.ellipse(w / 2, h * 0.3, 46, 40, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = '#d8d0b8';
    g.fillRect(w / 2 - 14, h * 0.53, 28, 10);
    g.strokeStyle = '#8a6d3a';
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(w * 0.62, h * 0.95);
    g.lineTo(w * 0.85, h * 0.62);
    g.stroke();
  }, 3);
  const canvasMesh = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshStandardMaterial({ map, roughness: 0.8 }));
  canvasMesh.scale.y = 1.25;
  canvasMesh.position.z = 0.02;
  const frame = mesh(new THREE.TorusGeometry(0.2, 0.025, 10, 48), M.brass, 0, 0, 0.02);
  frame.scale.y = 1.25;
  return group(box(0.46, 0.56, 0.015, M.darkWood, 0, 0, 0), canvasMesh, frame);
}

// Framed engraving: subject is 'moon' or 'saturn'.
export function engraving(subject) {
  const map = paint(300, 380, (g, w, h, rand) => {
    g.fillStyle = '#e8dcc0';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2b2218';
    g.lineWidth = 2;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = '#1e1a16';
    g.fillRect(24, 24, w - 48, h - 90);
    const cx = w / 2;
    const cy = (h - 66) / 2 + 12;
    if (subject === 'moon') {
      g.fillStyle = '#d8d2c0';
      g.beginPath();
      g.arc(cx, cy, 100, 0, Math.PI * 2);
      g.fill();
      for (let i = 0; i < 40; i++) {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 90;
        g.strokeStyle = 'rgba(40,35,30,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3 + rand() * 12, 0, Math.PI * 2);
        g.stroke();
      }
    } else {
      g.strokeStyle = '#cfc4a8';
      g.lineWidth = 7;
      g.beginPath();
      g.ellipse(cx, cy, 120, 32, -0.35, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = '#d8ccae';
      g.beginPath();
      g.arc(cx, cy, 62, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(60,50,40,0.5)';
      g.lineWidth = 3;
      for (const dy of [-24, -8, 10, 28]) {
        g.beginPath();
        g.moveTo(cx - 58, cy + dy);
        g.lineTo(cx + 58, cy + dy - 8);
        g.stroke();
      }
    }
    g.fillStyle = '#2b2218';
    g.font = 'italic 24px Georgia, serif';
    g.textAlign = 'center';
    g.fillText(subject === 'moon' ? 'Luna' : 'Saturnus', w / 2, h - 34);
  }, subject === 'moon' ? 5 : 6);
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.53), new THREE.MeshStandardMaterial({ map, roughness: 0.9 }));
  picture.position.z = 0.02;
  return group(
    box(0.52, 0.63, 0.03, M.darkBrass, 0, 0, 0),
    picture,
  );
}

// Fern in a pot on a tall stand. Fronds are bent planes with a cut-out leaf texture.
export function fern() {
  const frondMap = paint(64, 256, (g, w, h) => {
    g.strokeStyle = '#4a7a38';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(w / 2, h);
    g.lineTo(w / 2, 0);
    g.stroke();
    g.fillStyle = '#5a8c40';
    for (let y = 8; y < h - 10; y += 9) {
      const len = (w / 2 - 4) * Math.sin((y / h) * Math.PI) + 3;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.ellipse(w / 2 + s * len / 2, y, len / 2, 3, s * 0.3, 0, Math.PI * 2);
        g.fill();
      }
    }
  }, 2);
  const frondMat = new THREE.MeshStandardMaterial({ map: frondMap, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 });
  const plant = group();
  const rand = seededRandom(29);
  for (let i = 0; i < 18; i++) {
    const geometry = new THREE.PlaneGeometry(0.12, 0.55, 1, 8);
    geometry.translate(0, 0.275, 0);
    const pos = geometry.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const y = pos.getY(v);
      pos.setZ(v, -0.9 * y * y);
    }
    geometry.computeVertexNormals();
    const frond = new THREE.Mesh(geometry, frondMat);
    frond.castShadow = true;
    frond.rotation.set(-0.3 - rand() * 0.5, (i / 18) * Math.PI * 2 + rand() * 0.3, 0, 'YXZ');
    frond.position.y = 1.02;
    plant.add(frond);
  }
  const stand = group(
    lathe([[0.16, 0], [0.16, 0.03], [0.05, 0.08], [0.035, 0.5], [0.05, 0.8], [0.14, 0.85], [0, 0.85]], M.mahogany, 0, 0, 0, 20),
    lathe([[0.07, 0], [0.12, 0.1], [0.14, 0.18], [0.13, 0.19], [0, 0.19]], mat(0x9a5a3a, { roughness: 0.8 }), 0, 0.85, 0, 20),
  );
  return group(stand, plant);
}

// Banjo barometer: weather words only.
export function barometer() {
  const dialMap = paint(256, 256, (g, w) => {
    g.fillStyle = '#efe6cf';
    g.beginPath();
    g.arc(w / 2, w / 2, w / 2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2b1d0e';
    g.font = 'italic 17px Georgia, serif';
    g.textAlign = 'center';
    const words = ['STORMY', 'RAIN', 'CHANGE', 'FAIR', 'VERY DRY'];
    words.forEach((word, i) => {
      g.save();
      g.translate(w / 2, w / 2);
      g.rotate(-Math.PI * 0.38 + (i / (words.length - 1)) * Math.PI * 0.76);
      g.fillText(word, 0, -w * 0.36);
      g.restore();
    });
    g.strokeStyle = '#2b1d0e';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(w / 2, w / 2);
    g.lineTo(w / 2 - 20, w * 0.2);
    g.stroke();
  }, 4);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.13, 40), new THREE.MeshStandardMaterial({ map: dialMap, roughness: 0.5 }));
  dial.position.set(0, -0.15, 0.035);
  const bezel = mesh(new THREE.TorusGeometry(0.135, 0.012, 8, 40), M.brass, 0, -0.15, 0.035);
  return group(
    cylinder(0.17, 0.17, 0.05, M.mahogany, 0, -0.15, 0, 32).rotateX(Math.PI / 2),
    box(0.1, 0.5, 0.04, M.mahogany, 0, 0.2, 0),
    sphere(0.05, M.mahogany, 0, 0.47, 0, 12),
    dial,
    bezel,
  );
}

// Glass-fronted cabinet of brass instruments.
export function instrumentCabinet() {
  const c = group(
    box(0.8, 1.8, 0.04, M.darkWood, 0, 0.95, -0.18),
    box(0.04, 1.8, 0.4, M.mahogany, -0.4, 0.95, 0),
    box(0.04, 1.8, 0.4, M.mahogany, 0.4, 0.95, 0),
    box(0.86, 0.06, 0.44, M.mahogany, 0, 1.87, 0),
    box(0.84, 0.1, 0.42, M.mahogany, 0, 0.05, 0),
  );
  for (const y of [0.1, 0.62, 1.12, 1.84]) c.add(box(0.76, 0.025, 0.36, M.mahogany, 0, y, 0));
  // Sextant.
  const sextant = group(
    mesh(new THREE.TorusGeometry(0.14, 0.008, 6, 24, Math.PI / 3), M.brass, 0, 0, 0),
    box(0.008, 0.16, 0.008, M.brass, 0.03, 0.07, 0),
    box(0.008, 0.16, 0.008, M.brass, -0.03, 0.07, 0),
  );
  sextant.children[0].rotation.z = Math.PI / 3;
  place(sextant, -0.15, 0.66, 0, 0.3);
  // Spyglass on a small cradle.
  const spyglass = group(
    cylinder(0.025, 0.02, 0.2, M.brass, 0, 0, 0, 12),
    cylinder(0.02, 0.016, 0.16, M.brass, 0, 0.17, 0, 12),
    cylinder(0.016, 0.014, 0.12, M.darkBrass, 0, 0.3, 0, 12),
  );
  place(spyglass, 0.02, 0.17, 0.02, 0, 0, Math.PI / 2 - 0.1);
  // Astrolabe.
  const astrolabe = group(
    cylinder(0.1, 0.1, 0.01, M.brass, 0, 0, 0, 32),
    mesh(new THREE.TorusGeometry(0.1, 0.008, 6, 32), M.darkBrass, 0, 0, 0.006),
    box(0.19, 0.01, 0.004, M.darkBrass, 0, 0, 0.01),
  );
  astrolabe.children[0].rotation.x = Math.PI / 2;
  place(astrolabe, 0.15, 1.26, -0.12, 0, -0.2);
  // Brass microscope and a pair of dividers.
  const microscope = group(
    cylinder(0.05, 0.06, 0.02, M.blackIron, 0, 0.01, 0, 16),
    box(0.02, 0.14, 0.02, M.brass, 0, 0.08, -0.02),
    cylinder(0.018, 0.018, 0.14, M.brass, 0, 0.14, 0.02, 12),
  );
  microscope.children[2].rotation.x = 0.3;
  place(microscope, -0.18, 1.14, 0);
  const glassFront = box(0.76, 1.72, 0.01, M.glass, 0, 0.96, 0.2);
  glassFront.castShadow = false;
  c.add(sextant, spyglass, astrolabe, microscope, glassFront,
    box(0.02, 1.72, 0.02, M.mahogany, 0, 0.96, 0.21));
  // A few books lying flat.
  c.add(box(0.2, 0.05, 0.26, mat(0x3a2020), 0.2, 0.66, 0), box(0.18, 0.04, 0.24, mat(0x20303a), 0.2, 0.705, 0));
  return c;
}

// Tall observing stool, seat wound up to the height of the eyepiece.
export function observingChair() {
  const c = group(
    cylinder(0.2, 0.2, 0.05, M.leather, 0, 0.66, 0, 24),
    cylinder(0.18, 0.18, 0.04, M.darkWood, 0, 0.62, 0, 24),
    cylinder(0.035, 0.035, 0.3, M.brass, 0, 0.5, 0, 12),
    mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 28), M.darkBrass, 0, 0.26, 0),
  );
  c.children[3].rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = cylinder(0.018, 0.022, 0.64, M.darkWood, Math.cos(a) * 0.19, 0.31, Math.sin(a) * 0.19, 8);
    leg.rotation.set(Math.sin(a) * 0.14, 0, -Math.cos(a) * 0.14);
    c.add(leg);
  }
  // Low curved back rest.
  const back = mesh(new THREE.TorusGeometry(0.19, 0.02, 8, 20, Math.PI * 0.8), M.darkWood, 0, 0.86, 0);
  back.rotation.set(Math.PI / 2, 0, Math.PI * 1.1);
  c.add(back);
  for (const a of [-0.9, 0, 0.9]) c.add(cylinder(0.01, 0.01, 0.2, M.darkWood, Math.sin(a) * 0.19, 0.77, -Math.cos(a) * 0.19, 6));
  return c;
}

// A smaller rectangular rug.
export function runner(w, d, seed = 3) {
  const map = paint(256, 384, (g, cw, ch, rand) => {
    g.fillStyle = '#243052';
    g.fillRect(0, 0, cw, ch);
    g.strokeStyle = '#b8903e';
    g.lineWidth = 6;
    g.strokeRect(14, 14, cw - 28, ch - 28);
    g.fillStyle = '#6a1c1a';
    g.fillRect(34, 34, cw - 68, ch - 68);
    g.fillStyle = '#c8a050';
    for (let y = 60; y < ch - 60; y += 36) {
      for (let x = 60; x < cw - 50; x += 36) {
        g.beginPath();
        g.moveTo(x, y - 8);
        g.lineTo(x + 6, y);
        g.lineTo(x, y + 8);
        g.lineTo(x - 6, y);
        g.fill();
      }
    }
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,235,200,0.05)';
      g.fillRect(rand() * cw, rand() * ch, 2, 2);
    }
  }, seed);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.006;
  rug.receiveShadow = true;
  return rug;
}

// A pile of books on the floor.
export function bookPile(seed = 8) {
  const rand = seededRandom(seed);
  const pile = group();
  let y = 0;
  for (let i = 0; i < 5; i++) {
    const h = 0.04 + rand() * 0.03;
    const b = box(0.24 + rand() * 0.08, h, 0.18 + rand() * 0.05, mat([0x5b2320, 0x23395b, 0x2f4a2a, 0x6b5a2a][i % 4], { roughness: 0.7 }), 0, y + h / 2, 0);
    b.rotation.y = (rand() - 0.5) * 0.6;
    pile.add(b);
    y += h;
  }
  return pile;
}

