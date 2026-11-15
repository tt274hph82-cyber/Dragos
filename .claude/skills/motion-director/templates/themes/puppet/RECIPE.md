# Puppet: paper collage on twos

A 10 second vertical paper collage animated on twos (12 drawings a second). A
mustard sun rises behind a grey 3D-scanned rock range, a faceless mannequin
taken from the brand's own explainer video drops in on strings, a drawn
museum hand works a wooden marionette cross above it and the puppet jerks
with every pull, its eyes crossed out with yellow X's. Then the founder's
real head bursts onto the mannequin's shoulders, a crumpled paper ball flies
out of it, the hand lets go, the strings vanish, the puppet settles, and the
headline lands word by word. The idea that makes it work: every beat is a
sight gag with a physical verb (rise, drop, pull, jerk, burst, let go), the
brand's own mascot becomes the victim, and the founder is the punchline.
The gag reads in one look because the strings are real geometry, recomputed
every frame from the cross to the puppet, so they never detach.

## Format, length, pace

- 1080x1920 (9:16), 30 fps, 10.0 s. Works at 1:1 by moving the headline
  beside the sun; 16:9 is not recommended (the strings need height).
- One continuous shot, no cuts. Everything moves on twos: every tween uses
  `steps(round(duration * 12))`, so a 0.5 s move is 6 held drawings.
- Measured beats: 0.0 rocks rise, 0.2 sun grows, 0.7 puppet drops, 1.1 hand
  and cross drop, 1.5 strings appear, 2.0 to 4.5 six jerks every 0.5 s,
  5.0 real head bursts in, 5.2 paper ball flies, 6.4 hand lets go,
  6.5 puppet settles, 7.0 to 7.75 four words slap in 0.25 s apart, 8.2
  URL, held to 10.0.

## The look in numbers

| element | value |
|---|---|
| ground | `#F3F3F1` graph paper: two 1.5px line gradients `rgba(90,90,100,.2)` on a 38px grid, under a scanned crumpled paper sheet (`background-size: 1300px`, `mix-blend-mode: multiply`, opacity .45) |
| sun | flat disc `#D5A50D` (mustard), 700x700 at left 140 top 760, no outline, no shadow |
| rocks | the 3D scan rendered to PNG, `filter: grayscale(1) contrast(1.25) brightness(1.5)` plus `drop-shadow(0 -6px 10px rgba(0,0,0,.25))`, 1200x800 at left -60 top 1220, `object-fit: cover; object-position: 50% 10%`, top edge cut to 9 peaks with a clip-path polygon |
| hand | the drawn museum fist, warm sepia as scanned, 300px wide at left 420 top -90, `scaleY(-1) rotate(-12deg)` so it hangs down holding the cross |
| marionette cross | SVG, two rounded bars (480x30 and 30x200, rx 8), fill `#D9B98A`, stroke `#9d7b4c` 3px |
| strings | 1.6px wide divs, `rgba(30,30,30,.55)`, 3 of them |
| puppet | the brand mannequin cut-out, 500px wide, `scale: 1.45` from its top centre, `grayscale(1) contrast(1.15) brightness(1.05)` |
| X eyes | SVG paths, stroke `#F2C21A` 11px round caps, 94x44 over the face |
| founder head | real photo cut-out in full colour, 154px wide over the 122px mannequin head (slightly bigger reads as "bursting out") |
| headline | brand display face, weight 900, 140px, line-height .9, tracking -0.02em, `#141414`, sentence case, 2 lines centred at top 330 |
| URL | brand display 700, 44px, white on a `#141414` pill (padding 14px 30px, square corners), centred at top 1690 |
| grain | SVG `feTurbulence` fractalNoise baseFrequency 1.2, alpha .14, multiply, opacity .5, over everything |
| shadows | every cut-out `drop-shadow(0 10px 10px rgba(20,14,8,.3))`: paper lifted 1 cm off the sheet |

Colour rule: the frame is greyscale except three things, the mustard sun,
the yellow X's and the sepia hand. The founder's head is the only full
colour skin in the film, which is why the burst lands.

## Shot list

| time | on screen | what moves and how | static | out |
|---|---|---|---|---|
| 0.0-0.7 | grid paper, rocks, sun | rocks `y 300 to 0`, 0.42 s, `steps(5)`; sun `scale .35 to 1` from `50% 100%` (it rises from behind the peaks), 0.5 s, `steps(6)`, starts 0.2 | ground, grain | none, one shot |
| 0.7-1.5 | the mannequin at its desk falls in | puppet `y -1300 to 0, rotation -15 to 0`, 0.5 s, `steps(6)`; hand + cross `y -500 to 0`, 0.42 s, `steps(5)`, at 1.1 | rocks, sun | strings switch on at 1.5 |
| 1.5-5.0 | hand, cross, 3 strings, puppet with X eyes | every 0.5 s from 2.0: cross + hand `rotation sw, x sw*3` (sw = seeded -7..+7 deg), 0.17 s `steps(2)`; puppet answers 0.08 s later `rotation -0.8*sw, x 4*sw, y abs(sw)*2`, 0.25 s `steps(3)`; X eyes boil every 1/6 s (rotation +-3 deg, x +-2px) | ground, sun, rocks | none |
| 5.0-6.4 | real head over the mannequin head, paper ball | head `visibility` on at 5.0, `scale .2 to 1, rotation -40 to 0, y -220 to 0`, 0.33 s `steps(4)`; X eyes hidden at 5.08; paper ball at 5.2 `y 150 to -60, scale .3 to 1, rotation -40 to 20`, 0.42 s `steps(5)`, then 5.7 `scale .2, opacity 0, rotation 120`, 0.25 s `steps(3)`, hidden at 5.96 | strings still taut, hand still jerking until 5.0 | the hand lets go |
| 6.4-7.0 | hand and cross leave, strings gone | strings opacity 0 at 6.4; hand + cross `y -600`, 0.42 s `steps(5)`; puppet `y 120, rotation 0, x 0`, 0.33 s `steps(4)` (it slumps onto the sun) | rocks, sun | none |
| 7.0-10.0 | headline over the puppet, URL pill | each word `opacity 0 to 1, scale 1.4 to 1`, 0.17 s `steps(2)`, 0.25 s apart; URL fades in at 8.2 over 0.25 s (the only smooth move in the film) | everything | hold to the end |

## Materials and where to get them for a new brand

1. **The puppet: the brand's own character.** Download the brand's hero or
   explainer video and contact-sheet it (`ffmpeg -vf fps=1,scale=480:-1,tile=6x6`).
   Look for a faceless or generic figure: a mannequin, a stick person, a
   mascot, a 3D avatar. Grab the frame at full size and lift it:
   `node scripts/cutout.mjs frame.png puppet.png`. Crop it at a natural line
   (a desk edge, the waist) so it reads as a bust on strings. If the cut-out
   keeps a coloured rim from a coloured backdrop, the `grayscale(1)` filter
   hides it. **If the brand has no character**, use the founder's own body
   from a video still with the face covered by a paper oval (the X eyes go
   on the paper), or `find-assets.mjs "mannequin" --cutout`.
2. **The founder's head**: a frontal video still or portrait, cut out with
   `cutout.mjs`, cropped to the head and neck, about 1.25x the puppet head's
   width. Keep it in colour.
3. **The hand**: `node scripts/find-assets.mjs "hand holding stick" --out <dir> --cutout`.
   The museum drawing "Study: A man's hand holding a stick" (Cooper Hewitt,
   1700-1750, public domain) is the fist used: a clenched hand on toned
   paper, flipped vertically so it hangs. Other good queries: `"drawing study hand"`,
   `"hand study red chalk"` with `--title drawing`. If the drawing sits on
   a dark or flat scan background, mask it with a threshold flood-filled
   from every border pixel (below) rather than trusting Vision.
4. **The rocks**: `node scripts/find-assets.mjs --polyhaven model mountainside --out <dir>`,
   then `node scripts/prop-render.mjs <dir>/mountainside/mountainside_1k.gltf rocks.png --rx 70 --ry 0 --fill 0.95 --size 2000`
   (look down on the scan so the surface fills the frame; the exact angle
   used was not recorded, judge it on the render) and rotate the PNG 90
   degrees so the ridges run vertically (`sips -r 90`). The colour does not
   matter: the CSS turns it into silver-grey rock. The peaks come from the
   clip-path, not the model.
5. **Grounds**: `node scripts/find-assets.mjs --ambientcg paper --out <dir>` or
   `"crumpled paper texture"` for the multiply sheet. The grid is CSS.
6. **The paper ball**: `find-assets.mjs "crumpled paper ball" --cutout`; any
   single crumpled sheet, cream or white.
7. **The mark** (optional end beat): the brand logo from intake, on a
   rounded tile, placed ABOVE the rock layer.

Cleaning a scan (a museum drawing on a flat or black backdrop). Vision often
fails on drawings; a threshold mask flood-filled from every border pixel never
does. Needs only Pillow. Use `--tol 60` for a drawing on an even backdrop;
the hand needs no `--largest`.

```python
# clean-scan: lift a drawing or a plate frame off a flat scan background. Needs only Pillow.
#   python3 clean.py scan.jpg out.png [--largest] [--tol 60]
import sys
from collections import deque
from PIL import Image, ImageFilter

def clean(src, dst, tol=60, keep_largest=False):
    img = Image.open(src).convert("RGB"); w, h = img.size; px = img.load()
    edge = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)] + [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    bg = tuple(sorted(c[i] for c in edge)[len(edge) // 2] for i in range(3))   # median border colour = the backdrop
    near = lambda p: abs(p[0] - bg[0]) + abs(p[1] - bg[1]) + abs(p[2] - bg[2]) <= tol
    out = bytearray(w * h); q = deque()
    for x in range(w):
        for y in (0, h - 1): q.append((x, y))
    for y in range(h):
        for x in (0, w - 1): q.append((x, y))
    while q:                                   # flood fill the backdrop from EVERY border pixel
        x, y = q.popleft(); i = y * w + x
        if out[i] or not near(px[x, y]): continue
        out[i] = 1
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    keep = bytearray(0 if o else 255 for o in out)  # subject = everything the flood did not reach (holes inside stay)
    if keep_largest:                           # plate frames: keep the biggest connected blob, drop grid lines, numbers, specks
        lab = [0] * (w * h); best, best_n, n = 0, 0, 0
        for s in range(w * h):
            if not keep[s] or lab[s]: continue
            n += 1; lab[s] = n; q = deque([s]); c = 0
            while q:
                i = q.popleft(); c += 1; x, y = i % w, i // w
                for j, ok in ((i - 1, x > 0), (i + 1, x < w - 1), (i - w, y > 0), (i + w, y < h - 1)):
                    if ok and keep[j] and not lab[j]: lab[j] = n; q.append(j)
            if c > best_n: best, best_n = n, c
        keep = bytearray(255 if l == best else 0 for l in lab)
    a = Image.frombytes("L", (w, h), bytes(keep)).filter(ImageFilter.GaussianBlur(1.2))
    img.putalpha(a); img.crop(a.getbbox()).save(dst)

if __name__ == "__main__":
    tol = int(sys.argv[sys.argv.index("--tol") + 1]) if "--tol" in sys.argv else 60
    clean(sys.argv[1], sys.argv[2], tol, "--largest" in sys.argv)
```

Missing material: never draw a hand or a person in CSS. If no character
exists in the brand's media, use the founder's own body (step 1). If no
founder face exists, the burst becomes the brand mark on a paper tile.

## Mechanics

Stepped ease and seeded random (no `Math.random`):

```js
const tl = gsap.timeline({ paused: true });
const STEP = 1 / 12, st = (d) => `steps(${Math.max(1, Math.round(d * 12))})`;
const R = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
```

Marionette strings recomputed every frame. Three string divs
(`.str { position:absolute; width:1.6px; transform-origin:50% 0 }`) are
re-aimed on every seek by a dummy tween that spans the film:

```js
const S = { on: 0, t: 0 };
function strings() {
  const cb = document.getElementById("cross").getBoundingClientRect();
  const hd = document.getElementById("head").getBoundingClientRect();   // an empty div over the puppet head
  const bd = document.getElementById("body").getBoundingClientRect();
  const tops = [[cb.left + 30, cb.top + 135], [cb.left + cb.width / 2, cb.top + 50], [cb.right - 30, cb.top + 135]];
  const bots = [[bd.left + bd.width * .2, bd.top + bd.height * .32], [hd.left + hd.width / 2, hd.top + 6], [bd.left + bd.width * .8, bd.top + bd.height * .32]];
  ["#s1", "#s2", "#s3"].forEach((s, i) => {
    const [x1, y1] = tops[i], [x2, y2] = bots[i];
    gsap.set(s, { left: x1, top: y1, height: Math.hypot(x2 - x1, y2 - y1),
      rotation: Math.atan2(x1 - x2, y2 - y1) * 180 / Math.PI, opacity: S.on }); });
}
tl.to(S, { t: 1, duration: FILM_LENGTH, ease: "none", onUpdate: strings }, 0);
tl.to(S, { on: 1, duration: 0.01 }, 1.5);   // strings appear once the cross is in
tl.to(S, { on: 0, duration: 0.01 }, 6.4);   // the hand lets go
```

The pull and the lagged dangle:

```js
const r = R(3);
for (let t = 2.0; t < 5.0; t += 0.5) {
  const sw = (r() - .5) * 14;
  tl.to(["#hand", "#cross"], { rotation: sw, x: sw * 3, duration: 0.17, ease: st(0.17) }, t);
  tl.to("#puppet", { rotation: -sw * .8, x: sw * 4, y: Math.abs(sw) * 2, duration: 0.25, ease: st(0.25) }, t + 0.08);
}
for (let t = 1.0; t < 6.3; t += STEP * 2) tl.set(".xx", { rotation: (r() - .5) * 6, x: (r() - .5) * 4 }, t);  // boil
```

The puppet rig: `#puppet { transform-origin: 250px 0; scale: 1.45 }` so it
swings from where the strings meet; the head div and X eyes live inside it
so they swing with it.

Peaks on the rock layer (generalised: N seeded peaks):

```js
function peaks(n, seed, lo = 4, hi = 32) { const r = R(seed), p = [];
  for (let i = 0; i <= n * 2; i++) p.push(`${(i / (n * 2) * 100).toFixed(1)}% ${(i % 2 ? hi - r() * 8 : lo + r() * 14).toFixed(1)}%`);
  return `polygon(${p.join(",")}, 100% 100%, 0 100%)`; }
document.getElementById("rocks").style.clipPath = peaks(4, 9);
// the proof used: polygon(0 32%, 14% 18%, 24% 26%, 38% 4%, 52% 22%, 62% 12%, 74% 28%, 86% 10%, 100% 24%, 100% 100%, 0 100%)
```

Burst-in of a hidden element (visibility in markup, revealed by the timeline):

```js
tl.set("#realhead", { visibility: "visible" }, 5.0);
tl.fromTo("#realhead", { scale: .2, rotation: -40, y: -220 }, { scale: 1, rotation: 0, y: 0, duration: .33, ease: st(.33) }, 5.0);
tl.set("#xx", { visibility: "hidden" }, 5.08);
```

Word slap on twos:

```js
document.querySelectorAll("#word .w").forEach((w, i) =>
  tl.fromTo(w, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: .17, ease: st(.17) }, 7.0 + i * .25));
```

## Adapting to a brand

Takes the brand: the puppet (its own character), the founder's head, the
headline (2 lines, 3-5 words, a verb about control: "Stop being the
puppet", "Cut the strings", "Run your own show"), the display face and its
heaviest weight, the URL pill, the mark if used. The X eyes may take the
brand accent if it is warm and bright; otherwise keep `#F2C21A`.

Stays fixed: grid paper ground, greyscale cut-outs, the mustard sun, the
sepia drawn hand, the wooden cross, grey rocks, the twos timing, the jerk
rhythm (every 0.5 s), the headline in near-black. Do not tint the ground
with the brand colour: the greyscale is what makes the head pop.

## Pitfalls found while building

- A `gsap.set` made at load, before the timeline is registered, is
  overridden when HyperFrames seeks. Hide late elements with
  `visibility:hidden` in the markup and reveal them with `tl.set`.
- `immediateRender: true` on the puppet's drop, or frame 0 shows it at its
  final place for one frame.
- Layer order matters: the rock layer sits above the rig so the puppet
  sinks behind the peaks. In the proof the brand mark was placed at y 1520
  inside the rig and the rocks hid it completely; anything that must be
  seen at the end sits above the rocks in the DOM.
- The string anchors are measured with `getBoundingClientRect`, so they
  include the puppet's scale and rotation; anchor them to an empty head div,
  not the image, or they land on transparent pixels.
- A cut-out taken from a coloured backdrop keeps a rim of that colour;
  greyscale hides it, colour does not. Recut colour cut-outs from a frame
  with a neutral backdrop.
- The video still is soft and slightly motion-blurred at its edges; a
  1.45x scale shows it. Pick the sharpest frame, and the stepped motion
  makes the softness read as print.
- Text stays inside its pill: run `scripts/frame-audit.mjs`; a long URL at
  44px needs the pill to grow, never to overflow the 1080 width with
  margins under 60px.

## Sound

96 BPM, playful. pop on the rocks (0.0) and the sun (0.2), whoosh on the
puppet drop (0.7), pop on the hand (1.1), a dry tick on every jerk (2.0,
2.5 ... 4.5), pop on the head burst (5.0) and the paper ball (5.2), the one
hit on the reveal (5.75), whoosh as the hand lets go (6.4), a pop per word
(7.0, 7.25, 7.5, 7.75), shimmer on the URL (8.2).
