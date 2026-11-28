"""v4 push: long-lens framing, packed sets, and light that wraps over the characters (the window beam / sun is cast onto
each character's depth plane and the lit part of the figure is tinted peach in the compositor; ink stays dark)."""
import subprocess, sys, pathlib, io
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent)); sys.path.insert(0, str(HERE))
from PIL import Image, ImageFilter, ImageDraw
from kit import svg_doc, shape, ink, ellipse_pts, ticks, dots, glint, INK, FINE
from finish import finish
from persp import Cam, cast_to_plane
import cast3 as C

REF = pathlib.Path('/tmp/claude-0/-home-user-Dragos/da9422b2-8896-571b-854b-006e26f3bc26/scratchpad/ref')
W2, H2 = 2160, 3840
PEACH_RGB = np.array([247, 201, 162], np.float32)


def raster(body):
    p = HERE / '_tmp4.svg'
    p.write_text(svg_doc(W2, H2, body))
    return Image.open(io.BytesIO(subprocess.run(['rsvg-convert', '-w', str(W2), '-h', str(H2), str(p)], check=True, capture_output=True).stdout)).convert('RGBA')


def poly_mask(polys):
    m = Image.new('L', (W2, H2), 0)
    d = ImageDraw.Draw(m)
    for pts in polys:
        d.polygon([(float(x), float(y)) for x, y in pts], fill=255)
    return np.asarray(m, np.float32) / 255


def light_wrap(layer: Image.Image, mask, k=0.55):
    """tint the lit part of a layer peach (flat, hard-edged); ink (dark pixels) is kept"""
    a = np.asarray(layer, np.float32)
    rgb, al = a[..., :3], a[..., 3:] / 255
    lum = rgb.mean(-1, keepdims=True)
    keep = np.clip((lum - 60) / 60, 0, 1)      # dark ink stays dark
    m = (mask[..., None] * keep) * k
    rgb = rgb * (1 - m) + (rgb * 0.35 + PEACH_RGB * 0.65) * m
    return Image.fromarray(np.concatenate([np.clip(rgb, 0, 255), al * 255], -1).astype(np.uint8), 'RGBA')


def put(body, x, y, s):
    return f'<g transform="translate({x:.0f} {y:.0f}) scale({s:.3f})">{body}</g>'


def at(c, X, Z, body, h=1.85):
    x, y = c.p(X, 0, Z)
    return put(body, x, y, h * c.scale(Z) / 1850)


def frame(layers, out):
    """layers: list of (Image RGBA, blur px). Composite, finish, return 540 x 960"""
    base = Image.new('RGBA', (W2, H2), (0, 0, 0, 255))
    for im, bl in layers:
        base.alpha_composite(im.filter(ImageFilter.GaussianBlur(bl)) if bl else im)
    f = finish(base.convert('RGB'), 0, 2.0)
    f.save(out)
    return f.resize((540, 960), Image.LANCZOS)


# ---------------------------------------------------------------- the kitchen, long lens, packed, light wrapping
def kitchen_shot(out):
    cam = Cam(f=2100, horizon=1500, eye=1.3, x=0.7, z=0.6)
    K = C.kitchen('K4', cam)
    c = cam
    X1, WZ0, WZ1, WY0, WY1 = 3.2, 3.0, 5.0, 1.0, 2.4
    corners = [(X1, WY0, WZ0), (X1, WY0, WZ1), (X1, WY1, WZ1), (X1, WY1, WZ0)]
    SUN2 = (-1.0, -0.34, -0.12)   # a lower afternoon sun: the beam crosses the room at chest height
    # the big diagonal light on the left wall, with the mullion cross in shadow
    wl = c.poly([cast_to_plane(q, SUN2, 0, -3.2) for q in corners])
    extra = shape(wl, PEACH_HEX, 'wallLight', line=False, smooth=False, cut=0.5, extra=' fill-opacity="0.92"')
    m1 = [cast_to_plane((X1, WY0, (WZ0 + WZ1) / 2), SUN2, 0, -3.2), cast_to_plane((X1, WY1, (WZ0 + WZ1) / 2), SUN2, 0, -3.2)]
    m2 = [cast_to_plane((X1, (WY0 + WY1) / 2, WZ0), SUN2, 0, -3.2), cast_to_plane((X1, (WY0 + WY1) / 2, WZ1), SUN2, 0, -3.2)]
    extra += ink([c.p(*m1[0]), c.p(*m1[1])], 22, 'wm1', taper=False, color=C.BLUE) + ink([c.p(*m2[0]), c.p(*m2[1])], 22, 'wm2', taper=False, color=C.BLUE)
    # packed set: hanging pots, a calendar 1945, a coat on a hook, a lamp with a glint, a rug, flour sacks, a chair
    for i in range(3):
        x, y = c.p(-0.8 + i * 0.5, 2.6, 8.6)
        extra += ink([(x, y - 140), (x, y)], 4, f'pc{i}', taper=False) + shape(ellipse_pts(x, y + 40, 60 - i * 8, 44 - i * 6, 12, 0, f'pot{i}'), ['#7a7a8e', REDB, '#5a5a70'][i], f'pot{i}', w=4)
    cx_, cy_ = c.p(2.0, 2.1, 8.98)
    extra += shape([(cx_ - 90, cy_ - 110), (cx_ + 90, cy_ - 110), (cx_ + 90, cy_ + 110), (cx_ - 90, cy_ + 110)], '#f6efe6', 'cal', w=4, smooth=False)
    extra += shape([(cx_ - 90, cy_ - 110), (cx_ + 90, cy_ - 110), (cx_ + 90, cy_ - 60), (cx_ - 90, cy_ - 60)], REDB, 'calH', w=3, smooth=False)
    extra += f'<text x="{cx_:.0f}" y="{cy_ + 40:.0f}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="64" fill="{INK}">1945</text>'
    hx, hy = c.p(-2.4, 1.9, 8.98)
    extra += shape([(hx - 60, hy), (hx + 60, hy), (hx + 90, hy + 420), (hx - 90, hy + 420)], '#3a4a2a', 'coat', w=5, smooth=False) + ticks((hx - 70, hy + 40, hx + 70, hy + 400), 16, 22, 2, 1.5, 'coatF', color=INK, op=0.6)
    lx, ly = c.p(0.2, 2.75, 6.0)
    extra += ink([(lx, 0), (lx, ly)], 4, 'lampC', taper=False) + shape([(lx - 80, ly), (lx + 80, ly), (lx + 50, ly + 70), (lx - 50, ly + 70)], '#2f6f5a', 'lampS', w=4, smooth=False) + f'<circle cx="{lx:.0f}" cy="{ly + 80:.0f}" r="22" fill="#ffe6a8"/>' + glint(lx + 30, ly + 74, 22)
    for i in range(2):
        x, y = c.p(-2.6 + i * 0.5, 0, 7.6)
        extra += shape([(x - 90, y), (x - 80, y - 230), (x + 80, y - 236), (x + 90, y)], '#e8dcc0', f'sack{i}', w=4) + f'<text x="{x:.0f}" y="{y - 100:.0f}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="40" fill="{REDB}">FLOUR</text>'
    rug = c.poly([(-1.8, 0.002, 3.2), (1.6, 0.002, 3.2), (1.6, 0.002, 6.4), (-1.8, 0.002, 6.4)])
    rugsvg = shape(rug, REDB, 'rug', w=4, smooth=False) + ink([((rug[0][0] + rug[3][0]) / 2, (rug[0][1] + rug[3][1]) / 2), ((rug[1][0] + rug[2][0]) / 2, (rug[1][1] + rug[2][1]) / 2)], 6, 'rugS', taper=False, color=PEACH_HEX)
    back = raster(K['sky'] + K['back'] + extra)
    mid = raster(rugsvg + K['mid'])
    # characters: Lloyd at the table (big, foreground right), the mother-in-law behind on the left; the plate
    actors = at(c, -0.55, 4.4, C.mil('anger', 1, 'km'), 1.55)
    lloyd = at(c, 0.95, 3.1, C.lloyd('smug', 'stand', 1, 'kl'))
    px, py = c.p(0.0, 0.8, 4.4)
    plate = put(C.plate(0, 0, 1, 'kp'), px, py, c.scale(4.4) / 900 * 0.9)
    A = raster(actors)
    Lr = raster(lloyd + plate)
    # light wrap: the beam cast onto each character's depth plane (the X of where they stand)
    beamL = c.poly([cast_to_plane(q, SUN2, 0, 0.95) for q in corners])
    beamW = c.poly([cast_to_plane(q, SUN2, 0, -0.55) for q in corners])
    Lr = light_wrap(Lr, poly_mask([beamL]), 0.6)
    A = light_wrap(A, poly_mask([beamW]), 0.6)
    return frame([(back, 9), (mid, 2), (A, 0), (Lr, 0)], out)


# ---------------------------------------------------------------- the barnyard close-up, long lens, sun wrapping from the left
def yard_close(out):
    cam = Cam(f=3000, horizon=1900, eye=1.6, x=0.0, z=-6.0)
    B = C.barnyard('B4', cam)
    back = raster(B['sky'] + B['back'])
    mid = raster(B['mid'])
    L = raster(put(C.lloyd('neutral', 'stand', 1, 'cl'), 1180, 5900, 2.55))
    # low sun from the left: everything left of a hard diagonal on the figure is lit peach
    L = light_wrap(L, poly_mask([[(0, 0), (1060, 0), (1500, 1500), (1100, 3840), (0, 3840)]]), 0.5)
    return frame([(back, 16), (mid, 10), (L, 0)], out)


PEACH_HEX = '#f7c9a2'
REDB = C.REDB
if __name__ == '__main__':
    room = kitchen_shot(HERE / 'v4_room_full.png')
    close = yard_close(HERE / 'v4_close_full.png')
    cmp_ = Image.new('RGB', (2210, 980), '#111')
    for i, im in enumerate([Image.open(REF / 'f013.png').resize((540, 960)), close, Image.open(REF / 'f033.png').resize((540, 960)), room]):
        cmp_.paste(im, (10 + i * 550, 10))
    cmp_.save(HERE / 'design4_compare.png')
    print('ok')
