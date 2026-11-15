# Logo build: the mark is made, the product is used, the mark is made again

A 12 second 9:16 film in one continuous move, no hard cuts. Five black dots
appear one by one, slide into a row, curl into an arc and whip round into the
brand's real logo. The logo collapses into a glowing accent orb and the
brand's real pages fly out of depth past the camera. A white ask bar grows out
of nothing, a real query is typed and the send button is pressed. The answer
arrives as a 3D carousel of real pages that turns twice on the beat; the camera
crops into one. Four thick accent strokes sweep the frame and pull away, and
the logo lands again. The idea that makes it work: **the logo is built out of
its own parts and the product is shown by using it**, so the brand is the
animation, not a label on it. Every object springs or arcs; nothing is linear
except the progress bar.

## Format, length, pace

- 1080x1920, 30 fps, composition 12s, delivered 11.73s (the end hold trimmed).
- Score at 112 BPM, one bar = 2.14s; drop at 4.29 (the pages finish flying, the ask bar grows), logo cue at 8.57.
- Beats (s): dots 0.15-0.63, row to arc 0.95, whip 1.35-2.0, logo pops 1.98, breath 2.6, collapse 2.95, fly-past 3.25-5.5, ask bar 5.0, typing 5.6-6.5, press 7.38, carousel 7.65, turns 8.35 and 8.75, crop-in 9.25, strokes 9.95, logo 10.8, hold to the end.
- One continuous shot: every hand-off overlaps the next by 0.1-0.5s (the bar grows while the last pages are still passing; the carousel rises while the bar leaves).

## The look in numbers

**Ground**
- Warm paper `#F4F3EF` with three soft light pools, drifting x -50, y +30 over the whole film (`sine.inOut`), on an element 120% of the frame (`inset: -10%`) so the drift never shows an edge:
  - `radial-gradient(42% 32% at 82% 12%, <accent> at 30% alpha, transparent 70%)`
  - `radial-gradient(48% 36% at 12% 92%, <accent> at 22% alpha, transparent 72%)`
  - `radial-gradient(60% 40% at 30% 20%, rgba(255,214,140,.30), transparent 70%)` (a fixed warm light)
- Grain: SVG `feTurbulence fractalNoise baseFrequency 1.1, numOctaves 1, seed 8`, alpha 0.18, opacity .35, `multiply`, z-index 90.

**Palette (roles)**
- Ink `#111` (dots, the mark, the tile behind a mark card).
- Accent = brand accent: orb, caret, send button, the 4 strokes, the progress bar, the light pools.
- Orb: `radial-gradient(circle at 40% 35%, <accent 45% to white>, <accent> 55%, transparent 72%)`, `blur(2px)`.
- Cards and bar: `#fff`, hairline `0 0 0 1.5px rgba(0,0,0,.06-.07)`.
- Card text: title `#111`, meta `#8a8782`, progress track `#eceae6`.

**Type** (the brand's UI face; the film has almost no copy)
| role | weight | px | tracking | case |
|---|---|---|---|---|
| typed query in the bar | 500 | 50 | -0.01em | sentence |
| card title | 700 | 34 | -0.01em | title |
| card meta | 400 | 24 | 0 | sentence, `#8a8782` |
- No headline, no tagline. The only words are the ones a user would type or see in the product.

**Shadows and shapes**
- Mark: 400x400 at (340,760), `drop-shadow(0 30px 40px rgba(0,0,0,.18))`; if the mark is an outline on white (an app-icon logo), a white rounded tile behind it: 376px, radius 70px, `drop-shadow(0 30px 50px rgba(0,0,0,.14))`.
- Flying cards: radius 26px, `box-shadow: 0 40px 70px -24px rgba(0,0,0,.35)`; container `perspective: 1400px`.
- Ask bar: 860x136 at (110,870), radius 30px, `box-shadow: 0 30px 70px -26px rgba(0,0,0,.3)`; send button 84px circle in the accent with a white arrow (stroke 3, round caps); caret 4x52px in the accent.
- Click ring: 150px circle, `border: 9px solid #fff`, `box-shadow: 0 0 0 2px rgba(0,0,0,.08), 0 10px 30px rgba(0,0,0,.2)`.
- Carousel cards: 500x640 at (290,640), radius 30px, image 72% of height (`object-fit: cover; object-position: top left`), caption block at the bottom; container `perspective: 1600px`; `box-shadow: 0 40px 80px -26px rgba(0,0,0,.4)`.
- Strokes: 30px, round caps, accent, `drop-shadow(0 10px 18px <accent at 35%>)`.
- Dots: 22px circles in ink.

## Shot list

| # | time (s) | on screen | what moves and how | static | out |
|---|---|---|---|---|---|
| 1 dots | 0.15 to 0.95 | 5 dots at the centre (540,960) | each pops scale 0 to 1, 0.18s `back.out(3)` and slides to x 440 + i*50 in 0.35s `power3.out`, staggered 0.12s, so they line up as they appear | ground | they curl |
| 2 arc and whip | 0.95 to 1.98 | the dots on an arc of radius 150 round the centre | `arc.r` 0 to 1 in 0.5s `power2.inOut` (row bends onto a 0.9 PI arc), then `arc.a` 0 to 3 PI in 0.65s `power3.in`; each dot stretches scaleX = 1 + a*0.25, a motion streak | ground | dots vanish 0.12s at 1.98 |
| 3 the mark | 1.98 to 3.37 | the real logo (and its white tile) | scale 0 to 1, rotation -40 to 0, 0.55s `back.out(2.2)`; breathes to 1.06 0.25s `power2.out` at 2.6; collapses scale 0, y +40, 0.42s `back.in(2)` at 2.95 | ground | becomes the orb |
| 4 fly-past | 3.25 to 5.5 | the accent orb at centre; 5 real pages (4 screenshots, 1 dark tile holding the mark) from depth | orb pops 0.3s `back.out(2)`, then swells to 2.4x and fades over 1.2s `power2.in`; each card `z` from (z0 - 300) to (z0 + 1000) with rotationX/Y/Z tumbling to the opposite sign over 1.55s `power1.in`, staggered 0.12s; fades in 0.25s, out 0.2s at 4.7 + i*0.12 | orb centre | cards pass the camera; layer hidden at 5.5 |
| 5 ask | 5.0 to 7.97 | the ask bar | grows from a pill: scaleX 0.08, scaleY 0.5 to 1, 0.55s `back.out(1.6)`; the query types one character every 0.045s from 5.6; the caret blinks off/on at 6.6 and 7.0 (0.2s off); the ring appears on the send button (scale 1.4 to 1, 0.2s at 7.15), presses (0.85, 0.1s at 7.38), leaves (opacity 0, scale 1.2, 0.25s) | the bar while typing | bar flies up: y -760, scale .86, fade, 0.42s `back.in(1.4)` at 7.55 |
| 6 carousel | 7.65 to 10.25 | 5 real page cards fanned in 3D, centre card captioned | each rises from y 500 into its pose, 0.5s `back.out(1.4)`, staggered 0.05s; the ring turns one step at 8.35 and again at 8.75 (0.38s `power3.inOut`); only the centre card shows its caption; its progress bar runs scaleX .12 to .7 over 2.6s `none` from 8.8; camera crops in: container scale 1.65, y -230, 0.6s `power3.inOut` at 9.25 while the side cards fade 0.25s | the centre card's page | container fades 0.2s at 10.05 |
| 7 strokes to mark | 9.95 to 11.73 | 4 thick accent strokes crossing the frame (two near-horizontal, one diagonal, one low) | each draws on (dashoffset L to 0, 0.42s `power2.out`, staggered 0.07s), then draws off the far end (0 to -L, 0.4s `power2.in` at 10.5 + i*0.05); the mark lands scale 0 to 1, rotation 30 to 0, 0.6s `back.out(2)` at 10.8 | ground | hold on the mark |

## Materials, and where to get them for a new brand

| material | source |
|---|---|
| the logo as ONE SVG path | `brand-intake.mjs` records a vector mark (Simple Icons when one exists, or the site's inline SVG). Keep it as a `<path>` with an `id`, reused with `<use href="#id">` on the mark card. A raster-only logo: trace it (potrace) or use the PNG with `trim-alpha.mjs`; the whip still works, the stroke ending does not need the path. |
| 4-5 real product pages | the brand's own product screenshots picked in `brand-intake.mjs pick --shots` (square or 4:3 crops work best in the 500x640 and 520-640px cards). Real UI only; no marketing banners. |
| product video frames | frames of the site's own product video that brand-intake saves (here three 1152x720 stills); one of them is a flying card and a carousel card. |
| the query | a real thing a user types into this product (from the site's own examples or the brief), 18-24 characters so it fits 860px at 50px. |
| card captions | the real page names and one real status line ("Working on <ticket>") from the screenshots themselves. |
| a product with no ask bar | use its primary input (search field, command bar, URL field, prompt box) styled after its real UI; if it has no input at all, replace shot 5 with the cursor pressing its main button. |

No free assets are needed: this theme runs on the brand's own logo and screens.
If fewer than 4 real screens exist, ask the user for them before building; do
not fill cards with drawn UI.

## Mechanics

Dots to row to arc to whip (5 dots; the arc spans 0.9 PI, centred on top):

```js
const tl = gsap.timeline({ paused: true });
const N = 5, CX = 540, CY = 960, R = 150, ROW0 = CX - 100, GAP = 50, pts = [];
for (let i = 0; i < N; i++) { const d = document.createElement("div"); d.className = "dot"; dots.appendChild(d); pts.push(d); }
pts.forEach((d, i) => {
  gsap.set(d, { left: CX, top: CY, scale: 0, opacity: 1 });
  tl.to(d, { scale: 1, duration: 0.18, ease: "back.out(3)" }, 0.15 + i * 0.12);
  tl.to(d, { left: ROW0 + i * GAP, duration: 0.35, ease: "power3.out" }, 0.15 + i * 0.12);
});
const arc = { a: 0, r: 0 };
function placeArc() { pts.forEach((d, i) => {
  const row = ROW0 + i * GAP, ang = arc.a + (i / (N - 1)) * Math.PI * 0.9 - Math.PI * 0.45 - Math.PI / 2;
  const ax = CX + Math.cos(ang) * R, ay = CY + Math.sin(ang) * R;
  gsap.set(d, { left: row + (ax - row) * arc.r, top: CY + (ay - CY) * arc.r, scaleX: 1 + arc.a * 0.25, scaleY: 1 });
}); }
tl.to(arc, { r: 1, duration: 0.5, ease: "power2.inOut", onUpdate: placeArc }, 0.95);          // the row bends
tl.to(arc, { a: Math.PI * 3, duration: 0.65, ease: "power3.in", onUpdate: placeArc }, 1.35);   // the whip
tl.to(pts, { scale: 0, opacity: 0, duration: 0.12 }, 1.98);
tl.fromTo(["#mark", "#markbg"], { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.2)" }, 1.98);
```

```css
.dot { position: absolute; width: 22px; height: 22px; margin: -11px; border-radius: 50%; background: var(--ink, #111); }
```

`onUpdate` writes with `gsap.set` from the tweened object only, so it is
deterministic under frame seeking. If the brand's mark is round, end the arc
as a full circle (span 2 PI) so the dots become its outline.

3D fly-past of real pages:

```js
// #fly { position:absolute; inset:0; perspective:1400px }  .fc { position:absolute; border-radius:26px; overflow:hidden }
// [selector, z0, rotationX, rotationY]; place cards round the centre, alternating corners, sizes 330-640px
const F = [["#f1", -700, 30, -20], ["#f2", -900, -25, 28], ["#f3", -1100, 40, -30], ["#f4", -800, -30, 22], ["#f5", -600, 20, -16]];
gsap.set("#fly", { opacity: 0 }); tl.set("#fly", { opacity: 1 }, T);
F.forEach(([s, z, rx, ry], i) => {
  const t = T + 0.05 + i * 0.12;
  tl.fromTo(s, { z: z - 300, rotationX: rx, rotationY: ry, rotationZ: ry / 2, opacity: 0 },
               { z: z + 1000, rotationX: -rx * 0.5, rotationY: -ry * 0.6, rotationZ: 0, opacity: 1, duration: 1.55, ease: "power1.in" }, t);
  tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t);
  tl.to(s, { opacity: 0, duration: 0.2 }, t + 1.4);
});
tl.set("#fly", { opacity: 0 }, T + 2.25);
```

Ask bar growing, typing with caret, click ring:

```js
gsap.set("#ask", { scaleX: 0.08, scaleY: 0.5, opacity: 0 });
tl.to("#ask", { opacity: 1, duration: 0.1 }, T);
tl.to("#ask", { scaleX: 1, scaleY: 1, duration: 0.55, ease: "back.out(1.6)" }, T);
const Q = "<a real query, 18-24 chars>", typed = document.getElementById("typed");
for (let i = 1; i <= Q.length; i++) tl.set(typed, { textContent: Q.slice(0, i) }, T + 0.55 + i * 0.045);
const done = T + 0.55 + Q.length * 0.045;
[done + 0.1, done + 0.5].forEach((t) => { tl.set("#caret", { opacity: 0 }, t); tl.set("#caret", { opacity: 1 }, t + 0.2); });
// the ring sits on the send button's centre (measured from the bar's layout, here 888,938)
tl.fromTo("#ring", { left: BX, top: BY, scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, P - 0.23);
tl.to("#ring", { scale: 0.85, duration: 0.1 }, P);                         // the press
tl.to("#ring", { opacity: 0, scale: 1.2, duration: 0.25 }, P + 0.12);
tl.to("#ask", { y: -760, scale: 0.86, opacity: 0, duration: 0.42, ease: "back.in(1.4)" }, P + 0.17);
```

```html
<div id="ask"><div class="q"><span id="typed"></span><i class="caret" id="caret"></i></div>
  <div class="go"><svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
```

Carousel pose function (k = position relative to the centre card):

```js
const C = ["#c0", "#c1", "#c2", "#c3", "#c4"];
const pose = (k) => ({ x: k * 360, z: -Math.abs(k) * 320, rotationY: -k * 30, opacity: Math.abs(k) > 1.5 ? 0 : 1 });
C.forEach((c, i) => { gsap.set(c, { ...pose(i), opacity: 0 });
  tl.fromTo(c, { ...pose(i), y: 500, opacity: 0 }, { ...pose(i), y: 0, duration: 0.5, ease: "back.out(1.4)" }, T + i * 0.05); });
const cap = (c, on, t) => tl.to(c + " .meta", { opacity: on ? 1 : 0, duration: 0.12 }, t);
C.forEach((c, i) => gsap.set(c + " .meta", { opacity: i === 0 ? 1 : 0 }));       // only the centre card is captioned
[[1, T1], [2, T2]].forEach(([to, t]) => C.forEach((c, i) => {
  tl.to(c, { ...pose(i - to), duration: 0.38, ease: "power3.inOut" }, t);
  cap(c, i === to, i === to ? t + 0.26 : t);                                    // new caption shows after the turn lands
}));
tl.to("#car", { scale: 1.65, y: -230, duration: 0.6, ease: "power3.inOut" }, T3);  // crop into the centre card
tl.to(C.filter((_, i) => i !== 2), { opacity: 0, duration: 0.25 }, T3);
```

Strokes that draw on, draw off, and hand over to the mark:

```js
// <svg id="strokes" viewBox="0 0 1080 1920"> 4 cubic paths crossing the frame edge to edge:
//  M -100 760 C 300 700, 640 860, 1180 720     M -100 980 C 260 1100, 700 880, 1180 1060
//  M 200 1500 C 420 1200, 560 1000, 900 420     M 1180 1300 C 760 1260, 380 1460, -100 1380
["#k1", "#k2", "#k3", "#k4"].map((s) => document.querySelector(s)).forEach((p, i) => {
  const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`;
  gsap.set(p, { strokeDashoffset: L, opacity: 0 });                              // hidden: a round cap shows even at offset L
  tl.set(p, { opacity: 1 }, T + i * 0.07); tl.set(p, { opacity: 0 }, T + 0.97 + i * 0.05);
  tl.to(p, { strokeDashoffset: 0, duration: 0.42, ease: "power2.out" }, T + i * 0.07);
  tl.to(p, { strokeDashoffset: -L, duration: 0.4, ease: "power2.in" }, T + 0.55 + i * 0.05);
});
tl.fromTo(["#mark", "#markbg"], { scale: 0, rotation: 30, y: 0 }, { scale: 1, rotation: 0, y: 0, duration: 0.6, ease: "back.out(2)", immediateRender: false }, T + 0.85);
```

```css
#strokes path { fill: none; stroke: var(--accent); stroke-width: 30; stroke-linecap: round;
  filter: drop-shadow(0 10px 18px color-mix(in srgb, var(--accent) 35%, transparent)); }
```

## Adapting to a brand

- Takes the brand: the logo path (both mark moments and the mark card), the
  accent (orb, caret, button, strokes, progress, light pools), the UI face,
  the real pages, the real query, the real page names.
- Stays fixed: warm paper ground and its warm pool, ink dots, white cards and
  bar, every timing and ease above, the 0.9 PI arc and 3 PI whip, the 5-card
  pose function, one continuous shot with no hard cut.
- A dark brand: keep the paper ground (the theme is light); put the dark
  colour into the mark tile and let the accent pools carry the hue. A very
  light accent (yellow, mint): darken it 25% for the caret, strokes and button
  so they hold on paper.
- A logo that is a wordmark only: the dots whip into the first letter's
  bounding box, then the wordmark wipes on beside it (clip-path left to right,
  0.4s `power2.out`).
- 16:9: the same beats; dots and mark at the centre, fly-past cards wider
  (16:10 screenshots), carousel spacing x = k * 520.

## Pitfalls found while building

- Stray stroke caps: a path with round caps paints a dot at its start even
  when `strokeDashoffset = L`. Keep each stroke at `opacity: 0` until the frame
  it starts drawing and set it back to 0 the frame it has fully drawn off.
- Side-card captions overlap the centre card: in perspective the side cards'
  caption blocks slide under the centre card's edge. Only the centre card shows
  its caption; switch captions 0.26s into each turn, when the new card is
  nearly centred.
- The click ring visible at frame 0: any `fromTo` that starts later must
  carry `immediateRender: false`, and the ring needs `opacity: 0` set before the
  timeline starts.
- The flying cards' opacity tweens overlap the transform tween; the second
  `fromTo` on opacity must also be `immediateRender: false` or the card shows
  at full opacity before its start.
- The ask bar grows while the last pages are still passing (5.0 to 5.5):
  intended overlap, but keep the bar above the fly layer (later in the DOM) or
  a card passes in front of the empty bar.
- The mark's white tile is 24px smaller than the mark and offset 12px; at the
  breath (scale 1.06) its corner peeks out. Scale tile and mark together, from
  the same transform origin.
- Typing time = characters * 0.045s: a query over 24 characters runs past
  the press beat and overflows the 860px bar at 50px. Check with
  `scripts/frame-audit.mjs` (text outside its box).
- The font was loaded by name only (`font-family: "Inter"`), so the render
  depended on what the machine had installed. Always load the brand face with
  `@font-face` from `assets/brand.css`.

## Sound

- 112 BPM, vibe `minimal`, A minor; riser across the second bar into the drop
  at 4.29.
- UI sounds on events: five ticks as the dots appear (0.15, 0.27, 0.39, 0.51,
  0.63, one per dot at the 0.12s stagger), whoosh on the whip (1.35), pop as
  the mark lands (1.98), whooshes as the pages fly (3.3, 3.9), pop as the bar
  grows (5.0), a typing bed from 5.6 for the length of the query, click on the
  press (7.38), whoosh as the bar leaves (7.65), a tick on each carousel turn
  (8.35, 8.75), whoosh as the strokes sweep (9.95), one hit as the mark lands
  (10.8).
