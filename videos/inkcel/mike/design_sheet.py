"""Design sheet: locked palette, Lloyd (body poses + six heads), Mike (with head / headless), the mother-in-law (three
heads), hands, and the two sets. Writes design_sheet.png (finished) next to this file."""
import subprocess, sys, pathlib
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent)); sys.path.insert(0, str(HERE))
from PIL import Image, ImageDraw, ImageFont
from kit import svg_doc, hand, INK
from finish import finish
import cast as C

SW, SH = 4320, 2700   # drawn at 2x, shown at 2160 x 1350


def put(svg_body, x, y, s):
    return f'<g transform="translate({x} {y}) scale({s})">{svg_body}</g>'


def label(x, y, text, size=40):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="{size}" fill="{INK}">{text}</text>'


body = f'<rect width="{SW}" height="{SH}" fill="#efe4cc"/>'
# palette strip
for i, (n, c) in enumerate(C.PALETTE):
    body += f'<rect x="{80 + i * 230}" y="60" width="200" height="120" fill="{c}" stroke="{INK}" stroke-width="4"/>' + label(180 + i * 230, 230, n, 30)
body += label(2700, 150, 'HOW A HEADLESS ROOSTER MADE A FARMER RICH: CAST, SETS, LOCKED PALETTE', 54)
# Lloyd full body: neutral, swing (axe), shock
for i, (arms, expr, cap) in enumerate([('down', 'neutral', 'LLOYD OLSEN: neutral'), ('swing', 'anger', 'swing (axe)'), ('shock', 'shock', 'shock')]):
    x = 300 + i * 520
    g = C.lloyd_body(f'lb{i}', arms, axe=arms == 'swing') + f'<g transform="translate(0 -1250) scale(0.95)">{C.lloyd_head(expr, f"lh{i}")}</g>'
    body += put(g, x, 1780, 0.95) + label(x, 1880, cap, 34)
# six heads
for i, e in enumerate(['neutral', 'blink', 'anger', 'joy', 'smug', 'shock']):
    x = 1830 + (i % 3) * 420
    y = 620 + (i // 3) * 700
    body += put(C.lloyd_head(e, f'hh{i}'), x, y, 0.95) + label(x, y + 300, e, 34)
# Mike with head and headless
body += put(C.mike(False, 'mk1'), 3200, 760, 1.15) + label(3200, 1080, 'MIKE (before)', 34)
body += put(C.mike(True, 'mk2', 0.8), 3800, 760, 1.15) + label(3800, 1080, 'MIKE (headless, strutting)', 34)
# mother-in-law heads
for i, e in enumerate(['neutral', 'shock', 'joy']):
    x = 3000 + i * 400
    body += put(C.mil(e, f'mi{i}'), x, 2080, 0.75) + label(x, 2140, f'mother-in-law: {e}', 30)
# hands: one lit, one in shade (with ring)
body += put(hand(0, 0, 90, C.SKIN, C.SKIN_D, 'hL', True, 0, 0.2), 1900, 2150, 1.4) + put(hand(0, 0, 90, C.SKIN, C.SKIN_D, 'hR', False, 0, 0.2, ring=C.GOLD), 2200, 2150, 1.4) + label(2050, 2320, 'hands: lit / shade', 30)
# props
body += put(C.axe_prop(0, 0, 1, -60, 'axeS'), 2500, 2200, 0.7) + put(C.plate(0, 0, 1, 'plateS'), 2560, 2420, 0.8) + put(C.coins(0, 0, 6, 'coinS'), 2650, 2600, 0.8)
svg = svg_doc(SW, SH, body)
(HERE / 'sheet.svg').write_text(svg)
subprocess.run(['rsvg-convert', '-w', str(SW), '-h', str(SH), str(HERE / 'sheet.svg'), '-o', str(HERE / 'sheet_raw.png')], check=True)
im = finish(Image.open(HERE / 'sheet_raw.png'), 0, 2.0).resize((SW // 2, SH // 2), Image.LANCZOS)
im.save(HERE / 'design_sheet.png')

# sets, each at 1080 x 1920 (rendered at 2x), side by side
sets = []
for fn in (C.farm_day, C.sideshow_night):
    L = fn()
    svgs = svg_doc(2160, 3840, L['sky'] + L['back'] + L['mid'] + L['fore'])
    p = HERE / f'set_{fn.__name__}.svg'
    p.write_text(svgs)
    subprocess.run(['rsvg-convert', '-w', '2160', '-h', '3840', str(p), '-o', str(p.with_suffix('.png'))], check=True)
    sets.append(finish(Image.open(p.with_suffix('.png')), 0, 2.0).resize((540, 960), Image.LANCZOS))
sheet2 = Image.new('RGB', (1100, 980), '#efe4cc')
for i, s in enumerate(sets):
    sheet2.paste(s, (10 + i * 550, 10))
sheet2.save(HERE / 'design_sets.png')
print('ok')
