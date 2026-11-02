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

## Main character (host) for Reels and Shorts
- **The host is the user's own character** from his model sheet (`videos/what-if-studio/public/host/sheet.png`). Use **his actual drawing, never a redraw.** He replaced Nea Costel for all new Reels and Shorts.
- **Poses are transparent cut-outs** in `public/host/*.png`:
  - full body: `stand`, `side`, `laugh_point`, `arms_crossed`, `sitting`, `rock`, `walk`;
  - head and bust: `bust`, `yell`, `smug`, `confused`, `angry`.
  - The cutting script is the flood-fill and largest-component cut used in this session. Re-cut at 2× if a new sheet arrives.
- **Place him like the reference Reels:** use `HostCut` in `src/episodes/molasses/kit.tsx`.
  - He stands inside the story scenes: pointing, sitting on a crate, arms crossed.
  - Cut to his head expressions for reactions.
  - He rises in over 7 frames, then breathes and sways a little.
  - Pick the pose that matches the line.
  - Keep his face inside the safe band.
- `LOOKS.afro` (an SVG approximation of him) exists in the rig but is not used in films.

## "Who invented…?" Reels (formerly hosted by Nea Costel)
- Nea Costel (`LOOKS.costel`) hosted the first three. Their reusable pieces live in `videos/what-if-studio/src/episodes/fountain-pen/shots.tsx` (`Bold`, `Sky`, `Roofs`, `camV`, …).
- **Open with a hook, as in the What If formula (cold open).** The first ~10 s are a flash-forward into the story's most dramatic moment, told in 3 or 4 quick beats, before the title question.
  - Example: "London, 1770. A riot. One man gets locked up. All he has is a bone from his dinner. And what he makes with it is in your bathroom right now."
  - Only after that comes Nea Costel with "Who invented…?".
  - End with one real fact with a number and "That's real.", then his punchline.
- **Never reuse the same intro.** Each episode's host scene opens in a different place that ties to its topic, never his study corner.
  - Examples: on a hilltop or an airfield for the parachute; a street, a kitchen, a rooftop, a field, a garden or a classroom for other topics.
  - Use the library's sets (`Outdoor`, `Rooftop`, `Kitchen`, `Classroom`, `Bedroom`, `Stairwell`), or build a new set for the topic.
  - Vary his entrance too: he walks in, pops up into frame, gets caught mid-action, or turns to camera.
- The study corner can still appear mid-episode, but not as the opening shot. Keep a list of the intros already used so none repeats.
  - Used so far: fountain pen = study corner; parachute = study corner; toothbrush = kitchen, caught brushing his teeth.

## Story Reels (native 9:16, the reference style)
For story Reels (strange-history storytime, ~2 min), use the engine's story mode (`defineStory` in `videos/what-if-studio/src/engine/episode.tsx`) and the scene kit in `src/episodes/molasses/kit.tsx`. The first one is `molasses`.

These rules come from measuring three reference Reels:
- **Draw natively in 1080x1920.** Don't crop a 16:9 frame.
- **Pace:** fast, a new picture about every 2 s (about 30 cuts a minute).
  - Split long lines into "wide, then close" pairs with `close()` in `molasses/shots.tsx`. Close variants hide titles via `CloseCtx`.
  - Cut in host reactions (`react()`).
- **Detail in every scene:** lit windows, chimney smoke, ships and masts, gulls, dust motes, gas lamps, cobbles, hats on the crowd, bubbles and debris, a shaded tank with a ladder and pipes, and a blurred foreground (`Fore`).
- **Camera:** a slow, steady push-in of about 3% a second on every shot. Change shots with 4-frame dissolves. No whip-pans or shake, except a shake on impacts.
- **Karaoke captions** on every word, 3 at a time, with the spoken word in yellow, always at y ≈ 1170. They're timed from the aligned `words.json`.
- **Slanted punch titles** at the top for key facts and numbers.
- **Look:** one colour mood per scene; depth from layered flat silhouettes; figures as dark silhouettes with a glowing outline in the scene's light colour; colour only on the key object.
- **The host (`LOOKS.afro`) stands inside the scenes,** full body or in close-up. End on a call to action.

## Shorts / Reels: 9:16 only
- Shorts are delivered **only in 9:16** (1080x1920). Don't render 16:9 versions of Shorts. In the studio, run `bash videos/what-if-studio/shorts.sh <slug>`. It calls `master.py <slug> --vertical` and writes `youtube/<slug>-9x16.mp4`.
- **Keep everything inside the Reels/Shorts safe zone.** Facebook Reels and YouTube Shorts cover about the top 14% and the bottom 35% of the frame, and the Facebook feed can crop the video to 4:5.
  - Put captions and key content between roughly 280 and 1250 px of the 1920 px height.
  - Keep a margin of at least 6% on each side.
- **Captions stay modest.** In 9:16, captions are 70% of their 16:9 size (`TXT` in `fountain-pen/shots.tsx`); don't make them bigger.
- **Gentle zooms only.** The 9:16 crop is 607 px of the 1920 px source frame.
  - Close-ups use `vertSc`/`vertY` (see `closeUp` in `pause-full/parts.tsx`).
  - Shot zooms go through `camV` in `fountain-pen/shots.tsx`.
  - Check stills of every shot at its most zoomed frame before rendering.

## Other notes
- **ElevenLabs models, for every project (new and old, any style):**
  - Voice: `eleven_v4`, with `output_format=mp3_44100_128` (128 kbps).
  - Sound effects: SFX v3 (`model_id: eleven_text_to_sound_v3`). The skill's `sfx.py` keys its clip cache by model, so clips made with an older model aren't reused.
  - Music: Music v2.5 (`model_id: music_v2_5`). The clip cache is keyed by model here too.
- **Word timing comes from the audio, not from TTS timestamps.** eleven_v4's timestamps drift (up to about 1 s), so `voice.py` re-times every word with ElevenLabs speech-to-text (`align.py`, `scribe_v1`). Never skip it; cuts and sound hits are cued on those times.
- **Mix: the narrator always stays clearly on top.**
  - Effects sit about 14 LU under the voice and music about 17 LU under it. These are the skill's defaults: `sfx_lu: -14` and `music_lu: -17`.
  - Sound hits land just after the word they illustrate, never on it.
- Never commit API keys. ElevenLabs uses the env var / GitHub secret `ELEVENLABS_API_KEY`.
