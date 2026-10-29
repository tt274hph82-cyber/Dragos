# Project instructions

## 3D animations: always use this stack
Whenever we create a 3D animation or 3D video in this repo, use exactly this stack:

1. **Three.js** for all 3D: geometry, materials, lights and camera. Write it with React Three Fiber (`@react-three/fiber`) JSX.
2. **@remotion/three** to put the Three.js scene inside Remotion. Use `<ThreeCanvas>`, never a plain R3F `<Canvas>`.
3. **Remotion** for everything else: timing, captions (`@remotion/captions`), audio (`<Audio>`) and rendering to MP4.

Rules:
- **Start from the template.** Copy `videos/3d-template/` to `videos/<new-name>/`, then run `npm install`. Keep its package versions: React 19, three 0.186, @react-three/fiber 9 and Remotion 4.0.539, all pinned together.
- **Animate only from `useCurrentFrame()`**, using `interpolate` and `spring`. Never use R3F's `useFrame`, `THREE.Clock`, `Date.now()` or `Math.random()` without a seed (use Remotion's `random(seed)`). Otherwise frames won't render identically across machines.
- **Move the camera with `useThree()` + `useLayoutEffect`.** See `CameraRig` in `videos/3d-template/src/Scene.tsx`.
- **Captions** go in `public/captions.json` in Remotion's `Caption` format (`text`, `startMs`, `endMs`, `timestampMs`, `confidence`). They're displayed with `createTikTokStyleCaptions`. ElevenLabs "with-timestamps" output can be converted to this format.
- **Audio** (music, narration, sound effects) is set in `src/config.ts` and played with Remotion's `<Audio>`. ElevenLabs is the preferred source for voice, music and sound effects; see `videos/pripyat-atom-city/scripts/elevenlabs_audio.mjs`.
- **Rendering:** `remotion.config.ts` uses the `swangle` WebGL renderer (software), which works in cloud sandboxes and on GitHub Actions. On a machine with a GPU, add `--gl=angle` for speed.
- **Check before rendering the full video.** Render 2–3 stills (`npx remotion still <Comp> out/x.jpg --frame=N`) and look at them first.
- **Render on GitHub** with Actions → **Render 3D video** (`.github/workflows/render-3d.yml`).

## Cartoon explainer style
For the flat cartoon look (bold outlines, round-headed stick-limb characters, one-word captions), copy `videos/cartoon-doctor/`. It is the same stack, with a reusable style kit (`src/toon.tsx`) and character (`src/Character.tsx`).

## Other notes
- Never commit API keys. ElevenLabs uses the env var / GitHub secret `ELEVENLABS_API_KEY`.
