import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip, Dial } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12 } from '../pause/shots';
import * as A from './shotsA';
import * as B from './shotsB';

// The full episode (about 5 minutes): the short's cold open (C1-C12), then F01-F109.
const pauseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.7 * lv}) brightness(${1 - 0.06 * lv}) contrast(${1 + 0.08 * lv}) hue-rotate(${12 * lv}deg)`,
  jitter: 0,
  Overlay: ({ f, lv, p }) => (
    <g opacity={lv}>
      <rect x={14} y={14} width={1892} height={1052} fill="none" stroke="#BFE3FF" strokeWidth={6} opacity={0.5} rx={10} />
      <HudChip f={f} label="PAUSED" icon="pause" />
      <Dial p={1 - p * 0.15} readout={`0:${String(Math.floor(1 + p * 6)).padStart(2, '0')}`} />
    </g>
  ),
};

const pick = (m: Record<string, unknown>) => Object.fromEntries(Object.entries(m).filter(([k]) => /^F\d+$/.test(k))) as Record<string, React.FC<any>>;

export const pauseFull = defineEpisode('PauseFull', {
  timeline: timeline as Timeline,
  shots: { C1: S1, C2: S2, C3: S3, C4: S4, C5: S5, C6: S6, C7: S7, C8: S8, C9: S9, C10: S10, C11: S11, C12: S12, ...pick(A), ...pick(B) },
  looks: { pause: pauseLook },
});
