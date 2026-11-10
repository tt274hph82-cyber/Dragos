import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut } from '../molasses/kit';
import timeline from './timeline.json';
import words from './words.json';

// "I was an accident": the microwave oven tells its own story, drawn as a radar screen (it was born from
// radar): glowing green vector wireframes on black, a sweeping radar arm, amber for heat, scanlines, typed
// terminal captions and a cook-timer counting down as the progress bar. All SVG drawn in code.

type S = React.FC<ShotProps>;
const G = '#39FF8E', D = '#1B7A4A', A = '#FFB02E', R = '#FF5A3A', WH = '#EFFFF4', BG = '#020B07';
const ease = (x: number) => easeOut(clamp(x));
const ln = (c: string = G, w = 6) => ({ fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

// ---------------------------------------------------------------- the screen
/** One screen of the CRT: black, an optional radar or square grid, everything glowing, a little flicker,
 *  and a "channel switch" squeeze over the first frames of every shot. */
const Screen: React.FC<{ t: number; grid?: 'radar' | 'square' | 'none'; children: React.ReactNode }> = ({ t, grid = 'square', children }) => {
  const sy = t < 4 ? lerp(0.03, 1, ease(t / 4)) : 1;
  return (
    <g>
      <defs><filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={9} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <rect x={-400} y={-400} width={W + 800} height={2720} fill={BG} />
      {grid === 'square' ? <g opacity={0.22}>{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${i * 108 - 54} -200 L ${i * 108 - 54} 2200`} {...ln(D, 3)} />)}{Array.from({ length: 22 }, (_, i) => <path key={i} d={`M -200 ${i * 108 - 100} L 1300 ${i * 108 - 100}`} {...ln(D, 3)} />)}</g> : null}
      {grid === 'radar' ? <g opacity={0.35}>{[160, 320, 480, 640].map((r) => <circle key={r} cx={540} cy={860} r={r} {...ln(D, 3)} />)}<path d="M -200 860 L 1300 860 M 540 0 L 540 1800" {...ln(D, 3)} /></g> : null}
      <g filter="url(#glow)" opacity={0.92 + random(`fl${Math.floor(t)}`) * 0.08} transform={`translate(0 860) scale(1 ${sy}) translate(0 -860)`}>{children}</g>
      {t < 4 ? <rect x={-400} y={854} width={W + 800} height={12} fill={WH} opacity={1 - t / 4} /> : null}
    </g>
  );
};
/** A radar sweep: a bright arm with a fading wedge behind it. */
const Sweep: React.FC<{ t: number; cx?: number; cy?: number; r?: number; c?: string; speed?: number }> = ({ t, cx = 540, cy = 860, r = 640, c = G, speed = 5 }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${t * speed})`}>
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M 0 0 L ${r} 0 A ${r} ${r} 0 0 0 ${r * Math.cos(-0.07)} ${r * Math.sin(-0.07)} Z`} fill={c} opacity={0.2 * (1 - i / 14)} transform={`rotate(${-i * 4})`} />)}
    <path d={`M 0 0 L ${r} 0`} {...ln(c, 7)} />
  </g>
);
const Tx: React.FC<{ x?: number; y: number; size?: number; c?: string; children: string; anchor?: 'start' | 'middle' | 'end'; t?: number; sp?: number }> = ({ x = 540, y, size = 70, c = G, children, anchor = 'middle', t = 99, sp = 6 }) => (
  t <= 0 ? null : <text x={x} y={y} textAnchor={anchor} fontFamily={FONT.ui} fontSize={size} fill={c} letterSpacing={sp}>{children.slice(0, Math.max(1, Math.floor(t * 1.6)))}</text>
);
// seven-segment digits
const SEG: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abfgcd', '-': 'g' };
const Seg: React.FC<{ text: string; x: number; y: number; h?: number; c?: string; w?: number }> = ({ text, x, y, h = 200, c = A, w = 16 }) => {
  const dw = h * 0.5, gap = h * 0.2, total = text.split('').reduce((s, ch) => s + (ch === ':' || ch === ',' || ch === '.' ? gap * 1.2 : dw + gap), -gap);
  let cx = x - total / 2;
  return (
    <g>{text.split('').map((ch, i) => {
      const x0 = cx; cx += ch === ':' || ch === ',' || ch === '.' ? gap * 1.2 : dw + gap;
      if (ch === ':') return <g key={i}><circle cx={x0 + gap * 0.2} cy={y - h * 0.3} r={w * 0.6} fill={c} /><circle cx={x0 + gap * 0.2} cy={y - h * 0.7} r={w * 0.6} fill={c} /></g>;
      if (ch === ',' || ch === '.') return <circle key={i} cx={x0 + gap * 0.2} cy={y - w * 0.3} r={w * 0.6} fill={c} />;
      const on = SEG[ch] ?? '', p: Record<string, string> = { a: `M ${x0} ${y - h} l ${dw} 0`, b: `M ${x0 + dw} ${y - h} l 0 ${h / 2}`, c: `M ${x0 + dw} ${y - h / 2} l 0 ${h / 2}`, d: `M ${x0} ${y} l ${dw} 0`, e: `M ${x0} ${y - h / 2} l 0 ${h / 2}`, f: `M ${x0} ${y - h} l 0 ${h / 2}`, g: `M ${x0} ${y - h / 2} l ${dw} 0` };
      return <g key={i}>{'abcdefg'.split('').map((sgm) => <path key={sgm} d={p[sgm]} {...ln(c, w)} opacity={on.includes(sgm) ? 1 : 0.07} />)}</g>;
    })}</g>
  );
};

// ---------------------------------------------------------------- wireframe things
type Arm = [number, number];
type Pose = { aF?: Arm; aB?: Arm; lF?: number; lB?: number; lean?: number };
const pt = (x: number, y: number, len: number, deg: number): [number, number] => [x + len * Math.sin((deg * Math.PI) / 180), y + len * Math.cos((deg * Math.PI) / 180)];
/** A wireframe person facing right. */
const Man: React.FC<{ x: number; feet: number; s?: number; pose?: Pose; c?: string; glasses?: boolean; tie?: boolean; flip?: boolean; held?: React.ReactNode; face?: React.ReactNode }> = ({ x, feet, s = 1, pose = {}, c = G, glasses, tie, flip, held, face }) => {
  const { aF = [12, 10], aB = [-10, 8], lF = 8, lB = -8, lean = 0 } = pose;
  const arm = (a: Arm) => { const e = pt(0, -252, 64, a[0]), h = pt(e[0], e[1], 62, a[0] + a[1]); return { d: `M 0 -252 L ${e[0]} ${e[1]} L ${h[0]} ${h[1]}`, h }; };
  const f = arm(aF), b = arm(aB), lf = pt(0, -140, 140, lF), lb = pt(0, -140, 140, lB);
  return (
    <g transform={`translate(${x} ${feet}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <path d={`M 0 -140 L ${lb[0]} ${lb[1]} l 22 0 M 0 -140 L ${lf[0]} ${lf[1]} l 24 0`} {...ln(c, 7)} />
      <g transform={`rotate(${lean} 0 -140)`}>
        <path d={b.d} {...ln(c, 7)} opacity={0.7} />
        <path d="M 0 -282 L 0 -140 M -34 -258 L 34 -258" {...ln(c, 7)} />
        {tie ? <path d="M 0 -258 l -10 44 l 10 20 l 10 -20 Z" {...ln(A, 5)} /> : null}
        <circle cx={0} cy={-318} r={36} {...ln(c, 7)} />
        {glasses ? <path d="M 0 -322 a 13 13 0 1 0 26 0 a 13 13 0 1 0 -26 0 M -24 -322 l 24 0" {...ln(c, 5)} /> : <circle cx={16} cy={-324} r={5} fill={c} />}
        {face}
        <path d={f.d} {...ln(c, 7)} />
        {held ? <g transform={`translate(${f.h[0]} ${f.h[1]})`}>{held}</g> : null}
      </g>
    </g>
  );
};
const Waves: React.FC<{ x: number; y: number; t: number; c?: string; n?: number; r?: number; spread?: number; rot?: number }> = ({ x, y, t, c = A, n = 4, r = 320, spread = 0.7, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>{Array.from({ length: n }, (_, i) => { const q = ((t * 0.035 + i / n) % 1), rr = 40 + q * r; return <path key={i} d={`M ${rr * Math.cos(-spread)} ${rr * Math.sin(-spread)} A ${rr} ${rr} 0 0 1 ${rr * Math.cos(spread)} ${rr * Math.sin(spread)}`} {...ln(c, 7)} opacity={1 - q} />; })}</g>
);
/** The magnetron: a finned radar tube with two magnets and an antenna. */
const Magnetron: React.FC<{ x: number; y: number; s?: number; t: number; on?: boolean }> = ({ x, y, s = 1, t, on = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-120, -80, -40, 0, 40, 80, 120].map((yy) => <ellipse key={yy} cx={0} cy={yy} rx={150} ry={26} {...ln(G, 6)} />)}
    <path d="M -70 -150 L -70 150 M 70 -150 L 70 150" {...ln(G, 6)} />
    <rect x={-210} y={-70} width={56} height={140} {...ln(G, 6)} /><rect x={154} y={-70} width={56} height={140} {...ln(G, 6)} />
    <path d="M -40 -150 L -40 -230 Q 0 -280 40 -230 L 40 -150" {...ln(G, 6)} /><circle cx={0} cy={-250} r={12} fill={on ? A : G} opacity={on ? 0.6 + 0.4 * Math.sin(t * 0.6) : 1} />
    <path d="M -90 150 L -110 230 M 90 150 L 110 230 M -130 230 L 130 230" {...ln(G, 6)} />
  </g>
);
/** Me, today: a countertop microwave. `hot` lights the window amber; children sit on the turntable. */
const Oven: React.FC<{ x: number; y: number; s?: number; t: number; hot?: number; open?: number; time?: string; children?: React.ReactNode; c?: string }> = ({ x, y, s = 1, t, hot = 0, open = 0, time = '0:00', children, c = G }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-300} y={-190} width={600} height={380} rx={26} {...ln(c, 7)} />
    <path d="M -250 190 l 0 26 l 60 0 l 0 -26 M 190 190 l 0 26 l 60 0 l 0 -26" {...ln(c, 6)} />
    <rect x={150} y={-150} width={110} height={56} rx={8} {...ln(c, 5)} /><text x={205} y={-108} textAnchor="middle" fontFamily={FONT.ui} fontSize={38} fill={A}>{time}</text>
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={156 + (i % 2) * 56} y={-70 + Math.floor(i / 2) * 50} width={42} height={34} rx={6} {...ln(c, 4)} />)}
    <circle cx={205} cy={128} r={30} {...ln(c, 5)} /><path d={`M 205 128 l ${Math.cos(t * 0.2) * 24} ${Math.sin(t * 0.2) * 24}`} {...ln(A, 5)} />
    <g>{hot > 0 ? <rect x={-262} y={-152} width={380} height={304} rx={14} fill={A} opacity={0.12 * hot} /> : null}
      <ellipse cx={-72} cy={110} rx={150} ry={22} {...ln(hot > 0 ? A : c, 5)} />
      <g transform="translate(-72 96)">{children}</g></g>
    <g transform={`translate(-262 0) scale(${1 - open * 0.75} 1) translate(262 0)`}><rect x={-262} y={-152} width={380} height={304} rx={14} {...ln(c, 6)} />{open < 0.5 ? Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${-230 + i * 78} -130 l 0 260`} {...ln(c, 2)} opacity={0.3} />) : null}</g>
  </g>
);
/** Me, 1947: the Radarange, the size of a fridge. */
const Range: React.FC<{ x: number; y: number; s?: number; sx?: number; t: number; c?: string }> = ({ x, y, s = 1, sx = 1, t, c = G }) => (
  <g transform={`translate(${x} ${y}) scale(${s * sx} ${s})`}>
    <rect x={-170} y={-640} width={340} height={640} rx={18} {...ln(c, 7)} />
    <rect x={-136} y={-600} width={272} height={220} rx={10} {...ln(c, 6)} /><rect x={-104} y={-570} width={150} height={160} rx={6} {...ln(c, 4)} /><path d="M 96 -560 l 0 140" {...ln(c, 6)} />
    <circle cx={-80} cy={-320} r={26} {...ln(c, 5)} /><path d={`M -80 -320 l ${Math.cos(t * 0.15) * 20} ${Math.sin(t * 0.15) * 20}`} {...ln(A, 5)} /><circle cx={0} cy={-320} r={26} {...ln(c, 5)} /><circle cx={80} cy={-320} r={12} fill={A} />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M -120 ${-250 + i * 40} l 240 0`} {...ln(c, 4)} opacity={0.7} />)}
    <path d="M -150 0 l 0 24 l 50 0 l 0 -24 M 100 0 l 0 24 l 50 0 l 0 -24" {...ln(c, 6)} />
  </g>
);
const Candy: React.FC<{ x: number; y: number; s?: number; melt?: number; r?: number }> = ({ x, y, s = 1, melt = 0, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d={`M -150 -60 L 150 -60 L 150 ${60 + melt * 30} Q 110 ${60 + melt * 150} 70 ${60 + melt * 40} Q 20 ${60 + melt * 220} -30 ${60 + melt * 50} Q -80 ${60 + melt * 170} -110 ${60 + melt * 40} L -150 ${60 + melt * 20} Z`} {...ln(A, 7)} />
    {[-75, 0, 75].map((xx) => <path key={xx} d="M 0 -60 l 0 120" transform={`translate(${xx} 0)`} {...ln(A, 4)} opacity={1 - melt * 0.7} />)}<path d="M -150 0 l 300 0" {...ln(A, 4)} opacity={1 - melt * 0.7} />
  </g>
);
const Boom: React.FC<{ x: number; y: number; t: number; r?: number; c?: string; n?: number }> = ({ x, y, t, r = 300, c = R, n = 14 }) => (
  t < 0 ? null : <g transform={`translate(${x} ${y}) scale(${ease(t / 6)})`}>
    <polygon points={Array.from({ length: n * 2 }, (_, i) => { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' ')} {...ln(c, 8)} />
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${Math.cos(i * 0.63) * r * 1.1} ${Math.sin(i * 0.63) * r * 1.1} l ${Math.cos(i * 0.63) * (30 + t * 6)} ${Math.sin(i * 0.63) * (30 + t * 6)}`} {...ln(A, 6)} opacity={clamp(1 - t / 26)} />)}
  </g>
);
const Popcorn: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string }> = ({ x, y, s = 1, r = 0, c = WH }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>{[[-16, -10, 20], [14, -14, 22], [0, 12, 20], [-22, 12, 14]].map(([cx, cy, rr], i) => <circle key={i} cx={cx} cy={cy} r={rr} {...ln(c, 5)} />)}</g>
);
const Plane: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string }> = ({ x, y, s = 1, r = 0, c = R }) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} d="M 0 -50 L 12 -10 L 60 14 L 60 26 L 12 14 L 8 44 L 24 56 L 24 64 L 0 58 L -24 64 L -24 56 L -8 44 L -12 14 L -60 26 L -60 14 L -12 -10 Z" {...ln(c, 5)} />
);
const Pizza: React.FC<{ s?: number; t: number }> = ({ s = 1, t }) => (
  <g transform={`scale(${s} ${s * 0.6}) rotate(${t * 3})`}><path d="M 0 0 L 110 -50 A 120 120 0 0 1 110 50 Z" {...ln(A, 6)} />{[[60, -14], [84, 16], [44, 12]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} {...ln(R, 5)} />)}</g>
);
const House: React.FC<{ x: number; y: number; on: boolean; t: number }> = ({ x, y, on, t }) => (
  <g transform={`translate(${x} ${y})`}><path d="M -70 0 L -70 -84 L 0 -144 L 70 -84 L 70 0 Z" {...ln(on ? G : D, 6)} />{on ? <rect x={-30} y={-64} width={60} height={40} rx={5} {...ln(A, 5)} opacity={0.7 + 0.3 * Math.sin(t * 0.4 + x)} /> : <path d="M -24 -60 l 48 40 M 24 -60 l -48 40" {...ln(D, 5)} />}</g>
);

// ---------------------------------------------------------------- the CRT layer on top: timer, scanlines, typed captions
const TOTAL = (timeline as any).total as number;
type Wd = { w: string; s: number; e: number; p: string };
const LINES = (() => { const out: Wd[][] = []; let cur: Wd[] = []; for (const w of words as Wd[]) { cur.push(w); if (/[.?!,]/.test(w.p) || cur.length >= 4) { out.push(cur); cur = []; } } if (cur.length) out.push(cur); return out; })();
export const Crt: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, left = Math.max(0, Math.ceil((TOTAL - 45 - f) / 30)), done = f >= TOTAL - 45;
  const line = LINES.find((l) => sec >= l[0].s - 0.05 && sec < l[l.length - 1].e + 0.45);
  let text = '';
  if (line) { const full = line.map((w) => w.w + w.p).join(' ').toUpperCase(), a = line[0].s, b = line[line.length - 1].e; text = full.slice(0, Math.ceil(full.length * clamp((sec - a) / Math.max(0.2, (b - a) * 0.9)))); }
  return (
    <g>
      <defs>
        <pattern id="scan" width={8} height={6} patternUnits="userSpaceOnUse"><rect width={8} height={3} fill="#000" opacity={0.3} /></pattern>
        <radialGradient id="crtv" cx="50%" cy="48%" r="72%"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.85} /></radialGradient>
        <filter id="glow2" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation={6} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <g filter="url(#glow2)">
        {/* the cook timer */}
        <g transform="translate(540 344)">
          <rect x={-250} y={-66} width={500} height={110} rx={16} fill={BG} stroke={D} strokeWidth={5} />
          <text x={-226} y={6} fontFamily={FONT.ui} fontSize={34} fill={G}>{done ? 'DONE' : 'COOK'}</text>
          <Seg text={`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`} x={10} y={26} h={72} w={9} c={done && Math.floor(f / 6) % 2 ? D : A} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={150 + i * 18} y={10 - i * 12} width={11} height={14 + i * 12} fill={i < 5 - Math.floor((f / TOTAL) * 5) ? G : D} />)}
        </g>
        {/* typed caption */}
        {text ? <g><rect x={50} y={1150} width={980} height={110} rx={10} fill={BG} opacity={0.82} /><text x={540} y={1224} textAnchor="middle" fontFamily={FONT.ui} fontSize={text.length > 24 ? 50 : 60} fill={G}>{'> ' + text}{Math.floor(f / 8) % 2 ? '█' : ' '}</text></g> : null}
      </g>
      <rect x={0} y={0} width={W} height={1920} fill="url(#scan)" />
      <rect x={0} y={((f * 9) % 2300) - 200} width={W} height={120} fill={G} opacity={0.035} />
      <rect x={0} y={0} width={W} height={1920} fill="url(#crtv)" />
    </g>
  );
};

// ---------------------------------------------------------------- "I was an accident"
export const S1: S = ({ t }) => (
  <Screen t={t}>
    <Oven x={540} y={860} s={1.25} t={t} time="?:??" />
    <Tx y={560} size={74} t={t - 6}>NOT INVENTED</Tx>
  </Screen>
);
export const S2: S = ({ t }) => (
  <Screen t={t} grid="none">
    <g transform={`translate(${540 + (random(`j${Math.floor(t / 2)}`) - 0.5) * (t < 12 ? 40 : 6)} 800)`}>
      <path d="M 0 -250 L 250 180 L -250 180 Z" {...ln(R, 12)} /><path d="M 0 -120 L 0 60" {...ln(R, 22)} /><circle cx={0} cy={118} r={16} fill={R} />
    </g>
    <Tx y={1090} size={110} c={R} t={t - 3} sp={14}>ACCIDENT</Tx>
  </Screen>
);
export const S3: S = ({ t }) => (
  <Screen t={t}>
    <Candy x={540} y={760} s={1.7} melt={ease((t - 10) / 40)} r={-6} />
    <Waves x={130} y={760} t={t} r={420} />
    <Tx y={560} size={52} c={A} t={t - 4}>EXHIBIT A: CANDY BAR</Tx>
  </Screen>
);
export const S4: S = ({ t }) => (
  <Screen t={t} grid="none">
    <g transform="translate(540 760)"><path d="M 40 -150 L -180 0 L 40 150 Z M 300 -150 L 80 0 L 300 150 Z" {...ln(G, 10)} transform={`translate(${-60 - (t % 10) * 6} 0)`} /></g>
    <Seg text={String(Math.max(1945, 2025 - Math.floor(ease(t / 22) * 80)))} x={540} y={1110} h={150} w={14} />
  </Screen>
);

// ---------------------------------------------------------------- 1945: my mother, the radar tube
export const S5: S = ({ t }) => (
  <Screen t={t} grid="radar">
    <Sweep t={t} />
    <Seg text="1945" x={540} y={960} h={260} w={22} />
  </Screen>
);
export const S6: S = ({ t }) => (
  <Screen t={t}>
    <Magnetron x={540} y={900} s={1.5} t={t} />
    <Waves x={540} y={500} t={t} rot={-90} r={260} />
    <Tx y={1096} size={56} t={t - 8} c={D}>MY MOTHER</Tx>
  </Screen>
);
export const S7: S = ({ t }) => (
  <Screen t={t}>
    <Magnetron x={540} y={940} s={1.05} t={t} />
    <Waves x={760} y={940} t={t} r={300} /><Waves x={320} y={940} t={t + 14} r={300} rot={180} />
    <Tx y={600} size={96} c={A} t={t - 2} sp={10}>MAGNETRON</Tx>
  </Screen>
);
export const S8: S = ({ t }) => (
  <Screen t={t} grid="radar">
    <Sweep t={t} speed={7} />
    {[[760, 560, 200], [300, 700, 140], [820, 1040, 250], [380, 1080, 30]].map(([x, y, r], i) => { const seen = ((t * 7 - Math.atan2(y - 860, x - 540) * 57.3) % 360 + 360) % 360; return <g key={i} opacity={clamp(1.2 - seen / 200)}><Plane x={x} y={y} r={r} s={1.1} /><circle cx={x} cy={y} r={70 + (seen % 60)} {...ln(R, 3)} opacity={0.5} /></g>; })}
    <Tx y={1096} size={48} c={R} t={t - 6}>TARGETS: 4</Tx>
  </Screen>
);

// ---------------------------------------------------------------- Percy
export const S9: S = ({ t }) => {
  const x = lerp(-80, 560, clamp(t / 70)), sw = Math.sin(t * 0.4) * 24;
  return (
    <Screen t={t}>
      <path d="M -100 1130 L 1200 1130" {...ln(D, 6)} />
      <Magnetron x={820} y={860} s={0.95} t={t} /><Waves x={640} y={860} t={t} r={360} rot={180} />
      <Man x={x} feet={1130} s={1.5} glasses tie pose={{ lF: sw, lB: -sw, aF: [-sw * 0.7, 14], aB: [sw * 0.7, 10] }} />
      <Tx y={580} size={62} t={t - 30}>PERCY SPENCER</Tx>
    </Screen>
  );
};
export const S10: S = ({ t }) => (
  <Screen t={t}>
    <g transform="translate(540 900)"><path d="M -300 200 L -300 -80 L 0 -260 L 300 -80 L 300 200 Z" {...ln(G, 7)} /><rect x={-60} y={40} width={120} height={160} {...ln(G, 6)} />{[-200, 140].map((x) => <rect key={x} x={x} y={-40} width={70} height={90} {...ln(G, 5)} />)}<path d="M 0 -260 l 0 -90 l 70 24 l -70 24" {...ln(G, 6)} /></g>
    <g transform={`translate(540 880) scale(${popIn(t - 10, 6)})`}><path d="M -260 -260 L 260 260 M 260 -260 L -260 260" {...ln(R, 22)} /></g>
    <Tx y={580} size={42} t={t - 4} c={A}>GRADE SCHOOL: UNFINISHED</Tx>
  </Screen>
);
export const S11: S = ({ t }) => (
  <Screen t={t}>
    <path d="M 240 620 L 840 620 L 800 1130 L 280 1130 Z" {...ln(G, 7)} /><path d="M 240 700 L 840 700" {...ln(G, 5)} strokeDasharray="18 16" />
    <Candy x={540} y={880} s={1.2} melt={0} r={-80} />
    <Waves x={-40} y={880} t={t} r={560} n={5} />
    <Tx y={560} size={52} t={t - 4} c={D}>POCKET, LEFT</Tx>
  </Screen>
);
export const S12: S = ({ t }) => {
  const k = ease(t / 18);
  return (
    <Screen t={t}>
      <path d="M 240 620 L 840 620 L 800 1130 L 280 1130 Z" {...ln(G, 7)} />
      <path d={`M 380 ${860 + k * 120} Q 540 ${760 + k * 200} 700 ${860 + k * 120} Q 760 ${1000 + k * 60} 540 ${1040 + k * 40} Q 320 ${1000 + k * 60} 380 ${860 + k * 120} Z`} {...ln(A, 8)} />
      {[0, 1, 2, 3].map((i) => { const life = (t * 1.1 + i * 9) % 36; return <path key={i} d="M 0 -20 Q 16 6 0 18 Q -16 6 0 -20 Z" {...ln(A, 5)} transform={`translate(${400 + i * 90} ${1130 + life * 4})`} opacity={clamp(1 - life / 36)} />; })}
      {[0, 1, 2].map((i) => <path key={i} d="M 0 0 q 20 -30 0 -60 q -20 -30 0 -60" {...ln(R, 6)} transform={`translate(${440 + i * 100} ${800 - ((t * 3 + i * 20) % 60)})`} opacity={0.7} />)}
      <Tx y={560} size={96} c={A} t={t - 4} sp={12}>SOUP</Tx>
    </Screen>
  );
};
export const S13: S = ({ t }) => (
  <Screen t={t}>
    <path d="M 340 600 L 740 600 M 540 600 l 0 -60 q 0 -40 40 -40" {...ln(G, 7)} />
    <path d="M 360 600 L 320 1140 L 500 1140 L 540 760 L 580 1140 L 760 1140 L 720 600" {...ln(G, 7)} />
    <path d="M 420 760 q 40 50 10 110 q -50 30 -70 -30 q 10 -60 60 -80 Z" {...ln(A, 6)} />
    <Tx y={1096} size={50} t={t - 6} c={D}>STANDARD PROCEDURE</Tx>
  </Screen>
);
export const S14: S = ({ t }) => (
  <Screen t={t}>
    <path d="M -100 1130 L 1200 1130" {...ln(D, 6)} />
    <Magnetron x={800} y={860} s={0.95} t={t} /><Waves x={620} y={860} t={t} r={320} rot={180} />
    <Man x={240} feet={1130} s={1.5} glasses tie pose={{ aF: [80, 10], aB: [-10, 10] }} held={<g><path d="M -30 -90 L 30 -90 L 40 20 L -40 20 Z" {...ln(WH, 6)} />{[-16, 0, 16].map((x) => <path key={x} d={`M ${x} -90 l ${x * 0.3} 110`} {...ln(R, 4)} />)}</g>} />
    <Tx y={580} size={46} t={t - 4} c={WH}>EXPERIMENT 2: POPCORN</Tx>
  </Screen>
);
export const S15: S = ({ t }) => (
  <Screen t={t}>
    <Waves x={-40} y={860} t={t} r={700} n={5} />
    {Array.from({ length: 9 }, (_, i) => { const at = 3 + i * 2.5; return t > at ? <g key={i}><Popcorn x={220 + (i % 3) * 300 + random(`pcx${i}`) * 80} y={700 + Math.floor(i / 3) * 170} s={popIn(t - at, 3) * 1.6} r={i * 40} /></g> : <ellipse key={i} cx={220 + (i % 3) * 300 + random(`pcx${i}`) * 80} cy={700 + Math.floor(i / 3) * 170} rx={16} ry={22} {...ln(A, 5)} />; })}
    <Tx y={560} size={110} c={WH} t={t - 2} sp={12}>POP</Tx>
  </Screen>
);
export const S16: S = ({ t }) => (
  <Screen t={t}>
    {Array.from({ length: 40 }, (_, i) => { const life = ((t * 1.3 + i * 3) % 46), a = random(`la${i}`) * Math.PI * 2, d = life * (12 + random(`ld${i}`) * 10); return <Popcorn key={i} x={540 + Math.cos(a) * d} y={860 + Math.sin(a) * d + life * life * 0.25} s={1.1} r={life * 10} />; })}
    <Tx y={1096} size={54} t={t - 4} c={WH}>ALL OVER THE LAB</Tx>
  </Screen>
);
export const S17: S = ({ t }) => (
  <Screen t={t}>
    <Waves x={-40} y={860} t={t} r={560} n={5} c={t > 40 ? R : A} />
    <g transform={`translate(${620 + (t > 30 ? (random(`eg${t}`) - 0.5) * (t - 30) * 0.8 : 0)} 860)`}><ellipse rx={150} ry={200} {...ln(t > 40 ? R : WH, 9)} />{t > 46 ? <path d="M -60 -120 l 40 60 l -50 50 l 60 40" {...ln(R, 6)} /> : null}</g>
    <Tx y={560} size={50} t={t - 4} c={WH}>EXPERIMENT 3: EGG</Tx>
  </Screen>
);
export const S18: S = ({ t }) => (
  <Screen t={t} grid="none">
    <Boom x={540} y={860} t={t} r={330} />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d="M 0 0 l 20 14 l -24 10 Z" {...ln(WH, 5)} transform={`translate(${540 + Math.cos(i * 0.4) * t * 26} ${860 + Math.sin(i * 0.4) * t * 26 + t * t * 0.4}) rotate(${t * 20})`} opacity={clamp(1 - t / 40)} />)}
    <Tx y={1096} size={110} c={R} t={t - 3} sp={12}>BOOM</Tx>
  </Screen>
);
export const S19: S = ({ t }) => (
  <Screen t={t}>
    <path d="M -100 1130 L 1200 1130" {...ln(D, 6)} />
    <Man x={540} feet={1130} s={1.7} pose={{ aF: [-150, -30], aB: [150, 30] }} face={<g><path d="M -30 -330 q 16 30 6 44 q -30 0 -6 -44 Z M 6 -300 q 14 22 4 32 q -20 0 -4 -32 Z" {...ln(A, 4)} /><path d="M -10 -296 q 14 10 30 0" {...ln(G, 4)} /></g>} />
    {[0, 1, 2].map((i) => { const life = (t * 0.9 + i * 10) % 30; return <path key={i} d="M 0 -14 Q 12 4 0 12 Q -12 4 0 -14 Z" {...ln(A, 5)} transform={`translate(${500 + i * 40} ${640 + life * 6})`} opacity={clamp(1 - life / 30)} />; })}
    <Tx y={1096} size={46} t={t - 4} c={D}>COLLEAGUE (UNHAPPY)</Tx>
  </Screen>
);
export const S20: S = ({ t }) => (
  <Screen t={t}>
    <rect x={200} y={600} width={680} height={520} rx={16} {...ln(G, 6)} />
    <Tx y={690} size={58} t={t - 2}>FIRST MEAL</Tx><path d="M 240 720 L 840 720" {...ln(G, 4)} />
    <Tx x={250} y={810} size={46} anchor="start" t={t - 8} c={A}>1. CANDY BAR ... SOUP</Tx>
    <Tx x={250} y={900} size={46} anchor="start" t={t - 16} c={WH}>2. POPCORN ..... LOUD</Tx>
    <Tx x={250} y={990} size={46} anchor="start" t={t - 24} c={R}>3. EGG ....... SORRY</Tx>
    <Tx y={1080} size={40} t={t - 34} c={D}>RATING: * * * * *</Tx>
  </Screen>
);

// ---------------------------------------------------------------- 1947: for sale
export const S21: S = ({ t }) => (
  <Screen t={t}>
    <Seg text="1947" x={540} y={840} h={230} w={20} />
    <g transform={`translate(540 1010) rotate(-4) scale(${popIn(t - 10, 6)})`}><rect x={-230} y={-70} width={460} height={140} rx={12} {...ln(G, 7)} /><text y={30} textAnchor="middle" fontFamily={FONT.ui} fontSize={84} fill={G} letterSpacing={12}>FOR SALE</text></g>
  </Screen>
);
export const S22: S = ({ t }) => {
  const k = ease(t / 16);
  return (
    <Screen t={t}>
      <path d="M -100 1140 L 1200 1140" {...ln(D, 6)} />
      <Range x={420} y={1140} s={0.95 * k + 0.05} t={t} />
      <Man x={800} feet={1140} s={1.45} glasses tie flip pose={{ aF: [150, 30] }} />
      <path d="M 660 1140 L 660 532 M 630 1140 L 690 1140 M 630 532 L 690 532" {...ln(A, 6)} opacity={k} />
      <Tx x={700} y={520} size={72} c={A} t={t - 12} anchor="start">6 FT</Tx>
    </Screen>
  );
};
export const S23: S = ({ t }) => {
  const n = Math.round(lerp(0, 750, ease(t / 24)));
  return (
    <Screen t={t}>
      <Range x={540} y={1010 + (t > 24 ? Math.min(30, (t - 24) * 3) : 0)} s={0.48} t={t} />
      <path d="M 240 1010 L 840 1010 L 880 1130 L 200 1130 Z" {...ln(G, 7)} />
      {t > 24 ? <path d="M 200 1130 l -60 30 l 40 30 M 880 1130 l 70 20 l -30 40 M 540 1130 l 10 50 l -40 30" {...ln(R, 6)} /> : null}
      <Seg text={String(n)} x={470} y={660} h={120} w={13} /><Tx x={760} y={656} size={72} c={A}>LB</Tx>
    </Screen>
  );
};
export const S24: S = ({ t }) => (
  <Screen t={t}>
    <g transform="translate(540 940) rotate(-6)"><path d="M -330 -110 L 250 -110 L 350 0 L 250 110 L -330 110 Z" {...ln(G, 8)} /><circle cx={270} cy={0} r={18} {...ln(G, 6)} /></g>
    <Tx x={170} y={770} size={130} c={A} anchor="start">$</Tx>
    <Seg text={`${Math.round(lerp(0, 5000, ease(t / 26))).toLocaleString('en-US')}`} x={590} y={770} h={150} w={15} />
    <Tx y={980} size={54} t={t - 6}>(IN 1947 MONEY)</Tx>
  </Screen>
);
export const S25: S = ({ t }) => (
  <Screen t={t}>
    <path d="M -100 1140 L 1200 1140" {...ln(D, 6)} />
    <Range x={540} y={1140} s={0.8} t={0} c={D} />
    <path d="M 370 628 L 250 760 M 370 628 L 300 628 M 310 690 L 250 760 M 340 660 q -40 20 -50 60 M 300 628 q -10 60 -50 132" {...ln(D, 3)} />
    <g transform={`translate(${((t * 9) % 1400) - 150} 1090) rotate(${t * 12})`}>{[0, 1, 2, 3].map((i) => <ellipse key={i} rx={50} ry={22} {...ln(D, 4)} transform={`rotate(${i * 45})`} />)}</g>
    <Tx y={580} size={66} t={t - 4} c={R}>UNITS WANTED: 0</Tx>
  </Screen>
);

// ---------------------------------------------------------------- the diet
export const S26: S = ({ t }) => {
  const k = ease(t / 40);
  return (
    <Screen t={t}>
      <path d="M -100 1140 L 1200 1140" {...ln(D, 6)} />
      <Range x={540} y={1140} s={0.9 - k * 0.2} sx={1 - k * 0.25 + Math.sin(t * 0.8) * 0.02} t={t} />
      <path d={`M 250 ${1100 - k * 60} l 560 0`} {...ln(A, 5)} strokeDasharray="14 12" /><path d={`M 250 ${1080 - k * 60} l 0 40 M 810 ${1080 - k * 60} l 0 40`} {...ln(A, 5)} />
      {[0, 1].map((i) => <path key={i} d="M 0 -14 Q 12 4 0 12 Q -12 4 0 -14 Z" {...ln(G, 4)} transform={`translate(${340 + i * 400} ${640 + ((t * 5 + i * 20) % 80)})`} />)}
      <Tx y={580} size={96} t={t - 3} sp={12}>DIET</Tx>
    </Screen>
  );
};
export const S27: S = ({ t }) => {
  const k = clamp(t / 50), yr = 1947 + Math.floor(k * 20);
  return (
    <Screen t={t}>
      <path d="M -100 1140 L 1200 1140" {...ln(D, 6)} />
      <Range x={300} y={1140} s={0.9 - k * 0.5} sx={1 + k * 0.5} t={t} />
      <Seg text={String(yr)} x={700} y={830} h={150} w={14} />
      <path d={`M 480 900 L ${480 + 440 * k} 900`} {...ln(G, 10)} /><path d="M 480 900 L 920 900" {...ln(D, 4)} />
      <Tx x={700} y={990} size={48} c={D}>20 YEARS</Tx>
    </Screen>
  );
};
export const S28: S = ({ t }) => (
  <Screen t={t} grid="radar">
    <Sweep t={t} speed={6} />
    <Seg text="1967" x={540} y={960} h={260} w={22} />
  </Screen>
);
export const S29: S = ({ t }) => (
  <Screen t={t}>
    <path d="M -100 1040 L 1200 1040 M -100 1080 L 1200 1080" {...ln(G, 6)} />
    {[150, 420, 690, 960].map((x) => <rect key={x} x={x - 120} y={1100} width={240} height={220} rx={8} {...ln(D, 5)} />)}
    <g transform={`translate(540 ${lerp(300, 880, ease(t / 14))})`}><Oven x={0} y={0} s={0.72} t={t} time="1967" /></g>
    <g transform="translate(150 960)"><path d="M -50 80 L -60 -40 Q 0 -90 60 -40 L 50 80 Z M 60 -10 q 50 0 40 50 q -20 20 -44 10 M -20 -66 l 0 -30 l 40 0 l 0 30" {...ln(D, 5)} /></g>
    <g transform="translate(940 980)"><rect x={-80} y={-50} width={160} height={110} rx={12} {...ln(D, 5)} /><path d="M -40 -50 l 0 -24 M 40 -50 l 0 -24" {...ln(D, 5)} /></g>
    <Tx y={580} size={62} t={t - 14}>I FIT.</Tx>
  </Screen>
);

// ---------------------------------------------------------------- today
export const S30: S = ({ t }) => {
  const n = Math.min(9, Math.floor(t / 5));
  return (
    <Screen t={t}>
      {Array.from({ length: 10 }, (_, i) => <House key={i} x={170 + (i % 5) * 185} y={900 + Math.floor(i / 5) * 210} on={i < n} t={t} />)}
      <Seg text={String(n)} x={380} y={680} h={110} w={12} /><Tx x={500} y={676} size={60} anchor="start">OUT OF 10</Tx>
    </Screen>
  );
};
export const S31: S = ({ t }) => (
  <Screen t={t} grid="none">
    <g transform={`translate(540 820) scale(${popIn(t, 5)})`}><text textAnchor="middle" fontFamily={FONT.ui} fontSize={170} fill={G} letterSpacing={10}>THAT'S</text><text y={190} textAnchor="middle" fontFamily={FONT.ui} fontSize={200} fill={A} letterSpacing={10}>REAL.</text></g>
    <path d={`M 180 1090 L ${180 + 720 * ease(t / 8)} 1090`} {...ln(A, 12)} />
  </Screen>
);
export const S32: S = ({ t }) => {
  const k = ease((t - 40) / 30);
  return (
    <Screen t={t} grid="radar">
      <Sweep t={t} speed={6} r={lerp(640, 300, k)} c={k > 0.5 ? A : G} />
      {k < 0.6 ? [[760, 600, 200], [320, 1040, 30]].map(([x, y, r], i) => <Plane key={i} x={x} y={y} r={r} s={1.1} />) : null}
      <ellipse cx={540} cy={860} rx={300 * k} ry={300 * k} {...ln(A, 7)} opacity={k} />
      <Tx y={1096} size={48} t={t - 6} c={D}>WAR RADAR, DECLASSIFIED</Tx>
    </Screen>
  );
};
export const S33: S = ({ t }) => (
  <Screen t={t}>
    <Oven x={540} y={860} s={1.3} t={t} hot={1} time={`0:${String(Math.max(0, 9 - Math.floor(t / 7))).padStart(2, '0')}`} c={G}><Pizza s={1.25} t={t} /></Oven>
    <Tx y={560} size={40} t={t - 4} c={A}>MISSION: YESTERDAY'S PIZZA</Tx>
  </Screen>
);
export const S34: S = ({ t }) => (
  <Screen t={t}>
    <Oven x={540} y={860} s={1.3} t={t} open={ease(t / 10)} time="0:00"><Pizza s={1.25} t={0} /></Oven>
    {[0, 1, 2].map((i) => <path key={i} d="M 0 0 q 26 -40 0 -80 q -26 -40 0 -80" {...ln(A, 6)} transform={`translate(${380 + i * 80} ${820 - ((t * 3 + i * 24) % 70)})`} opacity={0.8} />)}
    <Tx y={560} size={66} t={t - 6}>YOU'RE WELCOME.</Tx>
  </Screen>
);
export const S35: S = ({ t }) => (
  <Screen t={t} grid="none">
    {[0, 1, 2, 3].map((i) => { const r = ((t * 9 + i * 110) % 440) + 60; return <circle key={i} cx={540} cy={800} r={r} {...ln(A, 7)} opacity={clamp(1 - r / 500)} />; })}
    <g transform={`translate(540 880) scale(${popIn(t, 5)})`}><text textAnchor="middle" fontFamily={FONT.ui} fontSize={300} fill={A} letterSpacing={16}>DING</text></g>
    <Tx y={1100} size={50} t={t - 16} c={G}>FOLLOW FOR SECONDS</Tx>
  </Screen>
);
