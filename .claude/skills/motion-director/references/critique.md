# Critique

Score each axis 1-10 after LOOKING at `sheet.png` and `phone.png` and reading
`metrics.json`. A score is only useful if it names what to change, so every
axis under 8 carries at least one `fix` line, written as
`t=4.2s · where · problem -> exact change`. Fix every one, render the next
round, score again. Maximum three rounds; then deliver the best and say what
is still under 8.

Be the harsh motion director, not the proud author. You wrote the timeline, so
you know what happens; the viewer sees it once, at full speed, on a phone,
often muted.

## Anchors

Measurements cap a score: a measured problem in an axis's area holds that axis
at 7 or under until it is fixed.

| axis | 9-10 | 7-8 | 5-6 | under 5 |
|---|---|---|---|---|
| **hook** | frame 0 already shows the product or a result and one bold line; the first 2s pose a question or a change | strong but needs a beat to arrive | a title fading in over the brand colour | black, a logo, or empty for a second |
| **brand** | brand's own colours in its own proportions, its type (or the closest bundled face), its real logo and real screens; reads as made by the brand | right palette, one off-brand element | generic "tech" look with the logo dropped on | wrong colours, invented UI, lettermark logo |
| **motion** | eases by role, arrive slow and leave clean, every move has a cause, one continuous world | good moves, one robotic or floaty element | everything on the same ease, fade-and-slide everywhere | jitter, jumps at seams, wobble |
| **readability** | every line held 0.5s + 0.3s/word, readable at 360px wide, inside the safe box, contrast AA | one line short or small | several lines unreadable at phone width | text cut off, under platform UI, or illegible |
| **pacing** | cuts on beats, layout changes on bars, signature moment on the drop, no still stretch over 3s | one sag or one rush | shots all the same length; a dead stretch | the music and the picture are unrelated |
| **polish** | clean seams, shadow-safe clips, whole-pixel edges, effects on their frames, a held end card, nothing stray | one small blemish | several visible blemishes | broken frames |

## The measured problems, mapped to axes

| metric | axis |
|---|---|
| frame 0 ink under 3%, `first_frame_empty` | hook |
| `line_unread`, `text_below_floor`, contrast, frame-check, caption-zone | readability |
| longest still over 3s, `dead_stretch` | pacing (and motion) |
| an effect over 50 ms from its frame, under 3 dB over the bed | polish |
| loudness off -14 LUFS, true peak over -1 | polish |
| irregular timestamps, wrong length | polish (and a bug: fix first) |

## What to look for on the sheets

1. Describe each frame in one sentence as a stranger would, naming every
   object. Anything you would have to explain is a problem.
2. With the words covered, do the frames still tell the story?
3. The tells: centred text on a plain ground; a feature list as three cards;
   a title over a dimmed screenshot; an invented dashboard; the logo docked
   in a corner; every element fading and sliding up; breathing or floating
   loops; a slow creeping scale; product UI tilted in 3D; a small window in
   the middle of an empty frame.
4. The repeated notes in `motion-rules.md`.
5. Phone sheet: can every line be read at 360px wide?

## scores.json

```json
{
  "hook": { "score": 8, "notes": ["frame 0: inbox screenshot + 'Zero inbox' on screen"], "fix": [] },
  "brand": { "score": 7, "notes": ["accent used on two words in s3"], "fix": ["t=9.1s · s3 headline · two accented words -> accent only 'noon'"] },
  "motion": { "score": 9, "notes": [], "fix": [] },
  "readability": { "score": 8, "notes": [], "fix": [] },
  "pacing": { "score": 8, "notes": [], "fix": [] },
  "polish": { "score": 8, "notes": [], "fix": [] }
}
```

Then `node scripts/critique.mjs --project <dir> --round <n> --verdict` prints
the table, records the round, and says PASS, FIX or STOP. Show the user the
table every round.
