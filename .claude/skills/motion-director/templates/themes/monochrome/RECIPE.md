# Monochrome: the designer's desk in black and grey

An 18 second 9:16 film that looks like a designer working on a grey canvas: a
light grey dot grid, two giant soft black asterisks turning in the corners, a
black cursor that drags dashed selection boxes and the words appear inside
them, and real photographic 3D props (a megaphone, a gilt frame holding an
engraved portrait of the founder, falling pocket watches) dropped into that
flat world. The idea that makes it work: **everything is greyscale except the
real objects**, so each prop (and the brand's real site on a real phone) reads
as a precious object placed on the designer's table. The copy is one sentence
cut into 8 short beats; each beat has one verb (box it, drop it, sweep it,
circle it, run it, close the curtains on it).

## Format, length, pace

- 1080x1920, 30 fps, 18.0s (composition `data-duration="18"`), one file, 8 scenes, one 3D sub-composition.
- Score at 100 BPM, one bar = 2.40s; the grid was 20.2s and the film was cut to 18s, so beats do not sit on bar lines: cuts follow the copy.
- Scene starts (s): 0, 2.4, 4.6, 7.4, 9.4, 12.6, 14.2, 16.2. Mean shot 2.25s; shortest 1.6s (the type run), longest 3.2s (the phone).
- Scenes overlap by 0.2s (each `section` starts 0.2s before the previous one ends) so the wipe object covers the change.
- Something moves on every beat; the blobs never stop turning (50 deg over 18s).

## The look in numbers

**Ground (fixed, never brand-coloured)**
- `#bg`: `radial-gradient(70% 50% at 50% 30%, #F1F1F1, #E3E3E3 70%, #D9D9D9)`, a soft top light.
- `#dots`: `radial-gradient(circle, rgba(0,0,0,.13) 1.6px, transparent 2px) 0 0 / 30px 30px`, a 30px dot grid over the whole frame.
- `.lgrid` (a local square grid behind a prop): `linear-gradient` lines `rgba(0,0,0,.09)` 1.5px, cell 34px, masked by `radial-gradient(closest-side, #000 45%, transparent)` so it fades out in a circle. 600x600 behind the megaphone, 800x1000 behind the phone.
- Grain on top of everything: SVG `feTurbulence fractalNoise baseFrequency 1.1, numOctaves 1, seed 8`, alpha 0.14, layer opacity .35, `mix-blend-mode: multiply`, z-index 90.

**Palette**
- Fixed greys: ink `#141414` / `#161616` / `#1A1A1A`, secondary `#3C3C3C`, lower-case `#2B2B2B`, muted `#555`, `#666`, `#6B6B6B`; selection box and ring `#2A2A2A`; band `#2A2A2A` with text `#F4F4F4`; curtains `#141414`.
- Blob fill: radial gradient `#2A2A2A` (0) to `#151515` (.7) to `#0B0B0B` (1), centre at 40% 35%, hairline `rgba(255,255,255,.08)` 0.5 stroke.
- Brand colour appears ONLY inside real material: the props' own colours (red megaphone body, brass watch, gilt frame), the brand's site on the phone, and the phone's rim light (`--rim` = the brand accent). No UI chrome, type or shape takes the accent.

**Type** (the brand's display face, one variable font, all weights from it)
| role | weight | px | tracking | case | colour |
|---|---|---|---|---|---|
| thin kicker ("every founder is chasing") | 400 | 50 | +0.02em | upper | #3C3C3C |
| fat headline | 900 | 76-128 (124 hook, 128 object caption, 120 "stop", 76 boxed lines) | -0.01em | upper | #161616 |
| small label above an object | 800 | 52-66 | 0 | upper or as-written | #1B1B1B |
| lower connective ("for that", "here is the", "over") | 400-600 | 44-66 | 0 | lower | #2B2B2B, #6B6B6B |
| band text | 900 | 64 | +0.01em | upper | #F4F4F4 on #2A2A2A |
| type run | 900 | 84 | 0, 26px word gap | upper | #1A1A1A |
| italic aside | 400 italic | 36, line-height 1.35 | 0 | sentence | #555 |
| sign-off: verb / noun / domain | 700 / 900 / 400 | 66 / 110 / 36 | 0 | as-written | #161616, #666 |

- Pairs are set off-centre and stepped: the small word sits up-left (`left:-150px` on a centred line), the big word under it shifted right (`left:+90..120px`). Never two centred lines of the same size.
- Text is either tiny-editorial or huge; nothing in between 66 and 76px.

**Shadows and materials**
- Props: `filter: drop-shadow(0 30px 30px rgba(0,0,0,.28))`.
- Blobs: `drop-shadow(0 14px 18px rgba(0,0,0,.22))`.
- Band: `box-shadow: 0 30px 60px rgba(0,0,0,.25)`; an ellipse 2200x760, `border-radius: 50%`, rotated -8 deg.
- Selection box: `border: 3px dashed #2a2a2a`, four 16px round handles centred on the corners (offset -10px). It renders as a fine dotted line at phone size, which is the look.
- Cursor: 46px, the classic arrow path `M10 6 L10 52 L22 41 L31 60 L39 56 L30 38 L46 38 Z` in a 64 box, fill `#111`, stroke `#fff` 3.5, round joins, `drop-shadow(0 3px 4px rgba(0,0,0,.3))`.
- Falling watches use `filter: blur(3px)` and `blur(4px)` plus the prop shadow: depth of field on everything that is not the subject.

## Shot list

| # | time (s) | on screen | what moves and how | static | out |
|---|---|---|---|---|---|
| 0 | 0 to 18 | two 1100px asterisks, A top-left (`left:-520 top:-560`), B bottom-right (`left:500 top:1300`) | in from the corners: x/y +-120 and rotation +-20 to 0, 0.8s `back.out(1.2)`; then A turns to +50 deg and B to -45 deg over 18s `none` | dot grid, grain | fade to 0 in 0.3s at 12.6 |
| 1 | 0 to 2.6 | a dashed box 880x270 at (100,800); kicker 50px and headline 124px inside it | cursor set at (900,1300) at 0.3, glides to the box's top-left corner (100,800) 0.45s `power3.inOut`; box draws from its top-left: scaleX/scaleY 0 to 1, 0.32s `power3.out` at 0.8 while the cursor drags to the bottom-right corner (980,1070) in 0.32s; kicker pops at 1.0, headline at 1.25 (pop: opacity 0, scale 0.8/0.5, blur 6px to 1/0, 0.35/0.45s `back.out(2)`); cursor leaves to (1150,1500) 0.4s `power3.in` at 1.6 | the box once drawn | **asterisk wipe**: B flies x -900, y -1500, scale 2.4 across the frame in 0.55s `power3.inOut` at 2.05, returns 0.6s `power3.out` at 2.6; A ducks out x/y -600 0.4s `power3.in` |
| 2 | 2.4 to 4.8 | "LOOKING" 52px / "for that" 44px stepped top-left; local grid square; the megaphone prop 480px wide; "VIRAL HACK" 128px under it | words pop at 2.6 and 2.75; megaphone: scale .3 to 1, rotation -25 to 0, opacity 0 to 1, 0.6s `back.out(1.6)` at 2.7, then drifts rotation 4, y -10 over 1.8s `sine.inOut`; caption wipes on left to right: `clip-path inset(-20% 100% -20% -5%)` to `inset(-20% -5% -20% -5%)` 0.5s `power2.out` at 3.3 | local grid | dark band sweeps down over it |
| 3 | 4.6 to 7.4 | the dark band at the top; "Here is the" 48px + "truth" 104px (lower case); the gilt frame with the engraved founder, 740px wide | band: y -900 to 0 at rotation -8, 0.55s `power3.out` at 4.45; words pop 4.75 / 4.9; frame slides in x -900 to 0, rotation -12 to 4, 0.6s `back.out(1.3)` at 4.7, settles to rotation 1 over 1.0s `sine.inOut`; at 6.0 the band rolls down to y 1700 (rotation -4) 0.6s `power3.inOut` and carries frame and words out (y 1500, rotation 10, 0.55s `power3.in`); the megaphone returns (scale .6 to 1, rotation 15 to -6, 0.5s `back.out(1.5)` at 6.35) and a dashed ring (r 270, `stroke-dasharray 10 10`) draws round it in 0.7s `power2.inOut` at 6.5; band text "NO SHORTCUTS" fades in on the band at 6.55 | dot grid | band and its text drop off the bottom, y +900 0.4s `power3.in` at 7.25 |
| 4 | 7.4 to 9.4 | two dashed boxes 620x140 and 580x140, a fat 76px line in each | cursor in from (1000,1500) to the first box's corner 0.35s; box 1 draws at 7.75 while the cursor drags to its far corner (0.3s `power3.out`); line pops 7.9; cursor jumps to box 2 corner 0.3s at 8.25; box 2 draws at 8.55; line pops 8.7; cursor exits 9.1; asterisk A returns to its corner 0.6s `power3.out` | boxes | cut to the phone |
| 5 | 9.4 to 12.6 | three stepped words above (66 / 46 / 66px); local grid 800x1000; a real 3D phone with the brand's site scrolling on it | the `iphone` preset of `device-init`: rises from y -4.5 showing its back, spins round to the screen, camera closes in (see Mechanics); words pop 9.9 / 10.1 / 10.3; both asterisks shrink to scale .8 over 1s | the words | hard cut |
| 6 | 12.6 to 14.2 | one line of 84px words running right to left at y 930 (`data-bleed`) | the row slides x 900 to -620 over 1.6s `none`; each word drops in y -40 to 0, opacity 0 to 1, 0.25s `back.out(2)`, staggered 0.18s; asterisks fade out 0.3s | nothing else on screen | curtains close |
| 7 | 14.2 to 16.4 | two black curtains 600x2000 closing at an angle; "STOP" 120px / "renting" 66px; a pocket watch 360px dropping to centre; two blurred watches falling past; an italic aside 36px | curtains x +-400 to 0, rotation 0 to -12/+12, 0.5s `power3.out` (they form a V that frames the centre); hero watch y -900 to 0, rotation -30 to 0, 0.7s `back.out(1.2)` at 14.4, then swings rotation 6 yoyo 1.2s `sine.inOut`; watch 1 (260px, blur 3) falls y -300 to 2100, rotation 0 to 140, 2.0s `power1.in`; watch 2 (420px, blur 4) y -1700 to 400, rotation 30 to 160, 2.2s `power1.in`; aside fades in 0.4s at 15.1 | curtains once closed | cut |
| 8 | 16.2 to 18 | sign-off: verb 66px up-left, noun 110px down-right, domain 36px #666 under | pops at 16.35 / 16.55 / 16.9 (0.35 / 0.45 / 0.3s) | dot grid only, no blobs | hold to the end |

## Materials, and where to get them for a new brand

| material | source |
|---|---|
| the brand's display face | `brand-intake.mjs` captures the font files; `film-init.mjs` writes `@font-face` into `assets/brand.css` as "Brand display" (weights 100-900 from a variable file). One face does every weight. |
| the brand's site on the phone | capture the live site at phone width: headless Chrome `--window-size=390,7000 --force-device-scale-factor=2`, full page, saved as `device/site-phone.png` (here 390 wide, scrolled to y 5250). Pick 3 stops: the hero, the proof (numbers, client marks), the testimonials. |
| a founder portrait | the founder's own photo or a frame of their video (a YouTube still at 720p is enough), lifted with `node scripts/cutout.mjs still.png founder-cut.png`. Then engrave it (Mechanics) and composite into the frame. |
| megaphone | `node scripts/find-assets.mjs --polyhaven model megaphone_01 --out <dir>`, rendered `node scripts/prop-render.mjs <dir>/megaphone_01/Megaphone_01_1k.gltf mega.png --hdri <dir>/studio_small_09/studio_small_09_1k.hdr --ry -35 --rx 10` for a 3/4 view, bell to the left, handle down (angles approximate: the approved render's exact flags were not recorded; render 3-4 `--ry` values and pick on a sheet). |
| gilt frame | `--polyhaven model fancy_picture_frame_01`, rendered straight on (`--rx 0 --ry 0`), then `trim-alpha.mjs`. Its canvas holds a landscape painting: replace it in 2D (measured inner canvas on a 1122x870 render: x 92 to 1029, y 92 to about 780). The two meshes are both named `Plane.*`, so `--screen-mesh` cannot isolate the canvas: composite instead. |
| pocket watch | `--polyhaven model vintage_pocket_watch`, two renders: face-on (`--rx 0 --ry 0`, hero, 854x1106) and tilted 3/4 (about `--ry 35 --rx -15`, falling ones; angles approximate, pick from a sheet). |
| HDRI | `--polyhaven hdri studio_small_09` (neutral studio, keeps props greyscale-friendly). |
| the 3D phone | `node scripts/device-init.mjs --project <dir> --preset iphone --start 9.4 --duration 3.2 --id ph --rim <brand accent> --env #2a2a2a`. Phone shell takes the accent through the rim light. |

Props should tell the copy's metaphor: a megaphone for "going viral", a frame
for "the truth / the founder", clocks for "stop renting / time". Pick the
metaphor from the brand's own sentence, then search Poly Haven
(`find-assets.mjs --polyhaven model <id>`; the site lists ~500 CC0 models by
category). Missing material: no Poly Haven model, try `find-assets.mjs
"<object> isolated" --cutout --min 1400` (a real CC0 photo, lifted); no founder
photo, put the brand's real product screenshot in the frame instead, engraved
the same way; no font captured, use the nearest bundled grotesk at 400/800/900
and say so in `brand.md`. Never draw a prop in CSS.

## Mechanics

The soft asterisk (the theme's signature shape). Petals 5 for both; `phase`
rotates the lobes so two blobs never look identical:

```js
function blob(id, petals, phase) {
  const n = 400, p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.abs(Math.cos(petals * a / 2 + phase));
    const k = 0.47 * (0.2 + 0.8 * Math.pow(c, 2.4)) + 0.03 * Math.pow(c, 20);   // long rounded lobes, a slight bulb at the tip
    p.push([50 + 50 * k * Math.cos(a), 50 + 50 * k * Math.sin(a)]);
  }
  const g = id + "g", d = `M${p.map((q) => q.map((v) => v.toFixed(2)).join(" ")).join(" L")} Z`;
  document.getElementById(id).innerHTML =
    `<defs><radialGradient id="${g}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#2a2a2a"/>` +
    `<stop offset=".7" stop-color="#151515"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient></defs>` +
    `<path d="${d}" fill="url(#${g})" stroke="rgba(255,255,255,.08)" stroke-width=".5"/>`;
}
// <svg class="blob" id="blA" viewBox="0 0 100 100" style="left:-520px;top:-560px;width:1100px;height:1100px">
blob("blA", 5, 0.4); blob("blB", 5, 1.2);
```

```css
svg.blob { position: absolute; overflow: visible; z-index: 40; filter: drop-shadow(0 14px 18px rgba(0,0,0,.22)); }
```

Selection box, cursor drag and the pop:

```js
const tl = gsap.timeline({ paused: true }), C = "#cur";
const box = (b, t, from = "0 0") => tl.fromTo(b, { scaleX: 0, scaleY: 0, transformOrigin: from, opacity: 1 },
  { scaleX: 1, scaleY: 1, duration: 0.32, ease: "power3.out" }, t);
const pop = (el, t, from = 0.6, d = 0.4) => tl.fromTo(el, { opacity: 0, scale: from, filter: "blur(6px)" },
  { opacity: 1, scale: 1, filter: "blur(0px)", duration: d, ease: "back.out(2)" }, t);

// drag a box at (L,T) size WxH starting at time t: the cursor IS the box's corner
function dragBox(id, L, T, W, H, t) {
  tl.to(C, { x: L, y: T, duration: 0.35, ease: "power3.inOut" }, t - 0.35);
  box(id, t);
  tl.to(C, { x: L + W, y: T + H, duration: 0.32, ease: "power3.out" }, t);   // same duration as the box
}
tl.set(C, { x: 900, y: 1300, opacity: 1 }, 0.3);
dragBox("#b1", 100, 800, 880, 270, 0.8);
pop("#s1a", 1.0, 0.8, 0.35); pop("#s1b", 1.25, 0.5, 0.45);          // the words appear INSIDE the box after it is drawn
tl.to(C, { x: 1150, y: 1500, duration: 0.4, ease: "power3.in" }, 1.6); tl.set(C, { opacity: 0 }, 2.0);
```

```css
.box { position: absolute; border: 3px dashed #2a2a2a; z-index: 20; }
.box i { position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #2a2a2a; }
.box i:nth-child(1) { left: -10px; top: -10px; } .box i:nth-child(2) { right: -10px; top: -10px; }
.box i:nth-child(3) { left: -10px; bottom: -10px; } .box i:nth-child(4) { right: -10px; bottom: -10px; }
```

The asterisk wipe (a blob swells across the frame, the scene changes under
it, it rolls back to its corner):

```js
tl.to("#blB", { x: -900, y: -1500, scale: 2.4, duration: 0.55, ease: "power3.inOut" }, T);
tl.to("#blB", { x: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }, T + 0.55);
// the next section starts at T + 0.35, while the blob covers the centre
```

The dark band and the circle drawn round an object:

```css
#band { position: absolute; left: -500px; top: -400px; width: 2200px; height: 760px; border-radius: 50%;
  background: #2a2a2a; z-index: 30; box-shadow: 0 30px 60px rgba(0,0,0,.25); }
#ring circle { fill: none; stroke: #2a2a2a; stroke-width: 3; stroke-dasharray: 10 10; }
```

```js
tl.fromTo("#band", { y: -900, rotation: -8 }, { y: 0, rotation: -8, duration: 0.55, ease: "power3.out" }, T);
tl.to("#band", { y: 1700, rotation: -4, duration: 0.6, ease: "power3.inOut" }, T2);          // rolls down, carrying the scene
tl.to(["#frame", "#capA", "#capB"], { y: 1500, rotation: 10, duration: 0.55, ease: "power3.in" }, T2);
// ring: <svg id="ring" width="580" height="580" viewBox="0 0 580 580"><circle id="rc" cx="290" cy="290" r="270" transform="rotate(-90 290 290)"/></svg>
const rc = document.getElementById("rc"), RL = 2 * Math.PI * 270;
tl.set("#ring", { opacity: 0 }, 0); tl.set("#ring", { opacity: 1 }, T3);               // hidden until it draws
tl.fromTo(rc, { attr: { "stroke-dasharray": `0 ${RL}` } }, { attr: { "stroke-dasharray": `${RL} 0` }, duration: 0.7, ease: "power2.inOut" }, T3);
```

Note: in the approved film the CSS `stroke-dasharray: 10 10` outranks the
`attr` tween (a CSS rule beats an SVG presentation attribute), so the ring
simply appears, dashed, at T3 and the tween does nothing. That reads fine. If
you want the dashed ring to visibly draw round the object, keep the dash on
the circle and reveal it through a mask: a second, solid circle in a `<mask>`
whose `stroke-dashoffset` runs from `RL` to 0 over 0.7s `power2.inOut`.

The type run:

```js
tl.fromTo("#run", { x: 900 }, { x: -620, duration: 1.6, ease: "none" }, T);
document.querySelectorAll("#run span").forEach((s, i) =>
  tl.fromTo(s, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "back.out(2)" }, T + i * 0.18));
// #run { position:absolute; top:930px; white-space:nowrap; font-weight:900; font-size:84px; text-transform:uppercase }
// #run span { display:inline-block; margin-right:26px }   and mark #run data-bleed for frame-audit
```

Curtains and falling objects:

```js
// .cur { position:absolute; top:-40px; width:600px; height:2000px; background:#141414; z-index:15 }  left:-300px / right:-300px
tl.fromTo("#cL", { x: -400, rotation: 0 }, { x: 0, rotation: -12, duration: 0.5, ease: "power3.out" }, T);
tl.fromTo("#cR", { x: 400, rotation: 0 }, { x: 0, rotation: 12, duration: 0.5, ease: "power3.out" }, T);
tl.fromTo("#hero", { y: -900, rotation: -30 }, { y: 0, rotation: 0, duration: 0.7, ease: "back.out(1.2)" }, T + 0.2);
tl.to("#hero", { rotation: 6, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1 }, T + 0.9);
tl.fromTo("#fall1", { y: -300, rotation: 0 }, { y: 2100, rotation: 140, duration: 2.0, ease: "power1.in" }, T + 0.2);
tl.fromTo("#fall2", { y: -1700, rotation: 30 }, { y: 400, rotation: 160, duration: 2.2, ease: "power1.in" }, T);
```

The engraving (founder photo to a line-engraved plate). Run it once to bake
`portrait.png`; it is a horizontal line screen with a 4px pitch whose line
width grows with darkness, highlights left clean. Measured on the approved
plate: paper `#EEEAE0`, lines 1-3px of near-black (`#0B0B0B` to `#161616`),
gaps light grey, highlights about `#F5F5F5`, hard contrast. The original
bake step was not kept; this function is rebuilt from those measurements, so
compare its output with the reference plate on a zoomed crop and tune
`contrast`, `lift` and `cut` until the face reads in three tones (clean
highlight, fine lines, dense lines).

```js
// in a page or a node canvas: img = the cut-out (alpha), out = same size
function engrave(img, { pitch = 4, contrast = 1.7, lift = 0.08, cut = 0.62 } = {}) {
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
  const x = c.getContext("2d"); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let y = 0; y < c.height; y++) for (let X = 0; X < c.width; X++) {
    const i = (y * c.width + X) * 4; if (p[i + 3] < 8) continue;
    let L = (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]) / 255;
    L = Math.min(1, Math.max(0, (L - 0.5) * contrast + 0.5 + lift));
    let v;
    if (L > cut) v = 225 + 30 * (L - cut) / (1 - cut);                  // highlights: clean, no lines
    else { const w = 1 - L / cut, t = Math.abs(((y % pitch) + 0.5) / pitch - 0.5) * 2;
           v = t < w ? 14 : 150 + 60 * L; }                              // the line, then its gap
    p[i] = p[i + 1] = p[i + 2] = v;
  }
  x.putImageData(d, 0, 0); return c;
}
```

Then composite: fill the frame's inner canvas with `#EEEAE0`, draw the
engraved cut-out bottom-anchored and centred in it at about 75% of the canvas
height, draw the frame render over it (the frame's own alpha keeps the
moulding on top). Pitch 4px at a 1122px wide plate; scale the pitch with the
plate (pitch = plate width / 280).

The phone (`device-init --preset iphone`): rises from y -4.5 with its back to
camera, `pry` spins from 0.25 to PI + 0.18 (1.1s, ease bezier .76,0,.18,1),
camera dollies from 55% to 86% frame height; the screen HTML scrolls on eased
stops `[[0,0],[0.12,0],[0.4,860],[0.58,860],[0.92,5250],[1,5250]]` (p, page
y) with a cubic in-out between stops:

```js
var PH = [[0, 0], [0.12, 0], [0.4, 860], [0.58, 860], [0.92, 5250], [1, 5250]];   // stops: hero, proof, testimonials
function scrollAt(K, p) { for (var i = 1; i < K.length; i++) if (p <= K[i][0]) {
  var a = K[i - 1], b = K[i], u = (p - a[0]) / (b[0] - a[0] || 1);
  u = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; return a[1] + (b[1] - a[1]) * u; }
  return K[K.length - 1][1]; }
window.MD_SCREEN_ph = function (p) { document.getElementById("phone-page").style.transform = "translateY(" + (-Math.round(scrollAt(PH, p))) + "px)"; };
```

Choose the stops with `find-rows.mjs` or by measuring the captured page;
never guess them.

## Adapting to a brand

- Takes the brand: the display face (all type), the copy, the domain, the
  founder portrait, the site on the phone, the phone's rim light (accent), and
  the choice of props (the brand's own metaphors).
- Stays fixed: the grey ground, the 30px dot grid, the black asterisks, the
  `#2a2a2a` boxes, cursor, band and ring, the black curtains, the grain, every
  ease and duration above. The accent never paints a shape or a word: a brand
  with a loud colour still gets a grey film, and its colour lives in the real
  material. That restraint is the theme.
- A dark-only brand: keep the grey ground anyway; the phone and props carry it.
- 16:9: the same grammar; asterisks 900px in opposite corners, boxes and
  headlines centred in the middle third, the phone becomes `macbook`.

## Pitfalls found while building

- Rings, bands and sub-composition hosts can show at frame 0: set them to
  `opacity: 0` at time 0 on the timeline (`tl.set("#ring", {opacity:0}, 0)`)
  and only reveal on the frame they start drawing; any `fromTo` that starts
  later than 0 and must not affect frame 0 needs `immediateRender: false`.
- The blob wipe must cover the change: the incoming section starts 0.2s
  before the outgoing one ends, and the blob is scaled 2.4x at that moment.
  Check the two frames either side of the cut on a sheet; a blob that passes
  too high leaves the old words visible.
- The italic aside over the curtains (shot 7) sits where the curtain edges
  and a falling watch cross it; at 36px #555 it loses contrast. Keep any line
  in that shot inside the V between the curtains and above y 1100, or drop it.
- Blobs crossing words: the asterisks are z-index 40, above copy. Plan copy in
  the middle 60% of the frame and check every 4th frame for a lobe on a letter.
- Text inside boxes: the boxed lines must fit inside the dashed box with
  20px+ air; run `scripts/frame-audit.mjs <dir>` (text outside its box, text on
  text, text outside the frame). The type run is the only line allowed off
  frame and must carry `data-bleed`.
- Cursor path and box must share duration and ease, or the box corner and the
  cursor tip separate mid-drag.
- The megaphone reappears in shot 3 as a second element (`#mega2`): hide it
  with `tl.set(..., {opacity:0})` at the section start or it shows under the
  band.

## Sound

- 100 BPM, vibe `minimal`, A minor; riser into 4.8, drop at 4.8, logo cue at
  9.6. Mix -14 LUFS.
- UI sounds on events: whoosh on the blob entrance (0.0) and each wipe (2.05,
  4.45 band, 6.0 band roll, 9.4 phone), click when the cursor starts each box
  (0.8, 7.75, 8.55), pop on each headline (1.25, 2.7 megaphone, 4.9 frame,
  10.3), shimmer as the ring draws (6.5), four ticks on the type run words
  (12.60, 12.78, 12.96, 13.14, one per word at the 0.18s stagger), one hit when
  the curtains close and the watch lands (14.4), a pop on the sign-off noun
  (16.55).
