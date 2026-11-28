"""The seven shots of the 10-second scene. shot(i, u) renders shot i at progress u (0..1) as a finished 1080x1920 frame
with its caption burned on after the finish (so the text stays crisp)."""
import sys, pathlib, math
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent)); sys.path.insert(0, str(HERE))
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from kit import shape, ink, ellipse_pts, ticks, dots, tick, glint, INK, FINE
from finish import finish
from persp import Cam, cast_to_plane
from compose4 import raster, put, at, light_wrap, poly_mask, W2, H2, PEACH_HEX
import cast3 as C

FONT = '/home/user/Dragos/videos/what-if-studio/public/fonts/Montserrat-900.woff2'
CAPTIONS = ['A farmer swings his axe.', 'The head hits the dirt.', 'And the rooster walks away.', 'Colorado, 1945.',
            'Lloyd Olsen just wanted dinner.', 'Instead, Mike lived eighteen more months,', 'and made him a fortune.']


def chunks(text, n=3):
    w = text.split()
    return [' '.join(w[i:i + n]) for i in range(0, len(w), n)]


def caption(img, text, dim=False):
    """bold yellow (#ffe21a) with a dark outline, lower middle, 1-3 words"""
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FONT, 78)
    tw = d.textlength(text, font=f)
    x, y = (img.width - tw) / 2, 1300
    col = (255, 226, 26) if not dim else (150, 134, 40)
    d.text((x, y), text, font=f, fill=col, stroke_width=9, stroke_fill=(23, 11, 8))
    return img


def comp(layers):
    base = Image.new('RGBA', (W2, H2), (0, 0, 0, 255))
    for im, bl in layers:
        base.alpha_composite(im.filter(ImageFilter.GaussianBlur(bl)) if bl else im)
    return finish(base.convert('RGB'), 0, 2.0).resize((1080, 1920), Image.LANCZOS)


def rooster_head(name='RH'):
    o = shape(ellipse_pts(0, 0, 70, 60, 12, 0, name + 'h'), '#f6efe6', name + 'head', w=5)
    o += shape([(-40, -50), (-30, -100), (-10, -66), (8, -110), (24, -68), (44, -100), (50, -44)], C.REDB, name + 'comb', w=4, smooth=False)
    o += shape([(-64, -4), (-140, 12), (-64, 26)], C.PEACH, name + 'beak', w=4, smooth=False)
    o += shape([(-54, 30), (-44, 80), (-26, 34)], C.REDB, name + 'wattle', w=3)
    o += ink([(-30, -14), (-14, -6), (2, -14)], 6, name + 'shut')   # eye shut: cartoon, no gore
    return o


def shot(i, u):
    if i == 0:   # CU low angle: Lloyd swings the axe, anger; push in
        cam = Cam(f=2600, horizon=2600, eye=0.9, z=-6.0)
        B = C.barnyard('S1', cam)
        s = 1.45 + 0.2 * u
        L = raster(put(C.lloyd('anger', 'swing', 1, 's1'), 1120, 4250 + 200 * u, s))
        L = light_wrap(L, poly_mask([[(0, 0), (1200, 0), (1500, 2000), (900, 3840), (0, 3840)]]), 0.5)
        return comp([(raster(B['sky'] + B['back']), 18), (raster(B['mid']), 12), (L, 0)])
    if i == 1:   # insert: the head lands by the block, dust ticks; punch-in
        cam = Cam(f=3200, horizon=900, eye=0.6, z=1.5)
        B = C.barnyard('S2', cam)
        bx, by = 1000, 2000 - 260 * math.sin(u * math.pi) * (1 - u)
        sc = 3.6 + 0.4 * u
        prop = put(rooster_head(), bx, by, sc) + ticks((500, 2150, 1600, 2350), 40, 34, 4, -1.2, 'dust', color='#c98a6a', spread=1.0, op=0.8)
        prop += f'<ellipse cx="{bx + 40}" cy="{2260}" rx="{180 * sc}" ry="30" fill="{C.BLUE}" fill-opacity="0.6"/>'
        return comp([(raster(B['sky'] + B['back']), 20), (raster(B['mid'] + B['light']), 6), (raster(B['fore']), 10), (raster(prop), 0)])
    if i == 2:   # wide: headless Mike struts away; Lloyd recoils behind (reaction)
        cam = Cam(f=2500, horizon=1350, eye=0.5, x=0.3 + 0.4 * u, z=0.2)
        B = C.barnyard('S3', cam)
        act = at(cam, -0.6, 6.2, C.lloyd('shock', 'shock', -1, 's3l')) + at(cam, 0.45 + u * 0.4, 2.5, C.mike(True, 's3m', u * 6), 0.95)
        return comp([(raster(B['sky'] + B['back']), 6), (raster(B['mid'] + B['light'] + B['fore']), 0), (raster(act), 0)])
    if i == 3:   # wide establishing: the whole farm; slow orbit and pull back
        cam = Cam(f=1100, horizon=1450, eye=2.4, x=-1.0 + 0.8 * u, z=-4.0 - 2 * u, yaw=0.08 - 0.06 * u)
        B = C.barnyard('S4', cam)
        birds = ''.join(ink([(300 + j * 160 + u * 200, 700 + (j % 2) * 60), (330 + j * 160 + u * 200, 680 + (j % 2) * 60), (360 + j * 160 + u * 200, 700 + (j % 2) * 60)], 5, f'bird{j}') for j in range(4))
        return comp([(raster(B['sky'] + B['back'] + birds), 2), (raster(B['mid'] + B['light'] + B['fore']), 0)])
    if i == 4:   # medium: Lloyd at the table, smug, the empty plate; the mother-in-law behind, angry
        cam = Cam(f=2100, horizon=1500, eye=1.3, x=0.7, z=0.6 + 0.3 * u)
        K = C.kitchen('S5', cam)
        X1, WZ0, WZ1, WY0, WY1 = 3.2, 3.0, 5.0, 1.0, 2.4
        corners = [(X1, WY0, WZ0), (X1, WY0, WZ1), (X1, WY1, WZ1), (X1, WY1, WZ0)]
        SUN2 = (-1.0, -0.34, -0.12)
        A = raster(at(cam, -0.55, 4.4, C.mil('anger', 1, 's5m'), 1.55))
        px, py = cam.p(0.0, 0.8, 4.4)
        Lr = raster(at(cam, 0.95, 3.1, C.lloyd('smug', 'stand', 1, 's5l')) + put(C.plate(0, 0, 1, 's5p'), px, py, cam.scale(4.4) / 900 * 0.9))
        Lr = light_wrap(Lr, poly_mask([cam.poly([cast_to_plane(q, SUN2, 0, 0.95) for q in corners])]), 0.6)
        A = light_wrap(A, poly_mask([cam.poly([cast_to_plane(q, SUN2, 0, -0.55) for q in corners])]), 0.6)
        return comp([(raster(K['sky'] + K['back']), 9), (raster(K['mid']), 2), (A, 0), (Lr, 0)])
    if i == 5:   # wide: Mike on the sideshow stage at night, calendar pages flying; orbit
        L = C.__dict__.get('sideshow')
        from cast2 import sideshow
        S = sideshow()
        pages = ''
        for j in range(6):
            a = u * 3 + j
            x, y = 300 + ((j * 330 + u * 900) % 1600), 600 + (j % 3) * 260 + math.sin(a) * 60
            pages += f'<g transform="translate({x:.0f} {y:.0f}) rotate({a * 40:.0f})">' + shape([(-70, -90), (70, -90), (70, 90), (-70, 90)], '#f6efe6', f'pg{j}', w=4, smooth=False) + shape([(-70, -90), (70, -90), (70, -50), (-70, -50)], C.REDB, f'pgh{j}', w=3, smooth=False) + f'<text x="0" y="40" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="60" fill="{INK}">{["SEP", "DEC", "MAR", "JUN", "SEP", "DEC"][j]}</text></g>'
        act = put(C.mike(True, 's6m', u * 6), 1080 + 120 * math.sin(u * 3), 2330, 1.5)
        return comp([(raster(S['sky'] + S['back']), 5), (raster(S['mid'] + S['light']), 0), (raster(act + pages), 0)])
    if i == 6:   # CU: Lloyd's joy, coins pouring into his hands, a glint
        cam = Cam(f=2600, horizon=2400, eye=1.0, z=-6.0)
        from cast2 import sideshow
        S = sideshow()
        L = raster(put(C.lloyd('joy', 'stand', 1, 's7l'), 1080, 5200, 2.4) + ''.join(put(C.coins(0, 0, 3, f'cn{j}'), [260, 420, 1740, 1900][j % 4], 1500 + ((j * 330 + u * 1600) % 2000), 1.4) for j in range(10)))
        L = light_wrap(L, poly_mask([[(0, 0), (2160, 0), (2160, 900), (0, 2400)]]), 0.35)
        return comp([(raster(S['sky'] + S['back']), 18), (raster(S['mid'] + S['light']), 14), (L, 0)])


if __name__ == '__main__':
    out = HERE / 'shots'
    out.mkdir(exist_ok=True)
    stills = []
    for i in range(7):
        im = shot(i, 0.55)
        im = caption(im, chunks(CAPTIONS[i])[0])
        im.save(out / f'S{i + 1}.png')
        stills.append(im.resize((360, 640), Image.LANCZOS))
    sheet = Image.new('RGB', (7 * 370 + 10, 690), '#111')
    d = ImageDraw.Draw(sheet)
    for i, s in enumerate(stills):
        sheet.paste(s, (10 + i * 370, 10))
        d.text((20 + i * 370, 658), f'S{i + 1}', fill=(255, 226, 26))
    sheet.save(HERE / 'contact_sheet.png')
    print('ok')
