# Cat Simulator — design notes

A 2D pixel-art cat care sim in the spirit of Pocket Kitten. Godot 4.7,
GL Compatibility renderer.

This file records the decisions that are expensive to change later, and why.
Read it before changing anything under "Locked decisions".

---

## Locked decisions

These are cheap now and costly once assets exist, because changing them means
redrawing art that's already been made.

**Tile grid: 32×32.** A cat is roughly 32×32. 16×16 is faster to draw but a cat
becomes an unreadable blob; 64×64 looks better and is about four times the work
per animation frame, which is what kills small projects.

**Viewport: 384×216.** This is the *window*, not the room. It scales 5× exactly
to 1920×1080. Stretch mode is `canvas_items` with `aspect=keep` and
`scale_mode=integer`, so the pixel grid never shears or blurs. The cost is black
bars on non-16:9 displays, which is the right trade.

**Texture filter: Nearest.** Set project-wide via
`rendering/textures/canvas_textures/default_texture_filter=0`. The engine
default is Linear, which blurs pixel art. This is the single most common
"why does my pixel art look bad in Godot" cause.

**Sprite origin: bottom-centre of the object's floor footprint.** Every object
and cat sprite anchors here. Y-sorting and grid placement both depend on it, and
retrofitting means re-editing every sprite. `Grid.cell_to_anchor()` is the
function placement code should use.

**Footprint ≠ sprite size.** A bookshelf may be 32×64 pixels but occupy 2×1
floor tiles. These are two separate numbers and object data carries both.

**Palette: [Aren32](https://lospec.com/palette-list/aren32).** Everything is
drawn from these 32 colours — hand-drawn art, downloaded assets, and any colour
set in code. This is what makes mixed sources look like one game instead of a
ransom note.

- `assets/palette/aren32.hex` — import this into Piskel or Aseprite.
- `assets/palette/aren32.txt` — same palette in paint.net format.
- `assets/palette/aren32_swatch.png` — visual reference with indices.
- `scripts/palette.gd` — `Palette.COLORS[i]`, the ramps, and named colours
  (`Palette.TEXT`, `Palette.COIN`, `Palette.GOOD`…). **Generated** by
  `tools/gen_palette.py`; edit the `.hex` and re-run, don't hand-edit the `.gd`.

Ramps, each ordered dark → light. Shade *within* a ramp and unrelated sprites
still look related:

| Ramp | Indices | Use |
|---|---|---|
| `WARM`  | 0–8   | near-black → plum → terracotta → peach |
| `BERRY` | 10–14 | purple → red |
| `GOLD`  | 14–17 | red-orange → pale yellow |
| `GREEN` | 21→18 | dark green → yellow-green |
| `TEAL`  | 22–26 | dark green → mint |
| `COOL`  | 31→27 | near-black blue → white |

Suggested cat coats, so the breeds stay distinguishable: orange tabby from
`WARM` 3–8, grey from `COOL`, black/tuxedo from `WARM` 0–3 plus white, calico
from `WARM` + `COOL` + white.

One property worth knowing: **Aren32 has no muted brown.** Its warm ramp runs
plum → rose → terracotta → orange → peach. A wood floor has to be built from
indices 4–6 with drawn texture doing the work; flat blocks of them read
distinctly rosy, which is why the placeholder floor looks like terracotta tile.

---

## Room and camera

The room is deliberately larger than the screen and you pan around it. Default
is 24×16 tiles (768×512 px), roughly two screens by two.

Because the room scrolls, three things follow:

- **Tile maps, not a background image.** A single hand-drawn 768×512 background
  can't grow and has to be repainted whenever the layout changes. `TileMapLayer`
  (the current node — the old `TileMap` is deprecated) also makes "buy a bigger
  apartment" a change to two numbers.
- **Room size is data.** `data/rooms/*.tres` holds width/height in tiles.
  `scripts/room.gd` paints the layers from it at load, so the tile layers are
  empty in the scene file and there is exactly one source of truth for size.
- **HUD lives on a `CanvasLayer`.** Anything that shouldn't scroll with the
  world — need bars, coins, shop button — must be a child of `HUD`.

**Camera** is click-and-drag panning, clamped by `Camera2D`'s `limit_*` to the
room bounds. Drag is the same gesture with a finger as with a mouse, so this
doesn't quietly lock the game to desktop.

**No zoom for now.** Non-integer zoom destroys pixel crispness. If it's added
later it has to step 1× → 2× → 3× with nothing in between.

**Off-screen cats are a design problem, not a technical one.** In a care sim,
opening the game and not seeing the cat is the failure mode. Planned fix: a row
of cat portraits in the HUD; clicking one calls `Camera.focus_on()`. Simulation
keeps running off-screen regardless — that part is free.

---

## Art plan

### Cats

**Side view only, mirrored with `flip_h`.** Full 4-direction means drawing every
animation four times. Side-on reads fine for a floaty care sim. Add one
front-facing "sitting and looking at you" pose — that's the money shot for a cat
game.

| State | Frames | Notes |
|---|---|---|
| idle  | 2   | breathing bob; 2 frames at 4fps sells it |
| walk  | 4   | |
| sit   | 1–2 | |
| sleep | 2   | curled, slow tail flick |
| eat   | 2–3 | |
| play  | 3–4 | |
| happy | 2   | reaction pop when petted |

About 20 frames for a complete cat. Playback 6–8 fps — cute reads better choppy
than smooth.

**Palette swapping is the multiplier.** Draw one cat, recolour it: orange tabby,
tuxedo, grey, calico, black. Same 20 frames, five distinct cats. Separate PNGs
are fine; the runtime-shader approach is an optimisation for when there are 30
breeds, not 5.

**Format:** one PNG sheet per cat, rows = animation, columns = frames. Becomes
an `AnimatedSprite2D` with a `SpriteFrames` resource, which is text and can be
authored without opening the editor.

### Objects — the actual game

Furniture is simultaneously the reward (you bought it), the content (it does
something), and the expression (you arranged it). Cats are the character;
objects are the game loop.

**Each object is its own scene**, not a tile — it needs a sprite, an interaction
area, placement rules, save state, and possibly its own animation.

Three categories, because they cost different amounts to make:

- **Decor** — rug, poster, plant. Purely visual, cheapest, fine to have lots.
  Small passive happiness bonus so buying it feels like something.
- **Interactive** — scratching post, feather wand, ball, cat tree. The real cost
  is that each one is *two* assets: the object, and the cat animation that
  responds to it.
- **Functional** — food bowl, water, litter box, bed. Wired to the need system.

**Objects are data.** Each is a `Resource` in `data/objects/` carrying name,
sprite, price, footprint, which need it serves, and which cat animation it
triggers. This file is the tuning surface — edit numbers, the game changes, no
code. It's the intended on-ramp to programming: instant feedback, and the
failure mode is "the toy is too cheap", not a stack trace.

### Production notes

- **Drawing tool:** start with [Piskel](https://piskelapp.com) — free, browser,
  drawing within two minutes. Move to Aseprite (~$20) if it sticks; its
  onion-skinning and animation timeline are genuinely better.
- **Placeholder-first.** The game is built against flat colour blocks at correct
  sizes and stays playable at all times. Art drops in by replacing files at
  known paths — no code changes. This decouples drawing pace from progress,
  which matters a lot when the artist is a kid.
- **Free art for gaps:** [Kenney.nl](https://kenney.nl) is CC0 (no attribution
  required). Good for UI icons and furniture. The cats are the part worth having
  in his own hand.

---

## Layout

```
assets/          art, replaceable without touching code
  cats/          one sprite sheet per breed
  objects/
  palette/       Aren32 source files + swatch reference
  room/          tiles_placeholder.png -- flat colour stand-in, replace freely
  ui/
data/            tuning files: numbers, not code
  cats/          breed stats
  objects/       price, footprint, effects
  rooms/         room dimensions
resources/       engine resources (tilesets, sprite frames)
scenes/
scripts/         palette.gd here is generated -- see tools/
tools/           dev-time generators, not shipped
```

## Working with the Godot editor

If a `.tscn` is open in the editor while it's edited on disk, the editor can
overwrite the change on its next save. Close the scene tab (or Project → Reload
Current Project) before external edits, and reopen after.

## Not built yet

Cats, needs/decay, object placement, shop, economy, save/load, day cycle.
