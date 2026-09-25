# Escape Rooms

First-person, point-and-click escape rooms for two, played in the browser.
Built with Three.js + Vite.

**Current room:** *The Observatory at Kestrel Point*. See [DESIGN.md](DESIGN.md) for the
story, puzzle flow and roadmap.

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

Progress is saved in the browser automatically. Use **Start over** on the pause screen to reset.

## Layout

```
src/
  main.js              renderer, game loop, input, pause/modal wiring
  engine/              room-agnostic: player movement, raycast hotspots, modal, HUD
  game/                state (flags, inventory, hints, timer), hint panel, satchel
  rooms/observatory/
    geometry.js        the 3D room (grey-box primitives)
    hotspots.js        what's clickable and what each click opens
    puzzles.js         puzzle registry + hint ladders
    items.js           satchel items
    story.js           letter and journal text
    content/           one module per modal (clock, drawer lock, journal, ...)
```

## Dev tricks

- `?peek=x,z,yawDeg,pitchDeg` places the camera and skips the title screen (dev server only).
- `window.game` is exposed in dev for poking at state from the console.
