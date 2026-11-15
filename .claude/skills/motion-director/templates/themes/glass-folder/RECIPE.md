# Glass folder: recipe

A 7.5 second vertical hero shot: on a near-black ground lit by one band of
brand-colour light, a big glass cursor glides to a small brand-coloured folder
and clicks it; the folder turns into a three-quarter view, grows and lifts, the
light opens up, and five real cards rise and fan out of it (the centre one a
live player playing the brand's own video, its controls working), behind a
frosted glass front carrying the mark and the name; light runs across the glass
once; a giant brand word fades in above in a gradient that dissolves downward,
the product's name sits over it in white, and four small words spread under it.
Then the whole object keeps turning slowly and the player presses pause and
play. It works because it is ONE designed object treated like a product shot:
real people and real video inside, real glass (blur, rim, inner glow) in front,
one light source, and nothing ever fully still.

## Format, length, pace

- 1080x1920 (9:16), 30 fps, 7.5s, one continuous shot, no cuts. Built on a 110 BPM grid (beat 0.545s).
- Beats as measured from the source:
  - 0.05-0.85s: the cursor glides in
  - 0.85-1.11s: click (squash, spring back)
  - 1.0-2.1s: the folder turns, grows and lifts; the light opens (to 2.4s)
  - 1.2-2.25s: cards rise and fan, 0.04-0.08s apart
  - 1.0-2.2s: the cursor travels toward the camera
  - 2.1-3.2s: sheen across the glass front
  - 2.6-3.3s: the big brand word fades up
  - 2.95-3.53s: the product name, word by word
  - 3.6-4.38s: four small words, 0.16s apart
  - 2.1-7.5s: one slow turn of the whole object (the hold)
  - 5.55s and 6.35s: the player's button is pressed (pause, then play)
- As an opener for a longer film: cut at 4.5s on a dive into the centre card's video; as a stand-alone loop, hold to 7.5s.

## The look, in numbers

**Ground and light** (all CSS, no images):
- `#bg`: `radial-gradient(120% 70% at 50% 42%, #1a0907 0%, #0b0504 45%, #040202 100%)` (accent at ~8% on black, falling to black). Page background `#050303`.
- `#band`: an ellipse from x -260 to 1340, y 560-940 (right behind the folder's top edge), `radial-gradient(50% 50% at 50% 50%, accent-light 100% 0%, accent 70% 35%, accent-deep 25% 65%, transparent 82%)`, `filter: blur(36px)`; opacity 0.55, rising to 1 while the folder opens.
- `#cone`: 1500x1000 from y -200, centred, `radial-gradient(48% 100% at 50% 100%, accent 50%, accent-deep 18% 55%, transparent 75%)`, blur 30px; opacity 0.6 to 1 with the band. Light falls from above onto the object.
- Grain: SVG fractalNoise baseFrequency 1.1, 1 octave, seed 8, neutral grey at 50% alpha, layer opacity 0.45, overlay, z 90. Heavier than the glass theme on purpose: it kills banding in the dark gradient.
- No vignette: the radial ground does it.

**Palette roles** (the source accent was `#CA433C`; derive the rest from the brand's accent):
- accent-light `#F26E62` / `#F06A5F` (accent lifted ~25% toward white): folder top, cursor highlight, the big word's top
- accent `#D84A40` / `#CA433C`: folder middle, card frame
- accent-deep `#A82E26` / `#8E241F` (accent at ~75% brightness): folder bottom, cursor shade
- glass tint `rgba(255,175,166)` / `rgba(236,104,92)` / `rgba(214,76,66)`: the accent at 3 lightnesses, 20-34% alpha
- white for the product name and the front label; white 70% for the small words

**Type** (brand display face):
- big brand word: 172px, weight 800, tracking -0.02em, line-height 1, centred at top 190; fill `linear-gradient(180deg, accent-light 0%, accent 85% at 45%, accent 0% at 92%)` clipped to the text, so its lower half dissolves into the dark
- product name: 56px, 700, -0.01em, white, centred at top 300 (over the lower half of the big word), `text-shadow 0 6px 24px rgba(0,0,0,.45)`
- small words: 26px, 500, white 70%, at top 384, left edges at x 250, 420, 580, 760 (spread across the big word's width, not a sentence)
- front label: 40px, 700, -0.01em, white, after a 64px mark, gap 18px, at left 46 bottom 44
- sentence case throughout

**The folder** (in `#stage`, perspective 1500px, origin 50% 46%; `#rig` 620x620 at left 230 top 640, `preserve-3d`, origin 50% 70%):
- back: 620x620, `linear-gradient(165deg, accent-light 0%, accent 40%, accent-deep 100%)`, a top highlight `linear-gradient(180deg, white 28%, transparent 18%)`, tab shape by `clip-path: path('M 0 66 Q 0 30 36 30 L 190 30 Q 214 30 230 50 L 248 72 L 584 72 Q 620 72 620 108 L 620 584 Q 620 620 584 620 L 36 620 Q 0 620 0 584 Z')` (tab 0-248 wide, 36px corners)
- cards: radius 22px, an 8px coloured frame around the image (image radius 15px), origin bottom centre, shadow `0 30px 60px -20px rgba(0,0,0,.7)`:

  | card | left, top | size | frame |
  |---|---|---|---|
  | back-left B1 | 40, 150 | 270x360 | warm light `#d9d2c4` |
  | back-right B2 | 310, 150 | 270x360 | dark `#2b2b33` |
  | left L | 50, 130 | 290x390 | cream `#EFE7D8` |
  | right R | 280, 130 | 290x390 | accent-dark `#3b1715` |
  | centre C (player) | 140, 90 | 340x500 | `linear-gradient(160deg, accent-light, accent 55%, accent-deep)` |

  The centre card holds a 320x362 video (radius 16) and a control panel below (`rgba(20,8,7,.55)`, radius 16): a 5px progress bar (white on white 25%), then a row of 5 controls at 34px (heart in accent-light, previous, a 64px white circle with pause/play in near-black, next, shuffle), drawn as inline SVG paths.
- front glass: 640x420 at left -10 top 216 (overhangs the back by 10px each side), radius 40px, origin bottom centre:
  - fill `linear-gradient(170deg, rgba(255,175,166,.30) 0%, rgba(236,104,92,.20) 45%, rgba(214,76,66,.34) 100%)`
  - `backdrop-filter: blur(7px) saturate(140%)` (low blur: the cards behind stay readable as people)
  - `inset 0 2px 0 rgba(255,230,225,.85)` top rim, `inset 0 0 0 2px rgba(255,190,182,.45)` edge, `inset 0 -40px 80px rgba(255,120,108,.25)` inner glow from the bottom, `0 0 70px` accent at 35% outer glow
  - sheen: `::before` with `linear-gradient(115deg, transparent 30%, rgba(255,255,255,.22) 42%, transparent 54%)` moved by `translateX(var(--sheen))`, -60% to 160%
- depth inside the rig: cards z 10 / 14 / 26 / 30 / 44 and y offsets 70 / 70 / 50 / 50 / 26 (they start tucked in); front z 70, rotationX -6.

**The cursor**: a 250px SVG arrow (viewBox 200), tip at top-left: `M 40 34 L 176 96 L 116 120 L 96 180 Z`, filled AND stroked 30px round-join with a diagonal gradient (accent-light-pink `#FFB2A9` to accent-light `#EE6A5E` at 45% to accent-deep `#B8342B`), a 3px inner rim at 55% pale, a white top highlight triangle fading to 0 at half height. Glow: `drop-shadow(0 0 30px accent-light 55%) drop-shadow(0 24px 30px rgba(0,0,0,.5))`. It is a soft 3D object, not a pointer icon.

## Shot list (one shot, by beat)

| time | on screen | what moves and how | static | out |
|---|---|---|---|---|
| 0-0.85 | the dark ground, the band at 55%, the cone at 60%, the folder small and frontal in the centre (rig scale 0.78, rotationX 4, y 40) with the player card's top showing above the front, the cursor at its lower right (x 720, y 1150, scale 0.62) | cursor glides to 660, 1090 in 0.8s power2.inOut | the folder; the video in the centre card plays from frame 0 | none |
| 0.85-1.11 | click | cursor scale 0.62 to 0.54 in 0.08s power2.out, back to 0.62 in 0.18s back.out(2) | | none |
| 1.0-2.25 | the folder opens | rig `rotationX 4 to 15, rotationY 0 to -22, rotationZ 0 to 11, scale 0.78 to 1.04, y 40 to 0`, 1.1s power3.inOut; front `rotationX -6 to -14`, 1.0s; band and cone to opacity 1, 1.4s power2.inOut; cards rise, 0.85s each: C `y -160` back.out(1.35) at 1.2s, L `y -40, x -120, rotationZ -22` back.out(1.3) at 1.28s, R `y -40, x 120, rotationZ 22` at 1.32s, B1 `y -10, x -60, rotationZ -10` back.out(1.2) at 1.36s, B2 `y -10, x 60, rotationZ 10` at 1.4s; cursor travels toward the camera `x 580, y 1400, scale 1.4`, 1.2s power3.inOut (it ends big and lower right of the folder, like a foreground object) | | none |
| 2.1-3.2 | light on the glass | sheen -60% to 160%, 1.1s power2.inOut | | none |
| 2.1-7.5 | the hold | rig `rotationY -22 to -14, rotationZ 11 to 8, rotationX 15 to 13, y 0 to -16`, 5.4s sine.inOut; cursor `x 610, y 1450`, 5.2s sine.inOut | | none |
| 2.6-4.4 | the title above | big word `opacity 0 to 1, y 40 to 0, blur 14 to 0`, 0.7s power3.out at 2.6s; product name per word `opacity, y 18, blur 10`, 0.4s, 0.18s apart from 2.95s; small words `opacity, blur 6`, 0.3s each at 3.6 / 3.76 / 3.92 / 4.08s | | holds |
| 0-7.5 | the player is live | the video plays; progress `scaleX 0.12 to 0.86` linear over the whole 7.5s; at 5.55s the button squashes (0.86, 0.08s yoyo) and pause swaps to play at 5.6s; at 6.35s squash again and play swaps back to pause at 6.4s | | holds |

## Materials and where to get them for a new brand

| material | source | how |
|---|---|---|
| accent, display face, mark, name | the brand's site | `node scripts/brand-intake.mjs <url> --project <dir>`; mark cropped with `node scripts/trim-alpha.mjs mark.png mark.png --pad 8` (it shows at 64px on the glass) |
| the centre card's video | the brand's own hero video: a site video captured by brand-intake, or the founder's latest YouTube video (`yt-dlp -f "bv*[height<=1080]" --no-playlist -o hero-full.mp4 <url>`) | cut 8s of a talking or demo moment and crop to 3:4: `ffmpeg -ss <t> -t 8 -i hero-full.mp4 -vf "crop=ih*3/4:ih,scale=720:960" -an -c:v libx264 -crf 18 hero.mp4` |
| the four side cards | the brand's YouTube thumbnails (brand-intake writes `yt-<id>.jpg` for videos the site embeds) or stills from the brand's own videos (people on camera read best) | crop each to 3:4 around the face or the subject: `ffmpeg -i thumb.jpg -vf "crop=ih*3/4:ih:<x>:0,scale=480:640" cardL.jpg` (B1 420x560, B2 390x520, L and R 480x640) |
| the big word, the product name, the small words | the brand's own name and the product's promise from the site (a 1-word brand noun, a 2-word product name, 4 short words of the claim) | |
| everything else | code | nothing downloaded |

If the brand has no video: put its best product screen (brand-intake `--shots`)
in the centre card as a still and drop the controls, or use a site capture
scrolled with a `y` tween inside the card. If it has no people: fill the side
cards with real product screens or client logos on light frames. Free extras
only if the folder must hold a physical thing: `node scripts/find-assets.mjs
"<object>" --out <dir> --cutout` (CC0 photo, subject lifted) or a Poly Haven
model rendered with `node scripts/prop-render.mjs <model.gltf> prop.png --rx -10
--ry 25 --fill 0.8`. A face lifted out of a photo for a card edge:
`node scripts/cutout.mjs <photo> <out.png>`.

## Mechanics

```html
<div id="root" data-composition-id="main" data-start="0" data-duration="7.5" data-width="1080" data-height="1920" data-fps="30">
  <div id="bg"></div><div id="cone"></div><div id="band"></div>
  <div id="ghost" data-layered>BRAND</div>
  <div class="tw" id="t1"><span class="w">Product</span> <span class="w">Name</span></div>
  <div id="subs"></div>
  <div id="stage"><div id="rig">
    <div class="back"></div>
    <div class="card" id="cB1"><img src="assets/cardB1.jpg" alt="" /></div>
    <div class="card" id="cB2"><img src="assets/cardB2.jpg" alt="" /></div>
    <div class="card" id="cL"><img src="assets/cardL.jpg" alt="" /></div>
    <div class="card" id="cR"><img src="assets/cardR.jpg" alt="" /></div>
    <div class="card" id="cC">
      <!-- the TIMED element is the <video> itself: class="clip" + data-start + data-duration on it -->
      <div class="vid"><video id="hv" class="clip" data-start="0" data-duration="7.5" muted playsinline src="assets/hero.mp4"></video></div>
      <div class="ctl"><div class="bar"><i id="prog"></i></div><div class="row"><!-- 5 SVG controls; .pp holds #pause and #play --></div></div>
    </div>
    <div class="front" id="front"><div class="brand"><img src="assets/mark.png" alt="" /><span>name</span></div></div>
  </div></div>
  <svg id="cursor" viewBox="0 0 200 200"><!-- see The look --></svg>
  <div id="grain"></div>
</div>
```

```css
#ghost { position:absolute; left:0; right:0; top:190px; text-align:center; font:800 172px/1 var(--font-display); letter-spacing:-0.02em;
  background: linear-gradient(180deg, var(--accent-light) 0%, color-mix(in srgb, var(--accent) 85%, transparent) 45%, transparent 92%);
  -webkit-background-clip:text; background-clip:text; color:transparent; }
.front::before { content:""; position:absolute; inset:0;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.22) 42%, transparent 54%); transform: translateX(var(--sheen, -60%)); }
```

```js
const tl = gsap.timeline({ paused: true });
const R = "#rig", CARDS = ["#cB1", "#cB2", "#cL", "#cR", "#cC"];
// layout defaults (depth inside the folder); anything that must be HIDDEN at t=0 is hidden by a fromTo on tl below
gsap.set(R, { rotationX: 4, rotationY: 0, rotationZ: 0, scale: 0.78, y: 40 });
gsap.set(CARDS, { z: (i) => [10, 14, 26, 30, 44][i], y: (i) => [70, 70, 50, 50, 26][i] });
gsap.set("#front", { z: 70, rotationX: -6 });
gsap.set("#cursor", { x: 720, y: 1150, rotation: 0, scale: 0.62 });
gsap.set("#band", { opacity: 0.55 }); gsap.set("#cone", { opacity: 0.6 });

// the click
tl.to("#cursor", { x: 660, y: 1090, duration: 0.8, ease: "power2.inOut" }, 0.05);
tl.to("#cursor", { scale: 0.54, duration: 0.08, ease: "power2.out" }, 0.85);
tl.to("#cursor", { scale: 0.62, duration: 0.18, ease: "back.out(2)" }, 0.93);
// the folder turns into three-quarter, the light opens
tl.to(R, { rotationX: 15, rotationY: -22, rotationZ: 11, scale: 1.04, y: 0, duration: 1.1, ease: "power3.inOut" }, 1.0);
tl.to("#front", { rotationX: -14, duration: 1.0, ease: "power3.inOut" }, 1.05);
tl.to(["#band", "#cone"], { opacity: 1, duration: 1.4, ease: "power2.inOut" }, 1.0);
// the fan: centre highest, the sides turning out, the back pair least
tl.to("#cC",  { y: -160, duration: 0.85, ease: "back.out(1.35)" }, 1.2);
tl.to("#cL",  { y: -40, x: -120, rotationZ: -22, duration: 0.85, ease: "back.out(1.3)" }, 1.28);
tl.to("#cR",  { y: -40, x: 120,  rotationZ: 22,  duration: 0.85, ease: "back.out(1.3)" }, 1.32);
tl.to("#cB1", { y: -10, x: -60,  rotationZ: -10, duration: 0.85, ease: "back.out(1.2)" }, 1.36);
tl.to("#cB2", { y: -10, x: 60,   rotationZ: 10,  duration: 0.85, ease: "back.out(1.2)" }, 1.4);
tl.to("#cursor", { x: 580, y: 1400, scale: 1.4, duration: 1.2, ease: "power3.inOut" }, 1.0);
tl.fromTo("#front", { "--sheen": "-60%" }, { "--sheen": "160%", duration: 1.1, ease: "power2.inOut" }, 2.1);
// the hold: never still
tl.to(R, { rotationY: -14, rotationZ: 8, rotationX: 13, y: -16, duration: 5.4, ease: "sine.inOut" }, 2.1);
tl.to("#cursor", { x: 610, y: 1450, duration: 5.2, ease: "sine.inOut" }, 2.2);
// the title
tl.fromTo("#ghost", { opacity: 0, y: 40, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 2.6);
tl.fromTo("#t1 .w", { opacity: 0, y: 18, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, stagger: 0.18, ease: "power3.out" }, 2.95);
["#s0", "#s1", "#s2", "#s3"].forEach((s, i) => tl.fromTo(s, { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.3 }, 3.6 + i * 0.16));
// the live player
tl.fromTo("#prog", { scaleX: 0.12 }, { scaleX: 0.86, duration: 7.5, ease: "none" }, 0);
const press = (at, showPlay) => {
  tl.fromTo("#cC .pp", { scale: 1 }, { scale: 0.86, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, at);
  tl.set("#pause", { opacity: showPlay ? 0 : 1 }, at + 0.05); tl.set("#play", { opacity: showPlay ? 1 : 0 }, at + 0.05);
};
press(5.55, true); press(6.35, false);

window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
```

The source is plain GSAP. Inside a motion-director film, wire the three title
elements as `.md-line`s (`data-in` / `data-out`, e.g. the big word
`data-in="line@2.6"`, the name `words@2.95`, the small words `words@3.6`) and
call `MD.lines(tl)` / `MD.finish(tl)` so the linter and the critique see them.

## Adapting to a brand

Takes the brand: the accent (and the three lightnesses derived from it) for
the light band, the folder, the glass tint, the cursor and the big word; the
display face; the mark and name on the front; the hero video and the four
people/product cards; the brand word, product name and four claim words.
Keep fixed: one object, centred, 57% of frame width; one light source (the band
at the folder's top edge plus the cone from above) on a near-black ground;
heavy grain; the frontal-small to three-quarter-big turn (rotationY -22,
rotationZ 11) on power3.inOut; the fan amplitudes (-160 / +-120 / +-60 and
+-22 / +-10 deg) on back.out 1.2-1.35; the cursor as a soft 3D glass object that
moves toward the camera after the click; one sheen; the slow turn in the hold;
the live player.
A light brand: keep the dark ground (it is a lit studio, not a page); a brand
whose accent is dark (navy, forest): lift the band to accent-light at 100% and
use white for the big word's top stop.

## Pitfalls found while building

- Timed media must be the clip itself: put `class="clip" data-start data-duration` on the `<video>` element, not on a wrapping div, or HyperFrames does not seek it and the card shows a frozen first frame. Cut the clip to at least the film's length before using it (the 8s `hero.mp4` for a 7.5s film); a shorter clip freezes on its last frame.
- A `gsap.set(..., {opacity: 0})` made before the timeline is registered can be overridden when HyperFrames seeks; hide anything that must be invisible at t=0 with a `fromTo` (or `tl.set` at 0) on the registered timeline, as the title does.
- Glass PNG fronts hide media behind them. The front here is CSS with `backdrop-filter`, so the cards and the video show through, softened. If you swap in a rendered glass or device PNG, put the media ABOVE it, clipped to the window.
- Keep the backdrop blur at 7px: the 14-22px of the other glass themes turns the people behind the front into colour fog.
- The back panel's tab is a `clip-path: path(...)` in px; change the folder's size and the path must be rescaled (it is not percentage based).
- Text over text is intended here (the product name over the big word's dissolving half). `scripts/frame-audit.mjs` flags text on text; the big word carries `data-layered`, which the audit reads as a deliberate layered title (it skips the overlap test for it). Nothing else may overlap.
- The small words are spread by fixed left edges (250, 420, 580, 760) measured against the 172px word; a longer brand word needs new edges, measured from the word's rendered box.
- 9:16 safe area: the title block sits at y 190-410 and the cursor ends at y ~1450-1700 scaled 1.4. For a feed post keep the title under y 168 clear of the top UI (it is: 190) and nothing readable below 1330 (the cursor is not copy).
- `--sheen` is a custom property: tween it with `fromTo` and string values (`"-60%"` to `"160%"`).

## Sound

110 BPM, warm, A minor bed (the proof's score). UI sounds on the film's own events:
- click: the cursor click (0.88s) and each player press (5.55s, 6.35s)
- whoosh: the folder turning toward the camera (1.0s)
- pop: the centre card and the side cards rising (1.25s, 1.32s); the big word and the product name landing (2.6s, 2.95s)
- shimmer: the sheen across the glass (2.1s)
- tick: each small word (3.6, 3.76, 3.92, 4.08s)
No hit: there is no logo landing; if the film continues to an end card, the one hit goes there.
