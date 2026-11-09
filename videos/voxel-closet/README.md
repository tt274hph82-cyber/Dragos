# 3D animation template: Three.js + Remotion

- **Three.js** (through React Three Fiber) draws the 3D scene: `src/Scene.tsx`
- **@remotion/three** puts that scene inside a Remotion video: `<ThreeCanvas>`
- **Remotion** adds captions (`src/Captions.tsx`, `public/captions.json`) and audio (`src/config.ts`), and renders the MP4.

```bash
npm install
npm run studio      # live preview with a timeline scrubber
npm run still       # one frame → out/still.png
npm run render      # full video → out/scene3d.mp4
```

## Make a new 3D video
1. Copy this folder to `videos/<name>/`, then run `npm install`.
2. Build the scene in `src/Scene.tsx`. Drive every motion from `useCurrentFrame()`, never `useFrame()` or clocks.
3. Put music or narration in `public/audio/` and set the paths in `src/config.ts`.
4. Replace `public/captions.json` with your words and timings.
5. Render locally, or on GitHub with Actions → **Render 3D video** (set `project` to your folder).

The default renderer is `swangle` (software WebGL), which works without a GPU. On a Mac or PC with a GPU, render with `npx remotion render Scene3D out/x.mp4 --gl=angle` for speed.
