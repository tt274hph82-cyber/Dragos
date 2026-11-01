import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip, Dial, TapeLines } from '../../engine';
import timeline from './timeline.json';
import * as S from './shots';

// The power's look: fast-forward. The picture shifts cool and jitters, tape lines roll, a SKIP chip blinks and a dial
// races an hour forward.
const skipLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.25 * lv}) contrast(${1 + 0.12 * lv}) hue-rotate(${18 * lv}deg) brightness(${1 + 0.05 * lv})`,
  jitter: 3,
  Overlay: ({ f, p, w = 1920 }) => (
    <g>
      <TapeLines f={f} />
      <HudChip f={f} label="SKIP" icon="skip" />
      <Dial x={w - 200} y={140} p={p} readout={`+${Math.floor(p * 60)}m`} />
    </g>
  ),
};
const shots = Object.fromEntries(Object.entries(S).filter(([k]) => /^S\d+$/.test(k))) as Record<string, React.FC<any>>;
const vertical: Record<string, number | [number, number]> = {
  S1: 960, S2: [900, 1100], S3: 1000, S4: 900, S5: 900, S6: 960, S7: [800, 1050], S8: [960, 860], S9: 960, S10: 960, S11: 960, S12: 960, S13: [760, 820],
};
export const skipSleep = defineEpisode('SkipSleep', { timeline: timeline as Timeline, shots, looks: { skip: skipLook }, vertical });
