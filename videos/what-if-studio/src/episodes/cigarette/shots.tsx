import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, Punch, Counter } from '../molasses/kit';
import timeline from './timeline.json';

// "Who invented the cigarette?" A story Reel drawn like ink on cigarette paper: cream paper, ink silhouettes,
// ember orange as the only colour, living smoke in every scene, and a cigarette that burns down along the top
// as the film's progress bar. Everything is SVG drawn in code; no images.

type S = React.FC<ShotProps>;
const P = { paper: '#F1E6CE', paper2: '#E2D3B2', white: '#FBF6EA', ink: '#2B1D14', ink2: '#6A513C', ember: '#FF6A1A', glow: '#FFB02E', ash: '#A39A90', night: '#1C130E', night2: '#33241A' };
const ease = (x: number) => easeOut(clamp(x));
const T = (size: number, c: string = P.ink, w = 800) => ({ textAnchor: 'middle' as const, fontFamily: FONT.title, fontWeight: w, fontSize: size, fill: c });

// ---------------------------------------------------------------- paper, boil and smoke
/** The sheet every shot is drawn on: paper (or its night side), fibres, laid lines, a vignette, and a
 *  hand-drawn "boil" on the artwork (a turbulence displacement that changes every 4 frames). */
const Sheet: React.FC<{ t: number; dark?: boolean; children: React.ReactNode }> = ({ t, dark, children }) => (
  <g>
    <defs>
      <filter id="bo" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency={0.02} numOctaves={2} seed={Math.floor(t / 4)} /><feDisplacementMap in="SourceGraphic" scale={5} /></filter>
      <filter id="smk" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency={0.011} numOctaves={2} seed={Math.floor(t / 3) + 40} /><feDisplacementMap in="SourceGraphic" scale={44} /><feGaussianBlur stdDeviation={2.5} /></filter>
      <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor={dark ? '#000' : '#5A3A1A'} stopOpacity={dark ? 0.6 : 0.34} /></radialGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={2720} fill={dark ? P.night : P.paper} />
    {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-400} y={-300 + i * 110} width={W + 800} height={3} fill={dark ? P.paper : P.ink2} opacity={0.045} />)}
    {Array.from({ length: 70 }, (_, i) => { const x = random(`fx${i}`) * W, y = random(`fy${i}`) * 1920, a = random(`fa${i}`) * 180; return <rect key={i} x={x} y={y} width={18 + random(`fl${i}`) * 30} height={2} fill={dark ? P.paper : P.ink2} opacity={0.1} transform={`rotate(${a} ${x} ${y})`} />; })}
    <g filter="url(#bo)">{children}</g>
    <rect x={-400} y={-400} width={W + 800} height={2720} fill="url(#vig)" />
  </g>
);
/** Rising smoke: a few wavering ribbons that widen and fade as they climb. */
const Smoke: React.FC<{ x: number; y: number; t: number; h?: number; w?: number; n?: number; c?: string; o?: number; seed?: string; drift?: number; thick?: number }> = ({ x, y, t, h = 520, w = 90, n = 3, c = P.ink2, o = 0.42, seed = 's', drift = 0, thick = 26 }) => (
  <g>
    <defs><linearGradient id={`sg${seed}`} gradientUnits="userSpaceOnUse" x1={0} y1={y} x2={0} y2={y - h}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="0.7" stopColor={c} stopOpacity={o * 0.6} /><stop offset="1" stopColor={c} stopOpacity={0} /></linearGradient></defs>
    {Array.from({ length: n }, (_, i) => {
      const pts = Array.from({ length: 9 }, (_, k) => { const q = k / 8; return [x + Math.sin(t * 0.07 * (1 + i * 0.35) - k * 0.85 + i * 2.1) * w * q + drift * q * q + (i - (n - 1) / 2) * 22 * q, y - h * q]; });
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let k = 1; k < pts.length - 1; k++) d += ` Q ${pts[k][0]} ${pts[k][1]} ${(pts[k][0] + pts[k + 1][0]) / 2} ${(pts[k][1] + pts[k + 1][1]) / 2}`;
      return <path key={i} d={d} fill="none" stroke={`url(#sg${seed})`} strokeWidth={thick - i * 5 + Math.sin(t * 0.1 + i) * 4} strokeLinecap="round" />;
    })}
  </g>
);
const Ember: React.FC<{ x: number; y: number; r?: number; t: number; on?: number }> = ({ x, y, r = 14, t, on = 1 }) => {
  const p = 0.8 + 0.2 * Math.sin(t * 0.5);
  return on <= 0 ? null : <g opacity={on}><circle cx={x} cy={y} r={r * 4.2 * p} fill={P.ember} opacity={0.1} /><circle cx={x} cy={y} r={r * 2.3 * p} fill={P.ember} opacity={0.22} /><circle cx={x} cy={y} r={r} fill={P.ember} /><circle cx={x} cy={y} r={r * 0.5} fill={P.glow} /></g>;
};
/** A smoke of any kind: cigarette (paper with a filter end), cigar, leaf roll, or a butt. Drawn pointing right. */
const Cig: React.FC<{ x: number; y: number; s?: number; r?: number; kind?: 'cig' | 'cigar' | 'roll' | 'butt' | 'hand'; t: number; lit?: number; len?: number }> = ({ x, y, s = 1, r = 0, kind = 'cig', t, lit = 1, len }) => {
  const L = len ?? (kind === 'cigar' ? 190 : kind === 'butt' ? 56 : kind === 'roll' ? 150 : 150), H = kind === 'cigar' ? 40 : kind === 'roll' ? 28 : kind === 'butt' ? 34 : 22;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {kind === 'cigar' || kind === 'butt' ? <><rect x={0} y={-H / 2} width={L} height={H} rx={H / 2.4} fill={P.ink2} stroke={P.ink} strokeWidth={4} />{kind === 'cigar' ? <rect x={L * 0.22} y={-H / 2} width={22} height={H} fill={P.glow} stroke={P.ink} strokeWidth={3} /> : null}</>
        : kind === 'roll' ? <><path d={`M 0 ${-H / 2 + 4} L ${L} ${-H / 2} L ${L} ${H / 2} L 0 ${H / 2 - 4} Z`} fill={P.ink2} stroke={P.ink} strokeWidth={4} strokeLinejoin="round" /><path d={`M ${L * 0.2} ${-H / 2 + 3} L ${L * 0.5} ${H / 2 - 1} M ${L * 0.55} ${-H / 2 + 1} L ${L * 0.85} ${H / 2}`} stroke={P.ink} strokeWidth={3} opacity={0.6} /></>
        : <><rect x={0} y={-H / 2} width={L} height={H} rx={kind === 'hand' ? 8 : 3} fill={P.white} stroke={P.ink} strokeWidth={4} />{kind === 'cig' ? <rect x={0} y={-H / 2} width={L * 0.27} height={H} rx={3} fill={P.paper2} stroke={P.ink} strokeWidth={4} /> : <path d={`M ${L * 0.15} ${-H / 2} L ${L * 0.3} ${H / 2} M ${L * 0.5} ${-H / 2} L ${L * 0.62} ${H / 2}`} stroke={P.ink2} strokeWidth={2.5} opacity={0.5} />}</>}
      {lit > 0 ? <><rect x={L - 8} y={-H / 2} width={12} height={H} rx={4} fill={P.ash} /><Ember x={L + 4} y={0} r={H * 0.42} t={t} on={lit} /></> : null}
    </g>
  );
};

// ---------------------------------------------------------------- ink figures
type Arm = [number, number];   // shoulder angle, elbow bend (degrees; 0 = hanging, + = forward)
type Pose = { aF?: Arm; aB?: Arm; lF?: number; lB?: number; lean?: number };
type Hat = 'none' | 'feather' | 'sailor' | 'brim' | 'hood' | 'kepi' | 'bowler';
const pt = (x: number, y: number, len: number, deg: number): [number, number] => [x + len * Math.sin((deg * Math.PI) / 180), y + len * Math.cos((deg * Math.PI) / 180)];
/** An ink silhouette person facing right (flip to face left). `held` is drawn in the front hand. */
const Fig: React.FC<{ x: number; feet: number; s?: number; pose?: Pose; hat?: Hat; c?: string; flip?: boolean; held?: React.ReactNode; robe?: boolean; rifle?: boolean }> = ({ x, feet, s = 1, pose = {}, hat = 'none', c = P.ink, flip, held, robe, rifle }) => {
  const { aF = [10, 10], aB = [-8, 6], lF = 6, lB = -6, lean = 0 } = pose;
  const limb = (x0: number, y0: number, a: Arm, l1: number, l2: number, w: number) => { const e = pt(x0, y0, l1, a[0]), h = pt(e[0], e[1], l2, a[0] + a[1]); return { d: `M ${x0} ${y0} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`, h, w }; };
  const front = limb(8, -248, aF, 62, 62, 24), back = limb(-8, -248, aB, 62, 62, 24);
  const legF = pt(10, -136, 138, lF), legB = pt(-10, -136, 138, lB);
  return (
    <g transform={`translate(${x} ${feet}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <path d={`M -10 -136 L ${legB[0]} ${legB[1]} l 22 0`} stroke={c} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M 10 -136 L ${legF[0]} ${legF[1]} l 24 0`} stroke={c} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g transform={`rotate(${lean} 0 -140)`}>
        <path d={back.d} stroke={c} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
        {rifle ? <path d="M -30 -120 L 40 -420" stroke={c} strokeWidth={10} strokeLinecap="round" /> : null}
        <path d="M -44 -262 Q 0 -282 44 -262 L 36 -128 Q 0 -116 -36 -128 Z" fill={c} />
        {robe ? <path d="M -40 -200 L -62 -20 L -30 -34 L -6 -14 L 20 -34 L 58 -18 L 40 -200 Z" fill={c} /> : null}
        <rect x={-12} y={-292} width={24} height={30} fill={c} />
        <circle cx={0} cy={-318} r={36} fill={c} />
        <path d="M 30 -326 l 14 8 l -14 8 Z" fill={c} />
        {hat === 'feather' ? <g>{[-56, -28, 0, 28, 56].map((a, i) => <path key={i} d="M 0 -350 Q -16 -420 0 -470 Q 16 -420 0 -350 Z" fill={i % 2 ? P.ember : c} transform={`rotate(${a - 12} 0 -330)`} />)}<rect x={-40} y={-352} width={80} height={14} rx={6} fill={c} /></g> : null}
        {hat === 'sailor' ? <g><path d="M -40 -338 Q -34 -388 4 -386 Q 40 -384 40 -340 Z" fill={c} /><circle cx={4} cy={-392} r={9} fill={c} /></g> : null}
        {hat === 'brim' ? <g><ellipse cx={0} cy={-346} rx={74} ry={11} fill={c} /><path d="M -32 -346 L -28 -392 L 28 -392 L 32 -346 Z" fill={c} /><path d="M 20 -388 Q 60 -440 84 -400" stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" /></g> : null}
        {hat === 'hood' ? <path d="M -46 -296 Q -56 -380 2 -380 Q 52 -378 44 -300 L 60 -246 L -62 -246 Z" fill={c} /> : null}
        {hat === 'kepi' ? <g><path d="M -34 -340 L -30 -382 L 30 -382 L 34 -340 Z" fill={c} /><path d="M 28 -344 L 62 -338" stroke={c} strokeWidth={10} strokeLinecap="round" /></g> : null}
        {hat === 'bowler' ? <g><path d="M -36 -342 Q -36 -390 0 -390 Q 36 -390 36 -342 Z" fill={c} /><rect x={-54} y={-348} width={108} height={11} rx={5} fill={c} /></g> : null}
        <path d={front.d} stroke={c} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {held ? <g transform={`translate(${front.h[0]} ${front.h[1]})`}>{held}</g> : null}
      </g>
    </g>
  );
};
const SMOKING: Pose = { aF: [38, 118], aB: [-6, 8] };              // the front hand up at the mouth
const mouthOf = (x: number, feet: number, s: number, flip?: boolean): [number, number] => [x + (flip ? -1 : 1) * 62 * s, feet - 312 * s];
const Ground: React.FC<{ y: number; c?: string }> = ({ y, c = P.ink }) => (
  <g><path d={`M -300 ${y} Q 270 ${y - 8} 540 ${y + 3} T 1400 ${y}`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M ${random(`gx${i}`) * W} ${y + 22 + random(`gy${i}`) * 60} l ${30 + random(`gl${i}`) * 50} 0`} stroke={c} strokeWidth={4} opacity={0.35} strokeLinecap="round" />)}</g>
);
const Cobbles: React.FC<{ y: number; rows?: number; c?: string; big?: number }> = ({ y, rows = 5, c = P.ink2, big = 1 }) => (
  <g opacity={0.5}>{Array.from({ length: rows * 9 }, (_, i) => { const r = Math.floor(i / 9), k = i % 9; return <rect key={i} x={-60 + k * 140 * big + (r % 2) * 70 * big} y={y + r * 74 * big} width={120 * big} height={60 * big} rx={22 * big} fill="none" stroke={c} strokeWidth={5} />; })}</g>
);
const Label: React.FC<{ t: number; text: string; x?: number; y: number; size?: number; c?: string; rot?: number; hand?: boolean }> = ({ t, text, x = 540, y, size = 70, c = P.ink, rot = -3, hand }) => (
  t <= 0 ? null : <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${popIn(t, 6)})`}><text {...T(size, c)} fontFamily={hand ? FONT.hand : FONT.title} fontWeight={hand ? 700 : 800}>{text}</text></g>
);
const Hand: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string; pinch?: number }> = ({ x, y, s = 1, r = 0, c = P.ink, pinch = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -60 -300 L -70 -80 Q -76 -10 -30 0 L 30 0 Q 70 -10 64 -80 L 60 -300 Z" fill={c} />
    <path d={`M -44 -10 Q -52 60 ${-20 + pinch * 14} 96`} stroke={c} strokeWidth={30} strokeLinecap="round" fill="none" /><path d={`M 40 -10 Q 56 60 ${24 - pinch * 14} 96`} stroke={c} strokeWidth={30} strokeLinecap="round" fill="none" />
  </g>
);

// ---------------------------------------------------------------- the progress bar: a cigarette burning down
const TOTAL = (timeline as any).total as number;
export const BurnBar: React.FC<{ f: number }> = ({ f }) => {
  const p = clamp(f / (TOTAL - 70)), X0 = 250, L = 600, tip = X0 + L - (L - 140) * p, out = f > TOTAL - 70;
  return (
    <g transform="translate(0 330)">
      <rect x={X0} y={-17} width={tip - X0} height={34} rx={5} fill={P.white} stroke={P.ink} strokeWidth={5} />
      <rect x={X0} y={-17} width={140} height={34} rx={5} fill="#D9A45A" stroke={P.ink} strokeWidth={5} />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={X0 + 14 + random(`bf${i}`) * 112} cy={-10 + random(`bg${i}`) * 20} r={3} fill="#A8742E" />)}
      {/* the ash that has not fallen yet, then the ember */}
      <rect x={tip} y={-15} width={Math.min(46, X0 + L - tip)} height={30} rx={8} fill={P.ash} stroke={P.ink} strokeWidth={4} opacity={0.9} />
      {Array.from({ length: 5 }, (_, i) => { const life = (f * 0.7 + i * 17) % 85; return <rect key={i} x={tip + 30 + i * 6 + life * 0.5} y={10 + life * 1.4} width={9} height={7} fill={P.ash} opacity={clamp(1 - life / 85) * 0.9} />; })}
      {!out ? <Ember x={tip + 2} y={0} r={12} t={f} /> : null}
      <Smoke x={tip + 6} y={-14} t={f} h={out ? 60 : 150} w={34} n={2} c={P.ash} o={0.55} seed="bar" thick={12} drift={40} />
    </g>
  );
};

// ---------------------------------------------------------------- the hook
export const S1: S = ({ t }) => (
  <Sheet t={t} dark>
    <Hand x={520} y={1640 - ease(t / 14) * 330} s={1.5} r={184} c="#4A382B" />
    <Cig x={210} y={1010} s={4.2} r={-10} t={t} />
    <Smoke x={850} y={880} t={t} h={520} w={110} c={P.paper} o={0.38} seed="a1" thick={40} />
    <Punch t={t - 3} lines={['INVENTED', 'BY BEGGARS']} color={P.ember} kicker="THE CIGARETTE" y={500} />
  </Sheet>
);
export const S2: S = ({ t }) => (
  <Sheet t={t} dark>
    <Ground y={1130} c={P.paper2} />
    <path d="M 520 1130 L 560 900 L 700 860 L 760 960 L 900 930 L 980 1130 Z" fill={P.night2} stroke={P.paper2} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 640 880 l 30 -70 l 40 60 M 820 950 l 50 -40" stroke={P.paper2} strokeWidth={6} fill="none" strokeLinecap="round" />
    <Fig x={400} feet={1130} s={1.55} c={P.paper2} hat="hood" robe pose={{ lean: 30, aF: [70, 10 + Math.sin(t * 0.5) * 16], aB: [40, 20], lF: 12, lB: -10 }} />
    <Cig x={690} y={905} s={1.1} r={-20} kind="butt" t={t} lit={1} />
    <Smoke x={756} y={880} t={t} h={300} w={50} n={2} c={P.paper} o={0.4} seed="a2" thick={16} />
  </Sheet>
);
export const S3: S = ({ t }) => (
  <Sheet t={t}>
    {Array.from({ length: 34 }, (_, i) => <path key={i} d="M 0 0 l 26 6" stroke={P.ink2} strokeWidth={5} strokeLinecap="round" opacity={0.7} transform={`translate(${80 + random(`sh${i}`) * 920} ${1020 + random(`sy${i}`) * 140}) rotate(${random(`sr${i}`) * 180})`} />)}
    <g transform={`translate(540 640) rotate(-4) scale(${popIn(t, 7)})`}><text {...T(110)}>WHO INVENTED</text></g>
    <g transform={`translate(540 800) rotate(-4) scale(${popIn(t - 6, 7)})`}><text {...T(128, P.ember)} stroke={P.ink} strokeWidth={10} paintOrder="stroke">THE CIGARETTE?</text></g>
    <path d={`M 150 860 Q 540 ${900 + Math.sin(t * 0.2) * 6} ${150 + 780 * ease((t - 10) / 14)} 850`} stroke={P.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
    <Cig x={330} y={980} s={2.4} r={-4} t={t} />
    <Smoke x={700} y={950} t={t} h={380} w={70} seed="a3" />
  </Sheet>
);
export const S4: S = ({ t }) => {
  const x = lerp(140, 980, ease(t / 30));
  const stops: [number, string][] = [[200, 'MAYA'], [410, '1492'], [630, 'SEVILLE'], [850, '1880']];
  return (
    <Sheet t={t}>
      <rect x={60} y={620} width={x - 60} height={420} fill={P.white} stroke={P.ink} strokeWidth={7} />
      <path d={`M 100 830 L ${x - 20} 830`} stroke={P.ink} strokeWidth={7} strokeDasharray="18 16" />
      {stops.map(([sx, name], i) => (x > sx + 40 ? <g key={i} transform={`translate(${sx} 830) scale(${popIn((x - sx - 40) / 14, 5)})`}><circle r={22} fill={i === 3 ? P.ember : P.ink} /><text y={-50} {...T(38)}>{name}</text></g> : null))}
      <rect x={x - 26} y={590} width={80} height={480} rx={40} fill={P.paper2} stroke={P.ink} strokeWidth={7} />
      <path d={`M ${x - 4} 600 L ${x - 4} 1060`} stroke={P.ink} strokeWidth={4} opacity={0.4} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- the Maya
const Pyramid: React.FC<{ x: number; y: number; s?: number; c?: string; o?: number }> = ({ x, y, s = 1, c = P.ink, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-(360 - i * 54)} y={-(i + 1) * 78} width={(360 - i * 54) * 2} height={80} fill={c} />)}
    <rect x={-70} y={-6 * 78 - 84} width={140} height={90} fill={c} /><rect x={-26} y={-6 * 78 - 60} width={52} height={66} fill={P.paper} opacity={0.5} />
    <path d="M -46 0 L -30 -468 L 30 -468 L 46 0 Z" fill={P.paper} opacity={0.22} />
  </g>
);
export const S5: S = ({ t }) => (
  <Sheet t={t}>
    <circle cx={800} cy={720} r={130} fill={P.ember} opacity={0.9} /><circle cx={800} cy={720} r={170 + Math.sin(t * 0.2) * 8} fill={P.ember} opacity={0.14} />
    <Pyramid x={540} y={1150} />
    {[[-40, 1150, 10], [1100, 1150, -12], [120, 1180, 24]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r + Math.sin(t * 0.1 + i) * 3})`}>{[-50, -25, 0, 25, 50].map((a) => <path key={a} d="M 0 0 Q -30 -200 0 -400 Q 30 -200 0 0 Z" fill={P.ink} transform={`rotate(${a})`} />)}</g>)}
    <Label t={t - 2} text="1,000 YEARS AGO" y={560} size={78} x={420} />
  </Sheet>
);
export const S6: S = ({ t }) => {
  const [mx, my] = mouthOf(430, 1130, 1.9);
  return (
    <Sheet t={t}>
      <Pyramid x={840} y={1130} s={0.42} c={P.ink2} o={0.55} />
      <Ground y={1130} />
      <Fig x={430} feet={1130} s={1.9} hat="feather" robe pose={SMOKING} />
      <Cig x={mx - 6} y={my + 6} s={1.15} r={-8} kind="roll" t={t} />
      <Smoke x={mx + 176} y={my - 24} t={t} h={600} w={120} seed="b2" thick={34} />
    </Sheet>
  );
};
export const S7: S = ({ t }) => {
  const k = ease((t - 4) / 18);
  return (
    <Sheet t={t}>
      <Hand x={250} y={640} s={1.25} r={-52} pinch={k} /><Hand x={830} y={640} s={1.25} r={52} pinch={k} />
      {k < 1 ? <g transform={`translate(540 860) rotate(-6) scale(1 ${1 - k * 0.78})`}><path d="M -300 0 Q -100 -170 300 0 Q -100 170 -300 0 Z" fill={P.ink2} stroke={P.ink} strokeWidth={7} /><path d="M -300 0 L 300 0 M -120 0 l 60 -70 M 20 0 l 70 -60 M -60 0 l 60 70 M 100 0 l 60 50" stroke={P.ink} strokeWidth={5} fill="none" /></g> : null}
      {k >= 1 ? <><Cig x={270} y={880} s={3.4} r={-6} kind="roll" t={t} lit={clamp((t - 26) / 6)} /><Smoke x={790} y={800} t={t} h={320} w={60} n={2} seed="b3" o={0.4 * clamp((t - 26) / 8)} /></> : null}
      <Label t={t - 8} text="ROLLED IN LEAVES" y={1080} size={64} hand />
    </Sheet>
  );
};
export const S8: S = ({ t }) => (
  <Sheet t={t}>
    <Pyramid x={540} y={1260} s={0.7} />
    <Smoke x={540} y={860} t={t} h={330} w={70} seed="b4" thick={46} n={4} />
    {/* the god in the smoke */}
    <g filter="url(#smk)" opacity={0.72 * ease((t - 4) / 16)} transform="translate(540 520)">
      <path d="M -150 -130 L 150 -130 L 170 60 Q 0 190 -170 60 Z" fill={P.ink2} />
      <path d="M -150 -130 l -40 -110 l 70 70 l 40 -100 l 50 100 l 60 -110 l 40 110 l 70 -70 l -40 110 Z" fill={P.ink2} />
      <circle cx={-66} cy={-30} r={34} fill={P.paper} /><circle cx={66} cy={-30} r={34} fill={P.paper} />
      <rect x={-70} y={50} width={140} height={34} fill={P.paper} />
    </g>
    <Ember x={474} y={490} r={12} t={t} on={ease((t - 10) / 10)} /><Ember x={606} y={490} r={12} t={t + 3} on={ease((t - 10) / 10)} />
  </Sheet>
);

// ---------------------------------------------------------------- 1492
const Ship: React.FC<{ x: number; y: number; s?: number; t: number; c?: string }> = ({ x, y, s = 1, t, c = P.ink }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.18) * 8}) scale(${s}) rotate(${Math.sin(t * 0.14) * 2.5})`}>
    <path d="M -210 -40 L 230 -40 Q 200 60 150 70 L -150 70 Q -190 40 -210 -40 Z" fill={c} /><path d="M 230 -40 l 70 -40 l -40 50" fill={c} />
    {[-110, 10, 130].map((mx, i) => <g key={i}><rect x={mx - 6} y={-360 + i * 30 - (i === 1 ? 60 : 0)} width={12} height={330 - i * 30 + (i === 1 ? 60 : 0)} fill={c} />
      <path d={`M ${mx - 74} ${-310 + i * 20 - (i === 1 ? 50 : 0)} Q ${mx + 30} ${-200} ${mx - 74} -90 L ${mx + 74} -90 Q ${mx + 120} -200 ${mx + 74} ${-310 + i * 20 - (i === 1 ? 50 : 0)} Z`} fill={P.white} stroke={c} strokeWidth={7} strokeLinejoin="round" /></g>)}
    <path d="M 10 -420 l 70 16 l -70 16 Z" fill={P.ember} />
  </g>
);
const Waves: React.FC<{ y: number; t: number; c?: string; rows?: number }> = ({ y, t, c = P.ink, rows = 4 }) => (
  <g>{Array.from({ length: rows }, (_, r) => <path key={r} d={`M -200 ${y + r * 54} ` + Array.from({ length: 12 }, (_, i) => `q 60 ${-34 + Math.sin(t * 0.15 + r + i) * 8} 120 0`).join(' ')} transform={`translate(${-((t * (2 + r)) % 120)} 0)`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - r * 0.2} />)}</g>
);
export const S9: S = ({ t }) => (
  <Sheet t={t}>
    <g transform={`translate(540 660) scale(${popIn(t, 7)})`}><text {...T(330)}>1492</text></g>
    <Ship x={lerp(240, 620, clamp(t / 50))} y={1010} s={0.9} t={t} />
    <Waves y={1080} t={t} />
  </Sheet>
);
export const S10: S = ({ t }) => {
  const [mx, my] = mouthOf(800, 1130, 1.5, true);
  return (
    <Sheet t={t}>
      <path d="M 960 1130 Q 940 800 1010 540" stroke={P.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
      {[-70, -30, 10, 50, 90].map((a) => <path key={a} d="M 0 0 Q 120 -90 250 -10 Q 120 -30 0 0 Z" fill={P.ink} transform={`translate(1010 540) rotate(${a + 180 + Math.sin(t * 0.1) * 3})`} />)}
      <Ground y={1130} />
      <Fig x={180} feet={1130} s={1.45} hat="sailor" pose={{ aF: [80, 6], lean: -6 }} />
      <Fig x={380} feet={1140} s={1.5} hat="sailor" pose={{ aF: [150, 30], aB: [140, 30], lean: -10 }} />
      <Fig x={800} feet={1130} s={1.5} hat="feather" robe flip pose={SMOKING} />
      <Cig x={mx + 6} y={my + 6} s={0.95} r={188} kind="roll" t={t} />
      <Smoke x={mx - 150} y={my - 10} t={t} h={480} w={90} seed="c2" />
      <g transform={`translate(330 560) scale(${popIn(t - 8, 5)})`}><text {...T(150)}>?!</text></g>
    </Sheet>
  );
};
export const S11: S = ({ t }) => {
  const k = clamp(t / 46), sx = lerp(230, 800, k), sy = lerp(1010, 640, k) - Math.sin(k * Math.PI) * 60;
  return (
    <Sheet t={t}>
      <path d="M 90 980 q 60 -70 130 -30 q 70 30 40 100 q -80 60 -150 20 q -50 -40 -20 -90 Z M 300 1100 q 50 -30 80 10 q -10 50 -70 40 Z" fill={P.ink2} opacity={0.75} />
      <path d="M 760 420 L 1100 380 L 1120 760 L 900 780 Q 800 700 820 600 Q 740 520 760 420 Z" fill={P.ink2} opacity={0.75} />
      <text x={930} y={590} {...T(50, P.paper)}>SPAIN</text>
      <path d="M 230 1010 Q 480 760 800 640" stroke={P.ink} strokeWidth={7} strokeDasharray="20 18" fill="none" />
      {Array.from({ length: 5 }, (_, i) => { const q = k - i * 0.07; return q > 0 ? <circle key={i} cx={lerp(230, 800, q)} cy={lerp(1010, 640, q) - Math.sin(q * Math.PI) * 60 - 60 - i * 16} r={16 + i * 7} fill={P.ink2} opacity={0.35 - i * 0.06} /> : null; })}
      <Ship x={sx} y={sy} s={0.34} t={t} />
      <g transform="translate(200 560)"><circle r={70} fill="none" stroke={P.ink} strokeWidth={6} /><path d="M 0 -90 L 16 0 L 0 90 L -16 0 Z M -90 0 L 0 -16 L 90 0 L 0 16 Z" fill={P.ink} /><text y={-104} {...T(40)}>N</text></g>
    </Sheet>
  );
};
export const S12: S = ({ t }) => {
  const [mx, my] = mouthOf(480, 1420, 2.5);
  return (
    <Sheet t={t}>
      <path d="M -100 880 L 1200 880" stroke={P.ink} strokeWidth={6} /><Waves y={900} t={t} rows={2} c={P.ink2} />
      <path d="M 820 200 L 820 1300" stroke={P.ink} strokeWidth={26} /><path d="M 560 330 Q 900 520 560 840 L 1000 840 Q 1100 560 1000 330 Z" fill={P.white} stroke={P.ink} strokeWidth={8} />
      <path d="M -100 1120 L 1200 1120 M -100 1180 L 1200 1180" stroke={P.ink} strokeWidth={16} />
      <Fig x={480} feet={1420} s={2.5} hat="sailor" pose={SMOKING} />
      <Cig x={mx - 8} y={my + 8} s={1.4} r={-8} kind="roll" t={t} />
      <Smoke x={mx + 210} y={my - 26} t={t} h={520} w={110} seed="c4" thick={34} drift={-140} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- the devil and the jail
export const S13: S = ({ t }) => {
  const [mx, my] = mouthOf(540, 1130, 1.7), back = ease(t / 10) * 14;
  return (
    <Sheet t={t}>
      <path d="M 120 1130 L 120 620 Q 330 420 540 420 Q 750 420 960 620 L 960 1130" stroke={P.ink2} strokeWidth={26} fill="none" opacity={0.5} />
      <Ground y={1130} />
      <Fig x={150} feet={1130} s={1.4} hat="brim" pose={{ lean: -back, aF: [-150, -20], aB: [-140, -20] }} />
      <Fig x={930} feet={1130} s={1.4} hat="brim" flip pose={{ lean: -back, aF: [-150, -20], aB: [-140, -20] }} />
      <Fig x={540} feet={1130} s={1.7} hat="sailor" pose={{ aF: [30, 60], lean: -4 }} />
      <Smoke x={mx + 10} y={my + 16} t={t} h={420} w={150} n={5} seed="d1" thick={40} drift={200} o={0.5} />
    </Sheet>
  );
};
export const S14: S = ({ t }) => {
  const k = ease((t - 6) / 16), [mx, my] = mouthOf(540, 1160, 1.15);
  return (
    <Sheet t={t} dark>
      <Fig x={540} feet={1160} s={1.15} hat="sailor" c={P.paper2} pose={{ aF: [30, 60] }} />
      <Smoke x={mx} y={my} t={t} h={300} w={60} c={P.paper} seed="d2" thick={34} n={4} o={0.5} />
      <g filter="url(#smk)" opacity={0.85 * k} transform={`translate(540 ${740 - (1 - k) * 80}) scale(${0.62 + k * 0.26})`}>
        <path d="M -190 -40 Q -200 -200 0 -210 Q 200 -200 190 -40 Q 150 150 0 200 Q -150 150 -190 -40 Z" fill={P.paper} />
        <path d="M -150 -150 Q -260 -260 -200 -360 Q -170 -250 -80 -200 Z M 150 -150 Q 260 -260 200 -360 Q 170 -250 80 -200 Z" fill={P.paper} />
        <path d="M -100 60 Q 0 130 100 60 L 80 100 Q 0 150 -80 100 Z" fill={P.night} />
        <path d="M -110 -60 l 70 30 l -70 20 Z M 110 -60 l -70 30 l 70 20 Z" fill={P.night} />
      </g>
      <Ember x={478} y={708} r={12} t={t} on={k} /><Ember x={602} y={708} r={12} t={t + 4} on={k} />
      <g transform={`translate(540 1040) rotate(-5) scale(${popIn(t - 24, 5)})`}><text {...T(110, P.ember)} stroke={P.night} strokeWidth={14} paintOrder="stroke">THE DEVIL?!</text></g>
    </Sheet>
  );
};
export const S15: S = ({ t }) => {
  const drop = t < 30 ? -1500 : -1500 * (1 - ease((t - 30) / 5)), [mx, my] = mouthOf(540, 1130, 1.6);
  return (
    <Sheet t={t} dark>
      <rect x={680} y={470} width={200} height={170} rx={10} fill={P.night2} stroke={P.paper2} strokeWidth={8} />{[730, 780, 830].map((x) => <rect key={x} x={x - 6} y={470} width={12} height={170} fill={P.paper2} />)}
      <Ground y={1130} c={P.paper2} />
      <Fig x={540} feet={1130} s={1.6} hat="sailor" c={P.paper2} pose={{ lean: 8, aF: [10, 10], aB: [-10, 10] }} />
      <Smoke x={mx} y={my} t={t} h={380} w={70} c={P.paper} seed="d3" thick={22} n={2} o={0.45} drift={160} />
      <g transform={`translate(0 ${drop})`}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={70 + i * 134} y={380} width={30} height={800} rx={10} fill={P.paper2} stroke={P.night} strokeWidth={5} />)}<rect x={40} y={380} width={1000} height={36} fill={P.paper2} /><rect x={40} y={1144} width={1000} height={36} fill={P.paper2} /></g>
      <g transform={`translate(540 600) rotate(-4) scale(${popIn(t - 34, 6)})`}><text {...T(96, P.ember)} stroke={P.night} strokeWidth={16} paintOrder="stroke">LOCKED UP</text></g>
    </Sheet>
  );
};

// ---------------------------------------------------------------- the rich and their butts
export const S16: S = ({ t }) => {
  const a = mouthOf(310, 1130, 1.6), b = mouthOf(770, 1130, 1.6, true);
  return (
    <Sheet t={t}>
      <Ground y={1130} />
      <Fig x={310} feet={1130} s={1.6} hat="brim" robe pose={SMOKING} /><Fig x={770} feet={1130} s={1.6} hat="brim" robe flip pose={SMOKING} />
      <Cig x={a[0] - 8} y={a[1] + 8} s={0.52} r={-6} kind="cigar" t={t} /><Cig x={b[0] + 8} y={b[1] + 8} s={0.52} r={186} kind="cigar" t={t + 5} />
      {[0, 1, 2].map((i) => { const life = (t * 0.9 + i * 22) % 66; return <ellipse key={i} cx={540 + (i - 1) * 60} cy={720 - life * 5} rx={30 + life * 1.1} ry={12 + life * 0.4} fill="none" stroke={P.ink2} strokeWidth={10} opacity={clamp(1 - life / 66) * 0.6} />; })}
      {[[210, 620], [870, 600], [540, 520]].map(([x, y], i) => <path key={i} d="M 0 -26 L 8 -8 L 26 0 L 8 8 L 0 26 L -8 8 L -26 0 L -8 -8 Z" fill={P.ember} transform={`translate(${x} ${y}) scale(${0.6 + 0.5 * Math.abs(Math.sin(t * 0.2 + i * 2))})`} />)}
    </Sheet>
  );
};
export const S17: S = ({ t }) => (
  <Sheet t={t}>
    <Cig x={130} y={900} s={4.0} r={-9} kind="cigar" t={t} />
    <Smoke x={900} y={790} t={t} h={420} w={90} seed="e2" thick={44} n={4} />
    {['BIG.', 'FAT.', 'CIGARS.'].map((w, i) => <Label key={w} t={t - i * 12} text={w} x={200 + i * 250 + (i === 2 ? 60 : 0)} y={620} size={i === 2 ? 84 : 96} c={i === 2 ? P.ember : P.ink} rot={-5 + i * 3} />)}
  </Sheet>
);
export const S18: S = ({ t }) => {
  const k = clamp(t / 20), bx = lerp(120, 560, k), by = k < 1 ? 520 + k * k * 560 - Math.sin(k * Math.PI) * 120 : 1080 - Math.abs(Math.sin((t - 20) * 0.5)) * 40 * Math.exp(-(t - 20) / 8);
  return (
    <Sheet t={t}>
      <Cobbles y={1010} rows={4} />
      {[[200, 1130, 20], [860, 1070, -30], [760, 1180, 70]].map(([x, y, r], i) => <Cig key={i} x={x} y={y} r={r} kind="butt" t={t} lit={0} />)}
      <g transform={`translate(${lerp(700, 1200, clamp(t / 60))} 760)`}>{[0, 150].map((dx, i) => <path key={i} d="M -40 -260 L 40 -260 L 50 -40 L 130 -10 Q 150 30 110 34 L -50 34 Z" fill={P.ink} transform={`translate(${dx} ${i ? -Math.abs(Math.sin(t * 0.3)) * 40 : -Math.abs(Math.cos(t * 0.3)) * 40})`} />)}</g>
      <Cig x={bx} y={by} r={k * 420} kind="butt" t={t} lit={1} s={1.3} />
      {t > 20 && t < 34 ? Array.from({ length: 7 }, (_, i) => <circle key={i} cx={600 + Math.cos(i) * (t - 20) * 9} cy={1070 - Math.abs(Math.sin(i * 1.7)) * (t - 20) * 8} r={6} fill={P.ember} opacity={1 - (t - 20) / 14} />) : null}
      <Smoke x={640} y={1050} t={t} h={260} w={40} n={2} seed="e3" thick={14} o={0.4 * clamp((t - 22) / 8)} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- Seville: the beggars' invention
export const S19: S = ({ t }) => (
  <Sheet t={t}>
    <circle cx={300} cy={760} r={130} fill={P.ember} /><circle cx={300} cy={760} r={170 + Math.sin(t * 0.2) * 8} fill={P.ember} opacity={0.14} />
    <path d="M -100 1150 L -100 900 L 120 900 L 120 820 L 300 820 L 300 940 L 470 940 L 470 1150 Z M 760 1150 L 760 860 L 940 860 L 940 940 L 1200 940 L 1200 1150 Z" fill={P.ink} />
    <g fill={P.ink}><rect x={560} y={620} width={130} height={530} /><rect x={580} y={520} width={90} height={110} /><rect x={598} y={440} width={54} height={90} /><path d="M 598 440 L 625 370 L 652 440 Z" /><rect x={621} y={330} width={8} height={50} /></g>
    {[588, 632].map((x) => <path key={x} d={`M ${x} 760 l 0 -50 q 14 -22 28 0 l 0 50 Z`} fill={P.paper} opacity={0.7} />)}
    {[[180, 1000], [380, 1040], [840, 1000], [1000, 1040]].map(([x, y], i) => <path key={i} d={`M ${x - 30} ${y + 110} l 0 -70 q 30 -44 60 0 l 0 70 Z`} fill={P.paper} opacity={0.35} />)}
    {[0, 1, 2].map((i) => <path key={i} d="M -18 0 q 9 -12 18 0 q 9 -12 18 0" stroke={P.ink} strokeWidth={5} fill="none" transform={`translate(${760 + i * 70 + t * 0.8} ${520 + i * 40 + Math.sin(t * 0.2 + i) * 8})`} />)}
    <g transform={`translate(540 1100) scale(${popIn(t - 2, 7)})`}><text {...T(84, P.paper)} letterSpacing={18}>SEVILLE</text></g>
  </Sheet>
);
export const S20: S = ({ t }) => {
  const down = ease(t / 10), up = ease((t - 16) / 14);
  return (
    <Sheet t={t}>
      <Cobbles y={860} rows={5} big={1.5} />
      <Cig x={500} y={1040 - up * 240} r={-14} kind="butt" t={t} lit={1} s={1.7} />
      <Hand x={560} y={lerp(300, 930, down) - up * 240} s={1.35} r={8} pinch={clamp((t - 9) / 6)} />
      <Smoke x={600} y={1010 - up * 240} t={t} h={300} w={40} n={2} seed="f2" thick={14} o={0.4} />
    </Sheet>
  );
};
export const S21: S = ({ t }) => {
  const k = ease(t / 14);
  return (
    <Sheet t={t}>
      {k < 0.25 ? <Cig x={480} y={800} r={-8} kind="butt" t={t} lit={0} s={2.2} /> : null}
      {Array.from({ length: 60 }, (_, i) => { const a = random(`ta${i}`) * Math.PI * 2, r = 60 + random(`tr${i}`) * 300, sx = 540 + Math.cos(a) * r * k, sy = 800 + Math.sin(a) * r * 0.5 * k, fall = clamp((t - 14) / 16), py = lerp(sy, 1040 + random(`tp${i}`) * 60 - Math.abs(sx - 540) * 0.12, fall * fall); return <path key={i} d="M 0 0 q 14 -6 30 2" stroke={i % 3 ? P.ink2 : P.ink} strokeWidth={7} strokeLinecap="round" fill="none" transform={`translate(${sx} ${py}) rotate(${random(`tq${i}`) * 180 + t * (1 - fall) * 6})`} />; })}
      <Label t={t - 3} text="SHREDDED" y={540} size={110} rot={-5} />
    </Sheet>
  );
};
export const S22: S = ({ t }) => {
  const k = ease((t - 8) / 20), lit = clamp((t - 32) / 6);
  return (
    <Sheet t={t}>
      {k < 1 ? <g transform={`translate(540 820) rotate(-5)`}>
        <path d={`M ${-330 + k * 200} -150 l 60 -20 l 90 16 L ${330 - k * 200} -160 l 20 130 l -14 150 l -120 16 L ${-300 + k * 190} 150 l -26 -120 Z`} fill={P.white} stroke={P.ink} strokeWidth={7} strokeLinejoin="round" transform={`scale(1 ${1 - k * 0.82})`} />
        {[-90, -50, -10].map((y, i) => <rect key={i} x={-250 + k * 160} y={y * (1 - k)} width={(500 - k * 320) * (i === 2 ? 0.6 : 1)} height={6} fill={P.ink2} opacity={0.35 * (1 - k)} />)}
        {Array.from({ length: 26 }, (_, i) => <path key={i} d="M 0 0 q 12 -5 26 2" stroke={P.ink2} strokeWidth={7} strokeLinecap="round" fill="none" transform={`translate(${(-220 + i * 17) * (1 - k * 0.4)} ${40 * (1 - k) + (i % 3) * 8 * (1 - k)}) rotate(${random(`rr${i}`) * 180})`} />)}
      </g> : null}
      {k >= 1 ? <><Cig x={230} y={850} s={4} r={-6} kind="hand" t={t} lit={lit} /><Smoke x={850} y={760} t={t} h={380} w={70} seed="f4" o={0.42 * lit} /></> : null}
      <Hand x={200} y={560} s={1.2} r={-40} pinch={k} /><Hand x={880} y={560} s={1.2} r={40} pinch={k} />
      <Label t={t - 34} text="…IN SCRAPS OF PAPER" y={1090} size={62} hand />
    </Sheet>
  );
};
export const S23: S = ({ t }) => {
  const [mx, my] = mouthOf(430, 1130, 1.9);
  return (
    <Sheet t={t}>
      <Ground y={1130} />
      <g opacity={0.3}><Fig x={900} feet={1120} s={0.9} hat="brim" robe flip pose={SMOKING} c={P.ink2} /></g>
      <Fig x={430} feet={1130} s={1.9} hat="hood" robe pose={SMOKING} />
      <Cig x={mx - 6} y={my + 8} s={0.95} r={-10} kind="hand" t={t} />
      <Smoke x={mx + 146} y={my - 20} t={t} h={520} w={100} seed="g1" thick={28} />
      <Label t={t - 4} text="A POOR" x={790} y={640} size={74} /><Label t={t - 8} text="MAN'S CIGAR" x={790} y={730} size={74} c={P.ember} />
    </Sheet>
  );
};
export const S24: S = ({ t }) => (
  <Sheet t={t}>
    <text x={540} y={560} {...T(46, P.ink2)} letterSpacing={10}>FRANCE · 1830s</text>
    <text x={540} y={820} {...T(210)} fontFamily={FONT.hand} fontWeight={700} fontStyle="italic"><tspan>cigar</tspan><tspan fill={P.ember} opacity={clamp((t - 14) / 3)} dx={lerp(40, 0, ease((t - 14) / 8))}>ette</tspan></text>
    <path d={`M 190 870 Q 540 ${910 + Math.sin(t * 0.2) * 6} ${190 + 700 * ease(t / 20)} 866`} stroke={P.ink} strokeWidth={8} fill="none" strokeLinecap="round" />
    <g transform={`translate(${lerp(260, 900, ease(t / 22))} 760) rotate(${-34 + Math.sin(t * 0.8) * 4})`}><path d="M 0 0 L 16 -60 Q 60 -260 150 -330 Q 120 -200 40 -50 Z" fill={P.ink} /><path d="M 0 0 l 10 -40" stroke={P.paper} strokeWidth={3} /></g>
    <Label t={t - 22} text="“little cigar”" y={1040} size={84} hand c={P.ink2} />
  </Sheet>
);
export const S25: S = ({ t }) => (
  <Sheet t={t}>
    <Cig x={150} y={640} s={4.0} kind="cigar" t={t} lit={0} />
    <Cig x={390} y={960} s={2.0} kind="hand" t={t} />
    <Smoke x={700} y={940} t={t} h={300} w={50} n={2} seed="g3" thick={16} />
    <path d="M 370 900 q -40 60 0 120 M 710 900 q 40 60 0 120" stroke={P.ember} strokeWidth={9} fill="none" strokeLinecap="round" />
    <Label t={t - 3} text="A LITTLE CIGAR" y={1110} size={84} c={P.ember} />
  </Sheet>
);

// ---------------------------------------------------------------- soldiers and slow hands
export const S26: S = ({ t }) => (
  <Sheet t={t}>
    <g transform="translate(540 700)" opacity={0.5}><circle r={330} fill="none" stroke={P.ink2} strokeWidth={8} />{[-0.7, -0.35, 0, 0.35, 0.7].map((q, i) => <ellipse key={i} rx={Math.abs(Math.sin(q * 1.4 + t * 0.012)) * 330} ry={330} fill="none" stroke={P.ink2} strokeWidth={5} />)}<path d="M -330 0 L 330 0 M -290 -160 L 290 -160 M -290 160 L 290 160" stroke={P.ink2} strokeWidth={5} /></g>
    <Ground y={1140} />
    {[0, 1, 2, 3].map((i) => { const x = ((i * 300 + t * 5) % 1300) - 110, sw = Math.sin(t * 0.32 + i * 1.3) * 26, [mx, my] = mouthOf(x, 1140, 1.25); return <g key={i}><Fig x={x} feet={1140} s={1.25} hat="kepi" rifle pose={{ lF: sw, lB: -sw, aF: [-sw * 0.6, 14], aB: [sw * 0.6, 10] }} /><Ember x={mx + 6} y={my + 6} r={7} t={t + i * 5} /><Smoke x={mx + 8} y={my} t={t + i * 9} h={170} w={30} n={1} seed={`h${i}`} thick={12} drift={-90} /></g>; })}
  </Sheet>
);
export const S27: S = ({ t }) => {
  const n = Math.min(4, Math.floor(t / 16)), k = (t % 16) / 16;
  return (
    <Sheet t={t}>
      <Hand x={330} y={560} s={1.15} r={-34 + Math.sin(k * Math.PI * 2) * 6} pinch={k} /><Hand x={750} y={560} s={1.15} r={34 - Math.sin(k * Math.PI * 2) * 6} pinch={k} />
      <Cig x={400} y={700} s={1.9} kind="hand" t={t} lit={0} r={Math.sin(k * Math.PI * 2) * 3} />
      <rect x={130} y={900} width={820} height={18} rx={8} fill={P.ink} />
      {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${200 + i * 180} 870) scale(${popIn(t - (i + 1) * 16, 5)})`}><Cig x={0} y={0} s={1.0} r={-90} kind="hand" t={t} lit={0} /></g>)}
      <Label t={t - 4} text="BY HAND" y={1080} size={96} />
    </Sheet>
  );
};
export const S28: S = ({ t }) => (
  <Sheet t={t}>
    <g transform="translate(540 1000) scale(0.8)"><circle r={150} fill={P.white} stroke={P.ink} strokeWidth={14} /><rect x={-22} y={-196} width={44} height={44} rx={8} fill={P.ink} /><path d={`M 0 0 L ${Math.sin(t * 0.21) * 110} ${-Math.cos(t * 0.21) * 110}`} stroke={P.ember} strokeWidth={12} strokeLinecap="round" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-4} y={-132} width={8} height={22} fill={P.ink} transform={`rotate(${i * 30})`} />)}<circle r={12} fill={P.ink} /></g>
    <Counter t={t} from={0} to={4} dur={16} sub="A MINUTE" y={640} color={P.ember} />
  </Sheet>
);

// ---------------------------------------------------------------- 1880: the machine
const Gear: React.FC<{ x: number; y: number; r: number; a: number; c?: string }> = ({ x, y, r, a, c = P.ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={-r * 0.16} y={-r * 1.2} width={r * 0.32} height={r * 0.5} fill={c} transform={`rotate(${i * 36})`} />)}<circle r={r} fill={c} /><circle r={r * 0.34} fill={P.paper} /></g>
);
export const S29: S = ({ t }) => (
  <Sheet t={t}>
    <g transform={`translate(540 640) scale(${popIn(t, 7)})`}><text {...T(310)}>1880</text></g>
    <path d="M 60 1150 L 60 900 L 220 800 L 220 900 L 380 800 L 380 900 L 540 800 L 540 900 L 700 800 L 700 1150 Z" fill={P.ink} />
    {[780, 880, 980].map((x, i) => <g key={x}><rect x={x - 34} y={760 - i * 30} width={68} height={390 + i * 30} fill={P.ink} /><Smoke x={x} y={760 - i * 30} t={t + i * 20} h={260} w={50} n={2} seed={`i1${i}`} thick={30} drift={120} /></g>)}
    {[120, 280, 440, 600].map((x, i) => <rect key={x} x={x} y={980} width={60} height={70} fill={P.ember} opacity={0.6 + 0.4 * Math.sin(t * 0.3 + i)} />)}
  </Sheet>
);
const Machine: React.FC<{ t: number; x?: number; y?: number; s?: number }> = ({ t, x = 660, y = 1130, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-460} width={600} height={400} rx={20} fill={P.ink} /><rect x={-340} y={-70} width={680} height={70} rx={10} fill={P.ink} />
    <path d="M -260 -460 L -300 -600 L -120 -600 L -160 -460 Z" fill={P.ink} />
    <Gear x={-150} y={-270} r={86} a={t * 4} c={P.paper2} /><Gear x={20} y={-200} r={62} a={-t * 5.5 + 12} c={P.ember} /><Gear x={150} y={-300} r={78} a={t * 4.4} c={P.paper2} />
    <rect x={220} y={-250} width={150} height={44} fill={P.ink} /><circle cx={-210} cy={-520} r={10 + (t % 8)} fill={P.ink2} opacity={0.4} />
  </g>
);
export const S30: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1130} />
    <Fig x={190} feet={1130} s={1.55} hat="bowler" pose={{ aF: [100, 20], aB: [-10, 30], lean: -4 }} />
    <Machine t={t} x={690} s={0.95} />
    <Smoke x={470} y={560} t={t} h={240} w={50} n={2} seed="i2" thick={24} />
    <Label t={t - 5} text="BONSACK'S MACHINE" y={530} size={60} x={600} />
  </Sheet>
);
const Stream: React.FC<{ t: number; rows?: number; speed?: number }> = ({ t, rows = 5, speed = 34 }) => (
  <g>{Array.from({ length: rows * 9 }, (_, i) => { const r = Math.floor(i / 9), k = i % 9, x = ((k * 190 + t * speed + r * 60) % 1700) - 300; return <Cig key={i} x={x} y={640 + r * 100 + x * 0.16} r={9} s={1.05} t={t} lit={0} />; })}</g>
);
export const S31: S = ({ t }) => (
  <Sheet t={t}>
    <g transform="translate(0 110)"><Stream t={t} rows={4} /></g>
    <Machine t={t * 2} x={130} y={1000} s={0.8} />
    <Counter t={t} from={0} to={88000} dur={36} y={600} color={P.ember} />
  </Sheet>
);
export const S32: S = ({ t }) => (
  <Sheet t={t}>
    <Stream t={t + 40} rows={7} speed={46} />
    <rect x={-400} y={430} width={W + 800} height={330} fill={P.paper} opacity={0.85} />
    <Counter t={t + 30} from={88000} to={120000} dur={44} sub="A DAY" y={620} color={P.ember} />
  </Sheet>
);

// ---------------------------------------------------------------- "you get it, buddy?"
export const S33: S = ({ t }) => (
  <Sheet t={t}>
    {Array.from({ length: 22 }, (_, i) => { const x = random(`jx${i}`) * W, y = ((t * (12 + random(`jv${i}`) * 10) + random(`jy${i}`) * 1900) % 2000) - 100; return <Cig key={i} x={x} y={y} r={random(`jr${i}`) * 360 + t * 3} s={0.9} t={t} lit={0} />; })}
    <rect x={-400} y={540} width={W + 800} height={330} fill={P.paper} opacity={0.86} />
    <Punch t={t} lines={['YOU GET IT,', 'BUDDY?']} color={P.ember} y={540} size={120} />
  </Sheet>
);
export const S34: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1140} />
    <g fill={P.ink}><rect x={130} y={840} width={150} height={300} rx={20} /><rect x={100} y={800} width={210} height={50} rx={14} /><path d="M 150 800 Q 205 700 260 800 Z" /><rect x={280} y={900} width={70} height={70} rx={10} /><rect x={90} y={1110} width={230} height={34} rx={10} /></g>
    {Array.from({ length: 30 }, (_, i) => { const life = ((t * 1.5 + i * 4) % 40) / 40, a = -0.75 + (i % 6) * 0.14, d = life * 900; return <Cig key={i} x={350 + Math.cos(a) * d} y={935 + Math.sin(a) * d + life * life * 320} r={a * 57 + life * 200} s={0.85} t={t} lit={0} />; })}
    <Label t={t - 3} text="LIKE A FIRE HYDRANT" y={570} size={66} />
  </Sheet>
);

// ---------------------------------------------------------------- the part nobody rolled into the paper
const Person: React.FC<{ x: number; y: number; s?: number; c?: string; o?: number }> = ({ x, y, s = 1, c = P.paper2, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}><circle cy={-84} r={20} fill={c} /><path d="M -24 -58 Q 0 -70 24 -58 L 18 4 L -18 4 Z" fill={c} /></g>
);
export const S35: S = ({ t }) => {
  const k = ease(t / 20);
  return (
    <Sheet t={t} dark>
      <g transform="translate(540 800) rotate(-4)">
        <rect x={-320 * k - 30} y={-220} width={(320 * k + 30) * 2} height={440} fill={P.white} stroke={P.paper2} strokeWidth={6} />
        {[-150, -90, -30, 30, 90, 150].map((y, i) => <rect key={i} x={-270 * k} y={y} width={540 * k * (i % 2 ? 0.8 : 1)} height={7} fill={P.ink2} opacity={0.18} />)}
        <g opacity={0.5 * ease((t - 20) / 22)} fill={P.ash}><path d="M -110 -30 Q -110 -160 0 -160 Q 110 -160 110 -30 Q 110 40 60 60 L 60 110 L -60 110 L -60 60 Q -110 40 -110 -30 Z" /><g fill={P.white}><circle cx={-44} cy={-40} r={30} /><circle cx={44} cy={-40} r={30} /><path d="M 0 0 l 16 34 l -32 0 Z" />{[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 5} y={66} width={10} height={44} />)}</g></g>
      </g>
      {Array.from({ length: 24 }, (_, i) => <path key={i} d="M 0 0 q 14 -6 30 2" stroke={P.ink2} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.9} transform={`translate(${200 + random(`kx${i}`) * 700} ${1070 + random(`ky${i}`) * 70}) rotate(${random(`kr${i}`) * 180})`} />)}
    </Sheet>
  );
};
const CROWD = Array.from({ length: 28 }, (_, i) => ({ x: 140 + (i % 7) * 134, y: 800 + Math.floor(i / 7) * 112, order: random(`co${i}`) }));
export const S36: S = ({ t }) => (
  <Sheet t={t} dark>
    {CROWD.map((p, i) => <Person key={i} x={p.x} y={p.y} o={clamp((t - p.order * 14) / 5)} />)}
    <Smoke x={200} y={1220} t={t} h={900} w={220} n={4} c={P.paper} o={0.16} seed="k2" thick={90} drift={500} />
    <Label t={t - 2} text="TODAY" y={540} size={100} c={P.paper} />
  </Sheet>
);
export const S37: S = ({ t }) => (
  <Sheet t={t} dark>
    {CROWD.map((p, i) => { const g = clamp((t - 6 - p.order * 44) / 12); return <g key={i}><Person x={p.x} y={p.y - g * 26} c={g > 0 ? P.ash : P.paper2} o={1 - g * 0.85} />{g > 0 && g < 1 ? Array.from({ length: 5 }, (_, j) => <rect key={j} x={p.x - 20 + j * 9} y={p.y - 60 - g * 90 - j * 8} width={8} height={8} fill={P.ash} opacity={1 - g} />) : null}</g>; })}
    <Counter t={t} from={0} to={8000000} dur={46} sub="PEOPLE A YEAR" y={600} color={P.ember} />
  </Sheet>
);
export const S38: S = ({ t }) => (
  <Sheet t={t} dark>
    <Punch t={t} lines={["THAT'S", 'REAL.']} color={P.ember} y={540} size={190} />
    <path d={`M 200 1010 L ${200 + 680 * ease(t / 8)} 1000`} stroke={P.ember} strokeWidth={16} strokeLinecap="round" />
  </Sheet>
);

// ---------------------------------------------------------------- back on the sidewalk
export const S39: S = ({ t }) => (
  <Sheet t={t}>
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-100 + i * 360} 860 L ${-220 + i * 420} 1260`} stroke={P.ink2} strokeWidth={6} opacity={0.5} />)}
    <path d="M -100 860 L 1200 860 M -100 1040 L 1200 1040" stroke={P.ink2} strokeWidth={6} opacity={0.5} /><rect x={-100} y={800} width={1300} height={60} fill={P.ink} opacity={0.85} />
    <Cig x={520} y={1000} r={-12} kind="cig" len={62} t={t} lit={0.7} s={1.5} />
    <Smoke x={626} y={975} t={t} h={330} w={50} n={2} seed="l1" thick={14} />
    <g transform={`translate(${lerp(-300, 1300, clamp(t / 50))} ${930 - Math.abs(Math.sin(t * 0.25)) * 50})`}><path d="M -150 -10 Q -160 -110 -70 -120 L 20 -110 Q 120 -70 170 -40 Q 200 -10 170 0 L -150 0 Z" fill={P.ink} /><rect x={-155} y={-2} width={340} height={26} rx={10} fill={P.white} stroke={P.ink} strokeWidth={6} /><path d="M -150 -120 L -130 -520 L 10 -520 L 20 -110 Z" fill={P.ink} /></g>
  </Sheet>
);
export const S40: S = ({ t }) => {
  const cast: [Hat, boolean][] = [['feather', true], ['sailor', false], ['brim', true], ['hood', true], ['kepi', false], ['bowler', false]];
  return (
    <Sheet t={t}>
      <Cobbles y={1090} rows={2} />
      <Cig x={130} y={1090} r={-10} kind="cig" len={62} t={t} lit={0.8} s={2.2} />
      <Smoke x={290} y={1050} t={t} h={700} w={120} n={4} seed="l2" thick={50} drift={560} o={0.3} />
      <g filter="url(#smk)" opacity={0.6}>{cast.map(([hat, robe], i) => <g key={i} opacity={clamp((t - 6 - i * 7) / 8)}><Fig x={300 + i * 118} feet={1010 - i * 78} s={0.62 + i * 0.03} hat={hat} robe={robe} c={P.ink2} pose={i % 2 ? SMOKING : {}} /></g>)}</g>
      <Label t={t - 30} text="where it all started" x={420} y={600} size={76} hand c={P.ink} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- stubbed out
export const S41: S = ({ t }) => {
  const k = ease(t / 14);
  return (
    <Sheet t={t}>
      <ellipse cx={540} cy={1020} rx={330} ry={90} fill={P.ink} /><ellipse cx={540} cy={1000} rx={280} ry={64} fill={P.ink2} />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={420 + random(`ax${i}`) * 240} y={985 + random(`ay${i}`) * 30} width={12} height={9} fill={P.ash} />)}
      <Cig x={lerp(360, 470, k)} y={lerp(560, 900, k)} r={lerp(20, 62, k)} kind="cig" len={84} t={t} lit={1 - clamp((t - 14) / 10)} s={2.0} />
      <Smoke x={548} y={980} t={t} h={520} w={90} n={3} seed="m1" thick={26} o={0.45 * (1 - clamp((t - 40) / 30))} />
      <Label t={t - 6} text="THAT'S ABOUT IT, FOLKS" y={560} size={60} />
    </Sheet>
  );
};
export const S42: S = ({ t }) => (
  <Sheet t={t}>
    <g transform={`translate(540 600) rotate(-3) scale(${popIn(t, 7)})`}><rect x={-300} y={-90} width={600} height={170} rx={20} fill={P.ember} stroke={P.ink} strokeWidth={10} /><text y={34} {...T(110, P.white)} stroke={P.ink} strokeWidth={10} paintOrder="stroke">FOLLOW</text></g>
    <Label t={t - 8} text="for more strange history" y={780} size={66} hand c={P.ink2} rot={-2} />
    <Smoke x={540} y={1160} t={t} h={240} w={60} n={3} seed="m2" thick={30} />
    <g filter="url(#smk)" opacity={0.78 * ease((t - 44) / 14)}><text x={540} y={1010} {...T(190, P.ink2)}>SEE YA!</text></g>
    <Cig x={420} y={1180} r={-90} kind="cig" len={70} t={t} lit={0.8} s={1.6} />
  </Sheet>
);
