# Story Reels: the reference channel, measured

Source: the user's reference creator (YouTube @gicucaras, same videos on TikTok @gicucaras). YouTube blocks
downloads from the sandbox (bot check), TikTok works with `yt-dlp --impersonate chrome` (needs `pip install curl_cffi`).
Measured Nov 2026 from 25 Shorts (titles, views, covers) and five full videos frame by frame (the Dancing Plague
upload, ghosts 500k, Vlad Tepes 417k, Phineas Gage 271k, baldness 659k on TikTok).

## What performs
- Dark history and horror do best (ghosts, the Dancing Plague, Vlad Tepes, Halloween's origin), then big-question
  science (black holes, "why are we born if we die"), "who invented..." and body questions (why you go bald).
- Titles: a shock statement or a question with "?!" ("They danced until they died", "What happens if you fall into a
  black hole?!"). Length 2-3 minutes.

## Script
- Shock hook in the first line with the number, then "this isn't a bedtime story / it's in the history books".
- One storyteller talking to the viewer ("listen", "buddy"), slang, jokes about the characters, rhetorical questions,
  one ridiculous comparison per video, the explanation in two numbered reasons, a relatable callback, a sign-off.

## Picture and edit
- 20-30 cuts a minute; every shot moves (push-ins, a fast dive into the next place, slow pans).
- Transitions: white flash between parts, ghost dissolve with a push, zoom-through with motion blur, quick dissolves.
- Hits: punch zoom on numbers, glow bloom with an expanding ring on impacts, shakes, VHS "REWIND", spotlight ring.
- Titles: a slanted heavy headline at the top, often with a small boxed kicker above it; comic starbursts
  ("MAMAAA!", "TROSC!"); counters ticking up (2.158 -> 30.000); red X over things that didn't happen.
- Captions: 2-3 words, uppercase, the spoken word in yellow, mid-low over a dark bottom band.
- Look: night and dusk palettes (purple, orange), dark silhouettes with glowing rims, colour only on the key thing,
  glowing red eyes on villains, neon map outlines, candles and spotlight cones.

## Our engine
All of this is in `src/engine/episode.tsx` (story mode: `cam`, `tr`, `fx` punch/bloom/rewind/iris, captions) and
`src/episodes/molasses/kit.tsx` (`Punch` kicker, `Burst`, `Counter`). The model episode is `src/episodes/dancing-plague`.
We never copy the creator's character, drawings or scenes: same grammar, our own pictures and voice.
