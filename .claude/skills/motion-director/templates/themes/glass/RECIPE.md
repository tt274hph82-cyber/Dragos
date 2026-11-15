# Glass: recipe

A dark launch film where the brand's colours move as silk light under frosted
glass panes, and ONE camera flies through a single 3D world: a hook that is
already a result at frame 0, one object that bursts into the product's parts,
a tracked pipeline, the real numbers stamped on glass plates (the drop), the
real client marks on a turning wall, the real site alive on a 3D laptop and
phone, then the mark landing on the hit. It works because nothing is ever
still or flat: the ground is light, every pane catches a sweep of light as it
lands, whatever is not the subject sits back blurred, and every move is cut
to the beat grid so picture and score read one measurement.

Two approved builds: a 16:9 product launch (24.8s, 120 BPM) and a 9:16
channel intro (19.55s, 128 BPM). Same grammar, different shot content.

## Format, length, pace

| | 16:9 launch | 9:16 channel intro |
|---|---|---|
| frame | 1920x1080, 30 fps | 1080x1920, 30 fps |
| length | 24.8s (12 bars + 0.8s tail) | 19.55s (8 bars + 4.55s end card) |
| BPM / beat / bar | 120 / 0.5s / 2s | 128 / 0.469s / 1.875s |
| cues | `drop` = bar4 (8.0s), `logo` = bar10 (20.0s) | `drop` = bar4 (7.5s), `logo` = bar8 (15.0s) |
| shots | 2, 2, 4, 4, 4, 4, 4.8s | 1.875, 1.875, 3.75, 3.75, 3.75, 4.55s |

Rule of pace: shots are whole bars (1 bar for the hook and the first object,
2 bars for every shot after), something new lands on every beat inside a
shot, the signature numbers land on the drop, the mark lands on `logo` and
holds 4.5-4.8s. Cuts are never hard: each shot leaves by a dive, a whip or a
blur-out 0.24-0.45s before its bar line.

## The look, in numbers

**Ground.** A WebGL silk canvas (`MD.silk`, `md-silk.js`) under everything:
- `colors: [ground, accent-deep, accent-light]`
  - ground: the brand's darkest neutral, or `#0E0D0C` / `#050404` if the brand is light
  - accent-deep: the accent at ~65-70% brightness (accent `#CA433C` gave `#8E2A25`)
  - accent-light: the accent lifted 30-40% toward white, saturation kept (`#E07B73`, `#FF5A4F`)
- `intensity` 0.32 (16:9) / 0.4 (9:16) behind copy; `speed` 0.55-0.6; `angle` 0.62 (16:9 default, diagonal ribbons) or 1.9 (9:16, ribbons run more vertically)
- level rides the grid (`MD.silkLevel`): up to 0.62-0.7 on the build into the drop, 0.5-0.55 on the drop, down to 0.22 under the client wall, 0.24-0.3 under the end card.

**Glass pane** (`.md-glass` in `md-world.css`): fill `linear-gradient(150deg, rgba(255,255,255,.16), rgba(255,255,255,.04))`, `backdrop-filter: blur(22px) saturate(160%)`, rim `inset 0 1px 0 rgba(255,255,255,.45)`, hairline `inset 0 0 0 1px rgba(255,255,255,.12)`, drop `0 40px 90px -30px rgba(0,0,0,.45)`, accent glow `0 0 80px -10px` accent at 35%. Radius per object: pills = half height (66px, 60px), cards 34px, tiles 28px, stations 32px, plates 36px, client tiles 24px, disc = half width. The sheen is a 105deg band, white 28%, 36% wide, `mix-blend-mode: screen`.

**Depth of field.** Not in focus = `filter: blur(7-9px)` + opacity 0.45-0.55 + pushed back `z: -260`. In focus = blur 0, opacity 1, `z: +80`.

**World.** `.md-world` perspective 1600px, origin 50% 46%; the camera is the `.md-rig` inside it (always carries `data-layout-allow-overflow`).

**Finish.** `.md-vignette` radial 120%x90% at 50% 45%, clear to 55%, black 22% at the edge; `.md-grain` SVG fractal noise (baseFrequency 0.9, 2 octaves) at 5% opacity, overlay, static.

**Palette roles.**
- `--ground`: silk ground and root background (dark always; this theme is dark even for a light brand, the brand's light colour becomes `--ink`)
- `--ink`: `#F8F7F3` or the brand's near-white
- `--muted`: ink at 60-62%
- `--accent`: dots, progress bars, rail light, ring stroke, chart bars, CTA face
- `.md-lit` (the key word, lit not painted): a light tint of the accent with an accent glow. 16:9: `color #FFB4AD; text-shadow 0 0 34px` accent at 85%. 9:16: `color #FF6A5F; text-shadow 0 0 30px` accent at 90%
- a second brand colour, if the brand has one, for ONE hero word per film (9:16 used a yellow `#FFC93C` with `0 0 40px` at 35% on the hook's last word and the end card's last line)
- fixed: chart gradient `linear-gradient(180deg, accent-light, accent)`; buyer dots `#F8F7F3` with `0 0 14px rgba(255,255,255,.7)`

**Type.** The brand's display face, captured by brand-intake.

16:9 (sentence case):
| role | weight | size | tracking | line-height |
|---|---|---|---|---|
| hook slam | 700 | 280px | -0.025em | 0.9 |
| shot headline | 700 | 110-124px | -0.025em | 0.9 |
| device-shot line | 700 | 76px | -0.025em | 0.9 |
| caption under a world | 600 | 58px | -0.02em | 0.9 |
| tile / station title | 700 | 56 / 72px | -0.025em | 1 |
| number on a plate | mono 700 (JetBrains Mono) | 132px | -0.025em | 1 |
| timecode | mono 700 | 64px | -0.02em | 1 |
| label | body 600 | 20-30px | 0.2em, UPPERCASE | 1 |
| CTA | body 600 | 46px in a pill, padding 26px 64px | 0 | 1 |

9:16 (UPPERCASE, wide): display 900, `font-stretch: 112%`, tracking -0.025em, line-height 0.92, box `left:76px; right:162px` (the right rail is kept clear).
| role | size |
|---|---|
| hook slam | 116px, last word 176px in the second colour |
| shot line | 78px |
| caption | 56px |
| big count | 150px |
| end-card lines | 92px, line pitch 110px |
| doc title in a pane | 800, stretch 105%, 52px, lh 1.04 |
| part title | 800, 38px |
| label | 700, stretch 112%, 26px, 0.2em, ink 62% |
| CTA | 800, stretch 112%, 40px, 0.14em, padding 30px 60px, square corners |

Never tighter than -0.025em. Keep every line `white-space: nowrap` with a measured size so it never wraps unplanned.

## Shot list, 16:9 launch (120 BPM, B = beat index, B1 = 0.5s)

| time | on screen | what moves and how | static | out |
|---|---|---|---|---|
| 0-2.0 hook | the pain number as a 2-line slam ("N hours / a week.", the number `.md-lit`) at left 130px, top 230/500, 280px; a glass REC pill (600x132, right side, top 300) with a dot and a mono timecode; at B2 a 110px line "You record." under the pill | lines `zoom@0` and `zoom@0.18` (per word: scale 2.4 to 1, blur 16 to 0, 0.45s, stagger 0.09, expo.out); pill `z -300 to 0, blur 10 to 0, 0.5s expo.out` at 0; timecode `count` 0 to 4 in 1.3s formatted `0{n}:00:00` then stamped; dot blinks every beat (`scale 1.35 to 1, opacity 1 to .55, 0.42s`); sweep over the pill at B1.2; rig punch 5% at B3 | the silk moves; nothing else idles | pill whips left `x -700, blur 24, 0.26s power3.in` at B3.74; lines `zoom` out (scale 1.7, blur 14, 0.25s) at B3.7-3.75 |
| 2-4 record | a glass "recording" card (720x500, right) with a 44-bar waveform and a progress bar; 2-line headline left at 120px, `mask` in at B4.2 / B4.5 | card `MD.fly` from z -1100, ry -24, 0.75s; waveform bars re-scale every half beat (seeded, 0.22s power2.out); progress scaleX 0 to 1 linear B4.3 to B6; at B6-0.15 the card shrinks to 0.6 and blurs out (0.3s); at B6 six glass tiles (the product's six jobs, 520x230) burst from the card's spot to a 2x3 3D arc (`z -400 to slot z`, rotationY to +-14/+-12/0, scale 0.3 to 1, blur 12 to 0, 0.7s expo.out, 0.06s stagger), each tile's bar fills (0.8s power2.inOut, 0.09s stagger); whole tile group drifts x -60 y -20 to B8 | headline holds | the camera dives: rig `scale 2.6, opacity 0, blur 18, 0.45s power3.in` ending on B8 |
| 4-8 pipeline | three glass stations (500x430) on a 1640px rail at y 760: phase label + title + a live viz (dots pouring to a point; a ring filling while a dot runs a line; four bars growing) | stations `MD.fly` z -700, y 200, rx 30, 0.8s, 0.09 stagger; camera keys on the rig: B8 x 884 scale 1.55 (station 1), B11 x 0, B13 x -884 (0.55s power3.inOut each), B14.4 pull back to x 0 y -40 scale 0.92 (0.75s); DOF moves with it (in-focus sharp, others blur 9 / 45%, 0.5s); rail light scaleX 0 to 1 from B9 to B14 power1.inOut; sweep on each station on its beat (B9, B11, B13); 18 dots converge from a seeded ring (r 220-380) in 0.9s power2.in, 0.055 stagger; ring `stroke-dashoffset 490 to 0` 0.9s; bars scaleY 0 to 1 0.5s expo.out 0.09 stagger; caption line `words@B14.4` (58px, bottom, last 2 words lit) | the rail | rig blurs out 0.25s at B15.7 |
| 8-12 proof (drop, signature) | three glass number plates (540x420) in a row: the brand's three real numbers, mono 132px, a 34px caption under each | plates `MD.fly` z -1200, 0.7s, 0.07 stagger on the drop; rack focus to each half a beat before its count: in-focus `z 80, blur 0, opacity 1`, others `z -260, blur 7, opacity .55`, rotationY [20, 0, -20] (a 3D arc), 0.45s power3.out at B16.8 / B18.8 / B20.8; each number counts 0.5s from 0 (`count`, shows nothing before) and is stamped (1.12 to 1, 0.35s expo.out); B22.3 all to z -60 sharp, camera eases to scale 0.94; one sweep across all three at B22.5 (1.0s) | the plates' captions | rig blurs out 0.25s at B23.7 |
| 12-16 founders | a 30px letter-spaced label at top 150 ("people we have built for"); nine real client logos on 440x190 glass tiles in a 3x3 wall (pitch 480 x 220), centred at 960, 560 | each tile flies from z -1400 with seeded x +-250, y +-150, rotationY +-25, blur 16, 0.7s expo.out, 0.13s apart from B24; the whole wall turns `rotationY -16 to 12, rotationX 6 to -4` over 2 bars sine.inOut; one sweep over all tiles at B26.5; at B28-0.45 the wall rises away (y -260, scale 0.8, blur 10, 0.45s power3.in); then the brand's tagline in 2 lines, 124px, centred, `mask@B28` / `B28.5` | the label | lines blur out at B31.7 |
| 16-20 device | the real site on a 3D laptop AND phone (`duo` preset), one 76px line above them ("N pillars. One system.", the second half lit) | device scene: laptop rises from y -3.2 tilted (rx 0.45, ry -0.95 rad) to rest in 0.88s (bezier .16,1,.3,1), the phone rises from below with a 1.3 rad turn 0.35s later; the camera dollies in until 2.48s, then drifts; both screens scroll the captured site on eased stops (see Mechanics) | the line | the end card covers it |
| 20-24.8 end card | the brand mark in a glass disc (340, top 150), the wordmark (190px high, inverted to white) under it, a CTA pill, the domain in a 30px label | disc lands on `logo`: scale 1.8 to 1, z 400 to 0, blur 16 to 0, 0.45s expo.out, then stamp 7%; sweep over the disc at logo+0.3; wordmark wipes in by clip-path left to right 0.55s power3.inOut at logo+0.5; CTA `rise@B42`, domain `words@B43`; sweep over the CTA face at B44 | everything holds to the end | none |

## Shot list, 9:16 channel intro (128 BPM, B1 = 0.469s)

| time | on screen | what moves and how | out |
|---|---|---|---|
| 0-1.875 hook | the channel's own line in 3 stacked lines, UPPERCASE (116 / 116 / 176px, the last in the second colour), top 500/630/760; a glass pill "LATEST ON YOUTUBE" (842x120, top 1120) with a play triangle | line 1 and the pill are `present@0` (ink on frame 0); line 2 `zoom@B1`, line 3 `zoom@B2`; rig punch 4% at B1, 6% at B2; pill settles 1.06 to 1 over 0.8s; sweeps on the pill at B1 and B3 | pill whips left x -900 blur 24 at B3.75; lines zoom out B3.6-3.7 |
| 1.875-3.75 video | the newest video's real thumbnail in a glass player (842x520, top 450) with a glass play button and a progress bar; 2 lines at 78px under it | player `MD.fly` z -1200, y 160, rx 28, ry -10, 0.75s; progress linear B4.4 to B7.6; sweep B5.5 | dive: rig scale 3.4, blur 18, 0.42s, origin on the player |
| 3.75-7.5 write-up | a glass document pane (title of the real article + 2 skeleton lines), then four 410x240 part tiles in a 2x2 grid below, one per beat pair (B9, B11, B13, B14): prompts, code, tools, downloads, each with a tiny live viz | doc opens out of the dive (scale 0.55 to 1, 0.6s); each part flies from above-centre (y -360/-600, x +-216, z -600, rx 30, scale 0.4) in 0.6s expo.out, sweep 0.3s after; skeleton lines draw (scaleX, 0.25s, 0.18 stagger); brace glyph stretches in (scaleX 1.8 to 1); 3 tool squares pop (y 60, 0.45s, 0.09 stagger); download bar fills 0.8s; rig drifts y -40; caption `words@B14.5` | everything folds: x/y to 0, scale 0.15, rx 60, blur 12, 0.32s, 0.03 stagger, ending on the drop |
| 7.5-11.25 letter (drop, signature) | a glass envelope pane (842x540) with a glowing accent seal and the newsletter's name, then three real rows (thumbnail 244x137 + real title, 842x176 panes at top 420/620/820), a 150px count of the real archive size and a label | envelope slams on the drop (scale 1.6, z 600, 0.45s, stamp 6%), sweep; at B18.4 it flies up and away (y -560, scale 0.42); rows drop in from above one per beat (y -260, z -500, rx -35, 0.6s), sweep each; rows glide y -80 over 1.4s; count `count@B21.6` 0.8s, label `wipe@B22.6` | rig blurs out at B23.7 |
| 11.25-15 device | the real site on a 3D phone (`iphone` preset) | phone rises showing its BACK (the coloured shell reads as an object), spins to the screen (1.1s, bezier .76,0,.18,1), camera closes to 86% frame height; screen scrolls hero, archive, sign-up | cut to the end card |
| 15-19.55 end card | the founder's round avatar in a glass disc (320, top 370), 3 lines at 92px (last in the second colour), a CTA, the domain | disc lands on `logo` like the 16:9 mark; lines `mask` at B32.5 / B33.3 / B34.1; CTA `wipe@B35`; domain `words@B36`; sweep on the CTA at B35.6 | holds |

## Materials and where to get them for a new brand

Everything on screen is the brand's own or code. No stock.

| material | source | tool |
|---|---|---|
| colours, fonts, logo, mark | the brand's site | `node scripts/brand-intake.mjs <url> --project <dir>`, then `pick --logo --mark --shots` |
| the three numbers | the site's own proof section (counts, money raised, ratings); never invented | read `brand.md` / the captured page; a figure that is not on the site is not on screen |
| client logos (6-9) | the site's logo strip, captured by brand-intake as candidates | crop each with `node scripts/trim-alpha.mjs in.png out.png --pad 8` so they render at one optical size in the 330x96 box |
| site captures for the devices | headless Chrome, full page, `--window-size=1440,5200` (laptop) and `390,7000` (phone), `--force-device-scale-factor=2`, saved to `film/assets/devshots/site-laptop.png` and `site-phone.png` | then pick 3 scroll stops (page y) that land on the headline, the numbers and the proof |
| 3D laptop and phone | `node scripts/device-init.mjs --project <dir> --preset duo|iphone --start <spec> --duration <s> --rim <accent> --env <accent at ~20% on black>` | it fetches the GLB models into `film/models/` and writes `compositions/dev.html` |
| video thumbnails, avatar (channel intros) | brand-intake writes `yt-<id>.jpg` for videos the site embeds and `youtube-avatar` from the linked channel | use 16:9 thumbnails as-is in the player and rows |
| the product's jobs / phases / parts | the site's own feature or method section, in its words | built as glass tiles in code, never as screenshots |
| mini-visualisations | code (dots, ring, bars, waveform, skeleton lines) | see Mechanics |

If a material is missing:
- no numbers on the site: replace the proof shot with the client wall at hero size, or with three real screenshots on plates (`.md-glass > img.md-fill`); never a made-up figure.
- no client logos: use 3 real testimonials as quote panes, or 3 YouTube thumbnails as rows (the 9:16 letter shot).
- no responsive site: `--preset macbook` only.
- no separate mark: put the wordmark in a wide glass pill instead of the disc.
- no second brand colour: use `.md-lit` for every highlight.
- device models will not fetch: render a still device with `node scripts/find-assets.mjs --polyhaven model <id>` + `node scripts/prop-render.mjs <model.gltf> dev.png --screen site.png --ry 25 --rx -8`, then put the scrolling capture ABOVE the PNG, clipped to the screen rect (a glass PNG front hides anything behind it).

## Mechanics

The runtime (`md.js`, `md-world.css`, `md-silk.js`) provides all the moves.
A film is sections on the grid, each with its own rig:

```html
<canvas id="silk"></canvas>
<section id="hook" class="clip md-scene" data-start="0" data-duration="2">
  <div class="md-world"><div data-layout-allow-overflow class="md-rig" id="hook-rig">
    <h1 id="h1" class="md-line big" style="left:130px;top:230px;font-size:280px"
        data-in="zoom@0" data-out="zoom@B3.7"><span class="md-lit">4</span> hours</h1>
    <div class="md-glass rec md-obj" id="rec"><span class="md-dot" id="rec-dot"></span>
      <span class="lab">REC</span>
      <span class="mono md-line" id="tc" data-in="count@0.1" data-count-dur="1.3"
            data-from="0" data-to="4" data-fmt="0{n}:00:00" data-out="blur@B3.7">04:00:00</span></div>
  </div></div>
</section>
<!-- ... sections ... then the device composition, then its copy section above it -->
<div id="dev" class="clip" data-composition-id="dev" data-composition-src="compositions/dev.html"
     data-start="16" data-duration="4" data-width="1920" data-height="1080" data-track-kind="graphics"></div>
<section id="device" class="clip md-scene" data-start="16" data-duration="4">...one line...</section>
<div class="md-vignette"></div><div class="md-grain"></div>
```

The world, the camera, the light:

```js
const tl = gsap.timeline({ paused: true });
// build repeated pieces BEFORE MD.lines (untimed DOM, deterministic)
MD.lines(tl);
const silk = MD.silk(tl, "#silk", { colors: [GROUND, ACCENT_DEEP, ACCENT_LIGHT], intensity: 0.32, speed: 0.55, from: 0, to: LENGTH });
MD.silkLevel(tl, silk, "B15", 0.62, 1.0);   // build
MD.silkLevel(tl, silk, "drop", 0.5, 0.8);
MD.silkLevel(tl, silk, "logo", 0.24, 1.0);

// a pane arriving: from depth, tilted, blurred, landing on a long tail, then light runs over it
MD.fly(tl, "#card", "B4", { z: -1100, ry: -24, dur: 0.75 });
MD.sweep(tl, "#card", "B4.6", 0.8);
// a beat punch on the camera (never on the title)
MD.punch(tl, "#hook-rig", "B3", 0.05);
// a whip out
tl.to("#rec", { x: -700, opacity: 0, filter: "blur(24px)", duration: 0.26, ease: "power3.in" }, MD.t("B3.74"));
// the dive into the next shot
tl.to("#rec-rig", { scale: 2.6, opacity: 0, filter: "blur(18px)", duration: 0.45, ease: "power3.in" }, MD.t("B8-0.45"));
```

The burst (one object becomes N tiles on a 3D arc):

```js
// SLOT: [left, top, z, rotationY] per tile; tiles all start at the source object's spot (SX, SY)
const SLOT = [[110,190,-160,14],[700,170,-40,4],[1290,190,-160,-14],[110,520,-60,12],[700,540,80,0],[1290,520,-60,-12]];
tl.to("#card", { scale: 0.6, opacity: 0, filter: "blur(16px)", duration: 0.3, ease: "power3.in" }, MD.t("B6-0.15"));
SLOT.forEach(([x, y, z, ry], i) => {
  tl.fromTo("#tile" + i, { x: 0, y: 0, z: -400, rotationY: 0, scale: 0.3, opacity: 0, filter: "blur(12px)" },
    { x: x - SX, y: y - SY, z, rotationY: ry, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, MD.t("B6") + i * 0.06);
  tl.fromTo(`#tile${i} .bar b`, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, MD.t("B6.6") + i * 0.09);
});
MD.drift(tl, "#tiles", { x: -60, y: -20 }, "B6", "B8");
```

A tracked camera with depth of field:

```js
MD.camera(tl, "#pipe-rig", [            // the rig has transform-origin at the stations' centre
  { at: "B8",   x: 884,  y: 30,  scale: 1.55, dur: 0.01 },
  { at: "B11",  x: 0,    y: 30,  scale: 1.55, dur: 0.55, ease: "power3.inOut" },
  { at: "B13",  x: -884, y: 30,  scale: 1.55, dur: 0.55, ease: "power3.inOut" },
  { at: "B14.4", x: 0,   y: -40, scale: 0.92, dur: 0.75, ease: "power3.inOut" },
]);
const ST = ["#st1", "#st2", "#st3"];
const dof = (on, at) => ST.forEach((s, i) => tl.to(s, {
  filter: i === on || on < 0 ? "blur(0px)" : "blur(9px)", opacity: i === on || on < 0 ? 1 : 0.45,
  duration: 0.5, ease: "power2.inOut" }, MD.t(at)));
dof(0, "B8.8"); dof(1, "B11"); dof(2, "B13"); dof(-1, "B14.4");
```

Rack focus on the number plates (the drop):

```js
MD.fly(tl, ["#pl1", "#pl2", "#pl3"], "drop", { z: -1200, y: 0, rx: 0, dur: 0.7, stagger: 0.07 });
const focus = (on, at) => ["#pl1", "#pl2", "#pl3"].forEach((p, i) => tl.to(p, {
  z: i === on ? 80 : -260, rotationY: [20, 0, -20][i], filter: i === on ? "blur(0px)" : "blur(7px)",
  opacity: i === on ? 1 : 0.55, duration: 0.45, ease: "power3.out" }, MD.t(at)));
focus(0, "B16.8"); focus(1, "B18.8"); focus(2, "B20.8");
// numbers: <div class="num md-line" id="n1" data-in="count@B17-0.5" data-count-dur="0.5"
//          data-from="0" data-to="300" data-fmt="{n}+" data-out="blur@B23.6">300+</div>
```

Live mini-visualisations (all seeded, all on the timeline):

```js
// waveform: 44 bars re-scaled every half beat
MD.each(4, 8, (t, k) => tl.to(bars, { scaleY: (i) => 0.12 + 0.88 * Math.abs(Math.sin(i * 0.55 + k * 1.7)) * (0.4 + 0.6 * MD.rand(i * 31 + k)()),
  duration: 0.22, ease: "power2.out" }, t), 0.5);
// a dot blinking on every beat
MD.each(0, 4, (t) => tl.fromTo("#rec-dot", { scale: 1.35, opacity: 1 }, { scale: 1, opacity: 0.55, duration: 0.42, ease: "power2.out", immediateRender: false }, t));
// dots converging to one point from a seeded ring
for (let i = 0; i < 18; i++) { const r = MD.rand(i * 13 + 5); const a = r() * Math.PI * 2, d = 220 + r() * 160;
  tl.fromTo("#by" + i, { x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d * 0.6, opacity: 0, scale: 0.6 },
    { x: CX, y: CY, opacity: 1, scale: 1, duration: 0.9, ease: "power2.in" }, MD.t("B9") + i * 0.055);
  tl.to("#by" + i, { opacity: 0, scale: 0.2, duration: 0.15 }, MD.t("B9") + i * 0.055 + 0.9); }
// a ring filling (SVG circle r 78, dasharray 490)
tl.fromTo("#ring2", { attr: { "stroke-dashoffset": 490 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, ease: "power2.inOut" }, MD.t("B11"));
```

The client wall:

```js
// 9 tiles, 3x3, pitch 480 x 220, centred in a 0x0 .ring (preserve-3d) at 960,560
for (let i = 0; i < 9; i++) { const r = MD.rand(i * 17 + 3);
  tl.fromTo("#mk" + i, { z: -1400, x: (r() - 0.5) * 500, y: (r() - 0.5) * 300, rotationY: (r() - 0.5) * 50, opacity: 0, filter: "blur(16px)" },
    { z: 0, x: 0, y: 0, rotationY: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }, MD.t("B24") + i * 0.13); }
tl.fromTo("#ring", { rotationY: -16, rotationX: 6 }, { rotationY: 12, rotationX: -4, duration: MD.t("B28") - MD.t("B24"), ease: "sine.inOut" }, MD.t("B24"));
MD.sweep(tl, "#ring .mark", "B26.5", 1.0);
```

The end card:

```js
tl.fromTo("#disc", { scale: 1.8, z: 400, opacity: 0, filter: "blur(16px)" }, { scale: 1, z: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, MD.t("logo"));
MD.stamp(tl, "#disc", MD.t("logo") + 0.45, 0.07);
MD.sweep(tl, "#disc", "logo+0.3", 0.8);
tl.fromTo("#word", { clipPath: "inset(-20% 100% -20% -5%)" }, { clipPath: "inset(-20% -5% -20% -5%)", duration: 0.55, ease: "power3.inOut" }, MD.t("logo+0.5"));
MD.finish(tl);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
```

```css
.cta .face { display:inline-block; padding:26px 64px; border-radius:999px; font:600 46px var(--font-body); color:#fff;
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 85%, #fff), var(--accent));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5), 0 20px 60px -10px color-mix(in srgb, var(--accent) 70%, transparent); }
.word img { height: 190px; filter: invert(1) brightness(1.1); }   /* a dark wordmark on the dark world */
```

The device scene's screens (`device/screen.js`): the captured page scrolls on
eased stops, `p` 0..1 over the screen's active span.

```js
var LAP = [[0, 0], [0.18, 0], [0.42, Y_NUMBERS], [0.62, Y_NUMBERS], [0.9, Y_PROOF], [1, Y_PROOF]];
var PH  = [[0, 0], [0.12, 0], [0.4, Y2], [0.58, Y2], [0.92, Y3], [1, Y3]];
function scrollAt(K, p) {
  for (var i = 1; i < K.length; i++) if (p <= K[i][0]) {
    var a = K[i - 1], b = K[i], u = (p - a[0]) / (b[0] - a[0] || 1);
    u = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;   // easeInOutCubic
    return a[1] + (b[1] - a[1]) * u;
  }
  return K[K.length - 1][1];
}
window.MD_SCREEN_dev = function (p) {
  document.getElementById("lap-page").style.transform = "translateY(" + (-Math.round(scrollAt(LAP, p))) + "px)";
  document.getElementById("phone-page").style.transform = "translateY(" + (-Math.round(scrollAt(PH, p))) + "px)";
};
```

`laptop.html` / `phone.html` are one `<img id="lap-page" src="assets/devshots/site-laptop.png">`
(width 1440 / 390, height auto, absolute at 0,0) on the page's own background
colour. Device config used: `rim` = accent, `env` = accent at ~20% on black
(`#2a1614`, `#2a1010`), `fill #ffd9c2`, shadow 0.4. The scene's motion is in
`templates/hyperframes/md-device.html` (presets `macbook`, `duo`, `iphone`): arrive in
`min(1, 0.22 x D)`, dolly lands at `0.62 x D`, then a slow drift; screens start 0.2s after arrival.

## Adapting to a brand

Takes the brand: silk colours (from the accent), `--ink`, `.md-lit` tint,
the display and body faces, the mark and wordmark, client logos, numbers,
the site on the devices, thumbnails and avatar, the product's own nouns on
the tiles and stations, the second colour if there is one. 9:16 uses wide
UPPERCASE only if the brand face has a width axis or is already wide; otherwise
use the 16:9 sentence-case rules at 9:16 sizes.

Keep fixed: the dark silk world, the glass recipe, depth of field, sweeps on
every landing, the grid (whole-bar shots, the numbers on the drop, the mark on
`logo`), one camera per shot (rig, never the timed section), the hook carrying
ink on frame 0, the device shot as the last shot before the end card, the
end-card order (mark, name, CTA, domain).

## Pitfalls found while building

- Frame 0 must already show ink: the 16:9 hook's REC pill and lines start at 0; the 9:16 hook uses `present@0` for the first line and the pill. An empty first frame fails the critique.
- `count` shows nothing until it starts counting; never pre-print a "0" (a "$0" on screen reads as a real figure). Set `data-count-dur` short (0.5s) on the drop so the stamp lands on the beat.
- Tween the rig, never the timed `<section>`: HyperFrames owns the section's visibility. Every rig needs `data-layout-allow-overflow` or the layout check flags the 3D overflow.
- Repeated pieces (tiles, bars, dots, client tiles) are created in the script BEFORE `MD.lines(tl)`; anything a line contains must exist when it is split.
- Exits that run before an entrance lands are warned; leave each line its full entrance (zoom 0.45s + stagger) before the scene leaves.
- Duo preset: a phone nearer the camera than the laptop grows fast in perspective and leaves the frame; the template frames the pair at x -3.35..2.95. Do not move the phone forward.
- Device copy sits ABOVE the device (top 52px, 76px type), never on the keyboard; mount the device `<div>` before its copy section so the copy is on top.
- Dark wordmarks on the dark world: `filter: invert(1) brightness(1.1)` on the SVG/PNG, or use the light variant from the site.
- 9:16 safe box: copy between y 168 and 1330, `left:76px; right:162px` (the platform's right rail). Big lines at 116-176px must be measured to fit 842px.
- Text must stay inside its pane: run `node scripts/frame-audit.mjs film` (render.mjs runs it). The tile titles (56px) and part titles (38px) are the ones that overflow first with long brand nouns: shorten the noun or drop the size, never let it wrap.
- `stroke-dashoffset` on SVG must be tweened as an `attr`, and every `fromTo` that repeats on one target needs `immediateRender: false` (the beat blink), or a seek to an early frame shows the last state.
- No `Math.random`, no clocks: seeded `MD.rand(seed)` for every scatter.

## Sound

Driving, 120-128 BPM, minor key (A minor in the launch). Full kit from bar 0,
a riser into the drop, an impact on the drop, an end section at half energy.
UI sounds, each peak on its frame (synth.mjs places them):
- tick: the timecode/count landing
- whoosh: every fly-in from depth and every camera dive or whip (the card, the rail, the client wall, the device rising)
- pop: the burst into tiles, each station lighting, each number stamped, each row/part landing, the phone settling
- hit: the mark landing on `logo` (one hit per film, mixed ~-9 dB under the bed's peak)
- shimmer: the wordmark wipe / the sweep over the CTA
