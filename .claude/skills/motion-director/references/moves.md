# Moves: single effects, transitions, stings and overlays

A MOVE is one animation that does one job, 2 to 6 seconds long, that renders
in any brand, any aspect (9:16, 16:9, 1:1) and either full-frame (a B-roll
cutaway, `--bg look`) or transparent (an overlay on a talking head, `--bg none`,
ProRes 4444 `.mov` or VP9 `.webm`). Themes (templates/themes) are whole films;
moves are their parts, usable inside any video.

    node scripts/move-render.mjs --move bar-race --aspect 9:16                   # B-roll, example brand
    node scripts/move-render.mjs --move bar-race --brand <project> --bg none --format mov \
         --vars '{"labels":"Manual,Templates,{brand}","values":"14,31,72"}' # overlay, their brand
    node scripts/gallery.mjs                                                   # previews, gallery.html, CATALOG.md + catalog/

Export notes: ProRes 4444 `.mov` drops into Premiere, Final Cut and Resolve
with its transparency. VP9 `.webm` alpha plays transparent in browsers only.
CapCut wants a green-screen MP4 (`--format mp4 --vars '{"key":"#00FF00"}'` on a
move with alpha paints the ground pure green) or a GIF (glows band on GIF).

## Folder

    templates/moves/<id>/
      move.json      metadata (below)
      index.html     the composition, with {{W}} {{H}} {{DUR}} placeholders
      assets/        the move's own static files (optional, generic only)
      preview.mp4    3-4s loop in the example brand (templates/demo-brand), 9:16, 540px wide (gallery.mjs writes it)
      preview.gif    same, 270px wide, for chat (local only: left out of the shared zip)

Choosing moves: read `templates/moves/CATALOG.md` (the category index), then only the
`templates/moves/catalog/<category>.md` files that fit the beat, never every move.json or
gallery.html. A move's `say` becomes its catalogue line, so write it as "when the speaker says...",
and its `category` decides which catalogue file it is listed in.

move.json:

    { "id", "name", "oneLiner",
      "category": "social" | "creator" | "ai" | "dev" | "productivity" | "business" | "data" | "paper" | "system" | "explain",
      "kind": "effect" | "transition" | "sting" | "film",
      "uses": ["overlay", "broll", "transition"],
      "looks": ["glass" | "paper" | "riso" | "mono" | "studio" | "editorial"],
      "from": "<theme id it comes from, or new>",
      "tags": [...],
      "formats": ["9:16","16:9","1:1"], "duration": 3.2, "alpha": true,
      "say": "when to use it in a talking-head video: what the speaker says when it lands" }

## The composition contract

- `<html data-composition-variables='[...]'>` (single-quoted, so no apostrophes in any
  label or default: one silently breaks every variable) declares the move's OWN variables
  (`{id,type,label,default}`), with defaults that read well in any brand (no product-specific copy:
  put example copy for the example brand in its brand.json `examples`).
- Load `gsap`, `assets/brand-fonts.css`, then `assets/move.js`, then the move's
  script. `MV` (move.js) gives `v` (variables), `W/H`, `u` (= min(W,H)/1080,
  size EVERYTHING in `calc(var(--u) * n)` or `n * u`), `portrait`, `alpha`,
  `safe` (platform UI zones on 9:16), `tl`, `rand`, `st` (on-twos ease),
  `words`, `fit`, `img`, `done()`. Call `MV.done()` last.
- Brand tokens arrive as variables and as CSS vars on `#root`: `--accent
  --accent2 --ink --ground --surface --muted --paper --font-display
  --font-body`. Brand files: `v.logo`, `v.mark`, `v.screens[]`, `v.people[]`
  (paths under assets/brand/), `v.brandName`, `v.domain`, `v.headline`,
  `v.tagline`, `v.handle` (may be empty: derive from the name), `v.stats[]`. Never hardcode a brand.
- `bg`: when `MV.alpha`, draw NO ground, grain or full-frame vignette (the
  root gets `.is-alpha`); keep the object, its shadow and glow. Give the
  object enough body (a surface fill) to read over any footage.
- `key` (a hex like `#00FF00`): the overlay on a flat key colour for editors
  without alpha. The root also gets `.is-key`: there every surface, plate
  and card must be OPAQUE (`.is-key .card { background: var(--surface) }`, no
  backdrop-filter), and avoid large soft glows, or the keyer eats them.
- Layout from `W/H/u` and `MV.safe`. On 9:16 an OVERLAY keeps clear of the platform UI
  (top 290px, bottom 680px, right 192px, scaled by W/1080); a full-frame B-roll cutaway is
  CENTRED in the frame (`MV.safe` gives symmetric margins when not alpha), accepting that
  captions may sit over its lower part. Overlays sit where a
  talking head leaves room: lower third or upper third, never on the face
  zone (the centre 40% band of 9:16) unless the move is a full cutaway.
- Overlays start from an empty frame at t=0 (they are cut in on a word) and
  leave clean before their end (exit in the last 0.3-0.45s, accelerating).
  Full-frame B-roll may open on its ground.
- Text: fit it (`MV.fitText`, which measures the text itself; the older `MV.fit`
  over-shrinks text in block or flex boxes) so a longer brand string never spills; one idea per
  move; labels, not sentences.
- Never tween `filter: blur()` on a `back` or `elastic` ease: it overshoots below
  zero, `blur(-0.5px)` is invalid and the frame keeps a stale blur. Blur and
  opacity on `power`/`expo`/`steps`; springs on transforms only.
- Reserved names: a move's own variables must never reuse a brand or runtime token
  (`key`, `bg`, `aspect`, `mark`, `logo`, `screens`, `people`, `handle`, `ink`, `accent`,
  `ground`, `surface`, `paper`, `muted`, `domain`, `headline`, `tagline`, `stats`), and
  scripts never declare a global `top` (it collides with `window.top`). The renderer
  also sets every variable on #root as a CSS custom property of the same name, so never
  name a CSS property after one of the move's own variables (`--tone` with a `tone` variable).
- Success states (checks, done, paid) use a semantic green, never the brand accent.
- Deterministic: no Math.random, no Date, no timers; seeded `MV.rand`.

## The bar (read before building)

These are judged against films the author approved. A move must look like
senior motion design, not a template: real material (the brand's screens,
logo path, people cut-outs, CC0 photos and 3D renders from find-assets /
prop-render), measured light (rims, sheens, glows, contact shadows), eases
with long tails (`expo.out`, `back.out(1.4-2)` for springs, `steps(n)` for
paper on twos), overlap between elements, and one moment that lands (a stamp,
a click, a snap). Never: flat clip-art, icon fonts, emoji, centred text on a
plain gradient, a text slide, a line crossing a glyph.

## Verify every move

    node scripts/move-render.mjs --move <id> --aspect 9:16 --quality draft --keep   # prints the work dir
    node scripts/frame-audit.mjs <work dir>                                        # must be clean
    # also --aspect 16:9 and, if alpha, --bg none --format mov over a coloured plate
    ffmpeg -i out.mp4 -vf "fps=4,scale=200:-2,tile=12x2" -frames:v 1 sheet.jpg     # LOOK at every frame
