# The Observatory at Kestrel Point — Design Doc

> **Spoilers.** This document (and `src/rooms/observatory/puzzles.js`, `story.js` and
> `content/`) contains every puzzle answer. If you want to play the room fresh, stop here.

A first-person, point-and-click escape room for two players sharing one laptop.
Tone: quiet, atmospheric, Myst-like. Difficulty: medium — logical, no outside
knowledge, every clue gets used. Target length: 45–60 minutes for two adults. (The
first version, six puzzles long, was beaten by a nine-year-old in ten minutes; the room
now has about twenty steps across three threads.)

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
open to a starry night. Candle and lamp light, moonlight through the slit, a
gramophone playing a slow waltz.

| Location (clockwise from door) | What's there |
|---|---|
| Door (0°) | Locked. A brass star plaque above it with the letter V at its heart. |
| Coat stand (22°) | Voss's cloak; the eclipse-order note in its pocket. |
| Desk + wall clock (60°) | Opening letter, locked drawer, the red-inked sheet. Clock stopped at 11:47. |
| Portrait (80°) | Voss's mother; a note pasted on the back (quotes *Cosmos*). |
| Bookshelf (115°) | 4 shelves × 9 books. One per shelf tips forward as a latch; *Faint Lights* hides half a page. |
| Priest-hole (126.5°) | Stone block in the wall beside the bookshelf; the first sighting. |
| Map chest (137°) | Five chart drawers (one holds the Kestrel Point coast chart) and a locked bottom drawer. |
| Star chart (160°) | Constellations on a grid, lines of height labelled. Threads and pins. |
| Ladder (189°) | Up to the dome rail; the cabinet key hangs there. |
| Instrument cabinet (203°) | Locked glass door; the ruby glass slide. |
| Orrery table (215°) | Six-ring orrery, Saturn missing. Base opens to give the lens. |
| Gramophone (251°) | Plays the waltz; the record sleeve holds a note (quotes *Lectures on Light*). |
| Side table (272°) | Cold tea; a note under the saucer (quotes *The Story of the Heavens*). |
| Telegraph table (290°) | Key, sounder and a register whose paper tape holds the enciphered message in Morse. |
| Fern (305°) | Saturn buried in the pot. |
| Steamer trunk (321°) | Four eclipse labels, a letter lock; the cipher wheel inside. |
| Centre | The great telescope: HOUR and HEIGHT dials, empty lens socket, eyepiece. |
| Beside telescope | Eyepiece case (the other half of the torn page). |

## Puzzle flow

```
                           Opening letter
                                 │
                Wall clock 11:47 ──► Desk drawer [1147]
                                 │  (journal + telegraph code card)
      ┌──────────────────────────┼─────────────────────────────┐
     LENS                       HOUR                         HEIGHT
      │                          │                             │
 Eyepiece case ─┐          Cloak pocket:               Quotes in journal,
 Faint Lights  ─┴► torn    eclipse-order logic         saucer, portrait back,
 (bookshelf)      page     ──► Trunk [RING]            record sleeve
      │           │              │ (cipher wheel)       ──► tip 4 books ──► priest-hole
 Fern: Saturn     │        Register tape (Morse)                │      (sighting I)
      │           │        + code card ──► MTZW SNSJYJJS        │
 Coast chart ──► Map chest [W N N E N W]  Door star V           Ladder ──► cabinet key
      │           (Almanac + sighting III) ─────────────────┐   ──► cabinet ──► ruby glass
      │           │              │                          │   ──► red sheet (sighting II)
      └─► Orrery (6 rings) ◄─────┘   decode: HOUR NINETEEN  │             │
             │                           │                  └─► Star chart: three threads
           Lens                          │                        cross at +40°
             └───────────────────────────┼──────────────────────────┘
                   Telescope: lens + HOUR 19 + HEIGHT +40
                                 │
                        Look through eyepiece → door opens
```

After the drawer there are three threads, and most steps inside them can be done in
any order, so two players can split up and trade finds. The threads cross in two
places: the map chest feeds both the orrery (Almanac) and the star chart (sighting
III), and the bookshelf feeds both the torn page and the priest-hole.

### Puzzles

1. **Desk drawer** (observation). The letter: "the moment time stood still." Wall clock
   frozen at 11:47 → `1147`. Reward: journal, telegraph code card.
2. **Torn page** (search + assembly). Journal 13 Oct: "where I keep my spare eyes"
   (eyepiece case) and "my own book" (*Faint Lights* by E. Voss, third shelf). Drag and
   turn the halves together. Shows Mercury, Venus, Earth and Mars on a 0–330° rim.
3. **Saturn** (riddle + search). The orrery's outer arm is bare. Journal 12 Oct: Saturn
   "has gone to ground among the fronds" → dig in the fern's pot.
4. **Map chest** (map reading, directional lock). Drawer 3 holds a coast chart with a
   pencilled road Harbour → Chapel → Stone Cross → Old Well → Lych Gate → Gibbet Stone →
   Tower, going up, right, right, down, right, up on the page. The lock says "as the
   compass has it", and the chart's compass rose points north to the **right**, so
   the answer is `W N N E N W`. Reward: Almanac page + sighting III.
5. **Orrery** (spatial, three sources). Six rings, 12 stops of 30°. Page: Mercury
   120°, Venus 270°, Earth 30°, Mars 180°. Almanac, 9 Oct: Jupiter 60°, Saturn 210°
   (Uranus and Neptune are there too, as distractors). Saturn must be fitted first.
   Reward: the lens.
6. **Trunk** (logic, letter lock). Labels NATAL, RIGA, GRENADA, IONA. Cloak note:
   Grenada after Natal; Iona before Natal but not first; Riga not last → Riga, Iona,
   Natal, Grenada → `RING` (GRIN is the tempting wrong anagram). Reward: cipher wheel.
7. **Telegraph tape** (Morse, then a cipher). The register tape reads `MTZW SNSJYJJS` in
   Morse (code card from the drawer). Journal 11 Oct: the wheel's setting is the letter
   above the door, V. Inner A under outer V decodes it: `HOUR NINETEEN`. The form has a
   pencil row for the tape letters and a row for the clear text; only the clear row is
   checked.
8. **Bookshelf** (search + cross-reference). Journal 5 Oct: tip one book per shelf, "the
   four books I quote most." Quotes: *The Story of the Heavens* (saucer note, top
   shelf), *Cosmos* (back of portrait, second shelf), *Celestial Objects for Common
   Telescopes* (journal 3 Oct, third shelf), *Lectures on Light* (record sleeve, bottom
   shelf). A second book by Ball (*Star-Land*) is there too, so the title matters,
   not the author. Reward: the priest-hole opens (sighting I).
9. **Cabinet key** (riddle). Journal 10 Oct: the key "lives up among the wheels of the
   dome" → climb the ladder.
10. **Instrument cabinet** (key). Reward: the ruby glass.
11. **Red sheet** (filter). A sheet on the desk crosshatched in red over pale blue
    writing. Drag the ruby glass over it: the red vanishes, the blue goes dark
    (sighting II).
12. **Star chart** (triangulation). Journal 14 Oct: three sightings, each a line between
    two stars; where they cross is the new star. Click two stars to stretch a thread
    through them (up to three):
    - I: brightest of the Crook → jewel of the Crown
    - II: brightest of the Eagle → uppermost of the Club
    - III: brightest of the Serpent → brightest of the Club

    With all three the crossing point beside the Lyre is ringed, on the +40° line.
    The star positions in `starChart.js` are laid out so the lines meet exactly;
    moving a star can break it.
13. **Telescope** (meta lock). Seat the lens, HOUR = 19, HEIGHT = +40°, look.

### Hints

Each puzzle has a three-step hint ladder: nudge → stronger hint → answer. The ladders
live in `src/rooms/observatory/puzzles.js`, which is the source of truth. The in-game
hint panel (H) only offers puzzles the players can currently reach.

### Sound and narration

- The gramophone plays an original slow waltz in D minor, synthesised note by note in
  `engine/music.js` and pushed through a horn-shaped filter, turntable wobble and
  surface crackle. It gets louder as you approach, and the players can lift the
  needle.
- The wind has long calm spells and an occasional whistle past the shutters, so it
  doesn't loop audibly.
- Every letter, journal entry and note in Voss's hand has a "Read aloud" button. The
  recordings are pre-rendered with Kokoro (an open-source TTS model) by
  `tools/narrate.py` from the text in `story.js` (`tools/narration.mjs` extracts it),
  and live in `public/narration/`. Re-run both after changing any text.

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
4. ~~Atmosphere pass~~ — procedural textures, furnished room, flickering lamps,
   moonbeam, image-based lighting, flavour one-liners on decor, synthesised audio
   (wind, stove, footsteps, puzzle sounds), the stairwell beyond the door.
5. **Longer room** — three threads, ~20 steps, gramophone music, narrated letters. ← *current*
   Still open: playtest timing and tune the hint ladders; real 3D models if wanted.
6. AI game master — small local server that calls Claude with the game state + this
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
- Is ~20 steps the right length for 40–60 minutes? Needs a real playtest.
