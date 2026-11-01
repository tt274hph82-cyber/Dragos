import React from 'react';
import {
  basePose, kf, clamp, lerp, easeOut, OUT, LEG_LEN, Hero, camT, Schematic, SchLabel, DrawOn, SCH, Dial, TitleCard, Glow, ShotProps,
} from '../../engine';
import { JUNO, SUIT, ICE, Act, scene, closeUp, sets, Arm, Frozen } from '../pause-full/parts';

// "What if you could pause time? Part 2": the Suit's test. Thirteen shots on the schematic lab, the street and the
// roof. The test room is a glass box on the blueprint grid; the twist is that the Suit doesn't freeze.

const FEET = 900;
const GLASS = { x0: 700, x1: 1220, y0: 300, y1: FEET + 10 };
const Glass: React.FC<{ open?: number }> = ({ open = 0 }) => (
  <g>
    <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} fill="#BFE3FF" opacity={0.08} />
    <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} fill="none" stroke={ICE} strokeWidth={6} opacity={0.8} />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${GLASS.x0 + 60 + i * 140} ${GLASS.y0 + 40} l 90 -0 l -140 220`} stroke="#FFFFFF" strokeWidth={6} opacity={0.18} />)}
    {/* the door, sliding open */}
    <rect x={GLASS.x0 + 4} y={FEET - 300} width={14} height={300} fill={ICE} opacity={0.9} transform={`translate(${-open * 40} 0)`} />
  </g>
);
const lab = (t: number, id: string) => <Schematic t={t} id={id} />;
const guards = (freeze?: number): Act[] => [
  { look: SUIT, x: 300, feet: FEET, scale: 0.85, pose: { yaw: 0.4, look: 0.6 }, face: [[0, 'neutral']], freeze, shadow: 0.4 },
  { look: SUIT, x: 440, feet: FEET, scale: 0.85, pose: { yaw: 0.4, look: 0.6, legL: { a: 25, b: -10 }, legR: { a: -15, b: 0 } }, face: [[0, 'neutral']], freeze, shadow: 0.4 },
];
const suit = (o: Partial<Act> = {}): Act => ({ look: SUIT, x: 1520, feet: FEET, scale: 0.9, pose: { yaw: -0.5, look: -0.8, armR: { a: 60, b: 70 } }, face: [[0, 'smug']], rim: 'rimL', shadow: 0.4, ...o });
const juno = (o: Partial<Act> = {}): Act => ({ look: JUNO, x: 960, feet: FEET, scale: 0.9, pose: { yaw: 0.2, look: 0.5 }, face: [[0, 'worried']], shadow: 0.4, ...o });
const BigDial: React.FC<{ t: number; from: number; to: number; dur: number; x?: number; y?: number; r?: number }> = ({ t, from, to, dur, x = 1640, y = 220, r = 120 }) => {
  const s = Math.round(lerp(from, to, clamp(t / dur)));
  return <Dial x={x} y={y} r={r} p={Math.min(1, s / 100)} readout={`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`} size={r * 0.42} />;
};

export const S1 = scene({ set: (t) => lab(t, 'p2s1'), cam: [960, 600, 1.0, 960, 600, 1.05], actors: [...guards(), juno(), suit()], under: () => <Glass /> });
export const S2: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <Schematic t={t + 30} id="p2s2" />
    <Arm look={SUIT} from={[2200, 1100]} to={[1180, 700]} rot={-120} s={6} />
    <Dial x={960} y={480} r={300} p={0} readout="0:00" size={130} />
  </g>
);
export const S3 = scene({ set: (t) => lab(t, 'p2s3'), cam: [960, 640, 1.9, 960, 640, 2.0], actors: [juno({ pose: { yaw: 0.1, look: 0, armL: { a: 30, b: 40 }, armR: { a: 30, b: 40 } } })], under: () => <Glass />, over: () => <rect x={GLASS.x0} y={GLASS.y0} width={GLASS.x1 - GLASS.x0} height={GLASS.y1 - GLASS.y0} fill="#BFE3FF" opacity={0.06} /> });
export const S4 = closeUp({ look: JUNO, face: [[0, 'worried'], [6, 'puff']], bg: (t) => lab(t, 'p2s4b'), bgT: 'translate(-500 -400) scale(1.6)', x: 960, y: 580, sc: 5.2, yaw: 0.1, pose: { squash: -0.03 } });
export const S5 = scene({ set: () => lab(0, 'p2s5'), cam: [960, 600, 1.0, 960, 600, 1.06], actors: [...guards(0), juno({ face: [[0, 'puff']] }), suit({ freeze: 0 })], under: () => <Glass />, over: (t) => <Frozen x={960} y={600} t={t} r={300} /> });
export const S6 = scene({
  set: () => lab(0, 'p2s6'), cam: [700, 640, 1.3, 600, 640, 1.36],
  actors: [...guards(0), juno({ walk: { to: 520, t1: 30 }, face: [[0, 'puff']] }), suit({ freeze: 0 })],
  under: (t) => <Glass open={clamp(t / 6)} />, over: (t) => <BigDial t={t} from={28} to={34} dur={24} x={1080} y={360} r={100} />,
});
export const S7 = scene({
  set: () => sets.street(0, true, 'p2s7'), cam: [1600, 640, 1.2, 1400, 640, 1.26],
  actors: [{ look: JUNO, x: 1850, feet: OUT.feet + 30, scale: 0.75, walk: { to: 1250, t1: 40 }, face: [[0, 'puff']] }],
  over: (t) => <BigDial t={t} from={58} to={64} dur={30} x={1150} y={330} r={110} />,
});
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const C = closeUp({ look: JUNO, face: [[0, 'tired']], bg: () => sets.street(0, true, 'p2s8b'), bgT: 'translate(-1500 -800) scale(2)', x: 900, y: 600, sc: 5.6, yaw: 0.15, rim: 'rimRed' });
  const g = clamp(t / len);
  return (
    <g>
      <C t={t} len={len} f={0} />
      <defs>
        <radialGradient id="p2tunnel" cx="0.47" cy="0.5" r="0.75">
          <stop offset={`${70 - g * 45}%`} stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#3A3A40" stopOpacity={0.96} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#p2tunnel)" />
      <BigDial t={t} from={88} to={92} dur={len} x={1560} y={300} r={120} />
    </g>
  );
};
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
    {sets.roof(t, { sunX: 960, sunY: 650, clock: true, spin: 156, red: 0.25 })}
    <Hero look={JUNO} pose={{ ...basePose, x: 960, y: 820 - LEG_LEN * 0.62, scale: 0.62, expr: 'worried' }} shadow={0.6} rimId="rimR" />
    <TitleCard t={t} lines={['WHAT IF YOU COULD', 'PAUSE TIME? PART 2']} accent="2" accentT={20} size={110} />
  </g>
);
const BRAIN = 'M 780 560 Q 760 400 900 380 Q 960 300 1060 360 Q 1180 340 1200 460 Q 1260 560 1160 620 Q 1100 700 980 660 Q 860 700 800 620 Z M 960 380 Q 940 480 990 560 M 1060 420 Q 1100 500 1060 600';
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
    <Schematic t={t + 60} id="p2s10" />
    <g transform="translate(-380 0)"><DrawOn d={BRAIN} t={t} dur={12} width={7} /></g>
    <SchLabel x={1280} y={440} t={t - 6} text="2% OF YOUR WEIGHT" size={44} color={SCH.dim} />
    <SchLabel x={1280} y={600} t={t - 14} text="20% OF YOUR OXYGEN" size={64} color={SCH.live} />
    {[0, 1, 2].map((k) => {
      const p = ((t + k * 10) % 30) / 30;
      return <circle key={k} cx={620} cy={520} r={160 + p * 220} fill="none" stroke="#FF6A5A" strokeWidth={5} opacity={(1 - p) * clamp((t - 16) / 6)} />;
    })}
  </g>
);
export const S11 = closeUp({ look: JUNO, face: [[0, 'tired'], [3, 'shock']], bg: (t) => sets.street(t, false, 'p2s11b', 0.3), bgT: 'translate(-1500 -800) scale(2)', x: 960, y: 600, sc: 5, yaw: 0.1, pose: { squash: -0.06 } });
export const S12: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1300], [len, 1320]]), 600, kf(t, [[0, 1.7], [len, 1.82]]))}>
    {sets.street(t, false, 'p2s12', 0.5)}
    {/* the Suit steps in behind her, out of focus first, then sharp */}
    <g opacity={clamp(t / 4)}>
      <Hero look={SUIT} pose={{ ...basePose, x: 1420, y: OUT.feet + 10 - LEG_LEN * 0.95, scale: 0.95, yaw: -0.3, look: -0.6, expr: 'smug' }} shadow={0.4} rimId="rimRed" />
    </g>
    <Hero look={JUNO} pose={{ ...basePose, x: 1250, y: OUT.feet + 30 - LEG_LEN * 0.75, scale: 0.75, yaw: 0.3, look: 0.4, expr: 'tired', tilt: 6 }} shadow={0.4} rimId="rimR" />
  </g>
);
export const S13 = closeUp({
  look: SUIT, face: [[0, 'smug']], bg: (t) => sets.street(t, false, 'p2s13b', 0.7), bgT: 'translate(-1500 -800) scale(2)', x: 960, y: 600, sc: 6.2, yaw: -0.1, eyes: 0, rim: 'rimRed',
  over: (t) => <Glow x={960} y={520} r={600} kind="red" o={0.25} />,
});
