"""Generate favicon.ico and apple-touch-icon.png from an OpenDraw design.

Renders at 1024x1024 then resamples down for crisp small sizes.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw

# Brand colors
YELLOW = (255, 210, 63, 255)     # #FFD23F
RED = (233, 79, 55, 255)         # #E94F37
INK = (26, 26, 24, 255)          # #1A1A18

PUBLIC = Path(__file__).resolve().parent.parent / "public"


def quad_bezier(p0, p1, p2, steps=80):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts.append((x, y))
    return pts


def render(size: int) -> Image.Image:
    """Render the OpenDraw mark at the given size with antialiasing via supersampling."""
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Layout in 64-unit space, then scale to s.
    u = s / 64

    # Rounded square: x=6,y=6,w=52,h=52,rx=10
    pad = 6 * u
    box_size = 52 * u
    radius = 10 * u
    border = 4 * u
    draw.rounded_rectangle(
        (pad, pad, pad + box_size, pad + box_size),
        radius=radius,
        fill=YELLOW,
        outline=INK,
        width=int(border),
    )

    # Sketchy red wave: emulate "M14 42 Q 22 22, 32 34 T 50 28"
    # T means reflected control point: from (32,34) reflect (22,22) => (42, 46)
    p0 = (14 * u, 42 * u)
    c1 = (22 * u, 22 * u)
    p1 = (32 * u, 34 * u)
    c2 = (42 * u, 46 * u)
    p2 = (50 * u, 28 * u)

    stroke_w = int(4.5 * u)
    pts = quad_bezier(p0, c1, p1, steps=120) + quad_bezier(p1, c2, p2, steps=120)
    draw.line(pts, fill=RED, width=stroke_w, joint="curve")
    # Round the line endpoints by capping with circles.
    r = stroke_w / 2
    for px, py in (p0, p2):
        draw.ellipse((px - r, py - r, px + r, py + r), fill=RED)

    # Ink dot upper-right: cx=48, cy=18, r=3.5
    cx, cy, dr = 48 * u, 18 * u, 3.5 * u
    draw.ellipse((cx - dr, cy - dr, cx + dr, cy + dr), fill=INK)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    # Apple touch icon 180x180
    apple = render(180)
    apple.save(PUBLIC / "apple-touch-icon.png", "PNG")
    print(f"Wrote {PUBLIC / 'apple-touch-icon.png'}")

    # ICO with multiple sizes — render each at native size for crispness
    # (PIL's ICO save with `sizes=` resizes from the base image, which loses detail
    # at small sizes; rendering each size from scratch is better.)
    sizes = [16, 24, 32, 48, 64, 128, 256]
    layers = [render(sz) for sz in sizes]
    # Build ICO manually so each entry uses our native-size render.
    layers[-1].save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(sz, sz) for sz in sizes],
    )
    # Re-stitch ICO with the per-size renders.
    import struct
    with open(PUBLIC / "favicon.ico", "wb") as f:
        # ICONDIR
        f.write(struct.pack("<HHH", 0, 1, len(layers)))
        # Reserve dir entries.
        offset = 6 + 16 * len(layers)
        png_blobs = []
        for layer in layers:
            from io import BytesIO
            buf = BytesIO()
            layer.save(buf, format="PNG")
            png_blobs.append(buf.getvalue())
        for layer, blob in zip(layers, png_blobs):
            w = layer.width if layer.width < 256 else 0
            h = layer.height if layer.height < 256 else 0
            # ICONDIRENTRY
            f.write(struct.pack(
                "<BBBBHHII",
                w, h, 0, 0, 1, 32, len(blob), offset,
            ))
            offset += len(blob)
        for blob in png_blobs:
            f.write(blob)
    print(f"Wrote {PUBLIC / 'favicon.ico'}")


if __name__ == "__main__":
    main()
