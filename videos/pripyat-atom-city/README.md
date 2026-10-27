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
