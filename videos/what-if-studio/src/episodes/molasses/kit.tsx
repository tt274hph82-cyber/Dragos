import React from 'react';
import { Hero, Look, Pose, basePose, clamp, lerp, easeOut, LEG_LEN, HEAD, FONT, Glow } from '../../engine';
import { COSTEL, INK } from '../fountain-pen/shots';

// The story-Reel kit, drawn natively in 1080 x 1920. Measured from the reference Reels: one colour mood per scene
// (a soft vertical gradient), depth from layered flat silhouettes each a shade closer to the sky, figures as dark
// silhouettes with a thin glowing outline in the scene's light colour, colour only on the story's key object, and a
// richer, fully drawn host standing inside the scenes.

export const W = 1080, H = 1920;
export type Mood = 'noon' | 'warm' | 'danger' | 'brown' | 'night' | 'cold';
export const MOODS: Record<Mood, { sky: [string, string]; layers: [string, string, string]; ground: string; rim: string; glow: 'warm' | 'cool' | 'red' }> = {
  noon: { sky: ['#9FB9D2', '#EADCC2'], layers: ['#8597AC', '#5F7086', '#3C4858'], ground: '#232833', rim: '#FFE2A8', glow: 'warm' },
  warm: { sky: ['#E59A55', '#FBE1AC'], layers: ['#C08050', '#93603E', '#644230'], ground: '#2C1C14', rim: '#FFD27A', glow: 'warm' },
  danger: { sky: ['#2E0B12', '#C2402A'], layers: ['#7A2A22', '#561C18', '#341012'], ground: '#1C0A0C', rim: '#FF8A3D', glow: 'red' },
  brown: { sky: ['#24130A', '#8A5626'], layers: ['#6A4222', '#4E2E18', '#331C0E'], ground: '#1A0E07', rim: '#F2A33A', glow: 'warm' },
  night: { sky: ['#121230', '#4A2C62'], layers: ['#3A2A52', '#2A1E40', '#1C142C'], ground: '#0E0A18', rim: '#C9A2FF', glow: 'cool' },
  cold: { sky: ['#0C1E30', '#5E8FB6'], layers: ['#2E4E6A', '#203A52', '#14263A'], ground: '#0A1624', rim: '#9FE3FF', glow: 'cool' },
};

/** The sky: a soft vertical gradient and a big glow (sun or moon). */
export const Sky: React.FC<{ id: string; mood: Mood; sunY?: number; sunX?: number; moon?: boolean }> = ({ id, mood, sunY = 520, sunX = 700, moon }) => {
  const m = MOODS[mood];
  return (
    <g>
      <defs>
        <linearGradient id={`sk${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={m.sky[0]} />
          <stop offset="70%" stopColor={m.sky[1]} />
        </linearGradient>
      </defs>
      <rect x={-300} y={-300} width={W + 600} height={H + 600} fill={`url(#sk${id})`} />
      {moon ? <circle cx={sunX} cy={sunY} r={70} fill="#FFF2C8" /> : <circle cx={sunX} cy={sunY} r={120} fill="#FFF6DE" opacity={0.75} />}
      <Glow x={sunX} y={sunY} r={520} kind={m.glow} o={0.55} />
    </g>
  );
};

// Boston's waterfront skyline in three layers (fixed shapes, no randomness): far domes and spires, the middle rooftops,
// the near warehouses.
const FAR = [[-100, 300, 920], [160, 140, 860], [280, 120, 980], [380, 200, 900], [560, 110, 830], [650, 180, 940], [820, 150, 880], [940, 240, 920]];
const MID = [[-80, 220, 1060], [130, 160, 1000], [280, 230, 1080], [500, 170, 1020], [660, 210, 1100], [860, 260, 1040]];
const NEAR = [[-60, 300, 1180], [230, 260, 1140], [480, 240, 1200], [710, 380, 1160]];
export const City: React.FC<{ mood: Mood; shift?: number }> = ({ mood, shift = 0 }) => {
  const m = MOODS[mood];
  const row = (rows: number[][], c: string, dx: number, roof: 'dome' | 'flat' | 'gable') => (
    <g fill={c} transform={`translate(${dx} 0)`}>
      {rows.map(([x, w, top], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={H} />
          {roof === 'dome' && i % 3 === 1 ? <path d={`M ${x + w * 0.2} ${top} Q ${x + w / 2} ${top - w * 0.7} ${x + w * 0.8} ${top} Z`} /> : null}
          {roof === 'dome' && i % 3 === 2 ? <path d={`M ${x + w / 2 - 8} ${top} L ${x + w / 2} ${top - 160} L ${x + w / 2 + 8} ${top} Z`} /> : null}
          {roof === 'gable' ? <path d={`M ${x} ${top} L ${x + w / 2} ${top - w * 0.35} L ${x + w} ${top} Z`} /> : null}
          {roof !== 'dome' ? <rect x={x + w * 0.7} y={top - 50} width={22} height={50} /> : null}
        </g>
      ))}
    </g>
  );
  return (
    <g>
      {row(FAR, m.layers[0], shift * 0.2, 'dome')}
      {row(MID, m.layers[1], shift * 0.5, 'gable')}
      {row(NEAR, m.layers[2], shift, 'flat')}
    </g>
  );
};

/** The street in front: a ground band from y, cobbles as faint lines. */
export const Street: React.FC<{ mood: Mood; y?: number }> = ({ mood, y = 1270 }) => (
  <g>
    <rect x={-300} y={y} width={W + 600} height={H} fill={MOODS[mood].ground} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M -300 ${y + 40 + i * 70} L ${W + 300} ${y + 40 + i * 70}`} stroke="#000" strokeOpacity={0.25} strokeWidth={4} />)}
  </g>
);

/** The elevated railway: a girder deck on posts across the frame; `bend` sags its middle. */
export const ElRail: React.FC<{ y?: number; bend?: number; c?: string }> = ({ y = 1000, bend = 0, c = INK }) => {
  const sag = (x: number) => y + bend * Math.sin((x / W) * Math.PI) * 140;
  const xs = Array.from({ length: 13 }, (_, i) => -60 + i * 100);
  return (
    <g stroke={c} fill="none">
      <path d={`M ${xs.map((x) => `${x} ${sag(x)}`).join(' L ')}`} strokeWidth={28} />
      <path d={`M ${xs.map((x) => `${x} ${sag(x) + 60}`).join(' L ')}`} strokeWidth={14} />
      {xs.map((x, i) => (i < xs.length - 1 ? <path key={i} d={`M ${x} ${sag(x) + 60} L ${x + 50} ${sag(x + 50)} L ${x + 100} ${sag(x + 100) + 60}`} strokeWidth={8} /> : null))}
      {xs.filter((_, i) => i % 3 === 1).map((x) => <path key={x} d={`M ${x} ${sag(x) + 60} L ${x + bend * 40} ${H}`} strokeWidth={22} />)}
    </g>
  );
};

const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join('');
};

/** The molasses tank: a riveted steel cylinder with a cone roof. brown paints it; leak streaks it; burst splits it. */
export const Tank: React.FC<{ x: number; y: number; s?: number; brown?: number; leak?: number; burst?: number; t?: number; c?: string }> = ({ x, y, s = 1, brown = 0, leak = 0, burst = 0, t = 0, c = '#4C5866' }) => {
  const body = mixHex(c, '#5A3418', brown);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* the shell (split in two halves when it bursts) */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * burst * 160} 0) rotate(${side * burst * 14} ${side * 200} 400)`}>
          <path d={side < 0 ? 'M -200 0 L 0 0 L 0 400 L -200 400 Z' : 'M 0 0 L 200 0 L 200 400 L 0 400 Z'} fill={body} stroke={INK} strokeWidth={6} />
          {[60, 140, 220, 300, 380].map((ry) => (
            <g key={ry}>
              <path d={`M ${side < 0 ? -200 : 0} ${ry} L ${side < 0 ? 0 : 200} ${ry}`} stroke={INK} strokeOpacity={0.4} strokeWidth={3} />
              {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={(side < 0 ? -190 : 10) + k * 34} cy={ry - 8} r={3.5} fill={INK} opacity={0.6} />)}
            </g>
          ))}
        </g>
      ))}
      <path d={`M -210 0 L 0 -70 L 210 0 Z`} fill={body} stroke={INK} strokeWidth={6} transform={`translate(0 ${-burst * 160}) rotate(${burst * 25})`} />
      {/* leaks: dark streaks running down from seams, growing */}
      {leak > 0 ? [[-140, 140], [-40, 220], [70, 60], [150, 300]].map(([lx, ly], i) => (
        <path key={i} d={`M ${lx} ${ly} q 6 ${40 * leak} -2 ${(400 - ly) * clamp(leak * 1.2 - i * 0.1)}`} stroke="#3A1E0A" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.85} />
      )) : null}
      {burst > 0 ? <ellipse cx={0} cy={330} rx={260 * burst} ry={90 * burst} fill="#4A2810" /> : null}
    </g>
  );
};

/** The molasses itself: a glossy brown mass with a curling crest. front = the x (or y) its leading edge has reached. */
export const Molasses: React.FC<{ id: string; top: number; crest?: number; t?: number; x0?: number; x1?: number }> = ({ id, top, crest = 0, t = 0, x0 = -300, x1 = W + 300 }) => {
  const wob = (x: number) => Math.sin(x / 90 + t * 0.15) * 14 + Math.sin(x / 37 - t * 0.2) * 6;
  const xs = Array.from({ length: 30 }, (_, i) => x0 + ((x1 - x0) * i) / 29);
  return (
    <g>
      <defs>
        <linearGradient id={`mo${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A4E1C" />
          <stop offset="35%" stopColor="#4A2208" />
          <stop offset="100%" stopColor="#1E0C02" />
        </linearGradient>
      </defs>
      <path d={`M ${x0} ${H + 300} L ${xs.map((x) => `${x} ${top + wob(x) - crest * Math.exp(-Math.pow((x - W / 2) / 260, 2))}`).join(' L ')} L ${x1} ${H + 300} Z`} fill={`url(#mo${id})`} />
      <path d={`M ${xs.map((x) => `${x} ${top + wob(x) + 18 - crest * Math.exp(-Math.pow((x - W / 2) / 260, 2))}`).join(' L ')}`} stroke="#E8A35A" strokeOpacity={0.5} strokeWidth={6} fill="none" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={200 + i * 330 + Math.sin(t * 0.1 + i) * 30} cy={top + 120 + i * 90} rx={70} ry={10} fill="#C98448" opacity={0.25} />)}
    </g>
  );
};

/** A silhouette with a glowing outline in the scene's light colour (the reference Reels' signature figures). */
export const rimLook = (rim: string, extra?: Look['extra']): Look => ({
  ...COSTEL, skin: INK, skinShade: INK, hand: INK, jacket: INK, jacketShade: INK, accent: INK, limb: INK, line: rim, shoe: INK, hair: INK, face: INK, extra,
});
export const Figure: React.FC<{ x: number; feet: number; s: number; mood: Mood; pose?: Partial<Pose>; extra?: Look['extra'] }> = ({ x, feet, s, mood, pose = {}, extra }) => (
  <g style={{ filter: `drop-shadow(0 0 6px ${MOODS[mood].rim})` }}>
    <Hero look={rimLook(MOODS[mood].rim, extra)} pose={{ ...basePose, x, y: feet - LEG_LEN * s, scale: s, ...pose }} shadow={0} rimId="none" />
  </g>
);

/** Nea Costel standing inside the scene, full figure, the richer drawn host. */
export const Host: React.FC<{ x?: number; feet?: number; s?: number; pose?: Partial<Pose> }> = ({ x = 540, feet = 1700, s = 1.7, pose = {} }) => (
  <Hero look={COSTEL} pose={{ ...basePose, x, y: feet - LEG_LEN * s, scale: s, ...pose }} shadow={0.8} />
);
/** A host close-up: his head at (x, y) and the head scale sc. */
export const HostClose: React.FC<{ x?: number; y?: number; sc?: number; pose?: Partial<Pose> }> = ({ x = 540, y = 760, sc = 3.6, pose = {} }) => (
  <Hero look={COSTEL} pose={{ ...basePose, x, y: y - HEAD.y * sc, scale: sc, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...pose }} shadow={0} />
);

/** The punch title: a slanted, heavy, outlined headline at the top (the references' "400 DE MORȚI"). */
export const Punch: React.FC<{ t: number; lines: string[]; y?: number; size?: number; color?: string }> = ({ t, lines, y = 380, size = 96, color = '#FFFFFF' }) => {
  if (t < 0) return null;
  const s = t < 6 ? 1 + 2.7 * Math.pow(t / 6 - 1, 3) + 1.7 * Math.pow(t / 6 - 1, 2) : 1;
  return (
    // +90: keeps the headline clear of the app header (the top 14% of a Reel)
    <g transform={`translate(${W / 2} ${y + 90}) scale(${s}) skewX(-9)`}>
      {lines.map((l, i) => (
        <text key={i} y={i * size * 1.02} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size} fill={i === lines.length - 1 ? color : '#FFFFFF'}
          stroke="#140A12" strokeWidth={size * 0.15} strokeLinejoin="round" paintOrder="stroke">{l}</text>
      ))}
    </g>
  );
};

/** An icon card: a big rounded panel that pops in, for numbers and objects. */
export const popIn = (t: number, d = 7) => (t <= 0 ? 0 : t >= d ? 1 : 1 + 2.7 * Math.pow(t / d - 1, 3) + 1.7 * Math.pow(t / d - 1, 2));
export const BigNumber: React.FC<{ t: number; text: string; sub?: string; y?: number; color?: string }> = ({ t, text, sub, y = 760, color = '#FFD23F' }) => (
  <g transform={`translate(${W / 2} ${y}) scale(${popIn(t)})`}>
    <text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={220} fill={color} stroke="#140A12" strokeWidth={26} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    {sub ? <text y={110} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={64} fill="#FFFFFF" stroke="#140A12" strokeWidth={12} paintOrder="stroke">{sub}</text> : null}
  </g>
);

export const Calendar: React.FC<{ t: number; day: string; month: string; year?: string; x?: number; y?: number }> = ({ t, day, month, year, x = 540, y = 760 }) => (
  <g transform={`translate(${x} ${y}) scale(${popIn(t) * 1.5}) rotate(-4)`}>
    <rect x={-150} y={-170} width={300} height={330} rx={26} fill="#FFF8EA" stroke={INK} strokeWidth={8} />
    <rect x={-150} y={-170} width={300} height={90} rx={26} fill="#C8402E" stroke={INK} strokeWidth={8} />
    <text y={-108} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={54} fill="#FFF">{month}</text>
    <text y={70} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={170} fill={INK}>{day}</text>
    {year ? <text y={140} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={44} fill="#6A5A50">{year}</text> : null}
  </g>
);

export const Clock: React.FC<{ t: number; h: number; m: number; x?: number; y?: number; tick?: number }> = ({ t, h, m, x = 540, y = 760, tick = 0 }) => {
  const mm = m + tick;
  return (
    <g transform={`translate(${x} ${y}) scale(${popIn(t) * 1.6})`}>
      <circle r={180} fill="#FFF8EA" stroke={INK} strokeWidth={12} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-5} y={-168} width={10} height={i % 3 ? 18 : 32} fill={INK} transform={`rotate(${i * 30})`} />)}
      <rect x={-8} y={-100} width={16} height={110} rx={8} fill={INK} transform={`rotate(${(h % 12) * 30 + mm * 0.5})`} />
      <rect x={-5} y={-150} width={10} height={160} rx={5} fill="#C8402E" transform={`rotate(${mm * 6})`} />
      <circle r={14} fill={INK} />
    </g>
  );
};

export const Thermometer: React.FC<{ t: number; k: number; x?: number; y?: number }> = ({ t, k, x = 540, y = 820 }) => {
  const level = lerp(0.12, 0.72, k);
  const col = k < 0.5 ? '#4FA8FF' : '#FF5A3C';
  return (
    <g transform={`translate(${x} ${y}) scale(${popIn(t) * 1.4})`}>
      <rect x={-50} y={-330} width={100} height={500} rx={50} fill="#FFF8EA" stroke={INK} strokeWidth={10} />
      <circle cx={0} cy={220} r={90} fill={col} stroke={INK} strokeWidth={10} />
      <rect x={-26} y={170 - 470 * level} width={52} height={470 * level + 40} rx={26} fill={col} />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={50} y={-290 + i * 56} width={i % 2 ? 22 : 40} height={8} fill={INK} />)}
    </g>
  );
};

/** Sparks and a "pop" flash at a point, for rivets bursting. */
export const Sparks: React.FC<{ x: number; y: number; t: number; seed?: number }> = ({ x, y, t, seed = 0 }) => {
  if (t < 0 || t > 10) return null;
  const k = t / 10;
  return (
    <g>
      <circle cx={x} cy={y} r={40 * (1 - k) + 10} fill="#FFF2B0" opacity={1 - k} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + seed;
        const r1 = 20 + 120 * k, r0 = 10 + 70 * k;
        return <path key={i} d={`M ${x + Math.cos(a) * r0} ${y + Math.sin(a) * r0} L ${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1}`} stroke="#FFC24A" strokeWidth={8} strokeLinecap="round" opacity={1 - k} />;
      })}
    </g>
  );
};

/** Comic sound word, like the references' "PAF!". */
export const Sfx: React.FC<{ t: number; text: string; x: number; y: number; rot?: number; size?: number }> = ({ t, text, x, y, rot = -8, size = 110 }) => {
  if (t < 0 || t > 40) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${popIn(t, 5)})`}>
      <text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size} fill="#FFD23F" stroke="#140A12" strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

export { clamp, lerp, easeOut, Glow, INK, COSTEL };
