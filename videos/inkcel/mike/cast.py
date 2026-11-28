"""'How a Headless Rooster Made a Farmer Rich' (Fruita, Colorado, 1945): cast and sets in the hand-inked cel style.

Locked palette (5): COBALT, SKIN (salmon, the whole human cast), CREAM, GOLD, RED. Skin gets one shade tone and one
light tone; sky and shadows are tints of the cobalt. Ink is #170b08, the finest strokes #4d140a.
Drawing units: everything is drawn at 2x (a 1080-wide frame = 2160 units).
"""
import math, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from kit import ink, shape, ellipse_pts, tick, ticks, dots, dash_rows, cracks, plaid, eye, mouth, hand, glint, INK, FINE, rng

COBALT, SKIN, CREAM, GOLD, RED = '#2f4fb0', '#f07a62', '#f3e3c0', '#e3a92e', '#c4301c'
SKIN_D, SKIN_L = '#c8564a', '#ffa88c'
SKY_DAY, SHADE_DAY = '#bfd0ee', '#6b6aa8'          # tints of the cobalt: pale sky, blue-violet shade
NIGHT_LIT, NIGHT_SHADE = '#f2938a', '#26389a'       # night: lit surfaces salmon-pink, shadow cobalt
LILAC = '#ddd2ee'
PALETTE = [('COBALT', COBALT), ('SKIN', SKIN), ('CREAM', CREAM), ('GOLD', GOLD), ('RED', RED), ('skin shade', SKIN_D), ('skin light', SKIN_L)]


# ---------------------------------------------------------------- Lloyd Olsen: tall, thin, a long hooked nose, jug ears, frayed straw hat
def lloyd_head(expr='neutral', name='lloyd'):
    """head drawn around (0, 0) = centre of the face. expr: neutral | blink | anger | joy | shock | smug"""
    o = ''
    jaw = {'shock': 46, 'joy': 22, 'anger': 10}.get(expr, 0)
    # big lumpy head mass with a jaw that drops when the mouth opens
    head = [(-120, -150), (-40, -205), (60, -200), (130, -140), (150, -40), (138, 60 + jaw * 0.4), (100, 150 + jaw), (30, 185 + jaw), (-50, 175 + jaw), (-115, 110 + jaw * 0.5), (-150, 10), (-145, -80)]
    o += shape(head, SKIN, name + 'head', w=7)
    # shade side (hard diagonal) and light on the cheekbone
    o += shape([(40, -195), (130, -140), (150, -40), (138, 60 + jaw * 0.4), (100, 150 + jaw), (60, 170 + jaw), (75, 40), (55, -80)], SKIN_D, name + 'sh', line=False, cut=0.8)
    o += shape(ellipse_pts(-70, 40, 26, 14, 10, -0.3, name + 'cl'), SKIN_L, name + 'cheek', line=False)
    # jug ears
    for sd in (-1, 1):
        ex = sd * 152
        o += shape([(ex, -40), (ex + sd * 48, -70), (ex + sd * 62, -10), (ex + sd * 40, 40), (ex, 30)], SKIN if sd < 0 else SKIN_D, f'{name}ear{sd}', w=6)
        o += ink([(ex + sd * 14, -30), (ex + sd * 38, -40), (ex + sd * 40, 10)], 3, f'{name}earin{sd}', color=FINE, op=0.8)
    # wrinkles that follow the skull: forehead lines, bags under the eyes, nose-to-jowl folds, a second chin
    for i in range(3):
        o += ink([(-80, -120 + i * 18), (-20, -128 + i * 18), (50, -120 + i * 18)], 3.2, f'{name}fh{i}', color=FINE, op=0.85)
    for sd in (-1, 1):
        for j in range(2):
            o += ink([(sd * 70 - 26, -2 + j * 12), (sd * 70, 6 + j * 13), (sd * 70 + 26, -2 + j * 12)], 2.6, f'{name}bag{sd}{j}', color=FINE, op=0.8)
        o += ink([(sd * 30, 30), (sd * 62, 80), (sd * 70, 130 + jaw * 0.8)], 4, f'{name}fold{sd}')
    o += ink([(-50, 168 + jaw), (0, 186 + jaw), (50, 166 + jaw)], 3.4, name + 'chin2', color=FINE, op=0.85)
    # stubble bristles and skin pores (ticks and dots, never hatching)
    o += ticks((-90, 110 + jaw * 0.6, 100, 170 + jaw), 60, 7, 2.0, 1.4, name + 'stub', color=FINE, op=0.75)
    o += dots((-100, -100, 110, 100), 26, 1.8, name + 'pore', color=FINE, op=0.5)
    # eyes: small, crowded to the middle, hooded
    mode = {'blink': 'blink', 'shock': 'shock', 'anger': 'angry'}.get(expr, 'normal')
    lid = {'smug': 0.62, 'joy': 0.55}.get(expr, 0.45)
    for sd in (-1, 1):
        o += eye(sd * 46, -28, 20, (0.4, 0.2) if expr != 'shock' else (0, 0), lid, mode, f'{name}eye{sd}', LILAC, skin=SKIN if sd < 0 else SKIN_D)
    # brows: driven down for anger, up for shock
    by = {'anger': 18, 'shock': -26, 'smug': -6}.get(expr, 0)
    for sd in (-1, 1):
        inner = by + (14 if expr == 'anger' else 0)
        o += ink([(sd * 80, -64 + by * 0.6), (sd * 46, -72 + by * 0.4), (sd * 16, -62 + inner)], 9, f'{name}brow{sd}')
    # the long hooked nose (his feature), flared nostrils when angry
    flare = 1.3 if expr == 'anger' else 1.0
    nose = [(-6, -40), (20, -30), (52, 30), (66, 82), (40, 104), (8, 98 * 1), (-14, 84), (-2, 30)]
    o += shape(nose, SKIN, name + 'nose', w=6)
    o += shape([(20, -30), (52, 30), (66, 82), (40, 104), (34, 60)], SKIN_D, name + 'noseSh', line=False)
    o += f'<ellipse cx="{14 - 6 * flare:.0f}" cy="92" rx="{8 * flare:.1f}" ry="5" fill="{INK}"/><ellipse cx="38" cy="94" rx="{7 * flare:.1f}" ry="4.5" fill="{INK}"/>'
    o += f'<ellipse cx="30" cy="40" rx="7" ry="16" fill="{SKIN_L}" opacity="0.8"/>'
    # mouth: jaw drop for shock, a gum-showing grin for joy, smug half smile, angry snarl
    mo = {'shock': ('talk', 0.9), 'joy': ('smile', 0.75), 'anger': ('talk', 0.45), 'smug': ('smug', 0.0), 'blink': ('talk', 0.0), 'neutral': ('talk', 0.0)}[expr]
    o += mouth(14, 132 + jaw * 0.5, 96 if expr != 'joy' else 130, mo[1], name + 'mouth', mo[0])
    # the frayed straw hat (gold, dashes for the weave)
    o += shape([(-210, -150), (-120, -186), (130, -186), (225, -150), (150, -128), (-150, -128)], GOLD, name + 'brim', w=6)
    o += shape([(-120, -150), (-110, -290), (-40, -320), (60, -318), (118, -282), (124, -152)], GOLD, name + 'crown', w=6)
    o += shape([(-120, -170), (124, -172), (122, -146), (-120, -146)], RED, name + 'band', w=4)
    o += dash_rows(-100, 110, -300, 6, 22, 14, 2.2, name + 'weave', color=FINE, slant=0.3, op=0.8)
    for i in range(9):
        x = -210 + i * 52
        o += tick(x, -146 + (i % 2) * 4, 1.6 + (i % 3) * 0.2, 18, 2.4, f'{name}fray{i}')
    return o


def lloyd_body(name='lloydb', arms='down', axe=False):
    """tall and thin: plaid flannel shirt (red on cream), cobalt overalls; local origin = feet centre, head top at about -1240"""
    o = ''
    # legs (overalls) with plank-like seams and shade split
    for sd in (-1, 1):
        o += shape([(sd * 18, -560), (sd * 90, -560), (sd * 84, -60), (sd * 22, -60)], COBALT, f'{name}leg{sd}', w=6)
        o += shape([(sd * 30 - 20, -60), (sd * 100 + 10, -60), (sd * 110, 0), (sd * 20 - 30, 0)], INK, f'{name}boot{sd}', w=4)
    o += shape([(10, -560), (90, -560), (84, -60), (40, -60)], '#24408f', name + 'legSh', line=False)
    # shirt torso with plaid, clipped
    torso = [(-120, -1010), (120, -1010), (140, -560), (-140, -560)]
    o += f'<clipPath id="{name}cp"><path d="M-120 -1010 L120 -1010 L140 -560 L-140 -560 Z"/></clipPath>'
    o += shape(torso, CREAM, name + 'torso', w=6)
    o += f'<g clip-path="url(#{name}cp)">{plaid(-160, -1020, 160, -540, 46, RED, RED, name + "pl", 4)}</g>'
    # overall bib and straps
    o += shape([(-90, -820), (90, -820), (100, -560), (-100, -560)], COBALT, name + 'bib', w=6)
    o += shape([(-30, -790), (30, -790), (30, -740), (-30, -740)], '#24408f', name + 'pocket', w=3)
    for sd in (-1, 1):
        o += shape([(sd * 60, -1010), (sd * 90, -1010), (sd * 84, -820), (sd * 56, -820)], COBALT, f'{name}strap{sd}', w=4)
        o += f'<circle cx="{sd * 72}" cy="-830" r="9" fill="{GOLD}"/>' + glint(sd * 72 + 3, -834, 5)
    # collar and thin neck
    o += shape([(-34, -1100), (34, -1100), (40, -1000), (-40, -1000)], SKIN_D, name + 'neck', w=5)
    o += shape([(-70, -1012), (0, -985), (70, -1012), (40, -1040), (-40, -1040)], CREAM, name + 'collar', w=4)
    # arms
    if arms == 'down':
        for sd in (-1, 1):
            o += shape([(sd * 110, -1000), (sd * 160, -990), (sd * 170, -640), (sd * 125, -640)], CREAM, f'{name}arm{sd}', w=5)
            o += hand(sd * 150, -600, 46, SKIN, SKIN_D, f'{name}hand{sd}', lit=sd < 0, rot=180, curl=0.5)
    elif arms == 'swing':   # both arms up over the head holding the axe
        for sd in (-1, 1):
            o += shape([(sd * 100, -1000), (sd * 140, -1010), (sd * 70, -1320), (sd * 30, -1300)], CREAM, f'{name}armU{sd}', w=5)
        o += hand(-30, -1340, 44, SKIN, SKIN_D, name + 'hU1', lit=True, rot=-10, curl=0.8)
        o += hand(40, -1360, 44, SKIN, SKIN_D, name + 'hU2', lit=False, rot=10, curl=0.8, ring=GOLD)
        if axe:
            o += axe_prop(5, -1350, 1.0, -20, name + 'axe', grip=True)
    elif arms == 'shock':   # hands flying up and back
        for sd in (-1, 1):
            o += shape([(sd * 110, -1000), (sd * 150, -990), (sd * 290, -1180), (sd * 250, -1210)], CREAM, f'{name}armS{sd}', w=5)
            o += hand(sd * 280, -1220, 46, SKIN, SKIN_D, f'{name}hS{sd}', lit=sd < 0, rot=sd * 30, curl=0.0, ring=GOLD if sd > 0 else None)
    return o


def axe_prop(x, y, s, rot, name, grip=False):
    o = f'<g transform="translate({x} {y}) rotate({rot}) scale({s}) translate(0 {-420 if grip else 0})">'
    o += shape([(-12, 0), (12, 0), (14, 420), (-14, 420)], '#b07a3a', name + 'handle', w=5)
    o += ticks((-8, 20, 8, 400), 14, 16, 1.8, 1.57, name + 'grain', color=FINE, spread=0.1, op=0.8)
    o += shape([(-20, -10), (110, -60), (130, 30), (100, 70), (-20, 50)], '#8a8f9e', name + 'head', w=6)
    o += shape([(100, -50), (130, 30), (102, 66), (90, 10)], '#d8dde8', name + 'edge', line=False)
    o += glint(118, -20, 14)
    return o + '</g>'


# ---------------------------------------------------------------- Mike: a Wyandotte rooster (cream laced feathers, red comb, gold legs)
def mike(headless=False, name='mike', step=0.0):
    o = ''
    # legs (gold) with scale ticks, a strut step
    for sd, ph in ((-1, 0), (1, math.pi)):
        k = math.sin(step + ph) * 20
        o += shape([(sd * 30 - 8, 40), (sd * 30 + 8, 40), (sd * 34 + k + 6, 190), (sd * 34 + k - 6, 190)], GOLD, f'{name}leg{sd}', w=4)
        for t in range(4):
            o += tick(sd * 30 - 6, 70 + t * 28, 0.2, 12, 1.6, f'{name}sc{sd}{t}', color=FINE)
        o += ink([(sd * 34 + k - 40, 196), (sd * 34 + k, 186), (sd * 34 + k + 46, 196)], 9, f'{name}toe{sd}')
    # tail: dark sickle feathers with cobalt sheen
    for i in range(5):
        a = -0.9 - i * 0.22
        o += shape([(110, -40), (110 + math.cos(a) * 230, -40 + math.sin(a) * 230), (150 + math.cos(a + 0.2) * 200, -10 + math.sin(a + 0.2) * 200)], INK, f'{name}tail{i}', w=3)
        o += ink([(118, -40), (110 + math.cos(a) * 200, -40 + math.sin(a) * 200)], 4, f'{name}sheen{i}', color=COBALT, op=0.8)
    # body: a big cream egg with laced feathers (rows of small dashes)
    body = ellipse_pts(0, -20, 160, 120, 16, -0.15, name + 'body', 0.05)
    o += shape(body, CREAM, name + 'body', w=6)
    o += shape([(-40, 60), (120, 40), (150, -40), (60, 90)], '#d9c39a', name + 'bodySh', line=False)
    for j in range(6):
        for i in range(7):
            x, y = -120 + i * 38 + (j % 2) * 19, -90 + j * 30
            if (x / 160) ** 2 + ((y + 20) / 120) ** 2 < 0.8:
                o += ink([(x - 12, y - 4), (x, y + 6), (x + 12, y - 4)], 2.6, f'{name}lace{i}{j}', color=INK)
    # wing
    o += shape([(-60, -40), (60, -60), (110, 20), (20, 50), (-50, 20)], CREAM, name + 'wing', w=5)
    o += dash_rows(-40, 90, -30, 3, 22, 18, 2.4, name + 'wingf', slant=0.9)
    # neck
    o += shape([(-150, -60), (-100, -120), (-60, -60), (-90, 0)], CREAM, name + 'neck', w=5)
    if headless:
        # the neck ends in a ruffled stump with a tuft; perky upright posture
        o += shape([(-150, -60), (-120, -170), (-70, -170), (-60, -60)], CREAM, name + 'neckU', w=5)
        o += shape(ellipse_pts(-95, -172, 30, 12, 10, 0, name + 'stump'), RED, name + 'stump', w=4)
        for i in range(5):
            o += tick(-118 + i * 11, -176, -1.4 - (i - 2) * 0.25, 22, 3, f'{name}tuft{i}')
    else:
        o += shape(ellipse_pts(-110, -170, 58, 52, 12, 0, name + 'head'), CREAM, name + 'head', w=5)
        o += shape([(-150, -215), (-140, -262), (-120, -232), (-104, -272), (-88, -236), (-70, -262), (-64, -212)], RED, name + 'comb', w=4)
        o += shape([(-170, -170), (-232, -156), (-170, -144)], GOLD, name + 'beak', w=4)
        o += shape([(-160, -140), (-150, -96), (-132, -136)], RED, name + 'wattle', w=3)
        o += eye(-122, -180, 11, (-0.6, 0), 0.4, 'normal', name + 'eye', LILAC, skin=CREAM)
    return o


# ---------------------------------------------------------------- the mother-in-law (extra): short and very round, tall pale bun, tiny glasses
def mil(expr='neutral', name='mil'):
    o = ''
    o += shape([(-180, -40), (180, -40), (200, -480), (0, -560), (-200, -480)], COBALT, name + 'dress', w=6)
    o += shape([(-120, -60), (120, -60), (130, -420), (-130, -420)], CREAM, name + 'apron', w=5)
    o += ticks((-110, -400, 110, -80), 26, 10, 2, 0.3, name + 'apronT', color=FINE, op=0.6)
    for sd in (-1, 1):
        o += shape([(sd * 60 - 30, -40), (sd * 60 + 30, -40), (sd * 64 + 34, 0), (sd * 60 - 34, 0)], INK, f'{name}shoe{sd}', w=3)
    # big round head with a second chin and jowls
    for sd in (-1, 1):
        o += shape([(sd * 150, -470), (sd * 200, -440), (sd * 230, -230), (sd * 180, -220)], COBALT, f'{name}arm{sd}', w=5)
        o += hand(sd * 210, -200, 52, SKIN, SKIN_D, f'{name}hand{sd}', lit=sd < 0, rot=180 - sd * 10, curl=0.6, ring=GOLD if sd > 0 else None)
    o += shape(ellipse_pts(0, -700, 200, 185, 16, 0, name + 'head', 0.06), SKIN, name + 'head', w=6)
    o += shape([(60, -800), (150, -700), (120, -580), (40, -560), (80, -680)], SKIN_D, name + 'hSh', line=False)
    o += ink([(-80, -560), (0, -538), (80, -560)], 4, name + 'chin2')
    o += ink([(-110, -640), (-90, -580)], 3, name + 'jowlL', color=FINE)
    # tall pale bun with a barbed edge
    bun = [(-120, -790), (-90, -900), (-40, -960), (40, -960), (90, -900), (120, -790), (60, -820), (-60, -820)]
    o += shape(bun, LILAC, name + 'bun', w=5)
    for i in range(12):
        a = math.pi + i / 11 * math.pi
        o += tick(math.cos(a) * 100, -880 + math.sin(a) * 70, a, 16, 2.4, f'{name}barb{i}')
    mode = {'blink': 'blink', 'shock': 'shock', 'anger': 'angry'}.get(expr, 'normal')
    for sd in (-1, 1):
        o += eye(sd * 34, -700, 14, (0, 0.2), 0.5, mode, f'{name}eye{sd}', LILAC, skin=SKIN if sd < 0 else SKIN_D)
        o += ink(ellipse_pts(sd * 34, -700, 26, 22, 10, 0, f'{name}gl{sd}') + [ellipse_pts(sd * 34, -700, 26, 22, 10, 0, f'{name}gl{sd}')[0]], 3, f'{name}glass{sd}', taper=False)
    o += shape([(-12, -690), (12, -690), (18, -640), (-16, -640)], SKIN_D, name + 'nose', w=3)
    mo = {'shock': ('talk', 0.9), 'joy': ('smile', 0.6), 'anger': ('talk', 0.4)}.get(expr, ('talk', 0.0))
    o += mouth(0, -610, 70, mo[1], name + 'mouth', mo[0])
    return o


def plate(x, y, s, name):
    """a dinner plate with a fork: the dinner Lloyd wanted"""
    o = f'<g transform="translate({x} {y}) scale({s})">'
    o += shape(ellipse_pts(0, 0, 140, 46, 16, 0, name + 'p'), CREAM, name + 'plate', w=5)
    o += shape(ellipse_pts(0, -4, 96, 28, 14, 0, name + 'pi'), '#efd6a8', name + 'inner', w=3)
    o += ink([(170, -60), (190, 40)], 6, name + 'fork')
    return o + '</g>'


def coins(x, y, n, name):
    o = ''
    r = rng(name)
    for i in range(n):
        cx, cy = x + r.uniform(-120, 120), y - i * 10 + r.uniform(-6, 6)
        o += shape(ellipse_pts(cx, cy, 34, 12, 12, 0, f'{name}{i}'), GOLD, f'{name}c{i}', w=3)
    o += glint(x + 20, y - n * 10 - 6, 16)
    return o


# ---------------------------------------------------------------- sets (each a list of depth layers: sky, back, mid, fore)
def farm_day(W=2160, H=3840, name='farm'):
    """the Olsen farm, Fruita, Colorado, by day: pale blue sky, mesas, a red barn (warm sunlit face, blue-violet shade
    split by a hard diagonal), a rail fence, the chopping block with a split and branching cracks, the dirt yard"""
    sky = f'<rect width="{W}" height="{H}" fill="{SKY_DAY}"/>'
    sky += ''.join(shape(ellipse_pts(300 + i * 700, 500 + (i % 2) * 120, 220, 60, 12, 0, f'{name}cl{i}', 0.15), '#e6edf8', f'{name}cloud{i}', w=3) for i in range(3))
    back = shape([(-200, 1500), (300, 1180), (700, 1200), (760, 1120), (1200, 1130), (1260, 1220), (1800, 1240), (2400, 1300), (2400, 1700), (-200, 1700)], '#c9a07a', name + 'mesa', w=5)
    back += shape([(700, 1200), (760, 1120), (1200, 1130), (1260, 1220), (1000, 1400)], SHADE_DAY, name + 'mesaSh', line=False, smooth=False)
    for i in range(6):
        back += ink([(760 + i * 70, 1140), (740 + i * 70, 1220)], 3, f'{name}strata{i}', color=FINE, op=0.7)
    mid = f'<rect x="-200" y="1600" width="{W + 400}" height="{H}" fill="#d9b48a"/>'
    # barn: sunlit front + shaded side, plank seams, grain ticks
    mid += shape([(1200, 1640), (1200, 1060), (1300, 900), (1550, 780), (1800, 900), (1900, 1060), (1900, 1640)], RED, name + 'barn', w=7, smooth=False)
    mid += shape([(1500, 900), (1600, 900), (1600, 1000), (1500, 1000)], '#5a1a22', name + 'loft', w=5, smooth=False)
    mid += shape([(1900, 1000), (2160, 1100), (2160, 1700), (1900, 1640)], '#7a2a3a', name + 'barnSide', w=6, smooth=False)
    for i in range(14):
        mid += ink([(1220 + i * 50, 1010 if i not in range(4, 10) else 900), (1222 + i * 50, 1630)], 3, f'{name}plank{i}', taper=False, color=INK, op=0.8)
    mid += ticks((1210, 1020, 1890, 1620), 70, 14, 2, 1.57, name + 'grain', color=FINE, spread=0.15, op=0.7)
    mid += shape([(1460, 1640), (1460, 1300), (1640, 1300), (1640, 1640)], '#5a1a22', name + 'door', w=6, smooth=False)
    mid += ink([(1460, 1300), (1640, 1640)], 6, name + 'doorX1') + ink([(1640, 1300), (1460, 1640)], 6, name + 'doorX2')
    # fence
    for i in range(7):
        x = 40 + i * 170
        mid += shape([(x, 1700), (x + 26, 1700), (x + 24, 1440), (x + 2, 1440)], '#b07a3a', f'{name}post{i}', w=4, smooth=False)
    for y in (1500, 1600):
        mid += shape([(20, y), (1160, y - 10), (1160, y + 18), (20, y + 26)], '#c58a48', f'{name}rail{y}', w=4, smooth=False)
    # dirt yard ticks and pebbles; the diagonal shadow of the barn across the yard
    mid += shape([(1200, 1640), (2160, 1660), (2160, 2050), (520, 2240)], SHADE_DAY, name + 'yardSh', line=False, smooth=False, extra=' fill-opacity="0.6"')
    mid += ticks((0, 1700, W, H), 220, 14, 2.2, 0.1, name + 'dirt', color=FINE, spread=0.6, op=0.55)
    mid += dots((0, 1700, W, H), 120, 4, name + 'peb', color=INK, op=0.5)
    # chopping block: stump with rings, split, cracks
    fore = chopping_block(1080, 2620, 1.0, name + 'block')
    return {'sky': sky, 'back': back, 'mid': mid, 'fore': fore}


def chopping_block(x, y, s, name):
    o = f'<g transform="translate({x} {y}) scale({s})">'
    o += shape([(-260, 0), (-250, -280), (250, -280), (260, 0), (200, 40), (-200, 40)], '#a8713a', name + 'side', w=7, smooth=False)
    o += shape([(40, -280), (250, -280), (260, 0), (200, 40), (80, 30)], '#6a4a5a', name + 'sideSh', line=False, smooth=False)
    o += shape(ellipse_pts(0, -280, 250, 70, 16, 0, name + 'top'), '#e0b07a', name + 'top', w=6)
    for k in range(4):
        o += ink(ellipse_pts(0, -280, 50 + k * 45, 12 + k * 13, 14, 0, f'{name}r{k}') + [ellipse_pts(0, -280, 50 + k * 45, 12 + k * 13, 14, 0, f'{name}r{k}')[0]], 2.4, f'{name}ring{k}', taper=False, color=FINE, op=0.75)
    o += cracks(-60, -300, 140, name + 'cr', 3, 0.5)
    o += ticks((-240, -250, 240, 0), 40, 22, 2.4, 1.57, name + 'bark', color=INK, spread=0.1, op=0.8)
    return o + '</g>'


def sideshow_night(W=2160, H=3840, name='show'):
    """a 1946 sideshow tent at night: cobalt sky, a pale moon with a soft halo, a red-and-cream striped tent whose lit
    faces are salmon-pink and shaded faces cobalt, a banner, a lamp with a glint, a wooden stage"""
    sky = f'<rect width="{W}" height="{H}" fill="#1d2a6a"/>'
    sky += f'<circle cx="1700" cy="520" r="260" fill="#e8e2f4" fill-opacity="0.12"/><circle cx="1700" cy="520" r="170" fill="#e8e2f4" fill-opacity="0.18"/>'
    sky += shape(ellipse_pts(1700, 520, 110, 110, 16, 0, name + 'moon'), '#f3eee0', name + 'moon', w=4)
    sky += dots((0, 0, W, 1200), 60, 3, name + 'stars', color='#f3eee0', op=0.8)
    back = ''
    # tent: stripes, lit (salmon-pink) left of a hard diagonal, cobalt shade right
    tent = [(160, 2300), (300, 1100), (1080, 700), (1860, 1100), (2000, 2300)]
    back += shape(tent, NIGHT_LIT, name + 'tent', w=7, smooth=False)
    for i in range(8):
        x0 = 160 + i * 230
        back += shape([(x0, 2300), (1080 + (i - 3.5) * 40, 720), (1080 + (i - 3.0) * 40, 720), (x0 + 115, 2300)], RED, f'{name}stripe{i}', line=False)
    back += shape([(1080, 700), (1860, 1100), (2000, 2300), (1300, 2300)], NIGHT_SHADE, name + 'tentSh', line=False, smooth=False, extra=' fill-opacity="0.78"')
    back += shape([(860, 2300), (900, 1600), (1260, 1600), (1300, 2300)], '#1a1030', name + 'flap', w=6, smooth=False)
    # banner
    back += shape([(380, 1240), (1780, 1240), (1760, 1500), (400, 1500)], CREAM, name + 'banner', w=7, smooth=False)
    back += f'<text x="1080" y="1350" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="104" fill="{RED}">MIKE</text>'
    back += f'<text x="1080" y="1460" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="74" fill="{COBALT}">THE HEADLESS WONDER CHICKEN</text>'
    mid = f'<rect x="-200" y="2300" width="{W + 400}" height="{H}" fill="#3a2a5a"/>'
    mid += shape([(300, 2300), (1860, 2300), (1960, 2560), (200, 2560)], '#b07a3a', name + 'stage', w=7, smooth=False)
    mid += shape([(200, 2560), (1960, 2560), (1960, 2680), (200, 2680)], '#7a4a2a', name + 'stageFront', w=6, smooth=False)
    mid += shape([(1150, 2300), (1860, 2300), (1960, 2560), (1350, 2560)], NIGHT_SHADE, name + 'stageSh', line=False, smooth=False, extra=' fill-opacity="0.6"')
    for i in range(8):
        mid += ink([(320 + i * 200, 2310), (300 + i * 200, 2510)], 3, f'{name}board{i}', taper=False, color=INK, op=0.8)
    mid += ticks((300, 2320, 1860, 2500), 60, 16, 2, 0.0, name + 'sgrain', color=FINE, spread=0.15, op=0.7)
    # a hanging lamp with a glint and its warm patch
    mid += ink([(520, 1100), (520, 1900)], 4, name + 'lampCord', taper=False)
    mid += shape([(460, 1900), (580, 1900), (560, 1990), (480, 1990)], GOLD, name + 'lamp', w=5)
    mid += f'<circle cx="520" cy="1990" r="160" fill="#ffd27a" fill-opacity="0.25"/>' + glint(540, 1950, 24)
    fore = ''
    return {'sky': sky, 'back': back, 'mid': mid, 'fore': fore}
