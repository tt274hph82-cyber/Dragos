"""Hand-inked cartoon-cel kit: everything is drawn as filled SVG polygons (no SVG strokes).

ink()      variable-width dip-pen line: Catmull-Rom smoothing, pressure swell, tapered points, slight wobble
shape()    a hand-cut filled shape (jittered edge) with an inked outline
ticks / dashes / dots / cracks / grain / plaid / feathers   texture marks (short ticks, never long hatching)
eye / mouth / hand        the acting parts (hooded lids, lilac whites; lip rim, gums, teeth one by one; padded fingers)
Every part is reseeded from its own name, so it redraws identically every frame and only what changes moves.
Ink is warm sepia-black #170b08; the finest strokes are dark red #4d140a and slightly see-through.
"""
import math, random, hashlib

INK, FINE = '#170b08', '#4d140a'


def rng(name):
    """a seeded random generator per body part (same drawing every frame)"""
    return random.Random(int(hashlib.md5(name.encode()).hexdigest()[:8], 16))


def catmull(pts, n=8, closed=False):
    if len(pts) < 3:
        return pts
    P = pts + pts[:3] if closed else [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(len(P) - 3):
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    if not closed:
        out.append(pts[-1])
    return out


def _fmt(poly):
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in poly) + ' Z'


def ink(pts, w=4.0, name='ink', taper=True, wob=0.8, color=INK, op=1.0, closed=False, press=None):
    """a dip-pen stroke as a filled polygon. w = max width (px at 1080 wide, x2 when drawing at 2x)."""
    r = rng(name)
    c = catmull([tuple(p) for p in pts], 6, closed)
    if len(c) < 2:
        return ''
    n = len(c)
    ph = r.uniform(0, 6.28)
    L, R = [], []
    for i in range(n):
        a = c[max(0, i - 1)]
        b = c[min(n - 1, i + 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d
        u = i / (n - 1)
        pr = press(u) if press else (0.55 + 0.45 * math.sin(math.pi * u) ** 0.7) * (0.85 + 0.15 * math.sin(u * 9 + ph))
        if taper and not closed:
            pr *= min(1, (u / 0.18) ** 0.8, ((1 - u) / 0.22) ** 0.8)
        hw = max(0.15, w * pr / 2)
        jx = math.sin(i * 1.7 + ph) * wob * 0.5 + r.uniform(-wob, wob) * 0.35
        L.append((c[i][0] + nx * (hw + jx * 0.3) + jx * 0.2, c[i][1] + ny * (hw + jx * 0.3)))
        R.append((c[i][0] - nx * (hw - jx * 0.3), c[i][1] - ny * (hw - jx * 0.3) + jx * 0.2))
    poly = L + R[::-1]
    o = f' fill-opacity="{op}"' if op < 1 else ''
    return f'<path d="{_fmt(poly)}" fill="{color}"{o}/>'


def jitter(pts, amt, name):
    r = rng(name + 'j')
    return [(x + r.uniform(-amt, amt), y + r.uniform(-amt, amt)) for x, y in pts]


def shape(pts, fill, name, w=4.0, line=True, cut=1.2, smooth=True, extra=''):
    """a hand-cut flat-colour shape with a wobbly inked outline (closed)"""
    P = jitter(pts, cut, name)
    c = catmull(P, 6, True) if smooth else P
    out = f'<path d="{_fmt(c)}" fill="{fill}"{extra}/>'
    if line and smooth:
        out += ink(P, w, name + 'o', taper=False, closed=True)
    elif line:   # angular shapes: one pen stroke per edge, overlapping a little at the corners
        for i in range(len(P)):
            a, b = P[i], P[(i + 1) % len(P)]
            ex = ((b[0] - a[0]) * 0.04, (b[1] - a[1]) * 0.04)
            out += ink([(a[0] - ex[0], a[1] - ex[1]), ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2), (b[0] + ex[0], b[1] + ex[1])], w, f'{name}e{i}',
                       press=lambda u: 0.6 + 0.4 * math.sin(math.pi * u))
    return out


def ellipse_pts(cx, cy, rx, ry, n=14, rot=0, name='e', lump=0.0):
    r = rng(name + 'l')
    out = []
    for i in range(n):
        a = i / n * 2 * math.pi
        k = 1 + r.uniform(-lump, lump)
        x, y = math.cos(a) * rx * k, math.sin(a) * ry * k
        out.append((cx + x * math.cos(rot) - y * math.sin(rot), cy + x * math.sin(rot) + y * math.cos(rot)))
    return out


def tick(x, y, ang, ln, w, name, color=INK, op=1.0):
    return ink([(x, y), (x + math.cos(ang) * ln * 0.5, y + math.sin(ang) * ln * 0.5), (x + math.cos(ang) * ln, y + math.sin(ang) * ln)], w, name, wob=0.3, color=color, op=op)


def ticks(region, n, ln, w, ang, name, color=INK, spread=0.5, op=1.0):
    """n short tapered ticks scattered in a box (x0, y0, x1, y1)"""
    r = rng(name)
    x0, y0, x1, y1 = region
    return ''.join(tick(r.uniform(x0, x1), r.uniform(y0, y1), ang + r.uniform(-spread, spread), ln * r.uniform(0.6, 1.2), w, f'{name}{i}', color, op) for i in range(n))


def dots(region, n, rad, name, color=INK, op=1.0):
    r = rng(name)
    x0, y0, x1, y1 = region
    o = f' fill-opacity="{op}"' if op < 1 else ''
    return ''.join(f'<circle cx="{r.uniform(x0, x1):.1f}" cy="{r.uniform(y0, y1):.1f}" r="{rad * r.uniform(0.6, 1.3):.1f}" fill="{color}"{o}/>' for _ in range(n))


def dash_rows(x0, x1, y0, rows, gap, ln, w, name, color=INK, slant=0.4, op=1.0):
    """rows of small dashes (fur, wool, knit, feathers)"""
    out = ''
    r = rng(name)
    for j in range(rows):
        y = y0 + j * gap
        x = x0 + (j % 2) * ln * 0.6
        while x < x1:
            out += tick(x, y + r.uniform(-1, 1), slant + r.uniform(-0.2, 0.2), ln, w, f'{name}{j}_{x:.0f}', color, op)
            x += ln * 1.5 + r.uniform(0, ln * 0.4)
    return out


def cracks(x, y, ln, name, depth=3, ang=1.2):
    """branching cracks from (x, y)"""
    r = rng(name)
    out = ''

    def br(x, y, a, l, d, k):
        nonlocal out
        pts = [(x, y)]
        for _ in range(4):
            a += r.uniform(-0.5, 0.5)
            x, y = x + math.cos(a) * l / 4, y + math.sin(a) * l / 4
            pts.append((x, y))
        out += ink(pts, 2.4 * (d / depth) + 0.8, f'{name}{k}', wob=0.4, color=FINE if d < depth else INK, op=0.85)
        if d > 1:
            br(x, y, a + 0.6, l * 0.6, d - 1, k * 2)
            br(x, y, a - 0.5, l * 0.5, d - 1, k * 2 + 1)
    br(x, y, ang, ln, depth, 1)
    return out


def plaid(x0, y0, x1, y1, step, c1, c2, name, w=3.0):
    """flat plaid: bands in c1 over the base and fine c2 threads (clip it with clipPath)"""
    out = ''
    x = x0
    while x < x1:
        out += f'<rect x="{x:.1f}" y="{y0}" width="{step * 0.42:.1f}" height="{y1 - y0}" fill="{c1}" fill-opacity="0.55"/>'
        out += ink([(x + step * 0.7, y0), (x + step * 0.7, y1)], w * 0.6, f'{name}v{x:.0f}', taper=False, color=c2, op=0.8)
        x += step
    y = y0
    while y < y1:
        out += f'<rect x="{x0}" y="{y:.1f}" width="{x1 - x0}" height="{step * 0.42:.1f}" fill="{c1}" fill-opacity="0.45"/>'
        out += ink([(x0, y + step * 0.7), (x1, y + step * 0.7)], w * 0.6, f'{name}h{y:.0f}', taper=False, color=c2, op=0.8)
        y += step
    return out


def eye(cx, cy, s, look=(0, 0), lid=0.45, mode='normal', name='eye', lilac='#ddd2ee', iris=INK, skin='#f07a62'):
    """small eye: lilac white, hooded lid, thick lash line; mode normal | blink | shock (big disc, pinprick) | angry (small pupil)"""
    out = ''
    if mode == 'blink':
        return ink([(cx - s, cy), (cx - s * 0.3, cy + s * 0.35), (cx + s * 0.4, cy + s * 0.3), (cx + s, cy - s * 0.05)], s * 0.32, name + 'b')
    rx, ry = (s * 1.25, s * 1.25) if mode == 'shock' else (s, s * 0.62)
    out += shape(ellipse_pts(cx, cy, rx, ry, 12, 0, name), lilac, name + 'w', w=s * 0.18, cut=0.4)
    pr = s * (0.12 if mode == 'shock' else 0.26 if mode == 'angry' else 0.4)
    out += f'<circle cx="{cx + look[0] * s * 0.35:.1f}" cy="{cy + look[1] * s * 0.25:.1f}" r="{pr:.1f}" fill="{iris}"/>'
    if mode != 'shock':
        top = cy - ry * (1 - 2 * lid)
        out += f'<path d="M{cx - rx * 1.08:.1f} {cy - ry * 1.3:.1f} L{cx + rx * 1.08:.1f} {cy - ry * 1.3:.1f} L{cx + rx * 1.08:.1f} {top:.1f} Q{cx:.1f} {top + ry * 0.25:.1f} {cx - rx * 1.08:.1f} {top:.1f} Z" fill="{skin}"/>'
        out += ink([(cx - rx * 1.1, top + 1), (cx, top + ry * 0.12), (cx + rx * 1.1, top + 1)], s * 0.38, name + 'lash')
    return out


def teeth_row(x0, x1, y, h, n, name, down=True, gum=None):
    out = ''
    wdt = (x1 - x0) / n
    r = rng(name)
    for i in range(n):
        x = x0 + i * wdt
        hh = h * r.uniform(0.8, 1.05)
        pts = [(x + 1, y), (x + wdt - 1, y), (x + wdt - 2, y + (hh if down else -hh)), (x + 2, y + (hh if down else -hh))]
        out += shape(pts, '#f6ecd8', f'{name}{i}', w=1.6, cut=0.6)
    if gum:
        out = f'<rect x="{x0}" y="{y - (h * 0.35 if down else 0):.1f}" width="{x1 - x0}" height="{h * 0.35:.1f}" fill="{gum}"/>' + out
    return out


def mouth(cx, cy, wdt, open_, name, mode='talk', skin_dark='#c04a3a', gum='#e27a86'):
    """open mouth fully drawn: lip rim, dark interior, tongue, both rows of teeth; grin shows gums"""
    if open_ <= 0.05:
        curve = {'smile': 0.35, 'smug': 0.22, 'frown': -0.3, 'talk': 0.0}.get(mode, 0)
        return ink([(cx - wdt / 2, cy - curve * wdt * 0.1), (cx - wdt * 0.2, cy + curve * wdt * 0.18), (cx + wdt * 0.25, cy + curve * wdt * 0.15), (cx + wdt / 2, cy - curve * wdt * (0.25 if mode == 'smug' else 0.1))], wdt * 0.07, name)
    h = wdt * 0.55 * open_
    grin = mode == 'smile'
    top = cy - (h * 0.25 if not grin else h * 0.1)
    pts = [(cx - wdt / 2, top), (cx - wdt * 0.25, top - h * 0.12), (cx + wdt * 0.25, top - h * 0.12), (cx + wdt / 2, top), (cx + wdt * 0.38, top + h * 0.7), (cx, top + h), (cx - wdt * 0.38, top + h * 0.7)]
    out = shape(pts, '#3a0c0c', name + 'in', w=wdt * 0.05, cut=0.5)
    out += f'<ellipse cx="{cx:.1f}" cy="{top + h * 0.8:.1f}" rx="{wdt * 0.26:.1f}" ry="{h * 0.2:.1f}" fill="#d0525a"/>'
    out += teeth_row(cx - wdt * 0.36, cx + wdt * 0.36, top - h * 0.02, h * 0.22, 7, name + 'tt', True, gum if grin else None)
    if open_ > 0.35:
        out += teeth_row(cx - wdt * 0.28, cx + wdt * 0.28, top + h * 0.92, h * 0.16, 6, name + 'bt', False)
    out += ink([(cx - wdt / 2, top), (cx, top - h * 0.14), (cx + wdt / 2, top)], wdt * 0.08, name + 'lip')
    return out


def hand(cx, cy, s, fill, shade, name, lit=True, rot=0, curl=0.3, ring=None):
    """a padded hand: palm, four fingers with joint creases and short dark nails, a thumb, knuckle bumps"""
    out = f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({rot:.1f}) scale({s / 40:.3f})">'
    col = fill if lit else shade
    out += shape([(-22, -8), (20, -12), (26, 18), (0, 30), (-24, 20)], col, name + 'p', w=3.2)
    for i in range(4):
        x = -16 + i * 11
        ln = [30, 34, 32, 26][i] * (1 - curl * 0.4)
        pts = [(x - 5, -8), (x + 5, -9), (x + 5, -8 - ln), (x - 5, -8 - ln)]
        out += shape(pts, col, f'{name}f{i}', w=2.6, cut=0.5)
        out += f'<ellipse cx="{x:.1f}" cy="{-8 - ln + 4:.1f}" rx="3.2" ry="2.4" fill="#5a2a22"/>'
        for j in (0.4, 0.72):
            out += tick(x - 3, -8 - ln * j, 0.1, 6, 1.4, f'{name}c{i}{j}', FINE, 0.8)
        out += f'<circle cx="{x:.1f}" cy="-10" r="2" fill="{shade}"/>'
    out += shape([(-24, 4), (-38, -10), (-40, -24), (-30, -20), (-20, -6)], col, name + 'th', w=2.6)
    if ring:
        out += shape([(-11.5, -16), (-0.5, -17), (-0.5, -12), (-11.5, -11)], ring, name + 'ring', w=1.4)
    out += '</g>'
    return out


def glint(x, y, s, color='#fff8e8'):
    """one sparkle glint on a lamp, coin or blade"""
    return f'<path d="M{x} {y - s} L{x + s * 0.2} {y - s * 0.2} L{x + s} {y} L{x + s * 0.2} {y + s * 0.2} L{x} {y + s} L{x - s * 0.2} {y + s * 0.2} L{x - s} {y} L{x - s * 0.2} {y - s * 0.2} Z" fill="{color}"/>'


def svg_doc(w, h, body, defs=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs>{defs}</defs>{body}</svg>'
