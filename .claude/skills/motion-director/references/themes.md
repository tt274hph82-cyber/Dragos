# Themes

A theme is a whole visual language: its grounds and materials, its type, its
motion, its transitions and its sound. The brand fills it (colours, fonts,
logo, real screens); the theme decides how they move. Every theme lives in
`templates/themes/<id>/`:

| file | what it is |
|---|---|
| `theme.json` | name, one line, what it is best for, its motion, ground, sound, sample stills |
| `theme.css` | its materials, drawn in code (SVG noise, gradients, clip paths), tinted by brand tokens |
| `theme.js` | its moves (`MD.paper`, `MD.table`, `MD.studio`) and its line entrances (`MD.ENTER.slap`) |
| `THEME.md` | the grammar in numbers, shot recipes, sound, banned |
| `sample.html` | a 5 second sample with `{{PLACEHOLDERS}}` that `theme-board.mjs` fills from the brand |

## The library

Every theme is one film the author approved, kept as a recipe. Each folder
holds `theme.json`, `RECIPE.md` (the film shot by shot: look in numbers, a shot
table with every move, where each material comes from for a new brand, the
essential code, the pitfalls found, the sound) and, on the author's machine,
`preview.jpg` (key frames of the approved film; not shipped). `studio` also
has a `sample.html` that renders live in any brand.

| id | format | in one line |
|---|---|---|
| `glass-folder` | 9:16 | one brand-colour glass folder on a dark lit stage: a glass cursor clicks it, it turns to three-quarter and real cards fan out of it, a live player of the brand's own video in the centre |
| `glass` | 16:9 or 9:16 | the brand's colours as moving silk light under frosted glass panes, one 3D camera per shot, depth of field, the real numbers on glass plates and the real site on a 3D laptop and phone |
| `logo-build` | 9:16 1080x1920, 30fps | one continuous shot: dots whip into the real logo, real pages fly past in 3D, a real query is typed and sent, a 3D carousel of real pages turns, accent strokes resolve back into the logo |
| `monochrome` | 9:16 1080x1920, 30fps | a designer's grey canvas: dot grid, giant soft black asterisks, a cursor dragging dashed selection boxes, and real photographic 3D props as the only colour |
| `product-ui` | 9:16 1080x1920, 30fps | a grey dot-grid canvas with soft black asterisks: the real logo strokes on, a cursor boxes the tagline, the real input bar is typed and pressed, a dark disc wipes to the real product turning in 3D and its video playing |
| `puppet` | 9:16 (1080x1920); 1:1 possible | paper collage on twos: the brand's own faceless character hangs from a drawn hand's marionette strings over a mustard sun and grey scanned rocks, until the founder's real head bursts out and the strings drop |
| `retro-print` | 1:1 (1080x1080); 9:16 with a taller panel | a risograph poster that boils: cream paper, a two-red sunburst turning on twos, thick-outlined props and an old computer with a pixel screen, an extruded title, every edge crawling like ink |
| `safari-collage` | 16:9 (1920x1080) | a maximal torn-paper collage of real CC0 photos: torn strips with white rims, a real 3D boombox printed silver with the brand mark in its deck, a dive into the speaker, a 12-wedge kaleidoscope, a Muybridge eagle flapping, hills panning at four speeds, a title on a torn newspaper peak |
| `studio` | 16:9 (9:16 with the same objects at 60% width) | design-studio motion: one glass hero object on a glowing brand-colour ground, sunburst, blobs, a designer's cursor and selection boxes |

## Building a film in a theme

Read the theme's `RECIPE.md` in full before the beat grid. Keep its pace,
its shot grammar, its materials and its eases; change the content to the
brand: its words, its logo, its real screens and video, its people. Each beat
of the brief becomes one of the recipe's shots (or a new shot built from its
mechanics). Write that mapping into `SPEC.md` as a table (beat, recipe shot,
material, source) and show it with the grid. Then build, and compare the
render side by side with the preview strip before anyone sees it.

## Real material, free, never faked in CSS

Paper and object-story films live on photographic and 3D material. Drawing a
typewriter, a magnifier or a desk in CSS reads as a child's drawing. Get the
real thing, free and with no credit needed (CC0 / public domain only):

    node scripts/find-assets.mjs "typewriter" --out <dir> --cutout   # Wikimedia + Openverse photos, subject lifted
    node scripts/find-assets.mjs --ambientcg paper --out <dir>       # scanned paper, cardboard, fabric
    node scripts/find-assets.mjs --polyhaven texture wood_table_001 --out <dir>
    node scripts/find-assets.mjs --polyhaven model magnifying_glass_01 --out <dir>
    node scripts/prop-render.mjs <model.gltf> prop.png --hdri studio.hdr --rx 0 --rz -40
    node scripts/cutout.mjs <photo> <out.png>                        # lift a person or object

Look at every sheet and pick; Commons' search is loose (add `--title word`).
Poly Haven has ~500 CC0 models (desk props, tools, cameras, clocks, furniture)
and HDRIs; render each at exactly the angle the shot needs. Measure anything
that must line up (a lens centre, a sheet slot) on a gridded preview.

## Rebuild one reference per film (what finally worked)

The films that passed were each a single reference rebuilt shot for shot in the
brand, never a blend. Per film:
1. Strip the reference (frames at 3-4 fps) and pick 4-6 key frames.
2. For every key frame list: the place (ground), each object (real photo, 3D
   model or scan), the type (face, weight, colour, extrusion, size), what moves
   and how (ease, speed, overshoot), the transition out.
3. Source each object for real: the brand's own media first (site video, YouTube
   thumbnails and the founder's clips, product UI captured at device size), then
   CC0 (find-assets.mjs: Wikimedia, ambientCG, Poly Haven models rendered with
   prop-render.mjs, including `--screen` to put a real screenshot on a device).
4. Build it, then compare your frames against the reference's key frames side by
   side and fix every difference before anyone sees it. Run frame-audit.
5. One "hit" sound at most; build the score from the film's own events.

Best sources found in testing: the brand's OWN video often holds its best
characters and props (one brand's explainer had a faceless mannequin that
became the paper film's puppet); download the brand's YouTube hero and contact-
sheet it before searching anywhere else. Museum collections on Commons give
real old drawings and plates (a drawn fist, Muybridge's 1887 eagle sequence,
whose frames make a real flap cycle). Wikimedia rate-limits bursts (429):
find-assets retries with backoff.

Cut-out gotchas: Vision lifts people and objects but not UI; a museum scan on
pure black needs a threshold mask flood-filled from every border pixel; a
cut-out taken from a framed photo keeps a box edge, so take bodies from full
photos. A device's opaque glass hides anything placed behind it: put live media
ABOVE the device image, clipped to the screen.

## Picking one

If the user names a theme, use it. If not, show them the board:

    node scripts/theme-board.mjs --project <dir>

It shows every theme as a strip of its approved film (and renders `studio`
live in THEIR brand), writes `themes/board.png` and `themes/board.md`. Show
the board, say in one line what each is best for, and ask which. Then
`film-init.mjs --project <dir> --theme <id>` and read that theme's RECIPE.md.

## Adding to the library (themes and moves, from references)

The library grows one approved reference at a time:

    node scripts/add-reference.mjs --as theme --id <name> <link|file> [more ...]
    node scripts/add-reference.mjs --as move  --id <name> <link|file> [--fast]

It takes Pinterest pins (the pin's own video, or its image for a still),
anything yt-dlp reads, or local files, and writes an intake folder (under the
motion-director home, never inside the skill) with, per reference:
`ref/` (the measured read: cuts, shot lengths, palette by area, motion
energy, 2 fps sheets) and `strip-*.png` (CONTINUOUS strips, every frame at
4 fps, 8 with `--fast`). An even 15-frame sheet hides how things move.
It also writes `DRAFT.md`, the notes to fill and the build steps.

1. LOOK at every strip and fill DRAFT.md with numbers: the one job, the
   materials and where to get each free, palette roles, type, strokes and
   shadows in px, every motion (path, ease, frames), camera, transitions,
   the moment that lands, what never moves, the banned list.
2. Build with REAL material ("Real material, free, never faked in CSS"
   above). A THEME is proved by rebuilding one reference as one film in a
   real brand ("Rebuild one reference per film"); a MOVE follows
   references/moves.md.
3. Compare the proof with the reference strip at the same moments, side by
   side, and fix every difference you can name.
4. Show the user the proof next to the reference. Nothing enters
   templates/ without a yes. Then write the theme's theme.json + RECIPE.md
   (or the move's folder) and run `node scripts/gallery.mjs` so it shows
   up in the gallery.
5. Copy the grammar, never the content: no downloaded clip, image, logo or
   font from a reference ships in the skill.
