# Motion rules

Distilled from several hundred review notes on real edited films. Every rule
here exists because the opposite shipped once and came back as a note. Read
it before writing a scene; read the "repeated notes" section before every
critique round.

## The bar

Correct is not the goal. A film can pass every rule below and still be
boring. The jaw-drop checklist in `direction.md` comes first: a world (silk
under glass), one continuous camera, something new every beat, real brand
material made physical, heroes at 40%+ of the frame, depth of field, one
signature moment on the drop.

## The four hard rules

1. **No centred text on a plain gradient.** A type-only scene needs a reason
   written on it (`data-type-scene="..."`), and "it looks clean" is not one.
   The default answer to "what is on screen" is the product.
2. **No generic stock-icon slop.** No icon fonts, no Lucide/Heroicons/Material
   sets, no emoji standing in for icons, no lettermark in a box where a real
   logo belongs. If a brand mark is not on disk, say so; a placeholder next to
   two real logos reads as a missing image.
3. **Every text line has a deliberate entrance and exit.** `md.js` throws on a
   line without both. "end" is an exit only for the end card's last line.
4. **Real material over drawn mockups.** Use the brand's captured screens,
   its product video, its video thumbnails and its client marks, made
   physical in the world. Never pan a marketing-page screenshot around as
   the picture: that was the single biggest reason the first test films
   were rejected. A drawn UI is the most obviously
   generated thing in a film; rebuild only what was never recorded, and then
   build it out of the product's measured materials (its own surface colours,
   radius, type), never as a diagram about the product.

## What goes on screen

- **Show the thing doing the thing.** A product's demo beats its page; its
  page beats press coverage of it. The result arrives as it happens, not
  after: start the shot the moment the action becomes the subject.
- **An instrument, not a sentence.** To say "fast", show a counter stopping;
  "a lot", a list that fills; "time", a clock. The only words left on screen
  should be data and the one line the film is landing.
- **One idea per frame.** A concept may be several mini-scenes; give each
  clause the whole stage in turn, and hand over as a cut, not a crossfade (a
  crossfade puts two ideas on screen for a third of a second).
- **A list of N points is N pictures,** not one card with N rows lighting up.
- **The first thing is on screen at frame 0.** Frame 0 is the thumbnail and
  the hook: a result, the product or one bold line. Never black, never a logo
  waiting to fade in. Structure may arrive over the first second; the frame
  must not be empty for longer than that.
- **Fill the frame.** Size type and panels to the space; never top-anchor a
  short panel and leave the bottom 40% dead.
- **The payoff is shown once, where it is earned.** Tease before it (blurred,
  partial, pixelated); reveal on the drop.
- **A number travels to the claim.** Start from what the viewer already
  knows and count to the new value. A counter shows nothing until it starts
  (a pre-roll "$0" reads as a real figure), fills well inside its beat,
  STOPS, and is stamped.
- **Every figure on screen has a source.** A plausible invented number is
  the one nobody catches. If a figure cannot be sourced, it does not render.
- **A highlight is typography, not an event.** The accent word is accented
  from the first frame it appears; one accent per line, in the brand accent.
- **A wide wordmark is sized by width,** never boxed in a square (a 4.6:1
  logo in a square renders at 5% of the frame height). Measure a logo's ink,
  not its canvas: app icons carry invisible margins.
- **Measure a mark against the surface it sits on, both directions.** A
  black logo on a dark ground is a rectangle of nothing; a white one on white
  is the same bug. If two things touch, check their contrast.

## How things move

- **An animation is an object behaving,** not a layout containing an idea.
  Name the one continuous quantity (speed, load, progress) and derive the
  visuals from it. If nothing moves between the beats, it is a diagram.
- **Arrive slow, leave clean.** Arrivals land on a long tail (`expo.out`,
  `power4.out`); exits are 40-50% shorter and accelerate out (`power3.in`).
  Camera moves ease both ways (`power2.inOut`). Linear only for rotation and
  progress.
- **A landed line is dead still.** The motion moves to the next element, the
  camera, or the world behind. No breathing, floating or pulsing loops; no
  slow creep on a title; no per-item wobble. A group drifts as ONE body.
- **Nothing holds still for more than ~3 seconds.** If a hold is longer,
  the gap needs its own beat. Measure it on the render (critique does), and
  when it fires on a scene that HAS a beat there, the beat is too small to
  see: change a band of the frame, not a dot.
- **Overlap.** The next element starts when the previous is 30-50% done.
  Fully sequential looks robotic; all at once looks cheap.
- **Stagger:** letters a frame apart, words 60-120 ms, list items 40-80 ms.
- **Do not zoom for the sake of it.** A push removes the edges, often the
  very text the shot exists to show. Crop to the region instead, then hold.
  A push is for a specific element being tracked, and it carries a reason.
- **One continuous camera** reads as a world; a cut between unrelated
  layouts reads as slides. Enter the next scene through an object on screen.
- **Transitions have a cause:** zoom through a button, an object becomes
  the next world, a morph, a carry across, a colour flood, a whip, an iris
  from a click. Three to five kinds in a film; at most a third of the seams
  are hard cuts.
- **Cut on the beat, change the layout on the bar.** Beat times come from
  the beat INDEX (`MD.B(n)`), never from adding a rounded beat repeatedly.
- **A scene must not open on its own conclusion.**
- **A collapse goes to zero.** Elements meant to leave reach opacity 0, then
  the survivor arrives, drawn last.

## Layout

- **Inside the safe box.** `MD.safe` (and `--safe-*` CSS vars) per format.
  9:16: nothing in the top 168px, no copy below y=1330 (the platform's
  caption, handle and buttons), nothing under the right-hand action rail.
- **Derive geometry from the stage lines,** never from offsets that look
  right: equal boxes, one grid, wires orthogonal and landing on edge centres.
- **Reserve, then fit.** When a panel's size comes from an image's aspect,
  take the furniture's band off first and fit the picture into what is
  left. `h = w / ar` then positioning something below it runs off the frame.
- **A width is a function of its own text,** never a fixed number. Check every
  moving element at both end states and along the path.
- **Round every centring expression to a whole pixel.** A 0.5px edge
  flickers between two colours across the shot.
- **Type size:** titles 4-9% of frame height; nothing meant to be read under
  ~2.6% of the short side (28px at 1080). Vertical: titles ~1.35x larger,
  about 5 words a line.

## Text, shadows and clips

- **Never clip text that has a shadow.** A clip-path wipe clips to the border
  box and slices a shadow flat into a rectangle (the "drop shadow is always a
  box" note). md.js wipes use negative insets on the sides that are not
  wiping; do the same in hand-written moves.
- **Never paint a ground behind an add-on** (no radial scrim, no box-shadow
  around a transparent mark). Lift with `filter: drop-shadow(...)`, which
  follows the element's own alpha, soft and low.
- **A clip's floor sits below the descenders and the glow.** A mask whose
  bottom edge is the line box slices a "g", a "y" and a lit word's glow flat
  (worst at line-heights under 1). md.js masks drop the floor 0.42em below
  the box; a hand-written clip does the same (`inset(... -0.42em ...)`).
- **Tracking no tighter than -0.025em.** Tighter, and glyphs overlap ("t"
  into "h"); every overlap renders as a hairline seam through the letters.
  lint-md fails the build on it. Tighten with a narrower weight or size, not
  negative tracking.
- **A highlight, cursor or stamp lands on the real element.** Measure the
  screenshot (`scripts/find-rows.mjs <img> --box WxH --inset N` prints each
  row's centre in the box's own pixels) and paste the numbers. An eyeballed
  offset lands between rows and reads as broken.
- **No em dashes or en dashes in on-screen copy.** Use a comma, a colon, or
  two sentences. lint-md fails the build on one.

## Reading time

A line the viewer must read holds about 0.5s plus 0.3s a word; the film's last
line at least 2s; a one or two word chapter line 0.4s. In a 10-30s film that
budget is tight, so cut words rather than shrink holds.

## Repeated notes (read before every critique)

These came back on several films each. When one recurs, stop restyling and
find the mechanism.

- "Too much empty dark screen": the frame is not filled.
- "Nothing is happening for a few seconds": a hold over 3s.
- "Why are these boxes moving so robotically": per-item wobble or overshoot.
- "The drop shadow is a box": a clip on shadowed text.
- "This looks like a mockup": a drawn UI where a real screen existed.
- "The logo is tiny": a wide mark boxed in a square.
- "It is empty at the start": frame 0 has nothing on it.
- "The animation does not match what is said / happens late": beats read from
  two files, or a guessed stagger instead of the grid.
- "Too zoomed, I cannot read it": a push that cut off the text.
- "Why are the letters and the glow cut off at the bottom": a mask floor at
  the line box.
- "There is a line through the letters": tracking tighter than -0.025em.
- "The highlight misses the row": positions guessed, not measured.

## The md.js moves

Entrances (`data-in="kind@time"`):

| kind | what it does | use for |
|---|---|---|
| `words` | each word blurs in, 67ms apart, no move | most lines |
| `ink` | words go from faint to full ink | quiet supporting lines |
| `line` | the whole line resolves from an 8px blur | short punchy lines |
| `letters` | per letter, opacity and slight blur | a name, a wordmark |
| `rise` | rises out of an invisible floor (no shadows!) | headlines with weight |
| `scale` | lands slightly large, settles, sharpens | a hero word or number |
| `wipe` | left-to-right reveal, shadow-safe insets | labels, UI strings |
| `type` | typed per character with a finite caret blink | prompts, commands |
| `slot` | rolls through `data-options="a|b|c"` and lands | the one word that changes |
| `count` | counts `data-from` to `data-to`, stops, stamps | figures (sourced!) |
| `present` | on screen from that time, no move | end card carried in |

Exits (`data-out="kind@time"`): `blur`, `words`, `up`, `down`, `wipe`,
`scale`, `cut` (only when the whole scene cuts), `end` (end card only).

Vary the entrance within a film; never fade-and-slide-up everything.

Times are beat specs: `B12`, `bar3`, `B12+0.1`, `drop-0.2`, or seconds.
