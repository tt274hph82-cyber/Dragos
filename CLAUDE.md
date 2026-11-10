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

## 3D voxel night-story Shorts (style of the user's "house was robbed" reference)
- Model: `videos/voxel-wall/` (copied from `3d-template`, 1080x1920, 23 s, composition `VoxelWall`). First-person "true scary story" told by Austin, about 60 words, no captions, a twist in bright morning light.
- `src/Scene.tsx`: everything is boxes with small seeded pixel textures (`pixelTex`, nearest filter); `Head` (face from flat boxes: neutral, scared, asleep, happy), `Person`, `Cat`; a `SHOTS` table (start second, camera from/to, look-at, fov) with slow pushes and a shake on impacts; night = blue hemisphere light + a moon spotlight with shadows through a real window hole + a red clock glow + fog; day = warm sun; an additive light shaft and dust motes; a vignette in `Video.tsx`.
- `scripts/audio.py` makes the effects and music (dark drone that turns warm) and mixes `public/audio/mix.mp3`; the final encode normalizes to -14 LUFS into `youtube/<slug>-9x16.mp4`.
- Second episode: `videos/voxel-closet/` (closet door that opens by itself, glowing eyes, the dog Pepper asleep on socks; door hinged on the far side so the gap faces the bed; dark-coloured dog at night so only the eyes show). New stories can share packages with `ln -s ../voxel-wall/node_modules node_modules` (git ignores the link) to save disk.
- **3D voxel + Blocky What If format** (the user asked to combine them): model `videos/voxel-family/` ("What if your whole FAMILY joined your game?", 40 s). `src/story.ts` is the shot table (cut times on the word times, camera from/to, per-shot `talk`, `faces`, `arms`, `ry`), with a snap-zoom FOV punch on every cut; `src/Scene.tsx` has an outdoor voxel meadow, `House` built block by block, `Person` with hair styles (kid cap, mom bun, dad beard, sister pigtails), `Chicken`, glowing-eyed monsters, day/night/dawn lighting; `src/Overlay.tsx` is the game layer (Montserrat pop captions with keyword colours and speaker tags, PARTY HUD, PLAYER JOINED cards, impact words). `scripts/voice.py` makes the cast (narrator Austin, kid Josh, mom Rachel, dad Adam, sister Elli) and re-times words; `scripts/audio.py` adds a swish on every cut (`public/cuts.json`), game effects and day/night/win chiptune.
- Frame each shot with stills first (9:16 is narrow: keep the camera back, and outside the room for wide shots). The full render takes about 10-15 minutes in the sandbox.

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
For story Reels (strange-history storytime, 2-3 min), use the engine's story mode (`defineStory` in `videos/what-if-studio/src/engine/episode.tsx`) and the scene kit in `src/episodes/molasses/kit.tsx`. The current model episode is `dancing-plague` (rebuilt from the user's reference Reel); `molasses` was the first. The reference channel's analysis is in `videos/what-if-studio/STORY-STYLE.md`.

- **No mascot/host in story Reels** (the user removed him). The narrator carries the personality instead.
- **Captions are back on** (the user asked): karaoke, 2-3 words, uppercase, the spoken word in yellow and a touch bigger, over a dark band at the bottom, at y = 1200. `defineStory` has `captions: true` by default.
- **Script in the reference's voice (his signature style):** a blunt, folksy storyteller, recast for Austin as a Southern yarn-spinner with homespun sayings ("plumb lost their marbles", "like she sat on a hornet's nest", "why in tarnation"), the double-check repeat "You get it, buddy? I said, you get it?", and the sign-off "That's about it, folks. Follow for more strange history. See ya!". Also: talking straight to the viewer ("buddy"), a shock hook first ("Four hundred people danced until the blood ran out of their shoes"), "this ain't some bedtime story", rhetorical questions ("And you know what the doctors did?"), one mocking comparison ("like throwing wood on a burning barn"), a recap of the causes, a relatable callback at the end ("next time your feet hurt after a wedding"), then "That's real." and the call to follow. Keep the facts right: hedge disputed numbers.
- **Draw natively in 1080x1920.** Don't crop a 16:9 frame.
- **Pace:** about 28-32 cuts a minute, no shot over 4 s. Split long lines with `close()` variants.
- **Camera (engine, automatic):** every segment moves: `push`, `dive` (accelerating push), `pull`, `panL`/`panR`, `rise`, `static`. Set one per cut with `"cam"` in an `edit` entry; otherwise they rotate.
- **Transitions (engine):** `"tr"` per edit entry: `ghost` (dissolve with a forward push and blur), `zoom` (zoom-through with motion blur), `flash` (white flash, used at each new part of the story), `whip` (sideways blur), `dissolve`, `cut`. Otherwise they rotate.
- **Sound on every move (like the reference):** after each edit change run `python <skill>/scripts/story_sfx.py <slug> --thunder`, then `sfx.py`. It adds a whoosh, zoom, flash-pop or whip on every transition, a riser on every dive, a boom on every punch and bloom, ticks on rewinds, and a thunder crack (with lightning flashes in `fx`) on the cold open.
- **Music in theme with the story:** write the score prompt for the story's world and mood (Dancing Plague: a frantic medieval tarantella, hurdy-gurdy, fiddle, frame drum, dark drone); story Reels sit the music at `music_lu: -15`.
- **Hits (`fx`):** `punch` (zoom bump on a key word or number), `bloom` (glow burst and ring on impacts), `shake`, `flash`, `rewind` (VHS ◀◀ REWIND when the story jumps back), `iris` (spotlight ring on the key thing, `x`, `y`, `r`).
- **Kit:** `Punch` with an optional boxed `kicker` above the slanted title; `Burst` (comic starburst word); `Counter` (number ticking up, punch on landing); `BigNumber`, `Calendar`, `Sfx`.
- **Detail in every scene:** lit windows, chimney smoke, torches, bunting, cobbles, crowds, a blurred foreground.
- **Ink-on-paper variant** (the user asked for an "extremely creative" all-code film): model `src/episodes/cigarette/` ("Who invented the cigarette?", 78 s, 42 shots). Its `shots.tsx` kit: `Sheet` (cream cigarette paper or its dark side, fibres, vignette, and a turbulence "boil" filter that redraws the line every 4 frames), `Smoke` ribbons, a `smk` filter that turns any shape into drifting smoke (god, devil, ghosts, words), `Fig` ink silhouettes with poses and hats (feather, sailor, brim, hood, kepi, bowler), `Cig` (cigarette, cigar, leaf roll, butt, hand-rolled), `Ember`, and `BurnBar`: a cigarette that burns down along the top as the progress bar (passed as `overlay`). Ember orange is the only colour. Keep top labels at y >= 540 so camera moves don't push them into the bar. Tobacco stories end on the health fact and never glamorise smoking.
- **Pencil-sketch variant** (same all-code series, one material per story): model `src/episodes/pencil/` ("Who invented the pencil?", 80 s, 43 shots). Kit in its `shots.tsx`: `Sheet` (lined notebook page with a red margin, or a graphite-rubbed dark page; `hat`/`hat2` diagonal hatch patterns; the boil filter), `Fig` shaded with hatching (hats: brim, hood, tricorn, bicorne, top, cap; crook, gun, eyepatch), `Pencil` (modern, bare wood, raw stick), `Rock`, `Sheep`, `Tree`, `Cloud`, `Rain`, `Bolt`, `Eraser` + `Crumbs` (words rubbed out on screen with a clip path), `Sparkle`, and `PencilBar`: a pencil sharpened shorter as the progress bar. Only two colours: pencil yellow and eraser pink. Keep labels between y 540 and 1130 (the bar above, captions below). For the next story pick a new material that fits the invention.
- **Look:** one colour mood per scene; layered flat silhouettes; figures as dark silhouettes with a glowing outline in the scene's light colour; colour only on the key object.

## Blocky-game "What If" Shorts (style of the user's "10 Seconds of Roblox" reference)
- **This 2D style is the default for new What If Shorts** (the user asked to go back to it after the pixel-block and 3D voxel tests); use the other looks only when asked.
- Model episode: `videos/what-if-studio/src/episodes/ten-seconds/`. Story engine with `capStyle: 'pop'` (one word at a time, keywords coloured via `capColors`), a countdown `Timer` HUD on every shot, `SECOND N` badges on a green burst, about 57-72 cuts a minute (mostly hard cuts, punch zooms), a loop ending (comment "LOOP", rewind to the first shot).
- Characters: `Blocky` / `CubeHead` in its `shots.tsx` (cube heads with a shaded side, thick outlines, expressive faces). Original characters and an invented game only: never a real game's name, logo, currency or avatars.
- **Energy like the reference (measured):** pass `snappy: true` to `defineStory` (a snap-zoom on every cut, slight alternating tilts, bigger moves, `tiltDown`/`zoomOut`/`drift` cams, a punch zoom on every coloured caption word); characters stay steady: **no idle wobble** (no bounce, squash, sway or arm swing; the user asked), only a slight breathe and the action poses (`Blocky` `energy` > 1 brings idle motion back only if asked); badges slam in and fly off; speed lines and raining gems/coins on action shots; put the caption colours in episode.json `captions.colors` so `story_sfx.py` adds a hit on every keyword and a swish on every hard cut. Check with `npx hyperframes measure energy <reference> <ours>`: aim for `mean_ratio` 0.9-1.2 (v1 was 0.72, v2 1.0).
- **Pace and font like the reference:** narration at about 2.6 words a second (episode.json `"tempo": 1.15`, `"gap": 0.02` speeds Austin up with pitch kept); captions and game UI in **Montserrat Black** (`FONT.game`, `capFont: 'Montserrat'`, from `public/fonts`).
- **Variations** (Skylox Story's titles: "What If [MOM/DAD/BEST FRIEND/PET/YOU] + one twist?"; family and friend twists do best). Rule-based variation model: `src/episodes/blink-gems/` (one rule escalated until it breaks the game: a gem-counter pill that counts the spoken words, glitches, then hits ∞; narrator, kid and an admin voice). Role-swap variation model: `src/episodes/mom-plays/` (`LEVEL N` badges, a `MOM · LVL N` pill, three voices: narrator, mom, kid). Emotional variation model: `src/episodes/best-friend/` (`DAY N` badges, colour drained with `Gloom` on the sad days, rain, sad piano that turns into game music at the reunion). Boss-fight variation model: `src/episodes/dad-boss/` (`PHASE N` badges, a fixed boss health bar `DadBar` that stays full until the punchline drains it, three voices: narrator, dad (Adam), kid). Backfire variation model: `src/episodes/hacked/` (`HACK N` terminal badges, a `HackBar` HUD that turns from green to red to glitching, `Glitch` slice tears, the game hacks you back into a `Chicken`; three voices: narrator, kid, a robotic system voice (Arnold)). Time-skip variation model: `src/episodes/never-stop/` (`HOUR/DAY/MONTH/YEAR N` badges, a `PlayClock` playtime HUD racing up at each jump, the `Gamer` den set, `Old` (grey hair, glasses, growing beard) drawn through `Blocky`'s `extra`; voices: narrator, kid, mom, old you (Sam)). Sibling variation model: `src/episodes/sister-admin/` (`COMMAND N` badges, an `AdminBar` console HUD that types each command, `Sis` = Mom's outfit smaller with pigtails and a crown, Mom as the owner twist; voices: narrator, kid, mom, sister (Elli)). Grandparent variation model: `src/episodes/grandma-pro/` (`ROUND N` badges, a `Score` HUD counting her wins that turns into her 1982 title, `Gran` = Mom's outfit with grey hair, bun, glasses and a pink shawl, `Pro` rival with headset; voices: narrator, kid, grandma (library voice "Carol", `5u41aNhyCU6hXOcjPPv0`)). School variation model: `src/episodes/teacher-joins/` (`PERIOD N` chalkboard badges, a `GradeBar` report-card HUD going from – to F to A+, `Teacher` = Dad's build with glasses and a red tie, `Board`, `Paper`, `Stamp`; voices: narrator, kid, teacher (Bill)). Baby variation model: `src/episodes/baby-controller/` (`MINUTE N` badges, a `BabyBar` score HUD that jumps at each accident then reads OFFLINE, `Baby` = bald `CubeHead` with a curl, yellow onesie, diaper and optional pacifier; voices: narrator, kid, mom; baby sounds are effects). The blocky kit is exported from `ten-seconds/shots.tsx` (`Blocky` kinds `kid`, `friend`, `mom`, `boss`). Fixed HUDs (timers, status pills) go in `defineStory`'s `overlay`, so the camera never crops them.
- **Pixel-block (voxel) look** (the user asked for a design "more like Minecraft"): model `src/episodes/dig-down/`. Its `shots.tsx` holds the kit: `Tex` (8x8-pixel block textures as SVG patterns: dirt, grass, stone, ore, lava, bedrock, wood, leaf, plank; put one in every shot), `Wall`, `Shaft`, `Pix` (pixel art from character maps: pickaxe, spoon, gem, heart), `Vox` (square-pixel character with an 8x8 face; kinds `kid`, `mom`), square-sun `Sky`, bevelled grey `Sign` panels, `Chips`, `Streaks`, and a `DepthBar` HUD with hearts. Captions stay Montserrat pop. Keep it original: the voxel genre look only, never the real game's characters, mobs, logo, textures or names.
- **Long-form 16:9 (about 6 min):** model `src/episodes/pet-swallowed/` ("What if your PET swallowed your MOM?"). Pass `landscape: true` to `defineStory` (1920x1080, no Vertical). Chapter cards (`C1`-`C5`) with `"pause": 1.0` on the chapter lines; a fixed `Hud` overlay (chapter chip, progress bar, countdown). To keep about 36 cuts a minute, long beats are auto-split into `<id>z` close variants, with `from` offsets so the animation doesn't restart. Render with `master.py <slug>` (no `--vertical`) and copy to `youtube/<slug>-16x9.mp4`.
- Two voices: `python <skill>/scripts/cast_voice.py <slug>` (script lines with `"who": "mom"`, voices in `"cast"`); narrator Austin by default. Keep close-up faces above y = 1100 so the captions (y = 1230) sit on the chest.

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
  - **Default narrator voice for all projects: "Austin – Deep, Raspy and Authentic"** (`Bj9UqZbhQsanLzgalpEG`), from the ElevenLabs voice library (US Southern, gravelly).
    - In an episode's `voice` block: `{"id": "Bj9UqZbhQsanLzgalpEG", "model": "eleven_v4", "language": "en"}`.
    - Use another voice only when the user asks (for example, a Romanian episode).
  - Sound effects: SFX v3 (`model_id: eleven_text_to_sound_v3`). The skill's `sfx.py` keys its clip cache by model, so clips made with an older model aren't reused.
  - Music: Music v2.5 (`model_id: music_v2_5`). The clip cache is keyed by model here too.
- **Word timing comes from the audio, not from TTS timestamps.** eleven_v4's timestamps drift (up to about 1 s), so `voice.py` re-times every word with ElevenLabs speech-to-text (`align.py`, `scribe_v1`). Never skip it; cuts and sound hits are cued on those times.
- **Mix: the narrator always stays clearly on top.**
  - Effects sit about 14 LU under the voice and music about 17 LU under it. These are the skill's defaults: `sfx_lu: -14` and `music_lu: -17`.
  - Sound hits land just after the word they illustrate, never on it.
- Never commit API keys. ElevenLabs uses the env var / GitHub secret `ELEVENLABS_API_KEY`.

## HyperFrames (HTML-to-video)
- Projects: `videos/every-second-motion/`. Pinned to **hyperframes@0.9.20** in `package.json` (`npm run check`, `npm run render`).
- Skills (0.9 layout): `hyperframes` (read first), `hyperframes-cli`, `hyperframes-registry`, `media-use`, `remotion-to-hyperframes`. They install to `~/.claude/skills`, which a new cloud container doesn't keep, so a SessionStart hook in `.claude/settings.json` runs `npx --yes hyperframes@0.9.20 skills update` at the start of every session. Run it by hand too at the start of any HyperFrames job if the skills are missing.
- To upgrade later: bump the pin in each project's `package.json`, re-copy `CLAUDE.md`/`AGENTS.md` from a fresh `hyperframes init`, then `check` and a test `render`.

## GSAP skills
- The official GreenSock skills (github.com/greensock/gsap-skills, MIT, commit aed9cfd) are in `.claude/skills/gsap-*`: `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-utils`, `gsap-performance`, `gsap-react`, `gsap-frameworks`.
- Use them for any GSAP animation, including HyperFrames compositions (GSAP is HyperFrames' default animation engine); HyperFrames' own rules (seekable timelines, `window.__timelines`) still come first.
- To update: re-clone the repo and copy `skills/gsap-*` over these folders.

## motionmaxxing (motion-graphics direction skill)
- `.claude/skills/motionmaxxing/` (github.com/Tejashmakwana/motionmaxxing @ 8c8ec0f, Apache-2.0; the repo's 20 MB `docs/` demo media left out). Use it to plan, build or critique launch films, promos, brand stings and kinetic type, in HyperFrames or plain HTML; it reviews renders with its own scripts (`look.py`, `lint.mjs`).
- In this sandbox, set `CHROME_PATH=/opt/pw-browsers/chromium` before its scripts (`providers.sh` then reports ready). For voice and music, export `ELEVENLABS_API_KEY` from `videos/what-if-studio/.env` (never commit it), and keep our voice rules (Austin, eleven_v4, 128 kbps).
- Its `imagegen.py` needs the Codex CLI, which isn't installed here; generated images are skipped.

## GSAP library and Chrome DevTools MCP
- **GSAP 3.15.1** (all plugins, free) is vendored in `vendor/gsap/3.15.1/*.min.js` for HTML compositions; see `vendor/gsap/README.md`. Bundled projects use `npm i gsap@3.15.1`.
- **Chrome DevTools MCP** (`chrome-devtools-mcp@1.12.0`) is set up in `.mcp.json` through `.claude/mcp/chrome-devtools.sh` (isolated profile, no usage statistics; headless with `/opt/pw-browsers/chromium` in the cloud sandbox). It gives 32 browser tools: navigate, click, type, screenshots, console and network logs, performance traces, Lighthouse, screencasts. Use it to check HTML players, HyperFrames previews and artifacts in a real browser. A new session asks once to enable the project MCP server.

## Shadow Puppet Theatre explainers
- Built from `videos/shadow-puppet-emu/` (emu war) and `videos/shadow-puppet-pig/` (pig war): one canvas file per story, `score.js`, `vo.py` (Austin narration, always included), `render.js` for the MP4. 9:16, at least 30 s.
- **Native 1080p:** start new stories from `videos/shadow-puppet-pig/` (its `pig.js` theatre code draws at any size: scenes use a 720x1280 logical stage, scaled by `K`). The player canvas and `render.js` draw at 1080x1920 directly, with no upscaling. Storyboards can stay at 720.
- **Storyboard approval is standing:** the user approves every storyboard. Still publish the storyboard artifact, then go straight on to the full animation, narration and MP4 without waiting.
