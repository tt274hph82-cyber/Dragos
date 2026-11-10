import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, Punch, Counter } from '../molasses/kit';
import timeline from './timeline.json';

// "Who invented the pencil?" A story Reel drawn like pencil sketches on lined notebook paper: graphite
// hatching, smudges, things rubbed out on screen, and only two colours (the yellow pencil, its pink eraser).
// The progress bar is a pencil that is sharpened shorter as the film plays. All SVG drawn in code.

type S = React.FC<ShotProps>;
const P = { paper: '#F7F3E8', rule: '#A9CBEA', margin: '#EE9A9A', g: '#34343B', g2: '#7C7C86', g3: '#BDBDC6', yellow: '#F6C12B', pink: '#F291A8', wood: '#EBCB9E', dark: '#2A2A31' };
const ease = (x: number) => easeOut(clamp(x));
const HAT = 'url(#hat)', HAT2 = 'url(#hat2)';
const T = (size: number, c: string = P.g, w = 800) => ({ textAnchor: 'middle' as const, fontFamily: FONT.title, fontWeight: w, fontSize: size, fill: c });

// ---------------------------------------------------------------- the notebook page
/** A notebook page (or a graphite-rubbed dark page): rules, margin, hatch patterns, and a "boil" that
 *  redraws the pencil line every 4 frames. */
const Sheet: React.FC<{ t: number; dark?: boolean; children: React.ReactNode }> = ({ t, dark, children }) => (
  <g>
    <defs>
      <filter id="bo" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency={0.025} numOctaves={2} seed={Math.floor(t / 4)} /><feDisplacementMap in="SourceGraphic" scale={6} /></filter>
      <pattern id="hat" width={11} height={11} patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width={11} height={11} fill={dark ? P.paper : P.g} opacity={0.3} /><rect width={11} height={5.5} fill={dark ? P.paper : P.g} /></pattern>
      <pattern id="hat2" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><rect width={16} height={4} fill={dark ? P.paper : P.g2} /></pattern>
      <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={dark ? 0.55 : 0.2} /></radialGradient>
    </defs>
    <rect x={-400} y={-400} width={W + 800} height={2720} fill={dark ? P.dark : P.paper} />
    {dark ? Array.from({ length: 46 }, (_, i) => <path key={i} d={`M ${-200 + random(`dx${i}`) * 1000} ${random(`dy${i}`) * 1920} l ${500 + random(`dl${i}`) * 500} ${-120 + random(`dk${i}`) * 80}`} stroke={P.paper} strokeWidth={10} opacity={0.035} strokeLinecap="round" />) : null}
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-400} y={-200 + i * 78} width={W + 800} height={3} fill={P.rule} opacity={dark ? 0.12 : 0.75} />)}
    <rect x={118} y={-400} width={4} height={2720} fill={P.margin} opacity={dark ? 0.2 : 0.8} />
    <g filter="url(#bo)">{children}</g>
    <rect x={-400} y={-400} width={W + 800} height={2720} fill="url(#vig)" />
  </g>
);
const ink = (dark?: boolean) => (dark ? P.paper : P.g);

// ---------------------------------------------------------------- pencil things
/** A pencil pointing right. kind: modern (yellow, eraser), wood (bare wood, no eraser), stick (raw graphite). */
const Pencil: React.FC<{ x: number; y: number; len?: number; s?: number; r?: number; kind?: 'modern' | 'wood' | 'stick'; eraser?: boolean }> = ({ x, y, len = 420, s = 1, r = 0, kind = 'modern', eraser = true }) => {
  const H = 44, body = kind === 'modern' ? P.yellow : P.wood;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {kind === 'stick' ? <path d={`M 0 -14 L ${len - 30} -16 L ${len} 0 L ${len - 30} 16 L 0 14 Z`} fill={P.g} stroke={P.g} strokeWidth={5} strokeLinejoin="round" /> : <>
        {kind === 'modern' && eraser ? <><rect x={0} y={-H / 2} width={40} height={H} rx={10} fill={P.pink} stroke={P.g} strokeWidth={5} /><rect x={36} y={-H / 2 - 2} width={30} height={H + 4} fill={P.g3} stroke={P.g} strokeWidth={5} /><path d={`M 46 ${-H / 2} l 0 ${H} M 56 ${-H / 2} l 0 ${H}`} stroke={P.g} strokeWidth={3} /></> : null}
        <rect x={kind === 'modern' && eraser ? 66 : 0} y={-H / 2} width={len - 84 - (kind === 'modern' && eraser ? 66 : 0)} height={H} fill={body} stroke={P.g} strokeWidth={5} />
        <path d={`M ${kind === 'modern' && eraser ? 66 : 0} -7 L ${len - 84} -7 M ${kind === 'modern' && eraser ? 66 : 0} 8 L ${len - 84} 8`} stroke={P.g} strokeWidth={3} opacity={0.35} />
        <path d={`M ${len - 84} ${-H / 2} L ${len} 0 L ${len - 84} ${H / 2} Z`} fill={P.wood} stroke={P.g} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${len - 26} -7 L ${len} 0 L ${len - 26} 7 Z`} fill={P.g} />
      </>}
    </g>
  );
};
const Rock: React.FC<{ x: number; y: number; s?: number; t: number; shine?: boolean; dark?: boolean }> = ({ x, y, s = 1, t, shine = true, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -90 20 L -70 -50 L -10 -80 L 60 -60 L 96 0 L 60 56 L -30 66 Z" fill={dark ? '#0E0E12' : P.g} stroke={dark ? P.paper : P.g} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -70 -50 L -20 -10 L -30 66 M -20 -10 L 60 -60 M -20 -10 L 96 0" stroke={dark ? P.paper : P.paper} strokeWidth={4} opacity={0.45} fill="none" />
    {shine ? [[-50, -84], [80, -50], [30, -100]].map(([sx, sy], i) => <path key={i} d="M 0 -24 L 7 -7 L 24 0 L 7 7 L 0 24 L -7 7 L -24 0 L -7 -7 Z" fill={P.yellow} stroke={P.g} strokeWidth={3} transform={`translate(${sx} ${sy}) scale(${0.5 + 0.6 * Math.abs(Math.sin(t * 0.22 + i * 2))})`} />) : null}
  </g>
);
const Sparkle: React.FC<{ x: number; y: number; t: number; i?: number; s?: number }> = ({ x, y, t, i = 0, s = 1 }) => (
  <path d="M 0 -30 L 9 -9 L 30 0 L 9 9 L 0 30 L -9 9 L -30 0 L -9 -9 Z" fill={P.yellow} stroke={P.g} strokeWidth={4} transform={`translate(${x} ${y}) scale(${s * (0.5 + 0.6 * Math.abs(Math.sin(t * 0.2 + i * 1.7)))})`} />
);
const Eraser: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><rect x={-110} y={-50} width={220} height={100} rx={18} fill={P.pink} stroke={P.g} strokeWidth={7} /><rect x={-30} y={-50} width={90} height={100} fill="#FFFFFF" stroke={P.g} strokeWidth={7} opacity={0.9} /></g>
);
const Crumbs: React.FC<{ x: number; y: number; t: number; n?: number; seed?: string; c?: string }> = ({ x, y, t, n = 10, seed = 'c', c = P.pink }) => (
  <g>{Array.from({ length: n }, (_, i) => { const life = (t * 0.9 + random(`${seed}l${i}`) * 30) % 30; return <rect key={i} x={x + (random(`${seed}x${i}`) - 0.5) * 240 + life * 2} y={y + life * life * 0.5} width={12} height={7} rx={3} fill={c} stroke={P.g} strokeWidth={2} opacity={clamp(1.2 - life / 30)} transform={`rotate(${random(`${seed}r${i}`) * 90} ${x} ${y})`} />; })}</g>
);

// ---------------------------------------------------------------- sketch figures
type Arm = [number, number];
type Pose = { aF?: Arm; aB?: Arm; lF?: number; lB?: number; lean?: number };
type Hat = 'none' | 'brim' | 'hood' | 'tricorn' | 'bicorne' | 'top' | 'cap';
const pt = (x: number, y: number, len: number, deg: number): [number, number] => [x + len * Math.sin((deg * Math.PI) / 180), y + len * Math.cos((deg * Math.PI) / 180)];
/** A pencil-shaded person facing right (flip to face left): a soft tone under a diagonal hatch. */
const Fig: React.FC<{ x: number; feet: number; s?: number; pose?: Pose; hat?: Hat; flip?: boolean; held?: React.ReactNode; robe?: boolean; crook?: boolean; gun?: boolean; patch?: boolean; dark?: boolean }> = ({ x, feet, s = 1, pose = {}, hat = 'none', flip, held, robe, crook, gun, patch, dark }) => {
  const { aF = [10, 10], aB = [-8, 6], lF = 6, lB = -6, lean = 0 } = pose;
  const limb = (x0: number, y0: number, a: Arm) => { const e = pt(x0, y0, 62, a[0]), h = pt(e[0], e[1], 62, a[0] + a[1]); return { d: `M ${x0} ${y0} L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`, h }; };
  const front = limb(8, -248, aF), back = limb(-8, -248, aB), legF = pt(10, -136, 138, lF), legB = pt(-10, -136, 138, lB);
  const body = (c: string, o: number) => (
    <g opacity={o}>
      <path d={`M -10 -136 L ${legB[0]} ${legB[1]} l 22 0`} stroke={c} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M 10 -136 L ${legF[0]} ${legF[1]} l 24 0`} stroke={c} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g transform={`rotate(${lean} 0 -140)`}>
        <path d={back.d} stroke={c} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {gun ? <path d="M -40 -110 L 44 -440 M 30 -390 l 26 6" stroke={c} strokeWidth={11} strokeLinecap="round" /> : null}
        <path d="M -44 -262 Q 0 -282 44 -262 L 36 -128 Q 0 -116 -36 -128 Z" fill={c} />
        {robe ? <path d="M -40 -200 L -62 -20 L -30 -34 L -6 -14 L 20 -34 L 58 -18 L 40 -200 Z" fill={c} /> : null}
        <rect x={-12} y={-292} width={24} height={30} fill={c} /><circle cx={0} cy={-318} r={36} fill={c} /><path d="M 30 -326 l 14 8 l -14 8 Z" fill={c} />
        {hat === 'brim' ? <g><ellipse cx={0} cy={-346} rx={78} ry={12} fill={c} /><path d="M -32 -346 Q -30 -396 0 -398 Q 30 -396 32 -346 Z" fill={c} /></g> : null}
        {hat === 'hood' ? <path d="M -46 -296 Q -56 -380 2 -380 Q 52 -378 44 -300 L 60 -246 L -62 -246 Z" fill={c} /> : null}
        {hat === 'tricorn' ? <path d="M -78 -340 Q -40 -372 0 -388 Q 40 -372 78 -340 Q 40 -350 0 -346 Q -40 -350 -78 -340 Z" fill={c} /> : null}
        {hat === 'bicorne' ? <path d="M -84 -338 Q -60 -410 0 -420 Q 60 -410 84 -338 Q 0 -362 -84 -338 Z" fill={c} /> : null}
        {hat === 'top' ? <g><rect x={-32} y={-420} width={64} height={78} fill={c} /><rect x={-56} y={-350} width={112} height={12} rx={5} fill={c} /></g> : null}
        {hat === 'cap' ? <g><path d="M -36 -340 Q -34 -384 2 -384 Q 36 -382 36 -340 Z" fill={c} /><path d="M 30 -344 L 70 -338" stroke={c} strokeWidth={10} strokeLinecap="round" /></g> : null}
        <path d={front.d} stroke={c} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {crook ? <path d={`M ${front.h[0]} ${front.h[1] + 170} L ${front.h[0]} ${front.h[1] - 150} q 0 -60 46 -60 q 40 4 34 44`} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" /> : null}
      </g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${feet}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {body(ink(dark), 0.32)}{body(HAT, 1)}
      <g transform={`rotate(${lean} 0 -140)`}>
        {patch ? <g><rect x={6} y={-332} width={26} height={20} rx={5} fill={P.g} /><path d="M -34 -340 L 34 -320" stroke={P.g} strokeWidth={5} /></g> : null}
        {held ? <g transform={`translate(${front.h[0]} ${front.h[1]})`}>{held}</g> : null}
      </g>
    </g>
  );
};
const Sheep: React.FC<{ x: number; y: number; s?: number; t: number; mark?: number; flip?: boolean; i?: number }> = ({ x, y, s = 1, t, mark = 0, flip, i = 0 }) => (
  <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 0.25 + i * 1.3)) * 6}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {[-50, -16, 20, 54].map((lx) => <rect key={lx} x={lx - 7} y={-50} width={14} height={52} rx={6} fill={P.g} />)}
    {[[-60, -90, 46], [-10, -116, 54], [50, -100, 48], [-40, -60, 44], [30, -62, 48], [76, -76, 34]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={P.g} strokeWidth={6} />)}
    {[[-60, -90, 40], [-10, -116, 48], [50, -100, 42], [-40, -60, 38], [30, -62, 42]].map(([cx, cy, r], k) => <circle key={k} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
    <ellipse cx={108} cy={-104} rx={34} ry={28} fill={P.g} /><path d="M 86 -122 l -22 -8 l 14 22 Z" fill={P.g} /><circle cx={118} cy={-110} r={5} fill="#FFFFFF" />
    {mark > 0 ? <path d="M -40 -120 L 30 -60 M 30 -120 L -40 -60" stroke={P.g} strokeWidth={16} strokeLinecap="round" opacity={mark} /> : null}
  </g>
);
const Hills: React.FC<{ y: number; dark?: boolean }> = ({ y, dark }) => (
  <g><path d={`M -300 ${y} Q 100 ${y - 200} 420 ${y - 40} T 1000 ${y - 80} T 1500 ${y} L 1500 ${y + 260} L -300 ${y + 260} Z`} fill={HAT2} opacity={0.6} /><path d={`M -300 ${y} Q 100 ${y - 200} 420 ${y - 40} T 1000 ${y - 80} T 1500 ${y}`} stroke={ink(dark)} strokeWidth={7} fill="none" strokeLinecap="round" /></g>
);
const Ground: React.FC<{ y: number; dark?: boolean }> = ({ y, dark }) => (
  <g><path d={`M -300 ${y} Q 270 ${y - 8} 540 ${y + 3} T 1400 ${y}`} stroke={ink(dark)} strokeWidth={8} fill="none" strokeLinecap="round" />{Array.from({ length: 18 }, (_, i) => <path key={i} d={`M ${random(`gx${i}`) * W} ${y + 16 + random(`gy${i}`) * 60} l ${20 + random(`gl${i}`) * 40} -12`} stroke={ink(dark)} strokeWidth={4} opacity={0.4} strokeLinecap="round" />)}</g>
);
const Tree: React.FC<{ x: number; y: number; s?: number; tilt?: number; roots?: boolean; t: number }> = ({ x, y, s = 1, tilt = 0, roots, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    {roots ? [[-150, 90], [-70, 130], [10, 150], [90, 120], [160, 80]].map(([rx, ry], i) => <path key={i} d={`M ${rx * 0.2} 0 Q ${rx * 0.7} ${ry * 0.4} ${rx} ${ry}`} stroke={P.g} strokeWidth={14 - i} fill="none" strokeLinecap="round" />) : null}
    <path d="M -46 0 L -34 -360 L 34 -360 L 50 0 Z" fill={HAT} stroke={P.g} strokeWidth={7} strokeLinejoin="round" />
    {[[-120, -420, 120], [100, -430, 130], [0, -540, 150], [-30, -400, 110]].map(([cx, cy, r], i) => <circle key={i} cx={cx + Math.sin(t * 0.3 + i) * 6} cy={cy} r={r} fill={P.paper} stroke={P.g} strokeWidth={7} />)}
    {[[-120, -420, 120], [100, -430, 130], [0, -540, 150]].map(([cx, cy, r], i) => <circle key={i} cx={cx + Math.sin(t * 0.3 + i) * 6} cy={cy} r={r - 14} fill={HAT2} opacity={0.8} />)}
  </g>
);
const Rain: React.FC<{ t: number; c?: string; n?: number }> = ({ t, c = P.g, n = 50 }) => (
  <g opacity={0.6}>{Array.from({ length: n }, (_, i) => { const y = ((t * (46 + random(`rv${i}`) * 26) + random(`ry${i}`) * 1700) % 1700) + 200, x = random(`rx${i}`) * 1300 - y * 0.25; return <path key={i} d={`M ${x} ${y} l -14 56`} stroke={c} strokeWidth={5} strokeLinecap="round" />; })}</g>
);
const Bolt: React.FC<{ x: number; y: number; s?: number; on: boolean }> = ({ x, y, s = 1, on }) => (
  on ? <path d="M 0 0 L -70 170 L -10 170 L -80 380 L 70 130 L 10 130 L 60 0 Z" fill={P.yellow} stroke={P.g} strokeWidth={8} strokeLinejoin="round" transform={`translate(${x} ${y}) scale(${s})`} /> : null
);
const Cloud: React.FC<{ x: number; y: number; s?: number; t: number; dark?: boolean }> = ({ x, y, s = 1, t, dark }) => (
  <g transform={`translate(${x + Math.sin(t * 0.1) * 10} ${y}) scale(${s})`}>
    {[[-170, 20, 90], [-70, -40, 120], [70, -30, 130], [180, 20, 90], [0, 40, 110]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={dark ? P.dark : P.paper} stroke={ink(dark)} strokeWidth={8} />)}
    {[[-170, 20, 80], [-70, -40, 110], [70, -30, 120], [180, 20, 80], [0, 40, 104]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={HAT} opacity={0.75} />)}
  </g>
);
const Label: React.FC<{ t: number; text: string; x?: number; y: number; size?: number; c?: string; rot?: number; hand?: boolean }> = ({ t, text, x = 540, y, size = 70, c = P.g, rot = -3, hand = true }) => (
  t <= 0 ? null : <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${popIn(t, 6)})`}><text {...T(size, c)} fontFamily={hand ? FONT.hand : FONT.title} fontWeight={hand ? 700 : 800}>{text}</text></g>
);
const Hand: React.FC<{ x: number; y: number; s?: number; r?: number; pinch?: number; smudge?: boolean }> = ({ x, y, s = 1, r = 0, pinch = 0, smudge }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M -60 -300 L -70 -80 Q -76 -10 -30 0 L 30 0 Q 70 -10 64 -80 L 60 -300 Z" fill={P.paper} stroke={P.g} strokeWidth={8} />
    <path d={`M -44 -10 Q -52 60 ${-20 + pinch * 14} 96`} stroke={P.g} strokeWidth={38} strokeLinecap="round" fill="none" /><path d={`M -44 -10 Q -52 60 ${-20 + pinch * 14} 96`} stroke={P.paper} strokeWidth={24} strokeLinecap="round" fill="none" />
    <path d={`M 40 -10 Q 56 60 ${24 - pinch * 14} 96`} stroke={P.g} strokeWidth={38} strokeLinecap="round" fill="none" /><path d={`M 40 -10 Q 56 60 ${24 - pinch * 14} 96`} stroke={P.paper} strokeWidth={24} strokeLinecap="round" fill="none" />
    {smudge ? <><circle cx={-20 + pinch * 14} cy={92} r={14} fill={P.g} opacity={0.7} /><circle cx={24 - pinch * 14} cy={92} r={14} fill={P.g} opacity={0.7} /><ellipse cx={0} cy={-60} rx={40} ry={30} fill={P.g} opacity={0.25} /></> : null}
  </g>
);

// ---------------------------------------------------------------- the progress bar: a pencil sharpened shorter
const TOTAL = (timeline as any).total as number;
export const PencilBar: React.FC<{ f: number }> = ({ f }) => {
  const p = clamp(f / (TOTAL - 60)), len = 600 - 400 * p;
  return (
    <g transform="translate(0 330)">
      <path d={`M 250 28 L ${250 + len - 6} 28`} stroke={P.g} strokeWidth={5} strokeLinecap="round" opacity={0.5} strokeDasharray="2 12" />
      <Pencil x={250} y={0} len={len} s={1} />
      {Array.from({ length: 4 }, (_, i) => { const life = (f * 0.6 + i * 21) % 84; return <path key={i} d="M 0 0 q 12 -14 24 0 q -12 10 -24 0 Z" fill={P.wood} stroke={P.g} strokeWidth={3} transform={`translate(${250 + len - 50 + i * 8 + life * 0.6} ${22 + life * 1.3}) rotate(${life * 6})`} opacity={clamp(1 - life / 84)} />; })}
    </g>
  );
};

// ---------------------------------------------------------------- the hook
export const S1: S = ({ t }) => (
  <Sheet t={t} dark>
    <Cloud x={540} y={980} s={1.4} t={t} dark />
    <Rain t={t} c={P.paper} />
    <Bolt x={600} y={980} s={0.9} on={t % 26 < 5 || (t > 8 && t < 12)} />
    <Punch t={t - 3} lines={['INVENTED', 'BY A STORM']} color={P.yellow} kicker="THE PENCIL" y={530} />
  </Sheet>
);
export const S2: S = ({ t }) => (
  <Sheet t={t}>
    <Hills y={1000} />
    {[[200, 1090, 1.0], [470, 1140, 1.25], [800, 1080, 1.05], [960, 1170, 0.9], [90, 1190, 0.85]].map(([x, y, s], i) => <Sheep key={i} x={x} y={y} s={s} t={t} i={i} flip={i % 2 === 1} mark={i === 1 ? 1 : 0} />)}
    <Label t={t - 3} text="…and a flock of sheep" y={620} size={84} />
  </Sheet>
);
export const S3: S = ({ t }) => {
  const k = ease(t / 26);
  return (
    <Sheet t={t}>
      <g transform="translate(540 640) rotate(-4)"><text {...T(108)} opacity={clamp(t / 4)}>WHO INVENTED</text></g>
      <g transform={`translate(540 800) rotate(-4) scale(${popIn(t - 8, 7)})`}><text {...T(140, P.yellow)} stroke={P.g} strokeWidth={12} paintOrder="stroke">THE PENCIL?</text></g>
      <path d={`M 150 870 Q 400 ${900} ${150 + 780 * k} 856`} stroke={P.g} strokeWidth={10} fill="none" strokeLinecap="round" />
      <Pencil x={150 + 780 * k - 10} y={850} len={420} r={-70} s={1.0} />
    </Sheet>
  );
};
export const S4: S = ({ t }) => {
  const k = ease(t / 26), x = lerp(150, 940, k);
  const stops: [number, string][] = [[240, '1564'], [540, '1795'], [840, '1858']];
  return (
    <Sheet t={t}>
      <path d={`M 150 860 L ${x} 860`} stroke={P.g} strokeWidth={10} strokeLinecap="round" />
      {stops.map(([sx, name], i) => (x > sx ? <g key={i} transform={`translate(${sx} 860) scale(${popIn((x - sx) / 16, 5)})`}><circle r={24} fill={i === 2 ? P.pink : i === 1 ? P.yellow : P.g} stroke={P.g} strokeWidth={6} /><text y={-56} {...T(60)} fontFamily={FONT.hand}>{name}</text></g> : null))}
      <Pencil x={x - 16} y={840} len={420} r={-122} s={1.15} />
      <Label t={t - 4} text="let me sketch it out" y={1080} size={70} c={P.g2} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- England, 1564: the storm
export const S5: S = ({ t }) => (
  <Sheet t={t}>
    <Hills y={980} /><Tree x={760} y={1010} s={0.75} t={t} />
    {[[240, 1100, 0.8], [420, 1150, 0.9]].map(([x, y, s], i) => <Sheep key={i} x={x} y={y} s={s} t={t} i={i} />)}
    <g transform={`translate(430 640) rotate(-3) scale(${popIn(t, 7)})`}><text {...T(92)}>ENGLAND</text></g>
    <g transform={`translate(430 780) rotate(-3) scale(${popIn(t - 8, 7)})`}><text {...T(150)}>1564</text></g>
  </Sheet>
);
export const S6: S = ({ t }) => (
  <Sheet t={t}>
    <g transform="translate(470 820) rotate(-3)"><text {...T(260)}>1564</text></g>
    <Label t={t - 6} text="-ish" x={880} y={840} size={130} c={P.g2} rot={8} />
    <path d={`M 250 900 q 60 -30 120 0 q 60 30 120 0 q 60 -30 ${120 * ease((t - 10) / 10)} 0`} stroke={P.g2} strokeWidth={9} fill="none" strokeLinecap="round" />
    <Label t={t - 14} text="(or thereabouts)" y={1040} size={70} c={P.g2} />
  </Sheet>
);
export const S7: S = ({ t }) => (
  <Sheet t={t} dark>
    <Cloud x={300} y={600} s={1.1} t={t} dark /><Cloud x={800} y={680} s={0.9} t={t + 30} dark />
    <Ground y={1140} dark />
    <g opacity={0.95}><Tree x={560} y={1140} s={0.95} t={t * 3} tilt={8 + Math.sin(t * 0.5) * 7} /></g>
    <Rain t={t} c={P.paper} n={70} />
    <Bolt x={420} y={660} s={0.8} on={(t > 4 && t < 9) || (t > 28 && t < 32)} />
  </Sheet>
);
export const S8: S = ({ t }) => {
  const k = ease(t / 16);
  return (
    <Sheet t={t} dark>
      <Ground y={1140} dark />
      <ellipse cx={420} cy={1150} rx={200} ry={46} fill="#0E0E12" stroke={P.paper} strokeWidth={6} />
      <Tree x={420 + k * 60} y={1130 - k * 30} s={0.95} t={t} tilt={8 + k * 72} roots />
      <Rain t={t} c={P.paper} n={60} />
      {t < 22 ? Array.from({ length: 12 }, (_, i) => <circle key={i} cx={420 + Math.cos(i * 0.6) * (40 + t * 12)} cy={1130 - Math.abs(Math.sin(i * 0.6)) * (30 + t * 14) + t * t * 0.5} r={12} fill={P.paper} opacity={clamp(1 - t / 22)} />) : null}
      <Label t={t - 14} text="CRAAACK!" x={700} y={620} size={110} c={P.yellow} hand={false} rot={-8} />
    </Sheet>
  );
};
export const S9: S = ({ t }) => (
  <Sheet t={t} dark>
    <path d="M -100 620 L 1200 620" stroke={P.paper} strokeWidth={8} />
    {[[150, 620, 320], [340, 620, 260], [540, 620, 380], [760, 620, 240], [930, 620, 330]].map(([x, y, l], i) => <path key={i} d={`M ${x} ${y} q ${Math.sin(i * 2) * 80} ${l * 0.5} ${Math.cos(i) * 60} ${l}`} stroke={P.paper} strokeWidth={16 - i * 2} fill="none" strokeLinecap="round" opacity={0.8} />)}
    <Rock x={540} y={1040} s={1.9} t={t} dark />
    
  </Sheet>
);
export const S10: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1140} />
    <Fig x={230} feet={1140} s={1.5} hat="brim" robe crook pose={{ aF: [50, 30], lean: 12 }} />
    <Fig x={860} feet={1140} s={1.45} hat="brim" robe flip pose={{ aF: [120, 20], aB: [100, 20], lean: 14 }} />
    <Rock x={545} y={1100} s={1.0} t={t} />
    <g transform={`translate(545 600) scale(${popIn(t - 6, 5)})`}><text {...T(170)}>?</text></g>
  </Sheet>
);
export const S11: S = ({ t }) => (
  <Sheet t={t}>
    <Hand x={540} y={760} s={1.5} r={0} pinch={0.5 + Math.sin(t * 0.5) * 0.5} smudge />
    <Rock x={540} y={940} s={0.9} t={t} shine={false} />
    {[0, 1, 2].map((i) => <ellipse key={i} cx={300 + i * 240} cy={1130} rx={90} ry={22} fill={P.g} opacity={0.18 + i * 0.06} />)}
    <Label t={t - 2} text="SOFT." x={300} y={640} size={130} hand={false} />
  </Sheet>
);
export const S12: S = ({ t }) => (
  <Sheet t={t}>
    <Rock x={540} y={920} s={2.3} t={t} />
    {[[240, 700], [860, 760], [300, 1080], [800, 1100], [540, 620]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} t={t} i={i} s={1.6} />)}
    <Label t={t - 2} text="SHINY." x={760} y={640} size={130} hand={false} rot={5} />
  </Sheet>
);
export const S13: S = ({ t }) => {
  const k = ease(t / 22), x = lerp(200, 880, k);
  return (
    <Sheet t={t}>
      <path d="M 120 760 L 960 720 L 1000 1060 L 100 1100 Z" fill="#FFFFFF" stroke={P.g} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M 200 920 ` + Array.from({ length: Math.floor(k * 12) }, (_, i) => `q 28 ${i % 2 ? 80 : -80} 56 0`).join(' ')} stroke={P.g} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rock x={x} y={880} s={0.75} t={t} shine={false} />
      <Label t={t - 18} text="IT WRITES!" y={620} size={120} hand={false} c={P.g} />
    </Sheet>
  );
};
export const S14: S = ({ t }) => (
  <Sheet t={t}>
    <Hills y={1000} />
    <Fig x={250} feet={1150} s={1.45} hat="brim" robe pose={{ aF: [70 + Math.sin(t * 0.6) * 14, 30], lean: 10 }} held={<g transform="scale(0.5)"><Rock x={20} y={0} t={t} shine={false} /></g>} />
    <Sheep x={520} y={1150} s={1.3} t={t} mark={clamp((t - 6) / 6)} />
    <Sheep x={800} y={1090} s={0.95} t={t} i={2} mark={clamp((t - 16) / 6)} />
    <Sheep x={960} y={1180} s={0.85} t={t} i={3} mark={clamp((t - 24) / 6)} flip />
  </Sheet>
);

// ---------------------------------------------------------------- "lead"
export const S15: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1140} />
    <Fig x={220} feet={1140} s={1.4} hat="cap" pose={{ aF: [150, 60] }} /><Fig x={860} feet={1140} s={1.4} hat="top" flip pose={{ aF: [150, 60] }} />
    <Rock x={540} y={1090} s={1.0} t={t} />
    <g transform={`translate(540 720) rotate(-4) scale(${popIn(t - 3, 6)})`}><rect x={-230} y={-110} width={460} height={190} rx={14} fill="#FFFFFF" stroke={P.g} strokeWidth={8} /><text y={44} {...T(150)}>LEAD?</text></g>
  </Sheet>
);
export const S16: S = ({ t }) => {
  const k = ease((t - 4) / 20), ex = lerp(240, 860, k);
  return (
    <Sheet t={t}>
      <g transform="translate(540 820) rotate(-4)">
        <clipPath id="er"><rect x={ex - 540 - 10} y={-200} width={900} height={400} /></clipPath>
        <text y={60} {...T(300)} clipPath="url(#er)">LEAD</text>
        <text y={60} {...T(300, P.g3)} opacity={0.35 * k}>LEAD</text>
      </g>
      <Eraser x={ex} y={800 + Math.sin(t * 1.4) * 34} r={-20} s={1.2} />
      <Crumbs x={ex - 60} y={900} t={t} seed="e16" />
      <Label t={t - 24} text="NEVER WAS." y={1100} size={96} hand={false} />
    </Sheet>
  );
};
export const S17: S = ({ t }) => (
  <Sheet t={t}>
    <g transform="translate(500 890) scale(0.82)">
      <path d="M -260 -150 L 0 -300 L 260 -150 L 260 150 L 0 300 L -260 150 Z" fill={P.yellow} stroke={P.g} strokeWidth={10} strokeLinejoin="round" />
      <circle r={190} fill={P.wood} stroke={P.g} strokeWidth={8} /><circle r={70} fill={P.g} />
      {[60, 110, 150].map((r) => <circle key={r} r={r} fill="none" stroke={P.g} strokeWidth={3} opacity={0.25} />)}
    </g>
    <path d="M 530 870 Q 720 720 820 640" stroke={P.g} strokeWidth={7} fill="none" strokeLinecap="round" /><path d="M 530 870 l 34 -6 l -16 28 Z" fill={P.g} />
    <Label t={t - 4} text="graphite" x={830} y={600} size={76} />
    <Label t={t - 14} text="NO LEAD. EVER." x={370} y={570} size={62} hand={false} />
  </Sheet>
);

// ---------------------------------------------------------------- treasure: guards and smugglers
export const S18: S = ({ t }) => (
  <Sheet t={t}>
    <path d="M 240 1040 Q 540 960 840 1040 L 800 1140 Q 540 1180 280 1140 Z" fill={P.pink} stroke={P.g} strokeWidth={8} strokeLinejoin="round" />
    <Rock x={540} y={920} s={1.9} t={t} />
    <g transform={`translate(800 640) rotate(12) scale(${popIn(t - 6, 6)})`}><path d="M -150 -70 L 110 -70 L 170 0 L 110 70 L -150 70 Z" fill={P.yellow} stroke={P.g} strokeWidth={8} strokeLinejoin="round" /><text x={-20} y={30} {...T(84)}>£ £ £</text></g>
    <Label t={t - 12} text="worth a fortune" x={330} y={640} size={66} />
  </Sheet>
);
export const S19: S = ({ t }) => (
  <Sheet t={t} dark>
    <path d="M -100 1140 L 120 700 L 420 520 L 700 560 L 960 720 L 1200 1140 Z" fill={HAT2} opacity={0.5} /><path d="M -100 1140 L 120 700 L 420 520 L 700 560 L 960 720 L 1200 1140" stroke={P.paper} strokeWidth={8} fill="none" strokeLinejoin="round" />
    <path d="M 420 1140 L 420 900 Q 540 780 660 900 L 660 1140 Z" fill="#0A0A0E" stroke={P.paper} strokeWidth={8} /><path d="M 400 900 L 680 900" stroke={P.paper} strokeWidth={14} />
    <Ground y={1140} dark />
    <Fig x={270} feet={1140} s={1.35} hat="tricorn" gun dark pose={{ aF: [-10, 10] }} /><Fig x={810} feet={1140} s={1.35} hat="tricorn" gun flip dark pose={{ aF: [-10, 10] }} />
    <Label t={t - 4} text="KEEP OUT" y={640} size={84} c={P.yellow} hand={false} />
  </Sheet>
);
export const S20: S = ({ t }) => {
  const x = lerp(160, 820, clamp(t / 60)), sw = Math.sin(t * 0.5) * 22;
  return (
    <Sheet t={t} dark>
      <circle cx={820} cy={640} r={90} fill={P.paper} opacity={0.9} /><circle cx={855} cy={620} r={80} fill={P.dark} />
      <Ground y={1140} dark />
      <Fig x={x} feet={1140 - Math.abs(sw) * 0.5} s={1.5} hat="hood" robe dark pose={{ lean: 16, lF: sw, lB: -sw, aF: [30, 60], aB: [-20, 30] }} />
      <g transform={`translate(${x + 14} ${1140 - 250})`}><circle r={30} fill={P.yellow} opacity={0.35 + 0.2 * Math.sin(t * 0.4)} /><g transform="scale(0.32)"><Rock x={0} y={0} t={t} dark /></g></g>
      <Label t={t - 6} text="shhh…" x={x + 190} y={700} size={80} c={P.paper} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- messy, string, wood
export const S21: S = ({ t }) => (
  <Sheet t={t}>
    <Hand x={330} y={840} s={1.35} r={-14} smudge pinch={0.3} /><Hand x={760} y={860} s={1.35} r={14} smudge pinch={0.3} />
    {Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${160 + random(`fpx${i}`) * 760} ${1010 + random(`fpy${i}`) * 150}) rotate(${random(`fpr${i}`) * 80 - 40}) scale(${popIn(t - 4 - i * 2, 4)})`} opacity={0.5}>{[0, 1, 2, 3].map((k) => <ellipse key={k} rx={34 - k * 8} ry={46 - k * 11} fill="none" stroke={P.g} strokeWidth={5} />)}</g>)}
    <Label t={t - 2} text="MESSY." y={620} size={130} hand={false} />
  </Sheet>
);
export const S22: S = ({ t }) => {
  const n = Math.floor(clamp(t / 30) * 16);
  return (
    <Sheet t={t}>
      <Pencil x={200} y={840} len={700} kind="stick" s={1} r={-6} />
      <g transform="translate(200 840) rotate(-6)">{Array.from({ length: n }, (_, i) => <path key={i} d={`M ${90 + i * 30} -24 q 18 24 0 48`} stroke={P.wood} strokeWidth={16} fill="none" strokeLinecap="round" />)}{Array.from({ length: n }, (_, i) => <path key={i} d={`M ${90 + i * 30} -24 q 18 24 0 48`} stroke={P.g} strokeWidth={3} fill="none" opacity={0.5} />)}</g>
      <path d={`M ${290 + n * 30} 800 q 80 -160 ${200 + Math.sin(t * 0.4) * 30} -200`} stroke={P.wood} strokeWidth={10} fill="none" strokeLinecap="round" />
      <Label t={t - 4} text="wrapped in string" y={1080} size={76} />
    </Sheet>
  );
};
export const S23: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1140} />
    <rect x={420} y={960} width={560} height={30} fill={P.wood} stroke={P.g} strokeWidth={7} /><rect x={470} y={990} width={26} height={150} fill={HAT} /><rect x={900} y={990} width={26} height={150} fill={HAT} />
    <Pencil x={520} y={940} len={360} kind="wood" s={1} />
    <Fig x={270} feet={1140} s={1.5} hat="brim" pose={{ aF: [70, 20 + Math.sin(t * 0.7) * 12], aB: [50, 30], lean: 8 }} />
    {[0, 1, 2].map((i) => <path key={i} d="M 0 0 q 14 -16 28 0 q -14 12 -28 0 Z" fill={P.wood} stroke={P.g} strokeWidth={3} transform={`translate(${560 + i * 110} ${1010 + ((t * 3 + i * 30) % 110)}) rotate(${t * 6 + i * 50})`} />)}
    <g transform={`translate(700 660) rotate(-3) scale(${popIn(t - 2, 6)})`}><text {...T(110)} letterSpacing={10}>ITALY</text></g>
  </Sheet>
);
export const S24: S = ({ t }) => {
  const k = ease(t / 16), c = ease((t - 18) / 10);
  return (
    <Sheet t={t}>
      <g transform="translate(540 840) rotate(-5)">
        <rect x={-400} y={lerp(40, 0, c)} width={800} height={50} fill={P.wood} stroke={P.g} strokeWidth={7} />
        <rect x={-400} y={lerp(-200, -50, c)} width={800} height={50} fill={P.wood} stroke={P.g} strokeWidth={7} />
        <rect x={lerp(-1100, -390, k)} y={-12} width={780} height={24} rx={6} fill={P.g} opacity={1 - c * 0.2} />
        {c >= 1 ? <path d="M 400 -50 L 470 0 L 400 50 Z" fill={P.wood} stroke={P.g} strokeWidth={7} strokeLinejoin="round" /> : null}
        {c >= 1 ? <path d="M 448 -16 L 470 0 L 448 16 Z" fill={P.g} /> : null}
      </g>
      {c >= 1 ? [[300, 640], [820, 700], [560, 1040]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} t={t} i={i} />) : null}
      <Label t={t - 28} text="the first wooden pencil" y={1100} size={72} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- 1795: Conté
const Cannon: React.FC<{ x: number; y: number; flip?: boolean; t: number; fire: boolean }> = ({ x, y, flip, t, fire }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-20} y={-90} width={240} height={60} rx={26} fill={HAT} stroke={P.g} strokeWidth={8} transform="rotate(-14)" /><circle cx={30} cy={0} r={62} fill={P.paper} stroke={P.g} strokeWidth={10} /><circle cx={30} cy={0} r={12} fill={P.g} />
    {[0, 45, 90, 135].map((a) => <path key={a} d="M -30 0 L 90 0" stroke={P.g} strokeWidth={6} transform={`rotate(${a} 30 0)`} />)}
    {fire ? <g transform="translate(250 -120)">{[0, 1, 2, 3].map((i) => <circle key={i} cx={i * 40 + (t % 10) * 6} cy={-i * 16} r={40 + i * 14} fill={P.paper} stroke={P.g} strokeWidth={6} opacity={1 - i * 0.2} />)}<path d="M -20 0 L 40 -30 L 30 0 L 70 10 L 20 20 L 30 50 Z" fill={P.yellow} stroke={P.g} strokeWidth={5} /></g> : null}
  </g>
);
export const S25: S = ({ t }) => (
  <Sheet t={t}>
    <g transform={`translate(540 760) rotate(-3) scale(${popIn(t, 7)})`}><text {...T(300)}>1795</text></g>
    <g transform="translate(540 1010)"><rect x={-210} y={-80} width={420} height={160} fill="#FFFFFF" stroke={P.g} strokeWidth={8} /><rect x={-210} y={-80} width={140} height={160} fill={HAT} /><rect x={70} y={-80} width={140} height={160} fill={HAT2} /><rect x={-230} y={-100} width={16} height={330} fill={P.g} /></g>
    <Label t={t - 8} text="FRANCE" y={560} size={70} hand={false} c={P.g2} />
  </Sheet>
);
export const S26: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1140} />
    <Cannon x={170} y={1080} t={t} fire={t % 30 < 12} /><Cannon x={910} y={1080} t={t + 15} fire={(t + 15) % 30 < 12} flip />
    <Label t={t - 2} text="AT WAR" y={640} size={150} hand={false} />
  </Sheet>
);
export const S27: S = ({ t }) => (
  <Sheet t={t}>
    <path d="M -100 1040 q 80 -40 160 0 q 80 40 160 0 q 80 -40 160 0 q 80 40 160 0 q 80 -40 160 0 q 80 40 160 0 q 80 -40 160 0 q 80 40 160 0" stroke={P.g} strokeWidth={8} fill="none" transform={`translate(${-(t * 2) % 160} 0)`} />
    <g transform={`translate(540 ${960 + Math.sin(t * 0.2) * 8}) scale(0.85)`}><path d="M -260 0 L 260 0 L 200 110 L -200 110 Z" fill={HAT} stroke={P.g} strokeWidth={8} strokeLinejoin="round" /><rect x={-8} y={-300} width={16} height={300} fill={P.g} /><path d="M 8 -290 L 190 -120 L 8 -60 Z" fill="#FFFFFF" stroke={P.g} strokeWidth={8} strokeLinejoin="round" /><g transform="translate(-130 -50) scale(0.5)"><Rock x={0} y={0} t={t} shine={false} /></g></g>
    <g transform={`translate(540 900) scale(${popIn(t - 8, 5) * 0.75})`}><path d="M -300 -300 L 300 300 M 300 -300 L -300 300" stroke={P.pink} strokeWidth={56} strokeLinecap="round" /><path d="M -300 -300 L 300 300 M 300 -300 L -300 300" stroke={P.g} strokeWidth={8} strokeLinecap="round" opacity={0.25} /></g>
    <Label t={t - 12} text="NO ROCK" y={600} size={100} hand={false} />
  </Sheet>
);
export const S28: S = ({ t }) => (
  <Sheet t={t}>
    <Ground y={1140} />
    <Fig x={380} feet={1140} s={1.9} hat="bicorne" patch pose={{ aF: [150, 70], aB: [-10, 20] }} />
    {t > 8 ? <g transform={`translate(640 520) scale(${popIn(t - 8, 5)})`}><circle r={84} fill={P.yellow} stroke={P.g} strokeWidth={8} /><path d="M -22 20 L 22 20 L 18 46 L -18 46 Z M -34 -10 Q -34 -52 0 -52 Q 34 -52 34 -10 Q 30 8 22 20 L -22 20 Q -30 8 -34 -10 Z" fill="#FFFFFF" stroke={P.g} strokeWidth={6} /></g> : null}
    <g transform={`translate(780 780) rotate(-4) scale(${popIn(t - 3, 6)})`}><text {...T(140)}>CONTÉ</text></g>
    <Label t={t - 10} text="(eyepatch and all)" x={790} y={880} size={50} c={P.g2} />
  </Sheet>
);
export const S29: S = ({ t }) => (
  <Sheet t={t}>
    <path d="M 240 820 Q 240 1120 540 1120 Q 840 1120 840 820 Z" fill={HAT2} stroke={P.g} strokeWidth={10} strokeLinejoin="round" /><rect x={420} y={1120} width={240} height={36} rx={10} fill={P.g} />
    <g transform={`translate(${540 + Math.sin(t * 0.7) * 120} ${880 + Math.abs(Math.cos(t * 0.7)) * 60}) rotate(${18 + Math.sin(t * 0.7) * 14})`}><rect x={-30} y={-420} width={60} height={420} rx={26} fill={P.paper} stroke={P.g} strokeWidth={9} /><ellipse cx={0} cy={0} rx={52} ry={34} fill={P.g} /></g>
    {Array.from({ length: 16 }, (_, i) => { const life = (t * 1.2 + i * 5) % 30; return <circle key={i} cx={400 + random(`gd${i}`) * 280 + (i % 2 ? life * 3 : -life * 3)} cy={820 - life * 6 + life * life * 0.25} r={7} fill={P.g} opacity={clamp(1 - life / 30)} />; })}
    <Label t={t - 2} text="GRIND" y={640} size={140} hand={false} />
  </Sheet>
);
export const S30: S = ({ t }) => {
  const k = ease(t / 22);
  return (
    <Sheet t={t}>
      <path d="M 260 900 Q 260 1140 540 1140 Q 820 1140 820 900 Z" fill="#FFFFFF" stroke={P.g} strokeWidth={10} strokeLinejoin="round" />
      <path d={`M 290 ${1000 - k * 60} Q 540 ${940 - k * 60} 790 ${1000 - k * 60} Q 760 1120 540 1124 Q 320 1120 290 ${1000 - k * 60} Z`} fill={HAT} />
      <path d="M 300 660 L 420 900" stroke={P.g} strokeWidth={46} strokeLinecap="round" opacity={0.85} /><path d="M 780 660 L 660 900" stroke={P.wood} strokeWidth={46} strokeLinecap="round" /><path d="M 780 660 L 660 900" stroke={P.g} strokeWidth={46} strokeLinecap="round" opacity={0.12} />
      <Label t={t - 2} text="graphite" x={250} y={600} size={64} /><Label t={t - 8} text="+ clay" x={830} y={600} size={76} c={P.g} />
      <g transform={`translate(540 ${900 - k * 40}) rotate(${t * 9})`}><path d="M -150 0 L 150 0" stroke={P.g} strokeWidth={14} strokeLinecap="round" /></g>
    </Sheet>
  );
};
export const S31: S = ({ t }) => (
  <Sheet t={t}>
    <path d="M 200 1140 L 200 760 Q 540 520 880 760 L 880 1140 Z" fill={HAT2} stroke={P.g} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 320 1140 L 320 880 Q 540 740 760 880 L 760 1140 Z" fill={P.dark} stroke={P.g} strokeWidth={8} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${370 + i * 85} 1130 q ${Math.sin(t * 0.5 + i) * 30} -90 0 -${150 + Math.abs(Math.sin(t * 0.3 + i)) * 70}`} stroke={P.yellow} strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.9} />)}
    <rect x={340} y={1010} width={400} height={18} fill={P.g3} stroke={P.g} strokeWidth={5} />
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={356 + i * 64} y={960} width={44} height={50} rx={8} fill={P.g} stroke={P.paper} strokeWidth={4} />)}
    {[0, 1, 2].map((i) => <path key={i} d={`M ${420 + i * 120} 720 q 30 -40 0 -80 q -30 -40 0 -80`} stroke={P.g2} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.6} transform={`translate(0 ${-((t * 2 + i * 20) % 50)})`} />)}
    <Label t={t - 4} text="baked like biscuits" y={600} size={76} />
  </Sheet>
);
export const S32: S = ({ t }) => (
  <Sheet t={t}>
    <g transform={`translate(540 860) scale(${popIn(t, 8)})`}><Pencil x={-470} y={0} len={470} s={2} r={-10} /></g>
    {[[220, 620], [860, 660], [280, 1090], [820, 1070], [540, 580]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} t={t} i={i} s={1.5} />)}
    <Label t={t - 8} text="THE PENCIL YOU GOT TODAY" y={600} size={56} hand={false} />
  </Sheet>
);
export const S33: S = ({ t }) => (
  <Sheet t={t}>
    {Array.from({ length: 16 }, (_, i) => { const x = random(`px${i}`) * W, y = ((t * (12 + random(`pv${i}`) * 10) + random(`py${i}`) * 1900) % 2100) - 200; return <Pencil key={i} x={x} y={y} len={300} r={random(`pr${i}`) * 360 + t * 2} s={0.8} />; })}
    <rect x={-400} y={540} width={W + 800} height={330} fill={P.paper} opacity={0.88} />
    <Punch t={t} lines={['YOU GET IT,', 'BUDDY?']} color={P.yellow} y={540} size={120} />
  </Sheet>
);

// ---------------------------------------------------------------- 1858: the eraser
export const S34: S = ({ t }) => (
  <Sheet t={t}>
    <g transform={`translate(600 780) rotate(-3) scale(${popIn(t, 7)})`}><text {...T(280)}>1858</text></g>
    <Ground y={1140} />
    <Fig x={220} feet={1140} s={1.45} hat="top" pose={{ aF: [150, 40] }} held={<g transform="rotate(-150) scale(0.42)"><Eraser x={0} y={0} /></g>} />
    <Label t={t - 12} text="Mr. Lipman" x={680} y={1010} size={84} />
  </Sheet>
);
export const S35: S = ({ t }) => {
  const k = ease((t - 6) / 8);
  return (
    <Sheet t={t}>
      <g transform="translate(260 860) rotate(-6)">
        <Pencil x={66} y={0} len={640} s={1.6} eraser={false} />
        <g transform={`translate(${lerp(-420, 0, k)} 0) scale(1.6)`}><rect x={0} y={-22} width={40} height={44} rx={10} fill={P.pink} stroke={P.g} strokeWidth={5} /><rect x={36} y={-24} width={30} height={48} fill={P.g3} stroke={P.g} strokeWidth={5} /><path d="M 46 -22 l 0 44 M 56 -22 l 0 44" stroke={P.g} strokeWidth={3} /></g>
      </g>
      {k >= 1 ? <g transform={`translate(330 640) rotate(-12) scale(${popIn(t - 14, 4)})`}><text {...T(150, P.pink)} stroke={P.g} strokeWidth={12} paintOrder="stroke">POP!</text></g> : null}
      {k >= 1 ? [[180, 780], [330, 1000]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} t={t} i={i} />) : null}
    </Sheet>
  );
};
export const S36: S = ({ t }) => {
  const k = ease((t - 12) / 14), ex = lerp(700, 900, k);
  return (
    <Sheet t={t}>
      <text x={430} y={900} {...T(250)} fontFamily={FONT.hand}>2+2=</text>
      <text x={810} y={900} {...T(250)} fontFamily={FONT.hand} opacity={1 - k}>5</text>
      <text x={810} y={900} {...T(250, P.g3)} fontFamily={FONT.hand} opacity={k * 0.3}>5</text>
      <text x={810} y={900} {...T(250)} fontFamily={FONT.hand} opacity={clamp((t - 30) / 5)}>4</text>
      {t > 10 && t < 30 ? <><Eraser x={ex} y={800 + Math.sin(t * 1.5) * 40} r={-24} s={1.1} /><Crumbs x={ex - 40} y={900} t={t} seed="e36" /></> : null}
      <Label t={t - 34} text="everybody makes mistakes" y={1110} size={72} />
    </Sheet>
  );
};

// ---------------------------------------------------------------- 35 miles
export const S37: S = ({ t }) => {
  const k = clamp(t / 60);
  return (
    <Sheet t={t}>
      <Hills y={1000} />
      <path d={`M 80 1120 ` + Array.from({ length: Math.floor(k * 16) + 1 }, (_, i) => `q ${30} ${i % 2 ? 60 : -60} 60 ${-10}`).join(' ')} stroke={P.g} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Pencil x={lerp(80, 1040, k) - 10} y={1120 - Math.floor(k * 16) * 10 - 16} len={360} r={-118} s={1.1} />
      <Label t={t - 4} text="one pencil…" y={640} size={96} />
    </Sheet>
  );
};
export const S38: S = ({ t }) => (
  <Sheet t={t}>
    <path d="M 540 1260 Q 300 1100 560 1000 Q 800 920 560 860 Q 400 820 540 780 Q 620 760 540 740" stroke={P.g} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="2200" strokeDashoffset={2200 * (1 - ease(t / 30))} />
    <path d="M -100 740 Q 300 660 540 740 T 1200 720" stroke={P.g2} strokeWidth={6} fill="none" />
    <Counter t={t} from={0} to={35} dur={22} sub="MILES OF LINE" y={600} color={P.yellow} />
  </Sheet>
);
export const S39: S = ({ t }) => (
  <Sheet t={t} dark>
    <Punch t={t} lines={["THAT'S", 'REAL.']} color={P.yellow} y={540} size={190} />
    <path d={`M 200 1010 L ${200 + 680 * ease(t / 8)} 1000`} stroke={P.yellow} strokeWidth={16} strokeLinecap="round" />
  </Sheet>
);

// ---------------------------------------------------------------- the callback
export const S40: S = ({ t }) => (
  <Sheet t={t}>
    <rect x={-100} y={1060} width={1300} height={40} fill={P.wood} stroke={P.g} strokeWidth={8} />
    <Fig x={480} feet={1500} s={2.6} hat="cap" pose={{ aF: [40, 116], aB: [30, 60] }} />
    <g transform={`translate(650 ${690 + Math.sin(t * 0.9) * 8}) rotate(${-14 + Math.sin(t * 0.9) * 5})`}><Pencil x={0} y={0} len={300} s={1.1} /></g>
    {[0, 1, 2].map((i) => <path key={i} d="M 0 0 l 22 -22" stroke={P.g} strokeWidth={7} strokeLinecap="round" transform={`translate(${650 + i * 22} ${640 - i * 14}) scale(${0.6 + 0.6 * Math.abs(Math.sin(t * 0.9 + i))})`} />)}
    <Label t={t - 6} text="chomp chomp" x={800} y={920} size={64} c={P.g2} rot={6} />
  </Sheet>
);
export const S41: S = ({ t }) => (
  <Sheet t={t}>
    <g transform="translate(540 900)">
      <path d="M -520 -230 L 60 -230 L 420 0 L 60 230 L -520 230 Z" fill={P.wood} stroke={P.g} strokeWidth={12} strokeLinejoin="round" />
      <path d="M -520 -230 L -200 -230 L -200 230 L -520 230 Z" fill={P.yellow} stroke={P.g} strokeWidth={12} />
      <path d="M 250 -108 L 420 0 L 250 108 Z" fill={P.dark} stroke={P.g} strokeWidth={10} strokeLinejoin="round" />
      <circle cx={30} cy={0} r={170} fill={P.dark} stroke={P.g} strokeWidth={10} />
      <g transform="translate(30 -10) scale(0.34)">{[[-170, 20, 90], [-70, -40, 120], [70, -30, 130], [180, 20, 90], [0, 40, 110]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={P.paper} opacity={0.9} />)}</g>
      {(t % 22 < 5) || (t > 9 && t < 13) ? <path d="M 0 0 L -22 56 L -4 56 L -26 124 L 24 44 L 6 44 L 20 0 Z" fill={P.yellow} transform="translate(34 30)" /> : null}
      {Array.from({ length: 10 }, (_, i) => <path key={i} d="M 0 0 l -5 18" stroke={P.paper} strokeWidth={4} strokeLinecap="round" opacity={0.7} transform={`translate(${-60 + i * 20} ${50 + ((t * 5 + i * 13) % 70)})`} />)}
    </g>
    <Label t={t - 8} text="you're chewing on a storm" y={600} size={74} />
  </Sheet>
);
export const S42: S = ({ t }) => (
  <Sheet t={t}>
    <Pencil x={360} y={900} len={200} s={1.8} r={-6} />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M 0 0 q 16 -18 32 0 q -16 14 -32 0 Z" fill={P.wood} stroke={P.g} strokeWidth={3} transform={`translate(${200 + random(`shx${i}`) * 700} ${1040 + random(`shy${i}`) * 100}) rotate(${random(`shr${i}`) * 360}) scale(1.5)`} />)}
    <Label t={t - 3} text="THAT'S ABOUT IT, FOLKS" y={640} size={62} hand={false} />
  </Sheet>
);
export const S43: S = ({ t }) => {
  const k = ease((t - 30) / 26);
  return (
    <Sheet t={t}>
      <g transform={`translate(540 640) rotate(-3) scale(${popIn(t, 7)})`}><rect x={-300} y={-90} width={600} height={170} rx={20} fill={P.yellow} stroke={P.g} strokeWidth={10} /><text y={34} {...T(110, '#FFFFFF')} stroke={P.g} strokeWidth={10} paintOrder="stroke">FOLLOW</text></g>
      <Label t={t - 8} text="for more strange history" y={800} size={66} c={P.g2} rot={-2} />
      <clipPath id="sy"><rect x={140} y={880} width={800 * k} height={260} /></clipPath>
      <text x={540} y={1060} {...T(190)} fontFamily={FONT.hand} clipPath="url(#sy)">See ya!</text>
      {t > 30 && k < 1 ? <Pencil x={140 + 800 * k - 14} y={1040} len={340} r={-120} s={1.0} /> : null}
    </Sheet>
  );
};
