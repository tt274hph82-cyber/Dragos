"""Design sheet v3 + side-by-side frames against the reference (close-up, window-light room) + the sets."""
import subprocess, sys, pathlib, io
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent)); sys.path.insert(0, str(HERE))
from PIL import Image, ImageFilter
from kit import svg_doc, hand, INK
from finish import finish
import cast3 as C

REF = pathlib.Path('/tmp/claude-0/-home-user-Dragos/da9422b2-8896-571b-854b-006e26f3bc26/scratchpad/ref')


def raster(body, w, h):
    p = HERE / '_tmp3.svg'
    p.write_text(svg_doc(w, h, body))
    return Image.open(io.BytesIO(subprocess.run(['rsvg-convert', '-w', str(w), '-h', str(h), str(p)], check=True, capture_output=True).stdout)).convert('RGBA')


def frame(L, actors='', blur=8):
    bg = raster(L['sky'] + L['back'], 2160, 3840).filter(ImageFilter.GaussianBlur(blur))
    bg.alpha_composite(raster(L['mid'] + L['light'] + L['fore'] + actors, 2160, 3840))
    return finish(bg.convert('RGB'), 0, 2.0).resize((540, 960), Image.LANCZOS)


def put(body, x, y, s):
    return f'<g transform="translate({x:.0f} {y:.0f}) scale({s:.3f})">{body}</g>'


def at(L, X, Z, body, h=1.85):
    """stand a character (local height ~1850 units, feet at origin) on the floor at world (X, Z)"""
    c = L['cam']
    x, y = c.p(X, 0, Z)
    return put(body, x, y, h * c.scale(Z) / 1850)


def label(x, y, t, s=36):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="{s}" fill="#f6efe6">{t}</text>'


# sheet: Lloyd 3 poses + 6 heads (3/4), mother-in-law 3 heads, Mike, hands
SW, SH = 4320, 3000
b = f'<rect width="{SW}" height="{SH}" fill="{C.BLUE_SH}"/>'
for i, (n, col) in enumerate(C.PALETTE):
    b += f'<rect x="{70 + i * 200}" y="50" width="180" height="110" fill="{col}" stroke="{INK}" stroke-width="4"/>' + label(160 + i * 200, 200, n, 26)
b += label(3200, 130, 'DESIGN v3: VOLUME, 3/4 VIEWS, PERSPECTIVE, CAST LIGHT', 52)
for i, (pose, e, k) in enumerate([('stand', 'neutral', 1), ('swing', 'anger', 1), ('shock', 'shock', -1)]):
    x = 360 + i * 660
    b += put(C.lloyd(e, pose, k, f'p{i}'), x, 2780, 0.78) + label(x, 2880, ['LLOYD OLSEN', 'swing', 'shock'][i])
for i, e in enumerate(['neutral', 'blink', 'anger', 'joy', 'smug', 'shock']):
    x, y = 2230 + (i % 3) * 520, 760 + (i // 3) * 800
    b += put(C.lloyd_head(e, 1 if i % 2 == 0 else -1, f'hh{i}'), x, y, 0.82) + label(x, y + 330, e)
for i, e in enumerate(['neutral', 'shock', 'anger']):
    x = 2330 + i * 470
    b += put(C.mil(e, -1 if i != 1 else 1, f'm{i}'), x, 2800, 1.0) + label(x, 2880, f'mother-in-law: {e}', 28)
b += put(C.mike(False, 'mk1'), 3900, 2050, 0.9) + label(3900, 2300, 'MIKE', 30) + put(C.mike(True, 'mk2', 0.6), 3900, 2700, 0.9) + label(3900, 2930, 'MIKE headless', 30)
finish(raster(b, SW, SH).convert('RGB'), 0, 2.0).resize((SW // 2, SH // 2), Image.LANCZOS).save(HERE / 'design3_sheet.png')

# comparison frames
B = C.barnyard()
close = frame(B, put(C.lloyd('neutral', 'stand', 1, 'cl'), 1120, 5600, 2.6), blur=14)
K = C.kitchen()
room = frame(K, at(K, 1.9, 6.6, C.lloyd('smug', 'stand', 1, 'rl')) + at(K, -0.9, 7.6, C.mil('anger', 1, 'rm'), 1.55) + put(C.plate(0, 0, 1, 'rp'), *K['cam'].p(0.0, 0.8, 4.6), 0.55))
cmp_ = Image.new('RGB', (2210, 980), '#111')
for i, im in enumerate([Image.open(REF / 'f013.png').resize((540, 960)), close, Image.open(REF / 'f033.png').resize((540, 960)), room]):
    cmp_.paste(im, (10 + i * 550, 10))
cmp_.save(HERE / 'design3_compare.png')
yard = frame(B, at(B, 1.2, 5.0, C.mike(True, 'ym', 0.5), 0.55) + at(B, -1.0, 6.5, C.lloyd('shock', 'shock', -1, 'yl')))
row = Image.new('RGB', (1100, 980), '#111')
row.paste(yard, (10, 10)); row.paste(room, (550, 10))
row.save(HERE / 'design3_sets.png')
print('ok')
