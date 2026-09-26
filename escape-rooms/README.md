# Escape Rooms

First-person, point-and-click escape rooms for two, played in the browser.
Built with Three.js + Vite.

**Current room:** *The Observatory at Kestrel Point*, playable start to finish.
[DESIGN.md](DESIGN.md) has the story, puzzle flow and roadmap, **with all the answers**,
so don't open it before you play.

## Run

```
npm install
npm run dev
```

Open the URL Vite prints (e.g. http://localhost:5173) in Chrome or Edge.

| Control | Action |
|---|---|
| Mouse | Look around |
| WASD / arrows | Walk |
| Click | Examine the highlighted object |
| H | Hint panel |
| I / 1–9 | Satchel / inspect an item |
| Esc | Close a modal, or pause |

Brightness and sound volume are on the title/pause screen.

Progress is saved in the browser automatically. Use **Start over** on the pause screen to reset.

## Layout

```
src/
  main.js              renderer, game loop, input, pause/modal/end wiring, settings
  engine/              room-agnostic: player, raycast hotspots, modal, HUD, audio, mesh helpers
  game/                state (flags, inventory, hints, timer), hint panel, satchel
  rooms/observatory/
    geometry.js        assembles the room: shell, dome, lights, furniture, decor
    furniture.js       pieces the puzzles use (desk, clock, orrery, telescope, door...)
    decor.js           atmosphere-only props
    textures.js        procedural canvas textures
    materials.js       shared materials
    lighting.js        flames, sconces and moonbeam
    hotspots.js        what's clickable and what each click opens
    room.js            wires it together; state-driven animation and sounds
    puzzles.js         puzzle registry + hint ladders
    items.js           satchel items
    story.js           all in-world writing (letters, journal, notes, books, flavour lines)
    content/           one module per modal (clock, drawer, orrery, telegraph, ...)
public/narration/      recorded readings of Voss's letters and notes (generated)
tools/                 scripted playthrough, narration generator
```

## Narration

The "Read aloud" recordings are generated from `story.js` with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx),
an open-source text-to-speech model that runs locally. After changing any of Voss's
writing, regenerate them (only changed lines are re-rendered):

```
pip install kokoro-onnx soundfile
# download kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx releases page (model-files-v1.0)
node tools/narration.mjs > narration.json
python tools/narrate.py narration.json kokoro-v1.0.onnx voices-v1.0.bin
```

## Dev tricks

- `?peek=x,z,yawDeg,pitchDeg` places the camera and skips the title screen (dev server only).
- `window.game` is exposed in dev for poking at state from the console, with helpers for
  scripted tests: `teleport(x, z, yawDeg, pitchDeg)`, `aim()`, `use(hotspotId)`,
  `inspect(itemId)`. `window.three` exposes the renderer, scene and camera.
- `tools/playthrough.cjs` (**spoilers**) plays the whole room through the UI and fails on
  console errors: run `npm run dev`, then `NODE_PATH=$(npm root -g) node tools/playthrough.cjs`.
