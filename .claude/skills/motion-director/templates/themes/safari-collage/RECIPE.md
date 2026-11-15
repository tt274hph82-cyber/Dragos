# Safari collage: a maximal torn-paper world with a dive

A 12 second widescreen torn-paper collage, loud and dense. Torn strips of
halftone red, old newspaper, orange and blue paper (each with a white
paper rim) slide in across a real cloud sky, two acacia cut-outs, rocks and
grass bands assemble, and a real 3D boombox drops into the middle, printed
silver, with the brand mark glowing in its cassette window and a label on
its tape. Meerkats pop up. The camera dives into the right speaker until
its black fills the frame, and out of that black opens a 12-wedge
kaleidoscope of the savanna inside a torn hexagonal frame, while a real
1887 Muybridge eagle flaps across it. Then four torn hills pan at four
speeds as meerkats rise one by one, and the title slams onto a torn
newspaper peak while the eagle passes. The idea that makes it work: every
beat is a physical verb on real photographs (slide, drop, pop, dive, open,
flap, pan, slam), the brand lives inside a real object (the mark in the
deck), and the dive is a match cut through the object's own geometry.

## Format, length, pace

- 1920x1080 (16:9), 30 fps, 12.0 s. Four scenes: A 0.0-4.4 (assembly and
  dive), B 4.2-6.8 (kaleidoscope; overlaps A by 0.2 s so the dive's black
  hands over), C 6.8-9.6 (hills), D 9.6-12.0 (title).
- Mixed timing: placement moves are smooth (`power3.out`, `back.out`), the
  textures live on twos: every cut-out boils every 1/6 s and the eagle
  flaps at 12 fps; the title lands `steps(3)`.
- Measured beats: 0.0-0.36 ten pieces slide in 0.04 s apart, 0.25 boombox
  drops, 0.95 the mark pops in the deck, 1.0 to 3.4 the speaker pumps every
  0.52 s, 1.3 and 2.1 meerkats, 3.4 dive, 4.2 kaleidoscope, 4.4 eagle,
  6.8 hills, 7.3 / 7.55 / 7.8 / 8.1 meerkats, 9.6 peak, 10.0 and 10.3
  title words, 10.9 URL, hold to 12.0.

## The look in numbers

| element | value |
|---|---|
| sky | CC0 cumulus photo, `cover`, `center 30%`, `saturate(1.25) brightness(1.04)`; a white halftone dot patch top-left (`radial-gradient` dots 14px, masked to fade at 135 deg) |
| torn piece (`.tp`) | two layers: `.rim` (paper white `#FBFAF6` multiplied with a paper scan at 700px) with a jagged clip-path (jag amplitude 16px every 18px), and `.ink` inset 10px with its own jagged clip (9px every 14px), so a white torn rim shows unevenly; `drop-shadow(0 6px 6px rgba(20,14,8,.28))` |
| ink papers | orange `#E8A13A`, red `#E2462F`, blue `#3E86C9`, each multiplied with the paper scan; halftone red (`#F7E9E4` dots 30% in 22px cells on `#E2462F`); newspaper (a public-domain front page at 900px, `grayscale(1) contrast(1.15)`); savanna photo (`saturate(1.35) hue-rotate(-12deg) brightness(1.08)`); grass photo (`saturate(1.25) brightness(1.05)`) |
| strips in A | b1 halftone red 1600x260 at -14 deg, b2 news 1300x200 at -7 deg, b3 orange 1100x170 at -4 deg, b4 blue 1000x160 at -9 deg, g1 savanna 2040x320 at y 820, g2 grass 2040x200 at y 960 |
| cut-outs | full colour, `drop-shadow(0 8px 8px rgba(20,14,8,.35))`; rocks greyscale `contrast(1.15)`; trees 520-560px wide, meerkats 130-360px tall-ish by depth |
| boombox | 1100px wide at (410,230), the Poly Haven model rendered front-on, printed silver: `grayscale(1) brightness(3.1) contrast(1.02)` plus `drop-shadow(0 18px 18px rgba(0,0,0,.35))` |
| brand in the object | mark in the left cassette window (box at 30.6%/67.6%, 14.2% x 17.4% of the boombox), 62% of the window, brand accent with `drop-shadow(0 0 14px accent at 90%)`; tape label (56.2%/76.4%, 11.8% x 5.4%) orange `#E8A13A`, brand sans 600 17px, tracking .02em, `#1d1a16` |
| kaleidoscope | 2600px square of 12 wedges (30 deg), each a tile of savanna photo (`saturate(1.5) hue-rotate(-15deg)`), a blue 700x360 block, an orange 500x260 block at -12 deg and an acacia cut-out; alternate wedges mirrored; on black `#0b0b0b` |
| hex frame | SVG ring, even-odd path between two jittered radii (44 and 31 of 100), hex bias `abs(cos 3a) * .08`, fill orange `#E8A13A`, stroke paper white 1.6 |
| title | brand serif (or display) weight 800, 270px, line-height .86, tracking -0.01em, red `#E2462F` (or the brand accent if warm), `-webkit-text-stroke: 6px #FBFAF6; paint-order: stroke fill`, hard shadow `10px 10px 0 #2B57A8, 12px 12px 0 #2B57A8`; two lines centred at top 260 |
| URL | brand sans 600 44px, `#FBFAF6` on a `#1d1a16` pill (14px 30px), centred at top 880 |
| grain | `feTurbulence` baseFrequency 1.2, alpha .14, multiply, opacity .5 |

Colour rule: saturated primaries of a children's collage (orange, red,
blue, grass green, sky blue) plus newsprint grey. The brand colour appears
in the object (the mark), the URL and optionally the title; never as a
paper colour, or the collage starts to look like a brand template.

## Shot list

| time | on screen | what moves and how | static | transition out |
|---|---|---|---|---|
| 0.0-1.0 | sky, 4 torn strips, 2 acacias, rocks, red boulder, savanna and grass bands | each piece from its own side (strips from -1300/+1300 x, b1 from (900,-300), trees from -700/+700, rocks from +-700 with y 200, ground bands from y 500/400) to home, 0.55 s `power3.out`, 0.04 s apart; boombox `y -800, rotation -8 to 0`, 0.7 s `back.out(1.3)` at 0.25 | sky | none |
| 1.0-3.4 | the boombox world | mark pops in the deck `scale 0, rotation -90 to 0`, 0.5 s `back.out(2)` at 0.95, then turns 90 deg over 3 s linear; speaker cone `scale 1.06` 0.08 s `power2.out` and back 0.3 s, every 0.52 s; meerkat on the boulder `y 260, opacity 0 to 1`, 0.4 s `back.out(1.6)` at 1.3; front meerkat `y 420 to 0`, 0.45 s `back.out(1.4)` at 2.1, then sways `rotation -6` yoyo 3x 0.4 s; camera `scale 1 to 1.05` over 3.4 s linear; every cut-out boils every 1/6 s (+-1.4px, +-0.4 deg) | sky | the dive |
| 3.4-4.25 | push into the right speaker | camera `scale 1.05 to 11`, 0.85 s `power3.in`, transform-origin on the speaker centre (measured: 1360,771) | none | the speaker's black fills the frame; scene B starts at 4.2 on black |
| 4.2-6.8 | kaleidoscope in a torn hex frame, eagle | kaleidoscope `scale .05 to .9, rotation -60 to 40`, 2.6 s `power2.out`; hex frame `scale .1 to 1.1, rotation 30 to -20` from 4.25; eagle crosses `x 0 to 2400, y 120 to -260`, 2.4 s linear from 4.4, flapping 0-1-2-3-4-3-2-1 at 12 fps | black ground | hard cut at 6.8 |
| 6.8-9.6 | sky, 4 torn hills (news, red, savanna, grass), an acacia, 4 meerkats | hills rise `y 300/380/460/540 to 0`, 0.6 s `power3.out`, 0.07 s apart; they pan `x 0 to -120/-200/-320/-480` over 2.8 s linear (back to front: 4 speeds), tree pans -200; meerkats rise `y 320, opacity 0 to 1`, 0.4 s `back.out(1.5)` at 7.3, 7.55, 7.8, 8.1, then drift `x -260` linear to 9.6; cut-outs boil | sky | hard cut at 9.6 |
| 9.6-12.0 | sky, a torn newspaper peak, two torn corner strips, title, URL, eagle | peak `y 900 to 0`, 0.55 s `power3.out`; red strip top-left from x -900 (9.7), orange strip bottom-right from x +900 (9.75), 0.45 s `power3.out`; each title word `scale 1.6, rotation +-4, opacity 0` to rest, 0.22 s `steps(3)`, at 10.0 and 10.3; URL fades 0.3 s at 10.9; eagle drifts `x -500, y -120` over 2.4 s flapping; peak, strips and title boil (+-1.6px, +-0.5 deg) | sky | hold |

## Materials and where to get them for a new brand

The brand's own: the mark as SVG or a clean PNG (from intake), the
display or serif face and a sans for labels, the domain, a two-word
headline ("Meet <name>", "Say hello", "Now playing"), and the tape label
text (the product name plus a word that fits the object: "mix", "radio",
"live").

Free sources, all CC0 or public domain:

```sh
node scripts/find-assets.mjs --polyhaven model boombox --out <dir>
node scripts/prop-render.mjs <dir>/boombox/boombox_1k.gltf boombox.png --rx 0 --ry 0 --rz 0 --fill 0.95 --size 2000
node scripts/find-assets.mjs "cumulus clouds blue sky" --out <dir> --min 2000
node scripts/find-assets.mjs "acacia tree" --out <dir> --cutout            # pick a lone tree on sky
node scripts/find-assets.mjs "meerkat standing" --out <dir> --cutout --n 16 # need 4 different poses
node scripts/find-assets.mjs "rocks boulders" --out <dir> --cutout
node scripts/find-assets.mjs "red rock boulder" --out <dir> --cutout
node scripts/find-assets.mjs "savanna grassland" --out <dir>
node scripts/find-assets.mjs "grass turf" --out <dir>
node scripts/find-assets.mjs "old newspaper front page" --out <dir> --min 2000
node scripts/find-assets.mjs "eagle flying" --out <dir> --title american     # Muybridge, Animal Locomotion plates 769-771 (1887)
node scripts/find-assets.mjs --ambientcg paper --out <dir>
```

The boombox render angle used is front-on; the exact flags were not
recorded, judge on the render that the speakers are near-circles (the dive
needs a round target). Then measure, on a gridded preview of the PNG, the
boxes of: the left cassette window (mark), the tape label, and the right
speaker centre (dive origin). Store them as percentages of the image.

Another object for another brand: the boombox suits audio, media,
creators and AI assistants ("a mix"). Poly Haven alternatives with a round
dive target: `Television_01` (dive into the screen), `vintage_video_camera`
(the lens), `vintage_pocket_watch` (the face). The dive always enters the
object's darkest round opening.

Muybridge eagle frames (a real flap cycle): take one row of a plate (5
frames of one wing beat), crop each cell inside its black border, and lift
the bird with a threshold mask flood-filled from every border pixel, then
keep only the largest connected component (it drops the grid lines, frame
numbers and specks). Needs only Pillow; `--tol 170` for plates:

```python
# clean-scan: lift a drawing or a plate frame off a flat scan background.
#   python3 clean.py cell.png eagle0.png --largest --tol 170
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
    keep = bytearray(0 if o else 255 for o in out)
    if keep_largest:                           # keep the biggest connected blob only
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

Then pad all five frames onto one canvas with the body (the darkest
centroid) at the same point; cropped to their own bounds they differ in
size (207 to 271px wide in the proof) and the bird jumps.

Missing material: no CC0 meerkats in 4 poses, use any upright animal with
several CC0 photos (prairie dog, penguin, owl). No boombox, see the
alternatives above. Never draw an animal, a tree or a device in CSS.

## Mechanics

Seeded random and twos:

```js
const tl = gsap.timeline({ paused: true });
const STEP = 1 / 12;
const R = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
```

Torn-edge polygon generator (rim and ink, optional shaped top for hills and
peaks):

```js
function poly(w, h, seed, amp, every, top) {
  const r = R(seed), p = [], nx = Math.round(w / every), ny = Math.round(h / every);
  for (let i = 0; i <= nx; i++) { const x = (i / nx) * w; p.push([x, (top ? top(x) : 0) + r() * amp]); }
  for (let i = 1; i <= ny; i++) p.push([w - r() * amp, (i / ny) * h]);
  for (let i = nx - 1; i >= 0; i--) p.push([(i / nx) * w, h - r() * amp]);
  for (let i = ny - 1; i > 0; i--) p.push([r() * amp, (i / ny) * h]);
  return `polygon(${p.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}
document.querySelectorAll(".tp").forEach((t, i) => {
  const w = t.offsetWidth, h = t.offsetHeight, k = R(31 + i)();
  const top = t.classList.contains("hill") ? (x) => 120 + 90 * Math.sin(x / (260 + 120 * k) + i * 1.7) + 40 * Math.sin(x / 90 + i)
            : t.classList.contains("peak") ? (x) => Math.abs(x - w / 2) * 1.6 : null;
  t.querySelector(".rim").style.clipPath = poly(w, h, 11 + i * 7, 16, 18, top);
  t.querySelector(".ink").style.clipPath = poly(w - 20, h - 20, 91 + i * 7, 9, 14, top ? (x) => top(x + 10) : null);
});
```

```css
.tp { position:absolute; filter: drop-shadow(0 6px 6px rgba(20,14,8,.28)); }
.tp > .rim { position:absolute; inset:0; background:#FBFAF6 url(paper.jpg) center/700px; background-blend-mode:multiply; }
.tp > .ink { position:absolute; inset:10px; }
```

Boil on twos without fighting the tweens (CSS individual transform
properties driven by variables, so `translate`/`rotate` stack on top of
GSAP's `transform`):

```css
.boil { translate: var(--bx, 0px) var(--by, 0px); rotate: var(--br, 0deg); }
```

```js
function boil(sel, a, b, seed, px = 1.4, rot = 0.4) {
  document.querySelectorAll(sel).forEach((el, k) => { el.classList.add("boil"); const r = R(seed * 131 + k * 17);
    for (let t = a; t < b; t += STEP * 2) tl.set(el, { "--bx": `${((r() - .5) * 2 * px).toFixed(2)}px`,
      "--by": `${((r() - .5) * 2 * px).toFixed(2)}px`, "--br": `${((r() - .5) * 2 * rot).toFixed(2)}deg` }, t); }); }
```

The dive into the speaker:

```js
tl.fromTo("#camA", { scale: 1 }, { scale: 1.05, duration: 3.4, ease: "none", transformOrigin: "960px 600px" }, 0);
tl.to("#camA", { scale: 11, duration: 0.85, ease: "power3.in", transformOrigin: `${SPEAKER_X}px ${SPEAKER_Y}px` }, 3.4);
```

Kaleidoscope: 12 wedges, alternate ones mirrored, clip-paths overlapped by
0.6% so no seam shows:

```css
#kal { position:absolute; left:50%; top:50%; width:2600px; height:2600px; margin:-1300px; }
/* a 30 deg wedge from the centre to 12 o'clock; exact edge would be 78.87%, apex 50% */
.wedge { position:absolute; inset:0; clip-path: polygon(50% 50.6%, 49.4% 0, 79.6% 0); }
.wedge .tile { position:absolute; left:50%; top:0; width:1300px; height:1300px; margin-left:-300px; }
```

```js
for (let i = 0; i < 12; i++) { const w = document.createElement("div"); w.className = "wedge";
  w.style.transform = i % 2 ? `rotate(${(i + 1) * 30}deg) scaleX(-1)` : `rotate(${i * 30}deg)`;
  w.innerHTML = TILE_HTML;   // photo + 2 paper blocks + a cut-out
  document.getElementById("kal").appendChild(w); }
```

Torn hexagonal frame:

```js
const r = R(5);
const ring = (rad, j) => { let d = ""; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2,
  s = 1 + Math.abs(Math.cos(3 * a)) * 0.08 + (r() - .5) * j;
  d += (i ? "L" : "M") + (50 + rad * s * Math.cos(a)).toFixed(2) + " " + (50 + rad * s * Math.sin(a)).toFixed(2); } return d + "Z"; };
document.getElementById("hexring").setAttribute("d", ring(44, 0.03) + ring(31, 0.04));   // fill-rule="evenodd"
```

Frame-cycle sprite (the eagle), ping-pong on 5 frames at 12 fps:

```js
function sprite(id, a, b, frames) { const el = document.getElementById(id);
  const imgs = frames.map((src) => { const im = document.createElement("img"); im.src = src; el.appendChild(im); return im; });
  const cyc = [0, 1, 2, 3, 4, 3, 2, 1]; let k = 0;
  for (let t = a; t < b; t += STEP, k++) imgs.forEach((im, n) => tl.set(im, { opacity: n === cyc[k % 8] ? 1 : 0 }, t)); }
```

Parallax hills (4 depths, 4 speeds):

```js
[["#h1", -120], ["#h2", -200], ["#h3", -320], ["#h4", -480]].forEach(([s, x], i) => {
  tl.fromTo(s, { x: 0 }, { x, duration: 2.8, ease: "none" }, 6.8);
  tl.fromTo(s, { y: 300 + i * 80 }, { y: 0, duration: 0.6, ease: "power3.out" }, 6.8 + i * 0.07); });
```

## Adapting to a brand

Takes the brand: the mark in the object's window (accent colour and glow),
the label on the object, the headline in its display or serif face, the
URL pill, the choice of object (what the brand is: audio, video, time).
The title may take the brand accent if it is warm and saturated;
otherwise keep the red with the blue shadow.

Stays fixed: the sky photo, the torn rim construction, the paper palette
(orange, red, halftone red, blue, newsprint, savanna, grass), the
silver-printed object, the dive, the 12-wedge kaleidoscope with the
orange hex frame, the Muybridge flap, the 4-speed hills, the boil on twos,
the stepped title slam. The animals can change with the brand's world
(city brand: pigeons on rooftops cut from CC0 photos), the construction
cannot.

## Pitfalls found while building

- Sets made before the timeline is registered get overridden on seek: put
  `visibility:hidden` or `opacity:0` for late things in markup and switch
  them on with `tl.set`; build all torn clip-paths before registering.
- A cut-out from a framed photo keeps the frame's box edge; take bodies
  from full photos where the animal is wholly inside the image, or mask.
- The object render is opaque: anything placed behind it is hidden. Put
  the mark, the tape label and the speaker cone ABOVE the boombox image,
  positioned in percentages of it.
- The dive target must be clear: in the proof the front meerkat stands in
  front of the right speaker, so the last frames of the dive fill with its
  face, not the speaker's black. Move foreground cut-outs off the dive line
  (or slide them out at 3.2) so the black really fills the frame.
- Wedge seams: exact 30 deg clip-paths leave a hairline of black between
  wedges on rotation; overlap them (apex 50.6%, edges 49.4% and 79.6%).
- Muybridge cells cropped to their own bounds differ in size, so frames
  anchored at top-left jump; register them on one canvas.
- `.boil` uses CSS `translate`/`rotate`, not GSAP x/y, so it never fights
  the slide-ins; do not boil with `x`/`y` on elements that also tween.
- Text stays inside the frame and on its paper: the title at 270px is
  about 820px wide for a 6 letter word (keep it under 1500px); run `scripts/frame-audit.mjs` and
  check the URL pill sits on the peak, not on the sky.

## Sound

108 BPM, playful, a bouncy bed with a groove (the speaker pumps on it:
retime the pump to 60/BPM s). whoosh on the slide-in (0.0), pop on the
boombox (0.25), pop on the mark (0.95) and each meerkat (1.3, 2.1), whoosh
on the dive (3.4), shimmer as the kaleidoscope opens (4.2), whoosh on the
eagle (4.4) and the hills (6.8), a pop per meerkat (7.3, 7.55, 7.8, 8.1),
whoosh on the peak (9.6), the one hit on the first title word (10.0), pop
on the second (10.3), shimmer on the URL (10.9).
