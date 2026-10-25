# DJ Mix — spec

- Audio: `assets/music/mix.mp3` (269.75 s). Bajo Pesado (deck A) into Controlled Groove (deck B, slowed 0.16% to 126 BPM).
  B comes in high-passed at 118.04 s, bass swap and B's drop at 133.36 s, A faded out by 140.96 s.
- Visuals: `assets/dj.js`, a canvas renderer driven only by time. Pure black (#000) background.
- Character: an original DJ (black bob, white and orange headphones, black crop jacket with reflective trims), rim-lit.
- Shots: 63 cuts on bar lines across 11 camera setups (front wide/medium/close/low/silhouette, overhead full/mixer/deck, side, side close, record close-up).
  No shot type repeats back to back; each shot gets its own light colours, LED facade pattern and camera drift.
- The mixer on screen follows the real mix: VU meters from `assets/env.js`; crossfader, channel faders and B's low EQ move when they move in the audio.
- Rebuild the audio: see the ffmpeg command in the git history / chat. Source WAVs are gitignored.
