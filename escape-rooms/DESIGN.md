# The Observatory at Kestrel Point — Design Doc

> **Spoilers.** This document (and `src/rooms/observatory/puzzles.js`, `story.js` and
> `content/`) contains every puzzle answer. If you want to play the room fresh, stop here.

A first-person, point-and-click escape room for two players sharing one laptop.
Tone: quiet, atmospheric, Myst-like. Difficulty: easy to mildly medium — logical,
no outside knowledge, every clue gets used. Target length: 45–60 minutes.

## Story

October 1893. Dr. Elara Voss, astronomer, has invited two old friends (the players)
to her observatory for "a night you'll never forget." When they arrive she is gone;
the door swings shut and locks behind them. A letter on her desk explains:

- She has discovered something in the sky no one has ever seen.
- She wants the players to be the first to see it, but won't simply hand it over.
- The door is geared to the great telescope and opens only when the telescope is
  turned on her discovery.

**Ending:** the players aim the telescope correctly, look through the eyepiece, and
see her new star. The door unlocks. (The ending is where the personal twist goes:
the star, the final letter, or both can turn out to be about the two of you.)

## The room

A circular stone tower room, ~12 m across, under a dark dome with the observing slit
open to a starry night. Candle and lamp light, moonlight through the slit.

| Location (clockwise from door) | What's there |
|---|---|
| Door (east) | Locked. A brass star plaque above it with a letter at its heart. |
| Desk + wall clock | The opening letter, a locked drawer, a lamp. Clock stopped at 11:47. |
| Bookshelf | Many books; one written by E. Voss (hides half of a torn page). |
| Star chart (wall) | Constellations on a grid; declination lines labelled, hour lines scraped off. |
| Orrery table | Clockwork solar system. Base opens when planets are set correctly. |
| Telegram table | An enciphered telegram to the Royal Astronomical Society. |
| Centre | The great telescope: HOUR and HEIGHT dials, empty lens socket, eyepiece. |
| Beside telescope | Eyepiece case (the other half of the torn page). |

## Puzzle flow

```
                    Opening letter
                          │
          Wall clock (11:47) ──► Desk drawer lock [1147]
                                        │
                           ┌────────────┴────────────┐
                        Journal                 Cipher wheel
                           │                          │
          ┌────────────────┼──────────────┐           │
   "spare eyes"      "my own book"   "letter above    │
   Eyepiece case     Bookshelf         my door"       │
   (page half A)     (page half B)    Door star: V ───┤
          └───────┬────────┘                          │
          Assemble torn page                   Decode telegram
          (orrery diagram)                    "THE HOUR IS NINETEEN"
                  │                                   │
            Set the orrery                            │
                  │                                   │
        Lens (engraved Lyre ♪) ──► Star chart:        │
                                   Lyra at +40°       │
                  └──────────────┬────────────────────┘
                   Telescope: lens + HOUR 19 + HEIGHT +40
                                 │
                        Look through eyepiece → ending
```

After the drawer there are two independent threads (cipher and orrery), so if one
stalls the players can switch to the other.

### Puzzles

1. **Desk drawer** (observation). The letter says the lock is set to "the moment time
   stood still." The wall clock is frozen at 11:47. Four-wheel combination lock → `1147`.
   Reward: journal, cipher wheel.
2. **Torn page** (search + assembly). The journal's orrery page was torn out and split:
   "where I keep my spare eyes" (eyepiece case) and "between the pages of my own book"
   (bookshelf: find the spine by E. Voss). Drag and rotate the two halves together in a
   modal to reveal the orrery diagram.
3. **Orrery** (spatial). Rotate four planet rings to match the diagram
   (Mercury III, Venus VI, Earth I, Mars IV). Base opens. Reward: brass lens engraved
   with the Lyre symbol.
4. **Telegram** (decoding). Journal says the wheel setting is "the letter above my door."
   The door star shows V. Set inner A under V, decode: `THE HOUR IS NINETEEN`.
5. **Star chart** (cross-reference). The lens's Lyre symbol matches a constellation on
   the chart sitting on the +40° line.
6. **Telescope** (meta lock). Seat the lens, set HOUR = 19, HEIGHT = +40°, look.

### Hints

Each puzzle has a three-step hint ladder: nudge → stronger hint → answer. The ladders
live in `src/rooms/observatory/puzzles.js`, which is the source of truth. The in-game
hint panel (H) only offers puzzles the players can currently reach.

## Tech

- Three.js + Vite, plain JavaScript, runs in the browser.
- Pointer-lock mouse look + WASD, raycast from the crosshair to highlight clickable
  objects, click to open a large HTML modal where every puzzle lives.
- A central game state (flags, inventory, hints used, elapsed time) that is saved to
  localStorage. All puzzles read and write only this state, and the future AI game
  master will read the same state.

## Roadmap

1. ~~Design doc~~
2. ~~Grey-box prototype~~ — room layout, movement, hotspots, modal system, state,
   inventory, hints, opening letter, clock → drawer → journal chain.
3. ~~Remaining puzzles~~ — bookshelf search, eyepiece case, torn-page assembly
   (drag + turn), orrery rings, cipher wheel + telegram fill-in, star chart with
   loupe, telescope (lens, HOUR, HEIGHT, eyepiece), door, final letter, end screen.
4. **Atmosphere pass** — mostly done: procedural textures, furnished room, flickering
   lamps, moonbeam with dust, image-based lighting, flavour one-liners on decor,
   synthesised audio (wind, stove, footsteps, puzzle sounds). ← *current*
   Still open: real 3D models if wanted, music, a proper stairwell beyond the door.
5. AI game master — small local server that calls Claude with the game state + this
   design; in-character hints on request, opening narration, event commentary, optional TTS.

## Implementation notes

- **Flavour vs puzzle.** Anything that matters opens a modal. Decoration shows a
  one-line italic subtitle instead (`FLAVOR` in `story.js`), so players can tell at
  a glance it isn't a clue. Decor must never introduce clocks, lenses, letters or
  numbers that could be mistaken for clues.
- **Rendering.** Static meshes are merged per material at load (`mergeStatic` in
  `engine/build.js`); anything clickable or moving is flagged `userData.keep`.
  Shadow maps only re-render while something moves (`room.update` returns true).
  The environment map is captured from the room itself with bump maps off and lights
  dimmed, because both otherwise poison the capture with NaN/Infinity.
- **State → visuals.** `room.js` has a list of followers that ease 3D properties
  (drawer, book, case lid, planets, dial pointers, door) towards values derived from
  the game state, so reloading a save restores the room exactly.
- **Testing.** In dev, `window.game` has `teleport`, `aim` (what the crosshair is on),
  `use(hotspotId)` and `inspect(itemId)` for scripted playthroughs.

## Open questions

- Personal touches: the date in the letter, the star's name, the final reveal
  (all text lives in `story.js`).
- Should the lens say "+40°" outright (easier) or require the star chart (current plan)?
