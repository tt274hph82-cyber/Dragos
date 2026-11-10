import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { popIn, clamp, lerp, easeOut } from '../molasses/kit';
import { OL, Blocky, CubeHead, Sparkles, Confetti, Face } from '../ten-seconds/shots';
import words from './words.json';

// "How did these 7 players find the Golden Token?" A 16:9 countdown in the blocky style: a hook, #7 to #1,
// reaction-cam boxes, and "the truth no one tells you". Original characters and an invented game (Block Quest);
// the reaction cams are our own blocky faces, not real streamers.

type S = React.FC<ShotProps>;
const LW = 1920, LH = 1080;
const ease = (x: number) => easeOut(clamp(x));
const txt = (s: number, c = '#FFFFFF', sw = 0.13) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: s * sw, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const });
const GOLD = '#FFD23F';

// ---------------------------------------------------------------- backgrounds
const Fill: React.FC<{ c: string }> = ({ c }) => <rect x={-600} y={-600} width={LW + 1200} height={LH + 1200} fill={c} />;
const Rays: React.FC<{ t: number; c1: string; c2: string; cx?: number; cy?: number }> = ({ t, c1, c2, cx = 960, cy = 540 }) => (
  <g><Fill c={c1} /><g transform={`translate(${cx} ${cy}) rotate(${t * 0.6})`}>{Array.from({ length: 20 }, (_, i) => <path key={i} d="M 0 0 L -110 -1900 L 110 -1900 Z" fill={c2} transform={`rotate(${i * 18})`} />)}</g></g>
);
const Field: React.FC<{ t: number; ground?: number }> = ({ t, ground = 820 }) => (
  <g>
    <Fill c="#7ACCF2" />
    {[[260, 200], [900, 130], [1560, 240]].map(([x, y], i) => <g key={i} fill="#FFFFFF" transform={`translate(${x + t * 0.5} ${y})`}><rect x={-110} y={0} width={220} height={60} rx={12} /><rect x={-50} y={-46} width={120} height={60} rx={12} /></g>)}
    <path d={`M -600 ${ground} Q 300 ${ground - 150} 900 ${ground - 20} T 2600 ${ground - 40} L 2600 1700 L -600 1700 Z`} fill="#5AC86A" stroke={OL} strokeWidth={10} />
  </g>
);
const Room: React.FC<{ c?: string; floor?: string }> = ({ c = '#3A2E6A', floor = '#5A3A2A' }) => (
  <g><Fill c={c} /><rect x={-600} y={800} width={LW + 1200} height={900} fill={floor} /><rect x={-600} y={790} width={LW + 1200} height={14} fill={OL} opacity={0.5} /></g>
);

// ---------------------------------------------------------------- the Golden Token and friends
const Token: React.FC<{ x: number; y: number; s?: number; t: number; glow?: boolean }> = ({ x, y, s = 1, t, glow = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow ? <><circle r={330 + Math.sin(t * 0.2) * 16} fill={GOLD} opacity={0.16} /><circle r={250} fill={GOLD} opacity={0.2} /></> : null}
    <g transform={`rotate(${Math.sin(t * 0.08) * 6})`}>
      {Array.from({ length: 8 }, (_, i) => <path key={i} d="M -34 -150 L 0 -260 L 34 -150 Z" fill={i % 2 ? '#FF9A1A' : GOLD} stroke={OL} strokeWidth={9} strokeLinejoin="round" transform={`rotate(${i * 45})`} />)}
      <circle r={170} fill="#FF9A1A" stroke={OL} strokeWidth={11} /><circle r={130} fill={GOLD} stroke={OL} strokeWidth={9} />
      <path d="M -70 46 L -84 -44 L -36 0 L 0 -66 L 36 0 L 84 -44 L 70 46 Z" fill="#FFFFFF" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
      <path d="M -100 -80 Q -60 -120 -10 -124" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  </g>
);
/** A reaction-cam box: one of our blocky faces in a rounded frame, like a streamer's face-cam. */
const Cam: React.FC<{ x: number; y: number; w?: number; face: Face; hair: any; t: number; c?: string; bg?: string; id: string; pop?: number }> = ({ x, y, w = 380, face, hair, t, c = '#FFFFFF', bg = '#2E6AE8', id, pop = 0 }) => {
  const h = w * 0.62;
  return (
    <g transform={`translate(${x} ${y}) scale(${popIn(t - pop, 5)})`}>
      <clipPath id={`cam${id}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} /></clipPath>
      <g clipPath={`url(#cam${id})`}><rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} /><rect x={-w / 2} y={h * 0.2} width={w} height={h} fill="#000" opacity={0.18} />
        <g transform={`translate(0 ${h * 0.12 + Math.sin(t * 0.5) * 3}) scale(${w / 620})`}><CubeHead face={face} hair={hair} t={t} /><rect x={-150} y={170} width={300} height={200} rx={30} fill={c === '#FFFFFF' ? '#D8323A' : c} stroke={OL} strokeWidth={9} /></g></g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="none" stroke={c} strokeWidth={12} /><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="none" stroke={OL} strokeWidth={4} />
      <g transform={`translate(${-w / 2 + 54} ${-h / 2 + 34})`}><rect x={-40} y={-18} width={80} height={36} rx={10} fill="#E2262E" /><text y={11} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={24} fill="#FFFFFF">LIVE</text></g>
    </g>
  );
};
const Cams: React.FC<{ t: number; face?: Face }> = ({ t, face = 'shock' }) => (
  <g><Cam x={250} y={250} face={face} hair="kid" t={t} id="a" c="#4ADE6A" bg="#2E6AE8" /><Cam x={250} y={520} face={face} hair="friend" t={t} id="b" c="#FF7AE0" bg="#5A2A8A" pop={3} /><Cam x={250} y={790} face={face} hair="dad" t={t} id="c" c={GOLD} bg="#8A4A1A" pop={6} /></g>
);
const NumBadge: React.FC<{ t: number; n: string; name: string; c: string; len?: number }> = ({ t, n, name, c, len = 40 }) => (
  <g>
    <Rays t={t} c1="#1E1A3A" c2="#2A2450" />
    <circle cx={960} cy={500} r={240 + t * 70} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 44 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <g transform={`translate(700 520) scale(${t < 5 ? lerp(3, 1, easeOut(t / 5)) : 1}) rotate(${t < 5 ? lerp(-20, -5, easeOut(t / 5)) : -5})`}>
      <text {...txt(440, GOLD, 0.1)}>#{n}</text>
    </g>
    <g transform={`translate(1290 500) scale(${popIn(t - 8, 6)}) rotate(4)`}>
      <rect x={-340} y={-100} width={680} height={200} rx={36} fill={c} stroke={OL} strokeWidth={14} /><text y={44} {...txt(name.length > 8 ? 96 : 130)}>{name}</text>
    </g>
  </g>
);
const badge = (n: string, name: string, c: string): S => ({ t, len }) => <NumBadge t={t} n={n} name={name} c={c} len={len} />;
const Desk: React.FC<{ x: number; y: number; s?: number; screen?: string; children?: React.ReactNode }> = ({ x, y, s = 1, screen = '#4AC8FF', children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-280} y={-420} width={560} height={340} rx={18} fill="#14101E" stroke={OL} strokeWidth={10} /><rect x={-250} y={-392} width={500} height={284} rx={8} fill={screen} />{children}
    <rect x={-40} y={-80} width={80} height={60} fill="#14101E" /><rect x={-460} y={-20} width={920} height={34} rx={8} fill="#8A5A3A" stroke={OL} strokeWidth={9} />
    <rect x={-220} y={-52} width={440} height={34} rx={8} fill="#D8D8E2" stroke={OL} strokeWidth={7} />{Array.from({ length: 11 }, (_, i) => <rect key={i} x={-206 + i * 38} y={-46} width={28} height={20} rx={4} fill="#FFFFFF" stroke={OL} strokeWidth={3} />)}
  </g>
);
const Cat: React.FC<{ x: number; y: number; s?: number; t: number; walk?: boolean; flip?: boolean }> = ({ x, y, s = 1, t, walk, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d={`M -130 -90 Q -220 -120 -200 ${-220 + Math.sin(t * 0.4) * 20}`} stroke="#E8963A" strokeWidth={30} fill="none" strokeLinecap="round" /><path d={`M -130 -90 Q -220 -120 -200 ${-220 + Math.sin(t * 0.4) * 20}`} stroke={OL} strokeWidth={6} fill="none" opacity={0.3} />
    {[-90, -40, 40, 90].map((lx, i) => <rect key={i} x={lx - 16} y={-50 + (walk ? Math.abs(Math.sin(t * 0.6 + i * 1.6)) * -18 : 0)} width={32} height={54} rx={10} fill="#E8963A" stroke={OL} strokeWidth={7} />)}
    <rect x={-140} y={-150} width={280} height={120} rx={40} fill="#F2A84A" stroke={OL} strokeWidth={9} />
    <g transform="translate(150 -170)"><path d="M -70 -50 L -56 -110 L -20 -64 Z M 70 -50 L 56 -110 L 20 -64 Z" fill="#F2A84A" stroke={OL} strokeWidth={8} strokeLinejoin="round" /><rect x={-80} y={-70} width={160} height={130} rx={36} fill="#F2A84A" stroke={OL} strokeWidth={9} /><circle cx={-32} cy={-14} r={11} fill={OL} /><circle cx={32} cy={-14} r={11} fill={OL} /><path d="M -10 14 L 10 14 L 0 26 Z" fill="#F28AB8" stroke={OL} strokeWidth={4} /><path d="M -60 20 l -40 -6 M -60 30 l -40 10 M 60 20 l 40 -6 M 60 30 l 40 10" stroke={OL} strokeWidth={4} /></g>
  </g>
);
const Zzz: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => <g>{[0, 1, 2].map((k) => <text key={k} x={x + k * 70} y={y - k * 90 - ((t * 2) % 40)} {...txt(80 + k * 24)}>Z</text>)}</g>;
const Card: React.FC<{ t: number; lines: string[]; c?: string; x?: number; y?: number; size?: number; w?: number }> = ({ t, lines, c = '#1A1424', x = 960, y = 420, size = 110, w = 1000 }) => (
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 6)}) rotate(-3)`}><rect x={-w / 2} y={-size * 0.9} width={w} height={size * (lines.length * 1.15 + 0.7)} rx={30} fill={c} stroke={GOLD} strokeWidth={12} />{lines.map((l, i) => <text key={i} y={i * size * 1.15 + size * 0.2} {...txt(size, i === lines.length - 1 ? GOLD : '#FFFFFF', 0.08)}>{l}</text>)}</g>
);

// ---------------------------------------------------------------- the HUD: finders counter (fixed)
const W_ = words as any[];
const NUMS = W_.filter((w) => w.w === 'Number' || w.w === 'number').map((w) => w.s as number);
const TRUTH = (W_.find((w) => w.w === "It's") ?? { s: 56.6 }).s as number;
export const Finders: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, n = sec >= TRUTH ? 7 : Math.max(0, NUMS.filter((s) => sec >= s).length - 1);
  const pop = NUMS.some((s) => sec >= s && sec < s + 0.25) ? 1.12 : 1;
  return (
    <g transform={`translate(1640 86) scale(${pop})`}>
      <rect x={-230} y={-44} width={460} height={88} rx={44} fill="#1A1424" stroke={GOLD} strokeWidth={6} />
      <g transform="translate(-178 0) scale(0.17)"><Token x={0} y={0} t={f} glow={false} /></g>
      <text x={-120} y={16} fontFamily={FONT.game} fontWeight={900} fontSize={40} fill="#FFFFFF">FOUND</text>
      <text x={200} y={18} textAnchor="end" fontFamily={FONT.game} fontWeight={900} fontSize={52} fill={GOLD}>{n}/7</text>
    </g>
  );
};

// ---------------------------------------------------------------- the hook
export const S1: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#3A1E6A" c2="#4A2A88" />
    <Token x={960} y={420} s={0.95} t={t} />
    {Array.from({ length: 7 }, (_, i) => <g key={i} transform={`translate(${330 + i * 210} ${1010}) scale(${popIn(t - 6 - i * 2, 5)})`}><circle cy={-210} r={62} fill="#14101E" stroke={GOLD} strokeWidth={8} /><rect x={-70} y={-150} width={140} height={170} rx={30} fill="#14101E" stroke={GOLD} strokeWidth={8} /><text y={-186} {...txt(70, GOLD, 0)}>?</text></g>)}
    <Sparkles t={t} seed="s1" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#C88A1A" c2="#E8A82A" cx={1240} />
    <Token x={1240} y={460} s={1.25} t={t} />
    <g transform={`translate(620 400) rotate(-5) scale(${popIn(t, 6)})`}><text {...txt(120)}>THE GOLDEN</text><text y={170} {...txt(200, GOLD)}>TOKEN</text></g>
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#1E7A34" c2="#2EA84A" cx={1200} />
    <Cams t={t} />
    <g transform={`translate(1200 440) rotate(-5) scale(${popIn(t - 3, 6)})`}><text {...txt(170)}>HOW THEY</text><text y={210} {...txt(260, GOLD)}>DID IT?!</text></g>
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#5A0A0A" c2="#7A1A1A" />
    <Blocky x={560} y={1380} s={1.1} kind="boss" face="smirk" t={t} pose={{ armR: 150 }} />
    <g transform={`translate(1280 440) rotate(-10) scale(${lerp(2.4, 1, ease(t / 5))})`} opacity={clamp(t / 3)}><rect x={-440} y={-150} width={880} height={300} rx={24} fill="none" stroke="#FF4A4A" strokeWidth={22} /><text y={-10} {...txt(130, '#FF4A4A', 0)}>TOP</text><text y={120} {...txt(130, '#FF4A4A', 0)}>SECRET</text></g>
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#1E1A3A" c2="#2A2450" />
    <Card t={t} lines={['UNTIL', 'NOW.']} size={200} y={380} w={900} />
    <Confetti t={t} seed="s5" />
  </g>
);

// ---------------------------------------------------------------- #7 Mia: the cat did it
export const S6 = badge('7', 'MIA', '#FF5AC8');
export const S7: S = ({ t }) => (
  <g>
    <Room />
    <Desk x={1250} y={800} s={1.2} />
    <Cat x={1210} y={742} s={0.75} t={t} walk />
    <Blocky x={520} y={1180} s={0.95} kind="friend" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
    <g transform={`translate(520 150) scale(${popIn(t - 4, 5)})`}><text {...txt(110)}>NOT ME!</text></g>
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#C86A1A" c2="#E88A2A" />
    <rect x={160} y={600} width={1600} height={230} rx={30} fill="#D8D8E2" stroke={OL} strokeWidth={14} />
    {Array.from({ length: 26 }, (_, i) => { const hit = Math.floor((t * 0.5 + i * 7) % 26) < 3; return <rect key={i} x={200 + (i % 13) * 118} y={630 + Math.floor(i / 13) * 92} width={96} height={72} rx={12} fill={hit ? GOLD : '#FFFFFF'} stroke={OL} strokeWidth={6} />; })}
    <Cat x={lerp(300, 1500, clamp(t / 60))} y={640} s={1.5} t={t * 1.5} walk />
    {[0, 1, 2].map((i) => <text key={i} x={500 + i * 420} y={330 - ((t * 4 + i * 30) % 90)} {...txt(90, '#FFFFFF')} opacity={0.9}>{['asdfg', 'jkl;;', 'wwww'][i]}</text>)}
  </g>
);
export const S9: S = ({ t }) => {
  const k = clamp(t / 26), x = lerp(360, 1240, k), y = 800 - Math.sin(k * Math.PI) * 420 + (k > 0.9 ? 60 : 0);
  return (
    <g>
      <Field t={t} />
      <path d="M 1040 880 Q 1060 520 1300 520 Q 1560 520 1580 880 Z" fill="#5A5A6A" stroke={OL} strokeWidth={12} /><path d="M 1140 880 Q 1150 640 1300 640 Q 1450 640 1470 880 Z" fill="#14101E" stroke={OL} strokeWidth={10} />
      <g transform="translate(1300 800) scale(0.3)"><Token x={0} y={0} t={t} /></g>
      <Blocky x={x} y={y} s={0.34} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160, legL: -20, legR: 20 }} />
      <g transform={`translate(660 300) rotate(-5) scale(${popIn(t - 20, 5)})`}><text {...txt(110, '#C8A8FF')}>HIDDEN CAVE!</text></g>
    </g>
  );
};

// ---------------------------------------------------------------- #6 Leo: asleep on the jump button
export const S10 = badge('6', 'LEO', '#2E6AE8');
export const S11: S = ({ t }) => (
  <g>
    <Room c="#1E1A48" />
    <Desk x={1280} y={800} s={1.2} screen="#4ADE6A"><text x={0} y={-230} {...txt(70, '#FFFFFF', 0.1)}>JUMP!</text></Desk>
    <g transform="translate(700 800) rotate(72)"><Blocky x={0} y={0} s={0.85} kind="kid" face="sleepy" t={t} pose={{ armL: 60, armR: 60 }} /></g>
    <Zzz t={t} x={520} y={420} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#1E1A3A" c2="#2A2450" />
    <Card t={t} lines={['4 HOURS', 'LATER…']} size={190} y={360} w={1050} />
    <g transform="translate(960 880)"><circle r={90} fill="#FFFFFF" stroke={OL} strokeWidth={12} /><path d={`M 0 0 L ${Math.sin(t * 0.9) * 66} ${-Math.cos(t * 0.9) * 66} M 0 0 L ${Math.sin(t * 0.08) * 44} ${-Math.cos(t * 0.08) * 44}`} stroke={OL} strokeWidth={12} strokeLinecap="round" /></g>
  </g>
);
export const S13: S = ({ t }) => {
  const up = clamp(t / 36), y = lerp(900, 330, up) - Math.abs(Math.sin(t * 0.7)) * 90 * (1 - up * 0.6);
  return (
    <g>
      <Fill c="#7ACCF2" />
      <g transform={`translate(0 ${up * 700})`}>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <g key={i}><rect x={400 + (i % 2) * 760} y={760 - i * 180} width={340} height={56} rx={12} fill={['#FFC21A', '#2E6AE8', '#E2262E', '#4ADE6A'][i % 4]} stroke={OL} strokeWidth={9} /></g>)}
        <g fill="#FFFFFF" stroke={OL} strokeWidth={9}><rect x={720} y={-640} width={480} height={90} rx={30} /><rect x={820} y={-700} width={280} height={90} rx={30} /></g>
        <g transform="translate(960 -780) scale(0.4)"><Token x={0} y={0} t={t} /></g></g>
      <Blocky x={960} y={y} s={0.36} kind="kid" face="sleepy" t={t} pose={{ armL: 30, armR: 30 }} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${860 + i * 100} ${y + 40} l 0 ${60 + i * 20}`} stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" opacity={0.7} />)}
      <g transform="translate(520 300) rotate(-6)"><text {...txt(100, '#4ADE6A')}>BOING ×9,999</text></g>
    </g>
  );
};

// ---------------------------------------------------------------- #5 Grandpa Joe: the crossword
export const S14 = badge('5', 'GRANDPA JOE', '#9A7AD8');
const Grandpa: React.FC<{ x: number; y: number; s: number; face: Face; t: number; pose?: any; extra?: React.ReactNode }> = ({ x, y, s, face, t, pose, extra }) => (
  <Blocky x={x} y={y} s={s} kind="dad" face={face} t={t} pose={pose} extra={<g><rect x={-186} y={-990} width={372} height={90} rx={30} fill="#D8D8E2" stroke={OL} strokeWidth={9} /><g fill="none" stroke={OL} strokeWidth={9}><circle cx={-62} cy={-800} r={46} /><circle cx={62} cy={-800} r={46} /><path d="M -16 -800 L 16 -800" /></g>{extra}</g>} />
);
export const S15: S = ({ t }) => (
  <g>
    <Room c="#5A3A2A" floor="#3A2418" />
    <Grandpa x={520} y={1230} s={1.0} face="determined" t={t} pose={{ armL: 70, armR: 70 }} />
    <g transform={`translate(1260 480) rotate(4) scale(${popIn(t - 2, 6)})`}><rect x={-380} y={-340} width={760} height={680} rx={14} fill="#FFFFFF" stroke={OL} strokeWidth={12} />
      {Array.from({ length: 36 }, (_, i) => { const dark = [1, 4, 8, 13, 15, 20, 22, 27, 31, 34].includes(i); return <rect key={i} x={-330 + (i % 6) * 110} y={-290 + Math.floor(i / 6) * 100} width={100} height={90} fill={dark ? OL : '#FFFFFF'} stroke={OL} strokeWidth={6} />; })}
      {['G', 'O', 'L', 'D'].map((ch, i) => <text key={ch} x={-280 + (i + 2) * 110 - 220} y={-290 + 2 * 100 + 70} {...txt(80, '#E2262E', 0)} opacity={clamp((t - 10 - i * 5) / 3)}>{ch}</text>)}</g>
  </g>
);
export const S16: S = ({ t }) => {
  const typed = 'gold'.slice(0, Math.floor(clamp((t - 6) / 16) * 4.99));
  return (
    <g>
      <Rays t={t} c1="#1A1424" c2="#2A2234" />
      <g transform="translate(960 440)"><rect x={-700} y={-250} width={1400} height={500} rx={40} fill="#14101E" stroke="#5AE8F8" strokeWidth={12} />
        <text x={-640} y={-130} fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#8A8AA8">[CHAT]  xXProXx: gg</text>
        <text x={-640} y={-30} fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#8A8AA8">[CHAT]  Mia: my cat again</text>
        <text x={-640} y={110} fontFamily={FONT.game} fontWeight={900} fontSize={96} fill="#FFFFFF">GrandpaJoe: <tspan fill={GOLD}>{typed}</tspan>{Math.floor(t / 6) % 2 ? '_' : ''}</text></g>
    </g>
  );
};
export const S17: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#3A2468" c2="#5A3A98" />
    <Token x={1300} y={470} s={popIn(t - 4, 7) * 1.0} t={t} />
    <g transform={`translate(560 380) rotate(-5) scale(${popIn(t, 6)})`}><text {...txt(150, '#C8A8FF')}>SECRET</text><text y={190} {...txt(210)}>CODE!</text></g>
    <Confetti t={t} seed="s17" />
  </g>
);

// ---------------------------------------------------------------- #4 the twins: upside down
export const S18 = badge('4', 'THE TWINS', '#FF5AC8');
export const S19: S = ({ t }) => (
  <g>
    <Room c="#5A2A6A" />
    <Blocky x={440} y={1200} s={0.9} kind="mom" face="happy" t={t} pose={{ armL: 60, armR: 60 }} />
    <g transform={`translate(1300 ${ -160}) rotate(180 0 540)`}><Blocky x={0} y={1040} s={0.9} kind="mom" face="grin" t={t} pose={{ armL: 60, armR: 60 }} /></g>
    <g transform={`translate(960 360) rotate(${lerp(0, 180, ease((t - 6) / 12))})`}><rect x={-230} y={-150} width={460} height={300} rx={18} fill="#14101E" stroke={OL} strokeWidth={10} /><rect x={-200} y={-122} width={400} height={244} rx={8} fill="#4AC8FF" /><text y={30} {...txt(90, '#FFFFFF', 0.1)}>MAP</text></g>
  </g>
);
export const S20: S = ({ t }) => {
  const k = ease((t - 6) / 14);
  return (
    <g>
      <Rays t={t} c1="#1E7A34" c2="#2EA84A" />
      <g transform={`translate(960 440) rotate(${lerp(0, 180, k)})`}>
        <rect x={-520} y={-310} width={1040} height={620} rx={20} fill="#F2E4C4" stroke={OL} strokeWidth={14} />
        <path d="M -400 200 Q -200 -100 0 100 T 380 -160" stroke="#8A5A3A" strokeWidth={14} strokeDasharray="30 24" fill="none" />
        <g transform="translate(380 -180) rotate(180)"><path d="M -50 -50 L 50 50 M 50 -50 L -50 50" stroke="#E2262E" strokeWidth={24} strokeLinecap="round" /></g>
        <g transform="translate(-400 200) rotate(180)"><text {...txt(70, OL, 0)}>START</text></g>
        <g transform="translate(120 -220) rotate(180)"><text {...txt(60, '#E2262E', 0)}>TOKEN ➜</text></g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- #3 Max: 1,000 losses
export const S21 = badge('3', 'MAX', '#E2262E');
export const S22: S = ({ t }) => {
  const n = Math.round(lerp(1, 1000, ease(t / 40)));
  return (
    <g>
      <Rays t={t} c1="#5A0A0A" c2="#7A1A1A" />
      <Blocky x={480} y={1260} s={1.05} kind="kid" face="despair" t={t} pose={{ armL: 100, armR: 100 }} />
      <g transform={`translate(1180 400) rotate(-4) scale(${1 + (t % 4 < 2 ? 0.03 : 0)})`}><text {...txt(150, '#FF4A4A')}>YOU LOSE</text></g>
      <g transform="translate(1180 640)"><text {...txt(200, '#FFFFFF')}>×{n.toLocaleString('en-US')}</text></g>
    </g>
  );
};
export const S23: S = ({ t }) => (
  <g>
    <Field t={t} />
    <g transform={`translate(1240 ${300 + Math.sin(t * 0.2) * 10})`}><g fill="#FFFFFF" stroke={OL} strokeWidth={10}><rect x={-260} y={-60} width={520} height={150} rx={50} /><rect x={-150} y={-140} width={300} height={150} rx={50} /></g><circle cx={-70} cy={-20} r={14} fill={OL} /><circle cx={70} cy={-20} r={14} fill={OL} /><path d="M -50 46 Q 0 20 50 46" stroke={OL} strokeWidth={10} fill="none" strokeLinecap="round" /><path d="M -70 0 q -6 30 0 44" stroke="#7FD0FF" strokeWidth={12} strokeLinecap="round" /></g>
    <g transform={`translate(1160 ${lerp(420, 640, ease((t - 6) / 14))}) scale(0.34)`}><Token x={0} y={0} t={t} /></g>
    <Blocky x={700} y={900} s={0.6} kind="kid" face={t > 18 ? 'starry' : 'despair'} t={t} pose={{ armL: t > 18 ? 160 : 20, armR: t > 18 ? 160 : 20 }} />
    <g transform={`translate(500 200) rotate(-5) scale(${popIn(t - 16, 5)})`}><text {...txt(100, '#7ACCF2')}>PITY PRIZE</text></g>
  </g>
);

// ---------------------------------------------------------------- #2 a baby
export const S24 = badge('2', 'A BABY', '#3A9AD8');
const Baby: React.FC<{ x: number; y: number; s: number; face: Face; t: number; held?: React.ReactNode }> = ({ x, y, s, face, t, held }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-70, 70].map((lx) => <rect key={lx} x={lx - 46} y={-70} width={92} height={74} rx={26} fill="#F4E2CC" stroke={OL} strokeWidth={9} />)}
    <rect x={-120} y={-290} width={240} height={230} rx={50} fill="#FFE27A" stroke={OL} strokeWidth={9} />
    <path d="M -120 -150 Q 0 -110 120 -150 L 120 -100 Q 120 -50 70 -50 L -70 -50 Q -120 -50 -120 -100 Z" fill="#FFFFFF" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
    {[-128, 128].map((ax) => <g key={ax} transform={`translate(${ax} -250) rotate(${ax < 0 ? 150 : -150})`}><rect x={-34} y={-10} width={68} height={130} rx={28} fill="#FFE27A" stroke={OL} strokeWidth={9} /></g>)}
    <g transform="translate(0 -440)"><CubeHead face={face} hair={'none' as any} t={t} /><path d="M -10 -176 q 50 -60 10 -90 q -40 -10 -30 30" stroke="#8A5A32" strokeWidth={14} fill="none" strokeLinecap="round" /><circle cx={0} cy={86} r={40} fill="#7ACCF2" stroke={OL} strokeWidth={8} /><circle cx={0} cy={86} r={14} fill="#FFFFFF" stroke={OL} strokeWidth={6} /></g>
    {held}
  </g>
);
export const S25: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#1A5A8A" c2="#2A7AAA" cx={1200} />
    <Cams t={t} face="shock" />
    <Baby x={1200} y={960} s={1.25} face="happy" t={t} held={<g transform="translate(0 -640) scale(0.42)"><Token x={0} y={0} t={t} /></g>} />
    {[[820, 300], [1580, 320], [1640, 620]].map(([x, y], i) => <text key={i} x={x} y={y} {...txt(150, '#FFFFFF')} transform={`rotate(${(i - 1) * 14} ${x} ${y})`}>?</text>)}
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#14101E" c2="#1E1A2E" />
    <g transform={`translate(960 520) scale(${popIn(t, 5)}) rotate(-3)`}><text {...txt(330, '#FF4A4A', 0.08)}>NOBODY.</text></g>
  </g>
);

// ---------------------------------------------------------------- #1 you, and the truth
export const S27: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#C88A1A" c2="#E8A82A" />
    <g transform={`translate(960 600) scale(${t < 5 ? lerp(3, 1, easeOut(t / 5)) : 1 + Math.sin(t * 0.4) * 0.02}) rotate(-4)`}><text {...txt(620, '#FFFFFF', 0.08)}>#1</text></g>
    <Sparkles t={t} seed="s27" /><Confetti t={t} seed="s27" />
  </g>
);
export const S28: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#5A0A0A" c2="#8A1A1A" />
    <g transform={`translate(960 540) scale(${popIn(t, 5)})`}>
      <rect x={-330} y={-360} width={660} height={640} rx={40} fill="#14101E" stroke={GOLD} strokeWidth={16} /><circle cy={-120} r={110} fill="#2A2234" stroke={GOLD} strokeWidth={10} /><rect x={-170} y={20} width={340} height={230} rx={60} fill="#2A2234" stroke={GOLD} strokeWidth={10} /><text y={-80} {...txt(150, GOLD, 0)}>?</text>
    </g>
    <g transform={`translate(1400 380) rotate(8) scale(${popIn(t - 5, 5)})`}><text {...txt(210, '#FFFFFF')}>YOU.</text></g>
    <g transform={`translate(1340 660) scale(${0.8 + Math.sin(t * 0.6) * 0.05})`}><path d="M 200 0 L -40 0 M 40 -80 L -60 0 L 40 80" stroke={GOLD} strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#1E1A3A" c2="#2A2450" cx={1200} />
    <Cams t={t} face="worried" />
    <g transform={`translate(1160 440) rotate(-4) scale(${popIn(t, 6)})`}><text {...txt(140)}>THE TRUTH</text><text y={160} {...txt(96, GOLD)}>NO ONE TELLS YOU</text></g>
  </g>
);
const StartScreen: React.FC<{ t: number; slide?: number }> = ({ t, slide = 0 }) => (
  <g>
    <Fill c="#2A6AC8" /><Rays t={t} c1="#2A6AC8" c2="#3A7AD8" />
    <g transform="translate(960 260) rotate(-3)"><text {...txt(190, GOLD)}>BLOCK QUEST</text></g>
    <g transform="translate(960 620) scale(0.62)" opacity={clamp(slide * 2)}><Token x={0} y={0} t={t} /></g>
    <g transform={`translate(${960 + slide * 560} 620) rotate(${slide * 14}) scale(${1 - slide * 0.25})`}><rect x={-330} y={-110} width={660} height={220} rx={50} fill="#4ADE6A" stroke={OL} strokeWidth={16} /><rect x={-300} y={-84} width={600} height={70} rx={30} fill="#FFFFFF" opacity={0.25} /><text y={44} {...txt(140, '#FFFFFF', 0.1)}>START</text></g>
  </g>
);
export const S30: S = ({ t }) => (
  <g>
    <StartScreen t={t} />
    <g transform={`translate(960 440) scale(${popIn(t - 6, 5)})`}><text {...txt(84, '#FF4A4A')}>NEVER HIDDEN.</text></g>
  </g>
);
export const S31: S = ({ t }) => (
  <g>
    <StartScreen t={t} slide={ease((t - 8) / 16)} />
    {t > 24 ? <><Sparkles t={t} seed="s31" /><Confetti t={t - 24} seed="s31" /></> : null}
  </g>
);
export const S32: S = ({ t }) => (
  <g>
    <StartScreen t={t} slide={1} />
    <g transform={`translate(${620 - Math.abs(Math.sin(t * 0.5)) * 50} 620)`}><path d="M -220 0 L 20 0 M -60 -80 L 40 0 L -60 80" stroke="#FFFFFF" strokeWidth={44} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M -220 0 L 20 0 M -60 -80 L 40 0 L -60 80" stroke={OL} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.2} /></g>
    <g transform={`translate(960 440) scale(${popIn(t, 5)})`}><text {...txt(90, '#4ADE6A')}>GO CHECK.</text></g>
  </g>
);
export const S33: S = ({ t }) => (
  <g>
    <Rays t={t} c1="#3A1E6A" c2="#4A2A88" cx={1200} />
    <Cams t={t} face="starry" />
    <Token x={1560} y={400} s={0.62} t={t} />
    <g transform={`translate(1060 380) rotate(-4) scale(${popIn(t, 6)})`}><text {...txt(130)}>COMMENT</text><text y={180} {...txt(210, GOLD)}>TOKEN</text></g>
    <g transform={`translate(1160 760) scale(${popIn(t - 10, 5)})`}><text {...txt(70, '#FFFFFF')}>if you found it</text></g>
    <Confetti t={t} seed="s33" />
  </g>
);
