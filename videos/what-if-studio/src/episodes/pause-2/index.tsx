import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

// Part 2 uses the same paused look as Part 1, without the small breath dial (the shots carry a big one).
const pauseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.7 * lv}) brightness(${1 - 0.06 * lv}) contrast(${1 + 0.08 * lv}) hue-rotate(${12 * lv}deg)`,
  jitter: 0,
  Overlay: ({ f, lv }) => (
    <g opacity={lv}>
      <rect x={14} y={14} width={1892} height={1052} fill="none" stroke="#BFE3FF" strokeWidth={6} opacity={0.5} rx={10} />
      <HudChip f={f} label="PAUSED" icon="pause" />
    </g>
  ),
};
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
export const pause2 = defineEpisode('Pause2', { timeline: timeline as Timeline, shots, looks: { pause: pauseLook } });
