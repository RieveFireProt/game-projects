import './styles.css';
import * as THREE from 'three';
import { createState } from './game/state.js';
import { openHints } from './game/hints.js';
import { openItem, openSatchel } from './game/inventory.js';
import { createPlayer } from './engine/player.js';
import { createInteraction } from './engine/interaction.js';
import { createModal } from './engine/modal.js';
import { createHud } from './engine/hud.js';
import { buildObservatory } from './rooms/observatory/room.js';

const RELOCK_GRACE_MS = 400;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 200);

// `game` is the shared context handed to every hotspot, puzzle and item.
const state = createState('escape-rooms:observatory');
const modal = createModal();
const hud = createHud();
const game = { state, modal, hud, room: null, openModal: null };

const room = buildObservatory(scene, game);
game.room = room;
if (import.meta.env.DEV) window.game = game; // for console poking and smoke tests

const interaction = createInteraction({ camera, scene });
room.hotspots.forEach(interaction.register);

const player = createPlayer({
  camera,
  domElement: canvas,
  roomRadius: room.radius,
  colliders: room.colliders,
  spawn: room.spawn,
});
player.update(0);

// --- Pointer lock, modals and the pause screen -------------------------------

game.openModal = (options) => {
  modal.open(options);
  player.unlock();
};

function resume() {
  player.lock();
  // Browsers can refuse to re-lock right after Esc; fall back to the pause screen.
  setTimeout(() => {
    if (!player.isLocked() && !modal.isOpen()) hud.showOverlay('paused');
  }, RELOCK_GRACE_MS);
}

player.onLockChange((locked) => {
  if (locked) hud.hideOverlay();
  else if (!modal.isOpen()) hud.showOverlay(state.has('started') ? 'paused' : 'title');
});
modal.onClose(resume);

hud.showOverlay(state.has('started') ? 'paused' : 'title');

// Dev only: ?peek=x,z,yawDeg,pitchDeg places the camera and hides the title screen.
const peek = new URLSearchParams(window.location.search).get('peek');
if (import.meta.env.DEV && peek) {
  const [x, z, yaw, pitch] = peek.split(',').map(Number);
  player.teleport(x, z, THREE.MathUtils.degToRad(yaw), THREE.MathUtils.degToRad(pitch || 0));
  hud.hideOverlay();
}

hud.onClick('btn-begin', () => {
  state.set('started');
  hud.hideOverlay();
  room.intro();
});
hud.onClick('btn-continue', resume);
hud.onClick('btn-restart', () => {
  if (!window.confirm('Start over? All progress in this room will be lost.')) return;
  state.reset();
  window.location.reload();
});

// --- Input -------------------------------------------------------------------

document.addEventListener('mousedown', (e) => {
  if (e.button === 0 && player.isLocked()) interaction.hovered?.onUse();
});

window.addEventListener('keydown', (e) => {
  if (modal.isOpen()) {
    if (e.code === 'Escape') modal.close();
    return;
  }
  if (!player.isLocked()) return;
  if (e.code === 'KeyH') openHints(game);
  if (e.code === 'KeyI') openSatchel(game);
  const slot = e.code.match(/^Digit([1-9])$/);
  if (slot) {
    const id = state.inventory[Number(slot[1]) - 1];
    if (id) openItem(game, id);
  }
});

const renderInventory = () => hud.renderInventory(state.inventory.map((id) => room.items[id]));
state.on(renderInventory);
renderInventory();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Main loop ---------------------------------------------------------------

const clock = new THREE.Clock();
hud.setTimer(state.elapsedMs);

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const locked = player.isLocked();

  if (locked) player.update(dt);
  hud.setPrompt(interaction.update(locked)?.label ?? null);
  room.update(dt);

  if (state.has('started') && (locked || modal.isOpen())) {
    state.tick(dt);
    hud.setTimer(state.elapsedMs);
  }
  renderer.render(scene, camera);
});
