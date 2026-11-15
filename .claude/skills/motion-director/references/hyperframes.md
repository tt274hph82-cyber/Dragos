# HyperFrames, the way this skill uses it

HyperFrames (Apache 2.0, by HeyGen) renders an HTML page to MP4 by seeking a
paused GSAP timeline frame by frame in headless Chrome and encoding with
FFmpeg. Always call it through `scripts/lib.mjs` (`hf(...)`) or with the same
environment, never bare:

    HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_SKIP_SKILLS=1 \
      npx -y hyperframes@0.8.188 <command>

and with `GEMINI_API_KEY` / `HEYGEN_API_KEY` removed from the environment.
Why each one:

- **pinned version**: a film re-renders identically next month
- **telemetry off**: the user's renders are not reported anywhere
- **SKIP_SKILLS**: `init` otherwise installs HyperFrames' own agent skills into
  the user's agent config, which they did not ask for
- **no cloud keys**: `snapshot` runs Gemini vision on your frames by default
  whenever `GEMINI_API_KEY` is set, and `capture` does the same for images;
  `audio --quality best` uploads to HeyGen and may bill. Opt in with
  `MD_ALLOW_CLOUD=1` only when the user asks.

## The contract (what `check` enforces)

- Root: `<div id="root" data-composition-id="main" data-start="0"
  data-duration="N" data-width data-height data-fps="30">`.
- The registration must be LITERAL in the page, after every tween:
  `window.__timelines["main"] = tl;` (lint reads the source; hiding it in a
  helper fails `missing_timeline_registry`).
- Timed elements: `class="clip"`, `data-start`, `data-duration`. A clip shows
  over `[start, start + duration)`; an end state landing exactly on its end is
  never rendered.
- Never tween `display`/`visibility` on a `.clip`; animate a child. No CSS
  `transform` on an element GSAP transforms.
- Deterministic only: no `Date.now()`, `Math.random()`, timers, fetches or
  `repeat: -1`. `tl.call()` works but disables HyperFrames' static-frame
  dedup ("not seek-safe"): toggle visibility with `tl.set()` instead, as
  md.js does.
- `<audio>` needs an `id`. Asset paths are relative (`assets/...`).
- Fonts: bundled faces resolve by name (Inter, Montserrat, Outfit, Nunito,
  Oswald, League Gothic, Archivo Black, Space Mono, IBM Plex Mono, JetBrains
  Mono, EB Garamond, Playfair Display, Source Code Pro, Roboto, Open Sans,
  Lato, Poppins). Anything else needs `@font-face` to a file in `assets/`.
  film-init writes these from the captured brand fonts.

## Known warning, kept on purpose

`nested_structure_needs_subcomposition` warns that a `<section>` scene holds
children. HyperFrames prefers one sub-composition file per scene for its
Studio's timeline view. This skill keeps the film in one `index.html`, one
timeline and one clock, because the beat grid is global and a sub-composition
restarts the clock at its host's start (and a host id that differs from its
scene id makes every render wait 45s per scene). The warning is cosmetic.

## Commands this skill uses

| job | command |
|---|---|
| brand capture | `capture <url> -o <dir> --skip-vision --max-screenshots 12 --json` |
| contract + layout + craft | `check --json --at-transitions --frame-check ... [--caption-zone ...]` |
| frames to look at | `snapshot --at 1,3.5 --no-end --describe false -o <dir>` |
| render | `render -o <file> --quality delivery --video-frame-format png --workers 4` |
| where sounds land | `audio <file> --json` (local quality only) |
| Chrome path | `browser path` / `browser ensure` |

`check`'s craft findings are worth reading every round: `line_unread` (held
too briefly), `dead_stretch` (3s+ with nothing changing), `text_below_floor`,
`first_frame_empty`, `film_silent`.

## Render cost

A 1080p film renders at roughly 3-4x real time on a laptop with 4 workers.
Each worker is a Chrome (~256 MB). Expensive in a frame: `backdrop-filter`
(fine at 1080p: the glass test films rendered 20s of film in ~21s; avoid at
4K, where it costs ~20x), `filter: drop-shadow` on large SVGs, many
simultaneous blurs. If a render is slow, delete one property at a time and measure; "4K is
just slow" is not a diagnosis. Deliver at 1080p; offer `--resolution
landscape-4k` (or `portrait-4k`, `square-4k`) as a re-render once approved.

## The registry

About 450 blocks install as editable source with `hyperframes add <name>`.
The tested shortlist and render costs are in `direction.md` §5. Treat a block
as raw material: rewrite its colours, copy and screen content to the brand,
never ship its demo content.
