"""Turn per-animation PNG strips into a Godot SpriteFrames resource.

Input:   assets/cats/<breed>/<animation>.png   -- one horizontal strip per
         animation, 32px tall, width a multiple of 32. Export straight out of
         Piskel; no sheet assembly needed.
Output:  resources/cats/<breed>.tres           -- SpriteFrames, ready to drop
         on an AnimatedSprite2D.

Also checks every pixel against the Aren32 palette and reports strays, since an
off-palette colour is the one art mistake that's invisible until everything is
side by side.

Run:  python tools/build_cat_frames.py            (all breeds)
      python tools/build_cat_frames.py tabby      (one breed)
"""
import sys
from pathlib import Path

from PIL import Image

from gen_palette import ROOT, load_palette

CELL = 32

# Playback speed per animation. 6-8 fps is right for this style -- cute reads
# better choppy than smooth. Anything not listed falls back to DEFAULT_SPEED.
SPEEDS = {
    "idle": 4.0,
    "walk": 8.0,
    "sit": 4.0,
    "sleep": 2.0,
    "eat": 6.0,
    "play": 8.0,
    "happy": 8.0,
}
DEFAULT_SPEED = 6.0
# Animations that play once and stop rather than looping.
NON_LOOPING = {"happy"}


def check_palette(img: Image.Image, palette, label: str) -> list[str]:
    allowed = set(palette)
    strays = set()
    for _count, (r, g, b, a) in img.convert("RGBA").getcolors(maxcolors=1 << 24):
        if a == 0:
            continue
        if (r, g, b) not in allowed:
            strays.add(f"#{r:02x}{g:02x}{b:02x}")
    if strays:
        shown = ", ".join(sorted(strays)[:8])
        more = f" (+{len(strays) - 8} more)" if len(strays) > 8 else ""
        print(f"  ! {label}: {len(strays)} off-palette colour(s): {shown}{more}")
    return sorted(strays)


def build_breed(breed_dir: Path, palette) -> bool:
    breed = breed_dir.name
    all_pngs = sorted(breed_dir.glob("*.png"))
    # A leading underscore marks reference art -- a base pose to draw from, a
    # colour study, a scratch file. Without this every stray PNG in the folder
    # silently becomes a bogus animation named after the file.
    strips = [p for p in all_pngs if not p.name.startswith("_")]
    if not strips:
        print(f"{breed}: no PNG strips found, skipping")
        return False

    print(f"{breed}:")
    for skipped in (p for p in all_pngs if p.name.startswith("_")):
        print(f"  - {skipped.name} (reference, not an animation)")
    ext_lines, sub_lines, anim_lines = [], [], []
    load_steps = 1

    for strip in strips:
        anim = strip.stem
        img = Image.open(strip)
        if img.height != CELL or img.width % CELL != 0:
            print(
                f"  ! {anim}.png is {img.width}x{img.height}; expected height "
                f"{CELL} and width a multiple of {CELL}. Skipped."
            )
            continue

        count = img.width // CELL
        check_palette(img, palette, f"{anim}.png")

        ext_id = f"{anim}_tex"
        res_path = f"res://{strip.relative_to(ROOT).as_posix()}"
        ext_lines.append(
            f'[ext_resource type="Texture2D" path="{res_path}" id="{ext_id}"]'
        )
        load_steps += 1

        frame_refs = []
        for i in range(count):
            sub_id = f"AtlasTexture_{anim}_{i}"
            sub_lines.append(f'[sub_resource type="AtlasTexture" id="{sub_id}"]')
            sub_lines.append(f'atlas = ExtResource("{ext_id}")')
            sub_lines.append(f"region = Rect2({i * CELL}, 0, {CELL}, {CELL})")
            sub_lines.append("")
            load_steps += 1
            frame_refs.append(
                f'{{\n"duration": 1.0,\n"texture": SubResource("{sub_id}")\n}}'
            )

        anim_lines.append(
            "{\n"
            f'"frames": [{", ".join(frame_refs)}],\n'
            f'"loop": {str(anim not in NON_LOOPING).lower()},\n'
            f'"name": &"{anim}",\n'
            f'"speed": {SPEEDS.get(anim, DEFAULT_SPEED)}\n'
            "}"
        )
        print(f"  {anim}: {count} frame(s)")

    if not anim_lines:
        return False

    out_dir = ROOT / "resources" / "cats"
    out_dir.mkdir(parents=True, exist_ok=True)
    # `_frames` suffix keeps this distinct from data/cats/<breed>.tres, which is
    # the tuning file. Same breed, two very different resources.
    out = out_dir / f"{breed}_frames.tres"
    body = [f'[gd_resource type="SpriteFrames" load_steps={load_steps} format=3]', ""]
    body += ext_lines + [""] + sub_lines
    body += ["[resource]", f"animations = [{', '.join(anim_lines)}]"]
    out.write_text("\n".join(body) + "\n")
    print(f"  -> {out.relative_to(ROOT)}")
    return True


if __name__ == "__main__":
    pal = load_palette()
    cats_root = ROOT / "assets" / "cats"
    wanted = sys.argv[1:]
    dirs = [d for d in sorted(cats_root.iterdir()) if d.is_dir()]
    if wanted:
        dirs = [d for d in dirs if d.name in wanted]
    if not dirs:
        print(f"no breed folders found under {cats_root.relative_to(ROOT)}")
    for d in dirs:
        build_breed(d, pal)
