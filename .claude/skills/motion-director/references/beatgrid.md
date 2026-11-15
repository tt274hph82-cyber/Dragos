# The beat grid

`beatgrid.json` is the one plan. The picture (md.js through `beats.js`) and the
sound (`synth.mjs` through `sound/beats.json`) both resolve every time in it
through the same parser, so a cut, a text entrance and the sound under it
cannot drift apart. Two files holding one measurement always drift; this is
one file.

## Choosing the tempo

One bar of 4 beats at BPM b lasts 240/b seconds. Pick the BPM so the length the
user asked for is a whole number of bars, plus a ~0.8s tail for the last chord
and the end card:

| length | 120 BPM (bar 2.0s) | 128 (1.875s) | 100 (2.4s) | 96 (2.5s) |
|---|---|---|---|---|
| ~10s | 5 bars = 10.0 | 5 = 9.4 | 4 = 9.6 | 4 = 10.0 |
| ~15s | 7 = 14.0 | 8 = 15.0 | 6 = 14.4 | 6 = 15.0 |
| ~20s | 10 = 20.0 | 10 = 18.75 | 8 = 19.2 | 8 = 20.0 |
| ~30s | 14 = 28.0 | 16 = 30.0 | 12 = 28.8 | 12 = 30.0 |

Vibe to tempo: driving/launch 118-128, playful 110-120, warm 90-105,
cinematic/minimal 90-110 (half-time feel), dark 95-110.

## Schema

```json
{
  "title": "Acme launch",
  "bpm": 120, "bars": 10, "beatsPerBar": 4, "tail": 0.8, "length": 20.8,
  "vibe": "driving",
  "key": "A minor",
  "signature": "the dashboard assembles itself on the drop",
  "cues": { "drop": "bar4", "logo": "bar8" },
  "sections": [
    { "name": "intro", "from": "bar0", "to": "bar2", "energy": 0.3 },
    { "name": "build", "from": "bar2", "to": "bar4", "energy": 0.6, "riser": true },
    { "name": "drop",  "from": "bar4", "to": "bar8", "energy": 1.0, "drop": true },
    { "name": "outro", "from": "bar8", "to": "bar10", "energy": 0.45 }
  ],
  "shots": [
    { "id": "s1", "from": "B0", "to": "B8",
      "screen": "the real inbox screenshot, the headline 'Zero inbox, by noon' types in",
      "motion": "camera pushes from the whole window to the unread count; per-word entrance",
      "sound": "tick on each typed word, whoosh on the cut" }
  ],
  "sfx": [
    { "type": "whoosh", "at": "B8", "event": "cut into the dashboard" },
    { "type": "hit", "at": "logo", "event": "the logo lands" }
  ]
}
```

- `vibe`: driving, playful, warm, cinematic, minimal, dark (the synth's
  arrangement, chords and drums follow it).
- `energy` 0-1 per section: under 0.3 pad and hats only; 0.45 a kick; 0.55
  a pluck arpeggio; 0.7 the full kit and clap.
- `riser: true` builds into the section's end; `drop: true` puts an impact on
  its first downbeat. The signature moment belongs on the drop.
- `sfx.type`: click (a real cursor click), tick/type (text arriving a
  character or word at a time), pop (a chip, badge or number landing), whoosh
  (a cut, or a big card moving fast), hit (the payoff or the mark, ONCE),
  shimmer (a reveal), riser (ends on its time). Every effect names the
  visible `event` it belongs to: a cue on a beat where nothing changes on
  screen is a sound with nothing to explain it.
- Shots are contiguous, start at 0 and end at the film's length. Each becomes
  `<section id="<shot id>" class="clip md-scene" data-start data-duration>`
  with exactly the times beatgrid.mjs prints.

## The table the user approves

`node scripts/beatgrid.mjs --project <dir>` prints and writes `beatgrid.md`:
one row per shot with its time, its beats, what is on screen, the motion and
the sound. Show that table and WAIT. Nothing animates until the user says yes;
then `beatgrid.mjs --approved` records it (the log separates working time from
time spent waiting).
