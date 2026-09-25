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
const SETTINGS_KEY = 'escape-rooms:settings';
const ENV_INTENSITY = 0.45;

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false; // the room is static; re-rendered only when something moves
renderer.shadowMap.needsUpdate = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 200);

// `game` is the shared context handed to every hotspot, puzzle and item.
const state = createState('escape-rooms:observatory');
const modal = createModal();
const hud = createHud();
const game = { state, modal, hud, room: null, openModal: null };

const room = buildObservatory(scene, game);
game.room = room;

captureEnvironment();

// Image-based light captured from the room itself, so brass and glass pick up the
// lamps and the moon instead of reflecting black. Two things would poison the map
// with NaN/Infinity, which the blur then smears everywhere: bump maps (degenerate
// derivatives at cube-face resolution) and surfaces millimetres from a flame
// (overflowing half floats). So both are tamed for the duration of the capture.
function captureEnvironment() {
  const SCALE = 1 / 64;
  const lights = [];
  const bumped = new Map();
  scene.traverse((o) => {
    if (o.isLight) lights.push(o);
    [].concat(o.material ?? []).forEach((m) => m.bumpMap && bumped.set(m, m.bumpMap));
  });
  const swapBumps = (restore) => bumped.forEach((map, m) => {
    m.bumpMap = restore ? map : null;
    m.needsUpdate = true;
  });

  lights.forEach((l) => (l.intensity *= SCALE));
  swapBumps(false);
  scene.updateMatrixWorld(true);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(scene, 0.04, 0.1, 120, { position: new THREE.Vector3(0, 1.8, 0) }).texture;
  scene.environmentIntensity = ENV_INTENSITY / SCALE;
  pmrem.dispose();
  swapBumps(true);
  lights.forEach((l) => (l.intensity /= SCALE));
}

// Per-browser display settings (separate from the save game).
const settings = (() => {
  try {
    return { brightness: 1.25, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { brightness: 1.25 };
  }
})();
const brightness = document.getElementById('brightness');
function applyBrightness(value) {
  settings.brightness = Number(value);
  renderer.toneMappingExposure = settings.brightness;
  brightness.value = settings.brightness;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable; the setting just won't persist.
  }
}
applyBrightness(settings.brightness);
brightness.addEventListener('input', () => applyBrightness(brightness.value));
if (import.meta.env.DEV) Object.assign(window, { game, three: { THREE, renderer, scene, camera } }); // console poking, smoke tests

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
if (import.meta.env.DEV) {
  game.teleport = (x, z, yaw, pitch = 0) => player.teleport(x, z, THREE.MathUtils.degToRad(yaw), THREE.MathUtils.degToRad(pitch));
  game.aim = () => (camera.updateMatrixWorld(), interaction.update(true)?.id ?? null); // what the crosshair is on
  game.use = (id) => room.hotspots.find((h) => h.id === id)?.onUse();
  if (peek) {
    game.teleport(...peek.split(',').map(Number));
    hud.hideOverlay();
  }
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

const timer = new THREE.Timer();
timer.connect(document);
hud.setTimer(state.elapsedMs);

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const dt = Math.min(timer.getDelta(), 0.1);
  const locked = player.isLocked();

  if (locked) player.update(dt);
  hud.setPrompt(interaction.update(locked)?.label ?? null);
  if (room.update(dt)) renderer.shadowMap.needsUpdate = true;

  if (state.has('started') && (locked || modal.isOpen())) {
    state.tick(dt);
    hud.setTimer(state.elapsedMs);
  }
  renderer.render(scene, camera);
});
