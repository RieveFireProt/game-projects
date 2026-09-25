import './styles.css';
import * as THREE from 'three';
import { createState } from './game/state.js';
import { openHints } from './game/hints.js';
import { openItem, openSatchel } from './game/inventory.js';
import { createPlayer } from './engine/player.js';
import { createInteraction } from './engine/interaction.js';
import { createModal } from './engine/modal.js';
import { createHud } from './engine/hud.js';
import { createAudio } from './engine/audio.js';
import { buildObservatory } from './rooms/observatory/room.js';

const RELOCK_GRACE_MS = 400;
const STRIDE = 0.75; // metres between footsteps
const EXIT_SPEED = 1.5; // m/s for the walk out at the end
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
const audio = createAudio();
const game = { state, modal, hud, room: null, openModal: null, sfx: audio.play };

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

// Per-browser settings (separate from the save game).
const DEFAULT_SETTINGS = { brightness: 1.25, volume: 0.7 };
const settings = (() => {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
})();
const APPLY = {
  brightness: (v) => (renderer.toneMappingExposure = v),
  volume: (v) => audio.setVolume(v),
};
for (const [key, apply] of Object.entries(APPLY)) {
  const input = document.getElementById(key);
  input.value = settings[key];
  apply(settings[key]);
  input.addEventListener('input', () => {
    settings[key] = Number(input.value);
    apply(settings[key]);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable; the setting just won't persist.
    }
  });
}

// Browsers only allow sound after a user gesture.
for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, () => audio.unlock(), { capture: true });
state.on((type, detail) => {
  for (const [name, delay] of room.soundsFor(type, detail)) setTimeout(() => audio.play(name), delay * 1000);
});
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

const overlayMode = () => (state.has('escaped') ? 'end' : state.has('started') ? 'paused' : 'title');

player.onLockChange((locked) => {
  if (locked) hud.hideOverlay();
  else if (!modal.isOpen() && !exit) hud.showOverlay(overlayMode());
});
modal.onClose(() => {
  if (exit) return;
  if (state.has('escaped')) hud.showOverlay('end');
  else resume();
});

// The end: stop the clock, walk the players out through the door, then show how it went.
let exit = null;
game.finish = () => {
  const curve = new THREE.CatmullRomCurve3(room.exitPath(player.position));
  exit = { curve, t: 0, duration: Math.max(3.5, curve.getLength() / EXIT_SPEED), stepAt: 0 };
  state.set('escaped');
  document.body.classList.add('cinematic');
  modal.close();
  player.unlock();
  hud.hideOverlay();
};
const fade = document.getElementById('fade');
const lookTarget = new THREE.Vector3();
function updateExit(dt) {
  exit.t = Math.min(1, exit.t + dt / exit.duration);
  const k = exit.t < 0.5 ? 2 * exit.t * exit.t : 1 - (-2 * exit.t + 2) ** 2 / 2; // ease in-out
  exit.curve.getPointAt(k, camera.position);
  // Look along the path a couple of metres ahead, tipping down as the stairs begin.
  const ahead = exit.curve.getPointAt(Math.min(1, k + 2 / exit.curve.getLength()), lookTarget);
  if (k > 0.97) ahead.addScaledVector(exit.curve.getTangentAt(1), 2);
  lookTarget.y -= 0.3 + Math.max(0, k - 0.7) * 1.2;
  camera.lookAt(lookTarget);
  if (exit.t > exit.stepAt) {
    exit.stepAt += 0.55 / exit.duration;
    audio.play('step');
  }
  fade.style.opacity = String(Math.max(0, (exit.t - 0.62) / 0.33));
  if (exit.t >= 1) {
    exit = null;
    document.body.classList.remove('cinematic');
    fade.style.opacity = '1';
    showEnd();
  }
}
function showEnd() {
  const s = Math.floor(state.elapsedMs / 1000);
  const unit = (n, word) => (n ? `${n} ${word}${n === 1 ? '' : 's'}` : '');
  const time = [unit(Math.floor(s / 3600), 'hour'), unit(Math.floor(s / 60) % 60, 'minute'), s < 600 ? unit(s % 60, 'second') : '']
    .filter(Boolean).join(' ') || 'no time at all';
  const hints = state.hintsUsed;
  document.getElementById('end-summary').textContent =
    `Escaped in ${time}, with ${hints === 0 ? 'no hints' : hints === 1 ? 'one hint' : `${hints} hints`}.`;
  hud.showOverlay('end');
}

if (state.has('escaped')) showEnd();
else hud.showOverlay(overlayMode());

// Dev only: ?peek=x,z,yawDeg,pitchDeg places the camera and hides the title screen.
const peek = new URLSearchParams(window.location.search).get('peek');
if (import.meta.env.DEV) {
  game.teleport = (x, z, yaw, pitch = 0) => player.teleport(x, z, THREE.MathUtils.degToRad(yaw), THREE.MathUtils.degToRad(pitch));
  game.aim = () => (camera.updateMatrixWorld(), interaction.update(true)?.id ?? null); // what the crosshair is on
  game.use = (id) => room.hotspots.find((h) => h.id === id)?.onUse();
  game.inspect = (id) => openItem(game, id);
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
hud.onClick('btn-again', () => {
  state.reset();
  window.location.reload();
});
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
let stride = 0;

renderer.setAnimationLoop((timestamp) => {
  timer.update(timestamp);
  const dt = Math.min(timer.getDelta(), 0.1);
  const locked = player.isLocked();

  if (exit) updateExit(dt);
  else if (locked) {
    player.update(dt);
    stride += player.speed * dt;
    if (stride > STRIDE) {
      stride = 0;
      audio.play('step');
    }
  }
  audio.setFireDistance(player.position.distanceTo(room.firePosition));
  hud.setPrompt(interaction.update(locked && !exit)?.label ?? null);
  if (room.update(dt)) renderer.shadowMap.needsUpdate = true;

  if (state.has('started') && !state.has('escaped') && (locked || modal.isOpen())) {
    state.tick(dt);
    hud.setTimer(state.elapsedMs);
  }
  renderer.render(scene, camera);
});
