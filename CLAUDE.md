# Project instructions

## Token guard
- Be concise: short answers, no recaps of what was already said, no restating file contents.
- Route mechanical work (rename, format, summarize, scrape, bulk find-and-replace) to a sub-agent on Haiku: `Agent` with `model: "haiku"`.
- Never suggest `/compact` as a cost-saving measure. To save tokens, start a fresh session (`/clear`) between unrelated jobs.

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

## "What If" episodes (2D stick-figure style)
For "What If" episodes, use the **what-if-animation** skill in `.claude/skills/what-if-animation/` (follow its `SKILL.md`). This style is 2D SVG drawn in Remotion, not Three.js, so the 3D rule above doesn't apply.
- The studio is already set up at `videos/what-if-studio/`, so run the skill's steps there. `<skill>` = `/home/user/Dragos/.claude/skills/what-if-animation`.
- Fonts load from `public/fonts` (patched from Google Fonts), so rendering works offline and in the sandbox.
- **The hero is Juno** (top bun + star clip, lilac hoodie), not the skill's Pip. Use `<Hero look={HERO} />`, where `HERO` = `LOOKS.juno`. In scripts, "you" = Juno. Her design rules are in `videos/what-if-studio/CHARACTER.md`; never redesign her.
- Its credit reports need an ElevenLabs key with the "User read" and "History read" permissions.

## Shorts / Reels: 9:16 only
- Shorts are delivered **only in 9:16** (1080x1920). Don't render 16:9 versions of Shorts. In the studio, run `bash videos/what-if-studio/shorts.sh <slug>`. It calls `master.py <slug> --vertical` and writes `youtube/<slug>-9x16.mp4`.
- **Keep everything inside the Reels/Shorts safe zone.** Facebook Reels and YouTube Shorts cover about the top 14% and the bottom 35% of the frame, and the Facebook feed can crop the video to 4:5.
  - Put captions and key content between roughly 280 and 1250 px of the 1920 px height.
  - Keep a margin of at least 6% on each side.
- **Gentle zooms only.** The 9:16 crop is 607 px of the 1920 px source frame.
  - Close-ups use `vertSc`/`vertY` (see `closeUp` in `pause-full/parts.tsx`).
  - Shot zooms go through `camV` in `fountain-pen/shots.tsx`.
  - Check stills of every shot at its most zoomed frame before rendering.

## Other notes
- **ElevenLabs models:**
  - Voice: `eleven_v4`, with `output_format=mp3_44100_128` (128 kbps).
  - Sound effects: SFX v3 (`model_id: eleven_text_to_sound_v3`). The skill's `sfx.py` keys its clip cache by model, so older clips aren't reused.
  - Music: `music_v1`.
- Never commit API keys. ElevenLabs uses the env var / GitHub secret `ELEVENLABS_API_KEY`.
