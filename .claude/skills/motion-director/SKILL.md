---
name: motion-director
description: "Branded motion graphics: films, B-roll and overlays. Makes a 10 to 30 second branded video (product launch, animated UI demo, channel intro, explainer) or single moves (B-roll cutaways, transparent overlays, transitions, stings, lower thirds, stat counters) for a talking-head video, rendered locally with HyperFrames. Use when someone asks for a promo, launch video, product video, motion graphic, animated demo, intro, teaser or explainer for a product, site or brand, gives a URL and asks to make a video of it, wants B-roll, overlays or graphics for a video they filmed, or says set up motion director. Pulls the brand's real logo, colours, fonts and screenshots, shows a preview gallery to pick from, plans every shot for approval, synthesises an original score, then renders, critiques and fixes the result. Not for cutting filmed footage."
---

# motion-director

A link or a one-line brief in; a branded 10-30s motion graphics MP4 out,
rendered locally with HyperFrames (HTML + GSAP, deterministic, frame by frame).

Everything lives in one project folder. Scripts are in `scripts/` (Node 22+,
no dependencies) and are run as `node <skill>/scripts/<name>.mjs`.

**The bar is jaw-dropping, not correct.** Read `references/direction.md`
before the beat grid (storylines, the numbers-only spec, the jaw-drop
checklist, the banned list), `references/motion-rules.md` and
`references/scene-patterns.md` before building, and `references/critique.md`
before scoring.

Setup check first, every new machine: `node scripts/check-setup.mjs` (add
`--fix` to fetch HyperFrames and its Chrome). If anything is missing, tell
the user the exact fix it prints and stop.

## First run: onboard the user

If `~/motion-director/profile.json` does not exist (or `$MOTION_DIRECTOR_HOME/profile.json`),
or the user says "set up motion director", onboard them before anything else. Keep it
short and friendly, one step at a time:

1. Say in two lines what this does: whole branded films from a link, and single moves
   (B-roll cutaways, transparent overlays) for videos they filmed, all rendered on their
   own machine.
2. Run `node scripts/check-setup.mjs --fix`. Anything still missing: give the exact fix
   it prints and wait.
3. Ask, in ONE batch: their website or brand link (or "skip" to use the example brand),
   their editor (Premiere, Final Cut, Resolve, CapCut, other) and the format they post
   most (9:16, 16:9, 1:1).
4. With a link: `node scripts/new-project.mjs "onboarding" --format <their format>`, then
   `node scripts/brand-intake.mjs <url> --project ~/motion-director/projects/onboarding`
   and the `pick` step (section 2 below). The brand lands in `~/motion-director/brands/<domain>`.
5. Prove it works in their brand: render one move, `node scripts/move-render.mjs --move notify-stack
   --brand ~/motion-director/brands/<domain> --aspect <their format>`, LOOK at it, send it,
   and show `gallery.jpg` (or `gallery.html` where they can open a page).
6. Write `profile.json`: `{ "brand": "<brand dir or empty>", "editor": "...", "aspect": "...",
   "export": "mov" | "mp4-green" }` (CapCut gets `mp4-green`, every other editor `mov`).
   Use it as the default for every later job; the user can change it any time.
7. Finish with the starter prompts below, so they know what to say next.

## Starter prompts (show these after onboarding, or when asked what this can do)

- "Make a 20 second launch video for <link>, 9:16."
- "Here is my script: <paste>. Pick B-roll and overlays for it and give me the list."
- "Give me a transparent overlay for when I say <line>."
- "Show me the gallery of moves." / "Show me the themes."
- "Make a channel intro for <channel link>."
- "Copy the style of this video, for my brand: <reference link>."
- "Add this to the library: <link to a motion graphic you like>."

## Two kinds of job: a FILM or MOVES

Ask first, if the brief does not say: **a whole film** (a 10-30s launch,
intro, demo; the pipeline below) or **moves for a video they filmed**
(B-roll cutaways, transparent overlays on the talking head, transitions,
stings). For moves:

1. Use the brand, aspect and export from `profile.json` unless they name others
   (a new link runs step 2's intake; no brand uses the example brand, for previews
   only), and ask for the script or transcript if they have one.
2. Read `templates/moves/CATALOG.md` (a short index of ten categories), then
   only the one or two `templates/moves/catalog/<category>.md` files that fit
   what the speaker is talking about (one line per move: id, uses,
   transparent or not, when to use it; ~1k tokens each). Those are the ONLY
   files to read for choosing. Never read `gallery.html` (~100k tokens) or
   every `move.json` (~60k); open a move's own files only for the 1-2 being
   rendered. Name the 4-6 that fit their words and what each is for, and
   point the user at `gallery.html` (looping previews to open in a browser,
   filter by use and look) or send `gallery.jpg` in chat, so they see them
   instead of reading descriptions. `node scripts/gallery.mjs` rebuilds the
   gallery and the catalogue after moves change.
3. With a transcript, place them: one move per idea worth seeing, never two
   within 4 seconds, matched by the catalogue's "when to use it" (a number spoken -> a counter, a
   product named -> its screen, a list -> the ordinal card, a topic change
   -> a transition). Write the list (time, move, variables) and WAIT for a yes.
4. Render each: `node scripts/move-render.mjs --move <id> --brand <project>
   --aspect <their video's> [--bg none --format mov] --vars '{...}'`. Overlays
   go out transparent (ProRes 4444 `.mov` for Premiere, Final Cut and
   Resolve; `--format webm` for the web); CapCut takes `--format mp4` with
   `--vars '{"key":"#00FF00"}'` on a green key. B-roll goes out as MP4.
5. Verify every render like a film (frame-audit, a 4 fps contact sheet, LOOK),
   then deliver the files named `<time>-<move>.<ext>` with the placement list.

The full contract for moves is `references/moves.md`.

## The pipeline, in this order

### 1. Interview (at most 5 short questions)

Ask only what the brief does not already answer, in ONE batch (use the
question tool when there is one):

1. **What is it for?** launch, feature, UI demo, channel intro, explainer, ad
2. **Length?** 10-30s (default 20)
3. **Format?** 16:9, 9:16 or 1:1 (default 16:9; 9:16 for Reels/TikTok/Shorts)
4. **Theme?** one of the library (`references/themes.md`): glass, glass-folder, studio, product-ui, logo-build, monochrome, retro-print, puppet, safari-collage. If they have no answer, do not guess: step 2b shows them
5. **One signature moment?** the single shot people should remember

Then create the project and write the answers into `brief.md`:

    node scripts/new-project.mjs "<title>" --format 16:9 [--dir <path>]

Projects default to `~/motion-director/projects/<slug>`; brands are kept in
`~/motion-director/brands/<domain>` and reused (`MOTION_DIRECTOR_HOME` moves both).

### 2. Brand intake

    node scripts/brand-intake.mjs <url> --project <dir>

A headless browser captures the site: colour roles measured from how the page
uses each colour, the type ramp and its font files, logo candidates (including
a vector mark from Simple Icons when one exists), every large product image,
frames of the site's own product video, viewport screenshots, and the
full-size avatar of a YouTube channel the site links (for channel intros). It drafts
`brand.json` + `brand.md` in the brand library and copies them into `brand/`.
**If the library already has a `brand.md` for that domain, it is reused**
(`--refresh` to capture again).

Then LOOK at `candidates-sheet.png` and `logo-sheet.png` and record the real
logo and 3-6 real PRODUCT screenshots (the product's own UI; not people
photos, not marketing banners, not the cookie bar):

    node scripts/brand-intake.mjs pick --project <dir> --logo <file> --shots a.png,b.png,c.png [--mark <file>]

If the product lives behind a login and the site shows no real UI, ask the
user for 3-6 screenshots (naming the screen per beat) rather than drawing
one. Captured fonts are the brand's own files, used only to render that
brand's own film; if none were captured, the nearest bundled face is used and
`brand.md` says so.

### 2b. Theme (show, do not ask in words)

If the brief names no theme, show the board:

    node scripts/theme-board.mjs --project <dir>

It shows each theme as key frames of the approved film it comes from (and
renders `studio` live in this brand), writes `themes/board.png` and
`themes/board.md`. Where the user can open a page, `gallery.html` (from
`node scripts/gallery.mjs`) shows the same themes next to the moves. Show it, say in one line what each theme is best for, and
ask which. Then:

    node scripts/film-init.mjs --project <dir> --theme <id>

Read `templates/themes/<id>/RECIPE.md` in full before the beat grid and build
every beat from it: its pace, shot grammar, materials, eases and sound, with
this brand's words, logo, screens, video and people. Compare the render side by
side with the theme's preview before showing anyone. A theme the user links
that is not in the library gets built first (`references/themes.md`, "Adding to
the library": `scripts/add-reference.mjs`), and becomes a new recipe once the
user approves the film.

### 3. Reference style (only if the user gives a reference video)

    node scripts/ref-style.mjs <url|file> --project <dir>

Downloads it (yt-dlp, for a URL), takes a frame every 0.5s, measures cut
times and shot lengths, the palette by area and motion energy per second, and
drafts `ref/style.md`. LOOK at `ref/sheet-*.png` and finish `style.md`: type,
transitions, camera moves, texture, how text enters and exits, and five
concrete grammar rules. **Copy the grammar, never its content, logos,
characters, footage or music.**

### 4. Direction, beat grid, then WAIT

First the direction (`references/direction.md`): write `STORYLINES.md` (three
films that differ in device and form, one of them bold, a recommendation) and
`SPEC.md` (every adjective a number, a BANNED line). Then write `beatgrid.json` (schema and tempo table: `references/beatgrid.md`), then

    node scripts/beatgrid.mjs --project <dir>

It validates the plan and prints `beatgrid.md`: every shot with its time, its
beats, what is on screen, the motion and the sound cue. **Show that table and
wait for the user's approval. Do not write any animation code before they say
yes.** Revise and re-run as often as they ask. When they approve:

    node scripts/beatgrid.mjs --project <dir> --approved

Plan the shots from the brand's real screenshots: the hook shows the product
or a result at frame 0; one idea per shot; the signature moment on the drop;
the logo lands on the last bar with the one big hit, then holds.

### 5. Build

    node scripts/synth.mjs --project <dir>       # score first: the film plays it
    node scripts/film-init.mjs --project <dir> --theme <id>   # film/ in the brand and the theme

The theme's `sound.vibe` and BPM range (`theme.json`) are the defaults for the
grid's `vibe` and `bpm`. Build with the theme's own classes and moves
(`THEME.md`); the core rules below hold in every theme.

Write the scenes in `film/index.html`: one `<section id="<shot id>"
class="clip md-scene" data-start data-duration>` per shot with exactly the
grid's times, every text line a `.md-line` with an `id`, a `data-in` and a
`data-out` (`md.js` throws otherwise), and the film's own moves in the script
with beat-spec times (`MD.t("B12")`, `MD.camera`, `MD.cursor`, `MD.stamp`).
Default to HyperFrames. Use Remotion only if the user already has a Remotion
project (`references/remotion-fallback.md`).

**The world:** a silk ground in the brand's own colours (`MD.silk`) under
glass panes (`.md-glass`, `.is-light` on light brands), one continuous camera
(`.md-rig` with `data-layout-allow-overflow`; `MD.fly`, `MD.camera`,
`MD.zoomThrough`, `MD.whip`, `MD.punch`), depth of field on whatever is not
the subject, a light sweep (`MD.sweep`) as each pane lands, and something new
on every beat. Kinetic type: `zoom`, `mask`, `split`, `words`, `slot`, `count`.

**The device shot** (the strongest signature moment in testing): a real 3D
MacBook and/or iPhone with the brand's real site or product on its screen.

    node scripts/device-init.mjs --project <dir> --preset macbook|duo|iphone \
         --start <spec> --duration <s> [--rim <accent>] [--env <hex>]

Put the screen in `<dir>/device/`: `laptop.html` (1440x900), `phone.html`
(390x844), `screen.css`, and `screen.js` defining `window.MD_SCREEN_dev(p, t)`.
Fill it with REAL material: the live site captured at that width (headless
Chrome, full page, `--window-size=1440,5200` or `390,7000` with
`--force-device-scale-factor=2`) scrolled on eased stops chosen to land on its
own headline, numbers and proof; or the product video as a frame stack
(`ffmpeg -vf fps=12`, one `<img>` per frame, switch on `t`). Mount the printed
host line ABOVE the silk; give the shot its own `<section id="<shot id>">`
for any line over it, placed above or beside the device, never on its
keyboard. `macbook` for one product, `duo` (laptop + phone) for a site that
works on both, `iphone` for 9:16 and mobile-first brands. 3-5s is enough.

**Hard rules** (lint-md enforces what it can):
- no centred text on a plain gradient; a type-only scene needs a written reason
- no generic stock icons, icon fonts or emoji; the brand's own marks or nothing
- every text line has a deliberate entrance AND exit
- real brand material over drawn mockups: at least 3 pieces on screen (screenshots,
  product video, video thumbnails, client marks); never marketing-page screenshots
  panned around as the picture
- safe margins for the format (`MD.safe`, `--safe-*`); 9:16 keeps copy out of
  the top 168px and below y=1330 and away from the right rail
- no em or en dashes in on-screen copy
- every frame passes `scripts/frame-audit.mjs` (render.mjs runs it): no text
  outside the box it is printed on, none outside the frame margin, no text on
  text. Then look at a sheet of every 4th frame yourself: the audit catches
  geometry, not taste (a blob crossing a word, a wipe that does not cover, an
  empty first frame)
- type renders whole: tracking no tighter than -0.025em (tighter seams the
  letters), and no clip floor at the line box (it cuts descenders and glow)
- anything that points at the real UI (highlight, cursor, stamp) lands on
  positions measured with `scripts/find-rows.mjs`, never eyeballed
- every figure on screen is sourced; a counter shows nothing until it counts
- deterministic: no clocks, no Math.random (use `MD.rand(seed)`)

### 6. Sound

Already made in step 5 from the same grid: an original beat track at the
grid's BPM (pad, pluck, bass, drums, riser into the build, impact on the
drop) plus one UI sound per role (click, tick, pop, whoosh, hit, shimmer),
each PEAK placed on its frame, the mix at -14 LUFS / -1 dBTP. Re-run
`synth.mjs` after any change to the grid. Never use copyrighted music. See
`references/sound.md`.

### 7. Render, critique, fix (max 3 rounds)

    node scripts/render.mjs --project <dir> --round 1
    node scripts/critique.mjs --project <dir> --round 1

render.mjs runs lint-md and `hyperframes check` (contract, layout, frame
edges, the 9:16 caption band, contrast, craft) and refuses to render on any
error. critique.mjs measures the delivered file (timestamps, the longest
still stretch per shot, frame 0 ink, loudness, whether each sound effect
lands on its frame) and draws `dense.jpg` (a frame every 0.5s: most defects
live between shot midpoints), `sheet.png` and `phone.png`.

LOOK at all three, then fill `critique/round-1/scores.json`: hook, brand,
motion, readability, pacing, polish, each 1-10, anything under 8 with a
concrete fix line (`references/critique.md` has the anchors). Then

    node scripts/critique.mjs --project <dir> --round 1 --verdict

**Show the user the score table every round.** FIX means apply every fix and
render the next round; PASS means deliver; after round 3, deliver the best
round and say what is still under 8.

### 8. Deliver

    node scripts/deliver.mjs --project <dir> --round <n>

Writes `out/<slug>.mp4` and `out/LOG.md`: total time, time spent waiting on
approval, working time, render time per round, API cost (zero unless the user
opted into cloud features), the score table per round and what was measured.
Hand over the MP4 path, the project folder and the log, and say plainly that
the sound was measured, not listened to.

## Privacy and cost

HyperFrames runs through `scripts/lib.mjs` with telemetry off, without
installing its own agent skills, and with cloud vision and HeyGen keys removed
from its environment, so no frame leaves the machine and nothing is billed.
Set `MD_ALLOW_CLOUD=1` only if the user asks for those features.

## Files

    scripts/   check-setup  new-project  brand-intake  ref-style  beatgrid
               synth  film-init  theme-board  gallery  add-reference  move-render  find-assets  prop-render  cutout  proof-render  frame-audit  device-init  lint-md  render  critique  deliver  trim-alpha  find-rows  lib
    templates/hyperframes/  index.html  md.js (runtime)  md.css  md-world.css (glass, 3D)  md-silk.js (WebGL ground)
                            md-device.html (3D MacBook / iPhone scene for device-init)
    templates/themes/<id>/  theme.json  RECIPE.md  (+ preview.jpg locally; studio also sample.html)
                            glass  glass-folder  studio  product-ui  logo-build  monochrome  retro-print  puppet  safari-collage
    templates/moves/<id>/   move.json  index.html  (assets/)  preview.mp4  preview.gif   one effect each
    templates/moves/_lib/move.js   the moves runtime (brand tokens, safe zones, alpha)
    templates/demo-brand/   the example brand the previews are shown in (the author's own: photo, site screens,
                            name), plus "examples": per-move example copy; swap in any brand.json to rebrand them
    gallery.html  gallery.jpg      the looping preview gallery (scripts/gallery.mjs), for people, not for reading
    templates/moves/CATALOG.md     index of move categories: what to read first to choose moves (written by gallery.mjs)
    templates/moves/catalog/       one file per category, one line per move (written by gallery.mjs)
    templates/remotion/src/md.tsx   the fallback's helpers
    references/  themes  moves  direction  motion-rules  scene-patterns  beatgrid  critique  sound  hyperframes  remotion-fallback
