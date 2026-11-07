import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, Glow } from '../molasses/kit';
import words from './words.json';

// "What if your mom gave you 10 seconds of games?" A blocky-game What If Short, drawn natively in 1080 x 1920:
// thick dark outlines, flat colour with one soft shade, cube-headed characters with big expressive faces,
// a countdown HUD on every shot, "SECOND N" badges on a green burst, fast cuts and punch zooms.
// Original characters and an invented game ("Block Quest"); no real game's brand, logo or avatars.

type S = React.FC<ShotProps>;
const OL = '#1A1424';
const SW = 9;

// ---------------------------------------------------------------- the countdown, from the voice's own words
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const T = { s10: at('Second', 1), s9: at('Second', 2), s8: at('Second', 3), s7: at('Second', 4), three: at('Three'), two: at('Two'), plus: at('Plus'), not: at('Not'), comment: at('Comment') };
const timerAt = (sec: number) => {
  if (sec < T.s9) return 10; if (sec < T.s8) return 9; if (sec < T.s7) return 8;
  if (sec < T.s7 + 2.2) return 7; if (sec < T.three) return 6 - Math.min(2, Math.floor((sec - T.s7 - 2.2) / 1.3));
  if (sec < T.two) return 3; if (sec < T.plus) return 2; return 12;
};
/** The timer pill at the top of every shot (turns red at 3 and below, pops when it changes). */
const Timer: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, v = timerAt(sec), low = v <= 3;
  const changed = [T.s9, T.s8, T.s7, T.three, T.two, T.plus].some((c) => sec >= c && sec < c + 0.2);
  const s = changed ? 1.18 : 1;
  return (
    <g transform={`translate(540 330) scale(${s})`}>
      <rect x={-118} y={-44} width={236} height={88} rx={44} fill={low ? '#E2262E' : '#1A1424'} opacity={0.92} stroke="#FFFFFF" strokeWidth={low ? 6 : 0} />
      <circle cx={-66} cy={0} r={22} fill="none" stroke="#FFFFFF" strokeWidth={7} /><path d="M -66 -12 L -66 0 L -56 8" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
      <text x={26} y={18} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={54} fill="#FFFFFF">{`0:${String(v).padStart(2, '0')}`}</text>
    </g>
  );
};

// ---------------------------------------------------------------- characters
type Face = 'smirk' | 'tongue' | 'shock' | 'worried' | 'grin' | 'happy' | 'sleepy' | 'angry' | 'yell' | 'despair' | 'determined' | 'starry';
/** A cube head with a 3D side, a face and hair (kid: brown cap; mom: curlers and a bun). */
const CubeHead: React.FC<{ face: Face; skin?: string; hair: 'kid' | 'mom' | 'boss'; t: number }> = ({ face, skin = '#F4E2CC', hair, t }) => {
  const blink = Math.sin(t * 0.11) > 0.985 && face !== 'shock' && face !== 'yell';
  const eye = (cx: number, sd: number) => {
    if (face === 'sleepy' || blink) return <path d={`M ${cx - 30} -10 Q ${cx} 6 ${cx + 30} -10`} stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />;
    if (face === 'despair') return <path d={`M ${cx - 28} -18 L ${cx + 28} 4 M ${cx + 28} -18 L ${cx - 28} 4`} stroke={OL} strokeWidth={8} strokeLinecap="round" />;
    const big = face === 'shock' || face === 'yell' || face === 'starry';
    const r = big ? 34 : 28;
    const nar = face === 'smirk' || face === 'tongue' || face === 'determined' || face === 'angry';
    return (
      <g>
        <ellipse cx={cx} cy={-6} rx={r} ry={nar ? r * 0.62 : r} fill="#FFFFFF" stroke={OL} strokeWidth={6} />
        {face === 'starry' ? <path d={`M ${cx} ${-30} l 8 16 l 18 2 l -13 12 l 4 18 l -17 -9 l -17 9 l 4 -18 l -13 -12 l 18 -2 Z`} fill="#FFC21A" stroke={OL} strokeWidth={3} />
          : <g><circle cx={cx + sd * 4} cy={-4} r={big ? 12 : 17} fill={OL} /><circle cx={cx + sd * 4 + 6} cy={-10} r={5} fill="#FFFFFF" /><circle cx={cx + sd * 4 - 5} cy={2} r={2.5} fill="#7FE0FF" /></g>}
      </g>
    );
  };
  const brow = (cx: number, sd: number) => {
    const a = face === 'angry' || face === 'determined' || face === 'smirk' || face === 'tongue' ? 16 * sd : face === 'worried' || face === 'despair' ? -14 * sd : 0;
    return <path d={`M ${cx - 32} ${-58 - (face === 'shock' ? 16 : 0)} L ${cx + 32} ${-58 - (face === 'shock' ? 16 : 0)}`} stroke={OL} strokeWidth={10} strokeLinecap="round" transform={`rotate(${a} ${cx} -58)`} />;
  };
  const mouth = {
    smirk: <path d="M -36 70 Q 10 92 50 58" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />,
    tongue: <g><path d="M -40 66 Q 6 96 48 60" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" /><path d="M 2 82 Q 10 116 30 104 Q 40 92 34 76 Z" fill="#F07A8A" stroke={OL} strokeWidth={6} /></g>,
    shock: <ellipse cx={0} cy={78} rx={26} ry={34} fill="#5A1A24" stroke={OL} strokeWidth={7} />,
    worried: <path d="M -36 84 Q -18 70 0 82 Q 18 94 36 80" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />,
    grin: <path d="M -50 60 Q 0 120 50 60 Z" fill="#FFFFFF" stroke={OL} strokeWidth={7} strokeLinejoin="round" />,
    happy: <path d="M -40 62 Q 0 100 40 62" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />,
    sleepy: <path d="M -20 76 Q 0 86 20 76" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />,
    angry: <path d="M -40 84 Q 0 62 40 84" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />,
    yell: <path d="M -50 56 Q 0 54 50 56 Q 40 130 0 132 Q -40 130 -50 56 Z" fill="#5A1A24" stroke={OL} strokeWidth={7} />,
    despair: <path d="M -46 96 Q 0 52 46 96 Z" fill="#5A1A24" stroke={OL} strokeWidth={7} />,
    determined: <path d="M -36 76 L 36 72" stroke={OL} strokeWidth={8} strokeLinecap="round" />,
    starry: <path d="M -50 60 Q 0 124 50 60 Z" fill="#5A1A24" stroke={OL} strokeWidth={7} />,
  }[face];
  return (
    <g>
      {hair === 'mom' ? <g>
        <circle cx={0} cy={-210} r={70} fill="#8A4A2A" stroke={OL} strokeWidth={SW} />
        {[-120, -40, 40, 120].map((x, i) => <g key={i}><rect x={x - 28} y={-190} width={56} height={48} rx={20} fill="#F28AB8" stroke={OL} strokeWidth={6} /><path d={`M ${x - 18} -166 L ${x + 18} -166`} stroke={OL} strokeWidth={4} /></g>)}
      </g> : null}
      {hair === 'boss' ? <path d="M -140 -150 L -150 -260 L -80 -200 L 0 -280 L 80 -200 L 150 -260 L 140 -150 Z" fill="#FFC21A" stroke={OL} strokeWidth={SW} strokeLinejoin="round" /> : null}
      {/* the cube: front face and a shaded right side for depth */}
      <path d="M 150 -150 L 186 -126 L 186 150 L 150 170 Z" fill={skin} stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M 150 -150 L 186 -126 L 186 150 L 150 170 Z" fill="#000" opacity={0.18} />
      <rect x={-160} y={-160} width={310} height={330} rx={46} fill={skin} stroke={OL} strokeWidth={SW} />
      <rect x={-130} y={60} width={250} height={90} rx={30} fill="#000" opacity={0.05} />
      {hair === 'kid' ? <g>
        <path d="M -172 -40 Q -182 -190 -10 -196 Q 170 -196 190 -60 L 150 -96 Q 130 -60 90 -110 Q 40 -60 -10 -112 Q -60 -60 -100 -110 Q -130 -60 -172 -40 Z" fill="#9A5A2E" stroke={OL} strokeWidth={SW} strokeLinejoin="round" />
        {[-110, -40, 30, 100].map((x) => <path key={x} d={`M ${x - 20} -170 q 20 -12 40 0`} stroke="#C88A52" strokeWidth={6} fill="none" strokeLinecap="round" />)}
      </g> : null}
      {hair === 'mom' ? <path d="M -168 -60 Q -170 -170 0 -172 Q 170 -170 186 -60 L 150 -100 Q 0 -150 -130 -100 Z" fill="#8A4A2A" stroke={OL} strokeWidth={SW} strokeLinejoin="round" /> : null}
      {brow(-62, -1)}{brow(62, 1)}
      {eye(-62, 1)}{eye(62, 1)}
      {face !== 'sleepy' && face !== 'despair' ? <g><circle cx={-100} cy={40} r={18} fill="#F28A8A" opacity={0.35} /><circle cx={100} cy={40} r={18} fill="#F28A8A" opacity={0.35} /></g> : null}
      {mouth}
      {face === 'worried' || face === 'despair' ? <path d="M 130 -60 Q 150 -20 136 -4 Q 120 -20 130 -60 Z" fill="#7FD0FF" stroke={OL} strokeWidth={4} /> : null}
    </g>
  );
};
type Pose = { armL?: number; armR?: number; legL?: number; legR?: number; lean?: number };
/** A blocky body under a cube head. kind: kid (red bolt shirt), mom (purple robe), boss (giant). */
const Blocky: React.FC<{ x: number; y: number; s: number; kind: 'kid' | 'mom' | 'boss'; face: Face; t: number; pose?: Pose; flip?: boolean; extra?: React.ReactNode }> = ({ x, y, s, kind, face, t, pose = {}, flip, extra }) => {
  const shirt = kind === 'kid' ? '#D8323A' : kind === 'mom' ? '#9A7AD8' : '#6A4AC8';
  const pants = kind === 'kid' ? '#3A5AB8' : kind === 'mom' ? '#9A7AD8' : '#5A5A6A';
  const skin = kind === 'boss' ? '#FF9A3A' : '#F4E2CC';
  const breathe = Math.sin(t * 0.12) * 4;
  const arm = (sx: number, a: number) => (
    <g transform={`translate(${sx} -560) rotate(${a})`}>
      <rect x={-48} y={-10} width={96} height={250} rx={22} fill={shirt} stroke={OL} strokeWidth={SW} />
      <rect x={-46} y={170} width={92} height={90} rx={22} fill={skin} stroke={OL} strokeWidth={SW} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${pose.lean ?? 0})`}>
      <ellipse cx={0} cy={6} rx={200} ry={26} fill="#000" opacity={0.22} />
      {[[-62, pose.legL ?? 0], [62, pose.legR ?? 0]].map(([lx, a], i) => (
        <g key={i} transform={`translate(${lx} -300) rotate(${a})`}><rect x={-56} y={0} width={112} height={300} rx={18} fill={pants} stroke={OL} strokeWidth={SW} /><rect x={-60} y={262} width={120} height={44} rx={16} fill="#2A2234" stroke={OL} strokeWidth={6} /></g>
      ))}
      {arm(-170, pose.armL ?? 8)}
      <g transform={`translate(0 ${breathe})`}>
        <rect x={-130} y={-600} width={260} height={320} rx={30} fill={shirt} stroke={OL} strokeWidth={SW} />
        {kind === 'kid' ? <path d="M 20 -560 L -40 -440 L 6 -440 L -20 -330 L 50 -470 L 6 -470 L 30 -560 Z" fill="#F4E2CC" stroke={OL} strokeWidth={6} strokeLinejoin="round" /> : null}
        {kind === 'mom' ? <g><path d="M -10 -600 L -40 -280 M 10 -600 L 40 -280" stroke="#7A5AB8" strokeWidth={10} /><circle cx={0} cy={-420} r={16} fill="#F28AB8" stroke={OL} strokeWidth={5} /></g> : null}
        <g transform="translate(0 -790)"><CubeHead face={face} hair={kind} skin={skin} t={t} /></g>
      </g>
      {arm(170, -(pose.armR ?? 8))}
      {extra}
    </g>
  );
};

// ---------------------------------------------------------------- sets and props
const Bedroom: React.FC<{ t: number; dark?: number }> = ({ t, dark = 0 }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#2A2458" />
    <rect x={-300} y={1380} width={W + 600} height={900} fill="#5A3A2A" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-300} y={1400 + i * 70} width={W + 600} height={6} fill="#4A2E20" />)}
    {/* the window with the moon and stars */}
    <rect x={60} y={420} width={330} height={400} rx={14} fill="#1A1A48" stroke={OL} strokeWidth={SW} />
    <path d="M 225 420 L 225 820 M 60 620 L 390 620" stroke={OL} strokeWidth={10} />
    <path d="M 290 480 A 46 46 0 1 0 330 560 A 38 38 0 1 1 290 480 Z" fill="#FFF2B0" />
    {[[110, 470], [170, 690], [330, 720], [140, 580]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 + (i % 2) * 2} fill="#FFFFFF" opacity={0.6 + 0.4 * Math.sin(t * 0.2 + i)} />)}
    <path d="M 30 400 L 30 880 L 110 880 Q 80 640 110 400 Z" fill="#2AB8A8" stroke={OL} strokeWidth={8} />
    {/* a poster and the door */}
    <rect x={480} y={460} width={150} height={190} rx={8} fill="#4AC86A" stroke={OL} strokeWidth={8} transform="rotate(5 555 555)" />
    <rect x={760} y={560} width={260} height={820} rx={10} fill="#3A2E6A" stroke={OL} strokeWidth={SW} />
    <path d="M 790 1380 L 1060 1960 L 700 1960 Z" fill="#FFE8A0" opacity={0.18} />
    {/* bed with a checker blanket */}
    <rect x={-40} y={1180} width={720} height={300} rx={20} fill="#6A3A2A" stroke={OL} strokeWidth={SW} />
    <g>{Array.from({ length: 24 }, (_, i) => <rect key={i} x={-20 + (i % 8) * 86} y={1150 + Math.floor(i / 8) * 80} width={86} height={80} fill={(i + Math.floor(i / 8)) % 2 ? '#E2804A' : '#2AA89A'} />)}</g>
    <rect x={-20} y={1150} width={688} height={240} fill="none" stroke={OL} strokeWidth={SW} />
    {/* bedside table, lamp, alarm clock */}
    <rect x={640} y={1180} width={160} height={200} rx={10} fill="#8A5A3A" stroke={OL} strokeWidth={8} />
    <ellipse cx={540} cy={1700} rx={360} ry={90} fill="#2AA8A0" stroke={OL} strokeWidth={8} opacity={0.85} />
    {dark ? <rect x={-300} y={-300} width={W + 600} height={2600} fill="#0A0620" opacity={dark} /> : null}
  </g>
);
const Burst: React.FC<{ t: number; c1: string; c2: string; cx?: number; cy?: number }> = ({ t, c1, c2, cx = 540, cy = 860 }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill={c1} />
    <g transform={`translate(${cx} ${cy}) rotate(${t * 0.8})`}>{Array.from({ length: 18 }, (_, i) => <path key={i} d="M 0 0 L -90 -1600 L 90 -1600 Z" fill={c2} transform={`rotate(${i * 20})`} />)}</g>
    <Glow x={cx} y={cy} r={700} kind="warm" o={0.6} />
  </g>
);
const Sparkles: React.FC<{ t: number; n?: number; seed?: string }> = ({ t, n = 10, seed = 's' }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const x = random(`${seed}x${i}`) * W, y = 500 + random(`${seed}y${i}`) * 1100, k = Math.abs(Math.sin(t * 0.15 + i));
    return <path key={i} d={`M ${x} ${y - 30 * k} L ${x + 8 * k} ${y} L ${x} ${y + 30 * k} L ${x - 8 * k} ${y} Z`} fill="#FFF6C0" />;
  })}</g>
);
const SecondBadge: React.FC<{ t: number; n: number }> = ({ t, n }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <g transform={`translate(540 860) scale(${popIn(t, 6) * 1.25}) rotate(${-4 + Math.sin(t * 0.3) * 2})`}>
      <rect x={-260} y={-170} width={520} height={340} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-236} y={-146} width={472} height={292} rx={44} fill="none" stroke="#2EA84A" strokeWidth={14} />
      <text y={-70} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={60} fill={OL}>SECOND</text>
      <circle cx={-120} cy={50} r={64} fill="#2EA84A" stroke={OL} strokeWidth={10} /><circle cx={-120} cy={50} r={36} fill="none" stroke="#FFFFFF" strokeWidth={10} /><path d="M -120 26 L -120 50 L -104 62" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
      <text x={70} y={110} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={210} fill="#2EA84A" stroke={OL} strokeWidth={14} paintOrder="stroke">{n}</text>
    </g>
  </g>
);
const Sky: React.FC<{ c?: string }> = ({ c = '#7ACCF2' }) => (
  <g><rect x={-300} y={-300} width={W + 600} height={2600} fill={c} />
    {[[180, 520], [820, 420], [600, 700]].map(([x, y], i) => <g key={i} fill="#FFFFFF"><rect x={x - 80} y={y} width={160} height={50} rx={10} /><rect x={x - 40} y={y - 40} width={90} height={50} rx={10} /></g>)}
  </g>
);
const Lava: React.FC<{ t: number }> = ({ t }) => (
  <g><rect x={-300} y={1300} width={W + 600} height={1000} fill="#FF5A1A" />
    {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={(i * 150 + t * 3) % 1400 - 150} cy={1340 + (i % 3) * 120} rx={60} ry={14} fill="#FFC21A" opacity={0.7} />)}
    <rect x={-300} y={1300} width={W + 600} height={12} fill="#FFD24A" /></g>
);
const Block: React.FC<{ x: number; y: number; w?: number; c: string }> = ({ x, y, w = 150, c }) => (
  <g><path d={`M ${x - w / 2} ${y} L ${x - w / 2 + 20} ${y - 30} L ${x + w / 2 + 20} ${y - 30} L ${x + w / 2} ${y} Z`} fill={c} stroke={OL} strokeWidth={6} />
    <rect x={x - w / 2} y={y} width={w} height={60} fill={c} stroke={OL} strokeWidth={6} /><rect x={x - w / 2} y={y} width={w} height={60} fill="#000" opacity={0.15} /></g>
);
const Flag: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g><rect x={x - 6} y={y - 260} width={12} height={260} fill="#E8E8F0" stroke={OL} strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={x + 6 + (i % 4) * 34} y={y - 256 + Math.floor(i / 4) * 34} width={34} height={34} fill={(i + Math.floor(i / 4)) % 2 ? '#FFFFFF' : OL} />)}</g>
);
const Banner: React.FC<{ t: number; text: string; y?: number; c?: string }> = ({ t, text, y = 520, c = '#2E6AE8' }) => (
  <g transform={`translate(540 ${y}) scale(${popIn(t, 6)})`}>
    <rect x={-260} y={-54} width={520} height={108} rx={54} fill={c} stroke={OL} strokeWidth={10} />
    <text y={22} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={62} fill="#FFFFFF">{text}</text>
  </g>
);
const Confetti: React.FC<{ t: number; seed?: string }> = ({ t, seed = 'c' }) => (
  <g>{Array.from({ length: 40 }, (_, i) => {
    const x = random(`${seed}${i}`) * W, y = -100 + ((t * (8 + random(`${seed}v${i}`) * 8) + random(`${seed}y${i}`) * 1600) % 1900);
    return <rect key={i} x={x} y={y} width={18} height={30} fill={['#FFC21A', '#2EA84A', '#E2262E', '#2E6AE8', '#F28AB8'][i % 5]} transform={`rotate(${t * 6 + i * 40} ${x} ${y})`} />;
  })}</g>
);
const Gem: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -40 -20 L -20 -44 L 20 -44 L 40 -20 L 0 40 Z" fill="#3AD8E8" stroke={OL} strokeWidth={6} strokeLinejoin="round" /><path d="M -40 -20 L 40 -20 M -20 -44 L 0 -20 L 20 -44 M 0 -20 L 0 40" stroke="#1A8AA8" strokeWidth={4} fill="none" /></g>
);
const Card: React.FC<{ t: number; title: string; big: string; btn: string; ok?: boolean }> = ({ t, title, big, btn, ok }) => (
  <g transform={`translate(540 860) scale(${popIn(t, 6) * 1.2})`}>
    <rect x={-300} y={-330} width={600} height={660} rx={40} fill="#1E1A2E" stroke="#FFC21A" strokeWidth={12} />
    <text y={-250} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={46} fill="#B8B0D8">{title}</text>
    <circle cx={0} cy={-90} r={110} fill="#FFC21A" stroke={OL} strokeWidth={10} /><circle cx={0} cy={-90} r={66} fill="none" stroke="#FFFFFF" strokeWidth={14} /><path d="M 0 -130 L 0 -90 L 28 -70" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" />
    <text y={90} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={90} fill="#FFFFFF">{big}</text>
    <rect x={-200} y={160} width={400} height={110} rx={30} fill={ok ? '#2EA84A' : '#2E6AE8'} stroke={OL} strokeWidth={8} />
    <text y={234} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={60} fill="#FFFFFF">{btn}</text>
  </g>
);
const hud = (f: number) => <Timer f={f} />;

// ---------------------------------------------------------------- shots
export const S1: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={320} y={1420} s={0.62} kind="kid" face="happy" t={t} pose={{ armL: 40, armR: 40 }} extra={<rect x={-130} y={-430} width={260} height={160} rx={16} fill="#2A2234" stroke={OL} strokeWidth={8} />} />
    <Blocky x={880} y={1400} s={0.58} kind="mom" face="sleepy" t={t} flip pose={{ armR: 70 }} />
    {hud(f)}
  </g>
);
export const S2: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={560} y={1748} s={1.15} kind="mom" face="smirk" t={t} pose={{ armR: 95 }} />
    <g transform={`translate(860 ${900 + Math.sin(t * 0.4) * 6}) scale(${popIn(t - 4)})`}><circle r={110} fill="#E2262E" stroke={OL} strokeWidth={10} /><circle r={80} fill="#FFF8EA" stroke={OL} strokeWidth={6} /><text y={22} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={64} fill={OL}>0:10</text></g>
    {hud(f)}
  </g>
);
export const S3: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1842} s={1.4} kind="kid" face="shock" t={t} />
    {hud(f)}
  </g>
);
export const S4: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#2A2458" c2="#3A3478" />
    <g transform={`translate(540 880) scale(${popIn(t) * 1.3}) rotate(-4)`}>
      <rect x={-300} y={-200} width={600} height={400} rx={40} fill="#2A2234" stroke={OL} strokeWidth={12} />
      <rect x={-260} y={-160} width={520} height={320} rx={20} fill="#4AC86A" />
      <Block x={-120} y={60} c="#FFC21A" /><Block x={100} y={0} c="#E2262E" w={120} />
      <text y={-70} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={64} fill="#FFFFFF" stroke={OL} strokeWidth={10} paintOrder="stroke">BLOCK QUEST</text>
    </g>
    {hud(f)}
  </g>
);
export const S5: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1814} s={1.3} kind="mom" face="smirk" t={t} pose={{ armR: 110 }} />
    {hud(f)}
  </g>
);
export const S6: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1814} s={1.3} kind="mom" face="angry" t={t} pose={{ armR: 140, lean: -4 }} />
    {hud(f)}
  </g>
);
export const S7: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1870} s={1.5} kind="kid" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
    {hud(f)}
  </g>
);
export const S8: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1814} s={1.3} kind="kid" face="smirk" t={t} pose={{ armL: 60, armR: 60 }} />
    {hud(f)}
  </g>
);
export const S9: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} dark={0.3} />
    <Blocky x={540} y={1915} s={1.75} kind="kid" face="determined" t={t} />
    {hud(f)}
  </g>
);
export const S10: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#0E3A3A" c2="#145A50" />
    {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M 540 900 L ${540 + Math.cos(i) * 1500} ${900 + Math.sin(i) * 1500}`} stroke="#7AFFE0" strokeWidth={3} opacity={0.25} />)}
    <Blocky x={540} y={2138} s={2.1} kind="kid" face="tongue" t={t} />
    {hud(f)}
  </g>
);
const badge = (n: number): S => ({ t, f }) => <g><SecondBadge t={t} n={n} />{hud(f)}</g>;
export const S11 = badge(10);
const path = [[160, 1250], [330, 1150], [500, 1060], [680, 980], [860, 900], [980, 820]];
const blocks = (t: number) => path.map(([x, y], i) => <Block key={i} x={x} y={y} w={130} c={['#FFC21A', '#E2262E', '#2E6AE8', '#2EA84A', '#F28AB8', '#9A7AD8'][i]} />);
export const S12: S = ({ t, f }) => (
  <g>
    <Sky /><Lava t={t} />{blocks(t)}<Flag x={1000} y={820} />
    <Blocky x={160} y={1250} s={0.3} kind="kid" face="determined" t={t} />
    <Banner t={t - 2} text="LEVEL 1 / 100" y={520} />
    {hud(f)}
  </g>
);
export const S13: S = ({ t, f, len }) => {
  const k = easeOut(clamp(t / Math.max(1, len)));
  const x = lerp(160, 980, k), y = lerp(1250, 820, k) - Math.sin(k * Math.PI) * 500;
  return (
    <g>
      <Sky /><Lava t={t} />{blocks(t)}<Flag x={1000} y={820} />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={lerp(160, 980, Math.max(0, k - i * 0.04))} cy={lerp(1250, 820, Math.max(0, k - i * 0.04)) - Math.sin(Math.max(0, k - i * 0.04) * Math.PI) * 500 - 120} r={30 - i * 3} fill="#FFFFFF" opacity={0.5 - i * 0.05} />)}
      <Blocky x={x} y={y} s={0.3} kind="kid" face="tongue" t={t} pose={{ armL: 150, armR: 150, legL: 30, legR: -30, lean: 20 }} />
      {hud(f)}
    </g>
  );
};
export const S14: S = ({ t, f }) => (
  <g>
    <Sky /><Lava t={t} />
    <Block x={540} y={1250} w={520} c="#FFC21A" /><Flag x={760} y={1250} />
    <Blocky x={460} y={1250} s={0.55} kind="kid" face="grin" t={t} pose={{ armL: 160, armR: 40 }} />
    <Banner t={t - 1} text="LEVEL 100 ✓" y={540} c="#2EA84A" />
    <Confetti t={t} />
    {hud(f)}
  </g>
);
export const S15 = badge(9);
const Storm: React.FC<{ t: number }> = ({ t }) => (
  <g><rect x={-300} y={-300} width={W + 600} height={2600} fill="#3A2468" />
    {[[200, 500], [700, 420], [450, 640]].map(([x, y], i) => <g key={i} fill="#4A3488" stroke={OL} strokeWidth={6}><ellipse cx={x} cy={y} rx={220} ry={70} /><ellipse cx={x + 80} cy={y - 40} rx={120} ry={60} /></g>)}
    <rect x={-300} y={1300} width={W + 600} height={900} fill="#2A1A48" /><rect x={-300} y={1300} width={W + 600} height={14} fill="#9A7AFF" /></g>
);
export const S16: S = ({ t, f }) => (
  <g>
    <Storm t={t} />
    {t % 8 < 4 ? <path d="M 620 300 L 520 700 L 600 700 L 480 1300 L 680 640 L 590 640 L 700 300 Z" fill="#FFF6C0" stroke="#FFFFFF" strokeWidth={6} /> : null}
    <Blocky x={240} y={1300} s={0.35} kind="kid" face="worried" t={t} />
    {hud(f)}
  </g>
);
const BossBar: React.FC<{ hp: number }> = ({ hp }) => (
  <g transform="translate(540 470)"><text x={-300} y={-20} fontFamily={FONT.title} fontWeight={800} fontSize={44} fill="#FFFFFF">♛ BLOCK BOSS</text>
    <rect x={-300} y={0} width={600} height={40} rx={20} fill="#1A1424" stroke="#FFFFFF" strokeWidth={4} /><rect x={-296} y={4} width={592 * hp} height={32} rx={16} fill="#E2262E" /></g>
);
export const S17: S = ({ t, f }) => (
  <g>
    <Storm t={t} />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={560 + Math.sin(i * 2) * 160} cy={1260 - (t * 4 + i * 60) % 400} r={90 + i * 10} fill="#2A1A48" opacity={0.7} />)}
    <Blocky x={600} y={lerp(1700, 1300, easeOut(clamp(t / 12)))} s={1.0} kind="boss" face="yell" t={t} pose={{ armL: 140, armR: 140 }} />
    <Blocky x={170} y={1300} s={0.3} kind="kid" face="smirk" t={t} />
    <BossBar hp={1} />
    {hud(f)}
  </g>
);
export const S18: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#5A1A24" c2="#7A2A30" />
    <Blocky x={540} y={1948} s={1.6} kind="kid" face="determined" t={t} pose={{ armR: lerp(20, 120, clamp(t / 10)) }} />
    {hud(f)}
  </g>
);
export const S19: S = ({ t, f }) => (
  <g>
    <Storm t={t} />
    <g transform={`translate(${lerp(640, 900, easeOut(clamp(t / 10)))} ${lerp(1300, 600, easeOut(clamp(t / 10)))}) rotate(${t * 6})`}><Blocky x={0} y={0} s={0.9} kind="boss" face="shock" t={t} /></g>
    <Blocky x={340} y={1300} s={0.5} kind="kid" face="angry" t={t} pose={{ armR: 95, lean: 8 }} />
    <g transform={`translate(560 1000) scale(${popIn(t, 4)})`}>{Array.from({ length: 12 }, (_, i) => <path key={i} d="M 0 0 L -30 -260 L 30 -260 Z" fill="#FFF6C0" transform={`rotate(${i * 30})`} />)}<circle r={90} fill="#FFFFFF" /></g>
    <BossBar hp={Math.max(0, 1 - t / 8)} />
    {hud(f)}
  </g>
);
export const S20: S = ({ t, f }) => (
  <g>
    <Sky c="#6AB8F2" />
    <circle cx={720} cy={540} r={20 + Math.sin(t) * 6} fill="#FFFFFF" />
    <g transform={`translate(540 860) scale(${popIn(t, 5) * 1.4}) rotate(-6)`}><rect x={-220} y={-110} width={440} height={220} rx={50} fill="#E2262E" stroke={OL} strokeWidth={14} /><text y={60} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={170} fill="#FFFFFF" stroke={OL} strokeWidth={12} paintOrder="stroke">K.O.</text></g>
    <Blocky x={540} y={1500} s={0.4} kind="kid" face="grin" t={t} pose={{ armL: 160, armR: 160 }} />
    {hud(f)}
  </g>
);
export const S21 = badge(8);
export const S22: S = ({ t, f }) => (
  <g>
    <Sky />
    <rect x={-300} y={1300} width={W + 600} height={900} fill="#5AC86A" />
    {Array.from({ length: 16 }, (_, i) => <Gem key={i} x={200 + (i % 8) * 90} y={lerp(-100, 1200 - Math.floor(i / 8) * 60, easeOut(clamp((t - i) / 10)))} s={0.9} />)}
    <Blocky x={540} y={1400} s={0.45} kind="kid" face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
    {hud(f)}
  </g>
);
export const S23: S = ({ t, f }) => {
  const n = Math.round(lerp(0, 999999999, easeOut(clamp(t / 14))));
  return (
    <g>
      <Burst t={t} c1="#D89A1A" c2="#F2B83A" />
      {Array.from({ length: 50 }, (_, i) => <Gem key={i} x={80 + (i * 97) % 940} y={1500 - Math.floor(i / 10) * 70 + (i % 2) * 20} s={1.1} />)}
      <g transform={`translate(540 560) scale(${popIn(t)})`}><rect x={-380} y={-70} width={760} height={140} rx={70} fill="#1A1424" stroke="#FFC21A" strokeWidth={10} /><Gem x={-300} y={0} s={0.9} />
        <text x={40} y={28} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={84} fill="#FFC21A">{n.toLocaleString('en-US')}</text></g>
      {hud(f)}
    </g>
  );
};
export const S24 = badge(7);
const ITEMS = ['WINGS', 'RAINBOW', 'FIRE', 'JETPACK', 'SPEED', 'TOASTER'];
export const S25: S = ({ t, f }) => (
  <g>
    <Sky c="#8AD0F8" />
    <g transform={`translate(540 860) scale(${popIn(t) * 1.15})`}>
      <rect x={-400} y={-400} width={800} height={800} rx={40} fill="#1E1A2E" stroke={OL} strokeWidth={12} />
      <text y={-320} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={62} fill="#FFC21A">SHOP</text>
      {ITEMS.map((it, i) => {
        const x = -250 + (i % 3) * 250, y = -170 + Math.floor(i / 3) * 300, owned = t > 3 + i * 3;
        return <g key={it}><rect x={x - 110} y={y - 110} width={220} height={260} rx={24} fill="#2E2A48" stroke={owned ? '#2EA84A' : '#4A4468'} strokeWidth={8} />
          <text x={x} y={y + 110} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={30} fill="#FFFFFF">{it}</text>
          {owned ? <g transform={`translate(${x} ${y}) scale(${popIn(t - 3 - i * 3, 4)}) rotate(-12)`}><rect x={-96} y={-32} width={192} height={64} rx={14} fill="#2EA84A" stroke={OL} strokeWidth={6} /><text y={16} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={40} fill="#FFFFFF">OWNED</text></g> : <Gem x={x} y={y - 10} s={0.8} />}</g>;
      })}
    </g>
    {hud(f)}
  </g>
);
export const S26: S = ({ t, f }) => (
  <g>
    <Sky />
    <rect x={-300} y={1300} width={W + 600} height={900} fill="#5AC86A" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -100 ${1080 + i * 22} Q 300 ${1000 + i * 22} 440 ${1060 + i * 22}`} stroke={['#E2262E', '#FF9A1A', '#FFC21A', '#2EA84A', '#2E6AE8', '#9A7AD8'][i]} strokeWidth={22} fill="none" />)}
    <path d="M 360 900 Q 160 700 200 520 Q 330 700 470 820 Z M 720 900 Q 920 700 880 520 Q 750 700 610 820 Z" fill="#FFFFFF" stroke={OL} strokeWidth={8} />
    <Blocky x={540} y={1360} s={0.55} kind="kid" face="grin" t={t} pose={{ armL: 120, armR: 120 }} />
    <Sparkles t={t} />
    {hud(f)}
  </g>
);
export const S27: S = ({ t, f }) => (
  <g>
    <Sky c="#9AD8F8" />
    <rect x={-300} y={1300} width={W + 600} height={900} fill="#5AC86A" />
    <g transform={`translate(540 1200) scale(${popIn(t - 6)})`}>
      <rect x={-260} y={-300} width={520} height={340} rx={60} fill="#D8D8E0" stroke={OL} strokeWidth={12} />
      <rect x={-200} y={-310} width={150} height={40} rx={10} fill="#C8A060" stroke={OL} strokeWidth={6} /><rect x={50} y={-310} width={150} height={40} rx={10} fill="#C8A060" stroke={OL} strokeWidth={6} />
      <rect x={-260} y={-200} width={520} height={30} fill="#E2262E" />
      <path d="M -120 -80 L -60 -80 M 60 -80 L 120 -80" stroke={OL} strokeWidth={12} strokeLinecap="round" /><path d="M -40 -20 L 40 -24" stroke={OL} strokeWidth={10} strokeLinecap="round" />
      <path d="M 160 -130 L 120 -60 L 150 -60 L 120 0 L 190 -90 L 160 -90 Z" fill="#E2262E" stroke={OL} strokeWidth={5} />
    </g>
    {t < 14 ? Array.from({ length: 9 }, (_, i) => <circle key={i} cx={540 + Math.cos(i) * (100 + t * 18)} cy={1050 + Math.sin(i) * (80 + t * 14)} r={110 - t * 4} fill="#FFFFFF" stroke="#E0E0EC" strokeWidth={6} opacity={1 - t / 14} />) : null}
    <g transform={`translate(830 760) rotate(14) scale(${popIn(t - 10, 5)})`}><text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#FFC21A" stroke={OL} strokeWidth={12} paintOrder="stroke">DING!</text></g>
    {hud(f)}
  </g>
);
export const S28: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} dark={0.35} />
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#E2262E" opacity={0.15 + 0.1 * Math.sin(t * 0.8)} />
    <Blocky x={540} y={1842} s={1.4} kind="mom" face="angry" t={t} pose={{ armR: 100 }} />
    {hud(f)}
  </g>
);
export const S29: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} dark={0.4} />
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#E2262E" opacity={0.2} />
    <Blocky x={540} y={1915} s={1.75} kind="kid" face="worried" t={t} />
    {hud(f)}
  </g>
);
export const S30: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} dark={0.55} />
    <Blocky x={540} y={1842} s={1.4} kind="kid" face="starry" t={t} pose={{ armL: 70, armR: 70 }} />
    <Glow x={540} y={1100} r={500} kind="warm" o={0.9} />
    {hud(f)}
  </g>
);
export const S31: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Card t={t} title="GAME PASS" big="+10 SECONDS" btn="BUY" />
    <Sparkles t={t} seed="g" />
    {hud(f)}
  </g>
);
export const S32: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Card t={20} title="GAME PASS" big="+10 SECONDS" btn="BOUGHT ✓" ok />
    <g transform={`translate(800 520) rotate(12) scale(${popIn(t - 4, 5)})`}><text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={90} fill="#FFC21A" stroke={OL} strokeWidth={12} paintOrder="stroke">KA-CHING!</text></g>
    <Confetti t={t} seed="k" />
    {hud(f)}
  </g>
);
export const S33: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} dark={0.3} />
    <Blocky x={540} y={1898} s={1.6} kind="mom" face="despair" t={t} pose={{ armL: 160, armR: 160 }} />
    {hud(f)}
  </g>
);
export const S34: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} dark={0.5} />
    <g transform={`translate(540 980) scale(${popIn(t, 6)})`}>
      <rect x={-460} y={-420} width={920} height={840} rx={36} fill="#1E1A28" stroke="#3A3448" strokeWidth={6} />
      <text x={-400} y={-340} fontFamily={FONT.title} fontWeight={800} fontSize={44} fill="#FFFFFF">Comments</text>
      {['speedrunner kid >>>', 'mom never wins lol', 'this is literally my mom'].map((c, i) => <g key={i}><circle cx={-380} cy={-240 + i * 120} r={36} fill={['#E2262E', '#2E6AE8', '#2EA84A'][i]} /><text x={-320} y={-228 + i * 120} fontFamily={FONT.title} fontWeight={700} fontSize={38} fill="#D8D0E8">{c}</text></g>)}
      <rect x={-400} y={180} width={800} height={110} rx={55} fill="#2E2A3E" stroke="#FFC21A" strokeWidth={6} />
      <text x={-350} y={252} fontFamily={FONT.title} fontWeight={800} fontSize={60} fill="#FFFFFF">{'LOOP'.slice(0, Math.max(0, Math.floor((t - 6) / 3)))}{Math.floor(t / 8) % 2 ? '|' : ''}</text>
    </g>
    {hud(f)}
  </g>
);
