"""Generate a deliberately crude placeholder cat, drawn from Aren32.

This exists to prove the pipeline end to end and to give the game something to
move around. It is not art -- it's a blob with ears, and it should look like
one, so nobody is tempted to keep it. Replace the PNGs under assets/cats/tabby/
with real Piskel exports and re-run build_cat_frames.py; no code changes.

Run:  python tools/gen_placeholder_cat.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

from gen_palette import ROOT, load_palette

CELL = 32
OUT = ROOT / "assets" / "cats" / "tabby"

PAL = load_palette()
OUTLINE = PAL[3]
BASE = PAL[15]
SHADE = PAL[6]
BELLY = PAL[8]

# Per-frame leg x offsets, cycling front and back pairs out of phase.
WALK_LEGS = [(0, 0), (2, -2), (0, 0), (-2, 2)]


def draw_cat(bob: int = 0, legs: tuple[int, int] | None = None, sitting: bool = False):
    img = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y = bob

    if sitting:
        d.ellipse([8, 13 + y, 24, 29], fill=BASE, outline=OUTLINE)
        d.ellipse([13, 20 + y, 22, 29], fill=BELLY, outline=None)
        # Tail curled around the base.
        d.arc([4, 22, 16, 30], 90, 270, fill=OUTLINE, width=2)
    else:
        # Tail, drawn first so the body overlaps its root.
        d.arc([2, 8, 14, 24], 90, 260, fill=SHADE, width=3)
        d.arc([2, 8, 14, 24], 90, 260, fill=OUTLINE, width=1)
        if legs:
            front, back = legs
            for lx, off in ((9, back), (13, back), (19, front), (23, front)):
                # Bottom is fixed so legs stay visible when the body bobs.
                d.rectangle([lx + off, 23 + y, lx + off + 2, 29], fill=SHADE,
                            outline=OUTLINE)
        d.ellipse([6, 15 + y, 24, 26 + y], fill=BASE, outline=OUTLINE)
        d.ellipse([10, 21 + y, 21, 26 + y], fill=BELLY, outline=None)

    # Head and ears, shared by every pose.
    hy = (10 if sitting else 9) + y
    d.polygon([(19, hy + 3), (21, hy - 3), (24, hy + 3)], fill=BASE, outline=OUTLINE)
    d.polygon([(25, hy + 3), (28, hy - 3), (29, hy + 3)], fill=BASE, outline=OUTLINE)
    d.ellipse([18, hy, 30, hy + 11], fill=BASE, outline=OUTLINE)
    d.point((26, hy + 5), fill=OUTLINE)
    d.point((26, hy + 6), fill=OUTLINE)
    return img


def strip(frames) -> Image.Image:
    sheet = Image.new("RGBA", (CELL * len(frames), CELL), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * CELL, 0))
    return sheet


def write(name: str, frames):
    out = OUT / f"{name}.png"
    strip(frames).save(out)
    print(f"wrote {out.relative_to(ROOT)} ({len(frames)} frames)")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    write("idle", [draw_cat(bob=0), draw_cat(bob=1)])
    write("walk", [draw_cat(bob=i % 2, legs=l) for i, l in enumerate(WALK_LEGS)])
    write("sit", [draw_cat(sitting=True), draw_cat(bob=1, sitting=True)])
