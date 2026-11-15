# Studio

Design-studio motion. One hero object on a glowing single-colour ground: a
glass folder holding the brand's real screens, a lens orb with the mark, a
retro poster object. Bold shapes, a designer's cursor and selection boxes,
strokes drawing on, springy pops.

## The look, in numbers
- Ground: `.st-ground`, the accent lit from the centre (accent mixed 62% to white at 50% 42%, falling to the accent at 22% on black). `.is-mono` for a light grey dot-grid variant with black shapes.
- Energy: a slow sunburst behind (`.st-burst`, 24 rays at 7.5% white, 10-12 deg/s), organic blobs at the corners (`.st-blob`, seeded with `MD.studio.blob`), thick white strokes (`.st-swoosh`).
- Hero objects: `.st-folder` (back panel with a tab, real screens as `.st-card`s inside, a glass `.st-front` with the mark and name), `.st-orb` (a glass lens with the mark inside). The hero is 45-60% of the frame height and is the only thing in focus.
- Tools: `.st-select` (dashed box with 4 handles) and `.st-cursor` act on the copy: select the word that matters, click a button, drag a card.
- Type: the brand's display face in white, 72-150px, short lines; the selected word inverts (white box, dark text).

## Motion
- Springy: pops land on `back.out(1.8)` in 0.4-0.55s (`MD.studio.pop`, `data-in="pop@B4"`); exits `back.in` in 0.2s (`unpop`).
- The hero turns a few degrees across its shot (rotationY -14 to +10) so it reads as an object, never a flat card.
- Strokes draw on and off with `power2.inOut` (`swoosh`); the selection box drags from its corner (`select`); the cursor glides and squashes on click (`cursor`).
- The glass catches light once as it lands (`sheen`).
- Transitions: the hero pops away while the next one pops in; or the camera dives into the selected word or into a card.

## Shot recipes
- Hook: the claim pops in word by word, a swoosh draws under it, the cursor selects the key word.
- Product: the glass folder pops in, three real screens rise and fan out of it, light runs across the glass.
- Feature: one real card pulled out of the folder by the cursor, enlarged to 60% of the frame, a selection box around the part that matters.
- Search / AI: a glass search bar, the query typed (`data-in="type@B4"`), the real result card pops up under it.
- Number: the figure huge in the display face inside the orb, magnified.
- End card: the mark inside the lens orb rolls in, the domain pops under it, the sunburst keeps turning.

## Sound
Warm, 100-120 BPM; a soft pop on each spring, a click with the cursor, a glass shimmer on the sheen.

## Banned
- More than one hero object in focus. Stepped or stop-motion moves. Paper, tape, photo textures.
- Text on the hero's glass that is not the brand's own name or mark.
