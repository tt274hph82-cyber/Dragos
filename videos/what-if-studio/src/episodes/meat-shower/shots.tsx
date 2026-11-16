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

// ---------------------------------------------------------------- the hook: "it rained meat"
export const S1: S = ({ t }) => (
  <g>
    <Farm id="k1" mood="noon" t={t} />
    <Punch t={t - 2} lines={['KENTUCKY,', '1876']} y={300} size={116} color="#FFD23F" kicker="A TRUE STORY" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Farm id="k2" mood="warm" t={t} />
    <MeatRain t={t + 40} n={30} ground={1300} />
    <Punch t={t - 2} lines={['IT RAINED', 'MEAT']} y={300} size={120} color={MEAT} />
  </g>
);
export const S3: S = ({ t, f }) => (
  <g>
    <Sky id="k3" mood="cold" sunX={-300} sunY={-300} />
    <Clouds mood="cold" t={t} y={380} o={0.8} />
    {/* "not cats and dogs": a cat and a dog falling, crossed out */}
    <g transform={`translate(330 ${560 + t * 4}) rotate(${t * 3}) scale(${popIn(since(f, 'cats') + 3) * 1.5})`}><ellipse rx={90} ry={60} fill="#F2A040" stroke={INK} strokeWidth={6} /><circle cx={80} cy={-40} r={44} fill="#F2A040" stroke={INK} strokeWidth={6} /><path d="M 56 -78 L 64 -110 L 84 -82 M 96 -82 L 116 -108 L 120 -74" fill="#F2A040" stroke={INK} strokeWidth={6} /><circle cx={92} cy={-44} r={6} fill={INK} /></g>
    <g transform={`translate(760 ${780 + t * 4}) rotate(${-t * 3}) scale(${popIn(since(f, 'dogs') + 3) * 1.5})`}><ellipse rx={100} ry={60} fill="#A8743A" stroke={INK} strokeWidth={6} /><circle cx={-90} cy={-40} r={50} fill="#A8743A" stroke={INK} strokeWidth={6} /><ellipse cx={-120} cy={-20} rx={22} ry={44} fill="#6A4422" stroke={INK} strokeWidth={5} /><circle cx={-100} cy={-48} r={6} fill={INK} /></g>
    <BigX t={since(f, 'dogs') + 6} y={760} s={0.85} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Sky id="k4" mood="noon" sunX={760} sunY={300} />
    <path d="M -200 1000 Q 540 940 1280 1000 L 1280 2000 L -200 2000 Z" fill="#4A7A3A" />
    <ellipse cx={540} cy={1140} rx={300} ry={50} fill="#000" opacity={0.4} filter="url(#gsB12)" />
    <Meat x={540} y={1000} s={4.2 * popIn(t - 1)} rot={-8} seed={3} glow={0.8} />
    <Punch t={t - 2} lines={['ACTUAL', 'MEAT']} y={290} size={124} color={MEAT} />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Farm id="k5" mood="noon" t={t} />
    <Burst t={t - 2} text="NOT KIDDING!" x={540} y={620} size={88} color="#FFD23F" />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Farm id="k6" mood="danger" t={t} />
    <MeatRain t={t + 60} n={34} ground={1300} />
    <Punch t={t - 2} lines={['THE KENTUCKY', 'MEAT SHOWER']} y={290} size={100} color={MEAT} />
  </g>
);
// ---------------------------------------------------------------- the setup
export const S7: S = ({ t }) => (
  <g>
    <Farm id="k7" mood="noon" t={t} />
    <Calendar t={t - 1} day="3" month="MARCH" year="1876" x={540} y={740} />
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
    <Farm id="k9" mood="warm" t={t} buildings={false} />
    <Cabin x={300} base={1130} s={0.95} />
    <Woman x={600} feet={1430} s={1.4} mood="warm" t={t} g="stand" />
    <Punch t={t - 2} lines={['MRS. CROUCH']} y={300} size={112} color="#FFD23F" kicker="A WOMAN NAMED" />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Farm id="k10" mood="warm" t={t} buildings={false} fence={false} />
    <Kettle x={740} base={1400} s={1.3} t={t} />
    <Woman x={300} feet={1430} s={1.4} mood="warm" t={t} g="point" flip />
    <Punch t={t - 2} lines={['MAKING SOAP']} y={300} size={112} color="#FFD23F" />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Sky id="k11" mood="noon" sunX={540} sunY={700} />
    <Rays x={540} y={700} t={t} o={0.3} n={12} spread={360} dir={0} len={1200} />
    <path d="M -200 1250 Q 540 1200 1280 1250 L 1280 2000 L -200 2000 Z" fill="#4A7A3A" />
    <Punch t={t - 2} lines={['TOTALLY', 'CLEAR SKY']} y={290} size={110} color={SKYB} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Sky id="k12" mood="noon" sunX={760} sunY={360} />
    <MeatRain t={t} n={50} ground={1400} s={0.8} flakes />
    <path d="M -200 1250 Q 540 1200 1280 1250 L 1280 2000 L -200 2000 Z" fill="#4A7A3A" />
    <Punch t={t - 2} lines={['FLAKES', 'FALLING']} y={300} size={110} color="#FFFFFF" />
  </g>
);
export const S13: S = ({ t, f }) => (
  <g>
    <Sky id="k13" mood="cold" sunX={-300} sunY={-300} />
    {Array.from({ length: 34 }, (_, i) => { const x = random(`sx${i}`) * 1080, y = (random(`sy${i}`) * 1500 + t * 6) % 1500; const red = since(f, 'red') > 0; return <g key={i} transform={`translate(${x} ${y}) rotate(${t * 2 + i * 30})`}>{[0, 60, 120].map((a) => <path key={a} d="M -24 0 L 24 0" stroke={red ? MEAT : '#FFFFFF'} strokeWidth={7} strokeLinecap="round" transform={`rotate(${a})`} />)}</g>; })}
    <Punch t={t - 2} lines={['LIKE SNOW...']} y={300} size={110} color="#FFFFFF" />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <Sky id="k14" mood="danger" sunX={-300} sunY={-300} />
    {Array.from({ length: 34 }, (_, i) => { const x = random(`sx${i}`) * 1080, y = (random(`sy${i}`) * 1500 + t * 6) % 1500; return <g key={i} transform={`translate(${x} ${y}) rotate(${t * 2 + i * 30})`}>{[0, 60, 120].map((a) => <path key={a} d="M -24 0 L 24 0" stroke={MEAT} strokeWidth={9} strokeLinecap="round" transform={`rotate(${a})`} />)}</g>; })}
    <Burst t={t - 2} text="BUT RED!" x={540} y={700} size={120} color={MEAT} />
  </g>
);
// ---------------------------------------------------------------- the meat
export const S15: S = ({ t }) => (
  <g>
    <Farm id="k15" mood="warm" t={t} />
    <MeatRain t={t + 20} n={36} ground={1250} s={1.3} />
    <Punch t={t - 2} lines={['CHUNKS OF', 'MEAT']} y={300} size={116} color={MEAT} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#4A7A3A" />
    <Glow x={540} y={900} r={700} kind="warm" o={0.4} />
    {/* a hand beside a chunk the size of a palm */}
    <ellipse cx={540} cy={1060} rx={420} ry={60} fill="#000" opacity={0.35} filter="url(#gsB12)" />
    <Meat x={380} y={900} s={2.4} rot={-10} seed={7} glow={0.5} />
    <g transform="translate(740 900) rotate(-10)"><path d="M -110 120 L -110 -40 Q -110 -70 -84 -70 L -84 -170 Q -84 -196 -62 -196 Q -40 -196 -40 -170 L -40 -80 L -36 -200 Q -36 -226 -12 -226 Q 12 -226 12 -200 L 12 -84 L 18 -190 Q 18 -214 40 -214 Q 62 -214 62 -190 L 62 -70 L 66 -150 Q 66 -172 86 -172 Q 106 -172 106 -150 L 106 40 Q 106 120 40 140 L -60 140 Q -110 140 -110 120 Z" fill="#E8B88A" stroke={INK} strokeWidth={8} /></g>
    <Punch t={t - 2} lines={['BIG AS', 'YOUR PALM']} y={300} size={110} color="#FFD23F" />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Farm id="k17" mood="warm" t={t} buildings={false} />
    {[[200, 1180, 1.6], [560, 1150, 1.4], [880, 1200, 1.7]].map(([mx, my, ms], i) => <Meat key={i} x={mx} y={Math.min(my, -200 + (t - i * 5) * 40)} s={ms * popIn(t - i * 5 + 8)} rot={i * 50} seed={i + 9} />)}
    {[[220, 1100], [580, 1060], [900, 1110]].map(([sx, sy], i) => t - i * 5 > 30 ? <g key={i}>{Array.from({ length: 6 }, (_, k) => <circle key={k} cx={sx + Math.cos(k) * 90} cy={sy + Math.sin(k) * 30} r={10} fill={MEAT} />)}</g> : null)}
    <Sfx t={t - 30} text="SPLAT!" x={540} y={680} rot={-8} size={140} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#3A6A2E" />
    {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M ${random(`ax${i}`) * 1080} ${random(`ay${i}`) * 1800} l -8 -24 m 8 24 l 6 -26`} stroke="#5A9A3A" strokeWidth={4} />)}
    <Glow x={540} y={860} r={700} kind="warm" o={0.3} />
    {/* top-down: the strip of meat across the field */}
    <rect x={220} y={500} width={640 * easeOut(clamp((t - 2) / 20))} height={720} fill={MEAT} opacity={0.18} />
    {Array.from({ length: 40 }, (_, i) => (random(`bx${i}`) * 640 < 640 * easeOut(clamp((t - 2) / 20)) ? <Meat key={i} x={220 + random(`bx${i}`) * 640} y={520 + random(`by${i}`) * 680} s={0.35} rot={i * 40} seed={i} /> : null))}
    <path d="M 220 1260 L 860 1260" stroke="#FFF" strokeWidth={6} /><path d="M 220 1240 L 220 1280 M 860 1240 L 860 1280" stroke="#FFF" strokeWidth={6} />
    <Punch t={t - 6} lines={['100 YARDS']} y={290} size={120} color="#FFD23F" kicker="A STRIP OF MEAT" />
  </g>
);
// ---------------------------------------------------------------- the taste test
const twoGuys = (t: number, g1: Gest, g2: Gest) => <g><Man x={290} feet={1500} s={1.25} mood="warm" t={t} g={g1} hat="bowler" /><Man x={790} feet={1500} s={1.25} mood="warm" t={t} g={g2} hat="cap" flip /></g>;
export const S19: S = ({ t }) => (
  <g>
    <Farm id="k19" mood="warm" t={t} buildings={false} />
    <Meat x={540} y={1440} s={1.4} rot={10} seed={21} glow={0.6} />
    {twoGuys(t, 'point', 'stand')}
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
    <Farm id="k21" mood="warm" t={t} buildings={false} />
    {twoGuys(t, 'point', 'stand')}
    <Speech t={t - 2} x={330} y={760}><g transform="translate(-20 -40)"><Sheep s={0.9} /></g><text y={100} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={48} fill={INK}>MUTTON!</text></Speech>
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    <Farm id="k22" mood="warm" t={t} buildings={false} />
    {twoGuys(t, 'stand', 'point')}
    <Speech t={t - 2} x={760} y={760} flip><g transform="translate(-40 -20)"><Deer s={0.8} /></g><text y={100} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={48} fill={INK}>DEER!</text></Speech>
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
    <Lab t={t} />
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
    <Farm id="k25" mood="cold" t={t} />
    <Sfx t={t - 3} text="?" x={540} y={620} size={300} rot={6} />
    <Punch t={t - 2} lines={['WHERE FROM?']} y={300} size={110} color="#9FE3FF" />
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Farm id="k26" mood="danger" t={t} buildings={false} />
    <g transform={`translate(540 ${640 + Math.sin(t * 0.1) * 12}) scale(${popIn(t - 1)})`}>
      {[[-180, 20, 140], [0, -60, 180], [170, 10, 140], [-90, 90, 130], [100, 100, 130]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={MEAT} stroke={INK} strokeWidth={6} />)}
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${-200 + i * 44} ${-20 + (i % 3) * 50} q 20 -14 40 0`} stroke={FAT} strokeWidth={9} fill="none" strokeLinecap="round" />)}
    </g>
    <MeatRain t={t + 30} n={20} ground={1250} />
    <Punch t={t - 2} lines={['A MEAT', 'CLOUD?']} y={290} size={110} color={MEAT} />
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <S26 t={t + 40} len={60} f={0} />
    <BigX t={t - 1} y={700} s={1.2} />
  </g>
);
export const S28: S = ({ t }) => (
  <g>
    <Farm id="k28" mood="warm" t={t} />
    {[[240, 560, 0.8, 0], [620, 470, 0.65, 1], [880, 620, 0.55, 2], [450, 700, 0.45, 3]].map(([vx, vy, vs, i]) => <Vulture key={i} x={vx + Math.cos(t * 0.03 + i * 2) * 80} y={vy + Math.sin(t * 0.03 + i * 2) * 30} s={vs} t={t + i * 9} flip={i % 2 === 1} />)}
    <Punch t={t - 2} lines={['VULTURES']} y={300} size={124} color="#FFD23F" kicker="THE BEST GUESS" />
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    <Sky id="k29" mood="warm" sunX={760} sunY={360} />
    <Clouds mood="warm" t={t} y={520} o={0.5} />
    <Vulture x={540} y={860} s={1.6} t={t} scared />
    <Sfx t={t - 3} text="SPOOKED!" x={540} y={460} rot={-6} size={110} />
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
    <Farm id="k32" mood="warm" t={t} />
    {[[240, 520, 0.6, 0], [600, 440, 0.5, 1], [860, 560, 0.45, 2]].map(([vx, vy, vs, i]) => <Vulture key={i} x={vx + Math.cos(t * 0.03 + i * 2) * 60} y={vy} s={vs} t={t + i * 9} flip={i % 2 === 1} puke={(t + i * 7) / 40} />)}
    <MeatRain t={t + 30} n={24} ground={1250} />
  </g>
);
export const S33: S = ({ t }) => (
  <g>
    <Farm id="k33" mood="warm" t={t} />
    <MeatRain t={t + 80} n={30} ground={1250} />
    <Burst t={t - 2} text="LOST THEIR LUNCH" x={540} y={620} size={70} color="#9BE04A" />
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
    <Sky id="k35" mood="noon" sunX={760} sunY={360} />
    <path d="M -200 1250 Q 540 1200 1280 1250 L 1280 2000 L -200 2000 Z" fill="#4A7A3A" />
    <Man x={540} feet={1560} s={1.6} mood="noon" t={t} g="nose" hat="cap" />
    <Vulture x={720} y={420} s={0.5} t={t} />
    <Punch t={t - 2} lines={['KEEP YOUR', 'MOUTH SHUT']} y={300} size={100} color="#FFD23F" />
  </g>
);
export const S36: S = ({ t }) => (
  <g>
    <Farm id="k36" mood="warm" t={t} sunX={540} sunY={760} />
    <Punch t={t - 2} lines={["THAT'S REAL."]} y={300} size={120} color="#FFD23F" />
  </g>
);
export const S37: S = ({ t }) => (
  <g>
    <Farm id="k37" mood="night" t={t} sunX={800} sunY={360} />
    <Lamp x={110} base={1720} s={1.1} t={t} />
    {twoGuys(t, 'stand', 'stand')}
    <Punch t={t - 3} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={300} size={80} color="#C9A2FF" />
  </g>
);

// ---------------------------------------------------------------- "wide, then close" pairs
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S38 = close(S37, 540, 1350, 1.5, 40);  // "strange history": the two guys
export const S39 = close(S15, 540, 1150, 1.5, 30);  // "splat all over the yard"
export const S40 = close(S10, 700, 1200, 1.5, 30);  // "making soap": the kettle
export const S41 = close(S18, 540, 860, 1.4, 40);  // "just covered in meat"
