# Pripyat: The Soviet Atom-City (Remotion)

Episode 6 of the *Company Town* documentary series. It runs about 10 minutes at 1920×1080 and 30 fps.

## How it's built
- `src/segments.json` holds the script. Each segment has its narration text, an optional `say` field with a phonetic version for the voice, and a `v` field for its visual.
- `scripts/make_narration.py` generates one narration WAV per segment with Piper TTS. It also writes their lengths to `src/narration.json`, which sets the whole edit's timing.
- `src/scenes/` contains the visuals: photos with slow pan and zoom, animated maps (real country borders from Natural Earth via `world-atlas`) and typographic or diagram scenes.
- `src/overlays/` contains the film grain, vignette, letterbox bars, subtitles, location captions and photo credits.
- `public/photos/` holds the photos from Wikimedia Commons. Licences and authors are in `src/credits.json`, and the credits roll at the end of the video.
- `public/audio/drone.mp3` is an ambient music bed generated with ffmpeg.

## Commands
```bash
npm install
npm run studio          # preview and edit in Remotion Studio
npm run render          # renders out/pripyat-atom-city.mp4
```
Render without subtitles: `npx remotion render Documentary out/nosubs.mp4 --props='{"subtitles":false}'`

## Swap in your own voiceover
To use your own voice instead of the synthetic one, record one file per segment id (s01.wav, s02.wav, …) into `public/narration/`. Then update the durations in `src/narration.json`. Every scene re-times automatically.

## Render on GitHub
The workflow `.github/workflows/render-pripyat.yml` renders the video on GitHub Actions. It runs on every push that changes this folder. You can also start it by hand from the **Actions** tab: open **Render Pripyat documentary**, then **Run workflow**. When the run finishes, download the **pripyat-atom-city-video** artifact. It contains the full 1080p MP4 and a smaller 720p copy.

## ElevenLabs audio (narration, sound effects, music)
`scripts/elevenlabs_audio.mjs` regenerates three things:
- the narration, using the newest "v4" voice model on your account (or eleven_v3 if there isn't one)
- 14 sound effects, placed at specific scenes
- a music score in three acts

It writes the results to `src/audio.json`, and the video picks them up automatically.

**On GitHub (easiest):**
1. Add your ElevenLabs API key (starts with `sk_`) as a repository secret named `ELEVENLABS_API_KEY`: Settings → Secrets and variables → Actions.
2. Go to Actions → **Generate ElevenLabs audio + render** → Run workflow.

The workflow commits the new audio and then renders the video.

**Locally:** `ELEVENLABS_API_KEY=sk_... node scripts/elevenlabs_audio.mjs`
