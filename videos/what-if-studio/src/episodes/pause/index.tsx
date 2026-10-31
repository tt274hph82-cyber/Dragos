import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip, Dial } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16 } from './shots';

// The power's look: while time is paused the picture goes cold and grey, a thin ice-blue frame comes up, a PAUSED
// chip blinks, and a breath dial counts how long she's been holding it.
const pauseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.7 * lv}) brightness(${1 - 0.06 * lv}) contrast(${1 + 0.08 * lv}) hue-rotate(${12 * lv}deg)`,
  jitter: 0,
  Overlay: ({ f, lv, p }) => {
    const held = 1 + p * 3;
    return (
      <g opacity={lv}>
        <rect x={14} y={14} width={1892} height={1052} fill="none" stroke="#BFE3FF" strokeWidth={6} opacity={0.5} rx={10} />
        <HudChip f={f} label="PAUSED" icon="pause" />
        <Dial p={1 - p * 0.15} readout={`0:${String(Math.floor(held)).padStart(2, '0')}`} />
      </g>
    );
  },
};

export const pause = defineEpisode('Pause', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16 },
  looks: { pause: pauseLook },
});
