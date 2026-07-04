"""Remove baked-in black backgrounds from feature step PNGs."""
from pathlib import Path

from PIL import Image

DEST = Path(__file__).resolve().parents[1] / "public" / "images" / "features"
FILES = [
    "step-01-brief.png",
    "step-02-memory.png",
    "step-03-parallel.png",
    "step-04-leads.png",
]
THRESH = 32
FEATHER = 40


def main() -> None:
    for name in FILES:
        path = DEST / name
        if not path.exists():
            print(f"skip missing {name}")
            continue
        img = Image.open(path).convert("RGBA")
        px = img.load()
        w, h = img.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                peak = max(r, g, b)
                if peak <= THRESH:
                    px[x, y] = (0, 0, 0, 0)
                elif peak < THRESH + FEATHER:
                    t = (peak - THRESH) / FEATHER
                    px[x, y] = (r, g, b, int(255 * t))
        img.save(path)
        print(f"ok {name} {w}x{h}")


if __name__ == "__main__":
    main()
