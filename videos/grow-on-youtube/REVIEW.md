# Review — How to Grow on YouTube

## What was built
- Storyline A, "Channel Zero": one made-up creator, Maya, goes from a 3-view upload to a community in a year. 11 scenes (an opening plus 10 lessons), ~8:05, 1920x1080, 30 fps.
- Not built: B "The Click Machine" (one machine the camera rides along) and C "Every Second Counts" (giant kinetic type with a countdown, the big sibling of the 10 s reel). Both are in STORYLINES.md.

## How it is made
- `script/script.json` holds the narration, split into short phrases. `script/make_voice.py` voices it with Kokoro (af_heart, speed 0.92) and writes `script/timings.json`, the start/end of every phrase.
- `src/scenes/<chapter>.html` holds each scene's markup and animation, keyed to phrase ids (`C.c6` = when phrase c6 starts). `src/shared.css` / `src/shared.js` hold the shared look and helpers.
- `node build.mjs` writes `compositions/*.html` and `index.html` (scene hosts, voice, music, sound effects). Edit `src/`, never `compositions/`.
- To change the words: edit `script/script.json`, run `python3 -I script/make_voice.py`, convert to mp3 (ffmpeg), then `node build.mjs`. Visuals follow the new timings automatically.

## Checked
- `hyperframes check`: 0 errors. Kept warnings: "composition file too large" (scenes are long by design: one per lesson) and one "repeated fromTo on a proxy" (number counters; they render correctly when seeked).
- Snapshots of every phrase in every chapter were looked at; overlaps, clipped thumbnail text, a hidden tile and mis-anchored shapes were fixed and re-checked.
- Sound was measured, not heard: narration peak about -1 dBFS, music bed at 0.13 volume, effects 0.25–0.7.

## Not checked
- Nobody listened to the final mix. The music is a 31 s MusicGen loop crossfaded to full length; it may sound repetitive.
- On-screen numbers (6.2% CTR, 4:12, 38%, "almost 2x the clicks", poll results) are illustrative and labelled as such.

## Weakest parts
- Maya is shown only through her things (channel, avatar "M", screens), never as a person.
- Lessons 6–9 lean on text plus simple diagrams; with more time each would get one stronger hero object.
- The music loop. A real track (HeyGen catalog or your own) would lift the whole film.
