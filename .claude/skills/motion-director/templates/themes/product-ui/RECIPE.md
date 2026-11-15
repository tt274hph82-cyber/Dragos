# Product UI: draw the mark, box the words, use the product, play it

An 11 second 9:16 film on a monochrome dot grid with two giant soft black
asterisks turning in the corners. The brand's real logo path is stroked on
like a pen drawing and then fills. A designer's cursor drags two dashed
selection boxes and the tagline appears inside them, tiny editorial over huge
bold. The brand's real input bar springs in, a real query is typed, the cursor
presses send. A huge dark disc sweeps diagonally across the frame and, under
it, the scene becomes the brand's real product screen turning in 3D; it hands
over to the brand's own product video, playing as a frame stack while the
camera crops in. The board pops away into the mark and domain. The idea that
makes it work: **a grey designer's canvas where the only rich thing is the
real product**, and every beat is an act a user or designer does (draw,
select, type, press, watch).

## Format, length, pace

- 1080x1920, 30 fps, 11.0s, four scenes at 120 BPM (one bar = 2.00s).
- Scene windows (s): logo 0 to 2.6, words and ask 2.4 to 5.6, product 5.4 to 9.55, sign-off 9.4 to 11.0. Each overlaps the next by 0.15-0.2s.
- Beats (s): stroke 0 to 1.0, fill 1.1, pulse 1.15, label 1.4, logo exits 2.25, box 1 at 2.75, box 2 at 3.38, ask bar 3.85, typing 4.3 to 5.04, press 5.12, band 4.98 to 5.78, scene swap under the band 5.36, card turns 5.36 to 7.65, video 7.2 to 9.2, crop-in 7.75 to 9.05, mark 9.45, domain 9.75.
- Signature moment: the logo draws itself (frame 0 already shows 18% of its outline, so the first frame is never empty).

## The look in numbers

**Ground (fixed)**
- `#E8E8E8` with `radial-gradient(circle, rgba(0,0,0,.16) 1.6px, transparent 2px) 0 0 / 30px 30px`: a flat light grey with a 30px dot grid. No vignette, no grain.

**Palette**
- Fixed: ink `#111`, kicker `#3A3A3A`, selection `#1A1A1A`, band `#1B1B1C`, white bar and cards `#fff`, placeholder `#9B9A97`, typed text `#191919`.
- Blob fill: radial gradient `#2C2C2E` (0) to `#18181A` (.6) to `#0D0D0E` (1) at 38% 32%, plus an inner light (white at 18% along the top-left inner edge).
- Brand accent appears in exactly one designed place: the send button (76px circle). Everything else that has colour is the real product (screens, video).

**Type** (the brand's UI face)
| role | weight | px | tracking | line-height | case | colour |
|---|---|---|---|---|---|---|
| `.small` editorial (kicker, logo label, domain under the video) | 500 | 34 | +0.06em | normal | upper | #3A3A3A |
| `.huge` (the tagline's key words, the end domain) | 800 | 112 (88 for the end domain) | -0.025em | 1 | as written | #111 |
| typed query / placeholder | 500 | 48 | 0 | normal | sentence | #191919 / #9B9A97 |
- Tiny editorial or huge bold, nothing in between. Text is always centred on a measured box.

**Shapes and shadows**
- Asterisks: two 1100px SVG blobs, A top-left (`left:-420 top:-480`, 5 petals), B bottom-right (`left:520 top:1340`, 3 petals), `drop-shadow(0 18px 24px rgba(0,0,0,.28))`, z-index 30.
- Selection box: `border: 3px dashed #1a1a1a`, four 14px round handles offset -9px; box 1 780x84, box 2 860x150.
- Cursor: 58px arrow (`M10 6 L10 52 L22 41 L31 60 L39 56 L30 38 L46 38 Z` in a 64 box), fill `#111`, stroke `#fff` 3.5, `drop-shadow(0 5px 8px rgba(0,0,0,.35))`.
- Click ring: 120px, `border: 8px solid #fff`, `box-shadow: 0 0 0 2px rgba(0,0,0,.15)`; it expands and fades (scale .4 to 1.3).
- Ask bar: 900x130 at (90,1050), radius 26px, `box-shadow: 0 30px 60px -24px rgba(0,0,0,.35), 0 0 0 1.5px rgba(0,0,0,.08)`; 64px mark at the left, 24px gap.
- Product card: 900x600 at (90,560), radius 30px, `box-shadow: 0 50px 90px -30px rgba(0,0,0,.45)`, stage `perspective: 2200px`.
- Video card: 800x500 at (140,560), same radius and shadow.
- Band: a disc 3100x2900, `border-radius: 1450px`, `#1b1b1c`, `rotate(-38deg)`, `box-shadow: 0 0 80px rgba(0,0,0,.35)`, z-index 35.
- Logo stroke: width 0.35 in a 24-unit viewBox at 400px (about 5.8px on screen), `#111`, butt caps.

## Shot list

| # | time (s) | on screen | what moves and how | static | out |
|---|---|---|---|---|---|
| 0 | 0 to 11 | the two asterisks | A rolls in from x -500, y -400, rotation -60, 0.8s `back.out(1.2)` at 0; B from x 500, y 500, rotation 60 at 0.25; then A turns to 40 deg and B to -35 deg over 10s `none`; at the sign-off both shift in (A x 120 y 140, B x -120 y -160, 0.6s `back.out(1.4)`) | dot grid | stay |
| 1 logo | 0 to 2.6 | the brand's logo path, 400px, centred at y 660; a `.small` label with the brand name under it at y 1130 | stroke draws `strokeDashoffset` L*0.82 to 0, 1.0s `power2.inOut`; fill-opacity 0 to 1, 0.2s at 1.1; pulse scale .9 to 1.06 0.18s `power2.out` at 1.15, settle to 1 0.4s `back.out(2)`; label springs at 1.4 (scale .6 to 1, 0.4s `back.out(1.9)`) | logo after it lands | logo flies up y -1200, scale .4, 0.45s `back.in(1.4)` at 2.25; label fades 0.15s |
| 2 words | 2.4 to 5.36 | box 1 with the kicker, box 2 with the huge words, the ask bar under them | cursor in from (980,1300) to box 1's corner 0.35s `power3.inOut`; box 1 draws from top-left 0.3s `power3.out` at 2.75 as the cursor drags to its far corner; kicker rises y 14 to 0, 0.25s `back.out(2)` at 2.95; cursor to box 2 0.28s at 3.1; box 2 draws at 3.38; huge words scale .6 to 1, 0.42s `back.out(2.2)` at 3.55; both boxes fade 0.15s at 3.9; ask bar springs scale .3 to 1, 0.5s `back.out(1.9)` at 3.85 | words after they land | band |
| 3 ask | 4.3 to 5.36 | the bar with placeholder, then the typed query | one character every 0.035s from 4.3 (21 characters, done at 5.04), caret on at 4.3, blinks off/on at 4.8/5.0 and 5.2/5.4; cursor glides to the send button 0.35s at 4.75; cursor squashes to .82 and back (0.07s yoyo) at 5.1; the white ring expands from the button, scale .4 to 1.3 and fades, 0.4s `power2.out` at 5.12 | the bar | under the band all of scene 2 is hidden in one frame at 5.36 |
| band | 4.98 to 5.78 | the dark disc | x 1500, y 1900 to x -1600, y -2100, 0.8s `power2.inOut`; its centre crosses the frame centre at about 5.36 | | reveals scene 3 |
| 4 product | 5.36 to 7.6 | the brand's real product screen as a card | rises: rotationY -38 to -12, rotationX 14 to 6, y 400 to 0, opacity 0 to 1, 0.7s `back.out(1.4)` at 5.36; turns on: rotationY -12 to 10, rotationX 6 to 2, 1.5s `sine.inOut` at 6.15 | | blurs out (filter blur 10px, opacity 0, 0.35s at 7.25) as the video card lands over it |
| 5 video | 7.2 to 9.52 | the product video as a frame stack; the domain in `.small` under it | video card: opacity 0 to 1, scale .7 to 1.08, rotationY 20 to 0, y 80 to 0, 0.55s `back.out(1.5)` at 7.2; 66 frames shown one after another every 1/36s (1.83s); domain springs at 7.6; camera crops in: scale 1.75, x 120, y 90, 1.3s `power2.inOut` at 7.75 while the domain slides y +260 to stay under it | | pops away: scale .2, opacity 0, 0.32s `back.in(1.6)` at 9.2 |
| 6 sign-off | 9.4 to 11 | the mark 300px at y 700, the domain in `.huge` 88px at y 1060 | mark scale 0 to 1, rotation -25 to 0, 0.55s `back.out(2)` at 9.45; domain y 40 to 0 and fades in, 0.4s `back.out(2)` at 9.75; asterisks lean in | hold | end |

## Materials, and where to get them for a new brand

| material | source |
|---|---|
| logo as one SVG `<path>` | `brand-intake.mjs` (Simple Icons vector when one exists, else the site's inline SVG). The stroke-on needs a path; put it in the logo `<svg>` with an `id` and reuse it in the bar and the sign-off with `<use href="#id">`. A raster-only logo: trace it (potrace, at 1-2px tolerance) or skip the stroke and reveal the PNG through a growing `clip-path: circle()`. |
| tagline | the brand's own hero line, split into a 3-5 word kicker (small) and a 2-3 word punch (huge, under 860px at 112px). |
| input bar | the product's real input, rebuilt in HTML at hero size after a screenshot of it: its placeholder, its icon (the mark), its send button in the accent. Query = a real example prompt, about 20 characters. |
| product screen | one real product screenshot picked in `brand-intake.mjs pick --shots` (here 3840x2400, shown 900x600 with `object-position: top`). The busiest, most recognisable screen. |
| product video | the site's own product video, which brand-intake samples. Make the stack: `ffmpeg -i product.mp4 -ss <start> -t 5.5 -vf "fps=12,scale=1152:-1" -q:v 3 assets/devframes/f%03d.jpg` (66 frames). Playing 12 fps frames at 36 fps runs the clip 3x fast, which reads as "it works" in under 2s. Pick a stretch where the UI visibly changes. |
| no product video | screen-record the product yourself or ask the user for a 5-10s capture; else replace shot 5 with a second real screenshot and a slow crop, no fake motion. |
| font | the brand's UI face via `@font-face` in `assets/brand.css`; never by name only. |

No free stock is needed: this theme runs on the brand's own logo, copy,
screens and video.

## Mechanics

The asterisk with an inner light (A with 5 petals, B with 3):

```js
function blob(id, petals, phase) {
  const n = 360, p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.abs(Math.cos(petals * a / 2 + phase));
    const k = 0.47 * (0.22 + 0.78 * Math.pow(c, 2.2)) + 0.47 * 0.06 * Math.pow(c, 18);
    p.push([50 + 50 * k * Math.cos(a), 50 + 50 * k * Math.sin(a)]);
  }
  const d = `M${p.map((q) => q.map((v) => v.toFixed(2)).join(" ")).join(" L")} Z`, g = id + "g";
  document.getElementById(id).innerHTML = `<defs>
    <radialGradient id="${g}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#2c2c2e"/><stop offset=".6" stop-color="#18181a"/><stop offset="1" stop-color="#0d0d0e"/></radialGradient>
    <filter id="${g}i"><feGaussianBlur in="SourceAlpha" stdDeviation="1.1"/><feOffset dx="-.6" dy="-.8"/>
      <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="e"/><feFlood flood-color="#fff" flood-opacity=".18"/>
      <feComposite in2="e" operator="in"/><feComposite in2="SourceGraphic" operator="over"/></filter></defs>
    <path d="${d}" style="fill:url(#${g})" filter="url(#${g}i)"/>`;
}
blob("blobA", 5, 0.3); blob("blobB", 3, 1.1);
```

Logo stroke-draw with `getTotalLength`, then fill and pulse:

```js
// #logo path { fill: #111; stroke: #111; stroke-width: .35 }   (viewBox 0 0 24 24 at 400px)
const lp = document.getElementById("lp"), L = lp.getTotalLength();
lp.style.strokeDasharray = L;
tl.fromTo(lp, { strokeDashoffset: L * 0.82, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 1.0, ease: "power2.inOut" }, 0);
tl.to(lp, { fillOpacity: 1, duration: 0.2 }, 1.1);
tl.fromTo("#logo", { scale: 0.9 }, { scale: 1.06, duration: 0.18, ease: "power2.out" }, 1.15);
tl.to("#logo", { scale: 1, duration: 0.4, ease: "back.out(2)" }, 1.33);
tl.to("#logo", { y: -1200, scale: 0.4, duration: 0.45, ease: "back.in(1.4)" }, 2.25);
```

A compound logo path (several subpaths) draws all its subpaths at once along
one dash, which looks like a pen tracing every edge together; that is the
look. For a logo made of separate `<path>`s, stagger them 0.08s.

Cursor boxes the words (box and cursor share duration and ease):

```js
const C = "#cur";
tl.set(C, { x: 980, y: 1300, opacity: 1 }, T);
tl.to(C, { x: L1, y: T1, duration: 0.35, ease: "power3.inOut" }, T);
tl.fromTo("#b1", { scaleX: 0, scaleY: 0, transformOrigin: "0 0" }, { scaleX: 1, scaleY: 1, duration: 0.3, ease: "power3.out" }, T + 0.35);
tl.to(C, { x: L1 + W1, y: T1 + H1, duration: 0.3, ease: "power3.out" }, T + 0.35);
tl.fromTo("#t1", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.25, ease: "back.out(2)" }, T + 0.55);
// box 2 the same, 0.63s later; the huge words: scale .6 to 1, 0.42s back.out(2.2)
```

Typing, caret, press and expanding ring:

```js
const typed = document.getElementById("typed"), Q = "<a real query>";      // starts showing the placeholder span
for (let i = 1; i <= Q.length; i++) tl.set(typed, { textContent: Q.slice(0, i) }, T + i * 0.035);
tl.set("#caret", { opacity: 1 }, T);
[T + 0.3, T + 0.7].forEach((t) => { tl.set("#caret", { opacity: 0 }, t + 0.2); tl.set("#caret", { opacity: 1 }, t + 0.4); });
tl.to(C, { x: BX - 28, y: BY, duration: 0.35, ease: "power3.inOut" }, P - 0.37);          // onto the send button
tl.fromTo(C, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, immediateRender: false }, P - 0.02);
tl.fromTo("#ring", { left: BX, top: BY, scale: 0.4, opacity: 1 }, { scale: 1.3, opacity: 0, duration: 0.4, ease: "power2.out", immediateRender: false }, P);
```

The band wipe and the one-frame swap under it:

```js
// <div id="band" style="position:absolute;left:-1000px;top:-500px;width:3100px;height:2900px;border-radius:1450px;
//   background:#1b1b1c;z-index:35;transform:rotate(-38deg);box-shadow:0 0 80px rgba(0,0,0,.35)">
tl.fromTo("#band", { x: 1500, y: 1900 }, { x: -1600, y: -2100, duration: 0.8, ease: "power2.inOut" }, W);
tl.set(["#t1", "#t2", "#ask", "#cur", "#ring"], { opacity: 0 }, W + 0.38);   // the frame the disc covers the whole old layout
// the next scene's first move starts on that same frame, so it is revealed by the band's trailing edge
```

Real product card turning in 3D:

```js
// .stage { position:absolute; inset:0; perspective:2200px }
tl.fromTo("#card", { rotationY: -38, rotationX: 14, y: 400, opacity: 0 }, { rotationY: -12, rotationX: 6, y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.4)" }, S);
tl.to("#card", { rotationY: 10, rotationX: 2, duration: 1.5, ease: "sine.inOut" }, S + 0.79);
```

Product video as a frame stack (deterministic: no `<video>` element):

```js
const vid = document.getElementById("vid"), N = 66, FPS = 36;
for (let i = 1; i <= N; i++) { const im = document.createElement("img"); im.className = "vf";
  im.src = `assets/devframes/f${String(i).padStart(3, "0")}.jpg`; vid.appendChild(im); }
const vfs = vid.querySelectorAll(".vf");                       // .vf { position:absolute; inset:0; opacity:0 } + object-fit:cover
tl.fromTo("#vid", { opacity: 0, scale: 0.7, rotationY: 20, y: 80 }, { opacity: 1, scale: 1.08, rotationY: 0, y: 0, duration: 0.55, ease: "back.out(1.5)" }, V);
tl.to("#card", { opacity: 0, filter: "blur(10px)", duration: 0.35 }, V + 0.05);
vfs.forEach((f, i) => { tl.set(f, { opacity: 1 }, V + i / FPS); if (i) tl.set(vfs[i - 1], { opacity: 0 }, V + i / FPS); });
tl.to("#vid", { scale: 1.75, x: 120, y: 90, duration: 1.3, ease: "power2.inOut" }, V + 0.55);   // crop toward the part that changes
tl.to("#vid", { scale: 0.2, opacity: 0, duration: 0.32, ease: "back.in(1.6)" }, V + 2.0);
```

Choose the crop target (x, y) on the region of the video that moves most;
measure it on the frames, do not guess.

## Adapting to a brand

- Takes the brand: the logo path (stroke-on, bar icon, sign-off), the name
  label, the tagline, the UI face, the input bar's look and query, the send
  button's accent, the product screen, the product video, the domain.
- Stays fixed: the `#E8E8E8` dot grid, the black asterisks, the dashed
  boxes, the black cursor and white ring, the dark disc wipe, tiny-or-huge
  type, all timings and eases above.
- A brand whose logo is a filled blob with no interior edges: the stroke-on
  shows only an outline; that is fine, but let the fill come in at 0.9 not 1.1.
- A very colourful logo: keep the stroke in `#111`, then fill with the real
  colours at 1.1; it is the first colour on screen and it should feel earned.
- 16:9: tagline on one line, input bar 1100px, product card 1280x800, the
  disc 4400px, crop scale 1.5.

## Pitfalls found while building

- The cursor and ring sit above the band (z-index 50 and 49 over 35), so at
  the wipe they show on top of the black disc for 0.2s (visible in the film at
  5.33). Hide them on the press frame + 0.15s, or give the band z-index 55.
- The wipe must fully cover before the swap: the old scene is hidden in one
  frame (`tl.set(... opacity 0)`) at the moment the oversized disc covers the
  whole of its layout, never on a fade. Check frames W+0.3 to W+0.45 on a
  sheet; if any old word pokes out at the disc's edge, make the disc larger or
  move the swap 1-2 frames later.
- Frame 0 with a stroke-on logo: starting `strokeDashoffset` at L*0.82 shows
  18% of the outline at frame 0, so the film never opens on an empty frame.
  A stroke with round caps would show dots at every subpath start before it
  draws: keep `stroke-linecap: butt` or hide the path until its first frame.
- The ring and any later `fromTo` must carry `immediateRender: false` or they
  render their from-state (ring at full opacity) from frame 0.
- The video card at scale 1.75 runs past the frame edges by design; keep the
  domain line outside its box and check it with `scripts/frame-audit.mjs`
  (text on text, text outside its box). The audit is also what keeps the
  kicker and the huge words inside their dashed boxes with air.
- The asterisks are z-index 30, above the product card: plan the card in the
  middle band (y 560 to 1160) and check every 4th frame for a lobe across UI.
- The font was set by name only (`"Inter"`): load the brand face with
  `@font-face`, or the render depends on the machine.

## Sound

- 120 BPM, vibe `minimal`, D major; riser from 2.0 into the drop at 6.0, logo
  cue at 9.45. Mix -14 LUFS.
- UI sounds on events: whoosh as the asterisks roll in (0.1), pop when the
  logo fills (1.15), tick as each box is drawn (2.75, 3.38), pop as the bar
  springs (3.6), a typing bed from 4.33 for the query, whoosh as the band
  starts (5.05), click on the press (5.12), shimmer as the video lands (7.2),
  whoosh as the board pops away (9.2), one hit on the mark (9.45).
