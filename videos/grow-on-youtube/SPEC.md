# SPEC — How to Grow on YouTube (storyline A, "Channel Zero")

GOAL:    The viewer finishes knowing the loop that grows a channel (one clear viewer → earn the click → keep the promise → get a little better) and wants to upload their next video.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps.
TIME:    ~485 s (set by the narration in script/timings.json) x 30 = ~14,550 frames. Narrated: the voice is the clock.

LOOK:
- Worlds (3, never one dark void):
  1. DESK — Maya's desk at night: walnut desk plane #3A2A20 with 2 px wood-grain stripes at 6% contrast, a warm lamp pool (radial #FFB46B at 22% → 0) upper left. Hero objects: her laptop (bezel #15110E, 22 px radius, screen #FBF8F3) and her phone (bezel #15110E, 46 px radius). Laptop screen fills >= 62% of frame width.
  2. FLOOD — chapter cards: full-frame accent #FF5A1F, ink #16110E type. Entered by a colour flood (0.4 s power2.inOut), left by a vertical wipe.
  3. STUDIO — analytics/graphs on a bright screen #FBF8F3 with ink #16110E strokes 6 px, grid lines #16110E at 8%.
- Ink: #F5F0E8 on desk, #16110E on screens and floods. Muted: #8C7F73.
- Accent #FF5A1F (from the existing reel) only on: the one key word per line, Maya's channel avatar, the "good" line on a graph, the chosen tile, chapter floods.
- Bad/old state: #8C7F73 grey. No green/red traffic lights.
- Type: display Archivo Black, 96–160 px titles at -2% tracking; body Inter 700 at 40–56 px, Inter 400 at 32–40 px. Minimum read text 30 px.
- Shadows: objects on the desk cast 0 30 60 rgba(0,0,0,0.45).

OBJECTS: laptop, phone, video tiles (16:9, 12 px radius, title under), cursor (white arrow, black 3 px outline), a channel avatar (accent circle with "M"), a retention graph (axis + 6 px line), a calendar grid, a notebook page (lined #FBF8F3, 3 holes), a plate with food shapes and steam lines, viewer dots (22 px circles).

MOTION:
- Arrive: expo.out 0.5–0.7 s. Exit: power3.in 0.25–0.35 s (≈50% of entrance). Camera pushes: power2.inOut 0.8–1.2 s on a wrapper.
- Title entrances rotate between: per-word blur-in (6 px → 0, 0.13 s, 0.067 s apart), whole-line blur-in (8 px → 0, 0.18 s), per-word grey → ink.
- Pops (chips, numbers): back.out(1.6) 0.35 s on scale only.
- Each beat reveals its visual on that beat's first word (cue = beat start), the secondary element 0.15 s later at 60% travel. Landed titles hold dead still.
- Something new at least every 3 s.

SHOTS (per chapter; beat ids in script/script.json):
- open: upload bar fills on the laptop → refresh click → counter 0→3 → push into "3 views" → a year-long track of 9 stops → title "How to grow on YouTube".
- algo: a tile pulled toward a viewer → wall of ~240 tiles funnels into 4 phone slots → three signals (click, watch, come back) + a survey card → "gatekeeper" struck, "follows the audience" printed → dots multiplying → "That's the whole game".
- niche: mixed channel grid → 3 crowds walk off → notebook with 3 questions written in → answer stamped in accent → viewer card "that's for me" → narrow beam widening → channel grid re-themed.
- click: blurry tile lost in a feed → "a promise" → title retyped, thumbnail rebuilt → 3 rules labelled on it → shrink to phone size → curiosity vs lying → A/B bars (illustrative) → "Same video. Better promise."
- hook: player with old intro + 0:30 timer → steep graph drop → payoff plate with steam → 3 steps → intro segments snipped from the timeline → 10-second stopwatch → new graph line in accent over the old grey one.
- retain: sagging graph with dips circled → timeline gaps closing → frame flips (angle/close-up/text) → open-loop arc → roadmap marker → end screen → biggest dip flagged → flattened line.
- habit: messy calendar → weekly accent dots → video #1/#10/#50 sharpening → week strip (film Sunday, edit week) → chain links → "Done beats perfect".
- shorts: phone short → dots pour in → long timeline clip snipped into vertical → new eyes vs fans → series shelf (6 episodes) → tiles linked by arrows.
- stats: Sunday 15-min clock → 3 gauges fill (illustrative) → each linked to its fix → topic sorting → bars of her own videos rising → "Beat your last video".
- people: numbers dissolve into avatars → comment replies → pinned comment becomes a tile → poll bars → share fan-out → returning dots form a ring.
- year: calendar flips → wall of 52 tiles, one pops → staircase → three arrows up → the one line in four parts → laptop upload click → "Press upload."

SOUND: Kokoro af_heart narration (speed 0.92) as the clock; lo-fi MusicGen bed at ~0.12 under voice; whoosh on chapter floods (rotate 3 takes), pop on chips/numbers, click on cursor clicks, soft key tick on typed text, riser into the final line once.

BANNED: dark void with small floating things; glow, bloom, particles; purple/blue gradients; glass cards; cream paper + serif + mono caps labels; everything centred; everything fading/sliding up; text moving while read; HUD/corner decoration; three cards in a row (use shelves of 5+, stacks, or diagrams); KPI grids; docked logo; the YouTube logo (we draw a generic player).

QA: frame 0 (laptop + upload, never black); each chapter card mid-point; each chapter's middle; the A/B bars (illustrative label visible); the final hold (≥ 2 s on "Press upload.").
