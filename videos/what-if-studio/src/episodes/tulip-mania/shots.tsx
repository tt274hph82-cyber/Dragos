import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT, LEG_LEN, HEAD } from '../../engine';
import { W, Mood, MOODS, Sky, Punch, Burst, Counter, BigNumber, Calendar, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, CloseCtx, Fore } from '../molasses/kit';
import { Rays, Clouds, Lamp, Shadow, Man, Gest } from '../great-stink/shots';

// "Tulip Mania" (the Dutch Republic, 1636-37): a native 9:16 story Short in the Great Stink style, with its fidelity
// kit (god rays, clouds, lamps, contact shadows, glows; the film look is the episode overlay). Colour only on the key
// thing: the flame-striped tulip (red and cream) and the gold it cost.

type S = React.FC<ShotProps>;
const scr = { mixBlendMode: 'screen' as const };
const TRED = '#E0283A', CREAM = '#FFF1D8', GOLD = '#FFC93C', LEAF = '#3E8A3A';

// ---------------------------------------------------------------- the flower and the bulb
/** A tulip: stem, two leaves and a cup of petals. `flame` paints cream flame stripes; `wilt` droops it; `glow` haloes it. */
const Tulip: React.FC<{ x: number; y: number; s?: number; t: number; flame?: boolean; wilt?: number; glow?: number; c?: string; sway?: number }> = ({ x, y, s = 1, t, flame, wilt = 0, glow = 0, c = TRED, sway = 1 }) => {
  const sw = Math.sin(t * 0.07 + x * 0.01) * 4 * sway, bend = wilt * 70;
  const head = `translate(${-bend * 1.4} ${-560 + bend * 4}) rotate(${-wilt * 80})`;
  const petal = (d: string, fill: string) => <path d={d} fill={fill} stroke={INK} strokeWidth={7} strokeLinejoin="round" />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sw})`}>
      {glow > 0 ? <circle cx={-bend} cy={-640 + bend * 3} r={240} fill={flame ? '#FF6A7A' : c} opacity={0.45 * glow} filter="url(#gsB24)" style={scr} /> : null}
      <path d={`M 0 0 Q ${10 - bend * 0.3} -300 ${-bend * 1.4} ${-560 + bend * 4}`} stroke={LEAF} strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M 0 -40 Q -150 -200 -40 -330 Q -60 -180 0 -90 Z" fill={LEAF} stroke={INK} strokeWidth={6} />
      <path d="M 4 -60 Q 160 -220 60 -360 Q 70 -200 8 -110 Z" fill="#4E9A44" stroke={INK} strokeWidth={6} />
      <g transform={head}>
        {petal('M -10 0 Q -120 -40 -100 -190 Q -60 -230 -10 -170 Z', c)}
        {petal('M 10 0 Q 120 -40 100 -190 Q 60 -230 10 -170 Z', c)}
        {petal('M 0 6 Q -90 -60 -50 -220 Q 0 -260 50 -220 Q 90 -60 0 6 Z', c)}
        {flame ? <g fill={CREAM} opacity={0.95}>
          <path d="M -6 -10 Q -30 -90 -14 -210 Q 6 -130 -2 -30 Z" />
          <path d="M 20 -10 Q 40 -110 30 -200 Q 52 -120 30 -20 Z" />
          <path d="M -40 -20 Q -80 -110 -76 -180 Q -54 -110 -26 -40 Z" />
          <path d="M 60 -40 Q 92 -110 84 -175 Q 104 -100 70 -40 Z" />
        </g> : null}
        <path d="M -40 -200 Q -20 -150 -26 -60" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.45} />
      </g>
    </g>
  );
};
/** A tulip bulb: a glossy brown onion shape with roots; glow haloes it gold. */
const Bulb: React.FC<{ x: number; y: number; s?: number; glow?: number; bite?: number }> = ({ x, y, s = 1, glow = 0, bite = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 ? <circle cx={0} cy={-90} r={260} fill={GOLD} opacity={0.5 * glow} filter="url(#gsB24)" style={scr} /> : null}
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-40 + i * 13} 0 q ${(i - 3) * 10} 40 ${(i - 3) * 16} 80`} stroke="#C8A878" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    <path d="M 0 -250 Q 30 -200 90 -150 Q 150 -90 110 -20 Q 60 10 0 10 Q -60 10 -110 -20 Q -150 -90 -90 -150 Q -30 -200 0 -250 Z" fill="#9A5A2A" stroke={INK} strokeWidth={9} />
    <path d="M 0 -240 Q -10 -120 -40 0 M 0 -240 Q 30 -120 50 0" stroke="#6A3A18" strokeWidth={6} fill="none" />
    <path d="M -70 -150 Q -100 -90 -80 -40" stroke="#E8B880" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.6} />
    {bite > 0 ? <g><path d="M 110 -170 q -40 20 -30 50 q -36 10 -26 46 q -30 16 -10 50 L 160 -20 L 160 -190 Z" fill="#14100C" /><path d="M 82 -122 q 10 -10 24 0 M 70 -76 q 12 -8 26 2" stroke="#F2E8C8" strokeWidth={8} fill="none" /></g> : null}
  </g>
);
/** A cartoon virus: a glowing green ball with knobbed spikes. */
const Virus: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x + Math.sin(t * 0.15 + x) * 10} ${y + Math.cos(t * 0.13 + y) * 10}) scale(${s}) rotate(${t * 0.8})`}>
    <circle r={110} fill="#9BE04A" opacity={0.5} filter="url(#gsB12)" />
    {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <g key={i}><path d={`M ${Math.cos(a) * 60} ${Math.sin(a) * 60} L ${Math.cos(a) * 100} ${Math.sin(a) * 100}`} stroke={INK} strokeWidth={10} /><circle cx={Math.cos(a) * 104} cy={Math.sin(a) * 104} r={14} fill="#C8F06A" stroke={INK} strokeWidth={6} /></g>; })}
    <circle r={66} fill="#7ACC2A" stroke={INK} strokeWidth={9} />
    <path d="M -30 -30 Q -10 -50 20 -40" stroke="#E8FFC0" strokeWidth={9} fill="none" strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- the set: a Dutch canal
type Gable = 'step' | 'bell' | 'neck';
/** A tall narrow canal house with a step, bell or neck gable, a hoist beam, and lit windows with halos. */
const CanalHouse: React.FC<{ x: number; base: number; w: number; h: number; c: string; g: Gable; lit: number; seed: number }> = ({ x, base, w, h, c, g, lit, seed }) => {
  const top = base - h, cols = Math.max(2, Math.floor(w / 60)), rows = Math.max(2, Math.floor((h - 90) / 100));
  const gable = g === 'step'
    ? `M ${x} ${top} L ${x} ${top - 40} L ${x + w * 0.15} ${top - 40} L ${x + w * 0.15} ${top - 80} L ${x + w * 0.3} ${top - 80} L ${x + w * 0.3} ${top - 120} L ${x + w * 0.7} ${top - 120} L ${x + w * 0.7} ${top - 80} L ${x + w * 0.85} ${top - 80} L ${x + w * 0.85} ${top - 40} L ${x + w} ${top - 40} L ${x + w} ${top} Z`
    : g === 'bell'
      ? `M ${x} ${top} Q ${x + w * 0.05} ${top - 60} ${x + w * 0.25} ${top - 80} Q ${x + w * 0.25} ${top - 150} ${x + w / 2} ${top - 160} Q ${x + w * 0.75} ${top - 150} ${x + w * 0.75} ${top - 80} Q ${x + w * 0.95} ${top - 60} ${x + w} ${top} Z`
      : `M ${x} ${top} L ${x + w * 0.2} ${top - 40} L ${x + w * 0.3} ${top - 40} L ${x + w * 0.3} ${top - 140} L ${x + w * 0.7} ${top - 140} L ${x + w * 0.7} ${top - 40} L ${x + w * 0.8} ${top - 40} L ${x + w} ${top} Z`;
  return (
    <g>
      <path d={gable} fill={c} />
      <rect x={x} y={top} width={w} height={h} fill={c} />
      <rect x={x + w / 2 - 4} y={top - 110} width={8} height={40} fill="#000" opacity={0.35} />
      <rect x={x} y={top} width={w} height={h} fill="url(#tmBrick)" opacity={0.18} />
      {Array.from({ length: cols * rows }, (_, k) => {
        const cx = x + ((k % cols) + 0.5) * (w / cols), cy = top + 40 + Math.floor(k / cols) * 100, on = random(`ch${seed}-${k}`) < lit;
        return <g key={k}>{on ? <circle cx={cx} cy={cy + 22} r={38} fill="#FFC870" opacity={0.42} filter="url(#gsB12)" /> : null}
          <rect x={cx - 15} y={cy} width={30} height={46} rx={4} fill={on ? '#FFD27A' : '#000'} opacity={on ? 0.92 : 0.3} />
          <path d={`M ${cx} ${cy} L ${cx} ${cy + 46} M ${cx - 15} ${cy + 22} L ${cx + 15} ${cy + 22}`} stroke="#000" strokeWidth={3} opacity={0.4} /></g>;
      })}
      <rect x={x + w / 2 - 18} y={base - 76} width={36} height={76} rx={10} fill="#000" opacity={0.45} />
    </g>
  );
};
const ROW: [number, number, number, Gable][] = [[-60, 150, 520, 'step'], [90, 130, 600, 'bell'], [220, 140, 540, 'neck'], [360, 120, 620, 'step'], [480, 150, 560, 'bell'], [630, 130, 640, 'neck'], [760, 140, 580, 'step'], [900, 150, 620, 'bell'], [1050, 130, 560, 'neck']];
/** A Dutch canal: sky, a church spire, the row of gabled houses, a quay with lanterns, the canal with reflections. */
const Canal: React.FC<{ id: string; mood: Mood; t: number; sunY?: number; sunX?: number; moon?: boolean; boats?: boolean }> = ({ id, mood, t, sunY = 400, sunX = 780, moon, boats = true }) => {
  const m = MOODS[mood], lit = mood === 'night' || mood === 'danger' ? 0.65 : mood === 'warm' ? 0.4 : 0.18, base = 1150;
  const houses = (c: string, l: number) => ROW.map(([x, w, h, g], i) => <CanalHouse key={i} x={x} base={base} w={w} h={Math.round(h * 0.6)} c={c} g={g} lit={l} seed={i} />);
  return (
    <g>
      <defs><pattern id="tmBrick" width={24} height={14} patternUnits="userSpaceOnUse"><path d="M 0 0 L 24 0 M 0 7 L 24 7 M 6 0 L 6 7 M 18 7 L 18 14" stroke="#000" strokeWidth={1.5} /></pattern></defs>
      <Sky id={id} mood={mood} sunY={sunY} sunX={sunX} moon={moon} />
      <Clouds mood={mood} t={t} y={420} o={mood === 'noon' || mood === 'warm' ? 0.35 : 0.65} />
      <g fill={m.layers[0]}><rect x={600} y={640} width={80} height={520} /><path d="M 600 640 L 640 420 L 680 640 Z" /><rect x={636} y={370} width={8} height={60} /><rect x={-100} y={900} width={1300} height={260} /></g>
      {houses(m.layers[1], lit)}
      <Rays x={sunX} y={sunY} t={t} o={moon ? 0.16 : 0.24} n={8} spread={110} dir={90} />
      <rect x={-300} y={base} width={W + 600} height={40} fill={m.layers[2]} />
      {/* the canal and the houses' reflection */}
      <rect x={-300} y={base + 40} width={W + 600} height={900} fill={m.ground} />
      <g opacity={0.3} filter="url(#gsB6)" transform={`translate(0 ${2 * (base + 40)}) scale(1 -1)`}>{houses(m.layers[0], lit)}</g>
      {Array.from({ length: 9 }, (_, r) => Array.from({ length: 6 }, (_, k) => {
        const yy = base + 70 + r * r * 7 + r * 20, xx = ((k * 230 + r * 90 + t * (0.8 + r * 0.2)) % 1500) - 200;
        return <path key={`${r}-${k}`} d={`M ${xx} ${yy} q 40 -10 80 0`} stroke={m.rim} strokeWidth={3 + r * 0.5} fill="none" opacity={0.3} />;
      }))}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={ROW[i % 9][0] + 60 + Math.sin(t * 0.2 + i) * 5} y={base + 50} width={10} height={130 + (i % 3) * 50} fill="#FFD27A" opacity={lit * 0.45} filter="url(#gsB6)" style={scr} />)}
      {boats ? <g transform={`translate(${((t * 0.6) % 1400) - 300} ${base + 150})`}><path d="M -160 -10 L 160 -10 L 120 40 L -130 40 Z" fill={INK} /><rect x={-4} y={-200} width={8} height={190} fill={INK} /><path d="M 4 -190 L 110 -30 L 4 -30 Z" fill={m.layers[0]} /></g> : null}
      <path d="M -300 1150 L 1380 1150" stroke={m.rim} strokeWidth={4} opacity={0.4} />
    </g>
  );
};
/** A windmill with turning sails. */
const Windmill: React.FC<{ x: number; base: number; s?: number; t: number; c: string }> = ({ x, base, s = 1, t, c }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`} fill={c}>
    <path d="M -70 0 L -45 -330 L 45 -330 L 70 0 Z" />
    <path d="M -55 -330 L 0 -400 L 55 -330 Z" />
    <g transform={`translate(0 -350) rotate(${t * 1.2})`}>
      {[0, 90, 180, 270].map((a) => <g key={a} transform={`rotate(${a})`}><rect x={-8} y={-300} width={16} height={300} /><rect x={8} y={-290} width={52} height={230} opacity={0.75} /></g>)}
      <circle r={20} />
    </g>
  </g>
);
/** A tulip field in perspective: rows of colour running to the horizon, a windmill. */
const Field: React.FC<{ id: string; mood: Mood; t: number; sunY?: number; sunX?: number; moon?: boolean }> = ({ id, mood, t, sunY = 520, sunX = 780, moon }) => {
  const m = MOODS[mood], hz = 980, cols = [TRED, '#FFD23F', '#F05AA0', CREAM, '#E86A2A'];
  return (
    <g>
      <Sky id={id} mood={mood} sunY={sunY} sunX={sunX} moon={moon} />
      <Clouds mood={mood} t={t} y={480} o={0.45} />
      <Windmill x={250} base={hz + 10} s={0.8} t={t} c={m.layers[1]} />
      <Windmill x={880} base={hz + 10} s={0.45} t={t + 40} c={m.layers[0]} />
      <Rays x={sunX} y={sunY} t={t} o={0.26} n={9} spread={120} dir={90} />
      <rect x={-300} y={hz} width={W + 600} height={1200} fill={m.ground} />
      {Array.from({ length: 12 }, (_, i) => {
        const u0 = i / 12, u1 = (i + 0.55) / 12, xs = (u: number, y: number) => 540 + (u - 0.5) * (y - hz) * 6.4;
        return <path key={i} d={`M ${xs(u0, hz + 2)} ${hz + 2} L ${xs(u1, hz + 2)} ${hz + 2} L ${xs(u1, 2100)} 2100 L ${xs(u0, 2100)} 2100 Z`} fill={cols[i % 5]} opacity={0.85} />;
      })}
      <rect x={-300} y={hz} width={W + 600} height={120} fill={m.sky[1]} opacity={0.35} filter="url(#gsB12)" />
    </g>
  );
};
/** A 17th-century tavern: dark beams, a fire, candles, a long table, mugs. */
const Tavern: React.FC<{ t: number }> = ({ t }) => {
  const fl = 1 + 0.1 * Math.sin(t * 0.9) + 0.06 * Math.sin(t * 2.3);
  return (
    <g>
      <rect x={-200} y={-200} width={W + 400} height={2400} fill="#24160C" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-100} y={150 + i * 40 * i} width={1300} height={26} fill="#120A06" opacity={0.7} />)}
      {Array.from({ length: 6 }, (_, i) => <rect key={`v${i}`} x={-60 + i * 220} y={0} width={26} height={1300} fill="#120A06" opacity={0.6} />)}
      {/* the fireplace */}
      <rect x={720} y={760} width={320} height={420} fill="#120A06" /><path d="M 700 760 L 1060 760 L 1040 700 L 720 700 Z" fill="#3A2416" />
      {Array.from({ length: 6 }, (_, i) => { const h = (120 + (i % 3) * 50) * fl * (1 + 0.2 * Math.sin(t * 0.8 + i)); return <path key={i} d={`M ${760 + i * 45} 1170 Q ${770 + i * 45} ${1170 - h * 0.6} ${780 + i * 45} ${1170 - h} Q ${800 + i * 45} ${1170 - h * 0.6} ${800 + i * 45} 1170 Z`} fill={i % 2 ? '#FFB13A' : '#FF6A1A'} />; })}
      <circle cx={880} cy={1050} r={420 * fl} fill="#FF8A2A" opacity={0.4} filter="url(#gsB48)" style={scr} />
      <Rays x={880} y={1050} t={t} o={0.12} n={8} len={900} spread={360} dir={0} color="#FFB060" />
      {/* the table, candles and mugs */}
      <path d="M -100 1250 L 1180 1250 L 1180 1310 L -100 1310 Z" fill="#5A3A20" stroke={INK} strokeWidth={6} />
      {[180, 480].map((cx, i) => <g key={cx}><rect x={cx - 14} y={1160} width={28} height={90} fill={CREAM} stroke={INK} strokeWidth={4} /><ellipse cx={cx} cy={1145 - 4 * fl} rx={10} ry={22 * fl} fill="#FFC24A" /><circle cx={cx} cy={1140} r={120} fill="#FFC870" opacity={0.5} filter="url(#gsB24)" style={scr} /></g>)}
      {[300, 620].map((mx) => <g key={mx}><rect x={mx - 30} y={1180} width={60} height={70} rx={8} fill="#8A6A40" stroke={INK} strokeWidth={5} /><path d={`M ${mx + 30} 1195 q 30 10 0 40`} stroke={INK} strokeWidth={6} fill="none" /><ellipse cx={mx} cy={1180} rx={30} ry={8} fill="#F2E8C8" /></g>)}
    </g>
  );
};
/** A Dutch burgher of 1637: tall-crowned wide hat and a white ruff (drawn over the shared figure). */
const Dutch: React.FC<{ x: number; feet: number; s: number; mood: Mood; t: number; g?: Gest; flip?: boolean; ph?: number; hat?: boolean }> = ({ x, feet, s, mood, t, g = 'stand', flip, ph = 0, hat = true }) => {
  const hy = feet - LEG_LEN * s + HEAD.y * s, rim = MOODS[mood].rim;
  return (
    <g>
      <Man x={x} feet={feet} s={s} mood={mood} t={t} g={g} hat="none" flip={flip} ph={ph} />
      <ellipse cx={x} cy={hy + 78 * s} rx={62 * s} ry={20 * s} fill="#F2EADC" stroke={INK} strokeWidth={4 * s} />
      {hat ? <g transform={`translate(${x} ${hy - 60 * s}) scale(${s})`} fill={INK} stroke={rim} strokeWidth={3}><ellipse cx={0} cy={6} rx={96} ry={16} /><path d="M -50 6 L -40 -80 L 40 -80 L 50 6 Z" /></g> : null}
    </g>
  );
};
const dutch = (mood: Mood, t: number, n: number, x0: number, x1: number, feet: number, s: number, g: Gest, seed = 0): React.ReactNode =>
  Array.from({ length: n }, (_, i) => <Dutch key={i} x={lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)) + (random(`dx${seed}${i}`) - 0.5) * 40} feet={feet + (i % 3) * 14} s={s * (0.92 + (i % 3) * 0.05)} mood={mood} t={t} g={g} flip={i % 2 === 0} ph={i * 1.7 + seed} hat={i % 4 !== 3} />);

// ---------------------------------------------------------------- props
/** A balance: `tilt` -1..1 (positive drops the right pan); left and right are what sits on the pans. */
const Scale: React.FC<{ t: number; tilt: number; left: React.ReactNode; right: React.ReactNode; y?: number }> = ({ t, tilt, left, right, y = 760 }) => {
  const a = tilt * 14, dx = 330 * Math.cos(a * Math.PI / 180), dy = 330 * Math.sin(a * Math.PI / 180);
  const pan = (px: number, py: number, item: React.ReactNode) => <g transform={`translate(${px} ${py})`}><path d="M -110 140 L 0 0 L 110 140" stroke="#C8A050" strokeWidth={5} fill="none" /><path d="M -150 140 Q 0 210 150 140 Z" fill="#B8862A" stroke={INK} strokeWidth={7} /><g transform="translate(0 140)">{item}</g></g>;
  return (
    <g transform={`translate(540 ${y}) scale(${popIn(t)})`}>
      <rect x={-16} y={-20} width={32} height={520} fill="#8A6A2A" stroke={INK} strokeWidth={6} />
      <path d="M -120 520 L 120 520 L 90 480 L -90 480 Z" fill="#8A6A2A" stroke={INK} strokeWidth={6} />
      <path d={`M ${-dx} ${-dy} L ${dx} ${dy}`} stroke="#C8A050" strokeWidth={22} strokeLinecap="round" />
      <path d={`M ${-dx} ${-dy} L ${dx} ${dy}`} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
      <circle r={22} fill={GOLD} stroke={INK} strokeWidth={6} />
      {pan(-dx, -dy, left)}{pan(dx, dy, right)}
    </g>
  );
};
const HouseIcon: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}><path d="M -70 0 L -70 -170 L 0 -240 L 70 -170 L 70 0 Z" fill="#8A4A2A" stroke={INK} strokeWidth={8} />{[[-40, -150], [10, -150], [-40, -90], [10, -90]].map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={28} height={36} fill="#FFD27A" stroke={INK} strokeWidth={4} />)}<rect x={-14} y={-50} width={28} height={50} fill={INK} /></g>
);
/** Simple flat goods for the swap list. */
const Good: React.FC<{ kind: 'ox' | 'pig' | 'sheep' | 'butter' | 'bed'; x: number; y: number; t: number; s?: number }> = ({ kind, x, y, t, s = 1 }) => {
  if (t < 0) return null;
  const k = popIn(t, 6) * s;
  const body = { ox: '#8A5A32', pig: '#F2A0A8', sheep: '#F2EADC', butter: '#FFE27A', bed: '#B84A3A' }[kind];
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx={0} cy={70} rx={110} ry={16} fill="#000" opacity={0.4} filter="url(#gsB6)" />
      {kind === 'butter' ? <g><path d="M -90 60 L -60 -10 L 90 -10 L 90 60 Z" fill={body} stroke={INK} strokeWidth={7} /><path d="M -60 -10 L -30 -40 L 110 -40 L 90 -10 Z" fill="#FFF0A0" stroke={INK} strokeWidth={7} /></g>
        : kind === 'bed' ? <g><rect x={-110} y={0} width={220} height={50} fill={body} stroke={INK} strokeWidth={7} /><rect x={-120} y={-60} width={24} height={130} fill="#6A3A20" stroke={INK} strokeWidth={6} /><rect x={96} y={-30} width={24} height={100} fill="#6A3A20" stroke={INK} strokeWidth={6} /><ellipse cx={-70} cy={-6} rx={40} ry={18} fill="#F2EADC" stroke={INK} strokeWidth={5} /></g>
          : <g>
            {[-60, -25, 25, 60].map((lx) => <rect key={lx} x={lx - 9} y={20} width={18} height={50} fill={INK} />)}
            <ellipse cx={0} cy={0} rx={100} ry={56} fill={body} stroke={INK} strokeWidth={7} />
            {kind === 'sheep' ? Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-70 + i * 23} cy={-40 + (i % 2) * 10} r={24} fill={body} stroke={INK} strokeWidth={5} />) : null}
            <ellipse cx={100} cy={-26} rx={40} ry={32} fill={kind === 'sheep' ? INK : body} stroke={INK} strokeWidth={7} />
            {kind === 'ox' ? <path d="M 82 -50 q -14 -10 -6 -30 M 118 -50 q 14 -10 6 -30" stroke="#F2EADC" strokeWidth={9} fill="none" strokeLinecap="round" /> : null}
            {kind === 'pig' ? <ellipse cx={136} cy={-22} rx={12} ry={14} fill="#E07888" stroke={INK} strokeWidth={5} /> : null}
            <circle cx={106} cy={-34} r={6} fill={kind === 'sheep' ? '#FFF' : INK} />
          </g>}
    </g>
  );
};
/** A paper contract with a red wax seal. */
const Contract: React.FC<{ t: number; x?: number; y?: number; rot?: number; s?: number }> = ({ t, x = 540, y = 780, rot = -4, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${popIn(t) * s})`}>
    <ellipse cx={20} cy={330} rx={300} ry={30} fill="#000" opacity={0.45} filter="url(#gsB12)" />
    <path d="M -270 -330 L 270 -330 L 270 300 Q 140 330 0 300 Q -140 270 -270 300 Z" fill="#F2E4C4" stroke={INK} strokeWidth={9} />
    <text x={0} y={-230} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={58} fill="#6A4A2A">I PROMISE</text>
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -200 ${-150 + i * 52} L ${180 - (i % 3) * 50} ${-150 + i * 52}`} stroke="#A89470" strokeWidth={10} strokeLinecap="round" />)}
    <circle cx={160} cy={210} r={56} fill="#A8202A" stroke={INK} strokeWidth={6} /><circle cx={160} cy={210} r={36} fill="none" stroke="#D84A50" strokeWidth={5} />
    <g transform="translate(-100 200) scale(0.22)"><Tulip x={0} y={300} t={0} flame sway={0} /></g>
  </g>
);
/** A price chart: the line climbs with k, and after `crash` dives red. */
const Chart: React.FC<{ t: number; k: number; crash?: number }> = ({ t, k, crash = 0 }) => {
  const pts = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return [-360 + u * 720, 260 - Math.pow(u, 3.2) * 560 + Math.sin(i * 1.7) * 10] as [number, number]; });
  const n = Math.max(2, Math.round(k * 40) + 1), up = pts.slice(0, n), top = up[up.length - 1];
  const down: [number, number][] = crash > 0 ? [top, [top[0] + 60 * crash, top[1] + 200 * crash], [top[0] + 120 * crash, top[1] + 520 * crash]] : [];
  const d = (p: [number, number][]) => p.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  return (
    <g transform={`translate(540 860) scale(${popIn(t)})`}>
      <rect x={-420} y={-360} width={840} height={700} rx={24} fill="#1A1410" stroke="#5A4A30" strokeWidth={8} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -390 ${-300 + i * 110} L 390 ${-300 + i * 110}`} stroke="#3A3020" strokeWidth={3} />)}
      <path d={d(up)} stroke={GOLD} strokeWidth={34} fill="none" opacity={0.4} filter="url(#gsB12)" />
      <path d={d(up)} stroke={GOLD} strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {crash > 0 ? <g><path d={d(down)} stroke="#FF3A3A" strokeWidth={34} fill="none" opacity={0.45} filter="url(#gsB12)" /><path d={d(down)} stroke="#FF3A3A" strokeWidth={14} fill="none" strokeLinecap="round" /></g> : null}
      <circle cx={crash > 0 ? down[2][0] : top[0]} cy={crash > 0 ? down[2][1] : top[1]} r={18} fill="#FFF" />
      <text x={-380} y={-300} fontFamily={FONT.title} fontWeight={800} fontSize={40} fill="#C8B080">TULIP PRICES</text>
    </g>
  );
};
const Books: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 1000) scale(${popIn(t) * 1.3})`}>
    <ellipse cx={0} cy={20} rx={340} ry={40} fill="#000" opacity={0.45} filter="url(#gsB12)" />
    {[['#7A2A22', -10, 300], ['#2A4A6A', -100, 280], ['#6A5A2A', -180, 310], ['#3A5A3A', -260, 260]].map(([c, y, w], i) => <g key={i}><rect x={-(w as number) / 2} y={(y as number) - 80} width={w as number} height={80} rx={8} fill={c as string} stroke={INK} strokeWidth={7} /><rect x={-(w as number) / 2 + 20} y={(y as number) - 60} width={(w as number) - 40} height={10} fill="#E8C870" opacity={0.7} /></g>)}
    <circle cx={0} cy={-200} r={260} fill="#FFC870" opacity={0.25} filter="url(#gsB24)" style={scr} />
  </g>
);
/** A soap bubble with a tulip inside, wobbling; pop 0..1 bursts it. */
const Bubble: React.FC<{ t: number; pop?: number }> = ({ t, pop = 0 }) => {
  const r = 330, w = Math.sin(t * 0.2) * 12;
  return (
    <g transform={`translate(540 ${820 - t * 0.6}) scale(${popIn(t)})`}>
      {pop < 1 ? <g opacity={1 - pop}>
        <ellipse rx={r + w} ry={r - w} fill="#BFE4FF" opacity={0.18} /><ellipse rx={r + w} ry={r - w} fill="none" stroke="#FFD8F0" strokeWidth={40} opacity={0.6} filter="url(#gsB12)" /><ellipse rx={r + w} ry={r - w} fill="none" stroke="#E8F4FF" strokeWidth={8} />
        <path d={`M ${-r * 0.6} ${-r * 0.45} Q ${-r * 0.4} ${-r * 0.8} 0 ${-r * 0.85}`} stroke="#FFFFFF" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.7} />
        <ellipse rx={r + w} ry={r - w} fill="none" stroke="#FF8AD0" strokeWidth={4} opacity={0.5} transform="rotate(30)" />
        <g transform="scale(0.5)"><Tulip x={0} y={360} t={t} flame glow={0.6} /></g>
      </g> : null}
      {pop > 0 ? Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, d = r * (0.9 + pop * 0.8); return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={14 * (1 - pop)} fill="#E8F4FF" />; }) : null}
    </g>
  );
};

// ---------------------------------------------------------------- the hook
export const S1: S = ({ t }) => (
  <g>
    <Canal id="t1" mood="night" t={t} moon sunX={300} sunY={360} />
    <Tulip x={540} y={1560} s={1.25} t={t} flame glow={1} />
    <Lamp x={110} base={1720} s={1.1} t={t} />
    <Punch t={t - 2} lines={['HOLLAND,', '1637']} y={300} size={116} color={TRED} kicker="THE CRAZIEST MARKET EVER" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Canal id="t2" mood="warm" t={t} sunY={420} sunX={300} />
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#000" opacity={0.35} />
    <Scale t={t - 1} tilt={lerp(-0.6, 0.7, easeOut(clamp((t - 8) / 20)))} left={<HouseIcon s={0.9} />} right={<Bulb x={0} y={0} s={0.6} glow={1} />} />
    <Punch t={t - 3} lines={['MORE THAN', 'A HOUSE']} y={300} size={104} color={GOLD} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1A0E12" />
    <Rays x={540} y={-100} t={t} o={0.3} n={6} spread={40} dir={90} len={1600} />
    <ellipse cx={540} cy={1140} rx={330} ry={70} fill="#6A1A2A" stroke={INK} strokeWidth={8} />
    <ellipse cx={540} cy={1110} rx={300} ry={60} fill="#8A2238" />
    <Bulb x={540} y={1100} s={1.5} glow={1} />
    <Burst t={t - 3} text="A FLOWER?!" x={540} y={460} size={90} color={GOLD} />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Canal id="t5" mood="noon" t={t} sunY={360} sunX={800} />
    {dutch('noon', t, 3, 240, 840, 1500, 0.95, 'shock', 5)}
    <Sfx t={t - 3} text="NO JOKE!" x={540} y={620} rot={-6} size={110} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Field id="t6" mood="warm" t={t} sunY={560} sunX={540} />
    <Punch t={t - 2} lines={['TULIP', 'MANIA']} y={300} size={130} color={TRED} />
  </g>
);
// ---------------------------------------------------------------- the setup
export const S7: S = ({ t }) => (
  <g>
    <Canal id="t7" mood="noon" t={t} sunY={360} sunX={300} />
    {dutch('noon', t, 4, 140, 940, 1500, 0.9, 'stand', 7)}
    <Punch t={t - 2} lines={['GOLDEN AGE']} y={300} size={110} color={GOLD} kicker="HOLLAND WAS RICH" />
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1C14" />
    <Rays x={200} y={-100} t={t} o={0.35} n={6} spread={40} dir={60} len={2000} />
    <path d="M 340 1250 L 740 1250 L 700 1420 L 380 1420 Z" fill="#3A6AB0" stroke={INK} strokeWidth={9} />
    <path d="M 360 1290 L 720 1290" stroke="#F2F4FF" strokeWidth={10} />
    <Tulip x={540} y={1260} s={1.2} t={t} c="#FFD23F" glow={0.8} />
    {Array.from({ length: 6 }, (_, i) => { const q = ((t * 0.03 + i / 6) % 1); return <path key={i} d={`M ${400 + i * 60} ${700 - q * 200} l 10 -26 l 10 26 l 26 10 l -26 10 l -10 26 l -10 -26 l -26 -10 Z`} fill="#FFF2C8" opacity={1 - q} />; })}
    <Punch t={t - 2} lines={['BRAND NEW,', 'SUPER FANCY']} y={300} size={96} color={GOLD} />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#140A10" />
    <circle cx={540} cy={800} r={520} fill="#6A1A30" opacity={0.6} filter="url(#gsB48)" />
    <Rays x={540} y={760} t={t} o={0.22} n={12} spread={360} dir={0} len={1100} color="#FF8AA0" />
    <Tulip x={540} y={1400} s={1.45} t={t} flame glow={1} />
    <Punch t={t - 2} lines={['FLAME', 'STRIPES']} y={300} size={110} color={TRED} kicker="THE RAREST ONES" />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Canal id="t10" mood="warm" t={t} sunY={400} sunX={800} />
    <g transform="translate(540 760)"><rect x={-180} y={-230} width={360} height={360} fill="#2A1A10" stroke="#8A6A40" strokeWidth={16} /><rect x={-180} y={-230} width={360} height={360} fill="#FFC870" opacity={0.35} /><g transform="scale(0.42)"><Tulip x={0} y={260} t={t} flame glow={1} /></g></g>
    {dutch('warm', t, 4, 140, 940, 1520, 0.92, 'point', 10)}
  </g>
);
// ---------------------------------------------------------------- the boom
export const S11: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#120E0A" />
    <Chart t={t - 1} k={clamp(t / 50)} />
    {Array.from({ length: 10 }, (_, i) => { const q = ((t * 0.04 + i / 10) % 1); return <g key={i} transform={`translate(${120 + i * 92} ${380 + q * 1100}) rotate(${q * 400})`}><ellipse rx={28} ry={10} fill={GOLD} stroke={INK} strokeWidth={4} /></g>; })}
    <Punch t={t - 2} lines={['PRICES WENT', 'CRAZY']} y={300} size={100} color={GOLD} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1C12" />
    <Rays x={540} y={-100} t={t} o={0.25} n={6} spread={50} dir={90} />
    <g transform={`translate(540 860) scale(${popIn(t - 1)}) rotate(-3)`}>
      <ellipse cx={0} cy={420} rx={360} ry={34} fill="#000" opacity={0.45} filter="url(#gsB12)" />
      <rect x={-330} y={-420} width={660} height={820} fill="#EAD9B0" stroke={INK} strokeWidth={9} />
      <rect x={-360} y={-450} width={720} height={60} rx={30} fill="#C8B080" stroke={INK} strokeWidth={8} />
      <rect x={-360} y={380} width={720} height={60} rx={30} fill="#C8B080" stroke={INK} strokeWidth={8} />
      <text x={0} y={-320} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={54} fill="#6A4A2A">ONE BULB =</text>
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M -260 ${-240 + i * 58} L ${200 - (i % 4) * 60} ${-240 + i * 58}`} stroke="#A89470" strokeWidth={10} strokeLinecap="round" opacity={clamp((t - 6 - i * 2) / 4)} />)}
    </g>
  </g>
);
const goodsBg = (id: string, t: number) => <g><rect x={-200} y={-200} width={W + 400} height={2400} fill="#1E1A10" /><Rays x={540} y={-100} t={t} o={0.25} n={6} spread={50} dir={90} /><rect x={-200} y={1200} width={W + 400} height={900} fill="#120E08" /></g>;
export const S13: S = ({ t }) => (
  <g>
    {goodsBg('t13', t)}
    {[0, 1, 2, 3].map((i) => <Good key={i} kind="ox" x={200 + (i % 2) * 300} y={780 + Math.floor(i / 2) * 230} t={t - i * 3} s={1.1} />)}
    {Array.from({ length: 8 }, (_, i) => <Good key={i} kind="pig" x={780 + (i % 2) * 150} y={620 + Math.floor(i / 2) * 150} t={t - 36 - i * 2} s={0.62} />)}
    <Counter t={t - 1} from={0} to={4} dur={10} sub="FAT OXEN" y={400} color={GOLD} />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    {goodsBg('t14', t)}
    {Array.from({ length: 12 }, (_, i) => <Good key={i} kind="sheep" x={150 + (i % 4) * 260} y={640 + Math.floor(i / 4) * 150} t={t - i * 1.5} s={0.6} />)}
    <Good kind="butter" x={300} y={1120} t={t - 50} s={1.1} />
    <Good kind="bed" x={760} y={1110} t={t - 76} s={1.1} />
    <Punch t={t - 78} lines={['AND A BED.']} y={300} size={110} color={GOLD} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Tavern t={t} />
    {dutch('warm', t, 3, 200, 880, 1250, 0.9, 'point', 15)}
    <Contract t={t - 8} x={560} y={1170} rot={-8} s={0.3} />
    <Punch t={t - 2} lines={['IN TAVERNS']} y={300} size={110} color={GOLD} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Sky id="t16" mood="night" moon sunX={800} sunY={360} />
    <Clouds mood="night" t={t} y={420} o={0.6} />
    <rect x={-200} y={700} width={W + 400} height={1400} fill="#2A1A10" />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={random(`s${i}`) * W} cy={760 + random(`r${i}`) * 700} r={6 + random(`q${i}`) * 10} fill="#3A2416" />)}
    <path d="M -200 700 L 1280 700" stroke="#5A8A3A" strokeWidth={22} />
    {[200, 540, 880].map((bx, i) => <g key={bx}><path d={`M ${bx} 700 L ${bx} 860`} stroke={LEAF} strokeWidth={10} strokeDasharray="14 10" /><Bulb x={bx} y={1060} s={0.85} glow={0.9} /></g>)}
    <Punch t={t - 2} lines={['STILL IN', 'THE DIRT']} y={290} size={104} color={GOLD} />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Tavern t={t} />
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#000" opacity={0.3} />
    <Contract t={t - 1} x={540} y={830} rot={-4} s={1.05} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Canal id="t18" mood="cold" t={t} moon sunX={800} sunY={360} />
    {Array.from({ length: 7 }, (_, i) => { const q = clamp(((t + i * 5) % 60) / 60); return <g key={i} transform={`translate(${-100 + q * 1400} ${900 - Math.sin(q * 3 + i) * 200 - i * 40}) rotate(${q * 500 + i * 40})`}><rect x={-70} y={-90} width={140} height={180} fill="#F2E4C4" stroke={INK} strokeWidth={6} /><circle cx={30} cy={50} r={18} fill="#A8202A" /></g>; })}
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${-200 + ((t * 8 + i * 300) % 1600)} ${600 + i * 120} q 120 -40 240 0`} stroke="#DDEEFF" strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round" />)}
    <Punch t={t - 2} lines={['THE WIND', 'TRADE']} y={300} size={120} color="#9FE3FF" />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Canal id="t19" mood="warm" t={t} sunY={420} sunX={800} boats={false} />
    <g transform="translate(300 1180)" style={{ filter: `drop-shadow(0 0 5px ${MOODS.warm.rim})` }}><path d="M -420 -60 L 380 -60 L 300 70 L -340 70 Z" fill={INK} /><rect x={-12} y={-600} width={24} height={540} fill={INK} /><path d="M 12 -580 Q 240 -420 12 -280 Z" fill="#D8C8A0" stroke={INK} strokeWidth={5} /></g>
    <Dutch x={760} feet={1500} s={1.05} mood="warm" t={t} g="stand" hat={false} />
    <Sfx t={t - 3} text="LEGEND SAYS..." x={560} y={600} rot={-5} size={80} />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1A10" />
    <Glow x={540} y={800} r={700} kind="warm" o={0.5} />
    <Dutch x={540} feet={1700} s={1.9} mood="warm" t={t} g="stand" hat={false} />
    <Bulb x={700} y={1080} s={0.55} bite={t > 10 ? 1 : 0} />
    <Sfx t={t - 10} text="CRUNCH!" x={540} y={560} rot={-8} size={120} />
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <Canal id="t21" mood="danger" t={t} sunY={420} sunX={300} />
    {dutch('danger', t, 3, 240, 840, 1500, 1.0, 'shock', 21)}
    <Burst t={t - 2} text="AN ONION?!" x={540} y={620} size={92} color="#FF5A5A" />
  </g>
);
// ---------------------------------------------------------------- the twist
export const S22: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#140A10" />
    <circle cx={540} cy={800} r={520} fill="#6A1A30" opacity={0.5} filter="url(#gsB48)" />
    <Tulip x={540} y={1400} s={1.45} t={t + 40} flame glow={0.8} />
    <Sfx t={t - 3} text="?" x={860} y={520} rot={8} size={240} />
    <Punch t={t - 2} lines={['WHY THE', 'STRIPES?']} y={290} size={104} color={TRED} />
  </g>
);
export const S23: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#0E1A0E" />
    <circle cx={540} cy={860} r={430} fill="#3A1020" stroke="#C8D8A0" strokeWidth={18} />
    <g opacity={0.6}>{Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${300 + i * 110} 560 Q ${330 + i * 110} 860 ${290 + i * 110} 1160`} stroke={CREAM} strokeWidth={40} fill="none" />)}</g>
    {[[420, 760], [660, 700], [560, 960], [380, 1020], [720, 980]].map(([vx, vy], i) => <Virus key={i} x={vx} y={vy} s={0.7} t={t + i * 9} />)}
    <circle cx={540} cy={860} r={430} fill="none" stroke={INK} strokeWidth={8} />
    <Punch t={t - 2} lines={['A VIRUS']} y={290} size={130} color="#9BE04A" />
  </g>
);
export const S24: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#160C10" />
    <Glow x={540} y={900} r={600} kind="cool" o={0.4} />
    <Tulip x={540} y={1420} s={1.3} t={t} flame wilt={easeOut(clamp(t / 30)) * 0.8} glow={0.5} />
    <Punch t={t - 2} lines={['THE FLOWERS', 'WERE SICK']} y={300} size={100} color="#9BE04A" />
  </g>
);
// ---------------------------------------------------------------- the crash
export const S25: S = ({ t }) => (
  <g>
    <Canal id="t25" mood="cold" t={t} moon sunX={300} sunY={360} />
    <Calendar t={t - 1} day="3" month="FEBRUARY" year="1637" x={540} y={760} />
  </g>
);
const Hall: React.FC<{ t: number; full?: number }> = ({ t, full = 0 }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#20160E" />
    {[180, 540, 900].map((wx) => <g key={wx}><path d={`M ${wx - 100} 1000 L ${wx - 100} 480 Q ${wx} 360 ${wx + 100} 480 L ${wx + 100} 1000 Z`} fill="#8AA0B8" opacity={0.5} /><path d={`M ${wx - 90} 480 L ${wx + 90} 480 L ${wx + 400} 1700 L ${wx + 60} 1700 Z`} fill="url(#gsRay)" opacity={0.25} filter="url(#gsB16)" style={scr} /></g>)}
    <rect x={-200} y={1040} width={W + 400} height={1000} fill="#2E2014" />
    {[1200, 1340, 1480].map((by, i) => <rect key={by} x={-100} y={by} width={1300} height={60} rx={10} fill="#5A3A20" stroke={INK} strokeWidth={6} opacity={1 - i * 0.12} />)}
    {/* the auctioneer's lectern */}
    <path d="M 420 1180 L 660 1180 L 640 960 L 440 960 Z" fill="#6A4428" stroke={INK} strokeWidth={7} />
    <Dutch x={540} feet={1000} s={0.75} mood="cold" t={t} g="vote" />
    {full > 0 ? dutch('cold', t, 5, 100, 980, 1560, 0.9, 'vote', 26) : null}
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Hall t={t} />
    <Punch t={t - 2} lines={['AUCTION IN', 'HAARLEM']} y={290} size={100} color={GOLD} />
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <Hall t={t + 30} />
    <Sfx t={t - 4} text="...CRICKETS" x={540} y={760} rot={-4} size={90} />
  </g>
);
export const S28: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#160A0A" />
    <Glow x={540} y={900} r={700} kind="red" o={0.5} />
    <Chart t={30} k={1} crash={easeOut(clamp((t - 2) / 14))} />
    <Burst t={t - 6} text="CRASH!" x={560} y={480} size={110} color="#FF3A3A" />
  </g>
);
export const S30: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1A120A" />
    <Rays x={540} y={-100} t={t} o={0.3} n={6} spread={50} dir={90} />
    <Books t={t - 1} />
    <Punch t={t - 3} lines={['BLOWN UP', 'LATER']} y={290} size={110} color="#9FE3FF" kicker="HISTORIANS SAY" />
  </g>
);
export const S31: S = ({ t }) => (
  <g>
    <Canal id="t31" mood="warm" t={t} sunY={420} sunX={800} />
    {dutch('warm', t, 4, 140, 940, 1500, 0.92, 'stand', 31)}
    <Punch t={t - 2} lines={["MOST DIDN'T", 'GO BROKE']} y={300} size={100} color={GOLD} />
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    <Canal id="t32" mood="night" t={t} moon sunX={300} sunY={360} />
    <circle cx={540} cy={800} r={420} fill="#FF8AD0" opacity={0.25} filter="url(#gsB48)" style={scr} />
    <Bubble t={t} pop={clamp((t - 42) / 10)} />
    <Punch t={t - 2} lines={['MONEY', 'BUBBLE']} y={290} size={120} color="#FF8AD0" kicker="ONE OF THE FIRST" />
  </g>
);
// ---------------------------------------------------------------- the end
export const S33: S = ({ t }) => (
  <g>
    <Canal id="t33" mood="night" t={t} moon sunX={800} sunY={360} />
    <Punch t={t - 2} lines={['YOU GET IT?']} y={320} size={120} color={GOLD} />
  </g>
);
export const S34: S = ({ t }) => (
  <g>
    <Canal id="t34" mood="danger" t={t} moon sunX={300} sunY={360} />
    <Burst t={t - 2} text="I SAID..." x={540} y={560} size={90} color={GOLD} />
    <Punch t={t - 6} lines={['YOU GET IT?']} y={760} size={120} color="#FF5A5A" />
  </g>
);
export const S35: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#140A0C" />
    <Rays x={540} y={-100} t={t} o={0.3} n={6} spread={50} dir={90} />
    <Scale t={t - 1} tilt={0.7} y={800} left={<g>{Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={-60 + (i % 3) * 60} cy={-20 - Math.floor(i / 3) * 24} rx={30} ry={12} fill={GOLD} stroke={INK} strokeWidth={4} />)}</g>} right={<g transform="scale(0.26)"><Tulip x={0} y={0} t={t} flame wilt={0.6} glow={1} /></g>} />
    <Punch t={t - 3} lines={['A FORTUNE FOR', 'A SICK FLOWER']} y={290} size={86} color={TRED} />
  </g>
);
export const S36: S = ({ t }) => (
  <g>
    <Field id="t36" mood="warm" t={t} sunY={760} sunX={540} />
    <Punch t={t - 2} lines={["THAT'S REAL."]} y={300} size={120} color={GOLD} />
  </g>
);
export const S37: S = ({ t }) => (
  <g>
    <Canal id="t37" mood="night" t={t} moon sunX={800} sunY={360} />
    {dutch('night', t, 4, 140, 940, 1520, 0.9, 'stand', 37)}
    <Lamp x={110} base={1720} s={1.1} t={t} />
    <Punch t={t - 3} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={300} size={80} color="#C9A2FF" />
  </g>
);

// ---------------------------------------------------------------- "wide, then close" pairs
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S4 = close(S3, 540, 1000, 1.5, 30);    // "Bulb": on the bulb
export const S29 = close(S28, 640, 1000, 1.5, 30);  // "crashed in days": the red line
export const S38 = close(S37, 540, 1350, 1.5, 40);  // "strange history": the crowd
