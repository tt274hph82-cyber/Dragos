# Remotion fallback

HyperFrames is the default and needs nothing installed beyond Node and FFmpeg.
Use Remotion ONLY when the user already has a working Remotion project and
wants the film in it. Never install Remotion for them.

## Detect

- `new-project.mjs ... --remotion <path>` refuses unless `<path>/package.json`
  has a `remotion` dependency.
- Everything up to the beat grid is identical: interview, brand intake,
  reference style, beat grid, approval, synth. Only the build and the render
  change.

## Build

1. Copy `templates/remotion/src/md.tsx` into their `src/`, and the project's
   `sound/beats.json` beside it as `beats.json`. Copy `brand/shots`,
   `brand/logo.*` and `sound/score.wav` into their `public/`.
2. One composition, `durationInFrames = Math.ceil(length * fps) + 3` (int()
   truncation is a black last frame; the margin is free). Composition ids may
   not contain underscores.
3. Each shot is a `<Sequence from={round(a*fps)} durationInFrames=...>`;
   every text line is a `<Line enter="words@B4" exit="blur@B12">`. Add
   `<Audio src={staticFile("score.wav")} />` at the root.
4. Beats are read defensively: `t("B12")`, never `beats[3]` straight into
   `interpolate` (an undefined there kills the whole render with "inputRange
   must contain only finite numbers").

## Render

```sh
npx remotion bundle src/index.ts --out-dir=build          # once
npx remotion render build <id> critique/round-1/film.mp4 \
  --codec=h264 --crf=16 --concurrency=4
```

Then the same `critique.mjs` and `deliver.mjs` (they read the mp4, not the
source). Log the render: `node -e` is fine, or time it and add a `render`
event to `log.json`.

## Lessons from long Remotion use

- **Pin TypeScript 5.x** if you touch their toolchain: TS 7 dropped `ts.sys`
  and breaks the bundler. And a clean `tsc --noEmit` is not proof: delete
  `tsconfig.tsbuildinfo` before believing a green.
- **Bundle once, render many.** `remotion render src/index.ts` re-webpacks the
  whole project per composition (1-2 minutes each).
- **Tune concurrency against memory, not cores.** On a 12-core laptop with
  4K frames, concurrency 10 swapped and was slower than 5-6.
- **Alpha overlays: qtrle, not ProRes 4444.** Bit-identical, ~60x faster on a
  mostly transparent frame.
- **No `backdrop-filter` at 4K** (20x slower), no `filter: drop-shadow` on a
  full-frame SVG (draw the glow as a wider, fainter stroke).
- **defaultProps are unchecked:** a wrong prop name silently uses the
  component's defaults. When a composition ignores its beats, check the prop
  name first.
- **Delete the output before re-rendering** and wait on the render process
  exiting, never on a file reaching a frame count the old file already has.
