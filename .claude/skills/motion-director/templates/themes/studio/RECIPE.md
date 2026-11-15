# Studio: recipe

A 5.4 second design-studio piece in three beats on one glowing colour ground:
the brand's own line pops in word by word while a white stroke draws under it
and a designer's cursor drags a selection box around the last word, which
inverts; a glass folder pops up, turns, and three real product screens rise
and fan out of it behind a frosted front with the brand's name, light running
across the glass; a glass lens orb rolls in with the mark inside and the
domain pops under it. It works because there is only ever ONE thing to look
at, the object is treated like a product shot (it turns, it catches light),
every arrival springs, and the ground itself is energy (a lit radial, a
turning sunburst, two organic blobs drifting at the corners) so no frame is
static. Extend it to a 15-25s film by repeating the same three-part grammar
(claim + tool, hero object, mark) with more hero objects, one per bar.

## Format, length, pace

- 1920x1080, 30 fps, 5.4s. (9:16 works: same objects at 60% frame width, title 96-110px.)
- Three scenes that overlap by 0.15-0.2s so one exit and the next entrance share frames (no empty frame between):
  - s1 claim: 0.00-1.95s
  - s2 hero folder: 1.75-4.05s
  - s3 orb end card: 3.90-5.40s
- Beats measured from the source: title pops 0.15-0.66s, stroke draws 0.05-0.75s, cursor glides 0.62-1.07s, selection drags 1.10-1.42s, word inverts at 1.12s, tools leave 1.72s, title zooms out 1.75s, folder pops 1.80s, front swings 2.05s, cards fan 2.25-2.85s, sheen 2.80-3.70s, folder unpops 3.85s, orb rolls 3.90-4.65s, stamp 4.65s, domain pops 4.25s.
- Pace for a longer film: one hero object per 2-4s, held as one continuous shot that keeps moving; transitions are pop-away / pop-in, never a hard cut.

## The look, in numbers

**Ground** (`.st-ground`, `theme.css`): `radial-gradient(75% 85% at 50% 42%, --st-hi 0%, --st-mid 30%, --st-deep 78%)` where `--st-hi` = accent mixed 62% with white, `--st-mid` = accent, `--st-deep` = accent 22% on `#050506`. On screen: a bright salmon centre, the accent ring, a near-black red at the corners. Mono variant `.is-mono`: `#ECECEC` with a 28px dot grid (1.4px dots at 13% black), ink `#141414`.

**Sunburst** (`.st-burst`): 3000px disc centred at 50% 44%, `repeating-conic-gradient` of 24 rays (7.5deg white at 7.5%, 7.5deg clear), masked by a radial fade to 62%. Turns 10deg/s for the whole film.

**Blobs** (`.st-blob`, `MD.studio.blob`): seeded flower shapes in an SVG, r 0.42, petal depth 0.38. Top-left: 980px, 5 petals, seed 4, fill `--st-deep`, at left -300 top -340. Bottom-right: 760px, 6 petals, seed 9, white at 90%, at left 1440 top 600. Both end up 30-50% off frame.

**Stroke** (`.st-swoosh`): one white path, stroke 16px at 92%, round caps, across the lower third: `M-60 860 C 400 700, 760 980, 1180 780 S 1760 560, 1990 640`.

**Type** (`.st-title`): brand display face, weight 800, tracking -0.02em, line-height 0.98, white, `text-shadow 0 10px 40px` in `--st-deep` at 60%, nowrap. Sizes: claim 128px on 2 lines centred at top 360 (theme-board fits `HEAD_SIZE` to 1500px); domain 72px centred at top 760. Sentence case. The selected word: white box, text in `--st-deep`. Rule: type is either huge or tiny editorial, never medium.

**Selection and cursor**: `.st-select` 3px dashed white at 95%, four 16px white handles with a 3px `--st-deep` border at the corners (offset -10px); padding 18px around the word's measured rect. `.st-cursor` 64px SVG arrow, white fill, `#111` 3px stroke, drop-shadow `0 6px 10px` 35% black.

**Glass folder** (`.st-folder`, 800x640 at left 560 top 150, `transform-style: preserve-3d` in a 1800px perspective stage):
- back: radius 40px, `linear-gradient(170deg, --st-hi 85%, --st-mid 80% on black)`, a tab cut by `clip-path: polygon(0 9%, 3% 0, 34% 0, 39% 9%, 100% 9%, 100% 100%, 0 100%)`, inner top highlight 2px at 50% white.
- cards: 76% x 74% at left 12% top 12%, radius 22px, white, `object-fit: cover; object-position: top center`, shadow `0 20px 40px -14px` 50% black, origin bottom centre.
- front: 104% wide, 62% high, bottom -2%, radius 40px, `linear-gradient(160deg, white 34%, white 7% at 55%, --st-hi 22%)`, `backdrop-filter: blur(14px) saturate(170%)`, rim `inset 0 1.5px 0` 75% white + `inset 0 0 0 1.5px` 28% white, drop `0 40px 80px -30px` 55% black, glow `0 0 60px -10px --st-hi` at 50%. Label bottom-left at 7%/12%: the mark 56px tall (radius 12px) + the brand name, 700 40px, white.
- sheen: a 105deg band, white 45%, 32% wide, screen blend, driven by `--sheen` -40% to 140%.

**Glass orb** (`.st-orb`, 520px at left 700 top 170): `radial-gradient` clear to 58%, 22% white ring at 72%, `backdrop-filter: blur(3px) saturate(180%)`, `inset 0 0 0 2px` 80% white, `inset 0 0 50px` 35% white, outer glow `0 0 70px --st-hi` 70%, drop `0 50px 90px -30px` 60%; a specular highlight ellipse (46% x 26% at 14%/8%, rotated -24deg). The mark inside at 56%, radius 18%, drop-shadow `0 8px 18px` 35%.

No grain, no vignette in this theme: the ground's radial does the vignetting.

## Shot list

| time | on screen | what moves and how | static | out |
|---|---|---|---|---|
| 0-1.95 claim | ground, burst, two blobs; the brand's tagline (2 lines, 128px, last word wrapped in `.st-hl`); the white stroke; the cursor; the selection box | blobs: `scale 0.3 to 1, rotation -40 to 0, opacity 0 to .9, 1.1s expo.out`, stagger 0.15 from 0, then they rotate +35 / -30deg and slide x +40 / -50 linearly to the end; title `pop@0.15` (per word: scale 0.2 to 1, y 50 to 0, 0.42s back.out(2), 0.06s apart); stroke draws 0.05-0.75s power2.inOut and undraws from its start at 1.35s; cursor appears at 1500,900 at 0.6s and glides to the word's bottom-right corner (+6, -6) in 0.45s power3.inOut; selection box drags from its top-left 0.32s power3.out at 1.1s; word inverts at 1.12s (background white in 0.12s, text to `--st-deep`) | the burst turning, the title once landed | cursor + box fade 0.15s at 1.72s; title `zoom` out (scale 1.7, blur 14, 0.25s) at 1.75s |
| 1.75-4.05 hero | the glass folder, 3 real screens inside it | folder pops at 1.8s: `scale 0.4 to 1, rotation -10 to 0, y 120 to 0, opacity 0 to 1, 0.55s back.out(1.8)`; the folder turns `rotationY -14 to +10` over 2.2s power1.inOut; front swings up `rotationX -55 to -8` 0.6s back.out(1.5) at 2.05s; cards rise and fan, 0.09s apart from 2.25s, 0.6s back.out(1.6): left `y -160, xPercent -32, rotation -9`, centre `y -220`, right `y -160, xPercent +32, rotation 9`; sheen across the front 2.8s, 0.9s power2.inOut | the ground | folder `unpop` (scale 0, back.in(1.6), 0.25s) at 3.85s |
| 3.9-5.4 end | the orb with the mark; the domain under it | orb rolls in from the right: `x 1100 to 0, rotation 220 to 0, scale 0.6 to 1, 0.75s back.out(1.3)`; stamp 1.06 to 1 at 4.65s; domain `pop@4.25` | burst keeps turning, blobs keep drifting | holds to the end |

## Materials and where to get them for a new brand

| material | source | how |
|---|---|---|
| accent, display face, mark, name, domain | the brand's site | `node scripts/brand-intake.mjs <url> --project <dir>` then `pick --logo --mark --shots` |
| tagline | the site's hero headline, verbatim, split so the last word is the one selected | theme-board fills `HEAD_L1`, `HEAD_L2`, `LAST` |
| 3 screens for the folder | the product's own UI (brand-intake `--shots`), portrait-ish crops of real pages; sections of the site captured at 1440 wide work when the UI is behind a login | crop each to ~4:3 from the top so the headline of each shows above the glass front |
| the mark for the orb and label | the brand's square mark; crop to its ink with `node scripts/trim-alpha.mjs mark.png mark.png --pad 8` so it fills the 56% box | a mark that is a wordmark only: put the wordmark inside at 70% width |
| everything else | code (`theme.css`, `theme.js`) | nothing downloaded |

If the brand has no product screens: put three real things the brand makes in
the folder (YouTube thumbnails cropped 4:3, client logos on white cards,
article covers). If it has no square mark: use the orb for a number (the
figure huge inside the lens) and end on the wordmark popped in under it. A
light brand: keep the colour ground (it is the brand's own accent lit), or use
`.is-mono` with black blobs and ink.

For a longer film, more hero objects from free sources:
`node scripts/find-assets.mjs --polyhaven model <id> --out <dir>` then
`node scripts/prop-render.mjs <model.gltf> prop.png --rx -15 --ry 30 --fill 0.8`
(a real 3D object at the angle the shot needs; `--screen shot.png` puts a real
screenshot on a device model). Treat it as the hero: pop, turn, sheen.

## Mechanics

The moves are in `theme.js` (`MD.studio`), the materials in `theme.css`. The essential build:

```html
<div class="st-ground"></div>
<div class="st-burst" id="burst"></div>
<svg class="st-blob" id="b1" style="left:-300px;top:-340px;width:980px;height:980px"></svg>
<svg class="st-blob is-light" id="b2" style="left:1440px;top:600px;width:760px;height:760px"></svg>

<section id="s1" class="clip scene" data-start="0" data-duration="1.95">
  <svg class="st-swoosh" width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0">
    <path id="s1-swp" d="M-60 860 C 400 700, 760 980, 1180 780 S 1760 560, 1990 640" /></svg>
  <h1 class="st-title md-line" id="s1-h" style="left:0;right:0;top:360px;text-align:center;font-size:128px"
      data-in="pop@0.15" data-out="zoom@1.75">LINE ONE<br>LINE TWO <span class="st-hl" id="s1-last">LAST</span></h1>
  <div class="st-select" id="s1-sel"><i></i><i></i><i></i><i></i></div>
  <svg class="st-cursor" id="s1-cur" viewBox="0 0 64 64"><path d="M10 6 L10 52 L22 41 L31 60 L39 56 L30 38 L46 38 Z"
       fill="#fff" stroke="#111" stroke-width="3" stroke-linejoin="round"/></svg>
</section>

<section id="s2" class="clip scene" data-start="1.75" data-duration="2.3"><div class="stage">  <!-- perspective: 1800px -->
  <div class="st-folder" id="fold" style="left:560px;top:150px;width:800px;height:640px">
    <div class="st-back"></div>
    <div class="st-card" id="k1"><img src="assets/shots/shot-1.png" alt="" /></div>
    <div class="st-card" id="k2"><img src="assets/shots/shot-2.png" alt="" /></div>
    <div class="st-card" id="k3"><img src="assets/shots/shot-3.png" alt="" /></div>
    <div class="st-front" id="front"><div class="st-label"><img src="assets/mark.png" alt="" /><span>NAME</span></div></div>
  </div></div>
</section>

<section id="s3" class="clip scene" data-start="3.9" data-duration="1.5">
  <div class="st-orb" id="orb" style="left:700px;top:170px;width:520px;height:520px"><div class="st-in"><img src="assets/mark.png" alt="" /></div></div>
  <h2 class="st-title md-line" id="s3-n" style="left:0;right:0;top:760px;text-align:center;font-size:72px" data-in="pop@4.25" data-out="end">DOMAIN</h2>
</section>
```

```js
const tl = gsap.timeline({ paused: true });
const S = MD.studio;
S.blob(document.getElementById("b1"), { petals: 5, seed: 4 });
S.blob(document.getElementById("b2"), { petals: 6, seed: 9 });
// the selection box is placed on the word's MEASURED rect, before the line is split
const rb = document.getElementById("s1-last").getBoundingClientRect(), pad = 18;
Object.assign(document.getElementById("s1-sel").style, { left: `${Math.round(rb.left - pad)}px`, top: `${Math.round(rb.top - pad + 8)}px`,
  width: `${Math.round(rb.width + pad * 2)}px`, height: `${Math.round(rb.height + pad * 2 - 16)}px` });
MD.lines(tl);

S.turn(tl, "#burst", 0, 5.4, 10);
tl.fromTo(["#b1", "#b2"], { scale: 0.3, rotation: -40, opacity: 0 }, { scale: 1, rotation: 0, opacity: 0.9, duration: 1.1, stagger: 0.15, ease: "expo.out" }, 0);
tl.to("#b1", { rotation: 35, x: 40, duration: 4.3, ease: "none" }, 1.1);
tl.to("#b2", { rotation: -30, x: -50, duration: 4.15, ease: "none" }, 1.25);

// claim: stroke, cursor, selection, the word inverts
S.swoosh(tl, "#s1-swp", 0.05, 0.7, 1.35);
S.cursor(tl, "#s1-cur", [{ x: 1500, y: 900, at: 0.6 }, { x: rb.right + 6, y: rb.bottom - 6, at: 0.62, dur: 0.45 }]);
S.select(tl, "#s1-sel", 1.1);
tl.fromTo("#s1-last", { color: "#ffffff" }, { color: "var(--st-deep)", duration: 0.01 }, 1.12);
tl.fromTo("#s1-last", { backgroundColor: "rgba(255,255,255,0)" }, { backgroundColor: "rgba(255,255,255,1)", duration: 0.12 }, 1.12);
tl.to(["#s1-sel", "#s1-cur"], { opacity: 0, duration: 0.15 }, 1.72);

// hero: pop, front swings, cards fan, light runs, the object turns
S.pop(tl, "#fold", 1.8, { from: 0.4, dur: 0.55, y: 120 });
[["#k1", -16, -160, -9], ["#k2", 0, -220, 0], ["#k3", 16, -160, 9]].forEach(([k, x, y, r], i) =>
  tl.fromTo(k, { yPercent: 0, xPercent: 0, rotation: 0 }, { y, xPercent: x * 2, rotation: r, duration: 0.6, ease: "back.out(1.6)" }, 2.25 + i * 0.09));
tl.fromTo("#front", { rotationX: -55 }, { rotationX: -8, duration: 0.6, ease: "back.out(1.5)" }, 2.05);
S.sheen(tl, "#front", 2.8, 0.9);
tl.fromTo("#fold", { rotationY: -14 }, { rotationY: 10, duration: 2.2, ease: "power1.inOut" }, 1.8);
S.unpop(tl, "#fold", 3.85, 0.25);

// end: the lens rolls in
tl.fromTo("#orb", { x: 1100, rotation: 220, scale: 0.6 }, { x: 0, rotation: 0, scale: 1, duration: 0.75, ease: "back.out(1.3)" }, 3.9);
MD.stamp(tl, "#orb", 4.65, 0.06);

MD.finish(tl);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
```

The moves themselves (from `theme.js`):

```js
// pop: springy arrival; unpop: back.in exit
tl.fromTo(el, { scale: from, rotation: rot - 10, y, opacity: 0 }, { scale: 1, rotation: rot, y: 0, opacity: 1, duration: dur, ease: "back.out(1.8)" }, t);
tl.to(el, { scale: 0, opacity: 0, duration: 0.22, ease: "back.in(1.6)" }, t);
// swoosh: dash the path to its length, draw on, then off from its start
p.style.strokeDasharray = `${len} ${len}`;
tl.fromTo(p, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, t);
tl.to(p, { strokeDashoffset: -len, duration: dur * 0.8, ease: "power2.in" }, off);
// select: drag from the top-left corner
tl.fromTo(el, { scaleX: 0, scaleY: 0, transformOrigin: "0% 0%", opacity: 1 }, { scaleX: 1, scaleY: 1, duration: 0.32, ease: "power3.out" }, t);
// cursor click: a squash 0.82 for 0.07s, yoyo once, at the end of the glide
tl.fromTo(el, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, at + dur);
// line entrance pop@t: per word, scale 0.2, y 50, 0.42s back.out(2), 0.06s apart
```

## Adapting to a brand

Takes the brand: the accent (it IS the ground, the folder back and the glow),
the display face, the tagline and its key word, three real screens, the mark,
the name on the glass front, the domain. Keep fixed: one hero at a time,
centred, 45-60% of frame height; springy eases (`back.out` 1.3-2 on every
arrival, `back.in` on exits); the turning burst and the drifting blobs; the
selection box measured, never eyeballed; one sheen per object; the orb end.
A very dark accent (navy, black): the ground reads as a dark radial, so raise
`--st-hi` to 75% white for the centre. A very light accent (yellow, mint):
switch title ink to `--st-deep` and the stroke to `--st-deep`, or use `.is-mono`.

## Pitfalls found while building

- Frame 0 is empty ground in the sample (the title pops at 0.15s, the blobs start at scale 0.3). In a film the critique's frame-0 check wants ink: start the first pop at 0 or carry the previous shot's object in.
- Measure the selection box from `getBoundingClientRect()` of the word BEFORE `MD.lines(tl)` splits the line and before any transform; after the split the rect is per word and after the pop it is scaled.
- The inverted word changes background and colour at the same frame (1.12s); fading the colour reads as a glitch. Keep the 0.01s colour set.
- `st-hl` must be `display: inline-block` so the white box hugs the word and the selection rect is one box, not a line fragment.
- The front glass blurs whatever is behind it (`backdrop-filter`), so the cards show sharp only above the front; fan them high enough (y -160 to -220) that each screen's headline clears the glass. A PNG front would hide them completely.
- Title lines must fit 1500px at the chosen size (theme-board computes `HEAD_SIZE`); run `node scripts/frame-audit.mjs <film>` so no word leaves the frame while the folder or orb overlaps.
- Overlap the scenes by 0.15-0.2s (1.75 / 1.95, 3.85 / 3.9) so an unpop and the next pop share frames.
- The cursor must never be an emoji or a system icon: it is the drawn 64px SVG.

## Sound

Not measured on the sample. Designed: warm, 100-120 BPM; a soft pop on each
word and on the folder and orb landing, a click where the cursor stops on the
word (1.07s), a whoosh as the stroke draws, a glass shimmer on the sheen
(2.8s), one soft hit on the orb stamp (4.65s).
