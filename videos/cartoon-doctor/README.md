# Cartoon explainer style: 3D example (Three.js + Remotion)

This is a 4-second doctor's-office scene in the flat "explainer cartoon" look: toon shading, thick black outlines, big round heads, stick limbs and one-word captions.

- `src/toon.tsx` is the style kit:
  - `Ink`: a toon-shaded mesh with a black outline
  - `Flat`: an unlit shape
  - `Stick`: a black stick limb
  - `useCanvasTexture`: text for posters and signs
- `src/Character.tsx` is a reusable character. Its props set skin, hair, outfit (`coat`, `hoodie` or `sweater`), hand positions, head turn, blink, sitting and glasses.
- `src/Scene.tsx` builds the room and the animation, all driven by `useCurrentFrame()`.
- `src/Captions.tsx` shows one word at a time from `public/captions.json` (Poppins ExtraBold with a black stroke).

```bash
npm install && npm run studio     # preview
npm run render                    # → out/cartoon-doctor.mp4
```
