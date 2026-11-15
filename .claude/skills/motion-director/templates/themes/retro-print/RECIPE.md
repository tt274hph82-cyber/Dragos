# Retro print: a risograph poster that boils

A 9 second square poster loop printed in two reds on cream paper. A
two-red sunburst panel turns behind an old beige computer with a smiling
pixel face; a pixel cursor clicks it, a sparkle pops, the computer shrinks
away into the rays; then BOOM: the panel drops, an extruded title slams in
above it, the computer comes back huge and tilted with the brand's content
on its pixel screen, and a ring of thick-outlined objects (lightning bolts,
a stopwatch, an hourglass, a pixel cursor, a grid sheet, pixel squares)
bursts out from behind it. Everything jitters on twos while the stopwatch
ticks and the screen flips its pictures, then it collapses back and plays
again. The idea that makes it work: every edge in the frame crawls like
riso ink because one SVG displacement filter changes its noise seed every
1/12 s, so flat vector shapes read as a printed object that is alive, and
each beat is a physical verb (click, shrink, drop, slam, burst, tick,
collapse).

## Format, length, pace

- 1080x1080 (1:1), 30 fps, 9.0 s. Two cycles: cycle 1 from 0.0, cycle 2
  from 4.4 (the last one holds instead of collapsing). Loops cleanly as a
  post. For 9:16 stretch the panel to 980x1300 and put the title above it.
- One continuous frame, no cuts; the editorial frame never moves.
- Everything on twos: `steps(round(duration * 12))`. The rays turn
  `steps(108)` over 9 s (0.5 deg a step, 6 deg/s).
- Measured beats per cycle (t0 = 0 or 4.4): +0.25 cursor glides in,
  +0.85 click and sparkle, +1.25 screen off and the computer shrinks,
  +1.8 panel drops, title slams, computer returns big, objects burst
  (+1.85 to +2.13, 0.04 s stagger), +2.0 subtitle, +2.3 to +3.9 jittering
  hold (stopwatch ticks every 0.25 s, screen frames at +2.0 / +3.0 / +3.5),
  +4.1 collapse.

## The look in numbers

| element | value |
|---|---|
| paper | cream `#FCE9CB` ground; mottling: `feTurbulence` fractalNoise baseFrequency .012, 3 octaves, tinted (.8,.55,.35) alpha .35, multiply, opacity .5 |
| speckle | `feTurbulence` baseFrequency .9, 2 octaves, colour matrix rows (.55, .3, .15) and alpha `1.4 -.55` (only the darkest flecks survive), multiply, opacity .55, over everything |
| ink boil | `filter: url(#rough)` on the panel, the objects and the title: `feTurbulence fractalNoise .9, 2 octaves` into `feDisplacementMap scale 5`, filter region -5%/110% |
| panel | 980x700 at (50,150), `overflow:hidden`, a 1900px disc of `repeating-conic-gradient(#C23A22 0 9deg, #E16A49 9deg 18deg)`: 40 rays, 9 deg each, two reds |
| outline ink | `#160c0a` (warm black); every object has a solid black copy offset +10,+12 behind it (the hard print shadow), never a blurred shadow |
| fixed colours | yellow `#FFC93C` (bolts, subtitle), peach `#E8977A` (stopwatch face, computer stripe), cream `#FCE9CB` (object bodies, so they read as paper showing through), white `#FFFFFF` (cursor, sparkle, pixel squares), editorial red `#D9573F` |
| title | brand display face, weight 900, `font-stretch:125%`, 122px, line-height .9, tracking -0.01em, UPPERCASE, brand accent fill, extrusion of 9 text-shadows stepping 2px to 18px in `#160c0a`, centred at top 96 |
| subtitle | brand display 900, stretch 112%, 64px, lowercase, `#FFC93C`, `-webkit-text-stroke: 4px #160c0a; paint-order: stroke fill`, shadow `4px 5px 0 #160c0a`, centred at top 232 (it overprints the panel's top edge) |
| editorial frame | tag bar 380x44 `#D9573F` flush left at top 30, with a 120px stripe cut `repeating-linear-gradient(115deg, transparent 0 14px, cream 14px 22px)` at its right end; handle (the domain) 22px weight 500 `#2a1712` at (40,39); a 5px `#D9573F` rule with round ends from x 440 to 950 at top 50; issue number `#01` right at 40; bottom: a kicker left ("<thing> of the week"), a rule from x 300 to 880, a cadence right ("Every video") at bottom 34 |
| objects | the computer 440x440, stopwatch 300x320, bolts 290x250 and 260x230, hourglass 140x200, pixel cursor 230x250 (`shape-rendering: crispEdges`), grid sheet 700x560 drawn in 5px cream lines, two pixel squares 60 and 50 |

Colour rule: two reds, one yellow, cream, warm black, white accents. No
gradients except the paper noise. The brand accent fills the title and the
red of the pixel screen; if the brand accent is not a red or orange, the
panel stays in its two reds and the accent goes to the title only.

## Shot list (one cycle; the film is two)

| time (from t0) | on screen | what moves and how | static | out |
|---|---|---|---|---|
| 0.0-1.25 | panel at (50,150) 980x700, the computer at `y 30, scale 1.05, rotation -6` with the smile screen, editorial frame | cursor `x 180 to 130, y 240 to -70`, 0.5 s `steps(6)` from +0.25; click: `scale .7 to .6` 0.08 s at +0.8, back at +0.9; sparkle `scale 0 to 1, rotation 0 to 45`, 0.25 s `steps(3)` at +0.85, out `scale 0` 0.17 s at +1.15; cursor gone at +1.0 | panel, frame, the computer | screen goes black at +1.25 |
| 1.25-1.8 | the computer alone, screen dark | `scale 1.05 to .32, rotation -6 to 8, y 10`, 0.5 s `steps(6)`: it falls away into the rays | rays keep turning | the drop |
| 1.8-2.3 | title, subtitle, panel lower, computer huge, burst | panel `top 150 to 250, height 700 to 720`, 0.17 s `steps(2)`; title `scale 1.6 to 1, y -40 to 0, opacity 0 to 1`, 0.25 s `steps(3)`; subtitle `scale .4 to 1`, 0.25 s `steps(3)` at +2.0; computer `scale 1.42, rotation -16, y 110, x -10`, 0.25 s `steps(3)`; each object from `-2.2x` its offset, `scale .2, rotation -30` to home, 0.33 s `steps(4)`, 0.04 s apart; screen frame 1 (envelope) at +2.0 | editorial frame | none |
| 2.3-4.1 | the full poster | every 1/6 s every object and the computer move `+-2px` in x and y (seeded); stopwatch hand jumps to 8 positions 45 deg apart every 0.25 s; screen frames: play button at +3.0, envelope at +3.5 | title, subtitle, panel | the collapse |
| 4.1-4.4 | panel back up, computer tiny | title, subtitle, objects `opacity 0` instantly; panel back to `top 150, height 700` and computer to `scale .3, rotation 6, y 20`, 0.17 s `steps(2)` | rays | cycle 2 starts at 4.4 |

The last cycle holds its jittering poster from +2.3 to the end (4.2 s of
jitter instead of 3.9) and never collapses.

## Materials and where to get them for a new brand

Everything is drawn in SVG in the page: no photos, no downloads. This theme
is the exception to "real material over drawn": a riso print IS flat
drawn shapes, and the boil makes them physical.

- **The brand's own**: the display face (the heaviest weight; a wide or
  extended cut is best, `font-stretch:125%` if the font is variable), the
  accent for the title, the domain for the handle, a short title (one or two
  words, under about 900px wide at 122px: "THE LETTER", "NEW DROP"), a
  lowercase subtitle (one word), an issue number, a kicker and a cadence.
- **The pixel screen** carries the brand's story in 3 frames on a 12px pixel
  grid drawn with `<path>` rects: frame 0 the "before" (a smile, the mark),
  frame 1 the product (an envelope for a newsletter, a chat bubble, a cart),
  frame 2 the payoff in the accent (a play button, a check, the logo in
  pixels). Trace the brand mark onto a 10x10 or 12x12 grid for frame 2.
- **The objects** are the props of the brand's promise, each a simple
  silhouette in cream or yellow with a black offset copy: time (stopwatch,
  hourglass), speed (bolts), clicks (pixel cursor), structure (grid sheet).
  Swap them for the brand: a coin and a chart for finance, a mic and a
  waveform for audio. Keep 6-8 of them.
- **Missing material**: if the brand has no display face with a heavy
  weight, use the bundled heaviest grotesque at weight 900; never a thin
  face, the extrusion needs mass.

## Mechanics

Twos and seeded random:

```js
const tl = gsap.timeline({ paused: true });
const STEP = 1 / 12, st = (d) => `steps(${Math.max(1, Math.round(d * 12))})`;
const R = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
```

The rough filter and its seed boil (the heart of the look):

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="5"/>
  </filter>
</svg>
```

```js
const turb = document.querySelector("#rough feTurbulence");
for (let t = 0, k = 0; t < FILM_LENGTH; t += STEP, k++) tl.set(turb, { attr: { seed: 3 + (k % 7) } }, t);
```

Seven seeds in rotation are enough; more reads as noise, fewer as a loop.
Keep `scale` at 4-6: higher tears the type apart.

Sunburst rays turning on twos:

```css
#panel { position:absolute; left:50px; top:150px; width:980px; height:700px; overflow:hidden; filter:url(#rough); }
#rays  { position:absolute; left:50%; top:50%; width:1900px; height:1900px; margin:-950px; border-radius:50%;
         background: repeating-conic-gradient(from 0deg, var(--ray-a) 0deg 9deg, var(--ray-b) 9deg 18deg); }
```

```js
tl.fromTo("#rays", { rotation: 0 }, { rotation: 54, duration: FILM_LENGTH, ease: `steps(${FILM_LENGTH * 12})` }, 0);
```

The extruded title (9 stacked hard shadows):

```css
#title { font-family:"Brand display"; font-weight:900; font-stretch:125%; font-size:122px; line-height:.9;
  color: var(--accent); letter-spacing:-0.01em; text-transform:uppercase; white-space:nowrap; filter:url(#rough);
  text-shadow: 2px 2px 0 #160c0a, 4px 4px 0 #160c0a, 6px 6px 0 #160c0a, 8px 8px 0 #160c0a, 10px 10px 0 #160c0a,
               12px 12px 0 #160c0a, 14px 14px 0 #160c0a, 16px 16px 0 #160c0a, 18px 18px 0 #160c0a; }
```

A thick-outlined object = the shape twice, black offset copy first:

```html
<svg class="obj" id="bolt1" width="290" height="250" viewBox="0 0 230 200">
  <path d="M20 70 L130 20 L110 80 L210 60 L80 180 L110 110 L20 130 Z" fill="#160c0a" transform="translate(10 12)"/>
  <path d="M20 70 L130 20 L110 80 L210 60 L80 180 L110 110 L20 130 Z" fill="#FFC93C"/>
</svg>
```

Pixel screen frames, flipped by the timeline:

```js
const showScreen = (n, t) => ["#scr0", "#scr1", "#scr2"].forEach((s, i) => tl.set(s, { opacity: i === n ? 1 : 0 }, t));
```

The burst and the jittering hold:

```js
const pos = { "#bolt1": [-80, -40], "#bolt2": [80, 30], "#watch": [60, -60], "#glass": [40, 50],
              "#cur": [-60, 60], "#grid": [0, 30], "#px1": [90, -20], "#px2": [-40, 80] };
Object.keys(pos).forEach((o, i) => { const [dx, dy] = pos[o];
  tl.fromTo(o, { opacity: 1, x: -dx * 2.2, y: -dy * 2.2, scale: .2, rotation: -30 },
               { x: 0, y: 0, scale: 1, rotation: 0, duration: .33, ease: st(.33) }, t0 + 1.85 + i * .04); });
const r = R(Math.round(t0 * 10) + 7), objs = ["#pc", ...Object.keys(pos)];
for (let t = t0 + 2.3; t < t0 + 3.9; t += STEP * 2)
  objs.forEach((o) => tl.set(o, { x: `+=${((r() - .5) * 4).toFixed(1)}`, y: `+=${((r() - .5) * 4).toFixed(1)}` }, t));
for (let k = 0; k < 8; k++)   // stopwatch hand: 8 ticks, 45 deg apart
  tl.set("#hand", { attr: { x2: 128 + 54 * Math.cos(-.55 + k * .78), y2: 152 + 54 * Math.sin(-.55 + k * .78) } }, t0 + 2.3 + k * .25);
```

Build the whole cycle as `cycle(t0, last)` and call it twice; reset every
property it touches with `tl.set` at `t0` so cycle 2 starts clean.

## Adapting to a brand

Takes the brand: title fill (accent), pixel screen frames (its product and
mark in pixels), the payoff frame's red, the handle (domain), issue number,
kicker, cadence, the display face, the choice of 6-8 props.

Stays fixed: cream paper, the two-red sunburst, warm-black offset outlines,
yellow bolts and subtitle, the speckle and mottling, the rough filter and
its 1/12 s seed boil, the twos timing, the click, shrink, drop, burst,
hold, collapse cycle. A dark brand still prints on cream: this is a paper
look, never invert the ground.

## Pitfalls found while building

- Sets made at load before the timeline is registered get overridden on
  seek: start hidden things with `opacity:0` set by the timeline at `t0`
  (`tl.set([...], { opacity: 0 }, t0)`), or `visibility:hidden` in markup.
- The title enters at `scale 1.6`: for its first stepped drawing it is
  wider than the frame and is cut at both edges. Keep the title under
  900px at rest, or enter at `scale 1.3`; frame-audit flags text outside
  the frame.
- The cursor was aimed by eye and clicks the panel beside the computer,
  not the computer. Measure the target's box and land the cursor tip on it.
- The `+=` jitter is a random walk: over 1.6 s it drifts up to about 6px.
  Fine for a hold; for longer holds use absolute offsets around home.
- The filter region must be padded (`x="-5%" width="110%"`) or the
  displacement clips the edges flat.
- `filter:url(#rough)` on a large container is the render's slowest part;
  apply it to the panel, the stage and the title only, never to `#root`.
- Text stays inside the frame and off the panel's edge where it would sit
  on stripes: run `scripts/frame-audit.mjs`. The subtitle overprinting the
  panel's top edge is deliberate and has a 4px stroke for legibility.

## Sound

104 BPM, playful, a bouncy synth bed. Per cycle: click on the cursor click
(0.85), pop on the sparkle (1.0), whoosh on the shrink (1.25), the one hit
on the drop and title slam (1.8), pop on the subtitle (2.0), ticks with the
stopwatch (3.0, 3.5), whoosh on the collapse (4.1). Cycle 2 repeats the
click, whoosh and pop (5.25, 5.65, 6.2) without a second hit, and ticks on
the hold (7.4, 7.9).
