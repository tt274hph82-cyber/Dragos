"""Design sheet v2 (matched to the reference look) + side-by-side comparison frames against the reference."""
import subprocess, sys, pathlib, io
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent)); sys.path.insert(0, str(HERE))
from PIL import Image, ImageFilter
from kit import svg_doc, hand, INK
from finish import finish
import cast2 as C

REF = pathlib.Path('/tmp/claude-0/-home-user-Dragos/da9422b2-8896-571b-854b-006e26f3bc26/scratchpad/ref')


def raster(svg_body, w, h, transparent=False):
    svg = svg_doc(w, h, svg_body)
    p = HERE / '_tmp.svg'
    p.write_text(svg)
    out = subprocess.run(['rsvg-convert', '-w', str(w), '-h', str(h), str(p)], check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(out)).convert('RGBA')


def compose_set(L, actors='', blur=10, actors_in_light=True):
    """2x frame: sky+back blurred (soft focus), then mid, light shapes, fore, actors"""
    W, H = 2160, 3840
    bg = raster(L['sky'] + L['back'], W, H).filter(ImageFilter.GaussianBlur(blur))
    fg = raster(L['mid'] + L['light'] + L['fore'] + actors, W, H)
    bg.alpha_composite(fg)
    return bg.convert('RGB')


def put(body, x, y, s):
    return f'<g transform="translate({x} {y}) scale({s})">{body}</g>'


def label(x, y, text, size=40, fill='#f6efe6'):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="{size}" fill="{fill}">{text}</text>'


SW, SH = 4320, 2900
b = f'<rect width="{SW}" height="{SH}" fill="{C.BLUE_SH}"/>'
for i, (n, c) in enumerate(C.PALETTE):
    b += f'<rect x="{70 + i * 200}" y="50" width="180" height="110" fill="{c}" stroke="{INK}" stroke-width="4"/>' + label(160 + i * 200, 200, n, 26)
b += label(3200, 130, 'DESIGN v2: MATCHED TO THE REFERENCE LOOK', 56)
for i, (pose, expr, cap) in enumerate([('stand', 'neutral', 'LLOYD OLSEN'), ('swing', 'anger', 'swing'), ('shock', 'shock', 'shock')]):
    x = 330 + i * 640
    g = C.lloyd_body(f'b{i}', pose, axe=pose == 'swing') + f'<g transform="translate(0 -1380) scale(1.0)">{C.lloyd_head(expr, f"h{i}")}</g>'
    b += put(g, x, 2560, 0.82) + label(x, 2640, cap, 36)
for i, e in enumerate(['neutral', 'blink', 'anger', 'joy', 'smug', 'shock']):
    x, y = 2160 + (i % 3) * 470, 720 + (i // 3) * 760
    b += put(C.lloyd_head(e, f'hh{i}'), x, y, 0.82) + label(x, y + 330, e, 34)
b += put(C.mike(False, 'mk1'), 3800, 700, 1.0) + label(3800, 980, 'MIKE (before)', 32)
b += put(C.mike(True, 'mk2', 0.8), 3800, 1380, 1.0) + label(3800, 1660, 'MIKE (headless)', 32)
for i, e in enumerate(['neutral', 'shock', 'joy']):
    x = 2250 + i * 430
    b += put(C.mil(e, f'mi{i}'), x, 2620, 0.95) + label(x, 2690, f'mother-in-law: {e}', 28)
b += put(hand(0, 0, 90, C.SKIN, C.SKIN_SH, 'hL', True, 0, 0.2), 3700, 2350, 1.5) + put(hand(0, 0, 90, C.SKIN, C.SKIN_SH, 'hR', False, 0, 0.2, ring=C.PEACH), 4010, 2350, 1.5) + label(3860, 2520, 'hands: lit / shade', 30)
b += put(C.plate(0, 0, 1, 'pl'), 3800, 2700, 0.8) + put(C.coins(0, 0, 6, 'co'), 4120, 2760, 0.8)
sheet = raster(b, SW, SH).convert('RGB')
finish(sheet, 0, 2.0).resize((SW // 2, SH // 2), Image.LANCZOS).save(HERE / 'design2_sheet.png')

# the three sets, each a 9:16 frame with soft-focus backgrounds and hard light
sets = []
for fn, act in ((C.barnyard, put(C.mike(True, 'sm', 0.5), 1500, 2560, 1.3)), (C.kitchen, put(C.mil('neutral', 'sw'), 560, 2380, 1.2)), (C.sideshow, put(C.mike(True, 'ss', 0.2), 1080, 2300, 1.4))):
    sets.append(finish(compose_set(fn(), act), 0, 2.0).resize((540, 960), Image.LANCZOS))
row = Image.new('RGB', (1650, 980), C.BLUE_SH)
for i, s in enumerate(sets):
    row.paste(s, (10 + i * 550, 10))
row.save(HERE / 'design2_sets.png')

# side by side with the reference: a close-up and a window-light room
close_actors = put(C.lloyd_body('cb', 'stand') + f'<g transform="translate(0 -1380)">{C.lloyd_head("neutral", "ch")}</g>', 1080, 4700, 2.1)
close = finish(compose_set(C.barnyard(), close_actors, blur=16), 0, 2.0).resize((540, 960), Image.LANCZOS)
room = finish(compose_set(C.kitchen(), put(C.lloyd_body('kb', 'stand') + f'<g transform="translate(0 -1380)">{C.lloyd_head("smug", "kh")}</g>', 1500, 3300, 0.95) + put(C.mil('anger', 'km'), 520, 3000, 1.05)), 0, 2.0).resize((540, 960), Image.LANCZOS)
cmp_ = Image.new('RGB', (2210, 980), '#111')
for i, im in enumerate([Image.open(REF / 'f013.png').resize((540, 960)), close, Image.open(REF / 'f033.png').resize((540, 960)), room]):
    cmp_.paste(im, (10 + i * 550, 10))
cmp_.save(HERE / 'design2_compare.png')
close.save(HERE / 'v2_close.png'); room.save(HERE / 'v2_room.png')
print('ok')
