# Cat Warrior Levels

A single-file HTML character-sheet dashboard for the "Cat Warrior Levels" behavior game
Jacob invented. Two MMORPG-style character sheets, a parent-controlled award panel, and a
"frozen" status effect.

Not a Rieve Fire tool — it lives here for now because this repo is the existing home for
small local Windows utilities. Expected to migrate to a `family-apps` repo once it needs
more file infrastructure.

## The two files

| File | What it is |
| --- | --- |
| `cat-warrior-levels.html` | The live dashboard. Both character sheets, the quest board, parent controls. This is the one that holds the save data. |
| `rank-progression.html` | A read-only show-and-tell page: all ten ranks with their art, how levels are earned, and what Frozen means. Nothing on it changes anyone's progress. |

Double-click either one. That is the whole install. No server, no build step, no internet
connection. Works in Chrome, Edge, or Firefox.

For daily use, pin `cat-warrior-levels.html` to the taskbar or make a desktop shortcut.

`rank-progression.html` has a Jacob / Isaac toggle at the top and prints reasonably, if you
want it on the fridge.

## Portraits

The app looks for these two files:

```
assets/jacob.png
assets/isaac.png
```

If they are present they are used as the character portraits. If they are missing, the app
draws an SVG cat warrior instead — one that already changes helm, armor detail, cape, aura
and frame color as the character ranks up. Either way the app works; drop the images in and
reload to switch.

Square images look best. Anything roughly 400x400 or larger is fine.

## Making it fully standalone

`cat-warrior-levels.html` references the portraits by relative path, so moving the HTML file
alone leaves the portraits behind. To produce a single file with the images baked in:

```powershell
.\embed-assets.ps1
```

That writes `cat-warrior-levels.standalone.html` with both portraits inlined as base64 data
URIs. That one file can be copied anywhere by itself.

## How the game works

### Awards

| Tier | Value | Tasks |
| --- | --- | --- |
| Daily | +50 | Followed Directions all Day |
| Milestone | +10 | Morning chores by 7:30am, evening chores + showers by 6:30pm |
| Quick deed | +2 | Dishes in the sink, feed the cat, read a chapter, play a board game, clean up bedroom |

Each task can be claimed once per day. The board resets at midnight.

### Ranks

Every 500 levels is a new rank, ten ranks total, from Kitten Recruit to Grand Commander of
the Legion. Each rank changes the title, the frame color, the drawn armor, and unlocks
equipment lines on the sheet. Past rank 10 the character collects stars.

At +50/day plus a handful of bonuses, a rank takes roughly a week.

### Streaks

Claiming the daily award on consecutive days builds a streak. Every 5 days in a row adds a
+25 bonus automatically. Missing a day resets the streak; the best-ever streak is kept.

### Frozen

The status effect for when nobody is listening and voices have to be raised.

While frozen:

- The portrait ices over and the sheet shows a FROZEN banner.
- Levels earned still count, but they go into **escrow** instead of the level total.
- A thaw bar tracks the escrow against a goal (default 20 levels).
- When the goal is reached the ice shatters and **every escrowed level is released at once.**

Nothing is ever taken away. The point of the effect is that progress stops until the problem
is fixed, matching the "everyone's day is frozen" idea — not that effort is confiscated.

There are two ways out, and the parent panel presents them as alternatives:

- **Way out #1 — the level target.** A number (default 20). This is a *threshold they have
  to reach*, not an award — they earn it off the normal quest board. The thaw bar on their
  sheet tracks it.
- **Way out #2 — one specific job.** Type a task ("apologize to your brother"). Setting this
  **replaces** the level target entirely; the only way out is the parent clicking
  **Quest Complete — Thaw**. Clear the box and press Set Task to go back to the number.

**Thaw Now** overrides both.

Either way, the escrow is separate from the price of getting out. They keep everything they
earned while frozen.

A freeze never survives the night. At midnight any frozen character auto-thaws and the
escrow is released, so a bad evening never becomes a bad morning.

### Party quest

A shared weekly goal both kids contribute to, so the sheet isn't purely a race between
brothers. Name and goal are editable in parent mode. Resets Monday.

### Parent mode

The award buttons are behind a PIN (default `1234`, changeable in the footer). This is
friction, not security — the PIN is stored in plain text in the save file.

- **Locked (kid view):** read-only sheet plus an "I did it" button per task. **This does not
  award anything** — it files a request. The row turns amber and reads "waiting for a
  parent," a blue banner appears at the top of the page, and the Parent Mode button grows a
  count badge.
- **Unlocked (parent view):** Award / Approve / Deny buttons, custom awards with a reason,
  freeze and thaw controls, per-entry undo on the log, and party quest editing.

So the normal loop is: kid taps **I did it** → parent unlocks → parent taps **Approve**. If
you would rather skip the request step and just award things yourself, stay unlocked and use
the **Award** button on each row.

Pending requests are cleared at midnight along with the rest of the day's board.

## Saving and backups

Progress is stored in the browser's `localStorage` for whatever browser and machine opened
the file. That means:

- Clearing browsing data wipes it.
- Opening the file in a different browser shows a fresh save.

Use **Save Backup** in the footer to download a dated `.json` file, and **Restore Backup** to
load one. The app nags with a banner if it has been more than 7 days since the last backup.
Keep backups somewhere durable.

## Changing the game

Everything tunable is in one config block at the top of the `<script>` in
`cat-warrior-levels.html`:

- `TIER_SIZE` — levels per rank
- `THAW_GOAL_DEFAULT` — default levels needed to break a freeze
- `STREAK_BONUS_EVERY` / `STREAK_BONUS`
- `PARTY_GOAL_DEFAULT`
- `CHARACTERS` — names, cat titles, portrait paths, and the fur/armor color palette used by
  the drawn art
- `AWARDS` — the task list, values, and which attribute each task trains
- `TIERS` — rank titles, accent colors, headgear style, equipment lines
- `BADGES` — the feats and their unlock conditions

Adding a character or a task later will not wipe existing saves — the loader merges old save
files against the current config.

`rank-progression.html` carries its own copy of `CHARACTERS`, `TIERS`, `AWARDS` and the
`catSvg()` art function so it stays standalone. **If you change ranks, tasks, or the art in
the dashboard, paste the new versions into the progression page too** or the two will drift.

## Known limits

- One save per browser profile. No sync between machines; move the JSON backup by hand.
- The PIN is not real security. A kid who opens the file in a text editor can read it.
- The drawn fallback art is deliberately simple; it exists so the app is never broken by a
  missing image, and as the starting point for a fully programmatic portrait later.
