import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT, LEG_LEN, HEAD } from '../../engine';
import { W, Mood, MOODS, Sky, Punch, Burst, Counter, BigNumber, Calendar, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, CloseCtx } from '../molasses/kit';
import { Rays, Clouds, Lamp, Shadow, Man, Gest } from '../great-stink/shots';
import words from './words.json';

// "The Kentucky Meat Shower" (Bath County, 1876): a native 9:16 story Short in the Great Stink style. Every shot shows
// exactly what is being said, and things inside a shot appear on the spoken word: `since(f, 'lung')` is the number of
// frames since that word started (f is the film's absolute frame). Colour only on the key thing: the red meat.

type S = React.FC<ShotProps>;
const scr = { mixBlendMode: 'screen' as const };
const MEAT = '#C8384A', FAT = '#F6D6C8', SKYB = '#7AB8F0';
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/** Frames since the n-th spoken `word` started (negative before it). */
const since = (f: number, word: string, n = 0) => {
  const hits = (words as { w: string; s: number }[]).filter((x) => norm(x.w) === norm(word));
  const w = hits[Math.min(n, hits.length - 1)];
  return w ? f - Math.round(w.s * 30) : 0;
};

// ---------------------------------------------------------------- meat
const Meat: React.FC<{ x: number; y: number; s?: number; rot?: number; seed?: number; glow?: number }> = ({ x, y, s = 1, rot = 0, seed = 0, glow = 0 }) => {
  const r = (k: number) => 0.8 + random(`m${seed}-${k}`) * 0.4;
  const d = `M ${-60 * r(1)} ${-10} Q ${-50 * r(2)} ${-46 * r(3)} ${0} ${-40 * r(4)} Q ${56 * r(5)} ${-44 * r(6)} ${62 * r(7)} ${4} Q ${50 * r(8)} ${40 * r(9)} ${-6} ${36 * r(10)} Q ${-58 * r(11)} ${34} ${-60 * r(1)} ${-10} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {glow > 0 ? <circle r={90} fill={MEAT} opacity={0.4 * glow} filter="url(#gsB12)" /> : null}
      <path d={d} fill={MEAT} stroke={INK} strokeWidth={5} />
      <path d="M -40 -6 Q -10 -20 20 -4 Q 40 6 50 0" stroke={FAT} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M -30 18 Q 0 10 26 22" stroke={FAT} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M -36 -26 Q -16 -36 6 -30" stroke="#FFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
    </g>
  );
};
/** Meat flakes and chunks falling from the sky; `k` 0..1 how many; landed ones lie on the ground at `ground`. */
const MeatRain: React.FC<{ t: number; n?: number; ground?: number; s?: number; seed?: number; flakes?: boolean }> = ({ t, n = 26, ground = 1400, s = 1, seed = 0, flakes }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = random(`rx${seed}${i}`) * 1080, sp = 9 + random(`rs${seed}${i}`) * 9, y0 = -200 - random(`ry${seed}${i}`) * 1400;
      const y = Math.min(ground + random(`rg${seed}${i}`) * 300, y0 + t * sp);
      const landed = y >= ground;
      return flakes && !landed
        ? <ellipse key={i} cx={x + Math.sin(t * 0.1 + i) * 20} cy={y} rx={10 * s} ry={6 * s} fill={MEAT} opacity={0.9} transform={`rotate(${t * 4 + i * 40} ${x} ${y})`} />
        : <Meat key={i} x={x + (landed ? 0 : Math.sin(t * 0.08 + i) * 12)} y={y} s={(landed ? 0.5 : 0.42) * s * (0.6 + random(`rz${seed}${i}`) * 0.7)} rot={landed ? i * 37 : t * 5 + i * 40} seed={i + seed} />;
    })}
  </g>
);

// ---------------------------------------------------------------- the farm
const Fence: React.FC<{ y: number; c: string; x0?: number; x1?: number }> = ({ y, c, x0 = -100, x1 = 1180 }) => (
  <g fill={c} stroke={INK} strokeWidth={4}>
    {Array.from({ length: Math.ceil((x1 - x0) / 120) + 1 }, (_, i) => <rect key={i} x={x0 + i * 120} y={y - 130} width={22} height={140} />)}
    <rect x={x0} y={y - 110} width={x1 - x0} height={18} /><rect x={x0} y={y - 60} width={x1 - x0} height={18} />
  </g>
);
const Barn: React.FC<{ x: number; base: number; s?: number; c?: string }> = ({ x, base, s = 1, c = '#9A2A22' }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <path d="M -200 0 L -200 -220 L -140 -330 L 140 -330 L 200 -220 L 200 0 Z" fill={c} stroke={INK} strokeWidth={8} />
    <path d="M -230 -210 L -150 -350 L 150 -350 L 230 -210" stroke={INK} strokeWidth={14} fill="none" />
    <rect x={-70} y={-170} width={140} height={170} fill="#5A1A14" stroke={INK} strokeWidth={6} />
    <path d="M -70 -170 L 70 0 M 70 -170 L -70 0" stroke="#F2EADC" strokeWidth={10} />
    <rect x={-30} y={-290} width={60} height={60} fill="#FFD27A" stroke={INK} strokeWidth={5} />
  </g>
);
const Cabin: React.FC<{ x: number; base: number; s?: number }> = ({ x, base, s = 1 }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}>
    <rect x={-170} y={-170} width={340} height={170} fill="#8A5A32" stroke={INK} strokeWidth={7} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M -170 ${-150 + i * 28} L 170 ${-150 + i * 28}`} stroke="#5A3A20" strokeWidth={5} />)}
    <path d="M -200 -170 L 0 -300 L 200 -170 Z" fill="#4A3A2A" stroke={INK} strokeWidth={7} />
    <rect x={90} y={-310} width={40} height={90} fill="#6A6A6A" stroke={INK} strokeWidth={5} />
    <rect x={-40} y={-120} width={80} height={120} fill="#3A2412" stroke={INK} strokeWidth={5} />
    <rect x={-140} y={-130} width={70} height={60} fill="#FFD27A" stroke={INK} strokeWidth={5} />
  </g>
);
const Tree: React.FC<{ x: number; base: number; s?: number; c: string }> = ({ x, base, s = 1, c }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`}><rect x={-14} y={-160} width={28} height={160} fill="#3A2416" />{[[0, -260, 110], [-70, -200, 80], [70, -200, 80]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={c} />)}</g>
);
/** A Kentucky farm in 1876: big sky (sun, clouds, rays), rolling hills, trees, a barn and a log cabin, a rail fence, grass. */
const Farm: React.FC<{ id: string; mood: Mood; t: number; sunX?: number; sunY?: number; fence?: boolean; buildings?: boolean }> = ({ id, mood, t, sunX = 780, sunY = 380, fence = true, buildings = true }) => {
  const m = MOODS[mood];
  return (
    <g>
      <Sky id={id} mood={mood} sunX={sunX} sunY={sunY} />
      <Clouds mood={mood} t={t} y={460} o={mood === 'noon' ? 0.3 : 0.55} />
      <Rays x={sunX} y={sunY} t={t} o={0.24} n={9} spread={120} dir={90} />
      <path d="M -200 980 Q 200 860 560 940 Q 900 1010 1280 900 L 1280 2000 L -200 2000 Z" fill={m.layers[0]} />
      {[[120, 990, 0.8], [880, 960, 0.7], [980, 1000, 0.5]].map(([tx, tb, ts], i) => <Tree key={i} x={tx} base={tb} s={ts} c={m.layers[1]} />)}
      {buildings ? <g><Barn x={820} base={1120} s={0.9} /><Cabin x={300} base={1130} s={0.95} /></g> : null}
      <path d="M -200 1100 Q 400 1060 1280 1120 L 1280 2000 L -200 2000 Z" fill="#4A7A3A" />
      <path d="M -200 1100 Q 400 1060 1280 1120" stroke={m.rim} strokeWidth={4} opacity={0.4} fill="none" />
      {Array.from({ length: 40 }, (_, i) => <path key={i} d={`M ${random(`gx${i}`) * 1080} ${1140 + random(`gy${i}`) * 500} l -8 -24 m 8 24 l 6 -26 m -6 26 l 14 -18`} stroke="#6AA04A" strokeWidth={4} opacity={0.7} />)}
      {fence ? <Fence y={1230} c="#8A6A44" /> : null}
    </g>
  );
};
/** A woman of 1876 in a long dress and a bonnet, drawn over the shared figure. */
const Woman: React.FC<{ x: number; feet: number; s: number; mood: Mood; t: number; g?: Gest; flip?: boolean }> = ({ x, feet, s, mood, t, g = 'stand', flip }) => {
  const hy = feet - LEG_LEN * s + HEAD.y * s, rim = MOODS[mood].rim;
  return (
    <g>
      <Man x={x} feet={feet} s={s} mood={mood} t={t} g={g} hat="none" flip={flip} />
      <path d={`M ${x - 40 * s} ${hy + 150 * s} L ${x + 40 * s} ${hy + 150 * s} L ${x + 130 * s} ${feet - 8 * s} L ${x - 130 * s} ${feet - 8 * s} Z`} fill="#3A5A8A" stroke={rim} strokeWidth={3} />
      <path d={`M ${x - 46 * s} ${hy + 210 * s} L ${x + 46 * s} ${hy + 210 * s} L ${x + 90 * s} ${feet - 20 * s} L ${x - 90 * s} ${feet - 20 * s} Z`} fill="#F2EADC" opacity={0.85} />
      <path d={`M ${x - 64 * s} ${hy + 20 * s} Q ${x - 74 * s} ${hy - 76 * s} ${x} ${hy - 82 * s} Q ${x + 74 * s} ${hy - 76 * s} ${x + 64 * s} ${hy + 20 * s} Q ${x} ${hy - 40 * s} ${x - 64 * s} ${hy + 20 * s} Z`} fill="#E8D8A8" stroke={INK} strokeWidth={4 * s} />
    </g>
  );
};
const Kettle: React.FC<{ x: number; base: number; s?: number; t: number }> = ({ x, base, s = 1, t }) => {
  const fl = 1 + 0.12 * Math.sin(t * 0.9) + 0.06 * Math.sin(t * 2.2);
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <circle cx={0} cy={-60} r={220 * fl} fill="#FF8A2A" opacity={0.35} filter="url(#gsB24)" style={scr} />
      {Array.from({ length: 5 }, (_, i) => { const h = (70 + (i % 3) * 30) * fl * (1 + 0.2 * Math.sin(t * 0.8 + i)); return <path key={i} d={`M ${-80 + i * 40} 0 Q ${-70 + i * 40} ${-h * 0.6} ${-60 + i * 40} ${-h} Q ${-40 + i * 40} ${-h * 0.6} ${-40 + i * 40} 0 Z`} fill={i % 2 ? '#FFB13A' : '#FF6A1A'} />; })}
      <path d="M -140 -60 L -160 40 M 140 -60 L 160 40" stroke={INK} strokeWidth={10} />
      <path d="M -130 -200 Q -150 -40 0 -30 Q 150 -40 130 -200 Z" fill="#2A2A2E" stroke={INK} strokeWidth={8} />
      <ellipse cx={0} cy={-200} rx={130} ry={26} fill="#E8E0C8" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => { const q = ((t * 0.05 + i / 6) % 1); return <circle key={i} cx={-80 + i * 32} cy={-210 - q * 100} r={8 + q * 14} fill="#F2F0E8" opacity={0.6 * (1 - q)} />; })}
    </g>
  );
};
const Vulture: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean; puke?: number; scared?: boolean }> = ({ x, y, s = 1, t, flip, puke = 0, scared }) => {
  const f = Math.sin(t * (scared ? 1.2 : 0.35) + x * 0.01);
  const wing = (sd: number) => <g transform={`scale(${sd} 1) rotate(${-f * (scared ? 30 : 14)})`}><path d="M 20 -20 Q 160 -120 360 -60 L 330 -40 L 340 -16 L 300 -6 L 300 16 L 240 10 Q 140 20 20 20 Z" fill="#2A2420" stroke={INK} strokeWidth={6} /><path d="M 220 -60 L 360 -60" stroke="#6A5A50" strokeWidth={6} opacity={0.6} /></g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {wing(1)}{wing(-1)}
      <ellipse cx={0} cy={0} rx={70} ry={46} fill="#3A322C" stroke={INK} strokeWidth={6} />
      <path d="M -40 30 L -60 70 L -20 46 L 0 74 L 20 46 L 60 70 L 40 30 Z" fill="#2A2420" stroke={INK} strokeWidth={5} />
      <path d="M 40 -20 Q 70 -60 80 -86" stroke="#D86A6A" strokeWidth={22} strokeLinecap="round" fill="none" />
      <circle cx={84} cy={-96} r={28} fill="#D86A6A" stroke={INK} strokeWidth={5} />
      <path d="M 104 -96 L 140 -84 L 106 -76 Z" fill="#E8D8A8" stroke={INK} strokeWidth={4} />
      <circle cx={88} cy={-104} r={scared ? 9 : 6} fill="#FFF" /><circle cx={90} cy={-104} r={3} fill={INK} />
      {puke > 0 ? <g>{Array.from({ length: 6 }, (_, i) => { const q = ((puke * 3 + i / 6) % 1); return <Meat key={i} x={130 + q * 40 + i * 6} y={-70 + q * 420} s={0.32} rot={q * 300 + i * 50} seed={i + 40} />; })}</g> : null}
    </g>
  );
};
const Lab: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1E1A14" />
    {Array.from({ length: 3 }, (_, r) => <g key={r}><rect x={-100} y={200 + r * 250} width={1300} height={16} fill="#5A3A20" />{Array.from({ length: 12 }, (_, k) => <rect key={k} x={-60 + k * 100} y={200 + r * 250 - 90 + (k % 3) * 12} width={50} height={90 - (k % 3) * 12} rx={8} fill={['#4A6A5A', '#6A5A3A', '#3A4A6A'][(k + r) % 3]} opacity={0.6} />)}</g>)}
    <circle cx={880} cy={260} r={300} fill="#FFC870" opacity={0.3} filter="url(#gsB48)" style={scr} />
    <path d="M -100 1150 L 1180 1150 L 1180 1240 L -100 1240 Z" fill="#5A3A20" stroke={INK} strokeWidth={6} />
    {/* a brass microscope */}
    <g transform="translate(870 1150)"><rect x={-70} y={-20} width={140} height={20} fill="#B8862A" stroke={INK} strokeWidth={5} /><path d="M -10 -20 L -30 -180 L 10 -190 L 30 -20 Z" fill="#B8862A" stroke={INK} strokeWidth={5} /><rect x={-34} y={-260} width={36} height={100} fill="#D8A84A" stroke={INK} strokeWidth={5} transform="rotate(-14 -16 -210)" /></g>
  </g>
);
const Jar: React.FC<{ x: number; base: number; t: number; label: string; c: string }> = ({ x, base, t, label, c }) => (t < 0 ? null :
  <g transform={`translate(${x} ${base}) scale(${popIn(t, 6)})`}>
    <ellipse cx={0} cy={6} rx={110} ry={16} fill="#000" opacity={0.5} filter="url(#gsB6)" />
    <rect x={-90} y={-250} width={180} height={250} rx={24} fill="#DDEEE8" opacity={0.25} stroke="#E8F4F0" strokeWidth={8} />
    <rect x={-80} y={-170} width={160} height={164} rx={18} fill="#C8D8A0" opacity={0.35} />
    <g transform="translate(0 -100) scale(1.1)"><Meat x={0} y={0} s={1} seed={label.length} /></g>
    <rect x={-100} y={-290} width={200} height={44} rx={8} fill="#8A6A40" stroke={INK} strokeWidth={6} />
    <rect x={-80} y={-60} width={160} height={56} rx={6} fill="#F2E8C8" stroke={INK} strokeWidth={4} />
    <text y={-20} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={c ? 34 : 34} fill={c}>{label}</text>
    <path d="M -64 -230 L -64 -80" stroke="#FFF" strokeWidth={12} strokeLinecap="round" opacity={0.5} />
  </g>
);
const Speech: React.FC<{ t: number; x: number; y: number; children: React.ReactNode; flip?: boolean }> = ({ t, x, y, children, flip }) => (t < 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 6)})`}>
    <path d={`M -170 -130 Q -190 -150 -170 -170 L 170 -170 Q 190 -150 170 -130 L 170 90 Q 190 110 170 130 L ${flip ? 60 : -20} 130 L ${flip ? 100 : -80} 210 L ${flip ? 0 : -60} 130 L -170 130 Q -190 110 -170 90 Z`} fill="#FFF8EA" stroke={INK} strokeWidth={8} />
    {children}
  </g>
);
const Sheep: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>{[-50, -20, 20, 50].map((lx) => <rect key={lx} x={lx - 8} y={10} width={16} height={46} fill={INK} />)}<ellipse cx={0} cy={0} rx={90} ry={54} fill="#F2EADC" stroke={INK} strokeWidth={6} />{Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-60 + i * 24} cy={-40 + (i % 2) * 10} r={22} fill="#F2EADC" stroke={INK} strokeWidth={4} />)}<ellipse cx={90} cy={-20} rx={34} ry={28} fill={INK} /><circle cx={98} cy={-26} r={5} fill="#FFF" /></g>
);
const Deer: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>{[-50, -20, 30, 60].map((lx) => <rect key={lx} x={lx - 7} y={10} width={14} height={70} fill="#6A4422" stroke={INK} strokeWidth={3} />)}<ellipse cx={0} cy={0} rx={90} ry={44} fill="#A8743A" stroke={INK} strokeWidth={6} /><path d="M 70 -20 L 100 -90 L 130 -80 L 110 -10 Z" fill="#A8743A" stroke={INK} strokeWidth={6} /><ellipse cx={128} cy={-96} rx={34} ry={24} fill="#A8743A" stroke={INK} strokeWidth={6} /><path d="M 116 -116 l -20 -50 m 10 24 l -24 -10 M 136 -116 l 10 -50 m -4 22 l 20 -14" stroke="#5A3A20" strokeWidth={7} strokeLinecap="round" fill="none" /><circle cx={134} cy={-100} r={5} fill={INK} /></g>
);
const BigX: React.FC<{ t: number; x?: number; y?: number; s?: number }> = ({ t, x = 540, y = 820, s = 1 }) => (t < 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 5) * s})`}><path d="M -240 -240 L 240 240 M 240 -240 L -240 240" stroke="#140A12" strokeWidth={80} strokeLinecap="round" /><path d="M -240 -240 L 240 240 M 240 -240 L -240 240" stroke="#E0283A" strokeWidth={54} strokeLinecap="round" /></g>
);

// ---------------------------------------------------------------- shared bits for the one-of-a-kind shots
const Grass: React.FC<{ y: number; c?: string; n?: number; h?: number }> = ({ y, c = '#4A7A3A', n = 60, h = 1 }) => (
  <g><rect x={-200} y={y} width={W + 400} height={2400} fill={c} />
    {Array.from({ length: n }, (_, i) => <path key={i} d={`M ${random(`gr${y}${i}`) * 1080} ${y + 10 + random(`gq${y}${i}`) * 600} l ${-10 * h} ${-34 * h} m ${10 * h} ${34 * h} l ${8 * h} ${-38 * h} m ${-8 * h} ${38 * h} l ${18 * h} ${-26 * h}`} stroke="#6AA04A" strokeWidth={4 * h} opacity={0.75} />)}</g>
);
const Stars: React.FC<{ t: number; n?: number; h?: number }> = ({ t, n = 70, h = 1100 }) => <g>{Array.from({ length: n }, (_, i) => <circle key={i} cx={random(`ks${i}`) * W} cy={random(`ky${i}`) * h} r={1.5 + random(`kr${i}`) * 2.5} fill="#FFF" opacity={0.3 + 0.6 * Math.abs(Math.sin(t * 0.05 + i))} />)}</g>;
const Clipping: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 860) rotate(${-4 + (1 - popIn(t)) * 30}) scale(${popIn(t) * 1.1})`}>
    <ellipse cx={30} cy={420} rx={380} ry={36} fill="#000" opacity={0.5} filter="url(#gsB12)" />
    <path d="M -340 -430 L 340 -430 L 330 -380 L 344 -320 L 330 -200 L 342 -60 L 332 120 L 344 300 L 336 420 L -330 420 L -342 300 L -332 120 L -344 -60 L -332 -200 L -342 -320 Z" fill="#EFE2C2" stroke={INK} strokeWidth={6} />
    <text x={0} y={-350} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={40} fill="#5A4A30">MARCH 1876</text>
    <path d="M -300 -320 L 300 -320" stroke={INK} strokeWidth={4} />
    <text x={0} y={-230} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={70} fill="#8A1A1A">A SHOWER</text>
    <text x={0} y={-150} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={70} fill="#8A1A1A">OF MEAT!</text>
    <text x={0} y={-90} textAnchor="middle" fontFamily="Georgia, serif" fontSize={34} fill="#3A2A1A">FELL FROM A CLEAR SKY IN KENTUCKY</text>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-290} y={-40 + i * 34} width={580 * (0.75 + 0.25 * random(`cl${i}`))} height={10} fill="#8A7A60" opacity={0.6} />)}
  </g>
);
const Vultures = (t: number, n: number, cx: number, cy: number, r: number, s: number, puke = false) => Array.from({ length: n }, (_, i) => {
  const a = t * 0.025 + (i / n) * Math.PI * 2;
  return <Vulture key={i} x={cx + Math.cos(a) * r} y={cy + Math.sin(a) * r * 0.35} s={s * (0.8 + 0.2 * Math.sin(a))} t={t + i * 9} flip={Math.sin(a) < 0} puke={puke ? (t + i * 7) / 40 : 0} />;
});

// ---------------------------------------------------------------- the hook: from frame 0, meat pours down at the camera
export const S1: S = ({ t }) => (
  <g>
    <defs><radialGradient id="kh1" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#FFD8A0" /><stop offset="1" stopColor="#7A2A22" /></radialGradient></defs>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="url(#kh1)" />
    <Rays x={540} y={760} t={t} o={0.35} n={14} spread={360} dir={0} len={1400} />
    {/* worm's-eye view: chunks rush toward the lens from the sky's centre */}
    {Array.from({ length: 22 }, (_, i) => { const q = ((t * 0.018 + i / 22) % 1), a = i * 2.4; return <Meat key={i} x={540 + Math.cos(a) * q * 900} y={760 + Math.sin(a) * q * 1200} s={0.2 + q * 2.6} rot={a * 60 + t * 3} seed={i} glow={q > 0.6 ? 0.5 : 0} />; })}
    <Punch t={t + 6} lines={['IT RAINED', 'MEAT']} y={290} size={130} color={MEAT} kicker="KENTUCKY, 1876" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Sky id="k2" mood="warm" sunX={300} sunY={420} />
    <Grass y={1180} />
    {/* a fence post in close-up as a chunk slaps onto it */}
    <rect x={380} y={560} width={300} height={1400} fill="#8A6A44" stroke={INK} strokeWidth={10} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${400 + i * 34} 580 L ${410 + i * 30} 1900`} stroke="#5A4228" strokeWidth={5} opacity={0.6} />)}
    <rect x={-200} y={700} width={W + 400} height={70} fill="#7A5A38" stroke={INK} strokeWidth={8} />
    <Meat x={530} y={Math.min(700, -300 + t * 60)} s={2.6} rot={t < 17 ? t * 8 : 140} seed={11} />
    {t > 17 ? Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, d = 120 + (t - 17) * 10; return <circle key={i} cx={530 + Math.cos(a) * d} cy={700 + Math.sin(a) * d * 0.5} r={14 - Math.min(10, (t - 17) * 0.6)} fill={MEAT} />; }) : null}
    <Sfx t={t - 17} text="SPLAT!" x={540} y={460} rot={-8} size={130} />
  </g>
);
export const S3: S = ({ t, f }) => (
  <g>
    <Sky id="k3" mood="cold" sunX={-300} sunY={-300} />
    <Clouds mood="cold" t={t} y={380} o={0.8} />
    <g transform={`translate(330 ${560 + t * 4}) rotate(${t * 3}) scale(${popIn(since(f, 'cats') + 3) * 1.5})`}><ellipse rx={90} ry={60} fill="#F2A040" stroke={INK} strokeWidth={6} /><circle cx={80} cy={-40} r={44} fill="#F2A040" stroke={INK} strokeWidth={6} /><path d="M 56 -78 L 64 -110 L 84 -82 M 96 -82 L 116 -108 L 120 -74" fill="#F2A040" stroke={INK} strokeWidth={6} /><circle cx={92} cy={-44} r={6} fill={INK} /></g>
    <g transform={`translate(760 ${780 + t * 4}) rotate(${-t * 3}) scale(${popIn(since(f, 'dogs') + 3) * 1.5})`}><ellipse rx={100} ry={60} fill="#A8743A" stroke={INK} strokeWidth={6} /><circle cx={-90} cy={-40} r={50} fill="#A8743A" stroke={INK} strokeWidth={6} /><ellipse cx={-120} cy={-20} rx={22} ry={44} fill="#6A4422" stroke={INK} strokeWidth={5} /><circle cx={-100} cy={-48} r={6} fill={INK} /></g>
    <BigX t={since(f, 'dogs') + 6} y={760} s={0.85} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1A0E0C" />
    <circle cx={540} cy={900} r={520} fill={MEAT} opacity={0.35} filter="url(#gsB48)" style={scr} />
    <Rays x={540} y={-100} t={t} o={0.35} n={5} spread={30} dir={90} len={1600} />
    <ellipse cx={540} cy={1150} rx={330} ry={50} fill="#000" opacity={0.6} filter="url(#gsB12)" />
    <Meat x={540} y={980} s={4.4 * popIn(t - 1)} rot={-8} seed={3} glow={0.8} />
    <Punch t={t - 2} lines={['ACTUAL', 'MEAT']} y={290} size={124} color={MEAT} />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1E14" />
    <Rays x={540} y={-100} t={t} o={0.3} n={6} spread={50} dir={90} />
    <Clipping t={t - 1} />
    <Burst t={t - 8} text="NOT KIDDING!" x={760} y={380} size={64} color="#FFD23F" />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1C2440" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-100 + i * 50} -200 L ${-100 + i * 50} 2200`} stroke="#2A3A60" strokeWidth={2} />)}
    {/* a map of Kentucky, a red storm cloud over Bath County */}
    <g transform={`translate(540 900) scale(${popIn(t - 1)}) rotate(-3)`}>
      <path d="M -420 -40 L -300 -120 L -120 -100 L 40 -170 L 200 -150 L 330 -220 L 420 -160 L 400 -40 L 300 40 L 160 60 L -60 80 L -260 90 L -420 60 Z" fill="#7AA05A" stroke="#F2EADC" strokeWidth={8} />
      <circle cx={250} cy={-120} r={18} fill={MEAT} stroke="#FFF" strokeWidth={5} />
      <g transform={`translate(250 ${-300 + Math.sin(t * 0.1) * 8})`}>{[[-60, 0, 60], [0, -20, 76], [60, 0, 60]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={MEAT} stroke={INK} strokeWidth={5} />)}</g>
      {Array.from({ length: 6 }, (_, i) => { const q = ((t * 0.05 + i / 6) % 1); return <Meat key={i} x={200 + i * 20} y={-240 + q * 120} s={0.22} rot={i * 50} seed={i} />; })}
      <text x={-260} y={40} fontFamily={FONT.title} fontWeight={800} fontSize={48} fill="#F2EADC">KENTUCKY</text>
    </g>
    <Punch t={t - 2} lines={['THE KENTUCKY', 'MEAT SHOWER']} y={290} size={100} color={MEAT} />
  </g>
);
// ---------------------------------------------------------------- the setup
export const S7: S = ({ t }) => (
  <g>
    {/* inside the cabin: log wall, a window, the calendar */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#5A3A20" />
    {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-200} y={-100 + i * 100} width={W + 400} height={86} rx={40} fill="#7A5230" stroke="#3A2412" strokeWidth={6} />)}
    <rect x={640} y={300} width={360} height={380} fill="#BFE0FF" stroke="#3A2412" strokeWidth={22} /><path d="M 820 300 L 820 680 M 640 490 L 1000 490" stroke="#3A2412" strokeWidth={14} />
    <path d="M 640 300 L 1000 300 L 1100 1700 L 560 1700 Z" fill="url(#gsRay)" opacity={0.3} filter="url(#gsB16)" style={scr} />
    <Calendar t={t - 1} day="3" month="MARCH" year="1876" x={340} y={760} />
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Farm id="k8" mood="noon" t={t} sunX={300} />
    <Punch t={t - 2} lines={['BATH COUNTY']} y={300} size={116} color="#FFD23F" kicker="A FARM IN" />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    {/* an old oval portrait of Mrs. Crouch */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#3A2A20" />
    <Glow x={540} y={820} r={600} kind="warm" o={0.4} />
    <g transform={`translate(540 860) scale(${popIn(t - 1)})`}>
      <ellipse rx={330} ry={430} fill="#8A6A2A" stroke={INK} strokeWidth={10} />
      <ellipse rx={290} ry={390} fill="#D8C8A0" />
      <ellipse rx={290} ry={390} fill="#8A6A40" opacity={0.25} />
      <path d="M -260 300 Q -200 120 0 110 Q 200 120 260 300 L 260 390 L -260 390 Z" fill="#3A5A8A" />
      <ellipse cx={0} cy={-60} rx={110} ry={140} fill="#E8C8A0" stroke={INK} strokeWidth={6} />
      <path d="M -150 -40 Q -160 -230 0 -240 Q 160 -230 150 -40 Q 120 -180 0 -190 Q -120 -180 -150 -40 Z" fill="#E8D8A8" stroke={INK} strokeWidth={6} />
      <circle cx={-40} cy={-70} r={10} fill={INK} /><circle cx={40} cy={-70} r={10} fill={INK} /><path d="M -30 20 Q 0 36 30 20" stroke={INK} strokeWidth={6} fill="none" />
      <path d="M -60 90 L 60 90 L 40 130 L -40 130 Z" fill="#F2EADC" />
    </g>
    <Punch t={t - 2} lines={['MRS. CROUCH']} y={280} size={110} color="#FFD23F" kicker="A WOMAN NAMED" />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Sky id="k10" mood="warm" sunX={820} sunY={420} />
    <Grass y={1240} c="#5A7A3A" />
    <Kettle x={600} base={1440} s={1.6} t={t} />
    <Woman x={260} feet={1440} s={1.4} mood="warm" t={t} g="point" flip />
    <Punch t={t - 2} lines={['MAKING SOAP']} y={300} size={112} color="#FFD23F" kicker="OUTSIDE" />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Sky id="k11" mood="noon" sunX={540} sunY={700} />
    <Rays x={540} y={700} t={t} o={0.3} n={12} spread={360} dir={0} len={1200} />
    <Punch t={t - 2} lines={['TOTALLY', 'CLEAR SKY']} y={290} size={110} color={SKYB} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Sky id="k12" mood="noon" sunX={760} sunY={360} />
    <MeatRain t={t} n={50} ground={2400} s={0.8} flakes />
    {/* over her shoulder: she looks up */}
    <Woman x={300} feet={2050} s={2.6} mood="noon" t={t} g="shock" />
    <Punch t={t - 2} lines={['FLAKES', 'FALLING']} y={300} size={110} color="#FFFFFF" />
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <Sky id="k13" mood="cold" sunX={-300} sunY={-300} />
    {Array.from({ length: 34 }, (_, i) => { const x = random(`sx${i}`) * 1080, y = (random(`sy${i}`) * 1500 + t * 6) % 1500; return <g key={i} transform={`translate(${x} ${y}) rotate(${t * 2 + i * 30})`}>{[0, 60, 120].map((a) => <path key={a} d="M -24 0 L 24 0" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />)}</g>; })}
    <Punch t={t - 2} lines={['LIKE SNOW...']} y={300} size={110} color="#FFFFFF" />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    {/* one red flake lands on her open palm */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#6A8AA8" />
    <Glow x={540} y={900} r={700} kind="red" o={0.4} />
    <g transform="translate(540 1050) rotate(-8)"><path d="M -260 260 L -260 -40 Q -260 -90 -210 -90 L 220 -90 Q 270 -90 270 -40 L 270 60 Q 270 110 220 110 L 60 110 L 60 260 Z" fill="#E8B88A" stroke={INK} strokeWidth={10} /><path d="M -180 -90 L -180 -200 M -80 -90 L -80 -240 M 20 -90 L 20 -230 M 120 -90 L 120 -190" stroke="#E8B88A" strokeWidth={70} strokeLinecap="round" /><path d="M -180 -90 L -180 -200 M -80 -90 L -80 -240 M 20 -90 L 20 -230 M 120 -90 L 120 -190" stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.3} /></g>
    <Meat x={540} y={Math.min(960, 300 + t * 40)} s={1.2} rot={t * 6} seed={13} glow={0.6} />
    <Burst t={t - 2} text="BUT RED!" x={540} y={460} size={110} color={MEAT} />
  </g>
);
// ---------------------------------------------------------------- the meat
export const S15: S = ({ t }) => (
  <g>
    {/* the cabin roof in close-up, chunks bouncing off the shingles */}
    <Sky id="k15" mood="warm" sunX={850} sunY={380} />
    <path d="M -200 1400 L 540 700 L 1280 1400 L 1280 2400 L -200 2400 Z" fill="#4A3A2A" stroke={INK} strokeWidth={10} />
    {Array.from({ length: 12 }, (_, r) => <path key={r} d={`M ${540 - (r + 1) * 70} ${700 + (r + 1) * 66} L ${540 + (r + 1) * 70} ${700 + (r + 1) * 66}`} stroke="#2A2014" strokeWidth={6} />)}
    <rect x={760} y={600} width={90} height={260} fill="#6A6A6A" stroke={INK} strokeWidth={8} />
    <MeatRain t={t + 20} n={30} ground={1100} s={1.6} seed={4} />
    <Punch t={t - 2} lines={['CHUNKS OF', 'MEAT']} y={300} size={116} color={MEAT} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#4A7A3A" />
    <Glow x={540} y={900} r={700} kind="warm" o={0.4} />
    <ellipse cx={540} cy={1060} rx={420} ry={60} fill="#000" opacity={0.35} filter="url(#gsB12)" />
    <Meat x={380} y={900} s={2.4} rot={-10} seed={7} glow={0.5} />
    <g transform="translate(740 900) rotate(-10)"><path d="M -110 120 L -110 -40 Q -110 -70 -84 -70 L -84 -170 Q -84 -196 -62 -196 Q -40 -196 -40 -170 L -40 -80 L -36 -200 Q -36 -226 -12 -226 Q 12 -226 12 -200 L 12 -84 L 18 -190 Q 18 -214 40 -214 Q 62 -214 62 -190 L 62 -70 L 66 -150 Q 66 -172 86 -172 Q 106 -172 106 -150 L 106 40 Q 106 120 40 140 L -60 140 Q -110 140 -110 120 Z" fill="#E8B88A" stroke={INK} strokeWidth={8} /></g>
    <Punch t={t - 2} lines={['BIG AS', 'YOUR PALM']} y={300} size={110} color="#FFD23F" />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    {/* the yard at chicken height: hens scatter as chunks hit */}
    <Sky id="k17" mood="warm" sunX={200} sunY={500} />
    <Fence y={1080} c="#8A6A44" />
    <Grass y={1080} c="#6A8A3A" h={1.6} />
    {[[200, 1180, 1.6], [560, 1150, 1.4], [880, 1200, 1.7]].map(([mx, my, ms], i) => <Meat key={i} x={mx} y={Math.min(my, -200 + (t - i * 5) * 40)} s={ms} rot={i * 50} seed={i + 9} />)}
    {[[360, 1400], [720, 1450]].map(([cx, cy], i) => <g key={i} transform={`translate(${cx + (i ? 1 : -1) * t * 6} ${cy - Math.abs(Math.sin(t * 0.5 + i)) * 40}) scale(${i ? -1.3 : 1.3} 1.3)`}><ellipse rx={70} ry={50} fill="#F2EADC" stroke={INK} strokeWidth={6} /><circle cx={60} cy={-50} r={30} fill="#F2EADC" stroke={INK} strokeWidth={6} /><path d="M 86 -50 L 110 -42 L 86 -36 Z" fill="#FFB13A" stroke={INK} strokeWidth={4} /><path d="M 52 -82 q 8 -18 18 0" fill="#D8262E" /><path d="M -60 -10 L -120 -60 L -90 0 Z" fill="#F2EADC" stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(t) * 20} -60 -10)`} /></g>)}
    <Sfx t={t - 30} text="PLOP! PLOP!" x={540} y={680} rot={-8} size={120} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#3A6A2E" />
    {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M ${random(`ax${i}`) * 1080} ${random(`ay${i}`) * 1800} l -8 -24 m 8 24 l 6 -26`} stroke="#5A9A3A" strokeWidth={4} />)}
    <Glow x={540} y={860} r={700} kind="warm" o={0.3} />
    <rect x={220} y={500} width={640 * easeOut(clamp((t - 2) / 20))} height={720} fill={MEAT} opacity={0.18} />
    {Array.from({ length: 40 }, (_, i) => (random(`bx${i}`) * 640 < 640 * easeOut(clamp((t - 2) / 20)) ? <Meat key={i} x={220 + random(`bx${i}`) * 640} y={520 + random(`by${i}`) * 680} s={0.35} rot={i * 40} seed={i} /> : null))}
    <path d="M 220 1260 L 860 1260" stroke="#FFF" strokeWidth={6} /><path d="M 220 1240 L 220 1280 M 860 1240 L 860 1280" stroke="#FFF" strokeWidth={6} />
    <Punch t={t - 6} lines={['100 YARDS']} y={290} size={120} color="#FFD23F" kicker="A STRIP OF MEAT" />
  </g>
);
export const S39: S = ({ t }) => (
  <g>
    {/* ground level across the field: meat to the horizon */}
    <Sky id="k39" mood="danger" sunX={540} sunY={900} />
    <rect x={-200} y={960} width={W + 400} height={1400} fill="#4A6A2A" />
    {Array.from({ length: 46 }, (_, i) => { const d = random(`fd${i}`), y = 980 + d * d * 900; return <Meat key={i} x={random(`fx${i}`) * 1180 - 50} y={y} s={0.15 + d * 1.6} rot={i * 33} seed={i} />; })}
    <Punch t={t - 2} lines={['COVERED', 'IN MEAT']} y={290} size={116} color={MEAT} />
  </g>
);
// ---------------------------------------------------------------- the taste test
export const S19: S = ({ t }) => (
  <g>
    {/* two neighbours walking up the dirt road */}
    <Sky id="k19" mood="warm" sunX={540} sunY={520} />
    <path d="M -200 1000 Q 540 940 1280 1000 L 1280 2400 L -200 2400 Z" fill="#5A7A3A" />
    <path d="M 480 1000 L 600 1000 L 1000 2000 L 80 2000 Z" fill="#B8945A" />
    <Man x={lerp(420, 440, t / 60)} feet={1480 - t * 1.5} s={1.1} mood="warm" t={t} g="run" hat="bowler" />
    <Man x={lerp(660, 640, t / 60)} feet={1520 - t * 1.5} s={1.15} mood="warm" t={t + 9} g="run" hat="cap" />
    <Punch t={t - 2} lines={['TWO LOCAL', 'GUYS']} y={300} size={110} color="#FFD23F" />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#3A2A1A" />
    <Glow x={540} y={800} r={700} kind="warm" o={0.5} />
    <Man x={540} feet={1750} s={2.2} mood="warm" t={t} g="stand" hat="bowler" />
    <Meat x={700} y={900} s={0.9} rot={-20} seed={5} />
    <Sfx t={t - 4} text="CHOMP!" x={560} y={560} rot={-8} size={130} />
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    {/* guy one, close, thinking of a sheep */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#6A8A5A" />
    <Glow x={300} y={700} r={700} kind="warm" o={0.4} />
    <Man x={330} feet={1800} s={2.4} mood="warm" t={t} g="stand" hat="bowler" />
    {[[560, 900, 20], [610, 820, 30]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r * popIn(t - 2 - i * 2)} fill="#FFF8EA" stroke={INK} strokeWidth={6} />)}
    <g transform={`translate(780 600) scale(${popIn(t - 6)})`}>{[[-120, 0, 120], [0, -50, 140], [120, 0, 120], [0, 60, 130]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#FFF8EA" stroke={INK} strokeWidth={8} />)}{[[-120, 0, 112], [0, -50, 132], [120, 0, 112], [0, 60, 122]].map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill="#FFF8EA" />)}<g transform="translate(-20 -10)"><Sheep s={1.1} /></g></g>
    <Punch t={t - 2} lines={['MUTTON!']} y={300} size={120} color="#FFD23F" />
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    {/* the deer itself, in the woods, looking worried */}
    <Sky id="k22" mood="cold" sunX={800} sunY={360} />
    {Array.from({ length: 9 }, (_, i) => <Tree key={i} x={i * 140 - 40} base={1250 + (i % 2) * 40} s={1.2 + (i % 3) * 0.3} c={['#2A4A3A', '#3A5A44', '#24402E'][i % 3]} />)}
    <Grass y={1250} c="#3A5A2E" />
    <g transform="translate(560 1260)"><Deer s={2.4} /></g>
    <Sfx t={t - 4} text="ME?!" x={760} y={760} rot={8} size={110} />
    <Punch t={t - 2} lines={['DEER!']} y={300} size={124} color="#FFD23F" kicker="THE OTHER GUY SAID" />
  </g>
);
// ---------------------------------------------------------------- the lab
export const S23: S = ({ t }) => (
  <g>
    <Lab t={t} />
    <Man x={560} feet={1500} s={1.3} mood="warm" t={t} g="point" hat="none" />
    <Punch t={t - 2} lines={['SCIENTISTS']} y={300} size={120} color="#9FE3FF" kicker="SAMPLES WENT TO" />
  </g>
);
export const S24: S = ({ t, f }) => (
  <g>
    {/* the jars on a lit tabletop, landing one per word */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#0E1418" />
    <ellipse cx={540} cy={1100} rx={620} ry={120} fill="#9FE3FF" opacity={0.18} filter="url(#gsB24)" style={scr} />
    <Rays x={540} y={-100} t={t} o={0.3} n={5} spread={40} dir={90} len={1500} />
    <rect x={-200} y={1100} width={W + 400} height={900} fill="#2A2018" />
    <g transform="translate(540 1100) scale(1.2) translate(-540 -1100)">
      <Jar x={300} base={1100} t={since(f, 'lung') + 2} label="LUNG" c="#8A1A1A" />
      <Jar x={540} base={1100} t={since(f, 'muscle') + 2} label="MUSCLE" c="#8A1A1A" />
      <Jar x={780} base={1100} t={since(f, 'cartilage') + 2} label="CARTILAGE" c="#8A1A1A" />
    </g>
  </g>
);
// ---------------------------------------------------------------- where from?
export const S25: S = ({ t }) => (
  <g>
    {/* a question mark written in the clouds */}
    <Sky id="k25" mood="cold" sunX={-300} sunY={-300} />
    <g transform={`translate(540 760) scale(${popIn(t - 1)})`} filter="url(#gsB3)">
      <path d="M -150 -120 Q -150 -300 0 -300 Q 160 -300 160 -150 Q 160 -40 40 0 L 40 120" stroke="#F2F4FF" strokeWidth={90} fill="none" strokeLinecap="round" />
      <circle cx={40} cy={260} r={56} fill="#F2F4FF" />
    </g>
    <Punch t={t - 2} lines={['WHERE FROM?']} y={290} size={110} color="#9FE3FF" />
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Sky id="k26" mood="danger" sunX={-300} sunY={-300} />
    <g transform={`translate(540 ${700 + Math.sin(t * 0.1) * 12}) scale(${popIn(t - 1)})`}>
      {[[-180, 20, 140], [0, -60, 180], [170, 10, 140], [-90, 90, 130], [100, 100, 130]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={MEAT} stroke={INK} strokeWidth={6} />)}
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${-200 + i * 44} ${-20 + (i % 3) * 50} q 20 -14 40 0`} stroke={FAT} strokeWidth={9} fill="none" strokeLinecap="round" />)}
    </g>
    {Array.from({ length: 14 }, (_, i) => { const q = ((t * 0.04 + i / 14) % 1); return <Meat key={i} x={360 + (i * 37) % 380} y={900 + q * 600} s={0.4} rot={q * 300} seed={i} />; })}
    <Punch t={t - 2} lines={['A MEAT', 'CLOUD?']} y={290} size={110} color={MEAT} />
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#120608" />
    <Glow x={540} y={860} r={700} kind="red" o={0.6} />
    <BigX t={t} y={860} s={1.4} />
    <Punch t={t} lines={['WRONG.']} y={300} size={150} color="#FF3A3A" />
  </g>
);
// ---------------------------------------------------------------- the vultures
export const S28: S = ({ t }) => (
  <g>
    {/* the flock circling high, against the sun */}
    <Sky id="k28" mood="warm" sunX={540} sunY={760} />
    <Rays x={540} y={760} t={t} o={0.35} n={12} spread={360} dir={0} len={1300} />
    {Vultures(t, 6, 540, 760, 360, 0.55)}
    <Punch t={t - 2} lines={['VULTURES']} y={300} size={124} color="#FFD23F" kicker="THE BEST GUESS" />
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    {/* one perched on a dead branch, startled */}
    <Sky id="k29" mood="cold" sunX={200} sunY={420} />
    <path d="M 1300 1500 Q 900 1300 700 1180 L 540 1120 L 380 1160 M 700 1180 L 760 1000" stroke="#2A2018" strokeWidth={40} fill="none" strokeLinecap="round" />
    <Vulture x={560} y={1020 - Math.max(0, t - 6) * 6} s={1.4} t={t} scared={t > 6} />
    <Sfx t={t - 6} text="!!!" x={760} y={620} rot={8} size={150} />
    <Punch t={t - 2} lines={['SPOOKED']} y={300} size={124} color="#9FE3FF" kicker="WHEN VULTURES GET" />
  </g>
);
export const S30: S = ({ t }) => (
  <g>
    <Sky id="k30" mood="warm" sunX={760} sunY={360} />
    <Clouds mood="warm" t={t} y={520} o={0.5} />
    <Vulture x={460} y={760} s={1.5} t={t} scared puke={t / 40} />
    <Sfx t={t - 4} text="BLEHH!" x={560} y={420} rot={8} size={120} />
  </g>
);
export const S31: S = ({ t }) => (
  <g>
    <Sky id="k31" mood="noon" sunX={760} sunY={360} />
    <Clouds mood="noon" t={t * 3} y={520} o={0.5} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${-100 + ((t * 30 + i * 180) % 1300)} ${500 + i * 90} l 220 0`} stroke="#FFF" strokeWidth={6} opacity={0.5} strokeLinecap="round" />)}
    <Vulture x={lerp(300, 820, easeOut(clamp(t / 40)))} y={lerp(900, 640, easeOut(clamp(t / 40)))} s={1.2} t={t * 2} scared />
    <Punch t={t - 2} lines={['LIGHTER =', 'FASTER']} y={300} size={110} color="#FFD23F" />
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    {/* the diagram: a flock over one farm, with what fell */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#EAD9B0" />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M ${-100 + i * 60} -200 L ${-100 + i * 60} 2200`} stroke="#D8C498" strokeWidth={2} />)}
    <rect x={260} y={980} width={560} height={300} fill="#9AC07A" stroke={INK} strokeWidth={8} />
    <text x={540} y={1250} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={40} fill={INK}>ONE FARM</text>
    {Array.from({ length: 7 }, (_, i) => { const x = 300 + i * 80; return <g key={i}><path d={`M ${x - 30} ${560 + (i % 2) * 40} q 30 -24 60 0`} stroke={INK} strokeWidth={8} fill="none" />{Array.from({ length: 3 }, (_, k) => { const q = ((t * 0.05 + k / 3 + i * 0.1) % 1); return <circle key={k} cx={x} cy={600 + q * 380} r={9} fill={MEAT} />; })}</g>; })}
    <Punch t={t - 2} lines={['A BUNCH', 'OF BIRDS']} y={290} size={106} color={INK} />
  </g>
);
export const S33: S = ({ t }) => (
  <g>
    {/* bird's-eye: a wing in front, the farm far below */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#5A8A4A" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-200 + i * 180} y={-200} width={170} height={2400} fill={i % 2 ? '#6A9A4A' : '#7AA85A'} opacity={0.5} />)}
    <g transform="translate(560 1050) scale(0.5)"><rect x={-200} y={-160} width={400} height={320} fill="#9A2A22" stroke={INK} strokeWidth={10} /><path d="M -200 0 L 200 0" stroke="#5A1A14" strokeWidth={14} /></g>
    <g transform="translate(300 1150) scale(0.4)"><rect x={-170} y={-120} width={340} height={240} fill="#4A3A2A" stroke={INK} strokeWidth={10} /></g>
    {Array.from({ length: 18 }, (_, i) => { const q = ((t * 0.03 + i / 18) % 1); return <Meat key={i} x={300 + (i * 53) % 520} y={500 + q * 700} s={0.5 - q * 0.3} rot={q * 400} seed={i} />; })}
    <g transform={`translate(-80 300) rotate(${-10 + Math.sin(t * 0.3) * 6})`}><path d="M 0 0 Q 400 -120 900 40 L 860 80 L 880 120 L 820 140 L 830 190 L 740 170 Q 400 140 0 120 Z" fill="#2A2420" stroke={INK} strokeWidth={10} /></g>
    <Burst t={t - 2} text="LOST THEIR LUNCH" x={560} y={760} size={70} color="#9BE04A" />
  </g>
);
// ---------------------------------------------------------------- the callback
export const S34: S = ({ t }) => (
  <g>
    <Sky id="k34" mood="noon" sunX={760} sunY={360} />
    <Clouds mood="noon" t={t} y={520} o={0.3} />
    <Rays x={760} y={360} t={t} o={0.25} n={9} spread={120} dir={90} />
    <path d="M -200 1250 Q 540 1200 1280 1250 L 1280 2000 L -200 2000 Z" fill="#4A7A3A" />
    <Man x={540} feet={1560} s={1.6} mood="noon" t={t} g="stand" hat="cap" />
    <Punch t={t - 2} lines={['CLEAR', 'BLUE SKY?']} y={300} size={110} color={SKYB} />
  </g>
);
export const S35: S = ({ t }) => (
  <g>
    {/* a face, close, lips pressed shut as a chunk bounces off */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#8AB8E0" />
    <circle cx={540} cy={820} r={420} fill="#E8B88A" stroke={INK} strokeWidth={12} />
    <ellipse cx={400} cy={740} rx={40} ry={56} fill="#FFF" stroke={INK} strokeWidth={6} /><ellipse cx={680} cy={740} rx={40} ry={56} fill="#FFF" stroke={INK} strokeWidth={6} />
    <circle cx={400} cy={710} r={20} fill={INK} /><circle cx={680} cy={710} r={20} fill={INK} />
    <path d="M 420 980 Q 540 960 660 980" stroke={INK} strokeWidth={16} strokeLinecap="round" fill="none" />
    <Meat x={540 + Math.max(0, t - 14) * 14} y={t < 14 ? 140 + t * 60 : 960 - Math.sin(clamp((t - 14) / 20) * Math.PI) * 300} s={1} rot={t * 10} seed={17} />
    <Punch t={t - 2} lines={['KEEP YOUR', 'MOUTH SHUT']} y={210} size={96} color="#FFD23F" />
  </g>
);
export const S36: S = ({ t }) => (
  <g>
    {/* sunset: vultures sit along the fence */}
    <Sky id="k36" mood="danger" sunX={540} sunY={900} />
    <Rays x={540} y={900} t={t} o={0.35} n={12} spread={360} dir={0} len={1300} />
    <rect x={-200} y={1200} width={W + 400} height={1000} fill="#1A0E0C" />
    <Fence y={1200} c="#1A0E0C" />
    {[150, 420, 700, 950].map((vx, i) => <g key={vx} transform={`translate(${vx} 1060) scale(${i % 2 ? -0.7 : 0.7} 0.7)`}><ellipse cx={0} cy={0} rx={60} ry={70} fill="#120A08" /><path d="M 20 -50 Q 40 -100 60 -110" stroke="#120A08" strokeWidth={20} strokeLinecap="round" /><circle cx={64} cy={-116} r={22} fill="#120A08" /></g>)}
    <Punch t={t - 2} lines={["THAT'S REAL."]} y={300} size={120} color="#FFD23F" />
  </g>
);
export const S37: S = ({ t }) => (
  <g>
    {/* the barn at night, a lantern on a hook */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#140C10" />
    <Stars t={t} h={600} />
    <Barn x={540} base={1300} s={2.0} c="#5A1A18" />
    <Lamp x={880} base={1720} s={1.1} t={t} />
    <Punch t={t - 3} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={300} size={80} color="#C9A2FF" />
  </g>
);
export const S38: S = ({ t }) => (
  <g>
    {/* "See ya!": one vulture flies across the full moon */}
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#0A0A1C" />
    <Stars t={t} h={1900} n={90} />
    <circle cx={540} cy={820} r={520} fill="#CFE0FF" opacity={0.25} filter="url(#gsB48)" style={scr} />
    <circle cx={540} cy={820} r={340} fill="#E8EEFF" />
    <Vulture x={lerp(-200, 1300, clamp(t / 100))} y={820 + Math.sin(t * 0.05) * 30} s={1.0} t={t} />
  </g>
);
