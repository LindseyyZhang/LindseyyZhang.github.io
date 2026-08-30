"""Generate simple flat PNG icons for the extension (no external deps)."""
import struct
import zlib
import math
import os

BG = (0xFA, 0xF5, 0xEF)
LINE = (0x4A, 0x4A, 0x4A)
SAGE = (0xA3, 0xBF, 0xA8)
PINK = (0xE0, 0xA8, 0x99)

def make_png(size, path):
    px = [[BG for _ in range(size)] for _ in range(size)]

    def set_px(x, y, color):
        if 0 <= x < size and 0 <= y < size:
            px[y][x] = color

    def blend_circle(cx, cy, r, color):
        r2 = r * r
        for y in range(max(0, cy - r), min(size, cy + r + 1)):
            for x in range(max(0, cx - r), min(size, cx + r + 1)):
                dx, dy = x - cx, y - cy
                if dx * dx + dy * dy <= r2:
                    set_px(x, y, color)

    margin = size * 0.12
    radius = size / 2 - margin
    cx = cy = size / 2
    blend_circle(int(cx), int(cy), int(radius), (0xFF, 0xFF, 0xFF))
    for y in range(size):
        for x in range(size):
            dx, dy = x - cx, y - cy
            if dx * dx + dy * dy <= radius * radius:
                px[y][x] = BG

    thickness = max(1, size // 20)
    amplitude = size * 0.16
    base_y = size * 0.55
    for x in range(size):
        t = x / size
        y = base_y - amplitude * math.sin(2 * math.pi * t * 1.3)
        for dy in range(-thickness, thickness + 1):
            yy = int(y) + dy
            dx2, dy2 = x - cx, yy - cy
            if dx2 * dx2 + dy2 * dy2 <= radius * radius:
                if abs(dy) <= thickness / 2:
                    set_px(x, yy, LINE)

    ear = max(2, size // 8)
    for i in range(ear):
        w = ear - i
        y = int(size * 0.16) + i
        for dx in range(-w // 2, w // 2 + 1):
            set_px(int(size * 0.30) + dx, y, LINE)
            set_px(int(size * 0.70) + dx, y, LINE)

    dot_r = max(1, size // 16)
    blend_circle(int(size * 0.78), int(size * 0.32), dot_r, PINK)

    raw = bytearray()
    for row in px:
        raw.append(0)
        for (r, g, b) in row:
            raw += bytes((r, g, b))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
    for s in (16, 32, 48, 128):
        make_png(s, os.path.join(out_dir, f"icon{s}.png"))
    print("icons generated")
