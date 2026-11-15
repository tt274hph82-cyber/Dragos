# Sound

Every film gets an original score and UI sounds, synthesised in code by
`scripts/synth.mjs` from the beat grid. Never download, sample, imitate or
"recreate" copyrighted music, and never use a track the user has not shown a
licence for. If the user brings their own licensed track, put it in
`film/assets/` as the score instead, run `npx hyperframes beats` on it to
find its tempo, and rebuild the grid on that BPM.

## What the synth makes

- **Score:** pad chords, a plucked arpeggio, bass, kick, clap and hats,
  arranged per section by `energy`, with a riser into a `riser` section's end
  and an impact on a `drop`. The kick pumps the music bus (sidechain), so the
  groove breathes. Chords and drum feel follow `vibe` (driving, playful, warm,
  cinematic, minimal, dark); `key` moves the tonic.
- **UI sounds, one per role:** click, tick/type, pop, whoosh, hit, shimmer,
  riser. One sound per role through the whole film: rotating variants across a
  fast sequence reads as unstable, not varied, and a different sound on one
  card reads as a mistake.

## Rules

- **A sound is a visible event, never a beat.** Beats also steer scrolls and
  timing; a cue where nothing changes on screen is two sounds and no reason.
  Every `sfx` entry names its `event`.
- **The PEAK lands on the frame.** Light arrives before sound, so an effect
  early feels wrong sooner than one late; synth.mjs places each effect's peak
  half a frame after its picture time. Critique measures it in the delivered
  file and flags anything over 50 ms off.
- **Effects sit 3-6 dB over the bed,** measured around each one, not guessed.
- **The bed carries mids.** Under ~55% of its energy below 150 Hz, or it
  plays as nothing on a phone speaker. synth.mjs reports the share.
- **One big hit,** on the payoff or the mark.
- **Loudness:** -14 LUFS integrated, true peak -1 dBTP or lower (two-pass
  loudnorm). Never gain a track by a number copied from another film; a gain
  means nothing without the two levels it sits between.
- **Say it was measured, not heard.** Nobody running this skill can listen;
  the delivery log says so.

## Levels the critique checks

loudness, true peak, each effect's offset from its frame and its rise over
the bed, all on the DELIVERED mp4, not on the wav that went into it.
