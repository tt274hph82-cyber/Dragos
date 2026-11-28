"""Design v3: three-quarter-view characters with volume (hard cel shade side, segmented arms, big forearms and hands, fold
strokes) and sets modelled in perspective (persp.Cam) with the window/sun light cast geometrically onto floor and table.
Palette and kit as v2 (cast2). Original cast; nothing copied from the reference."""
import math, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from kit import ink, shape, ellipse_pts, tick, ticks, dots, dash_rows, cracks, eye, mouth, hand, glint, INK, FINE, rng
from persp import Cam, cast_to_plane
from cast2 import BLUE, SKIN, PEACH, GREEN, REDB, BLUE_LIT, BLUE_SH, BLUE_DEEP, SKIN_SH, SKIN_LT, BLUSH, LILAC, PALETTE, mike, plate, coins, axe_prop


def F(pts, name, w=3.0):
    """a group of short fold / form strokes"""
    return ''.join(ink(p, w, f'{name}{i}', wob=0.4) for i, p in enumerate(pts))


def mirror(pts, k):
    return [(x * k, y) for x, y in pts]


# ---------------------------------------------------------------- Lloyd, three-quarter view (k = 1 faces screen-left, -1 faces right)
def lloyd_head(expr='neutral', k=1, name='L3', lit=True):
    """slab head turned 3/4: the near cheek is broad, the far side is a narrow hard-shaded band; the near ear shows,
    the far ear is a sliver; features sit toward the facing side"""
    o = ''
    jaw = {'shock': 64, 'joy': 26, 'anger': 12}.get(expr, 0)
    M = lambda pts: mirror(pts, k)
    head = M([(-170, -180), (-100, -238), (110, -236), (200, -176), (224, -30), (214, 110 + jaw * 0.5), (176, 230 + jaw), (60, 276 + jaw), (-70, 262 + jaw), (-150, 200 + jaw), (-186, 90 + jaw * 0.4), (-196, -40)])
    o += shape(head, SKIN, name + 'head', w=6)
    # hard shade on the far side of the slab, under the brow ridge, under the nose, under the jaw
    o += shape(M([(-100, -238), (-170, -180), (-196, -40), (-186, 90 + jaw * 0.4), (-150, 200 + jaw), (-100, 236 + jaw), (-120, 120), (-130, -60)]), SKIN_SH, name + 'farSh', line=False, smooth=False, cut=0.5)
    o += shape(M([(-120, -78), (60, -88), (40, -56), (-110, -52)]), SKIN_SH, name + 'browSh', line=False, smooth=False, extra=' fill-opacity="0.8"')
    if lit:
        o += shape(M([(80, -200), (196, -170), (220, -20), (150, 40), (120, -120)]), SKIN_LT, name + 'lit', line=False, smooth=False, extra=' fill-opacity="0.7"')
    # near ear (big), far ear (sliver)
    o += shape(M([(214, -40), (270, -70), (290, 0), (264, 70), (220, 60)]), SKIN, name + 'earN', w=5)
    o += ink(M([(226, -26), (262, -40), (266, 30), (236, 40)]), 2.6, name + 'earNi', color=FINE, op=0.85)
    o += shape(M([(-196, -20), (-214, -30), (-212, 30), (-194, 40)]), SKIN_SH, name + 'earF', w=4)
    # blush, dense stubble, form lines
    o += shape(ellipse_pts(40 * k, 80, 70, 40, 12, 0, name + 'bl', 0.1), BLUSH, name + 'blush', line=False, extra=' fill-opacity="0.72"')
    o += shape(ellipse_pts(-120 * k, 70, 30, 30, 10, 0, name + 'bl2', 0.1), BLUSH, name + 'blush2', line=False, extra=' fill-opacity="0.6"')
    o += dots((min(-150 * k, 190 * k), 120 + jaw * 0.5, max(-150 * k, 190 * k), 262 + jaw), 280, 2.3, name + 'stub', op=0.78)
    o += ticks((min(-140 * k, 180 * k), 130 + jaw * 0.5, max(-140 * k, 180 * k), 250 + jaw), 80, 7, 1.7, 1.4, name + 'stubT', op=0.6)
    for i in range(3):
        o += ink(M([(-60, -168 + i * 18), (30, -176 + i * 18), (130, -166 + i * 18)]), 2.6, f'{name}fh{i}', color=FINE, op=0.85)
    o += ink(M([(150, -10), (176, 70), (170, 150 + jaw * 0.8)]), 4, name + 'cheekEdge')          # cheekbone form line
    o += ink(M([(-10, 40), (-40, 110), (-44, 176 + jaw * 0.6)]), 3.6, name + 'foldF')
    o += ink(M([(120, 50), (126, 120), (118, 186 + jaw * 0.7)]), 3.6, name + 'foldN')
    o += ink(M([(-60, 250 + jaw), (40, 280 + jaw), (130, 246 + jaw)]), 3, name + 'chin2', color=FINE, op=0.85)
    for j, ex in enumerate((-60, 60)):   # crow's feet
        for t_ in range(3):
            o += tick((ex + (34 if j else -30)) * k, -30 + t_ * 10, (0.3 - t_ * 0.3) if (j == 1) == (k > 0) else (2.8 + t_ * 0.3), 16, 1.6, f'{name}cf{j}{t_}', color=FINE, op=0.85)
    o += ink(M([(170, -150), (186, -90), (180, -40)]), 2.6, name + 'temple', color=FINE, op=0.8)
    o += ink(M([(90, 180 + jaw * 0.8), (40, 196 + jaw * 0.9), (-20, 192 + jaw * 0.9)]), 2.4, name + 'lipLine', color=FINE, op=0.7)
    o += ink(M([(-120, 150 + jaw * 0.6), (-100, 210 + jaw * 0.9)]), 2.6, name + 'jowlF', color=FINE, op=0.8)
    for i in range(10):
        o += ink(M([(-150 + i * 6, -196 + i * 5), (-140 + i * 4, -120 + i * 6)]), 1.7, f'{name}hairF{i}', op=0.7)
    # eyes toward the facing side: the far eye smaller (foreshortened)
    mode = {'blink': 'blink', 'shock': 'shock', 'anger': 'angry'}.get(expr, 'normal')
    lid = {'smug': 0.68, 'joy': 0.6, 'neutral': 0.52}.get(expr, 0.45)
    for j, (ex, s) in enumerate(((-60, 12), (60, 16))):
        o += eye(ex * k, -26, s if expr != 'shock' else s + 3, (-0.5 * k, 0.15) if expr != 'shock' else (0, 0), lid, mode, f'{name}eye{j}', LILAC, skin=SKIN_SH if j == 0 else SKIN)
        o += ink(M([(ex - 18, 4), (ex, 12), (ex + 18, 4)]), 2.2, f'{name}bag{j}', color=FINE, op=0.8)
    by = {'anger': 16, 'shock': -26, 'smug': -10, 'joy': -6}.get(expr, 0)
    for j, ex in enumerate((-60, 60)):
        inner = by + (16 if expr == 'anger' else 0)
        o += ink(M([(ex + 28, -58 + by * 0.6), (ex, -66 + by * 0.4), (ex - 26, -56 + inner)]) if j else M([(ex - 24, -56 + by * 0.6), (ex, -64 + by * 0.4), (ex + 22, -54 + inner)]), 10, f'{name}brow{j}')
    # hooked nose in profile-ish 3/4: it juts toward the facing side
    flare = 1.35 if expr == 'anger' else 1.0
    nose = M([(-20, -40), (-50, 10), (-90, 70), (-80, 100), (-40, 108), (-10, 96), (0, 40)])
    o += shape(nose, SKIN, name + 'nose', w=5)
    o += shape(M([(-20, -40), (0, 40), (-10, 96), (-40, 108), (-30, 60)]), SKIN_SH, name + 'noseSh', line=False, smooth=False)
    o += f'<ellipse cx="{-58 * k:.0f}" cy="100" rx="{8 * flare:.1f}" ry="4.5" fill="{INK}"/>'
    o += shape(M([(-60, 112), (20, 116), (10, 128), (-56, 124)]), SKIN_SH, name + 'noseCast', line=False, smooth=False, extra=' fill-opacity="0.8"')
    mo = {'shock': ('talk', 0.95), 'joy': ('smile', 0.8), 'anger': ('talk', 0.5), 'smug': ('smug', 0.0)}.get(expr, ('talk', 0.0))
    o += mouth(-14 * k, 158 + jaw * 0.55, 100 if expr != 'joy' else 132, mo[1], name + 'mouth', mo[0])
    # hair under the hat: many fine strokes at the near temple and over the near ear
    for i in range(14):
        o += ink(M([(150 + i * 4, -190 + i * 6), (176 + i * 3, -100 + i * 7)]), 1.9, f'{name}hair{i}', op=0.85)
    # straw hat in 3/4: an ellipse brim, the crown offset, weave dashes, fray
    o += f'<g transform="rotate({-5 * k})">'
    o += shape(ellipse_pts(20 * k, -210, 330, 62, 18, 0, name + 'brimE'), PEACH, name + 'brim', w=5)
    o += shape(M([(-180, -226), (-160, -390), (-60, -430), (100, -426), (190, -380), (210, -224)]), PEACH, name + 'crown', w=5)
    o += shape(M([(-160, -390), (-60, -430), (-40, -230), (-180, -226)]), '#e0a88a', name + 'crownSh', line=False, smooth=False, extra=' fill-opacity="0.85"')
    o += shape(M([(-182, -250), (210, -248), (210, -216), (-182, -218)]), REDB, name + 'band', w=4, smooth=False)
    o += dash_rows(-150, 180, -404, 7, 25, 14, 1.9, name + 'weave', color=FINE, slant=0.3, op=0.85)
    for i in range(14):
        a = i / 13 * math.pi
        o += tick(20 * k + math.cos(a + math.pi) * 330, -210 + math.sin(a) * 62, math.pi / 2 + (i % 3 - 1) * 0.3, 18, 2.2, f'{name}fray{i}')
    o += '</g>'
    return o


def lloyd_body(name='L3b', pose='stand', k=1):
    """huge barrel body in 3/4: the near shoulder and arm bigger, the far side in shade, fold strokes everywhere.
    Origin = feet centre; the head sits on (0, -1400) scaled 1.0."""
    o = ''
    M = lambda pts: mirror(pts, k)
    # legs (overalls), boots
    for j, (x0, x1) in enumerate(((-190, -40), (20, 190))):
        o += shape(M([(x0, -540), (x1, -540), (x1 - 10, -70), (x0 + 10, -70)]), BLUE if j else BLUE_SH, f'{name}leg{j}', w=6)
        o += shape(M([(x0 - 6, -70), (x1 + 24, -70), (x1 + 36, 0), (x0 - 10, 0)]), INK, f'{name}boot{j}', w=4, smooth=False)
        o += F([M([(x0 + 40, -320), (x0 + 70, -300)]), M([(x0 + 60, -200), (x0 + 96, -186)]), M([(x0 + 30, -140), (x0 + 60, -130)])], f'{name}lf{j}')
    # barrel torso: flannel, far side shade
    torso = M([(-280, -1120), (250, -1140), (350, -900), (360, -620), (300, -520), (-300, -520), (-340, -700), (-330, -980)])
    o += shape(torso, REDB, name + 'shirt', w=6)
    o += shape(M([(-280, -1120), (-60, -1130), (-90, -520), (-300, -520), (-340, -700), (-330, -980)]), '#6a2018', name + 'shirtSh', line=False, smooth=False)
    for i in range(8):
        x = -260 + i * 80
        o += ink(M([(x, -1110), (x + 20, -540)]), 2.4, f'{name}chkV{i}', taper=False, color=PEACH, op=0.45)
    for j in range(7):
        y = -1070 + j * 78
        o += ink(M([(-330, y + 10), (350, y - 10)]), 2.4, f'{name}chkH{j}', taper=False, color=PEACH, op=0.45)
    # overall bib over the belly, buckles, bib pocket, fold strokes
    o += shape(M([(-200, -880), (230, -890), (320, -680), (300, -520), (-280, -520), (-300, -660)]), BLUE, name + 'bib', w=6)
    o += shape(M([(-200, -880), (-20, -884), (-60, -520), (-280, -520), (-300, -660)]), BLUE_SH, name + 'bibSh', line=False, smooth=False)
    o += shape(M([(-10, -840), (130, -846), (126, -740), (-6, -736)]), BLUE_SH, name + 'pocket', w=3, smooth=False)
    o += F([M([(-220, -700), (-180, -690)]), M([(-150, -610), (-110, -600)]), M([(160, -720), (200, -700)]), M([(60, -640), (100, -636)]), M([(240, -620), (270, -600)])], name + 'bf')
    for j, x in enumerate((-150, 190)):
        o += shape(M([(x - 30, -1130), (x + 30, -1134), (x + 26, -880), (x - 26, -878)]), BLUE if j else BLUE_SH, f'{name}strap{j}', w=4, smooth=False)
        o += f'<circle cx="{x * k}" cy="-890" r="13" fill="{PEACH}" stroke="{INK}" stroke-width="3"/>'
    o += shape(M([(-90, -1210), (90, -1210), (110, -1110), (-100, -1110)]), SKIN_SH, name + 'neck', w=5, smooth=False)
    o += shape(M([(-130, -1130), (0, -1080), (150, -1130), (100, -1170), (-90, -1170)]), REDB, name + 'collar', w=4, smooth=False)
    o += shape(M([(-40, -1090), (0, -1060), (-70, -1040)]), '#6a2018', name + 'collarPtF', w=3, smooth=False) + shape(M([(40, -1090), (0, -1060), (90, -1036)]), REDB, name + 'collarPtN', w=3, smooth=False)
    o += F([M([(180, -1100), (240, -1060)]), M([(200, -1070), (250, -1030)]), M([(-200, -1090), (-250, -1050)]), M([(260, -980), (300, -930)]), M([(-260, -980), (-296, -930)]), M([(120, -1040), (150, -990)]), M([(-110, -1030), (-140, -990)])], name + 'shF', 3.2)
    if pose == 'stand':
        # far arm (shade, behind), near arm big with a thick forearm and a fold at the elbow
        o += shape(M([(-300, -1080), (-380, -1040), (-400, -800), (-380, -620), (-320, -620), (-320, -840)]), '#6a2018', name + 'armF', w=5)
        o += hand(-350 * k, -570, 64, SKIN, SKIN_SH, name + 'handF', lit=False, rot=180, curl=0.55)
        o += shape(M([(260, -1110), (380, -1060), (420, -860), (400, -840), (430, -640), (330, -620), (320, -840), (300, -880)]), REDB, name + 'armN', w=5)
        o += F([M([(330, -860), (380, -846)]), M([(340, -890), (370, -880)]), M([(350, -760), (400, -750)])], name + 'elb')
        o += hand(380 * k, -566, 78, SKIN, SKIN_SH, name + 'handN', lit=True, rot=180, curl=0.5, ring=PEACH)
    elif pose == 'swing':
        o += shape(M([(-280, -1080), (-340, -1060), (-150, -1480), (-80, -1460)]), '#6a2018', name + 'armUF', w=5)
        o += shape(M([(250, -1110), (330, -1090), (130, -1500), (60, -1480)]), REDB, name + 'armUN', w=5)
        o += F([M([(220, -1260), (260, -1250)]), M([(-200, -1250), (-170, -1240)])], name + 'sf')
        o += hand(-30 * k, -1520, 70, SKIN, SKIN_SH, name + 'hU1', lit=False, rot=-8, curl=0.85)
        o += hand(60 * k, -1546, 70, SKIN, SKIN_SH, name + 'hU2', lit=True, rot=8, curl=0.85, ring=PEACH)
        o += axe_prop(10 * k, -1530, 1.3, -18 * k, name + 'axe')
    elif pose == 'shock':
        o += shape(M([(-300, -1080), (-380, -1050), (-560, -1320), (-500, -1360)]), '#6a2018', name + 'armSF', w=5)
        o += shape(M([(260, -1110), (360, -1070), (580, -1300), (520, -1350)]), REDB, name + 'armSN', w=5)
        o += hand(-540 * k, -1390, 70, SKIN, SKIN_SH, name + 'hSF', lit=False, rot=-28 * k, curl=0.0)
        o += hand(560 * k, -1390, 80, SKIN, SKIN_SH, name + 'hSN', lit=True, rot=28 * k, curl=0.0, ring=PEACH)
    return o


def lloyd(expr='neutral', pose='stand', k=1, name='L3'):
    return lloyd_body(name + 'b', pose, k) + f'<g transform="translate({-30 * k} -1420)">{lloyd_head(expr, k, name + "h")}</g>'


# ---------------------------------------------------------------- the mother-in-law in 3/4: tiny, thin, a long pointed face, a tall barbed bun
def mil(expr='neutral', k=-1, name='W3'):
    o = ''
    M = lambda pts: mirror(pts, k)
    o += shape(M([(-90, -40), (100, -40), (130, -520), (0, -560), (-110, -520)]), BLUE, name + 'dress', w=5)
    o += shape(M([(-90, -40), (0, -40), (-20, -540), (-110, -520)]), BLUE_SH, name + 'dressSh', line=False, smooth=False)
    o += F([M([(-30, -300), (-10, -200)]), M([(40, -260), (60, -160)]), M([(10, -140), (30, -60)])], name + 'df', 2.6)
    o += shape(M([(-130, -540), (140, -540), (120, -300), (-110, -300)]), GREEN, name + 'cardigan', w=5)
    o += shape(M([(-130, -540), (-10, -540), (-30, -300), (-110, -300)]), '#6f8c24', name + 'cardSh', line=False, smooth=False)
    o += dash_rows(-110, 120, -520, 7, 28, 11, 1.9, name + 'knit', color='#4e6614', slant=1.3)
    for j, sd in enumerate((-1, 1)):
        o += shape(M([(sd * 120, -520), (sd * 160, -500), (sd * 176, -300), (sd * 136, -290)]), GREEN if j else '#6f8c24', f'{name}arm{j}', w=4)
        o += hand(sd * 156 * k, -268, 40, SKIN, SKIN_SH, f'{name}hand{j}', lit=j == 1, rot=180, curl=0.6, ring=PEACH if j else None)
        o += shape(M([(sd * 44 - 26, -40), (sd * 44 + 30, -40), (sd * 48 + 36, 0), (sd * 44 - 30, 0)]), INK, f'{name}shoe{j}', w=3, smooth=False)
    face = M([(-70, -770), (10, -806), (90, -762), (104, -650), (20, -560), (-30, -546), (-60, -580), (-86, -660)])
    o += shape(face, SKIN, name + 'face', w=5)
    o += shape(M([(-70, -770), (-20, -790), (-40, -580), (-60, -580), (-86, -660)]), SKIN_SH, name + 'fSh', line=False, smooth=False)
    o += shape(ellipse_pts(40 * k, -640, 26, 14, 10, 0, name + 'bl'), BLUSH, name + 'blush', line=False, extra=' fill-opacity="0.7"')
    bun = M([(-70, -776), (-60, -910), (-10, -970), (40, -968), (84, -900), (92, -770)])
    o += shape(bun, '#c7c4d6', name + 'bun', w=5)
    for i in range(10):
        a = math.pi + i / 9 * math.pi
        o += tick((10 + math.cos(a) * 74) * k, -884 + math.sin(a) * 76, a if k > 0 else math.pi - a, 16, 2.2, f'{name}barb{i}')
    for i in range(10):
        o += ink(M([(-50 + i * 14, -776), (-40 + i * 12, -910)]), 1.7, f'{name}hs{i}', op=0.6)
    mode = {'blink': 'blink', 'shock': 'shock', 'anger': 'angry'}.get(expr, 'normal')
    for j, (ex, s) in enumerate(((-20, 9), (46, 11))):
        o += eye(ex * k, -690, s, (0.4 * k, 0.2), 0.5, mode, f'{name}eye{j}', LILAC, skin=SKIN_SH if j == 0 else SKIN)
    o += shape(M([(10, -690), (60, -628), (30, -622)]), SKIN, name + 'nose', w=3, smooth=False)
    mo = {'shock': ('talk', 0.9), 'joy': ('smile', 0.6), 'anger': ('talk', 0.45)}.get(expr, ('frown', 0.0))
    o += mouth(20 * k, -594, 52, mo[1], name + 'mouth', mo[0])
    o += ink(M([(-30, -600), (-16, -570)]), 2.4, name + 'mfold', color=FINE)
    return o


# ---------------------------------------------------------------- sets in perspective
SUN_K = (-1.0, -0.62, -0.18)   # kitchen: sun enters the right-wall window travelling left and down


def kitchen(name='K3', cam=None):
    """one-point perspective farmhouse kitchen: board walls, floor boards converging, ceiling beams; a window in the right
    wall throws a hard peach shape across the floor and the table top (cast along SUN_K)"""
    c = cam or Cam(f=1150, horizon=1650, eye=1.55, z=0.0)
    L = {'sky': '', 'back': '', 'mid': '', 'light': '', 'fore': ''}
    X0, X1, Y1, Z0, Z1 = -3.2, 3.2, 3.0, 1.2, 9.0
    P = c.poly
    wall_back = P([(X0, 0, Z1), (X1, 0, Z1), (X1, Y1, Z1), (X0, Y1, Z1)])
    wall_l = P([(X0, 0, Z0), (X0, 0, Z1), (X0, Y1, Z1), (X0, Y1, Z0)])
    wall_r = P([(X1, 0, Z0), (X1, 0, Z1), (X1, Y1, Z1), (X1, Y1, Z0)])
    floor = P([(X0, 0, Z0), (X1, 0, Z0), (X1, 0, Z1), (X0, 0, Z1)])
    ceil = P([(X0, Y1, Z0), (X1, Y1, Z0), (X1, Y1, Z1), (X0, Y1, Z1)])
    b = f'<rect width="2160" height="3840" fill="{BLUE_DEEP}"/>'
    b += shape(ceil, BLUE_SH, name + 'ceil', w=5, smooth=False)
    for i in range(5):   # ceiling beams along Z
        x = X0 + 0.6 + i * 1.25
        b += shape(P([(x, Y1, Z0), (x + 0.22, Y1, Z0), (x + 0.22, Y1, Z1), (x, Y1, Z1)]), '#3a2a3a', f'{name}beam{i}', w=3, smooth=False)
    b += shape(wall_l, BLUE, name + 'wl', w=5, smooth=False) + shape(wall_r, BLUE_SH, name + 'wr', w=5, smooth=False) + shape(wall_back, BLUE, name + 'wb', w=5, smooth=False)
    for i in range(1, 16):   # board seams
        x = X0 + i * (X1 - X0) / 16
        b += ink([c.p(x, 0, Z1), c.p(x, Y1, Z1)], 2.4, f'{name}bs{i}', taper=False, color=BLUE_DEEP, op=0.7)
    for i in range(1, 10):
        z = Z0 + i * (Z1 - Z0) / 10
        b += ink([c.p(X0, 0, z), c.p(X0, Y1, z)], 2.4, f'{name}ls{i}', taper=False, color=BLUE_DEEP, op=0.6)
        b += ink([c.p(X1, 0, z), c.p(X1, Y1, z)], 2.4, f'{name}rs{i}', taper=False, color=BLUE_DEEP, op=0.6)
    b += ticks((0, 600, 2160, 1650), 90, 16, 1.6, 1.57, name + 'grain', color=BLUE_DEEP, spread=0.1, op=0.6)
    # the window in the right wall: frame, mullions, sky and a green field outside
    WZ0, WZ1, WY0, WY1 = 3.0, 5.0, 1.0, 2.4
    win = P([(X1, WY0, WZ0), (X1, WY0, WZ1), (X1, WY1, WZ1), (X1, WY1, WZ0)])
    b += shape(win, '#cfdcf6', name + 'win', w=6, smooth=False)
    b += shape(P([(X1, WY0, WZ0), (X1, WY0, WZ1), (X1, WY0 + 0.45, WZ1), (X1, WY0 + 0.4, WZ0)]), GREEN, name + 'field', line=False, smooth=False, extra=' fill-opacity="0.8"')
    b += ink([c.p(X1, WY0, (WZ0 + WZ1) / 2), c.p(X1, WY1, (WZ0 + WZ1) / 2)], 9, name + 'mul1', taper=False) + ink([c.p(X1, (WY0 + WY1) / 2, WZ0), c.p(X1, (WY0 + WY1) / 2, WZ1)], 9, name + 'mul2', taper=False)
    b += shape(P([(X1, WY1 + 0.1, WZ0 - 0.3), (X1, WY1 + 0.1, WZ0 + 0.1), (X1, WY0 - 0.3, WZ0 + 0.05), (X1, WY0 - 0.3, WZ0 - 0.3)]), REDB, name + 'curtain', w=4, smooth=False)
    # back wall: a clock, a shelf with jars, a stove on the left wall with a pipe
    cx_, cy_ = c.p(-1.6, 2.3, Z1)
    b += f'<circle cx="{cx_:.0f}" cy="{cy_:.0f}" r="54" fill="#f6efe6" stroke="{INK}" stroke-width="5"/>' + ink([(cx_, cy_), (cx_, cy_ - 38), (cx_ + 2, cy_ - 40)], 5, name + 'ch1') + ink([(cx_, cy_), (cx_ + 26, cy_ + 12), (cx_ + 28, cy_ + 13)], 5, name + 'ch2')
    b += shape(P([(0.4, 1.7, Z1), (2.4, 1.7, Z1), (2.4, 1.78, Z1), (0.4, 1.78, Z1)]), '#8a5a3a', name + 'shelf', w=3, smooth=False)
    for i in range(5):
        jx = 0.55 + i * 0.38
        b += shape(P([(jx, 1.78, Z1), (jx + 0.22, 1.78, Z1), (jx + 0.2, 2.1, Z1), (jx + 0.02, 2.1, Z1)]), ['#f6efe6', PEACH, GREEN, REDB, '#e8b84a'][i], f'{name}jar{i}', w=2.6, smooth=False)
    stove = [(X0, 0, 6.2), (X0 + 0.8, 0, 6.2), (X0 + 0.8, 0, 7.4), (X0, 0, 7.4)]
    b += shape(P([(X0 + 0.8, 0, 6.2), (X0 + 0.8, 0, 7.4), (X0 + 0.8, 0.9, 7.4), (X0 + 0.8, 0.9, 6.2)]), '#2a2a3a', name + 'stoveF', w=4, smooth=False)
    b += shape(P([(X0, 0.9, 6.2), (X0 + 0.8, 0.9, 6.2), (X0 + 0.8, 0.9, 7.4), (X0, 0.9, 7.4)]), '#3a3a4e', name + 'stoveT', w=4, smooth=False)
    b += shape(P([(X0 + 0.3, 0.9, 7.0), (X0 + 0.45, 0.9, 7.0), (X0 + 0.45, Y1, 7.0), (X0 + 0.3, Y1, 7.0)]), '#2a2a3a', name + 'pipe', w=3, smooth=False)
    L['back'] = b
    m = shape(floor, BLUE_SH, name + 'floor', w=5, smooth=False)
    for i in range(1, 14):   # floor boards converge
        x = X0 + i * (X1 - X0) / 14
        m += ink([c.p(x, 0, Z0), c.p(x, 0, Z1)], 2.6, f'{name}fb{i}', taper=False, color=BLUE_DEEP, op=0.75)
    m += ticks((0, 1700, 2160, 3840), 120, 14, 1.8, 1.4, name + 'fgrain', color=BLUE_DEEP, spread=0.3, op=0.6)
    # the window light on the floor (cast)
    corners = [(X1, WY0, WZ0), (X1, WY0, WZ1), (X1, WY1, WZ1), (X1, WY1, WZ0)]
    fl = [cast_to_plane(q, SUN_K, 1, 0.0) for q in corners]
    m += shape(P(fl), PEACH, name + 'sunFloor', line=False, smooth=False, cut=0.6, extra=' fill-opacity="0.78"')
    # mullion shadows inside the floor patch
    mz = cast_to_plane((X1, WY0, (WZ0 + WZ1) / 2), SUN_K, 1, 0.0), cast_to_plane((X1, WY1, (WZ0 + WZ1) / 2), SUN_K, 1, 0.0)
    m += ink([c.p(*mz[0]), c.p(*mz[1])], 16, name + 'mshF', taper=False, color=BLUE_SH)
    # the table (top, front edge, legs) and two chairs
    TX0, TX1, TZ0, TZ1, TY = -1.4, 1.2, 4.0, 5.6, 0.8
    for (x, z) in ((TX0 + 0.1, TZ0 + 0.1), (TX1 - 0.1, TZ0 + 0.1), (TX0 + 0.1, TZ1 - 0.1), (TX1 - 0.1, TZ1 - 0.1)):
        m += shape(P([(x - 0.05, 0, z), (x + 0.05, 0, z), (x + 0.05, TY, z), (x - 0.05, TY, z)]), '#6a3a22', f'{name}leg{x}{z}', w=3, smooth=False)
    top = P([(TX0, TY, TZ0), (TX1, TY, TZ0), (TX1, TY, TZ1), (TX0, TY, TZ1)])
    m += shape(P([(TX0, TY - 0.08, TZ0), (TX1, TY - 0.08, TZ0), (TX1, TY, TZ0), (TX0, TY, TZ0)]), '#6a3a22', name + 'tEdge', w=4, smooth=False)
    m += shape(top, '#a8744a', name + 'tTop', w=5, smooth=False)
    m += ticks((min(p[0] for p in top), min(p[1] for p in top), max(p[0] for p in top), max(p[1] for p in top)), 30, 26, 1.8, 0.0, name + 'tgrain', color=FINE, spread=0.05, op=0.6)
    tl = [cast_to_plane(q, SUN_K, 1, TY) for q in corners]
    m += f'<clipPath id="{name}tc"><path d="M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in top) + ' Z"/></clipPath>'
    m += f'<g clip-path="url(#{name}tc)">' + shape(P(tl), PEACH, name + 'sunTable', line=False, smooth=False, cut=0.4, extra=' fill-opacity="0.85"') + '</g>'
    L['mid'] = m
    L['cam'] = c
    return L


def barnyard(name='B3', cam=None):
    """the barnyard in late sun, in perspective: a fence receding to the horizon on the left, the barn and silo far right,
    long hard-edged post shadows and the barn's shadow cast across the yard"""
    c = cam or Cam(f=1200, horizon=1560, eye=1.4)
    P = c.poly
    L = {'sky': '', 'back': '', 'mid': '', 'light': '', 'fore': ''}
    sky = f'<linearGradient id="{name}sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{BLUE_LIT}"/><stop offset="0.7" stop-color="#b8c4ec"/><stop offset="1" stop-color="{PEACH}"/></linearGradient>'
    L['sky'] = f'<defs>{sky}</defs><rect width="2160" height="1700" fill="url(#{name}sg)"/>'
    L['sky'] += ''.join(shape(ellipse_pts(300 + i * 700, 500 + (i % 2) * 140, 240, 56, 12, 0, f'{name}cl{i}', 0.15), '#e6ecfa', f'{name}cloud{i}', w=3) for i in range(3))
    b = shape([(-200, 1560), (200, 1380), (600, 1420), (700, 1330), (1100, 1340), (1180, 1420), (1700, 1400), (2400, 1470), (2400, 1600), (-200, 1600)], '#7488c6', name + 'mesa', w=4, smooth=False)
    # barn as a box in perspective with a gable
    bx0, bx1, bz0, bz1, bh = 3.0, 8.0, 18.0, 24.0, 4.0
    front = P([(bx0, 0, bz0), (bx1, 0, bz0), (bx1, bh, bz0), ((bx0 + bx1) / 2, bh + 2.2, bz0), (bx0, bh, bz0)])
    side = P([(bx0, 0, bz0), (bx0, 0, bz1), (bx0, bh, bz1), (bx0, bh, bz0)])
    b += shape(side, BLUE_SH, name + 'barnSide', w=5, smooth=False)
    b += shape(front, REDB, name + 'barnFront', w=6, smooth=False)
    for i in range(1, 12):
        x = bx0 + i * (bx1 - bx0) / 12
        b += ink([c.p(x, 0, bz0), c.p(x, bh + (2.2 * (1 - abs(x - (bx0 + bx1) / 2) / ((bx1 - bx0) / 2))), bz0)], 2.4, f'{name}bp{i}', taper=False, op=0.7)
    b += shape(P([(5.0, 0, bz0), (6.0, 0, bz0), (6.0, 2.6, bz0), (5.0, 2.6, bz0)]), '#4a1a1a', name + 'barnDoor', w=4, smooth=False)
    b += shape(P([(-6, 0, 26), (-4.5, 0, 26), (-4.5, 7, 26), (-5.25, 7.8, 26), (-6, 7, 26)]), '#8a9ad6', name + 'silo', w=5, smooth=False)
    L['back'] = b
    m = f'<rect x="-200" y="1550" width="2560" height="2400" fill="{PEACH}"/>'   # the sunlit yard
    m += ticks((0, 1600, 2160, 3840), 220, 14, 1.8, 0.1, name + 'dirt', color='#c98a6a', spread=0.6, op=0.65)
    sun = (0.55, -0.42, 1.0)   # low sun behind the camera's left, shadows run away and to the right
    # barn shadow on the ground
    bs = [cast_to_plane(q, sun, 1, 0.0) for q in [(bx0, bh, bz0), (bx1, bh, bz0), (bx1, bh, bz1), (bx0, bh, bz1)]]
    m += shape(P([(bx0, 0, bz0), (bx1, 0, bz0)] + [bs[1], bs[2], bs[3]] + [(bx0, 0, bz1)]), BLUE, name + 'barnShadow', line=False, smooth=False)
    # a fence receding on the left, with long cast shadows
    for i in range(14):
        z = 3.0 + i * 1.6
        base, topp = (-3.0, 0, z), (-3.0, 1.3, z)
        s = cast_to_plane(topp, sun, 1, 0.0)
        m += shape(P([(-3.06, 0, z), (-2.94, 0, z), (s[0] + 0.06, 0, s[2]), (s[0] - 0.06, 0, s[2])]), BLUE, f'{name}ps{i}', line=False, smooth=False)
        m += shape(P([(-3.07, 0, z), (-2.93, 0, z), (-2.93, 1.3, z), (-3.07, 1.3, z)]), '#a8744a', f'{name}post{i}', w=3.5, smooth=False)
    for y in (0.55, 1.1):
        m += shape(P([(-3.0, y, 3.0), (-3.0, y, 3.0 + 13 * 1.6), (-3.0, y + 0.1, 3.0 + 13 * 1.6), (-3.0, y + 0.1, 3.0)]), '#b8824e', f'{name}rail{y}', w=3.5, smooth=False)
    L['mid'] = m
    # the chopping block close to camera with its long shadow
    blk = cast_to_plane((0.3, 0.6, 4.2), sun, 1, 0.0)
    L['light'] = shape(P([(0.0, 0, 4.0), (0.6, 0, 4.4), (blk[0] + 0.3, 0, blk[2] + 0.2), (blk[0] - 0.3, 0, blk[2] - 0.2)]), BLUE, name + 'blkSh', line=False, smooth=False)
    bxs, bys = c.p(0.3, 0.0, 4.2)
    sc = c.scale(4.2) / 900
    L['fore'] = f'<g transform="translate({bxs:.0f} {bys:.0f}) scale({sc * 2.2:.3f})">' + chopping_block_simple(name + 'blk') + '</g>'
    L['cam'] = c
    return L


def chopping_block_simple(name):
    o = shape([(-260, 0), (-250, -280), (250, -280), (260, 0), (200, 40), (-200, 40)], '#b07a46', name + 'side', w=6, smooth=False)
    o += shape([(40, -280), (250, -280), (260, 0), (200, 40), (80, 30)], BLUE_SH, name + 'sideSh', line=False, smooth=False, extra=' fill-opacity="0.75"')
    o += shape(ellipse_pts(0, -280, 250, 70, 16, 0, name + 'top'), PEACH, name + 'top', w=5)
    for k in range(4):
        e = ellipse_pts(0, -280, 50 + k * 45, 12 + k * 13, 14, 0, f'{name}r{k}')
        o += ink(e + [e[0]], 2.2, f'{name}ring{k}', taper=False, color=FINE, op=0.75)
    o += cracks(-60, -300, 150, name + 'cr', 3, 0.5)
    o += ticks((-240, -250, 240, 0), 46, 22, 2.2, 1.57, name + 'bark', spread=0.1, op=0.8)
    return o
