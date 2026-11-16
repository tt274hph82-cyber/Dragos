import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT, LEG_LEN, HEAD } from '../../engine';
import { W, Mood, MOODS, Sky, Figure, Punch, Burst, Counter, BigNumber, Calendar, Thermometer, Sfx, popIn, clamp, lerp, easeOut, Glow, INK, CloseCtx, Fore } from '../molasses/kit';

// "The Great Stink" (London, 1858): a native 9:16 story Short in the Dancing Plague v3 style. Key content sits
// between y = 280 and 1250. One colour mood per scene, flat layered silhouettes with a glowing rim, and colour only on
// the key thing: the sick green of the stink (and the river), red for the killer.

type S = React.FC<ShotProps>;
const scr = { mixBlendMode: 'screen' as const };
/** Blur and glow filters every shot can use (mounted once per frame by index.tsx). */
export const FxDefs: React.FC = () => (
  <defs>
    {[3, 6, 12, 24, 48].map((d) => <filter key={d} id={`gsB${d}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={d} /></filter>)}
    <filter id="gsGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={9} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <linearGradient id="gsRay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4D0" stopOpacity={0.9} /><stop offset="1" stopColor="#FFF4D0" stopOpacity={0} /></linearGradient>
    <linearGradient id="gsWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.55} /></linearGradient>
  </defs>
);
/** Soft light shafts fanning out from (x, y), slowly turning, added on top (screen). */
const Rays: React.FC<{ x: number; y: number; t: number; n?: number; len?: number; o?: number; spread?: number; dir?: number; color?: string }> = ({ x, y, t, n = 7, len = 1500, o = 0.3, spread = 70, dir = 90, color }) => (
  <g style={scr} opacity={o} filter="url(#gsB12)">
    {Array.from({ length: n }, (_, i) => {
      const a = (dir - spread / 2 + (i + 0.5) * (spread / n) + Math.sin(t * 0.02 + i) * 2) * Math.PI / 180, w = (spread / n) * 0.35 * Math.PI / 180;
      const x1 = x + Math.cos(a - w) * len, y1 = y + Math.sin(a - w) * len, x2 = x + Math.cos(a + w) * len, y2 = y + Math.sin(a + w) * len;
      return <path key={i} d={`M ${x} ${y} L ${x1} ${y1} L ${x2} ${y2} Z`} fill={color || 'url(#gsRay)'} opacity={0.5 + 0.5 * Math.abs(Math.sin(i * 1.7 + t * 0.03))} />;
    })}
  </g>
);
/** Layered clouds with lit tops, drifting. */
const Clouds: React.FC<{ mood: Mood; t: number; y?: number; o?: number }> = ({ mood, t, y = 560, o = 1 }) => {
  const m = MOODS[mood];
  return (
    <g opacity={o}>
      {[0, 1, 2].map((row) => (
        <g key={row} transform={`translate(${((t * (0.3 + row * 0.25)) % 400) - 200 + row * 130} ${y + row * 90})`}>
          {Array.from({ length: 6 }, (_, i) => {
            const cx = -200 + i * 290 + (row % 2) * 120, cy = Math.sin(i * 2.3 + row) * 30;
            return <g key={i}>
              <g filter="url(#gsB6)">{[[-90, 10, 80], [-20, -20, 105], [70, 0, 85], [140, 20, 60]].map(([dx, dy, r], k) => <circle key={k} cx={cx + dx} cy={cy + dy} r={r * (0.8 + row * 0.15)} fill={m.layers[row]} opacity={0.75} />)}</g>
            </g>;
          })}
        </g>
      ))}
    </g>
  );
};
/** A Victorian gas lamp with a warm halo and a pool of light on the ground. */
const Lamp: React.FC<{ x: number; base: number; s?: number; t: number }> = ({ x, base, s = 1, t }) => {
  const fl = 1 + 0.06 * Math.sin(t * 0.7 + x);
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={220} ry={40} fill="#FFC870" opacity={0.28 * fl} filter="url(#gsB24)" style={scr} />
      <rect x={-9} y={-420} width={18} height={420} fill="#0B0A10" />
      <rect x={-22} y={-40} width={44} height={40} fill="#0B0A10" />
      <path d="M -40 -420 L 40 -420 L 26 -500 L -26 -500 Z" fill="#FFE2A0" stroke="#0B0A10" strokeWidth={8} />
      <path d="M -34 -500 L 34 -500 L 0 -540 Z" fill="#0B0A10" />
      <circle cx={0} cy={-460} r={150 * fl} fill="#FFC870" opacity={0.35} filter="url(#gsB24)" style={scr} />
      <circle cx={0} cy={-460} r={40} fill="#FFF2C8" opacity={0.9} filter="url(#gsB6)" />
    </g>
  );
};
/** A soft contact shadow under feet. */
const Shadow: React.FC<{ x: number; y: number; w: number; o?: number }> = ({ x, y, w, o = 0.55 }) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.18} fill="#000" opacity={o} filter="url(#gsB6)" />;
/** The film look on top of every shot: a teal-and-amber grade, a light leak, floating dust, grain and a vignette. */
export const Atmos: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <radialGradient id="gsVig" cx="0.5" cy="0.42" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.62} /></radialGradient>
      <linearGradient id="gsGrade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFB060" /><stop offset="0.5" stopColor="#808080" /><stop offset="1" stopColor="#205060" /></linearGradient>
      <filter id="gsGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 7} /><feColorMatrix type="saturate" values="0" /></filter>
    </defs>
    <rect width={W} height={1920} fill="url(#gsGrade)" opacity={0.18} style={{ mixBlendMode: 'soft-light' }} />
    <ellipse cx={120 + Math.sin(f * 0.01) * 60} cy={140} rx={520} ry={360} fill="#FF9A40" opacity={0.13} filter="url(#gsB48)" style={scr} />
    {Array.from({ length: 26 }, (_, i) => {
      const x = (random(`ax${i}`) * W + f * (0.4 + random(`av${i}`) * 0.8)) % W, y = 300 + ((random(`ay${i}`) * 1100 - f * (0.3 + random(`au${i}`) * 0.5)) % 1100 + 1100) % 1100;
      return <circle key={i} cx={x} cy={y} r={2 + random(`ar${i}`) * 3.5} fill="#FFF2D0" opacity={0.12 + 0.3 * Math.abs(Math.sin(f * 0.05 + i))} filter={i % 3 ? undefined : 'url(#gsB3)'} />;
    })}
    <rect width={W} height={1920} filter="url(#gsGrain)" opacity={0.07} style={{ mixBlendMode: 'overlay' }} />
    <rect width={W} height={1920} fill="url(#gsVig)" />
  </g>
);
const GREEN = '#9BE04A', SICK = '#6E7A2A', RIVER = '#4A4A1E', RED = '#C8262E';

// ---------------------------------------------------------------- the stink
/** Wavy green stink lines rising from (x, y): n of them, each looping upward and fading. */
const Stink: React.FC<{ x: number; y: number; t: number; n?: number; s?: number; spread?: number; o?: number }> = ({ x, y, t, n = 5, s = 1, spread = 300, o = 0.85 }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const k = ((t * 0.025 + i / n) % 1), xx = x + (i - (n - 1) / 2) * (spread / Math.max(1, n - 1)) + Math.sin(t * 0.08 + i) * 20;
      const yy = y - k * 260 * s, a = 1 - Math.abs(k - 0.45) * 1.8;
      const d = `M ${xx} ${yy} q ${22 * s} ${-35 * s} 0 ${-70 * s} q ${-22 * s} ${-35 * s} 0 ${-70 * s} q ${22 * s} ${-35 * s} 0 ${-70 * s}`;
      return <g key={i} opacity={clamp(a)}><path d={d} stroke={GREEN} strokeWidth={46 * s} fill="none" strokeLinecap="round" opacity={0.35} filter="url(#gsB12)" /><path d={d} stroke="#2A3A0A" strokeWidth={22 * s} fill="none" strokeLinecap="round" /><path d={d} stroke={GREEN} strokeWidth={12 * s} fill="none" strokeLinecap="round" /><path d={d} stroke="#E8FFB0" strokeWidth={4 * s} fill="none" strokeLinecap="round" opacity={0.7} /></g>;
    })}
  </g>
);
/** A green haze over the whole frame. */
const Haze: React.FC<{ k: number }> = ({ k }) => <rect x={-300} y={-300} width={W + 600} height={2600} fill="#7A9A20" opacity={0.22 * k} style={{ mixBlendMode: 'multiply' }} />;
const Flies: React.FC<{ x: number; y: number; t: number; n?: number; r?: number }> = ({ x, y, t, n = 9, r = 120 }) => (
  <g fill={INK}>
    {Array.from({ length: n }, (_, i) => {
      const a = t * (0.15 + random(`fa${i}`) * 0.2) + i * 2.1, rr = r * (0.4 + random(`fr${i}`) * 0.6);
      return <g key={i} transform={`translate(${x + Math.cos(a) * rr} ${y + Math.sin(a * 1.3) * rr * 0.6})`}><circle r={6} /><ellipse cx={-6} cy={-6} rx={7} ry={4} fill="#DDE" opacity={0.6} /><ellipse cx={6} cy={-6} rx={7} ry={4} fill="#DDE" opacity={0.6} /></g>;
    })}
  </g>
);

// ---------------------------------------------------------------- the set: the Thames at Westminster
/** The Houses of Parliament in silhouette: the long gothic front, the Victoria Tower and the clock tower. */
const Parliament: React.FC<{ x: number; base: number; s: number; c: string; lit?: number }> = ({ x, base, s, c, lit = 0.3 }) => (
  <g transform={`translate(${x} ${base}) scale(${s})`} fill={c}>
    <rect x={-420} y={-230} width={840} height={230} />
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${-420 + i * 40} -230 l 10 -40 l 10 40 Z`} />)}
    {/* the Victoria Tower, left */}
    <rect x={-440} y={-560} width={150} height={560} />
    {[-440, -320].map((px) => <path key={px} d={`M ${px} -560 l 15 -70 l 15 70 Z`} />)}
    <path d="M -380 -560 l 15 -50 l 15 50 Z" />
    {/* the clock tower, right */}
    <rect x={330} y={-640} width={110} height={640} />
    <rect x={318} y={-720} width={134} height={90} />
    <path d="M 318 -720 L 385 -880 L 452 -720 Z" />
    <rect x={380} y={-930} width={10} height={60} />
    <circle cx={385} cy={-675} r={34} fill="#FFE8A8" opacity={0.85} />
    <path d="M 385 -675 L 385 -700 M 385 -675 L 403 -668" stroke={INK} strokeWidth={5} />
    {/* buttresses, string courses and pointed arches */}
    {Array.from({ length: 22 }, (_, i) => <rect key={`b${i}`} x={-418 + i * 40} y={-250} width={6} height={250} fill="#000" opacity={0.22} />)}
    <rect x={-420} y={-118} width={840} height={6} fill="#000" opacity={0.25} />
    {Array.from({ length: 9 }, (_, i) => <path key={`a${i}`} d={`M ${-420 + i * 50} -440 L ${-420 + i * 50} -500 Q ${-405 + i * 50} -530 ${-390 + i * 50} -500 L ${-390 + i * 50} -440 Z`} fill="#000" opacity={0.2} />)}
    {/* windows, lit ones with a halo */}
    {Array.from({ length: 30 }, (_, i) => {
      const on = random(`pw${i}`) < lit, wx = -400 + (i % 15) * 52, wy = -200 + Math.floor(i / 15) * 90;
      return <g key={i}>{on ? <circle cx={wx + 9} cy={wy + 25} r={34} fill="#FFC870" opacity={0.45} filter="url(#gsB12)" /> : null}
        <path d={`M ${wx} ${wy + 50} L ${wx} ${wy + 10} Q ${wx + 9} ${wy - 4} ${wx + 18} ${wy + 10} L ${wx + 18} ${wy + 50} Z`} fill={on ? '#FFD27A' : '#000'} opacity={on ? 0.9 : 0.25} /></g>;
    })}
    <circle cx={385} cy={-675} r={90} fill="#FFE8A8" opacity={0.4} filter="url(#gsB24)" />
  </g>
);
/** London across the river: far domes and spires (St Paul's), chimneys with smoke. */
const FarCity: React.FC<{ mood: Mood; t: number }> = ({ mood, t }) => {
  const m = MOODS[mood];
  const B: [number, number, number][] = [[-80, 160, 990], [70, 120, 950], [180, 150, 1010], [520, 130, 960], [640, 170, 1000], [800, 120, 940], [910, 200, 980]];
  return (
    <g fill={m.layers[0]}>
      <g transform="translate(700 1000)"><rect x={-90} y={-90} width={180} height={90} /><path d="M -80 -90 Q 0 -230 80 -90 Z" /><rect x={-8} y={-270} width={16} height={60} /></g>
      {B.map(([x, w, top], i) => <g key={i}><rect x={x} y={top} width={w} height={400} /><rect x={x + w * 0.6} y={top - 50} width={20} height={50} />
        {[0, 1, 2].map((k) => { const ph = ((t * 0.5 + k * 50 + i * 23) % 150) / 150; return <circle key={k} cx={x + w * 0.6 + 10 + ph * 50} cy={top - 60 - ph * 160} r={10 + ph * 26} fill={m.layers[0]} opacity={0.5 * (1 - ph)} />; })}
      </g>)}
    </g>
  );
};
/** The river: a band from y with ripples; `filth` turns it from grey-green to brown sludge with floating junk. */
const River: React.FC<{ y: number; t: number; filth?: number; boil?: number; mood: Mood }> = ({ y, t, filth = 1, boil = 0, mood }) => {
  const m = MOODS[mood];
  const col = filth > 0.5 ? RIVER : '#3A5A6A';
  return (
    <g>
      <rect x={-300} y={y} width={W + 600} height={1200} fill={col} />
      <rect x={-300} y={y} width={W + 600} height={14} fill={m.rim} opacity={0.35} />
      {Array.from({ length: 10 }, (_, r) => Array.from({ length: 6 }, (_, k) => {
        const yy = y + 40 + r * r * 8 + r * 20, xx = ((k * 230 + r * 90 + t * (1 + r * 0.2)) % 1500) - 200;
        return <path key={`${r}-${k}`} d={`M ${xx} ${yy} q 40 -10 80 0`} stroke={filth > 0.5 ? '#8A8A3A' : '#8AB0C0'} strokeWidth={4 + r * 0.6} fill="none" opacity={0.5} />;
      }))}
      {filth > 0.5 ? Array.from({ length: 9 }, (_, i) => {
        const xx = ((i * 140 + t * 0.8) % 1300) - 100, yy = y + 60 + (i % 4) * 70;
        return <ellipse key={i} cx={xx} cy={yy} rx={18 + (i % 3) * 10} ry={8} fill={i % 2 ? '#2A2410' : '#6A5A20'} />;
      }) : null}
      {[0, 1, 2].map((k) => <ellipse key={`m${k}`} cx={((t * (1 + k * 0.6) + k * 400) % 1600) - 250} cy={y + 30 + k * 60} rx={520} ry={44} fill={m.rim} opacity={0.12} filter="url(#gsB24)" />)}
      {Array.from({ length: 16 }, (_, i) => <circle key={`sp${i}`} cx={(random(`sx${i}`) * W + t * 0.5) % W} cy={y + 30 + random(`sy${i}`) * 300} r={3} fill="#FFF6D0" opacity={0.6 * Math.abs(Math.sin(t * 0.15 + i))} filter="url(#gsB3)" />)}
      {boil > 0 ? Array.from({ length: 14 }, (_, i) => {
        const k = ((t * 0.05 + i / 14) % 1), xx = 40 + i * 74 + Math.sin(i * 3) * 20, yy = y + 70 + (i % 5) * 60;
        return <circle key={i} cx={xx} cy={yy - k * 10} r={(6 + 20 * k) * boil} fill="none" stroke={GREEN} strokeWidth={4} opacity={(1 - k) * boil} />;
      }) : null}
    </g>
  );
};
/** Westminster from across the river: sky, far city, Parliament on the far bank, the river, a near embankment. */
const Thames: React.FC<{ id: string; mood: Mood; t: number; stink?: number; boil?: number; sunY?: number; sunX?: number; moon?: boolean; filth?: number }> = ({ id, mood, t, stink = 1, boil = 0, sunY = 420, sunX = 300, moon, filth = 1 }) => {
  const m = MOODS[mood];
  return (
    <g>
      <Sky id={id} mood={mood} sunY={sunY} sunX={sunX} moon={moon} />
      <FarCity mood={mood} t={t} />
      <Clouds mood={mood} t={t} y={520} o={mood === 'noon' || mood === 'outback' || mood === 'warm' ? 0.35 : 0.7} />
      <Parliament x={500} base={1150} s={0.78} c={m.layers[1]} lit={mood === 'night' ? 0.7 : 0.35} />
      <River y={1150} t={t} filth={filth} boil={boil} mood={mood} />
      {/* the reflection of Parliament, broken by the ripples */}
      <g opacity={0.32} filter="url(#gsB6)" transform={`translate(0 ${2 * 1150}) scale(1 -1)`}><Parliament x={500} base={1150} s={0.78} c={m.layers[0]} lit={0.5} /></g>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={170 + i * 46 + Math.sin(t * 0.2 + i) * 6} y={1170} width={10} height={140 + (i % 3) * 60} fill="#FFD27A" opacity={0.28} filter="url(#gsB6)" style={scr} />)}
      <rect x={-300} y={1150} width={W + 600} height={500} fill="url(#gsWater)" />
      <Rays x={sunX} y={sunY} t={t} o={moon ? 0.16 : 0.26} n={8} spread={110} dir={90} />
      {stink > 0 ? <g><Stink x={300} y={1260} t={t} n={4} spread={360} s={1} o={0.8 * stink} /><Stink x={780} y={1330} t={t + 20} n={4} spread={360} s={1.1} o={0.8 * stink} /></g> : null}
      <Haze k={stink} />
    </g>
  );
};

// ---------------------------------------------------------------- people
type Gest = 'nose' | 'gag' | 'run' | 'point' | 'shock' | 'stand' | 'vote' | 'dig';
/** A Victorian Londoner in silhouette with the scene's rim; gest picks the pose. */
const Man: React.FC<{ x: number; feet: number; s: number; mood: Mood; t: number; g?: Gest; hat?: 'bowler' | 'cap' | 'none'; flip?: boolean; ph?: number }> = ({ x, feet, s, mood, t, g = 'stand', hat = 'bowler', flip, ph = 0 }) => {
  const p = t * 0.5 + ph, run = Math.sin(p) * 40;
  const yaw = flip ? -0.4 : 0.4;
  const poses: Record<Gest, object> = {
    stand: { yaw },
    nose: { yaw, headTilt: 8, armR: { a: 160, b: 150 }, armL: { a: 20, b: 20 } },
    gag: { yaw, headTilt: 26 + Math.sin(p * 2) * 6, armR: { a: 150, b: 140 }, armL: { a: 60, b: 70 } },
    run: { yaw, legL: { a: run, b: -Math.abs(run) }, legR: { a: -run, b: -Math.abs(run) }, armL: { a: 40 - run, b: 60 }, armR: { a: 40 + run, b: 60 } },
    point: { yaw, armR: { a: 100, b: 10 } },
    shock: { yaw, armL: { a: 150, b: 40 }, armR: { a: 150, b: 40 } },
    vote: { yaw, armR: { a: 175, b: 5 } },
    dig: { yaw, headTilt: 20, armL: { a: 60 + Math.sin(p) * 30, b: 50 }, armR: { a: 70 + Math.sin(p) * 30, b: 40 } },
  };
  const hop = g === 'run' ? Math.abs(Math.sin(p)) * 18 : 0;
  return <g><Shadow x={x} y={feet} w={150 * s * (1 - hop / 80)} /><Figure x={x} feet={feet - hop} s={s} mood={mood} hat={hat} pose={poses[g] as any} /></g>;
};
const crowd = (mood: Mood, t: number, n: number, x0: number, x1: number, feet: number, s: number, g: Gest, seed = 0): React.ReactNode =>
  Array.from({ length: n }, (_, i) => <Man key={i} x={lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)) + (random(`cx${seed}${i}`) - 0.5) * 40} feet={feet + (i % 3) * 14} s={s * (0.9 + (i % 3) * 0.06)} mood={mood} t={t} g={g} hat={i % 3 === 1 ? 'cap' : 'bowler'} flip={i % 2 === 0} ph={i * 1.7 + seed} />);

// ---------------------------------------------------------------- props
const Pipe: React.FC<{ t: number; x?: number; y?: number; k?: number }> = ({ t, x = 120, y = 980, k = 1 }) => (
  <g>
    <rect x={-200} y={y - 300} width={x + 260} height={700} fill="#3A2E22" />
    {Array.from({ length: 8 }, (_, r) => Array.from({ length: 4 }, (_, c) => <rect key={`${r}${c}`} x={-190 + c * 110 + (r % 2) * 55} y={y - 290 + r * 86} width={100} height={76} fill="#4A3A2A" stroke="#241A10" strokeWidth={4} />))}
    <ellipse cx={x + 60} cy={y} rx={60} ry={130} fill="#120C08" stroke="#6A5A40" strokeWidth={14} />
    {/* the gush */}
    {k > 0 ? <path d={`M ${x + 60} ${y - 100} Q ${x + 300} ${y - 120 + Math.sin(t * 0.4) * 10} ${x + 420} ${y + 260} L ${x + 300} ${y + 270} Q ${x + 240} ${y + 40} ${x + 60} ${y + 90} Z`} fill="#6A5420" opacity={0.95 * k} /> : null}
    {k > 0 ? Array.from({ length: 6 }, (_, i) => { const q = ((t * 0.06 + i / 6) % 1); return <circle key={i} cx={x + 120 + q * 300} cy={y - 60 + q * q * 320} r={14 + i * 3} fill="#4A3A14" opacity={k} />; }) : null}
  </g>
);
const Glass: React.FC<{ t: number; germs?: number }> = ({ t, germs = 0 }) => (
  <g transform={`translate(540 860) scale(${popIn(t) * 1.4})`}>
    <path d="M -150 -230 L 150 -230 L 120 230 L -120 230 Z" fill="#FFFFFF" fillOpacity={0.12} stroke="#E8F0F0" strokeWidth={10} />
    <path d="M -118 -210 L -90 -210 L -80 200 L -100 200 Z" fill="#FFFFFF" opacity={0.35} filter="url(#gsB3)" />
    <ellipse cx={0} cy={250} rx={170} ry={26} fill="#000" opacity={0.5} filter="url(#gsB6)" />
    <path d={`M -138 -60 Q -70 ${-80 + Math.sin(t * 0.2) * 10} 0 -60 Q 70 -40 138 -60 L 120 226 L -120 226 Z`} fill="#7A6A2A" opacity={0.9} />
    {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={-80 + i * 26} cy={60 + (i % 3) * 50} rx={14} ry={7} fill="#3A2E10" />)}
    {germs > 0 ? Array.from({ length: 6 }, (_, i) => <Germ key={i} x={-80 + (i % 3) * 80} y={30 + Math.floor(i / 3) * 90} t={t + i * 9} s={0.5 * germs} />) : null}
  </g>
);
/** A cholera germ: a green comma with a whip tail and two angry eyes. */
const Germ: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x + Math.sin(t * 0.2) * 12} ${y + Math.cos(t * 0.17) * 10}) scale(${s}) rotate(${Math.sin(t * 0.1) * 20})`}>
    <path d={`M 60 -10 q 60 ${-30 + Math.sin(t * 0.6) * 30} 120 0`} stroke="#B8F06A" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M -70 30 Q -90 -60 0 -70 Q 80 -60 60 10 Q 20 -30 -20 -10 Q -40 10 -70 30 Z" fill="#9BE04A" opacity={0.6} filter="url(#gsB12)" />
    <path d="M -70 30 Q -90 -60 0 -70 Q 80 -60 60 10 Q 20 -30 -20 -10 Q -40 10 -70 30 Z" fill="#7ACC2A" stroke={INK} strokeWidth={8} />
    <path d="M -50 -20 Q -50 -52 -10 -58" stroke="#E8FFC0" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
    <ellipse cx={-6} cy={-36} rx={12} ry={14} fill="#FFF" /><circle cx={-3} cy={-33} r={6} fill={INK} />
    <ellipse cx={30} cy={-38} rx={12} ry={14} fill="#FFF" /><circle cx={33} cy={-35} r={6} fill={INK} />
    <path d="M -22 -58 L 6 -48 M 46 -58 L 18 -48" stroke={INK} strokeWidth={7} strokeLinecap="round" />
  </g>
);
/** The stink as a ghost: a green cloud with a skull face (what they thought killed people). */
const Miasma: React.FC<{ t: number; k?: number; x?: number; y?: number }> = ({ t, k = 1, x = 540, y = 820 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.1) * 14}) scale(${popIn(t) * k})`} opacity={0.95}>
    {[[-180, 20, 150], [0, -70, 190], [170, 10, 150], [-90, 110, 140], [100, 120, 140]].map(([cx, cy, r], i) => <circle key={i} cx={cx + Math.sin(t * 0.08 + i) * 10} cy={cy} r={r} fill="#7AA82A" opacity={0.85} />)}
    <ellipse cx={-70} cy={-20} rx={45} ry={55} fill="#1A2208" /><ellipse cx={70} cy={-20} rx={45} ry={55} fill="#1A2208" />
    <path d="M -20 60 L 0 30 L 20 60 Z" fill="#1A2208" />
    {[-60, -30, 0, 30, 60].map((dx) => <rect key={dx} x={dx - 11} y={95} width={22} height={34} rx={4} fill="#1A2208" />)}
    <Glow x={0} y={0} r={420} kind="cool" o={0.5} />
  </g>
);
const Curtain: React.FC<{ x: number; w: number; top: number; h: number; t: number; wet?: number }> = ({ x, w, top, h, t, wet = 0 }) => (
  <g>
    <path d={`M ${x} ${top} L ${x + w} ${top} L ${x + w + Math.sin(t * 0.1) * 8} ${top + h} L ${x - Math.sin(t * 0.1) * 8} ${top + h} Z`} fill={wet > 0 ? '#C8D8B0' : '#8A1A24'} stroke={INK} strokeWidth={6} />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${x + (i + 0.5) * (w / 5)} ${top} L ${x + (i + 0.5) * (w / 5)} ${top + h}`} stroke={INK} strokeOpacity={0.3} strokeWidth={6} />)}
    {wet > 0 ? Array.from({ length: 6 }, (_, i) => { const q = ((t * 0.05 + i / 6) % 1); return <ellipse key={i} cx={x + 20 + i * (w / 6)} cy={top + h + q * 140} rx={6} ry={12} fill="#DDEEC0" opacity={wet * (1 - q)} />; }) : null}
  </g>
);
/** The House of Commons inside: dark panelling, tall gothic windows, green benches. */
const Commons: React.FC<{ t: number; wet?: number }> = ({ t, wet = 0 }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A1C12" />
    {Array.from({ length: 9 }, (_, i) => <rect key={`v${i}`} x={-100 + i * 150} y={0} width={8} height={1040} fill="#1A0E08" opacity={0.5} />)}
    {[170, 540, 910].map((wx) => <g key={wx}><path d={`M ${wx - 110} 1000 L ${wx - 110} 470 Q ${wx} 330 ${wx + 110} 470 L ${wx + 110} 1000 Z`} fill="#C8B070" opacity={0.55} /><Glow x={wx} y={680} r={260} kind="warm" o={0.5} />
      <Curtain x={wx - 150} w={90} top={420} h={600} t={t} wet={wet} /><Curtain x={wx + 60} w={90} top={420} h={600} t={t + 9} wet={wet} /></g>)}
    {Array.from({ length: 12 }, (_, i) => <rect key={`pn${i}`} x={-60 + i * 100} y={1040} width={90} height={160} fill="#3A2616" stroke="#1A0E08" strokeWidth={4} />)}
    <rect x={-200} y={1040} width={W + 400} height={40} fill="#4A3220" />
    {[170, 540, 910].map((wx, i) => <path key={`r${i}`} d={`M ${wx - 100} 480 L ${wx + 100} 480 L ${wx + 420} 1700 L ${wx + 60} 1700 Z`} fill="url(#gsRay)" opacity={0.32} filter="url(#gsB16)" style={scr} />)}
    {Array.from({ length: 18 }, (_, i) => { const q = ((t * 0.01 + i / 18) % 1); return <circle key={`dm${i}`} cx={200 + (i % 6) * 140 + q * 200} cy={600 + q * 900} r={3} fill="#FFF2C8" opacity={0.5 * Math.sin(q * Math.PI)} />; })}
    {[300, 780].map((cx) => <g key={cx}><path d={`M ${cx} 0 L ${cx} 230`} stroke="#1A0E08" strokeWidth={6} /><path d={`M ${cx - 120} 260 Q ${cx} 320 ${cx + 120} 260`} stroke="#B8902A" strokeWidth={10} fill="none" />
      {[-110, -55, 0, 55, 110].map((dx) => <g key={dx}><circle cx={cx + dx} cy={240} r={40} fill="#FFC870" opacity={0.5} filter="url(#gsB12)" /><ellipse cx={cx + dx} cy={240} rx={6} ry={12} fill="#FFF2C8" /></g>)}</g>)}
    {[1180, 1330, 1480].map((by, i) => <rect key={by} x={-200} y={by} width={W + 400} height={90} rx={14} fill="#2E5A3A" stroke={INK} strokeWidth={6} opacity={1 - i * 0.1} />)}
  </g>
);
const Bucket: React.FC<{ t: number; x?: number; y?: number }> = ({ t, x = 540, y = 1300 }) => (
  <g transform={`translate(${x} ${y}) scale(${popIn(t) * 1.4})`}>
    <path d="M -110 -120 L 110 -120 L 90 100 L -90 100 Z" fill="#8A8A90" stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={-120} rx={110} ry={26} fill="#E8F2D0" stroke={INK} strokeWidth={8} />
    <path d="M -110 -120 Q 0 -260 110 -120" stroke={INK} strokeWidth={8} fill="none" />
    <rect x={-80} y={-60} width={160} height={70} rx={8} fill="#F2E8C8" stroke={INK} strokeWidth={5} />
    <text y={-30} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={26} fill={INK}>CHLORIDE</text>
    <text y={2} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={26} fill={INK}>OF LIME</text>
  </g>
);
const Ship: React.FC<{ t: number; x?: number; y?: number; s?: number; mood: Mood }> = ({ t, x = 540, y = 1180, s = 1, mood }) => {
  const rim = MOODS[mood].rim, rock = Math.sin(t * 0.12) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rock})`} style={{ filter: `drop-shadow(0 0 5px ${rim})` }}>
      <path d="M -380 -60 L 380 -60 L 300 70 L -320 70 Z" fill={INK} />
      <rect x={-12} y={-560} width={24} height={500} fill={INK} />
      <path d="M 12 -540 Q 220 -400 12 -260 Z" fill="#D8C8A0" stroke={INK} strokeWidth={5} />
      <path d="M -12 -520 Q -200 -380 -12 -240 Z" fill="#C8B890" stroke={INK} strokeWidth={5} />
      <path d="M -12 -560 L -360 -70 M 12 -560 L 360 -70" stroke={INK} strokeWidth={4} />
    </g>
  );
};
const Bridge: React.FC<{ mood: Mood; y?: number }> = ({ mood, y = 1180 }) => {
  const m = MOODS[mood];
  return (
    <g fill={m.layers[2]}>
      <rect x={-200} y={y - 60} width={W + 400} height={90} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-140 + i * 340} ${y + 30} L ${-140 + i * 340} ${y + 400} Q ${30 + i * 340} ${y + 120} ${200 + i * 340} ${y + 400} L ${200 + i * 340} ${y + 30} Z`} />)}
      <rect x={-200} y={y - 110} width={W + 400} height={16} />
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-180 + i * 60} y={y - 110} width={12} height={56} />)}
    </g>
  );
};
/** A London map with the new sewer lines drawing themselves along the river (k 0..1). */
const SewerMap: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <g transform={`translate(540 900) scale(${popIn(t) * 0.85}) rotate(-2)`}>
    <rect x={-400} y={-330} width={800} height={660} rx={16} fill="#EAD9B0" stroke={INK} strokeWidth={10} />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-380 + (i % 6) * 128 + random(`m${i}`) * 30} y={-310 + Math.floor(i / 6) * 128 + random(`n${i}`) * 30} width={70 + random(`o${i}`) * 40} height={50 + random(`p${i}`) * 40} fill="#D2BE90" />)}
    <path d="M -400 60 Q -200 -20 0 40 Q 200 100 400 10" stroke="#4A7AB0" strokeWidth={46} fill="none" />
    {[[-400, -130, 400, -170], [-400, 210, 400, 180], [-400, -40, 400, -60]].map(([x0, y0, x1, y1], i) => (
      <path key={i} d={`M ${x0} ${y0} Q 0 ${(y0 + y1) / 2 + (i - 1) * 40} ${x1} ${y1}`} stroke={RED} strokeWidth={14} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(k * 1.4 - i * 0.2)} strokeLinecap="round" />
    ))}
    <text x={-360} y={-270} fontFamily={FONT.title} fontWeight={800} fontSize={48} fill="#6A5A40">LONDON</text>
    <text x={330} y={290} textAnchor="end" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#6A5A40">THE THAMES</text>
  </g>
);
/** A brick sewer tunnel in perspective, rings receding to a glow; `water` runs along the floor. */
const Tunnel: React.FC<{ t: number; water?: number; light?: string }> = ({ t, water = 0, light = '#FFD27A' }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1A0E08" />
    {Array.from({ length: 9 }, (_, i) => {
      const k = Math.pow(0.78, i), r = 760 * k, cy = 900;
      return <g key={i}>
        <path d={`M ${540 - r} ${cy + r * 0.8} L ${540 - r} ${cy} A ${r} ${r} 0 0 1 ${540 + r} ${cy} L ${540 + r} ${cy + r * 0.8}`} fill="none" stroke={i % 2 ? '#7A4A2A' : '#8A5A32'} strokeWidth={70 * k} />
        <path d={`M ${540 - r} ${cy + r * 0.8} L ${540 - r} ${cy} A ${r} ${r} 0 0 1 ${540 + r} ${cy} L ${540 + r} ${cy + r * 0.8}`} fill="none" stroke="#2A160C" strokeWidth={6 * k} />
        <path d={`M ${540 - r} ${cy + r * 0.8} L ${540 - r} ${cy} A ${r} ${r} 0 0 1 ${540 + r} ${cy} L ${540 + r} ${cy + r * 0.8}`} fill="none" stroke="#3A1E10" strokeWidth={58 * k} strokeDasharray={`${3 * k} ${34 * k}`} opacity={0.8} />
        <path d={`M ${540 - r} ${cy + r * 0.8} L ${540 - r} ${cy} A ${r} ${r} 0 0 1 ${540 + r} ${cy} L ${540 + r} ${cy + r * 0.8}`} fill="none" stroke="#C8844A" strokeWidth={4 * k} opacity={0.35} transform={`translate(0 ${-30 * k})`} />
      </g>;
    })}
    <Glow x={540} y={950} r={360} kind="warm" o={0.8} />
    <circle cx={540} cy={950} r={150} fill={light} opacity={0.5} filter="url(#gsB24)" style={scr} />
    <circle cx={540} cy={950} r={70} fill={light} opacity={0.8} />
    <Rays x={540} y={950} t={t} n={10} len={1100} o={0.18} spread={360} dir={0} />
    {[[150, 760], [930, 760], [330, 860], [750, 860]].map(([lx, ly], i) => <g key={i}><circle cx={lx} cy={ly} r={110 - i * 15} fill="#FFB050" opacity={0.45} filter="url(#gsB24)" style={scr} /><rect x={lx - 16} y={ly - 26} width={32} height={46} rx={6} fill="#FFE2A0" stroke="#1A0E08" strokeWidth={5} /></g>)}
    <ellipse cx={540} cy={1500} rx={260} ry={60} fill={light} opacity={0.25} filter="url(#gsB24)" style={scr} />
    {water > 0 ? <path d={`M ${540 - 700} 1600 Q 540 ${1060 + Math.sin(t * 0.3) * 6} ${540 + 700} 1600 Z`} fill="#4A6A7A" opacity={water} /> : null}
    {water > 0 ? Array.from({ length: 8 }, (_, i) => { const q = ((t * 0.04 + i / 8) % 1); return <path key={i} d={`M ${540 - 300 * q - 20} ${1080 + 500 * q} l ${40 + 120 * q} 0`} stroke="#BFE4F0" strokeWidth={4 + 8 * q} opacity={water * (1 - q * 0.5)} />; }) : null}
  </g>
);
const BigX: React.FC<{ t: number; x?: number; y?: number; s?: number }> = ({ t, x = 540, y = 820, s = 1 }) => (t < 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 5) * s})`}><path d="M -240 -240 L 240 240 M 240 -240 L -240 240" stroke="#140A12" strokeWidth={80} strokeLinecap="round" /><path d="M -240 -240 L 240 240 M 240 -240 L -240 240" stroke={RED} strokeWidth={54} strokeLinecap="round" /></g>
);
const Graves: React.FC<{ n: number; t: number }> = ({ n, t }) => (
  <g fill={INK}>
    {Array.from({ length: n }, (_, i) => {
      const x = 60 + (i % 9) * 120 + (Math.floor(i / 9) % 2) * 60, y = 1150 + Math.floor(i / 9) * 110, k = popIn(t - i * 0.8, 5);
      return <g key={i} transform={`translate(${x} ${y}) scale(${k * (0.8 + Math.floor(i / 9) * 0.25)})`}><rect x={-7} y={-110} width={14} height={110} /><rect x={-40} y={-84} width={80} height={14} /></g>;
    })}
  </g>
);
/** Joseph Bazalgette: a slim engineer with big mutton-chop whiskers, holding his rolled plans. */
const Baz: React.FC<{ x: number; feet: number; s: number; mood: Mood; t: number; plans?: number }> = ({ x, feet, s, mood, t, plans = 1 }) => {
  const head = feet - LEG_LEN * s + HEAD.y * s;
  return (
    <g>
      <Man x={x} feet={feet} s={s} mood={mood} t={t} g="point" hat="none" />
      <g transform={`translate(${x} ${head}) scale(${s})`} fill="#7A5232" stroke={INK} strokeWidth={4}>
        <path d="M -60 10 Q -66 62 -34 82 L -40 34 Z" /><path d="M 60 10 Q 66 62 34 82 L 40 34 Z" />
        <path d="M -40 60 Q 0 80 40 60 Q 20 74 0 74 Q -20 74 -40 60 Z" />
      </g>
      {plans > 0 ? <g transform={`translate(${x - 95 * s} ${feet - 250 * s}) rotate(-20) scale(${s * 0.8})`}><rect x={-30} y={-130} width={60} height={260} rx={30} fill="#C8D8F0" stroke={INK} strokeWidth={6} /><path d="M -30 -90 L 30 -90 M -30 90 L 30 90" stroke="#3A6AB0" strokeWidth={6} /></g> : null}
    </g>
  );
};

// ---------------------------------------------------------------- shots: the hook
export const S1: S = ({ t }) => (
  <g>
    <Thames id="g1" mood="brown" t={t} sunY={380} sunX={260} />
    <Flies x={300} y={1240} t={t} />
    <Punch t={t - 2} lines={['LONDON,', '1858']} y={330} size={116} color={GREEN} kicker="THE SMELLIEST CITY ON EARTH" />
    <Lamp x={960} base={1720} s={1.15} t={t} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Thames id="g2" mood="danger" t={t} sunY={380} sunX={820} />
    {crowd('danger', t + 10, 4, 160, 900, 1500, 0.93, 'run', 2)}
    <Lamp x={110} base={1720} s={1.15} t={t} />
    <Fore />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Sky id="g4" mood="brown" sunY={500} sunX={540} />
    <River y={900} t={t * 2} filth={1} boil={1} mood="brown" />
    <Stink x={540} y={1200} t={t} n={6} spread={760} s={1.5} />
    <Flies x={540} y={1000} t={t} n={12} r={300} />
    <Burst t={t - 2} text="NO JOKE!" x={540} y={560} size={96} color="#FFD23F" />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Thames id="g5" mood="brown" t={t} stink={1.4} sunY={380} sunX={820} />
    <Punch t={t - 2} lines={['THE GREAT', 'STINK']} y={320} size={124} color={GREEN} />
    <Lamp x={110} base={1720} s={1.15} t={t} />
  </g>
);
// ---------------------------------------------------------------- the setup
export const S6: S = ({ t }) => (
  <g>
    <Sky id="g6" mood="noon" sunY={380} sunX={760} />
    <FarCity mood="noon" t={t} />
    <g transform="translate(0 260)"><FarCity mood="warm" t={t + 30} /></g>
    <rect x={-200} y={1400} width={W + 400} height={800} fill={MOODS.noon.ground} />
    {crowd('noon', t, 5, 40, 1040, 1500, 0.75, 'stand', 6)}
    <BigNumber t={t - 2} text="2.5M" sub="LONDONERS" y={700} />
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Sky id="g7" mood="brown" sunY={420} sunX={820} />
    <River y={1150} t={t} mood="brown" />
    <Pipe t={t} k={clamp((t - 4) / 6)} />
    <Stink x={720} y={1300} t={t} n={4} spread={300} />
    <Sfx t={t - 8} text="SPLOOSH!" x={680} y={720} rot={-8} size={110} />
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Thames id="g8" mood="brown" t={t} sunY={380} sunX={260} />
    <Punch t={t - 2} lines={['THE THAMES']} y={330} size={120} color={GREEN} kicker="ALL OF IT WENT IN" />
    <Lamp x={970} base={1720} s={1.15} t={t} />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#2A2012" />
    <Glow x={540} y={860} r={700} kind="warm" o={0.5} />
    <Glass t={t - 1} />
    <Punch t={t - 4} lines={['THEY DRANK', 'THIS']} y={300} size={110} color={GREEN} />
  </g>
);
// ---------------------------------------------------------------- the heat
export const S10: S = ({ t }) => (
  <g>
    <Thames id="g10" mood="outback" t={t} stink={0.6} sunY={420} sunX={540} />
    <Thermometer t={t - 2} k={clamp(0.5 + t / 50)} x={850} y={760} />
    <Punch t={t - 2} lines={['HEATWAVE']} y={320} size={124} color="#FFD23F" />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Sky id="g11" mood="outback" sunY={500} sunX={540} />
    <River y={1000} t={t * 2} boil={1} mood="outback" />
    <Stink x={540} y={1250} t={t} n={7} spread={900} s={1.6} />
    <Sfx t={t - 4} text="BLUB BLUB" x={560} y={760} rot={6} size={100} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Thames id="g12" mood="brown" t={t} sunY={420} sunX={820} />
    <Ship t={t} x={540} y={1250} s={1.2} mood="brown" />
    {[400, 560, 700].map((x, i) => <Man key={x} x={x} feet={1190} s={0.42} mood="brown" t={t} g="gag" hat="cap" flip={i === 1} ph={i * 2} />)}
    <Sfx t={t - 4} text="HURK!" x={800} y={640} rot={8} size={100} />
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <Sky id="g13" mood="brown" sunY={380} sunX={260} />
    <FarCity mood="brown" t={t} />
    <River y={1250} t={t} mood="brown" />
    <Stink x={540} y={1500} t={t} n={6} spread={900} />
    <Bridge mood="brown" y={1200} />
    {crowd('brown', t, 5, 90, 990, 1135, 0.6, 'nose', 13)}
    <Haze k={0.8} />
  </g>
);
// ---------------------------------------------------------------- Parliament
export const S14: S = ({ t }) => (
  <g>
    <Sky id="g14" mood="brown" sunY={360} sunX={260} />
    <Parliament x={540} base={1180} s={1.15} c={MOODS.brown.layers[1]} lit={0.4} />
    <River y={1180} t={t} mood="brown" />
    <Stink x={540} y={1300} t={t} n={6} spread={900} s={1.2} />
    <Haze k={1} />
    <Punch t={t - 2} lines={['PARLIAMENT']} y={300} size={110} color="#FFD23F" kicker="RIGHT ON THE RIVER" />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Commons t={t} />
    {crowd('warm', t, 5, 140, 940, 1500, 0.93, 'nose', 15)}
    <Stink x={540} y={1100} t={t} n={5} spread={800} s={1.1} o={0.6} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Commons t={t} wet={clamp((t - 4) / 8)} />
    <Bucket t={t - 2} x={540} y={1260} />
    <Sfx t={t - 10} text="DRIP" x={300} y={760} rot={-8} size={90} />
  </g>
);
// ---------------------------------------------------------------- the fear
export const S17: S = ({ t }) => (
  <g>
    <Commons t={t} wet={1} />
    {crowd('warm', t, 5, 140, 940, 1500, 0.93, 'shock', 17)}
    <Sfx t={t - 2} text="?!" x={540} y={720} size={240} rot={-4} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Thames id="g18" mood="night" t={t} stink={0.5} moon sunY={360} sunX={800} />
    <Miasma t={t - 1} y={800} />
    <Punch t={t - 4} lines={['BAD AIR?']} y={300} size={124} color={GREEN} kicker="THEY THOUGHT" />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Thames id="g19" mood="night" t={t} stink={0.5} moon sunY={360} sunX={800} />
    <Miasma t={20 + t} y={800} />
    <BigX t={t - 1} y={820} />
    <Punch t={t - 1} lines={['WRONG.']} y={300} size={140} color="#FF5A5A" />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1A2410" />
    <circle cx={540} cy={860} r={420} fill="#5A6A2A" stroke="#C8D8A0" strokeWidth={18} />
    <circle cx={540} cy={860} r={420} fill="none" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 5 }, (_, i) => <Germ key={i} x={400 + (i % 3) * 140} y={720 + Math.floor(i / 3) * 220} t={t + i * 11} s={0.9} />)}
    <Glow x={540} y={860} r={600} kind="cool" o={0.4} />
    <Punch t={t - 2} lines={['IN THE', 'WATER']} y={290} size={100} color="#9FE3FF" />
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#120A08" />
    <Glow x={540} y={860} r={700} kind="red" o={0.6} />
    <Germ x={540} y={860} t={t} s={3.2} />
    <Punch t={t - 2} lines={['CHOLERA']} y={300} size={140} color="#FF5A5A" kicker="THE REAL KILLER" />
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    <Sky id="g22" mood="danger" sunY={1050} sunX={760} />
    <path d="M -100 1100 Q 540 1040 1180 1100 L 1180 2000 L -100 2000 Z" fill={INK} />
    <Graves n={27} t={t} />
    <Counter t={t - 2} from={0} to={10000} dur={26} sub="DEAD, 1853-54" y={640} color="#FF5A5A" />
  </g>
);
// ---------------------------------------------------------------- the fix
export const S23: S = ({ t }) => (
  <g>
    <Commons t={t} wet={1} />
    {crowd('warm', t, 5, 140, 940, 1500, 0.93, 'vote', 23)}
    <Sfx t={t - 3} text="AYE!" x={540} y={720} size={150} rot={-6} />
  </g>
);
export const S24: S = ({ t }) => (
  <g>
    <Commons t={t} wet={1} />
    <Calendar t={t - 1} day={String(Math.max(1, Math.min(18, Math.floor(t / 2.2) + 1)))} month="DAYS" year="TO PASS" x={540} y={780} />
  </g>
);
export const S25: S = ({ t }) => (
  <g>
    <Thames id="g25" mood="danger" t={t} sunY={380} sunX={820} />
    <BigNumber t={t - 1} text="18!" sub="DAYS. LIGHTNING FAST." y={700} />
    <Lamp x={110} base={1720} s={1.15} t={t} />
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Thames id="g26" mood="warm" t={t} stink={0.5} sunY={420} sunX={300} />
    <Baz x={600} feet={1170} s={1.4} mood="warm" t={t} />
    <Punch t={t - 2} lines={['JOSEPH', 'BAZALGETTE']} y={300} size={100} color="#FFD23F" kicker="THE ENGINEER" />
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={W + 400} height={2400} fill="#1C2440" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${-100 + i * 50} -200 L ${-100 + i * 50} 2200`} stroke="#2A3A60" strokeWidth={2} />)}
    <SewerMap t={t - 1} k={clamp((t - 4) / 40)} />
    <Counter t={t - 1} from={0} to={1100} dur={16} sub="MILES OF SEWERS" y={470} color="#FFD23F" />
  </g>
);
export const S28: S = ({ t }) => (
  <g>
    <Tunnel t={t} />
    {[280, 540, 800].map((x, i) => <Man key={x} x={x} feet={1480} s={0.9} mood="warm" t={t} g="dig" hat="cap" flip={i === 2} ph={i * 2} />)}
    <Sfx t={t - 4} text="CLANG!" x={760} y={600} rot={8} size={96} />
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    <Tunnel t={t} />
    <Baz x={540} feet={1150} s={0.95} mood="warm" t={t} plans={0} />
    <Punch t={t - 2} lines={['WAY BIGGER', 'THAN NEEDED']} y={300} size={96} color="#FFD23F" kicker="JUST IN CASE" />
  </g>
);
export const S30: S = ({ t }) => (
  <g>
    <Sky id="g30" mood="night" moon sunX={800} sunY={360} />
    <FarCity mood="night" t={t} />
    <Parliament x={500} base={860} s={0.6} c={MOODS.night.layers[1]} lit={0.7} />
    <rect x={-200} y={860} width={W + 400} height={1200} fill="#2A1A10" />
    {Array.from({ length: 6 }, (_, r) => <path key={r} d={`M -200 ${900 + r * 60} L 1300 ${900 + r * 60}`} stroke="#3A2416" strokeWidth={4} />)}
    {/* the sewer still under the city: a lit cross-section */}
    <circle cx={540} cy={1060} r={150} fill="#4A6A7A" stroke="#8A5A32" strokeWidth={34} />
    <Glow x={540} y={1060} r={260} kind="cool" o={0.5} />
    <path d={`M 410 1110 Q 540 ${1094 + Math.sin(t * 0.3) * 8} 670 1110`} stroke="#BFE4F0" strokeWidth={8} fill="none" />
    <Punch t={t - 2} lines={['STILL IN USE', 'TODAY']} y={300} size={100} color="#9FE3FF" />
  </g>
);
// ---------------------------------------------------------------- the end
export const S31: S = ({ t }) => (
  <g>
    <Thames id="g31" mood="night" t={t} stink={0} moon sunX={300} sunY={360} filth={0} />
    <Punch t={t - 2} lines={['YOU GET IT?']} y={320} size={120} color="#FFD23F" />
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    <Thames id="g32" mood="danger" t={t} stink={0.3} moon sunX={300} sunY={360} />
    <Burst t={t - 2} text="I SAID..." x={540} y={560} size={90} color="#FFD23F" />
    <Punch t={t - 6} lines={['YOU GET IT?']} y={760} size={120} color="#FF5A5A" />
  </g>
);
export const S33: S = ({ t }) => (
  <g>
    <Thames id="g33" mood="noon" t={t} stink={0} filth={0} sunY={400} sunX={760} />
    {crowd('noon', t, 5, 120, 960, 1500, 0.9, 'stand', 33)}
    <Punch t={t - 2} lines={['A SMELL FIXED', 'A WHOLE CITY']} y={300} size={90} color="#9FE3FF" />
    <Lamp x={120} base={1720} s={1.15} t={t} />
  </g>
);
export const S34: S = ({ t }) => (
  <g>
    <Tunnel t={t} water={1} light="#BFE4F0" />
    <Punch t={t - 2} lines={["THAT'S REAL."]} y={300} size={120} color="#FFD23F" />
  </g>
);
export const S35: S = ({ t }) => (
  <g>
    <Thames id="g35" mood="night" t={t} stink={0.4} moon sunX={800} sunY={360} />
    {crowd('night', t, 5, 80, 1000, 1500, 0.9, 'nose', 35)}
    <Punch t={t - 3} lines={['FOLLOW FOR', 'STRANGE HISTORY']} y={300} size={80} color="#C9A2FF" />
    <Lamp x={960} base={1720} s={1.15} t={t} />
  </g>
);

// ---------------------------------------------------------------- "wide, then close" pairs
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S3 = close(S2, 540, 1350, 1.6, 30);    // "ran away": on the running crowd
export const S36 = close(S35, 540, 1350, 1.5, 40);  // "strange history": the crowd
export const S37 = close(S13, 540, 1050, 1.7, 30);  // "rags over their noses"
export const S38 = close(S15, 540, 1250, 1.6, 30);  // "just to breathe"
export const S39 = close(S7, 400, 1000, 1.5, 30);   // "straight into": the gush
export const S40 = close(S27, 540, 900, 1.4, 50);   // "over a thousand miles": the map
