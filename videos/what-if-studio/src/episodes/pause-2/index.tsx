import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip, Dial, kf } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

// Part 2 uses the same paused look as Part 1, without the small breath dial (the shots carry a big one).
const pauseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.7 * lv}) brightness(${1 - 0.06 * lv}) contrast(${1 + 0.08 * lv}) hue-rotate(${12 * lv}deg)`,
  jitter: 0,
  Overlay: ({ f, lv, w = 1920, h = 1080 }) => {
    // tall frame: the stopwatch moves into the overlay at the top (the shots' own dials fall outside the window).
    // It counts with the narration: Thirty (6.6 s), Sixty (9.0 s), Ninety (11.0 s).
    const secs = Math.round(kf(f / 30, [[5.4, 0], [6.6, 30], [9.0, 60], [11.0, 90], [13.4, 96]], (x) => x));
    return (
      <g opacity={lv}>
        <rect x={14} y={14} width={w - 28} height={h - 28} fill="none" stroke="#BFE3FF" strokeWidth={6} opacity={0.5} rx={10} />
        <HudChip f={f} label="PAUSED" icon="pause" />
        {w < h ? <Dial x={w - 170} y={260} r={120} p={Math.min(1, secs / 100)} readout={`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`} size={50} /> : null}
      </g>
    );
  },
};
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
// 9:16 framing: where the tall window sits in each shot (x in the 1920-wide frame), panning where the action moves.
const vertical = {
  S1: [1480, 960], S2: 960, S3: 960, S4: 960, S5: 960, S6: [1250, 860], S7: [1260, 800], S8: 900,
  S9: 960, S10: 960, S11: 960, S12: 1020, S13: 960,
} as Record<string, number | [number, number]>;
export const pause2 = defineEpisode('Pause2', { timeline: timeline as Timeline, shots, looks: { pause: pauseLook }, vertical });
