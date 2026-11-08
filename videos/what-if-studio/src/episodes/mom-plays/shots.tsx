import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Bedroom, Burst, Sparkles, Sky, Lava, Block, Confetti, Gem, SpeedLines, Storm, Rain } from '../ten-seconds/shots';
import { Dragon, Toast, Ground } from '../best-friend/shots';
import words from './words.json';

// "What if your mom started playing the game?" The blocky-game What If style, role-swap variation: Mom goes from
// walking into lava to world #1, and you end up sending her to bed. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const L = { l1: at('Level', 1), l50: at('Level', 2), l500: at('Level', 3), l999: at('Level', 4) };
const levelAt = (sec: number) => (sec < L.l1 ? 0 : sec < L.l50 ? 1 : sec < L.l500 ? 50 : sec < L.l999 ? 500 : 999);

/** Mom's level pill at the top (fixed HUD): pink, ticking up, popping when it changes. */
export const MomPill: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, lv = levelAt(sec);
  const pop = [L.l1, L.l50, L.l500, L.l999].some((c) => sec >= c && sec < c + 0.25) ? 1.18 : 1;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-215} y={-44} width={430} height={88} rx={44} fill="#1A1424" stroke={lv >= 999 ? '#FFD23F' : 'none'} strokeWidth={6} />
      <circle cx={-168} cy={0} r={24} fill="#FF7AE0" stroke="#FFFFFF" strokeWidth={4} />
      <text x={20} y={18} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill="#FFFFFF">{lv ? `MOM · LVL ${lv}` : 'MOM · NEW'}</text>
    </g>
  );
};
const LevelBadge: React.FC<{ t: number; n: number; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#8A1A6A" c2="#B82A8A" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`lv${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-280} y={-160} width={560} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-256} y={-136} width={512} height={272} rx={44} fill="none" stroke="#FF5AC8" strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>LEVEL</text>
      <text y={110} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={n >= 100 ? 150 : 170} fill="#FF5AC8" stroke={OL} strokeWidth={12} paintOrder="stroke">{n}</text>
    </g>
  </g>
);
const badge = (n: number): S => ({ t, len }) => <LevelBadge t={t} n={n} len={len} />;
/** The living room at night: a sofa, a TV lighting the room, Mom with a controller. */
export const LivingRoom: React.FC<{ t: number; tv?: string }> = ({ t, tv = '#4AC8FF' }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#2A2458" />
    <rect x={-300} y={1360} width={W + 600} height={900} fill="#4A3A5A" />
    <rect x={120} y={480} width={840} height={480} rx={20} fill="#14101E" stroke={OL} strokeWidth={12} />
    <rect x={150} y={510} width={780} height={420} rx={8} fill={tv} opacity={0.85 + 0.15 * Math.sin(t * 0.9)} />
    <path d="M 150 930 L -100 1900 L 1180 1900 L 930 930 Z" fill={tv} opacity={0.12} />
    <rect x={460} y={960} width={160} height={60} fill="#14101E" />
    <rect x={40} y={1280} width={1000} height={220} rx={60} fill="#7A4A8A" stroke={OL} strokeWidth={10} />
    <rect x={60} y={1180} width={960} height={140} rx={50} fill="#8A5A9A" stroke={OL} strokeWidth={10} />
  </g>
);
export const Controller: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2.2) * 4}) scale(${s}) rotate(${Math.sin(t * 1.3) * 6})`}>
    <path d="M -110 -40 Q -150 -40 -160 20 Q -170 80 -120 80 Q -90 80 -70 40 L 70 40 Q 90 80 120 80 Q 170 80 160 20 Q 150 -40 110 -40 Z" fill="#2A2234" stroke={OL} strokeWidth={8} />
    <circle cx={-90} cy={0} r={18} fill="#4A4458" /><circle cx={80} cy={-8} r={11} fill="#E2262E" /><circle cx={105} cy={12} r={11} fill="#4ADE6A" />
  </g>
);
const Leaderboard: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 860) scale(${popIn(t) * 1.15})`}>
    <rect x={-380} y={-420} width={760} height={840} rx={40} fill="#1E1A2E" stroke="#FFD23F" strokeWidth={12} />
    <text y={-330} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={56} fill="#FFD23F">WORLD RANKING</text>
    {[['#1', 'MOM', '#FFD23F'], ['#2', 'xXProGamerXx', '#C8C8D8'], ['#3', 'NoScope_Kid', '#D89A5A'], ['#4', 'BlockLord99', '#8A8AA8']].map(([r, n, c], i) => (
      <g key={i} transform={`translate(0 ${-200 + i * 150}) scale(${popIn(t - 4 - i * 3, 5)})`}>
        <rect x={-330} y={-56} width={660} height={112} rx={24} fill={i ? '#2E2A48' : '#5A3A08'} stroke={c} strokeWidth={6} />
        <text x={-280} y={20} fontFamily={FONT.game} fontWeight={900} fontSize={52} fill={c}>{r}</text>
        <text x={-160} y={20} fontFamily={FONT.game} fontWeight={900} fontSize={i ? 42 : 56} fill="#FFFFFF">{n}</text>
        {i === 0 ? <path d="M 220 -30 L 240 10 L 280 -40 L 300 10 L 320 -30 L 310 30 L 230 30 Z" fill="#FFD23F" stroke={OL} strokeWidth={5} /> : null}
      </g>
    ))}
  </g>
);
const Kitchen: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#F2E4C4" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-300} y={i * 140} width={W + 600} height={4} fill="#E2D4B4" />)}
    <rect x={-300} y={1300} width={W + 600} height={900} fill="#C88A52" />
    <rect x={60} y={420} width={420} height={300} rx={10} fill="#8AC8E8" stroke={OL} strokeWidth={10} />
    <rect x={620} y={360} width={360} height={940} rx={20} fill="#E8E8F0" stroke={OL} strokeWidth={10} />
    <rect x={-100} y={1180} width={1280} height={80} fill="#9A6A3A" stroke={OL} strokeWidth={10} />
    {/* a cold, empty stove pan */}
    <ellipse cx={300} cy={1160} rx={160} ry={34} fill="#3A3448" stroke={OL} strokeWidth={8} />
  </g>
);
const Bowl: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-110 + (i % 6) * 44 + (i > 5 ? 22 : 0)} cy={-30 - (i > 5 ? 26 : 0) + Math.sin(t * 0.3 + i) * 3} r={20} fill={['#FFC21A', '#E2262E', '#4ADE6A', '#FF7AE0'][i % 4]} stroke={OL} strokeWidth={4} />)}
    <path d="M -170 -30 Q -170 110 0 110 Q 170 110 170 -30 Z" fill="#FFFFFF" stroke={OL} strokeWidth={9} />
    <path d="M -170 -30 L 170 -30" stroke={OL} strokeWidth={9} />
  </g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={540} y={1560} s={0.7} kind="mom" face="happy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g>} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A6A" c2="#B82A8A" />
    <Blocky x={540} y={1780} s={1.3} kind="mom" face="worried" t={t} pose={{ armL: 60, armR: 60 }} />
    <Controller x={540} y={1240} s={1.6} t={t * 2} />
    <g transform={`translate(830 700) rotate(10) scale(${popIn(t - 4)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={140} fill="#FFD23F" stroke={OL} strokeWidth={12} paintOrder="stroke">?!</text></g>
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Sky /><Lava t={t} />
    <Block x={300} y={1150} w={260} c="#FFC21A" /><Block x={820} y={1080} w={200} c="#2E6AE8" />
    <Blocky x={lerp(300, 470, clamp(t / 20))} y={lerp(1150, 1500, clamp((t - 12) / 14))} s={0.42} kind="mom" face={t > 12 ? 'shock' : 'happy'} t={t} pose={{ armL: t > 12 ? 160 : 10, armR: t > 12 ? 160 : 10 }} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Sky /><Lava t={t} />
    <Block x={300} y={1150} w={260} c="#FFC21A" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={470 + Math.cos(i) * (40 + t * 10)} cy={1320 - Math.abs(Math.sin(i)) * (40 + t * 14)} r={Math.max(6, 40 - t * 2)} fill="#5A5A6A" opacity={Math.max(0, 1 - t / 20)} />)}
    <Toast t={t - 2} text="MOM fell into lava (x2)" c="#E2262E" />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Kitchen t={t} />
    <Blocky x={360} y={1420} s={0.6} kind="kid" face="worried" t={t} />
    <g transform={`translate(800 1080) scale(${popIn(t - 3)})`}><rect x={-120} y={-60} width={240} height={120} rx={20} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><text y={18} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#E2262E">NO DINNER</text></g>
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Kitchen t={t} />
    <Bowl x={540} y={1240} t={t} />
    <Blocky x={540} y={1900} s={1.1} kind="kid" face="sleepy" t={t} energy={0.3} pose={{ armR: 100 }} />
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Bowl x={540} y={1000} t={t} />
    <g transform={`translate(540 640) scale(${popIn(t - 2)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={84} fill="#FFFFFF" stroke={OL} strokeWidth={10} paintOrder="stroke">DAY 14 OF CEREAL</text></g>
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    <Rain t={t} kind="gem" n={14} seed="mg" />
    <g transform={`translate(540 600) scale(${popIn(t)})`}><rect x={-330} y={-60} width={660} height={120} rx={60} fill="#1A1424" stroke="#5AE8F8" strokeWidth={8} /><Gem x={-250} y={0} s={0.8} />
      <text x={40} y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill="#5AE8F8">{Math.max(0, Math.round(lerp(50000, 0, clamp((t - 6) / 18)))).toLocaleString('en-US')}</text></g>
    <Blocky x={540} y={1320} s={0.5} kind="mom" face="starry" t={t} pose={{ armL: 140, armR: 140 }} />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
    <Dragon x={540} y={1450} s={1.25} t={t} happy pink />
    <Sparkles t={t} seed="pd" />
    <Confetti t={t} seed="pd" />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={540} y={1950} s={1.45} kind="kid" face="angry" t={t} pose={{ armL: 150, armR: 150 }} />
    <SpeedLines t={t} c="#FF8A8A" o={0.3} />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#E2262E" />
    <Blocky x={540} y={1760} s={1.15} kind="mom" face="determined" t={t * 1.5} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t * 3} /></g>} />
    <g transform={`translate(860 640) rotate(-8) scale(${popIn(t - 4)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={110} fill="#FFFFFF" stroke={OL} strokeWidth={12} paintOrder="stroke">SHH!</text></g>
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Blocky x={700} y={1320} s={0.85} kind="boss" face="shock" t={t} pose={{ armL: 140, armR: 140 }} />
    <Blocky x={260} y={1320} s={0.45} kind="mom" face="angry" t={t} pose={{ armR: 95, lean: 6 }} />
    <SpeedLines t={t} c="#FFF6C0" o={0.4} />
  </g>
);
export const S13 = badge(999);
export const S14: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Leaderboard t={t} />
    <Confetti t={t} seed="lb" />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#FFD23F" />
    <Blocky x={540} y={1760} s={1.15} kind="mom" face="starry" t={t} pose={{ armL: 160, armR: 160 }} />
    <g transform={`translate(540 560) scale(${popIn(t - 2)})`}><path d="M -110 60 L -80 -60 L -30 10 L 0 -90 L 30 10 L 80 -60 L 110 60 Z" fill="#FFD23F" stroke={OL} strokeWidth={9} strokeLinejoin="round" /></g>
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={240} y={1500} s={0.6} kind="kid" face="smirk" t={t} pose={{ armR: 100 }} />
    <Blocky x={720} y={1520} s={0.6} kind="mom" face="determined" t={t * 1.4} pose={{ armL: 60, armR: 60 }} />
    <g transform={`translate(860 560) rotate(8) scale(${popIn(t - 6, 5)})`}><rect x={-140} y={-60} width={280} height={120} rx={20} fill="#2A2234" stroke="#7ACCF2" strokeWidth={8} /><text y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#7ACCF2">23:47</text></g>
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1800} s={1.3} kind="kid" face="angry" t={t} pose={{ armR: 120 }} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Blocky x={540} y={1850} s={1.35} kind="mom" face="yell" t={t * 1.5} pose={{ armL: 160, armR: 160 }} />
    <g transform={`translate(540 600) scale(${popIn(t - 2)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={96} fill="#FFFFFF" stroke={OL} strokeWidth={12} paintOrder="stroke">+10 SEC?</text></g>
    <SpeedLines t={t} o={0.3} />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={300} y={1520} s={0.6} kind="kid" face="smirk" t={t} />
    <Blocky x={760} y={1520} s={0.6} kind="mom" face="grin" t={t} pose={{ armL: 60, armR: 60 }} />
    <Toast t={t - 3} text="COMMENT MOM" c="#FF7AE0" />
    <Sparkles t={t} seed="end" />
  </g>
);
export const S20 = badge(1);
export const S21 = badge(50);
export const S22 = badge(500);

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S23 = close(S3, 470, 1350, 1.7, 14);    // "lava": the fall
export const S24 = close(S14, 540, 640, 1.5, 20);    // "number one": the #1 row
export const S25 = close(S12, 260, 1000, 1.7, 20);   // "boss fight": Mom mid-punch
export const S26 = close(S1, 540, 1000, 1.6, 20);   // "playing": Mom and the controller
export const S27 = close(S2, 540, 1240, 1.6, 20);   // "this one?": the controller
export const S28 = close(S5, 360, 1000, 1.7, 20);   // "dinner": the kid at the cold stove
export const S29 = close(S8, 540, 900, 1.5, 20);    // "gems": Mom spending
export const S30 = close(S10, 540, 1000, 1.4, 20);  // "mine!": the kid yelling
export const S31 = close(S16, 860, 700, 1.8, 20);   // "send her": the clock at 23:47
export const S32 = close(S17, 540, 1000, 1.4, 20);  // "Bedtime": the kid
