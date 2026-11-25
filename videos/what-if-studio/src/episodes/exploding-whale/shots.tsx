import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, Mood, MOODS, Sky, Punch, Burst, Counter, BigNumber, Calendar, popIn, clamp, lerp, easeOut, Glow, INK } from '../molasses/kit';
import { FxDefs, Rays, Clouds, Shadow, Man } from '../great-stink/shots';
import words from './words.json';

// "The Exploding Whale" (Florence, Oregon, 1970): a native 9:16 story Short in the Dancing Plague v2 look: one colour mood
// per scene, layered flat silhouettes with a glowing rim, colour only on the key thing (the pink-white blubber, the red
// dynamite, the new car). Things appear on their spoken word: since(f, 'word', n) = frames since the n-th time it is said.
// Key content sits between y 280 and 1150 (captions below).

type S = React.FC<ShotProps>;
const scr = { mixBlendMode: 'screen' as const };
const BLUB = '#F2D6C8', SKIN = '#454B58', DYN = '#D8322A', CAR = '#2F8FA0';
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const since = (f: number, word: string, n = 0) => {
  const hits = (words as { w: string; s: number }[]).filter((x) => norm(x.w) === norm(word));
  const w = hits[Math.min(n, hits.length - 1)];
  return w ? f - Math.round(w.s * 30) : 0;
};
const Txt: React.FC<{ x: number; y: number; s: number; c?: string; children: React.ReactNode; a?: 'middle' | 'start'; rot?: number }> = ({ x, y, s, c = '#FFF8EA', children, a = 'middle', rot = 0 }) => (
  <text x={x} y={y} textAnchor={a} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} fontFamily={FONT.title} fontWeight={800} fontSize={s} fill={c} stroke="#140A12" strokeWidth={s * 0.12} paintOrder="stroke" strokeLinejoin="round">{children}</text>
);
const Speech: React.FC<{ t: number; x: number; y: number; children: React.ReactNode; flip?: boolean }> = ({ t, x, y, children, flip }) => (t < 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 6)})`}>
    <path d={`M -190 -130 Q -210 -150 -190 -170 L 190 -170 Q 210 -150 190 -130 L 190 90 Q 210 110 190 130 L ${flip ? 60 : -20} 130 L ${flip ? 100 : -80} 210 L ${flip ? 0 : -60} 130 L -190 130 Q -210 110 -190 90 Z`} fill="#FFF8EA" stroke={INK} strokeWidth={8} />
    {children}
  </g>
);
const BigX: React.FC<{ t: number; x?: number; y?: number; s?: number }> = ({ t, x = 540, y = 820, s = 1 }) => (t < 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 5) * s})`}><path d="M -240 -240 L 240 240 M 240 -240 L -240 240" stroke="#140A12" strokeWidth={80} strokeLinecap="round" /><path d="M -240 -240 L 240 240 M 240 -240 L -240 240" stroke="#E0283A" strokeWidth={54} strokeLinecap="round" /></g>
);

// ---------------------------------------------------------------- the coast
/** Rolling sea from the horizon to the shore, with moving wave crests and sun glitter. */
const Sea: React.FC<{ mood: Mood; t: number; y?: number; to?: number }> = ({ mood, t, y = 900, to = 1080 }) => {
  const m = MOODS[mood];
  return (
    <g>
      <rect x={-300} y={y} width={W + 600} height={to - y + 40} fill={m.layers[1]} />
      <rect x={-300} y={y} width={W + 600} height={(to - y) * 0.4} fill={m.layers[0]} opacity={0.55} />
      {Array.from({ length: 7 }, (_, r) => { const yy = y + 12 + r * r * ((to - y) / 50) + r * 6, sh = (t * (0.6 + r * 0.25) + r * 40) % 120;
        return <path key={r} d={Array.from({ length: 12 }, (_, k) => `M ${-260 + k * 120 + sh} ${yy} q 30 ${-4 - r} 60 0`).join(' ')} stroke={m.rim} strokeOpacity={0.35 + r * 0.05} strokeWidth={2 + r * 0.6} fill="none" />; })}
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={(random(`gl${i}`) * W + t * 0.4) % W} y={y + 6 + random(`gy${i}`) * (to - y) * 0.5} width={14 + random(`gw${i}`) * 30} height={3} fill={m.rim} opacity={0.25 + 0.3 * Math.abs(Math.sin(t * 0.15 + i))} style={scr} />)}
      {/* surf line on the sand */}
      <path d={`M -300 ${to} Q 200 ${to - 16 + Math.sin(t * 0.08) * 8} 540 ${to - 4} T ${W + 300} ${to}`} stroke="#FFF8EA" strokeOpacity={0.6} strokeWidth={10} fill="none" />
    </g>
  );
};
/** Sand from y down, with ripples and dune grass tufts. */
const Sand: React.FC<{ mood: Mood; y?: number; tufts?: number }> = ({ mood, y = 1080, tufts = 8 }) => {
  const m = MOODS[mood];
  return (
    <g>
      <rect x={-300} y={y} width={W + 600} height={1400} fill={m.layers[2]} />
      <rect x={-300} y={y} width={W + 600} height={60} fill={m.layers[1]} opacity={0.5} />
      {Array.from({ length: 10 }, (_, r) => <path key={r} d={`M -300 ${y + 40 + r * r * 8} Q 300 ${y + 30 + r * r * 8} 700 ${y + 44 + r * r * 8} T ${W + 300} ${y + 36 + r * r * 8}`} stroke={m.ground} strokeOpacity={0.35} strokeWidth={3 + r * 0.6} fill="none" />)}
      {Array.from({ length: tufts }, (_, i) => { const x = random(`tx${i}${y}`) * W, yy = y + 40 + random(`ty${i}`) * 300;
        return <g key={i}>{Array.from({ length: 6 }, (_, k) => <path key={k} d={`M ${x} ${yy} q ${(k - 3) * 8} -40 ${(k - 2.5) * 16} -70`} stroke={INK} strokeWidth={4} fill="none" />)}</g>; })}
    </g>
  );
};
/** A far headland with Heceta Head's lighthouse (white tower, lit lamp) and its beam. */
const Headland: React.FC<{ mood: Mood; x?: number; y?: number; s?: number; t: number; beam?: boolean }> = ({ mood, x = 830, y = 900, s = 1, t, beam }) => {
  const m = MOODS[mood];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -460 0 Q -300 -40 -180 -120 Q -60 -210 80 -230 Q 220 -240 380 -140 L 520 0 Z" fill={m.layers[0]} stroke={m.rim} strokeOpacity={0.4} strokeWidth={3} />
      <g transform="translate(40 -230)">
        <path d="M -22 0 L -16 -120 L 16 -120 L 22 0 Z" fill="#F4EEE2" stroke={INK} strokeWidth={4} />
        <rect x={-22} y={-150} width={44} height={30} fill={INK} /><circle cx={0} cy={-135} r={12} fill="#FFE7A0" />
        <path d="M -26 -150 L 0 -176 L 26 -150 Z" fill={INK} />
        <Glow x={0} y={-135} r={120} kind="warm" o={0.6} />
        {beam ? <path d={`M 0 -135 L ${-700 * Math.cos(t * 0.05)} ${-170} L ${-700 * Math.cos(t * 0.05)} ${-100} Z`} fill="#FFF2C0" opacity={0.18} style={scr} /> : null}
      </g>
    </g>
  );
};
/** The whole beach: sky, sun rays, clouds, the headland, the sea and the sand. */
const Beach: React.FC<{ id: string; mood: Mood; t: number; sunX?: number; sunY?: number; horizon?: number; shore?: number; head?: boolean; moon?: boolean }> = ({ id, mood, t, sunX = 760, sunY = 620, horizon = 900, shore = 1080, head = true, moon }) => (
  <g>
    <Sky id={id} mood={mood} sunX={sunX} sunY={sunY} moon={moon} />
    <Rays x={sunX} y={sunY} t={t} o={0.22} n={8} spread={120} dir={90} />
    <Clouds mood={mood} t={t} y={480} o={0.8} />
    {head ? <Headland mood={mood} t={t} y={horizon + 4} beam={mood === 'night' || mood === 'cold'} /> : null}
    <Sea mood={mood} t={t} y={horizon} to={shore} />
    <Sand mood={mood} y={shore} />
  </g>
);

// ---------------------------------------------------------------- the whale
/** A dead sperm whale lying on its side, facing left: the huge square head, the narrow jaw, wrinkled skin, flukes.
 *  rim = the scene's glow; open 0..1 splits it open (the blast). */
const Whale: React.FC<{ x: number; y: number; s: number; rim: string; open?: number; t?: number; dead?: boolean }> = ({ x, y, s, rim, open = 0, t = 0, dead = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} style={{ filter: `drop-shadow(0 0 8px ${rim})` }}>
    <ellipse cx={40} cy={10} rx={560} ry={40} fill="#000" opacity={0.35} />
    <g transform={`translate(${-open * 60} ${-open * 20}) rotate(${-open * 6})`}>
      {/* head block and body */}
      <path d="M -470 -40 Q -500 -250 -380 -270 L -60 -280 Q 120 -270 260 -190 Q 380 -120 470 -70 L 470 -20 Q 300 0 -60 6 L -440 6 Q -480 -10 -470 -40 Z" fill={SKIN} stroke={rim} strokeWidth={4} />
      {/* wrinkles */}
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${-280 + i * 52} -250 q 14 120 -4 230`} stroke="#2E333D" strokeWidth={5} fill="none" opacity={0.7} />)}
      <path d="M -460 -24 Q -300 -6 -120 -10" stroke="#2A2F38" strokeWidth={10} fill="none" />
      {/* lower jaw with a row of teeth */}
      <path d="M -440 4 Q -300 40 -120 20 L -120 8 Q -300 26 -440 -6 Z" fill="#5A6070" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-420 + i * 32} ${10 + i * 1.5} l 6 -14 l 6 14 Z`} fill="#F4EEE2" />)}
      {/* eye */}
      {dead ? <g stroke="#F4EEE2" strokeWidth={8} strokeLinecap="round"><path d="M -150 -60 l 24 24 M -126 -60 l -24 24" /></g> : <circle cx={-138} cy={-48} r={10} fill="#F4EEE2" />}
      {/* flipper */}
      <path d="M -40 -20 Q 20 40 90 36 Q 40 0 10 -30 Z" fill="#3A3F4A" stroke={rim} strokeWidth={3} />
    </g>
    {/* tail stock and flukes */}
    <g transform={`translate(${open * 60} ${-open * 30}) rotate(${open * 8} 470 -50)`}>
      <path d="M 440 -80 Q 540 -70 600 -60 L 600 -30 Q 540 -24 440 -20 Z" fill={SKIN} stroke={rim} strokeWidth={4} />
      <path d="M 600 -46 Q 660 -150 720 -170 Q 700 -90 640 -46 Q 700 -10 720 70 Q 660 40 600 -40 Z" fill={SKIN} stroke={rim} strokeWidth={4} />
    </g>
    {open > 0 ? <ellipse cx={240} cy={-120} rx={140 * open} ry={110 * open} fill={BLUB} stroke="#C88070" strokeWidth={8} /> : null}
  </g>
);
/** A chunk of blubber: dark skin on one side, pale fat on the other, seeded shape. */
const Chunk: React.FC<{ x: number; y: number; s?: number; rot?: number; seed?: number }> = ({ x, y, s = 1, rot = 0, seed = 0 }) => {
  const n = 9, pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, r = 40 * (0.75 + random(`ck${seed}${i}`) * 0.45); return [Math.cos(a) * r * 1.3, Math.sin(a) * r]; });
  const d = 'M ' + pts.map((p) => p.join(' ')).join(' L ') + ' Z';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={d} fill={BLUB} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} L ${pts[3][0]} ${pts[3][1]} Q 0 0 ${pts[0][0]} ${pts[0][1]} Z`} fill={SKIN} />
      <ellipse cx={-10} cy={-6} rx={14} ry={6} fill="#FFF" opacity={0.5} />
    </g>
  );
};
/** Blubber falling from the sky (k 0..1 how far into the rain), seeded. */
const Rain: React.FC<{ t: number; n?: number; seed?: string; s?: number; ground?: number }> = ({ t, n = 18, seed = 'r', s = 1, ground = 1500 }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const x = random(`${seed}x${i}`) * (W + 200) - 100, d = random(`${seed}d${i}`) * 30, sp = 22 + random(`${seed}s${i}`) * 18;
    const y = Math.min(ground - random(`${seed}g${i}`) * 300, -200 + (t - d) * sp);
    return t - d < 0 ? null : <Chunk key={i} x={x} y={y} s={s * (0.6 + random(`${seed}z${i}`) * 0.9)} rot={(t - d) * 8 * (i % 2 ? 1 : -1)} seed={i} />;
  })}</g>
);

// ---------------------------------------------------------------- props
const Dynamite: React.FC<{ x: number; y: number; s?: number; n?: number; lit?: number }> = ({ x, y, s = 1, n = 3, lit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${(i - (n - 1) / 2) * 38} 0)`}><rect x={-18} y={-120} width={36} height={130} rx={8} fill={DYN} stroke={INK} strokeWidth={5} /><rect x={-18} y={-80} width={36} height={16} fill="#F2E6C8" opacity={0.8} /></g>)}
    <rect x={-n * 20} y={-50} width={n * 40} height={14} fill="#3A2A1A" />
    <path d={`M 0 -120 q 20 -40 -6 -70`} stroke="#5A4A3A" strokeWidth={5} fill="none" />
    {lit > 0 ? <g><circle cx={-6} cy={-190} r={14} fill="#FFE07A" /><Glow x={-6} y={-190} r={80} kind="warm" o={0.8} /></g> : null}
  </g>
);
const Crate: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-110} width={160} height={110} fill="#A8743A" stroke={INK} strokeWidth={6} />
    <path d="M -80 -110 L 80 0 M 80 -110 L -80 0" stroke="#7A5226" strokeWidth={6} />
    <rect x={-66} y={-74} width={132} height={36} fill="#F2E6C8" stroke={INK} strokeWidth={3} />
    <text x={0} y={-48} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={24} fill={DYN}>DYNAMITE</text>
  </g>
);
/** A blasting machine: a wooden box with a T-handle plunger (k 0..1 pushed down). */
const Plunger: React.FC<{ x: number; y: number; s?: number; k?: number }> = ({ x, y, s = 1, k = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-14} y={-230 + k * 120} width={28} height={180} fill="#8A8A92" stroke={INK} strokeWidth={5} />
    <rect x={-120} y={-250 + k * 120} width={240} height={34} rx={14} fill="#5A3A22" stroke={INK} strokeWidth={6} />
    <rect x={-140} y={-120} width={280} height={170} rx={10} fill="#8A5A32" stroke={INK} strokeWidth={7} />
    <text x={0} y={-30} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#F2E6C8">DANGER</text>
    {[-90, 90].map((cx) => <circle key={cx} cx={cx} cy={20} r={12} fill="#D8B040" stroke={INK} strokeWidth={4} />)}
    <path d="M 90 30 Q 200 80 400 60" stroke={DYN} strokeWidth={8} fill="none" />
  </g>
);
/** A seagull standing (flap 0) or flying (flap > 0 = wing beat phase). */
const Gull: React.FC<{ x: number; y: number; s?: number; flap?: number; flip?: boolean; lick?: number }> = ({ x, y, s = 1, flap = 0, flip, lick = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {flap > 0 ? (
      <g>
        <ellipse cx={0} cy={0} rx={46} ry={16} fill="#F4F4F0" stroke={INK} strokeWidth={4} />
        <path d={`M -10 -4 Q -60 ${-40 * Math.sin(flap)} -120 ${-20 * Math.sin(flap) - 10}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M 10 -4 Q 60 ${-40 * Math.sin(flap)} 120 ${-20 * Math.sin(flap) - 10}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={-44} cy={-6} r={14} fill="#F4F4F0" stroke={INK} strokeWidth={4} /><path d="M -58 -6 l -22 4 l 22 4 Z" fill="#F2B030" />
      </g>
    ) : (
      <g>
        <path d="M -10 0 L -14 40 M 10 0 L 14 40" stroke="#F2B030" strokeWidth={6} />
        <ellipse cx={0} cy={-30} rx={50} ry={32} fill="#F4F4F0" stroke={INK} strokeWidth={5} />
        <path d="M 10 -50 Q 60 -40 64 -10 Q 30 -14 0 -22 Z" fill="#8A929C" stroke={INK} strokeWidth={4} />
        <circle cx={-40} cy={-70} r={24} fill="#F4F4F0" stroke={INK} strokeWidth={5} />
        <circle cx={-48} cy={-76} r={5} fill={INK} />
        <path d="M -62 -68 l -30 6 l 30 6 Z" fill="#F2B030" stroke={INK} strokeWidth={3} />
        {lick > 0 ? <path d={`M -86 -62 q ${-8 - 6 * Math.sin(lick)} 6 -4 10`} stroke="#E86A7A" strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
      </g>
    )}
  </g>
);
/** A 1970 sedan in profile (crush 0..1 flattens the roof). */
const Car: React.FC<{ x: number; y: number; s?: number; c?: string; crush?: number; flip?: boolean }> = ({ x, y, s = 1, c = CAR, crush = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={6} rx={300} ry={18} fill="#000" opacity={0.35} />
    <path d="M -290 -40 L -280 -100 Q -270 -120 -200 -124 L 250 -124 Q 300 -120 300 -90 L 300 -40 Z" fill={c} stroke={INK} strokeWidth={7} />
    <path d={`M -170 -124 L ${-120 + crush * 30} ${-210 + crush * 80} L ${130 - crush * 30} ${-210 + crush * 80} L 190 -124 Z`} fill={c} stroke={INK} strokeWidth={7} />
    <path d={`M -140 -128 L ${-108 + crush * 30} ${-196 + crush * 74} L 0 ${-196 + crush * 74} L 0 -128 Z M 20 -128 L 20 ${-196 + crush * 74} L ${118 - crush * 30} ${-196 + crush * 74} L 164 -128 Z`} fill="#BFE6F2" opacity={0.85 - crush * 0.4} stroke={INK} strokeWidth={4} />
    <path d="M -290 -76 L 300 -76" stroke="#E8F0F4" strokeWidth={6} opacity={0.8} />
    {[-180, 190].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={50} fill={INK} /><circle cx={wx} cy={-30} r={22} fill="#C8C8D0" /></g>)}
    <rect x={288} y={-110} width={16} height={22} fill="#FFF2B0" />
    {crush > 0.3 ? <Chunk x={0} y={-150 + crush * 40} s={2.2} seed={9} /> : null}
  </g>
);
/** A 1970 highway department dump truck, orange, in profile. */
const Truck: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={330} ry={20} fill="#000" opacity={0.35} />
    <path d="M -320 -50 L -320 -220 L 60 -220 L 80 -50 Z" fill="#E8862A" stroke={INK} strokeWidth={7} />
    <path d="M 80 -50 L 90 -240 L 230 -240 L 310 -150 L 320 -50 Z" fill="#E8862A" stroke={INK} strokeWidth={7} />
    <path d="M 110 -220 L 210 -220 L 280 -150 L 110 -150 Z" fill="#BFE6F2" stroke={INK} strokeWidth={5} />
    <rect x={-300} y={-180} width={340} height={56} fill="#F2E6C8" stroke={INK} strokeWidth={4} />
    <text x={-130} y={-140} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill={INK}>HIGHWAY DEPT.</text>
    {[-230, -80, 230].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={52} fill={INK} /><circle cx={wx} cy={-30} r={22} fill="#C8C8D0" /></g>)}
    <rect x={150} y={-268} width={50} height={20} fill="#F2B030" stroke={INK} strokeWidth={3} /><Glow x={175} y={-258} r={60} kind="warm" o={0.6} />
  </g>
);
/** A rough Oregon outline (neon). */
const OREGON = 'M 120 300 L 880 300 L 900 380 L 860 470 L 880 560 L 880 800 L 120 800 L 110 700 L 90 600 L 120 500 L 100 420 Z';
const Tape: React.FC<{ x0: number; x1: number; y: number; k: number; label: string }> = ({ x0, x1, y, k, label }) => {
  const xe = lerp(x0, x1, easeOut(clamp(k)));
  return (
    <g>
      <rect x={x0} y={y - 22} width={xe - x0} height={44} fill="#F2C230" stroke={INK} strokeWidth={5} />
      {Array.from({ length: Math.floor((xe - x0) / 30) }, (_, i) => <path key={i} d={`M ${x0 + i * 30} ${y - 22} l 0 ${i % 5 ? 16 : 28}`} stroke={INK} strokeWidth={3} />)}
      <rect x={x0 - 70} y={y - 50} width={80} height={100} rx={16} fill="#D8322A" stroke={INK} strokeWidth={6} />
      {k > 0.95 ? <Txt x={(x0 + x1) / 2} y={y - 50} s={92} c="#F2C230">{label}</Txt> : null}
    </g>
  );
};
const Weight: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -70 0 L -50 -110 L 50 -110 L 70 0 Z" fill="#4A4A52" stroke={INK} strokeWidth={6} /><path d="M -24 -110 Q 0 -150 24 -110" stroke={INK} strokeWidth={12} fill="none" />
    <text x={0} y={-36} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={34} fill="#F2E6C8">1 TON</text></g>
);
/** A cloud with a bellyache face (sick k 0..1). */
const SickCloud: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.2) * 6}) scale(${s})`}>
    {[[-150, 20, 110], [-50, -50, 140], [90, -30, 130], [190, 30, 100], [20, 50, 130]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#C8D0D8" stroke={INK} strokeWidth={8} />)}
    {[[-150, 20, 100], [-50, -50, 130], [90, -30, 120], [190, 30, 90], [20, 50, 120]].map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#C8D0D8" />)}
    <path d="M -80 -20 q 20 14 40 0 M 40 -20 q 20 14 40 0" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d={`M -50 60 q 50 ${-30 - 6 * Math.sin(t * 0.4)} 100 0`} stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
    <ellipse cx={-120} cy={30} rx={30} ry={16} fill="#9AC870" opacity={0.7} /><ellipse cx={150} cy={30} rx={30} ry={16} fill="#9AC870" opacity={0.7} />
    <path d="M -30 -110 q 30 -30 60 0" stroke="#7AA04A" strokeWidth={8} fill="none" opacity={0.8} />
  </g>
);
const Dozer: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-70} width={340} height={70} rx={34} fill={INK} />{Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-170 + i * 56} cy={-35} r={22} fill="#5A5A62" />)}
    <rect x={-170} y={-200} width={260} height={130} fill="#F2B030" stroke={INK} strokeWidth={6} /><rect x={-90} y={-300} width={140} height={100} fill="#F2B030" stroke={INK} strokeWidth={6} />
    <rect x={-74} y={-284} width={108} height={70} fill="#BFE6F2" stroke={INK} strokeWidth={4} />
    <path d="M 140 -150 L 230 -120 L 240 0 L 160 -10 Z" fill="#8A8A92" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-260} width={20} height={70} fill={INK} />{Array.from({ length: 3 }, (_, i) => <circle key={i} cx={-140 + Math.sin(t * 0.2 + i) * 10} cy={-290 - i * 40 - (t % 20)} r={16 + i * 6} fill="#6A6A72" opacity={0.5 - i * 0.12} />)}
  </g>
);
const Mound: React.FC<{ x: number; y: number; w: number; h: number; c: string }> = ({ x, y, w, h, c }) => <path d={`M ${x - w} ${y} Q ${x - w * 0.4} ${y - h} ${x} ${y - h} Q ${x + w * 0.5} ${y - h} ${x + w} ${y} Z`} fill={c} stroke={INK} strokeWidth={6} />;
/** A wooden roadside sign on two posts. */
const Board: React.FC<{ x: number; y: number; w: number; h: number; lines: string[]; size: number; bg?: string; fg?: string; posts?: number }> = ({ x, y, w, h, lines, size, bg = '#2E6A4A', fg = '#F4EEE2', posts = 260 }) => (
  <g>
    {[-w * 0.32, w * 0.32].map((dx) => <rect key={dx} x={x + dx - 12} y={y} width={24} height={posts} fill="#6A4428" stroke={INK} strokeWidth={4} />)}
    <rect x={x - w / 2} y={y - h} width={w} height={h + 10} rx={16} fill={bg} stroke={INK} strokeWidth={8} />
    <rect x={x - w / 2 + 14} y={y - h + 14} width={w - 28} height={h - 18} rx={10} fill="none" stroke={fg} strokeWidth={4} />
    {lines.map((l, i) => <text key={i} x={x} y={y - h + 20 + (i + 1) * (h - 20) / (lines.length + 0.3)} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size} fill={fg}>{l}</text>)}
  </g>
);
/** A crowd of onlookers on the dunes (silhouettes, hats). */
const Crowd: React.FC<{ mood: Mood; t: number; n: number; x0: number; x1: number; feet: number; s: number; g?: 'stand' | 'run' | 'shock' | 'nose' | 'point'; seed?: number; flip?: boolean }> = ({ mood, t, n, x0, x1, feet, s, g = 'stand', seed = 0, flip }) => (
  <g>{Array.from({ length: n }, (_, i) => { const x = lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)) + (random(`cr${seed}${i}`) - 0.5) * 50;
    return <Man key={i} x={x} feet={feet + (i % 3) * 14} s={s * (0.9 + (i % 3) * 0.06)} mood={mood} t={t + i * 7} g={g} hat={(['bowler', 'cap', 'none'] as const)[(i + seed) % 3]} flip={flip ?? i % 2 === 0} ph={i} />; })}</g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (   // HOOK: the blast at dusk, blubber flying at the camera
  <g>
    <Beach id="w1" mood="danger" t={t} sunX={300} sunY={700} />
    <Whale x={540} y={1110} s={0.9} rim={MOODS.danger.rim} open={clamp(0.6 + t / 30)} t={t} />
    {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={560 + (i - 2) * 90} cy={880 - t * 3 - i * 60} r={160 + t * 4 + i * 40} fill={['#FFE07A', '#FF9A3A', '#C8402A', '#5A3A3A', '#3A2A2A'][i]} opacity={0.75 - i * 0.1} />)}
    <Glow x={560} y={900} r={700} kind="warm" o={0.9} />
    {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, k = (t + 6) / 40; return <Chunk key={i} x={540 + Math.cos(a) * 900 * k} y={900 + Math.sin(a) * 700 * k - 200 * k} s={0.8 + k * 2.4} rot={t * 6 + i * 40} seed={i} />; })}
    <Punch t={t + 6} lines={['THEY BLEW', 'UP A WHALE']} y={300} size={124} color="#FFB03A" kicker="OREGON, 1970" />
  </g>
);
export const S2: S = ({ t }) => (   // neon Oregon, Florence pinned
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill="#0C1426" />
    <path d={OREGON} transform="translate(0 200)" fill="#14243E" stroke="#5AD8FF" strokeWidth={10} style={{ filter: 'drop-shadow(0 0 18px #5AD8FF)' }} strokeDasharray="4000" strokeDashoffset={4000 * (1 - clamp(t / 20))} />
    <Txt x={540} y={760} s={120} c="#5AD8FF">OREGON</Txt>
    {t > 22 ? <g transform={`translate(190 ${920 - popIn(t - 22) * 30})`}><circle r={22} fill="#FF5A4A" /><Glow x={0} y={0} r={90} kind="red" o={0.8} /><Txt x={0} y={-40} s={54}>FLORENCE</Txt></g> : null}
  </g>
);
export const S3: S = ({ t, f }) => (   // "On purpose": the official, thumbs up, stamp
  <g>
    <Beach id="w3" mood="noon" t={t} />
    <Man x={540} feet={1700} s={2.1} mood="noon" t={t} g="vote" hat="cap" />
    {since(f, 'purpose') >= 0 ? <g transform={`translate(540 520) rotate(-10) scale(${popIn(since(f, 'purpose'), 5)})`}><rect x={-300} y={-80} width={600} height={160} fill="none" stroke="#D8322A" strokeWidth={16} /><Txt x={0} y={34} s={100} c="#D8322A">ON PURPOSE</Txt></g> : null}
  </g>
);
export const S4: S = ({ t, f }) => (   // half a ton of dynamite: the stack and a counter
  <g>
    <Beach id="w4" mood="danger" t={t} head={false} />
    {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 - r }, (_, k) => <Dynamite key={r + '-' + k} x={290 + k * 125 + r * 62} y={1180 - r * 130} s={0.9} />))}
    <Glow x={540} y={1000} r={500} kind="red" o={0.4} />
    <Counter t={since(f, 'half')} from={0} to={1000} dur={36} sub="POUNDS OF DYNAMITE" y={520} color="#FFB03A" />
  </g>
);
export const S5: S = ({ t, f }) => (   // not a tall tale: an old fisherman with a fish as big as he is, a red X
  <g>
    <Sky id="w5" mood="warm" sunX={760} sunY={520} />
    <rect x={-300} y={1100} width={W + 600} height={900} fill="#3A2416" />
    <rect x={-300} y={1080} width={W + 600} height={30} fill="#6A4428" />
    <Man x={330} feet={1520} s={1.6} mood="warm" t={t} g="shock" hat="cap" />
    <g transform="translate(700 980) rotate(-8)"><path d="M -230 0 Q -60 -120 160 -20 L 260 -90 L 240 0 L 260 90 L 160 20 Q -60 120 -230 0 Z" fill="#6A8AA0" stroke={INK} strokeWidth={8} /><circle cx={-170} cy={-10} r={12} fill="#FFF" /></g>
    <Txt x={540} y={420} s={110} c="#FFD23F">TALL TALE?</Txt>
    <BigX t={since(f, 'tall') + 4} y={900} s={1.1} />
  </g>
);
export const S6: S = ({ t, f }) => (   // it's on film: a 1970 newsman and his camera, a film strip
  <g>
    <Beach id="w6" mood="noon" t={t} />
    <g transform="translate(720 1460)">
      <path d="M -60 0 L 0 -320 L 60 0 M 0 -320 L 0 0" stroke={INK} strokeWidth={14} />
      <rect x={-120} y={-460} width={220} height={150} rx={12} fill="#3A3A42" stroke={INK} strokeWidth={6} />
      <circle cx={-60} cy={-500} r={50} fill="#4A4A52" stroke={INK} strokeWidth={6} /><circle cx={40} cy={-500} r={50} fill="#4A4A52" stroke={INK} strokeWidth={6} />
      <rect x={100} y={-420} width={90} height={70} fill="#2A2A30" stroke={INK} strokeWidth={6} /><circle cx={190} cy={-385} r={30} fill="#9AD8F0" stroke={INK} strokeWidth={6} />
      <circle cx={-110} cy={-430} r={10} fill="#FF3A3A" opacity={Math.sin(t * 0.4) > 0 ? 1 : 0.2} />
    </g>
    <Man x={330} feet={1560} s={1.7} mood="noon" t={t} g="point" hat="none" />
    <g transform={`translate(${-200 + (t * 8) % 300} 420)`}>{Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${i * 260} 0)`}><rect x={0} y={-90} width={250} height={180} fill="#1A1A1E" />{[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={14 + k * 40} y={-80} width={20} height={14} fill="#F2E6C8" />)}{[0, 1, 2, 3, 4, 5].map((k) => <rect key={'b' + k} x={14 + k * 40} y={66} width={20} height={14} fill="#F2E6C8" />)}<rect x={20} y={-56} width={210} height={112} fill={i % 2 ? '#8A6A4A' : '#5A6A7A'} /></g>)}</g>
    {since(f, 'film') >= 0 ? <Punch t={since(f, 'film')} lines={["IT'S ON FILM"]} y={640} size={110} color="#FFD23F" /> : null}
  </g>
);
export const S7: S = ({ t }) => (   // November 1970: a calendar over the grey sea
  <g>
    <Beach id="w7" mood="cold" t={t} sunY={560} />
    <Calendar t={t} day="12" month="NOVEMBER" year="1970" x={540} y={700} />
  </g>
);
export const S8: S = ({ t, f }) => (   // Florence at dawn: houses on the river mouth, boats, the lighthouse
  <g>
    <Sky id="w8" mood="warm" sunX={300} sunY={760} />
    <Rays x={300} y={760} t={t} o={0.3} n={9} spread={130} dir={90} />
    <Headland mood="warm" t={t} x={850} y={930} s={0.8} />
    {Array.from({ length: 9 }, (_, i) => { const x = 40 + i * 120, h = 90 + (i % 3) * 40; return <g key={i}><rect x={x} y={1000 - h} width={100} height={h} fill={MOODS.warm.layers[1]} stroke={MOODS.warm.rim} strokeOpacity={0.4} strokeWidth={2} /><path d={`M ${x - 8} ${1000 - h} L ${x + 50} ${960 - h} L ${x + 108} ${1000 - h} Z`} fill={MOODS.warm.layers[2]} />{[0, 1].map((k) => <rect key={k} x={x + 18 + k * 44} y={1000 - h + 24} width={22} height={26} fill="#FFD27A" opacity={random(`fw${i}${k}`) > 0.4 ? 0.9 : 0.2} />)}</g>; })}
    <Sea mood="warm" t={t} y={1000} to={1500} />
    {[[260, 1120], [620, 1180], [880, 1100]].map(([bx, by], i) => <g key={i} transform={`translate(${bx + Math.sin(t * 0.05 + i) * 10} ${by + Math.sin(t * 0.1 + i) * 6})`}><path d="M -90 0 L 90 0 L 70 40 L -70 40 Z" fill={INK} /><rect x={-4} y={-120} width={8} height={120} fill={INK} /><path d="M 4 -110 L 70 -20 L 4 -20 Z" fill="#F2E6C8" /></g>)}
    {since(f, 'Florence') >= 0 ? <Punch t={since(f, 'Florence')} lines={['FLORENCE,', 'OREGON']} y={330} size={104} color="#FFD23F" /> : null}
  </g>
);
export const S9: S = ({ t, f }) => (   // worm's-eye up the whale's flank; the tape runs to 45 FT
  <g>
    <Sky id="w9" mood="cold" sunX={800} sunY={420} />
    <Clouds mood="cold" t={t} y={420} />
    <g transform="translate(540 1500) scale(2.6) rotate(-14)"><Whale x={0} y={0} s={1} rim={MOODS.cold.rim} /></g>
    <Sand mood="cold" y={1420} tufts={4} />
    <Tape x0={120} x1={960} y={560} k={since(f, 'forty') / 26} label="45 FEET" />
  </g>
);
export const S10: S = ({ t, f }) => (   // the sperm whale, dead on the beach
  <g>
    <Beach id="w10" mood="cold" t={t} />
    <Whale x={520} y={1180} s={0.78} rim={MOODS.cold.rim} />
    {Array.from({ length: 3 }, (_, i) => <Gull key={i} x={200 + i * 260} y={1210 + (i % 2) * 30} s={0.6} flip={i === 1} />)}
    {since(f, 'dead') >= 0 ? <Punch t={since(f, 'dead')} lines={['SPERM WHALE', 'WASHES UP DEAD']} y={340} size={88} color="#9FE3FF" /> : null}
  </g>
);
export const S11: S = ({ t, f }) => (   // top-down: the whale and eight one-ton weights
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill={MOODS.cold.layers[2]} />
    {Array.from({ length: 14 }, (_, r) => <path key={r} d={`M -300 ${300 + r * 90} Q 540 ${280 + r * 90} ${W + 300} ${300 + r * 90}`} stroke={MOODS.cold.ground} strokeOpacity={0.4} strokeWidth={4} fill="none" />)}
    <g transform="translate(560 640) scale(0.9)"><path d="M -470 -100 Q -500 -170 -380 -180 L 280 -150 Q 470 -100 600 -60 L 720 -140 L 700 0 L 720 140 L 600 60 Q 470 100 280 150 L -380 180 Q -500 170 -470 100 Z" fill={SKIN} stroke={MOODS.cold.rim} strokeWidth={5} /></g>
    {Array.from({ length: 8 }, (_, i) => { const k = since(f, 'Eight') - i * 2; return k < 0 ? null : <g key={i} transform={`translate(${190 + (i % 4) * 230} ${1000 + Math.floor(i / 4) * 170}) scale(${popIn(k, 5)})`}><Weight x={0} y={60} s={0.9} /></g>; })}
    {since(f, 'tons') >= 0 ? <Txt x={540} y={360} s={120} c="#9FE3FF">8 TONS</Txt> : null}
  </g>
);
export const S12: S = ({ t }) => (   // the stink: close faces holding their noses
  <g>
    <Beach id="w12" mood="noon" t={t} head={false} />
    <Crowd mood="noon" t={t} n={3} x0={220} x1={860} feet={1900} s={2.5} g="nose" seed={2} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${120 + i * 170} ${1100 - ((t * 3 + i * 40) % 300)} q 30 -40 0 -80 q -30 -40 0 -80`} stroke="#9AD84A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} style={{ filter: 'drop-shadow(0 0 10px #9AD84A)' }} />)}
    <Txt x={540} y={420} s={104} c="#9AD84A">PEE-YOO!</Txt>
  </g>
);
export const S13: S = ({ t, f }) => (   // the beach is a highway: a road sign in the sand
  <g>
    <Beach id="w13" mood="noon" t={t} />
    <g transform={`translate(0 ${(1 - popIn(since(f, 'highway'), 6)) * 300})`}><Board x={540} y={900} w={620} h={300} lines={['BEACH', '= HIGHWAY']} size={92} /></g>
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 170 - (t * 6) % 170} y={1300} width={90} height={16} fill="#F2E6C8" opacity={0.7} />)}
  </g>
);
export const S14: S = ({ t, f }) => (   // the highway department rolls up
  <g>
    <Beach id="w14" mood="noon" t={t} />
    <Whale x={300} y={1140} s={0.5} rim={MOODS.noon.rim} />
    <Truck x={lerp(1400, 740, easeOut(clamp(t / 40)))} y={1330} s={0.95} />
    {since(f, 'problem') >= 0 ? <Punch t={since(f, 'problem')} lines={['THEIR', 'PROBLEM']} y={360} size={110} color="#F2B030" /> : null}
  </g>
);
export const S15: S = ({ t, f }) => (   // the highway office: men round a blueprint, the plan
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill="#3A4A5A" />
    <rect x={640} y={360} width={320} height={360} fill="#9FC8E8" stroke={INK} strokeWidth={10} /><path d="M 800 360 L 800 720 M 640 540 L 960 540" stroke={INK} strokeWidth={8} />
    <Glow x={800} y={540} r={360} kind="cool" o={0.5} />
    <rect x={-300} y={1150} width={W + 600} height={900} fill="#2A2A30" />
    <rect x={100} y={980} width={880} height={50} fill="#6A4428" stroke={INK} strokeWidth={6} />
    <g transform="translate(540 960) rotate(-3)"><rect x={-330} y={-200} width={660} height={190} fill="#2A5A9A" stroke="#F4EEE2" strokeWidth={6} />
      <path d="M -250 -60 Q -150 -140 0 -130 Q 150 -120 250 -70" stroke="#F4EEE2" strokeWidth={6} fill="none" /><circle cx={0} cy={-100} r={26} fill="#D8322A" />
      {since(f, 'Blow') >= 0 ? <text x={0} y={-30} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={56} fill="#F4EEE2">PLAN: KABOOM</text> : null}</g>
    <Man x={200} feet={1540} s={1.5} mood="night" t={t} g="point" hat="none" />
    <Man x={880} feet={1540} s={1.5} mood="night" t={t + 5} g="stand" hat="bowler" flip />
    <g transform="translate(540 300)"><circle r={46} fill="#F4EEE2" stroke={INK} strokeWidth={6} /><path d={`M 0 0 L ${Math.sin(t * 0.1) * 30} ${-Math.cos(t * 0.1) * 30}`} stroke={INK} strokeWidth={6} /></g>
  </g>
);
export const S16: S = ({ t }) => (   // seagulls on a wire, licking their beaks
  <g>
    <Sky id="w16" mood="warm" sunX={300} sunY={600} />
    <Clouds mood="warm" t={t} y={520} />
    <path d="M -100 800 Q 540 880 1180 800" stroke={INK} strokeWidth={8} fill="none" />
    {Array.from({ length: 4 }, (_, i) => { const x = 180 + i * 240; return <Gull key={i} x={x} y={836 + Math.sin(((x + 100) / 1280) * Math.PI) * 40 - 40} s={1.3} flip={i % 2 === 1} lick={t * 0.5 + i} />; })}
    <Txt x={540} y={420} s={96} c="#FFD27A">CLEAN UP CREW</Txt>
  </g>
);
export const S17: S = ({ t }) => (   // "What could go wrong?": a spotlight on the dynamite under the whale
  <g>
    <Beach id="w17" mood="night" t={t} moon />
    <Whale x={540} y={1120} s={0.7} rim={MOODS.night.rim} />
    <Dynamite x={560} y={1150} s={1.1} n={5} lit={1} />
    <Txt x={540} y={420} s={96} c="#C9A2FF">WHAT COULD</Txt><Txt x={540} y={530} s={110} c="#FFB03A">GO WRONG?</Txt>
  </g>
);
export const S18: S = ({ t }) => (   // the crowd on the dunes; one man in a soldier's cap stands out
  <g>
    <Beach id="w18" mood="noon" t={t} />
    <Whale x={300} y={1100} s={0.45} rim={MOODS.noon.rim} />
    <path d="M -300 1500 Q 300 1260 1380 1420 L 1380 2000 L -300 2000 Z" fill={MOODS.noon.layers[2]} />
    <Crowd mood="noon" t={t} n={7} x0={80} x1={1000} feet={1460} s={0.95} seed={3} />
    <g><Man x={620} feet={1430} s={1.05} mood="warm" t={t} g="stand" hat="cap" /><Glow x={620} y={1200} r={260} kind="warm" o={0.6} /></g>
  </g>
);
export const S19: S = ({ t }) => (   // close: the army explosives man, cap and medals
  <g>
    <Sky id="w19" mood="noon" sunX={760} sunY={520} />
    <rect x={-300} y={1300} width={W + 600} height={700} fill={MOODS.noon.layers[2]} />
    <Man x={540} feet={2300} s={3.2} mood="warm" t={t} g="stand" hat="cap" />
    {[[440, 1460, '#D8322A'], [500, 1470, '#2A5A9A'], [560, 1460, '#F2B030']].map(([x, y, c], i) => <g key={i}><rect x={(x as number) - 14} y={(y as number) - 40} width={28} height={40} fill={c as string} /><circle cx={x as number} cy={(y as number) + 14} r={18} fill="#D8B040" stroke={INK} strokeWidth={4} /></g>)}
    <Txt x={540} y={420} s={96} c="#FFD27A">ARMY</Txt><Txt x={540} y={530} s={84}>EXPLOSIVES MAN</Txt>
  </g>
);
export const S20: S = ({ t, f }) => (   // "TOO MUCH!" bubble
  <g>
    <Sky id="w20" mood="danger" sunX={760} sunY={520} />
    <rect x={-300} y={1300} width={W + 600} height={700} fill={MOODS.danger.layers[2]} />
    <Man x={420} feet={2100} s={2.6} mood="danger" t={t} g="point" hat="cap" />
    <Speech t={since(f, 'too')} x={700} y={620} flip><text x={0} y={-10} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#D8322A">TOO</text><text x={0} y={90} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#D8322A">MUCH!</text></Speech>
  </g>
);
export const S21: S = ({ t }) => (   // nobody listened: a hard hat waves him off, over the shoulder
  <g>
    <Beach id="w21" mood="noon" t={t} />
    <Man x={640} feet={1500} s={1.5} mood="noon" t={t} g="vote" hat="bowler" flip />
    <Man x={240} feet={2000} s={2.9} mood="warm" t={t} g="stand" hat="cap" />
    <Txt x={540} y={420} s={110} c="#F2B030">NOBODY</Txt><Txt x={540} y={530} s={110} c="#F2B030">LISTENED</Txt>
  </g>
);
export const S22: S = ({ t, f }) => (   // twenty cases stacked against the whale
  <g>
    <Beach id="w22" mood="warm" t={t} head={false} />
    <Whale x={560} y={1060} s={0.75} rim={MOODS.warm.rim} />
    {Array.from({ length: 20 }, (_, i) => { const k = since(f, 'Twenty') - i * 1.2; return k < 0 ? null : <g key={i} transform={`scale(${popIn(k, 4)})`} style={{ transformOrigin: `${200 + (i % 7) * 115}px ${1240 - Math.floor(i / 7) * 95}px` }}><Crate x={200 + (i % 7) * 115} y={1240 - Math.floor(i / 7) * 95} s={0.7} /></g>; })}
    <Counter t={since(f, 'Twenty')} from={0} to={20} dur={24} sub="CASES OF DYNAMITE" y={520} color="#FFB03A" />
  </g>
);
export const S23: S = ({ t, f }) => {   // the countdown: hand on the plunger, 3-2-1
  const n = 3 - Math.min(2, Math.floor(Math.max(0, since(f, 'countdown')) / 14));
  return (
    <g>
      <Sky id="w23" mood="danger" sunX={300} sunY={700} />
      <rect x={-300} y={1180} width={W + 600} height={900} fill={MOODS.danger.layers[2]} />
      <Plunger x={540} y={1280} s={1.4} k={clamp((t - 44) / 6)} />
      <g transform={`translate(540 660) scale(${popIn(since(f, 'countdown') % 14, 4)})`}><Txt x={0} y={90} s={300} c="#FFD23F">{String(n)}</Txt></g>
    </g>
  );
};
export const S24: S = ({ t }) => (   // KABOOM
  <g>
    <Beach id="w24" mood="danger" t={t} sunX={300} sunY={700} />
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={540 + (i - 3) * 60} cy={900 - t * 6 - i * 50} r={120 + t * 18 + i * 30} fill={['#FFF6C0', '#FFE07A', '#FF9A3A', '#D8502A', '#6A3A2A', '#3A2A2A'][i]} opacity={0.9 - i * 0.1} />)}
    <Glow x={540} y={900} r={900} kind="warm" o={1} />
    <Burst t={t} text="KABOOM!" y={560} size={130} color="#FF8A1A" />
  </g>
);
export const S25: S = ({ t }) => (   // sand and smoke: the column over the beach, the crowd small against it
  <g>
    <Beach id="w25" mood="brown" t={t} sunX={820} sunY={560} />
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={540 + Math.sin(i * 1.7) * (60 + i * 14)} cy={1100 - i * 55 - t * 2} r={90 + i * 12 + t} fill={i % 2 ? '#6A5A4A' : '#8A7A62'} opacity={0.85} />)}
    {Array.from({ length: 30 }, (_, i) => <circle key={'s' + i} cx={540 + (random(`sp${i}`) - 0.5) * 900 * clamp(t / 30)} cy={1100 - random(`sq${i}`) * 500 * Math.sin(clamp(t / 40) * Math.PI)} r={6} fill="#C8A878" />)}
    <Crowd mood="brown" t={t} n={8} x0={60} x1={1020} feet={1420} s={0.8} g="shock" seed={5} />
    <Txt x={540} y={420} s={110} c="#F2A33A">SAND. SMOKE.</Txt>
  </g>
);
export const S26: S = ({ t }) => (   // it rained whale: blubber falling at the camera
  <g>
    <Beach id="w26" mood="brown" t={t} />
    <Rain t={t + 10} n={22} seed="a" s={1.3} ground={1400} />
    <Punch t={t - 2} lines={['IT RAINED', 'WHALE']} y={300} size={130} color={BLUB} />
  </g>
);
export const S27: S = ({ t }) => (   // the crowd runs under its jackets
  <g>
    <Beach id="w27" mood="warm" t={t} head={false} />
    <Rain t={t + 20} n={16} seed="b" s={1.0} ground={1500} />
    {Array.from({ length: 5 }, (_, i) => <g key={i}><Man x={1100 - ((t * 9 + i * 240) % 1300)} feet={1500 + (i % 2) * 60} s={1.2} mood="warm" t={t + i * 5} g="run" hat="none" flip ph={i} /><path d={`M ${1100 - ((t * 9 + i * 240) % 1300) - 70} ${1500 + (i % 2) * 60 - 330} q 70 -60 140 0`} stroke={['#2A5A9A', '#8A3A2A', '#3A6A3A'][i % 3]} strokeWidth={30} fill="none" strokeLinecap="round" /></g>)}
  </g>
);
export const S28: S = ({ t }) => (   // like the sky had a bellyache
  <g>
    <Sky id="w28" mood="noon" sunX={800} sunY={420} />
    <SickCloud x={540} y={680} s={1.4} t={t} />
    <Rain t={t} n={10} seed="c" s={0.8} ground={1500} />
    <Txt x={540} y={330} s={96} c="#9AD84A">BELLYACHE</Txt>
  </g>
);
export const S29: S = ({ t, f }) => {   // bird's-eye: a chunk smashes the shiny new car
  const k = clamp((since(f, 'flattened') + 4) / 6), fall = since(f, 'flattened');
  return (
    <g>
      <rect x={-300} y={-300} width={W + 600} height={2500} fill="#4A4A52" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 200 - 40} y={300} width={12} height={1400} fill="#F2E6C8" opacity={0.6} />)}
      <g transform="translate(540 900)">
        <rect x={-170} y={-330} width={340} height={660} rx={70} fill={CAR} stroke={INK} strokeWidth={10} />
        <rect x={-130} y={-180 + k * 30} width={260} height={300 - k * 60} rx={30} fill={k > 0.5 ? '#2A6A7A' : '#BFE6F2'} stroke={INK} strokeWidth={6} />
        {k > 0.5 ? Array.from({ length: 6 }, (_, i) => <path key={i} d={`M 0 0 L ${Math.cos(i) * 180} ${Math.sin(i * 1.3) * 200}`} stroke={INK} strokeWidth={5} />) : null}
        {fall < 0 ? <Chunk x={0} y={-40} s={4 - fall * 0.12} seed={4} /> : <Chunk x={0} y={-20} s={3.2} rot={10} seed={4} />}
      </g>
      {fall >= 0 ? <Burst t={fall} text="CRUNCH!" y={420} size={110} color="#FF5A4A" /> : null}
    </g>
  );
};
export const S30: S = ({ t }) => (   // whose car was it? a question mark over the wreck
  <g>
    <Beach id="w30" mood="noon" t={t} head={false} />
    <Car x={540} y={1260} s={1.3} crush={1} />
    <Txt x={540} y={700} s={360} c="#F2B030">?</Txt>
  </g>
);
export const S31: S = ({ t }) => (   // the army man stares at his flattened car
  <g>
    <Beach id="w31" mood="danger" t={t} head={false} />
    <Car x={680} y={1230} s={0.9} crush={1} />
    <Man x={260} feet={1900} s={2.5} mood="danger" t={t} g="shock" hat="cap" />
    <Txt x={540} y={420} s={110} c="#FF8A3D">HIS CAR!</Txt>
  </g>
);
export const S32: S = ({ t, f }) => (   // rewind: the dealer lot, bunting, the shiny car bought days before
  <g>
    <Sky id="w32" mood="warm" sunX={760} sunY={520} />
    <rect x={-300} y={1160} width={W + 600} height={900} fill="#5A5A62" />
    <path d="M -100 520 Q 540 640 1180 520" stroke={INK} strokeWidth={5} fill="none" />
    {Array.from({ length: 14 }, (_, i) => { const u = (i + 0.5) / 14, x = lerp(-100, 1180, u), y = 520 + Math.sin(u * Math.PI) * 120 * 0.9; return <path key={i} d={`M ${x - 26} ${y} L ${x + 26} ${y} L ${x} ${y + 60 + Math.sin(t * 0.3 + i) * 6} Z`} fill={['#D8322A', '#F4EEE2', '#2A5A9A'][i % 3]} stroke={INK} strokeWidth={3} />; })}
    <Car x={560} y={1250} s={1.2} />
    <Glow x={560} y={1100} r={400} kind="warm" o={0.5} />
    <Man x={180} feet={1500} s={1.3} mood="warm" t={t} g="point" hat="cap" />
    {since(f, 'sale') >= 0 ? <Punch t={since(f, 'sale')} lines={['A SALE', 'CALLED...']} y={330} size={100} color="#FFD27A" /> : null}
  </g>
);
export const S33: S = ({ t }) => (   // the dealer sign: GET A WHALE OF A DEAL
  <g>
    <Sky id="w33" mood="warm" sunX={300} sunY={560} />
    <Board x={540} y={980} w={900} h={520} lines={['GET A', 'WHALE', 'OF A DEAL!']} size={120} bg="#D8322A" posts={400} />
    {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <circle key={i} cx={540 + Math.cos(a) * 470} cy={720 + Math.sin(a) * 290} r={14} fill={(Math.floor(t / 4) + i) % 2 ? '#FFF2B0' : '#7A5A2A'} />; })}
    <Glow x={540} y={720} r={600} kind="warm" o={0.4} />
  </g>
);
export const S34: S = ({ t }) => (   // the seagulls burst off into the sky
  <g>
    <Sky id="w34" mood="noon" sunX={760} sunY={560} />
    <Clouds mood="noon" t={t} y={520} />
    {Array.from({ length: 12 }, (_, i) => <Gull key={i} x={120 + (i % 6) * 170 + t * (i % 2 ? 6 : -6)} y={1200 - (i < 6 ? 0 : 160) - t * (10 + (i % 4) * 3)} s={0.8 + (i % 3) * 0.2} flap={t * 0.6 + i} flip={i % 2 === 0} />)}
    <Txt x={540} y={420} s={110}>SCARED OFF</Txt>
  </g>
);
export const S35: S = ({ t }) => (   // a lone gull sniffs a chunk, turns away
  <g>
    <Beach id="w35" mood="cold" t={t} head={false} />
    <Chunk x={420} y={1240} s={2.4} seed={6} />
    <Gull x={760} y={1260} s={2.0} flip={t > 18} />
    <Txt x={540} y={420} s={104} c="#9FE3FF">NOT A BITE</Txt>
  </g>
);
export const S36: S = ({ t }) => (   // aerial: most of the whale still lying there, a crater beside it
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill={MOODS.cold.layers[2]} />
    <rect x={-300} y={-300} width={W + 600} height={700} fill={MOODS.cold.layers[1]} />
    <path d="M -300 400 Q 540 360 1380 420" stroke="#FFF8EA" strokeOpacity={0.6} strokeWidth={12} fill="none" />
    <ellipse cx={700} cy={980} rx={240} ry={120} fill={MOODS.cold.ground} opacity={0.8} />
    <g transform="translate(470 900) scale(0.8) rotate(8)"><path d="M -470 -100 Q -500 -170 -380 -180 L 180 -150 Q 300 -60 200 40 L 120 160 L -380 180 Q -500 170 -470 100 Z" fill={SKIN} stroke={MOODS.cold.rim} strokeWidth={5} /><ellipse cx={180} cy={0} rx={70} ry={110} fill={BLUB} /></g>
    {Array.from({ length: 16 }, (_, i) => <Chunk key={i} x={random(`sc${i}`) * W} y={600 + random(`sd${i}`) * 800} s={0.5} seed={i} />)}
    <Punch t={t - 2} lines={['STILL', 'THERE']} y={300} size={120} color="#9FE3FF" />
  </g>
);
export const S37: S = ({ t }) => (   // a bulldozer buries it
  <g>
    <Beach id="w37" mood="warm" t={t} head={false} />
    <Mound x={560} y={1220} w={460} h={lerp(120, 300, clamp(t / 60))} c={MOODS.warm.layers[1]} />
    <Dozer x={lerp(-100, 220, easeOut(clamp(t / 40)))} y={1260} s={1.0} t={t} />
    <Txt x={540} y={420} s={110} c="#FFD27A">BURIED</Txt>
  </g>
);
export const S38: S = ({ t }) => (   // today: a sunny park by the river, kids playing
  <g>
    <Sky id="w38" mood="noon" sunX={760} sunY={460} />
    <Clouds mood="noon" t={t} y={440} />
    <rect x={-300} y={1000} width={W + 600} height={1000} fill="#4A7A3A" />
    {Array.from({ length: 5 }, (_, i) => <g key={i} transform={`translate(${80 + i * 240} 1000)`}><rect x={-12} y={-140} width={24} height={140} fill="#5A3A22" /><circle cx={0} cy={-190} r={80} fill="#3A6A2A" stroke={INK} strokeWidth={5} /></g>)}
    <g transform="translate(740 1260)"><path d="M -120 0 L -60 -260 L 60 -260 L 120 0" stroke={INK} strokeWidth={12} fill="none" /><path d={`M 0 -260 L ${Math.sin(t * 0.12) * 90} -100`} stroke={INK} strokeWidth={5} /><rect x={Math.sin(t * 0.12) * 90 - 30} y={-108} width={60} height={14} fill="#D8322A" /></g>
    {[[300, 0], [460, 1]].map(([x, i]) => <Man key={i} x={x} feet={1300 - Math.abs(Math.sin(t * 0.3 + i)) * 30} s={0.8} mood="noon" t={t + i * 4} g="run" hat="none" ph={i} />)}
    <Punch t={t - 2} lines={['TODAY']} y={330} size={120} color="#FFD23F" />
  </g>
);
export const S43: S = ({ t }) => (   // the park's sign
  <g>
    <Sky id="w43" mood="noon" sunX={300} sunY={460} />
    <rect x={-300} y={1150} width={W + 600} height={800} fill="#4A7A3A" />
    <Board x={540} y={1030} w={920} h={560} lines={['EXPLODING', 'WHALE', 'MEMORIAL', 'PARK']} size={110} bg="#5A3A22" posts={200} />
    <g transform="translate(540 520) scale(0.35)"><Whale x={0} y={0} s={1} rim="#FFE2A8" dead={false} /></g>
  </g>
);
export const S39: S = ({ t }) => (   // THAT'S REAL: a plaque close up
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill="#5A3A22" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M -300 ${200 + i * 140} Q 540 ${180 + i * 140} 1380 ${210 + i * 140}`} stroke="#4A2E1A" strokeWidth={10} fill="none" />)}
    <rect x={190} y={560} width={700} height={480} rx={30} fill="#C8A048" stroke={INK} strokeWidth={10} />
    <text x={540} y={700} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={56} fill={INK}>NOVEMBER 12, 1970</text>
    <text x={540} y={790} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={46} fill={INK}>FLORENCE, OREGON</text>
    <Punch t={t} lines={["THAT'S", 'REAL']} y={330} size={140} color="#FFD23F" />
  </g>
);
export const S40: S = ({ t }) => (   // a modern office: "I'VE GOT A PLAN"
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill="#2E3A4A" />
    <rect x={120} y={420} width={840} height={520} fill="#F4F4F0" stroke="#8A8A92" strokeWidth={14} />
    <text x={540} y={620} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={96} fill="#2A5A9A">I'VE GOT</text>
    <text x={540} y={740} textAnchor="middle" fontFamily={FONT.hand} fontWeight={700} fontSize={96} fill="#2A5A9A">A PLAN!</text>
    <path d="M 300 830 L 780 830" stroke="#D8322A" strokeWidth={8} strokeDasharray={480} strokeDashoffset={480 * (1 - clamp(t / 20))} />
    <rect x={-300} y={1150} width={W + 600} height={800} fill="#1E242E" />
    <Man x={820} feet={1600} s={1.6} mood="cold" t={t} g="point" hat="none" flip />
    <Man x={200} feet={1700} s={1.9} mood="cold" t={t} g="stand" hat="none" />
  </g>
);
export const S41: S = ({ t }) => (   // stamp: HOW MUCH DYNAMITE?
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2500} fill="#2E3A4A" />
    <rect x={120} y={420} width={840} height={520} fill="#F4F4F0" stroke="#8A8A92" strokeWidth={14} />
    <Dynamite x={540} y={860} s={1.3} n={5} />
    <g transform={`translate(540 640) rotate(-12) scale(${lerp(1.8, 1, popIn(t - 3, 4))})`} opacity={t < 3 ? 0 : 1}>
      <rect x={-420} y={-110} width={840} height={220} fill="none" stroke="#D8322A" strokeWidth={18} />
      <Txt x={0} y={-6} s={74} c="#D8322A">HOW MUCH</Txt><Txt x={0} y={80} s={74} c="#D8322A">DYNAMITE?</Txt>
    </g>
  </g>
);
export const S42: S = ({ t }) => (   // sign-off: the sunset beach
  <g>
    <Beach id="w42" mood="outback" t={t} sunX={540} sunY={860} />
    <Whale x={540} y={1180} s={0.5} rim={MOODS.outback.rim} dead={false} />
    <Txt x={540} y={420} s={96} c="#FFD08A">THAT'S ABOUT IT,</Txt><Txt x={540} y={530} s={110} c="#FFF8EA">FOLKS</Txt>
  </g>
);
export const S44: S = ({ t }) => (   // follow: a whale-shaped cloud drifts over the sunset
  <g>
    <Sky id="w44" mood="outback" sunX={540} sunY={1000} />
    <Rays x={540} y={1000} t={t} o={0.3} n={10} spread={140} dir={90} />
    <g transform={`translate(${480 + t * 0.8} 620) scale(0.6)`} opacity={0.85}><path d="M -470 -40 Q -500 -250 -380 -270 L -60 -280 Q 120 -270 260 -190 Q 380 -120 470 -70 L 600 -60 Q 660 -150 720 -170 Q 700 -90 640 -46 Q 700 -10 720 70 Q 660 40 600 -30 L 470 -20 Q 300 0 -60 6 L -440 6 Q -480 -10 -470 -40 Z" fill="#FFE6C8" /></g>
    <Sea mood="outback" t={t} y={1000} to={1200} />
    <Sand mood="outback" y={1200} />
    <Punch t={t - 4} lines={['FOLLOW FOR MORE', 'STRANGE HISTORY']} y={300} size={80} color="#FFD08A" />
  </g>
);
void FxDefs; void Shadow; void BigNumber;
