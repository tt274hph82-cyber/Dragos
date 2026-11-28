"""Design v2, matched to the user's reference look: a cool blue world (cobalt / periwinkle), hot salmon-pink skin with
orange blush, peach window light thrown in hard-edged diagonal shapes, one yellow-green accent and a red-brown accent.
Thin crisp ink; dense stubble dots, many-stroke hair, short fold strokes on cloth. Backgrounds are softly out of focus
behind close-ups (the back layers are blurred when composited). Original cast: nothing is copied from the reference.
Drawing units are 2x (a 1080-wide frame = 2160 units)."""
import math, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from kit import ink, shape, ellipse_pts, tick, ticks, dots, dash_rows, cracks, eye, mouth, hand, glint, INK, FINE, rng

# locked palette: BLUE, SKIN, PEACH, GREEN, REDBROWN (+ the tones the brief allows: skin shade/light, blue lit/shade)
BLUE, SKIN, PEACH, GREEN, REDB = '#4560b0', '#f2908a', '#f7c9a2', '#a3c43e', '#8e2f22'
BLUE_LIT, BLUE_SH, BLUE_DEEP = '#8ea3e2', '#33478e', '#26356e'
SKIN_SH, SKIN_LT, BLUSH = '#e0706a', '#ffb3a6', '#f08a5a'
LILAC = '#e2dcf2'
PALETTE = [('BLUE', BLUE), ('SKIN', SKIN), ('PEACH (light)', PEACH), ('GREEN', GREEN), ('RED-BROWN', REDB), ('blue lit', BLUE_LIT), ('blue shade', BLUE_SH), ('skin shade', SKIN_SH), ('blush', BLUSH)]


def folds(pts_list, name, w=3.0):
    """short cloth fold strokes"""
    return ''.join(ink(p, w, f'{name}{i}', wob=0.4) for i, p in enumerate(pts_list))


# ---------------------------------------------------------------- Lloyd Olsen v2: a huge slab of a farmer, hooked nose, jug ears, frayed straw hat
def lloyd_head(expr='neutral', name='L2'):
    o = ''
    jaw = {'shock': 60, 'joy': 26, 'anger': 12}.get(expr, 0)
    # a massive square slab head; tiny features crowded in the middle
    head = [(-190, -170), (-120, -230), (120, -232), (196, -170), (214, -20), (206, 120 + jaw * 0.5), (170, 236 + jaw), (60, 270 + jaw), (-60, 270 + jaw), (-172, 236 + jaw), (-208, 120 + jaw * 0.5), (-214, -20)]
    o += shape(head, SKIN, name + 'head', w=6)
    o += shape([(120, -232), (196, -170), (214, -20), (206, 120 + jaw * 0.5), (170, 236 + jaw), (110, 260 + jaw), (150, 60), (130, -120)], SKIN_SH, name + 'shade', line=False, smooth=False, cut=0.6)
    # jug ears
    for sd in (-1, 1):
        ex = sd * 212
        o += shape([(ex, -30), (ex + sd * 52, -64), (ex + sd * 66, 0), (ex + sd * 42, 60), (ex, 50)], SKIN if sd < 0 else SKIN_SH, f'{name}ear{sd}', w=5)
        o += ink([(ex + sd * 14, -20), (ex + sd * 40, -34), (ex + sd * 42, 24)], 2.6, f'{name}earin{sd}', color=FINE, op=0.8)
    # orange blush with dots on the cheeks (the reference's flushed skin)
    for sd in (-1, 1):
        o += shape(ellipse_pts(sd * 110, 70, 62, 38, 12, 0, f'{name}bl{sd}', 0.1), BLUSH, f'{name}blush{sd}', line=False, extra=' fill-opacity="0.75"')
        o += dots((sd * 110 - 50, 45, sd * 110 + 50, 100), 14, 2.4, f'{name}bld{sd}', color=REDB, op=0.6)
    # dense stubble: dots and tiny dashes over the jaw, chin and upper lip
    o += dots((-170, 120 + jaw * 0.5, 170, 250 + jaw), 230, 2.3, name + 'stub', color=INK, op=0.75)
    o += ticks((-160, 130 + jaw * 0.5, 160, 240 + jaw), 60, 7, 1.8, 1.4, name + 'stubT', color=INK, op=0.6)
    # forehead lines, bags, nose-to-jowl folds, a second chin
    for i in range(2):
        o += ink([(-90, -150 + i * 20), (0, -158 + i * 20), (90, -150 + i * 20)], 2.8, f'{name}fh{i}', color=FINE, op=0.85)
    for sd in (-1, 1):
        o += ink([(sd * 62 - 22, 2), (sd * 62, 10), (sd * 62 + 22, 2)], 2.4, f'{name}bag{sd}', color=FINE, op=0.8)
        o += ink([(sd * 36, 40), (sd * 72, 110), (sd * 84, 170 + jaw * 0.7)], 3.6, f'{name}fold{sd}')
    o += ink([(-80, 258 + jaw), (0, 280 + jaw), (80, 256 + jaw)], 3.2, name + 'chin2', color=FINE, op=0.85)
    # tiny hooded eyes, close together
    mode = {'blink': 'blink', 'shock': 'shock', 'anger': 'angry'}.get(expr, 'normal')
    lid = {'smug': 0.68, 'joy': 0.6, 'neutral': 0.52}.get(expr, 0.45)
    for sd in (-1, 1):
        o += eye(sd * 44, -24, 15 if expr != 'shock' else 17, (0.3, 0.2) if expr != 'shock' else (0, 0), lid, mode, f'{name}eye{sd}', LILAC, skin=SKIN if sd < 0 else SKIN_SH)
    by = {'anger': 16, 'shock': -26, 'smug': -10, 'joy': -6}.get(expr, 0)
    for sd in (-1, 1):
        inner = by + (16 if expr == 'anger' else 0) - (8 if expr == 'smug' and sd > 0 else 0)
        o += ink([(sd * 82, -58 + by * 0.6), (sd * 50, -66 + by * 0.4), (sd * 18, -58 + inner)], 10, f'{name}brow{sd}')
    # the long hooked nose
    flare = 1.35 if expr == 'anger' else 1.0
    o += shape([(-8, -36), (18, -28), (50, 34), (62, 86), (38, 106), (6, 100), (-16, 86), (-4, 30)], SKIN, name + 'nose', w=5)
    o += shape([(18, -28), (50, 34), (62, 86), (38, 106), (32, 60)], SKIN_SH, name + 'noseSh', line=False)
    o += f'<ellipse cx="{12 - 6 * flare:.0f}" cy="94" rx="{7 * flare:.1f}" ry="4.5" fill="{INK}"/><ellipse cx="36" cy="96" rx="{6 * flare:.1f}" ry="4" fill="{INK}"/>'
    mo = {'shock': ('talk', 0.95), 'joy': ('smile', 0.8), 'anger': ('talk', 0.5), 'smug': ('smug', 0.0)}.get(expr, ('talk', 0.0))
    o += mouth(14, 150 + jaw * 0.55, 104 if expr != 'joy' else 140, mo[1], name + 'mouth', mo[0])
    # sideburns: many fine strokes
    for sd in (-1, 1):
        for i in range(9):
            o += ink([(sd * (196 - i * 3), -150 + i * 10), (sd * (186 - i * 2), -60 + i * 8)], 2.0, f'{name}sb{sd}{i}', color=INK, op=0.8)
    # frayed straw hat, tilted, weave in dash rows
    o += f'<g transform="rotate(-4)">'
    o += shape([(-300, -200), (-180, -246), (190, -246), (310, -200), (220, -170), (-210, -170)], PEACH, name + 'brim', w=5)
    o += shape([(-180, -200), (-166, -380), (-70, -420), (80, -418), (170, -372), (180, -202)], PEACH, name + 'crown', w=5)
    o += shape([(-180, -226), (182, -228), (180, -196), (-180, -196)], REDB, name + 'band', w=4, smooth=False)
    o += dash_rows(-150, 160, -396, 7, 26, 15, 2.0, name + 'weave', color=FINE, slant=0.3, op=0.85)
    for i in range(12):
        o += tick(-296 + i * 52, -196 + (i % 2) * 5, 1.5 + (i % 3) * 0.2, 20, 2.2, f'{name}fray{i}')
    o += '</g>'
    return o


def lloyd_body(name='L2b', pose='stand', axe=False):
    """huge build: barrel chest and belly, red-brown flannel with peach check lines, blue overalls with fold strokes.
    Origin = feet centre; neck top at about -1140."""
    o = ''
    for sd in (-1, 1):   # legs and boots
        o += shape([(sd * 30, -520), (sd * 180, -520), (sd * 170, -60), (sd * 40, -60)], BLUE, f'{name}leg{sd}', w=6)
        o += shape([(sd * 26, -60), (sd * 196, -60), (sd * 210, 0), (sd * 20, 0)], INK, f'{name}boot{sd}', w=4, smooth=False)
        o += folds([[(sd * 70, -300), (sd * 90, -280)], [(sd * 120, -200), (sd * 140, -180)], [(sd * 60, -140), (sd * 84, -126)]], f'{name}lf{sd}')
    o += shape([(20, -520), (180, -520), (170, -60), (110, -60), (120, -300)], BLUE_SH, name + 'legSh', line=False, smooth=False)
    # barrel torso: flannel shirt
    torso = [(-300, -1080), (300, -1080), (360, -820), (330, -520), (-330, -520), (-360, -820)]
    o += shape(torso, REDB, name + 'shirt', w=6)
    for i in range(8):
        x = -280 + i * 80
        o += ink([(x, -1070), (x + 8, -530)], 2.6, f'{name}chkV{i}', taper=False, color=PEACH, op=0.55)
    for j in range(7):
        y = -1040 + j * 76
        o += ink([(-340, y), (340, y)], 2.6, f'{name}chkH{j}', taper=False, color=PEACH, op=0.55)
    # overalls bib over a big belly
    o += shape([(-220, -860), (220, -860), (300, -640), (290, -520), (-290, -520), (-300, -640)], BLUE, name + 'bib', w=6)
    o += shape([(40, -860), (220, -860), (300, -640), (290, -520), (120, -520)], BLUE_SH, name + 'bibSh', line=False, smooth=False)
    o += folds([[(-200, -700), (-160, -690)], [(-120, -600), (-80, -594)], [(140, -720), (170, -700)], [(-40, -760), (0, -770)]], name + 'bf')
    for sd in (-1, 1):
        o += shape([(sd * 150, -1080), (sd * 210, -1080), (sd * 200, -860), (sd * 150, -860)], BLUE, f'{name}strap{sd}', w=4, smooth=False)
        o += f'<circle cx="{sd * 176}" cy="-870" r="12" fill="{PEACH}" stroke="{INK}" stroke-width="3"/>'
    o += shape([(-80, -1160), (80, -1160), (96, -1060), (-96, -1060)], SKIN_SH, name + 'neck', w=5, smooth=False)
    if pose == 'stand':
        for sd in (-1, 1):
            o += shape([(sd * 290, -1060), (sd * 380, -1020), (sd * 400, -620), (sd * 320, -620)], REDB, f'{name}arm{sd}', w=5)
            o += folds([[(sd * 330, -900), (sd * 360, -880)], [(sd * 340, -760), (sd * 370, -750)]], f'{name}af{sd}')
            o += hand(sd * 362, -570, 70, SKIN, SKIN_SH, f'{name}hand{sd}', lit=sd < 0, rot=180, curl=0.5, ring=PEACH if sd > 0 else None)
    elif pose == 'swing':
        for sd in (-1, 1):
            o += shape([(sd * 270, -1060), (sd * 330, -1040), (sd * 140, -1460), (sd * 70, -1440)], REDB, f'{name}armU{sd}', w=5)
        o += hand(-40, -1490, 66, SKIN, SKIN_SH, name + 'hU1', lit=True, rot=-8, curl=0.85)
        o += hand(50, -1515, 66, SKIN, SKIN_SH, name + 'hU2', lit=False, rot=8, curl=0.85, ring=PEACH)
        if axe:
            o += axe_prop(5, -1500, 1.25, -18, name + 'axe')
    elif pose == 'shock':
        for sd in (-1, 1):
            o += shape([(sd * 290, -1060), (sd * 370, -1030), (sd * 560, -1300), (sd * 500, -1340)], REDB, f'{name}armS{sd}', w=5)
            o += hand(sd * 540, -1370, 70, SKIN, SKIN_SH, f'{name}hS{sd}', lit=sd < 0, rot=sd * 28, curl=0.0, ring=PEACH if sd > 0 else None)
    return o


def axe_prop(x, y, s, rot, name):
    """held at the grip (x, y); the blade up and away"""
    o = f'<g transform="translate({x} {y}) rotate({rot}) scale({s}) translate(0 -420)">'
    o += shape([(-12, 0), (12, 0), (14, 420), (-14, 420)], '#b07a3a', name + 'handle', w=4)
    o += ticks((-8, 20, 8, 400), 16, 16, 1.6, 1.57, name + 'grain', color=FINE, spread=0.1, op=0.8)
    o += shape([(-20, -10), (110, -60), (130, 30), (100, 70), (-20, 50)], '#7c88a8', name + 'blade', w=5)
    o += shape([(100, -50), (130, 30), (102, 66), (90, 10)], LILAC, name + 'edge', line=False)
    o += glint(118, -20, 16)
    return o + '</g>'


# ---------------------------------------------------------------- Mike v2 (laced Wyandotte), the mother-in-law v2 (short, tiny, sharp: the thin contrast)
def mike(headless=False, name='M2', step=0.0):
    o = ''
    for sd, ph in ((-1, 0), (1, math.pi)):
        k = math.sin(step + ph) * 22
        o += shape([(sd * 30 - 9, 40), (sd * 30 + 9, 40), (sd * 34 + k + 7, 200), (sd * 34 + k - 7, 200)], PEACH, f'{name}leg{sd}', w=4)
        for t in range(5):
            o += tick(sd * 30 - 7, 66 + t * 26, 0.2, 12, 1.5, f'{name}sc{sd}{t}', color=FINE)
        o += ink([(sd * 34 + k - 44, 206), (sd * 34 + k, 196), (sd * 34 + k + 50, 206)], 9, f'{name}toe{sd}')
    for i in range(6):
        a = -0.8 - i * 0.2
        o += shape([(110, -40), (110 + math.cos(a) * 250, -40 + math.sin(a) * 250), (150 + math.cos(a + 0.22) * 215, -10 + math.sin(a + 0.22) * 215)], BLUE_DEEP, f'{name}tail{i}', w=3)
        o += ink([(120, -40), (110 + math.cos(a) * 215, -40 + math.sin(a) * 215)], 3, f'{name}sheen{i}', color=BLUE_LIT, op=0.8)
    o += shape(ellipse_pts(0, -20, 170, 125, 16, -0.15, name + 'body', 0.05), '#f6efe6', name + 'body', w=5)
    o += shape([(-30, 70), (130, 40), (165, -40), (60, 100)], '#c9cbe6', name + 'bodySh', line=False)
    for j in range(7):
        for i in range(8):
            x, y = -130 + i * 36 + (j % 2) * 18, -96 + j * 28
            if (x / 170) ** 2 + ((y + 20) / 125) ** 2 < 0.82:
                o += ink([(x - 12, y - 4), (x, y + 6), (x + 12, y - 4)], 2.3, f'{name}lace{i}{j}')
    o += shape([(-60, -40), (60, -64), (116, 20), (20, 54), (-54, 20)], '#f6efe6', name + 'wing', w=5)
    o += dash_rows(-40, 96, -30, 3, 22, 18, 2.2, name + 'wingf', slant=0.9)
    o += shape([(-160, -60), (-104, -128), (-62, -60), (-96, 4)], '#f6efe6', name + 'neck', w=5)
    if headless:
        # a tall upright neck ending in a big ruffled stump with a red-brown cap and a stiff tuft: readable from across a room
        o += shape([(-166, -60), (-136, -250), (-64, -250), (-56, -60)], '#f6efe6', name + 'neckU', w=5)
        o += dash_rows(-150, -70, -230, 6, 28, 14, 2.0, name + 'neckF', slant=1.2)
        o += shape(ellipse_pts(-100, -252, 44, 16, 12, 0, name + 'stump'), REDB, name + 'stump', w=4)
        for i in range(7):
            o += tick(-136 + i * 12, -258, -1.2 - (i - 3) * 0.22, 34, 3.2, f'{name}tuft{i}')
    else:
        o += shape(ellipse_pts(-118, -176, 60, 54, 12, 0, name + 'head'), '#f6efe6', name + 'head', w=5)
        o += shape([(-160, -222), (-150, -274), (-130, -240), (-112, -284), (-96, -242), (-78, -274), (-70, -220)], REDB, name + 'comb', w=4, smooth=False)
        o += shape([(-176, -176), (-244, -160), (-176, -150)], PEACH, name + 'beak', w=4, smooth=False)
        o += shape([(-166, -146), (-156, -100), (-138, -142)], REDB, name + 'wattle', w=3)
        o += eye(-130, -186, 11, (-0.6, 0), 0.4, 'normal', name + 'eye', LILAC, skin='#f6efe6')
    return o


def mil(expr='neutral', name='W2'):
    """the mother-in-law: tiny and thin with a sharp pointed face, a tall barbed grey bun, a green cardigan"""
    o = ''
    o += shape([(-90, -40), (90, -40), (120, -520), (0, -560), (-120, -520)], BLUE, name + 'dress', w=5)
    o += ticks((-80, -500, 80, -60), 40, 9, 1.8, 0.3, name + 'dressT', color=BLUE_DEEP, op=0.8)
    o += shape([(-130, -520), (130, -520), (110, -300), (-110, -300)], GREEN, name + 'cardigan', w=5)
    o += dash_rows(-110, 110, -500, 6, 30, 12, 2.0, name + 'knit', color='#5e7a1e', slant=1.3)
    for sd in (-1, 1):
        o += shape([(sd * 110, -500), (sd * 150, -480), (sd * 170, -300), (sd * 130, -290)], GREEN, f'{name}arm{sd}', w=4)
        o += hand(sd * 150, -270, 40, SKIN, SKIN_SH, f'{name}hand{sd}', lit=sd < 0, rot=180, curl=0.6, ring=PEACH if sd > 0 else None)
        o += shape([(sd * 40 - 26, -40), (sd * 40 + 26, -40), (sd * 44 + 30, 0), (sd * 40 - 30, 0)], INK, f'{name}shoe{sd}', w=3, smooth=False)
    # a long pointed face: the opposite build to Lloyd
    face = [(-90, -760), (0, -800), (90, -760), (100, -640), (40, -560), (0, -540), (-40, -560), (-100, -640)]
    o += shape(face, SKIN, name + 'face', w=5)
    o += shape([(20, -790), (90, -760), (100, -640), (40, -560), (40, -680)], SKIN_SH, name + 'fSh', line=False, smooth=False)
    o += shape(ellipse_pts(-50, -640, 24, 14, 10, 0, name + 'bl'), BLUSH, name + 'blush', line=False, extra=' fill-opacity="0.7"')
    bun = [(-80, -770), (-70, -900), (-20, -960), (30, -960), (74, -900), (84, -770)]
    o += shape(bun, '#c7c4d6', name + 'bun', w=5)
    for i in range(10):
        a = math.pi + i / 9 * math.pi
        o += tick(math.cos(a) * 70, -880 + math.sin(a) * 72, a, 16, 2.2, f'{name}barb{i}')
    for i in range(8):
        o += ink([(-60 + i * 16, -770), (-50 + i * 14, -900)], 1.8, f'{name}hs{i}', color=INK, op=0.6)
    mode = {'blink': 'blink', 'shock': 'shock', 'anger': 'angry'}.get(expr, 'normal')
    for sd in (-1, 1):
        o += eye(sd * 28, -690, 11, (0, 0.2), 0.5, mode, f'{name}eye{sd}', LILAC, skin=SKIN if sd < 0 else SKIN_SH)
    o += shape([(-10, -680), (8, -680), (30, -620), (-4, -626)], SKIN_SH, name + 'nose', w=3)
    mo = {'shock': ('talk', 0.9), 'joy': ('smile', 0.6), 'anger': ('talk', 0.4)}.get(expr, ('frown', 0.0))
    o += mouth(0, -590, 56, mo[1], name + 'mouth', mo[0])
    return o


def plate(x, y, s, name):
    o = f'<g transform="translate({x} {y}) scale({s})">'
    o += shape(ellipse_pts(0, 0, 150, 48, 16, 0, name + 'p'), '#f6efe6', name + 'plate', w=4)
    o += shape(ellipse_pts(0, -4, 104, 30, 14, 0, name + 'pi'), PEACH, name + 'inner', w=3)
    o += ink([(180, -64), (200, 44)], 6, name + 'fork') + glint(60, -18, 12)
    return o + '</g>'


def coins(x, y, n, name):
    o = ''
    r = rng(name)
    for i in range(n):
        cx, cy = x + r.uniform(-130, 130), y - i * 12 + r.uniform(-6, 6)
        o += shape(ellipse_pts(cx, cy, 36, 13, 12, 0, f'{name}{i}'), '#e8b84a', f'{name}c{i}', w=3)
    return o + glint(x + 22, y - n * 12 - 6, 18)


# ---------------------------------------------------------------- sets: layers {sky, back, mid, light, fore}; 'light' = the hard-edged sunlight shapes
def window_light(pts, name, op=0.85):
    """a hard-edged peach patch of window/sun light"""
    return shape(pts, PEACH, name, line=False, smooth=False, cut=0.8, extra=f' fill-opacity="{op}"')


def barnyard(W=2160, H=3840, name='BY'):
    """late-afternoon barnyard: a periwinkle sky, a far barn and silo (soft focus), the yard in cool blue shadow with long
    hard-edged peach sun shapes slanting across it, the fence, the chopping block"""
    sky = f'<rect width="{W}" height="{H}" fill="{BLUE_LIT}"/>'
    sky += f'<rect y="1100" width="{W}" height="500" fill="{PEACH}" fill-opacity="0.55"/>'
    back = ''
    back += shape([(-200, 1500), (500, 1260), (900, 1320), (1500, 1220), (2400, 1360), (2400, 1700), (-200, 1700)], '#6f86cc', name + 'hills', w=4)
    back += shape([(120, 1520), (120, 1040), (480, 860), (840, 1040), (840, 1520)], REDB, name + 'barn', w=6, smooth=False)
    back += shape([(480, 860), (840, 1040), (840, 1520), (560, 1520)], BLUE_SH, name + 'barnSh', line=False, smooth=False, extra=' fill-opacity="0.7"')
    for i in range(12):
        back += ink([(140 + i * 58, 1060 if 3 < i < 9 else 1100), (142 + i * 58, 1510)], 3, f'{name}pl{i}', taper=False, op=0.7)
    back += shape([(1600, 1520), (1600, 900), (1700, 840), (1800, 900), (1800, 1520)], '#7d8fc8', name + 'silo', w=5)
    back += shape([(1700, 840), (1800, 900), (1800, 1520), (1720, 1520)], BLUE_SH, name + 'siloSh', line=False, smooth=False)
    for k in range(7):
        back += ink([(1600, 960 + k * 80), (1800, 960 + k * 80)], 2.6, f'{name}ring{k}', taper=False, op=0.6)
    mid = f'<rect x="-200" y="1560" width="{W + 400}" height="{H}" fill="{BLUE}"/>'
    mid += ticks((0, 1600, W, H), 260, 14, 2.0, 0.1, name + 'dirt', color=BLUE_DEEP, spread=0.6, op=0.7)
    for i in range(8):
        x = -40 + i * 170
        mid += shape([(x, 1900), (x + 30, 1900), (x + 28, 1560), (x + 2, 1560)], '#a8744a', f'{name}post{i}', w=4, smooth=False)
        mid += ticks((x + 4, 1580, x + 26, 1880), 6, 18, 1.6, 1.57, f'{name}pg{i}', color=FINE, spread=0.1)
    for y in (1640, 1780):
        mid += shape([(-60, y), (1300, y - 20), (1300, y + 12), (-60, y + 32)], '#b8824e', f'{name}rail{y}', w=4, smooth=False)
    # long hard-edged sun shapes slanting across the yard
    light = window_light([(-200, 2000), (900, 1880), (1400, 2140), (-200, 2420)], name + 'sun1')
    light += window_light([(600, 2600), (2400, 2380), (2400, 2700), (900, 3000)], name + 'sun2')
    light += window_light([(-200, 3100), (1300, 2950), (1700, 3300), (-200, 3600)], name + 'sun3')
    light += ticks((0, 1900, W, 3700), 120, 12, 1.8, 0.2, name + 'dirtL', color='#c98a6a', spread=0.5, op=0.6)
    fore = chopping_block(1080, 2700, 1.15, name + 'block')
    return {'sky': sky, 'back': back, 'mid': mid, 'light': light, 'fore': fore}


def chopping_block(x, y, s, name):
    o = f'<g transform="translate({x} {y}) scale({s})">'
    o += f'<ellipse cx="80" cy="30" rx="360" ry="60" fill="{BLUE_DEEP}" fill-opacity="0.6"/>'
    o += shape([(-260, 0), (-250, -280), (250, -280), (260, 0), (200, 40), (-200, 40)], '#b07a46', name + 'side', w=6, smooth=False)
    o += shape([(40, -280), (250, -280), (260, 0), (200, 40), (80, 30)], BLUE_SH, name + 'sideSh', line=False, smooth=False, extra=' fill-opacity="0.75"')
    o += shape(ellipse_pts(0, -280, 250, 70, 16, 0, name + 'top'), PEACH, name + 'top', w=5)
    for k in range(4):
        e = ellipse_pts(0, -280, 50 + k * 45, 12 + k * 13, 14, 0, f'{name}r{k}')
        o += ink(e + [e[0]], 2.2, f'{name}ring{k}', taper=False, color=FINE, op=0.75)
    o += cracks(-60, -300, 150, name + 'cr', 3, 0.5)
    o += ticks((-240, -250, 240, 0), 46, 22, 2.2, 1.57, name + 'bark', spread=0.1, op=0.8)
    return o + '</g>'


def kitchen(W=2160, H=3840, name='KI'):
    """the farmhouse kitchen in cool blue, one window throwing a hard peach shaft across the wall, table and floor"""
    sky = f'<rect width="{W}" height="{H}" fill="{BLUE}"/>'
    back = ''
    for i in range(9):   # board walls
        back += ink([(i * 260, 0), (i * 260 + 6, 2200)], 3, f'{name}wall{i}', taper=False, color=BLUE_DEEP, op=0.7)
    back += ticks((0, 0, W, 2200), 120, 18, 1.8, 1.57, name + 'wgrain', color=BLUE_DEEP, spread=0.1, op=0.7)
    back += shape([(1300, 500), (1900, 500), (1900, 1200), (1300, 1200)], '#bcd0f2', name + 'win', w=6, smooth=False)
    back += shape([(1300, 500), (1900, 500), (1900, 1200), (1300, 1200)], 'none', name + 'winF', w=6, smooth=False)
    back += ink([(1600, 500), (1600, 1200)], 8, name + 'mull1', taper=False) + ink([(1300, 850), (1900, 850)], 8, name + 'mull2', taper=False)
    back += shape([(1320, 1000), (1880, 960), (1880, 1180), (1320, 1180)], GREEN, name + 'field', line=False, smooth=False, extra=' fill-opacity="0.7"')
    back += f'<circle cx="420" cy="420" r="90" fill="#f6efe6" stroke="{INK}" stroke-width="6"/>' + ink([(420, 420), (420, 350)], 6, name + 'clk1') + ink([(420, 420), (470, 440)], 6, name + 'clk2')
    back += shape([(200, 1300), (700, 1300), (700, 1360), (200, 1360)], '#8a5a3a', name + 'shelf', w=4, smooth=False)
    for i in range(4):
        back += shape([(230 + i * 115, 1300), (300 + i * 115, 1300), (296 + i * 115, 1180), (234 + i * 115, 1180)], ['#f6efe6', PEACH, GREEN, REDB][i], f'{name}jar{i}', w=3)
    mid = f'<rect x="-200" y="2200" width="{W + 400}" height="{H}" fill="{BLUE_SH}"/>'
    for k in range(10):
        mid += ink([(-200, 2240 + k * k * 18), (W + 200, 2240 + k * k * 18)], 3, f'{name}fl{k}', taper=False, color=BLUE_DEEP, op=0.7)
    mid += shape([(300, 2050), (1860, 2050), (1960, 2300), (200, 2300)], '#a8744a', name + 'table', w=6, smooth=False)
    mid += shape([(200, 2300), (1960, 2300), (1960, 2370), (200, 2370)], '#7a4a2a', name + 'tableF', w=5, smooth=False)
    for x in (260, 1900):
        mid += shape([(x - 22, 2370), (x + 22, 2370), (x + 22, 2900), (x - 22, 2900)], '#7a4a2a', f'{name}tleg{x}', w=4, smooth=False)
    # the window's light: a hard peach shaft on the wall, across the table and onto the floor
    light = window_light([(1300, 1200), (1900, 1200), (1500, 2050), (800, 2050)], name + 'shaftW', 0.5)
    light += window_light([(800, 2050), (1500, 2050), (1560, 2300), (760, 2300)], name + 'shaftT', 0.85)
    light += window_light([(700, 2370), (1600, 2370), (1300, 3400), (200, 3400)], name + 'shaftF', 0.6)
    fore = plate(1180, 2180, 1.0, name + 'plate')
    return {'sky': sky, 'back': back, 'mid': mid, 'light': light, 'fore': fore}


def sideshow(W=2160, H=3840, name='SS'):
    """a 1946 sideshow at night: deep blue sky, a moon with a soft halo; the tent's lit faces salmon-pink, its shadow side
    cobalt, split hard; a banner, a lamp with a glint, a plank stage"""
    sky = f'<rect width="{W}" height="{H}" fill="{BLUE_DEEP}"/>'
    sky += f'<circle cx="1720" cy="520" r="280" fill="#e8e2f4" fill-opacity="0.1"/><circle cx="1720" cy="520" r="180" fill="#e8e2f4" fill-opacity="0.16"/>'
    sky += shape(ellipse_pts(1720, 520, 112, 112, 16, 0, name + 'moon'), '#f3eee0', name + 'moon', w=4)
    sky += dots((0, 0, W, 1200), 60, 3, name + 'stars', color='#f3eee0', op=0.8)
    back = shape([(160, 2300), (320, 1100), (1080, 700), (1840, 1100), (2000, 2300)], SKIN, name + 'tent', w=6, smooth=False)
    for i in range(8):
        x0 = 160 + i * 230
        back += shape([(x0, 2300), (1080 + (i - 3.5) * 40, 720), (1080 + (i - 3.0) * 40, 720), (x0 + 115, 2300)], REDB, f'{name}stripe{i}', line=False, smooth=False, extra=' fill-opacity="0.8"')
    back += shape([(1080, 700), (1840, 1100), (2000, 2300), (1300, 2300)], BLUE, name + 'tentSh', line=False, smooth=False, extra=' fill-opacity="0.8"')
    back += shape([(860, 2300), (900, 1600), (1260, 1600), (1300, 2300)], '#141a3a', name + 'flap', w=5, smooth=False)
    back += shape([(380, 1240), (1780, 1240), (1760, 1500), (400, 1500)], '#f6efe6', name + 'banner', w=6, smooth=False)
    back += f'<text x="1080" y="1350" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="104" fill="{REDB}">MIKE</text>'
    back += f'<text x="1080" y="1460" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="70" fill="{BLUE}">THE HEADLESS WONDER CHICKEN</text>'
    mid = f'<rect x="-200" y="2300" width="{W + 400}" height="{H}" fill="#1e2858"/>'
    mid += shape([(300, 2300), (1860, 2300), (1960, 2560), (200, 2560)], '#b07a46', name + 'stage', w=6, smooth=False)
    mid += shape([(200, 2560), (1960, 2560), (1960, 2680), (200, 2680)], '#7a4a2a', name + 'stageF', w=5, smooth=False)
    mid += shape([(1150, 2300), (1860, 2300), (1960, 2560), (1350, 2560)], BLUE, name + 'stageSh', line=False, smooth=False, extra=' fill-opacity="0.65"')
    for i in range(8):
        mid += ink([(320 + i * 200, 2310), (300 + i * 200, 2550)], 3, f'{name}board{i}', taper=False, op=0.8)
    mid += ink([(520, 1100), (520, 1900)], 4, name + 'cord', taper=False)
    mid += shape([(460, 1900), (580, 1900), (560, 1990), (480, 1990)], '#e8b84a', name + 'lamp', w=5, smooth=False)
    light = f'<circle cx="520" cy="1990" r="170" fill="{PEACH}" fill-opacity="0.35"/>' + glint(540, 1950, 26)
    light += window_light([(420, 2300), (900, 2300), (980, 2560), (320, 2560)], name + 'lampPatch', 0.55)
    return {'sky': sky, 'back': back, 'mid': mid, 'light': light, 'fore': ''}
