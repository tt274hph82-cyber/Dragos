# Scene patterns

Working recipes from real test films (a 16:9 service launch, a 9:16 channel
intro, a 1:1 SaaS feature launch). Each one passed the critique at 8+ on
every axis; each "because" is a defect a render actually showed.

## Frame 0 is the real page, with its own headline

The site's hero screenshot in a `.md-shot.md-window`, on screen at frame 0,
settling from `scale 1.05` (no opacity fade: a fade from 0 is an empty
thumbnail). If the screenshot already carries the headline in the brand's
own type, do not retype it over the top; move the camera instead: read the
headline (`MD.camera` push to it on B2), then push into the thing the page is
selling on B6.

## Crop at the cut: `object-view-box`

```html
<img class="md-crop" src="assets/shots/shot-3.png"
     style="left:76px;top:420px;width:842px;height:454px;object-view-box:inset(395px 570px 100px 264px)">
```

`inset(top right bottom left)` in the image's own pixels; width/height at the
cropped region's aspect. Because: a child `<img>` overflowing a clipping
`div` is reported by the layout check as media spilling off the frame, and a
`scale` on the whole screenshot ("zoom") cuts off the very text the shot
exists for. Crop so every line of text in the shot is WHOLE: a title sliced
at the crop edge reads as a mistake.

`object-view-box` does NOT work on `<video>` (the renderer composites video
frames itself). For video, punch in with a scaled wrapper inside the window:

```html
<div class="md-shot md-window" style="...;overflow:hidden">
  <div id="zoom" style="width:100%;height:100%;transform-origin:64% 60%">
    <video class="clip" data-start="0" data-duration="5" src="..." muted playsinline></video>
  </div>
</div>
<script> tl.set("#zoom", { scale: 1.9 }, 0); </script>
```

The `<video>` itself carries `data-start`/`data-duration`; its wrappers are
untimed (a video inside a timed scene, or a timed wrapper around an untimed
video, both fail the contract).

## The product's own interaction as the motion

Find something on the real screen that already behaves and animate THAT:
the method chart's three tabs lighting one per beat pair (an overlay with the
site's own pink fill and red top rule, sized to the tabs measured off the
screenshot), a red rule running the chart's axis as they light, the word pill
rolling through options, the real page scrolling inside its card. It reads
as the product, not as decoration.

## Counters over the real stats

Each figure the site prints (say `300+`, `$100M+`, `9.2/10`) as a `count` line,
huge, stamping on its beat; the site's own label copy set as a line under
it at a readable size (the screenshot's 14px captions are unreadable at
phone width). The site's real logo band whips up from fully below the frame
on the drop and anchors the bottom, so the frame is filled.

## Marks landing one by one

Wipe the band they sit on in ONCE (0.35s), then reveal the marks on it with
a stepped clip on the image. Because: stepping the whole dark band open reads
as a stray box growing, not as marks landing.

## The push into the proof

Two real cards side by side, carried up from a short offset with a blur (not
from below the frame: an entrance from off-frame trips the frame check),
then the camera pushes ~1.7x into the sentence that matters (an agent's
reply), holds, and crosses to where that sentence shows up (the task it
assigned itself). Clear the headline BEFORE the push, or the scaled cards
cover it.

## 9:16

- Copy lives between y=206 and y=1330 and left of x=918. Below 1330 is
  platform UI: only texture there (the brand's hatch band, a glow).
- Set every big line `white-space: nowrap` and size it to fit 842px: wide
  display faces (a grotesque with `font-stretch: 112%`) run ~0.72em a
  character in caps. An 8-character wordmark at 150px wrapped to two lines;
  at 124px it fits.
- A channel intro wants the channel's own avatar: intake pulls it at full
  size from the linked YouTube channel (the site's favicon is usually a
  192px copy).

## End card

The mark lands on the one big hit (scale 1.6 to 1 from a blur, then a small
stamp), the wordmark wipes in on the shimmer, then the real button (the
brand's own fill, radius, weight and case) and the URL. All `data-out="end"`.
It may hold up to ~3s; nothing else may.

## Sound

- A UI sound owns its instant: the synth drops hats and plucks there and
  halves the kick, and gains each effect against its own local bed. A pop on
  a beat where a kick, a hat and a pluck all land is inaudible otherwise.
- Do not put a whoosh on the drop: the impact is already there. Put it on the
  move that actually travels (the zoom-through, the carry).
- The renderer's own mixer lands the score ~2 dB low; render.mjs re-muxes the
  measured score once onto the picture.

## World patterns (the rebuilt films, 8.0-8.2 on every axis)

**One recording becomes a pipeline (16:9 service).** Frame 0: the claim
slammed at 280px over the brand's silk with a glass REC pill counting a real
number on a timecode. A glass recording card with a live waveform flies in
from z -1100; on the beat it bursts into the six jobs the service runs, each
a glass tile flying to a 3D arc with a bar filling. The camera dives through
the tiles (scale 2.6, blur 18, power3.in) onto a lit rail of three glass
stations (the site's own phases), tracking station to station with depth of
field, each station acting: dots pouring into a point, a ring filling, bars
growing.

**Rack focus on the numbers.** Three glass plates in a 3D arc; on each
beat-pair one slides forward in z, sharpens and stamps its count while the
others sit back blurred; on the last beat all three come forward together
under one light sweep.

**The logo wall.** The client marks (trimmed with `trim-alpha.mjs`) on a 3x3
of glass tiles, each flying in from z -1400 on a seeded offset, 0.13s apart,
while the whole wall orbits a few degrees. It leaves completely (opacity 0)
before the next line starts.

**A video becomes a write-up (9:16 creator).** The site's own line slammed
word by word; a real video thumbnail (fetched full size) in a glass player
flies in tilted; the camera dives into it and it opens into a glass document
whose parts fly out one per beat; they fold into one envelope that slams on
the drop; real titles with their real thumbnails cascade in as rows; the
count of write-ups stamps.

**A word that opens worlds (1:1 SaaS).** The site's own word pill rolls on
frame 0; each value it lands on opens a world under it (a real page flying
out of the pill with a highlight stepping down its rows; two real pages
carried in with a push into the sentence that matters; the real product video
falling flat from a 24 degree tilt, punched in 1.9x on the part that moves).

## Device patterns (the 3D device pass, 8.3-8.5)

**The product plays on a real MacBook (1:1 SaaS).** On the drop the MacBook
rises from below turning, the product video playing on its screen as a frame
stack; the camera dollies in until the laptop fills 90% of the width. The
line sits ABOVE the screen: anything below y~860 at 1:1 lands on the keyboard.

**The site on both devices (16:9 service).** Two bars before the end card,
`duo`: the MacBook rises with the live site's hero, the iPhone swings in a
beat later; the laptop scrolls hero, numbers, method while the phone scrolls
to the testimonials. One line above both quotes the section the laptop lands
on. Keep the phone level with or behind the laptop in z: nearer the camera it
grows in perspective and leaves the frame.

**The site in the hand (9:16 creator).** `iphone`: it rises showing its
back in the brand's rim light, spins to the screen and scrolls the live
mobile site from its hero (which can repeat the film's hook) through the
real articles to the sign-up, then hands over to the end card. No line over
it: the phone's own copy is the copy.

**Adding the shot to a finished grid.** Add whole bars (shots are in beats),
move the logo cue and the end card by the same number of beats, re-run
beatgrid.mjs and synth.mjs (the score must be rebuilt for the new length),
then device-init and render. Two bars at 120 BPM is a 4s shot.

## Contract gotchas the rebuild found

- `data-layout-allow-overflow` on every `.md-rig`: a camera world frames
  things partly off-screen on purpose.
- HyperFrames' frame check reports cropped media as off-frame even inside a
  clipping parent; render.mjs keeps it as a warning, so read it in the
  critique rather than ignoring it.
- Never tween `letter-spacing`, `width`, `top` or `left`: they snap to whole
  pixels (`gsap_non_transform_motion`). Scale instead.
- An entrance from off-frame trips the frame check; carry things in from a
  short offset with a blur instead.
- A `.clip` scene must not be transformed itself; move a child or a rig.
- WebGL (`MD.silk`) disables HyperFrames' render-time motion blur; fast moves
  carry their own `filter: blur` instead (MD.fly, MD.whip, MD.zoomThrough do).
