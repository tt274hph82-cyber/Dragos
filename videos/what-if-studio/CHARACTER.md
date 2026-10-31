# Juno: the channel's hero

Juno is the original hero of every "What If" episode in this project. In the scripts she is "you", the second-person viewer.

| Part | Design | Colour |
|---|---|---|
| Silhouette | a round **top bun** with a **yellow star clip** on its right side | hair `#2B1E1A`, star `#FFD45C` |
| Face | the rig's round head: dot eyes, simple mouth, expression swaps through a blink | skin `#F1D9C2`, shade `#DCC2A8` |
| Top | **lilac hoodie** with a darker kangaroo pocket, yellow collar trim | `#8E7CC3` / `#7563A8`, trim `#FFD45C` |
| Limbs | light with a dark outline, so they read on dark sets | `#EFE2CC`, line `#17131F` |
| Shoes | **mint trainers** | `#5FD3B0` |

In code: `<Hero look={HERO} pose={...} />`. `HERO` is `LOOKS.juno`, and it's also the default when `look` is left out. The look is defined in `src/engine/rig.tsx` (`extra: 'bun'`).

**Rules**
- **Never redesign her between episodes.** No new outfits unless the story needs a costume, and even then keep the bun and the star clip.
- **She's the brightest thing in her area.** Props sit a step darker than her face; the lilac hoodie catches the rim light.
- **Supporting cast:** Mo (friend), Sis (little sister, about 0.7 of her scale), Mum and The Suit. Nova and Kit are spare designs, available as extra characters.
- **Pip, the skill's own mascot, is not used** in this channel's episodes.

Check her after any rig change: `npx remotion still src/index.ts Cast out/cast.png`.
