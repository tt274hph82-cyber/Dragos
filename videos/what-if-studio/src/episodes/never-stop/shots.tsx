import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Bedroom, Burst, Sparkles, Confetti, SpeedLines, Storm, Rain } from '../ten-seconds/shots';
import { Toast } from '../best-friend/shots';
import { Controller } from '../mom-plays/shots';
import words from './words.json';

// "What if you never stopped playing?" The blocky-game What If style, time-skip variation: hour one to year
// eighty in one chair, then your grandkid asks for a turn. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });
// playtime in hours at each jump: hour 1, day 10, month 6, year 40, year 80
const STEPS: [number, number][] = [[0, 0], [at('Hour'), 1], [at('Day'), 240], [at('Month'), 4380], [at('Year', 1), 350400], [at('Year', 2), 700800]];

/** The playtime counter (fixed HUD): it races up to the next value at every time jump. */
export const PlayClock: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  let h = 0, pop = 1;
  for (let i = 1; i < STEPS.length; i++) if (sec >= STEPS[i][0]) { h = lerp(STEPS[i - 1][1], STEPS[i][1], easeOut(clamp((sec - STEPS[i][0]) / 0.6))); if (sec < STEPS[i][0] + 0.6) pop = 1.12; }
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-300} y={-46} width={600} height={92} rx={46} fill="#1A1424" stroke="#FFD23F" strokeWidth={6} />
      <circle cx={-250} cy={0} r={26} fill="#FFD23F" stroke={OL} strokeWidth={4} /><path d="M -250 -14 L -250 0 L -238 8" stroke={OL} strokeWidth={6} fill="none" strokeLinecap="round" />
      <text x={-210} y={14} fontFamily={FONT.game} fontWeight={900} fontSize={34} fill="#B8B0D8">PLAYTIME</text>
      <text x={270} y={16} textAnchor="end" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill="#FFFFFF">{Math.round(h).toLocaleString('en-US')} h</text>
    </g>
  );
};
const TimeBadge: React.FC<{ t: number; unit: string; n: string; len?: number; c?: string }> = ({ t, unit, n, len = 30, c = '#2EA84A' }) => (
  <g>
    <Burst t={t} c1="#1E3A6A" c2="#2A4A88" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`tb${unit}${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-260} y={-160} width={520} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-236} y={-136} width={472} height={272} rx={44} fill="none" stroke={c} strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>{unit}</text>
      <text y={110} {...txt(170, c)}>{n}</text>
    </g>
  </g>
);
const badge = (unit: string, n: string, c?: string): S => ({ t, len }) => <TimeBadge t={t} unit={unit} n={n} len={len} c={c} />;

/** Old age on top of a Blocky (drawn in its local space through `extra`): grey hair, glasses and a beard. */
const Old: React.FC<{ beard?: number }> = ({ beard = 120 }) => (
  <g>
    <path d="M -178 -880 Q -180 -975 0 -978 Q 180 -975 190 -880 L 190 -930 Q 0 -1010 -178 -930 Z" fill="#D8D8E2" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-182} y={-990} width={372} height={110} rx={30} fill="#D8D8E2" stroke={OL} strokeWidth={8} />
    <g fill="none" stroke={OL} strokeWidth={8}><circle cx={-62} cy={-800} r={46} /><circle cx={62} cy={-800} r={46} /><path d="M -16 -800 L 16 -800" /></g>
    <path d={`M -150 -700 Q -140 -620 -60 -${640 - beard} L 0 -${600 - beard} L 60 -${640 - beard} Q 140 -620 150 -700 Q 80 -650 0 -660 Q -80 -650 -150 -700 Z`} fill="#E8E8F0" stroke={OL} strokeWidth={8} strokeLinejoin="round" />
  </g>
);
/** The gaming den: the bedroom, a desk with a glowing monitor and a big gaming chair. */
const Den: React.FC<{ t: number; mess?: number; dark?: number; screen?: string }> = ({ t, mess = 0, dark = 0.35, screen = '#4AC8FF' }) => (
  <g>
    <Bedroom t={t} dark={dark} />
    <ellipse cx={540} cy={1100} rx={520} ry={420} fill={screen} opacity={0.12} />
    {mess > 0 ? Array.from({ length: Math.round(mess * 10) }, (_, i) => <g key={i} transform={`translate(${80 + random(`pz${i}`) * 920} ${1560 + random(`pzy${i}`) * 260}) rotate(${random(`pzr${i}`) * 40 - 20})`}><rect x={-80} y={-20} width={160} height={40} fill="#E8C88A" stroke={OL} strokeWidth={5} /></g>) : null}
  </g>
);
const Chair: React.FC<{ x: number; y: number; s?: number; melt?: number }> = ({ x, y, s = 1, melt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -220 0 L -230 -900 Q -230 -1000 -130 -1000 L 130 -1000 Q 230 -1000 230 -900 L 220 0 Q ${melt * 60} ${melt * 120} -220 0 Z`} fill="#2A2234" stroke={OL} strokeWidth={10} />
    <path d="M -160 -950 L -160 -100 M 160 -950 L 160 -100" stroke="#E2262E" strokeWidth={24} />
    {melt > 0 ? [-180, -60, 90, 200].map((dx, i) => <path key={i} d={`M ${dx - 30} -10 Q ${dx} ${80 + melt * (60 + i * 30)} ${dx + 30} -10 Z`} fill="#2A2234" stroke={OL} strokeWidth={6} />) : null}
  </g>
);
const Desk: React.FC<{ t: number; screen?: string; label?: string }> = ({ t, screen = '#4AC8FF', label }) => (
  <g>
    <rect x={-100} y={1360} width={1280} height={60} fill="#5A3A2A" stroke={OL} strokeWidth={10} />
    <rect x={-100} y={1420} width={1280} height={600} fill="#4A2E20" />
    <g transform="translate(860 1360)">
      <rect x={-200} y={-300} width={400} height={260} rx={16} fill="#14101E" stroke={OL} strokeWidth={10} />
      <rect x={-180} y={-280} width={360} height={220} rx={8} fill={screen} opacity={0.9 + 0.1 * Math.sin(t * 0.8)} />
      {label ? <text y={-150} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF">{label}</text> : null}
      <rect x={-30} y={-40} width={60} height={40} fill="#14101E" />
    </g>
  </g>
);
const Gamer: React.FC<{ t: number; face?: any; old?: number; mess?: number; melt?: number; spiders?: number; screen?: string; label?: string; dark?: number; arms?: number }> = ({ t, face = 'determined', old, mess = 0, melt = 0, spiders = 0, screen, label, dark, arms = 60 }) => (
  <g>
    <Den t={t} mess={mess} dark={dark} screen={screen} />
    <Chair x={400} y={1480} s={0.62} melt={melt} />
    <Blocky x={400} y={1480} s={0.6} kind="kid" face={face} t={t} pose={{ armL: arms, armR: arms }}
      extra={<g>{old !== undefined ? <Old beard={old} /> : null}<g transform="translate(0 -420)"><Controller x={0} y={0} t={t * 2} /></g>{spiders > 0 ? <SpiderCity n={spiders} t={t} /> : null}</g>} />
    <Desk t={t} screen={screen} label={label} />
  </g>
);
/** Tiny spider town on top of your head (local Blocky space). */
const SpiderCity: React.FC<{ n: number; t: number }> = ({ n, t }) => (
  <g>
    {[[-130, 90, 160], [-40, 70, 220], [50, 80, 180], [130, 60, 130]].map(([x, w, h], i) => (i < n * 4 ? <g key={i}><rect x={x - w / 2} y={-960 - h} width={w} height={h} fill="#6A6478" stroke={OL} strokeWidth={6} />
      {[0, 1, 2].map((k) => <rect key={k} x={x - 12} y={-940 - h + k * 50} width={24} height={24} fill="#FFE07A" />)}</g> : null))}
    {Array.from({ length: Math.round(n * 6) }, (_, i) => <g key={i} transform={`translate(${-160 + i * 60} ${-960 + Math.sin(t * 0.6 + i) * 10})`}><circle r={14} fill={OL} />{[-1, 1].map((d) => <path key={d} d={`M 0 0 L ${d * 26} -10 M 0 0 L ${d * 26} 10`} stroke={OL} strokeWidth={4} />)}</g>)}
    <path d="M -180 -960 Q -200 -1100 -100 -1180 M 180 -960 Q 210 -1100 120 -1180" stroke="#FFFFFF" strokeWidth={3} opacity={0.7} fill="none" />
  </g>
);
const Stink: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g>{[0, 1, 2].map((i) => <path key={i} d={`M ${x - 100 + i * 100} ${y} q 30 -60 0 -120 q -30 -60 0 -120`} stroke="#6AC84A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6 + 0.3 * Math.sin(t * 0.4 + i)} transform={`translate(0 ${-((t * 3 + i * 40) % 80)})`} />)}
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={x + Math.cos(t * 0.5 + i * 1.6) * 160} cy={y - 200 + Math.sin(t * 0.7 + i) * 80} r={9} fill={OL} />)}</g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => <Gamer t={t} face="smirk" />;
export const S2: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#2A6AC8" />
    <SpeedLines t={t} o={0.25} />
    <g transform={`translate(540 640) scale(${popIn(t, 6)}) rotate(-4)`}>
      <text y={0} {...txt(150, '#FFD23F', 16)}>BLOCK</text>
      <text y={150} {...txt(150, '#FFFFFF', 16)}>QUEST</text>
    </g>
    <g transform={`translate(540 1060) scale(${t > 8 && t < 11 ? 0.9 : 1})`}><rect x={-200} y={-70} width={400} height={140} rx={40} fill="#4ADE6A" stroke={OL} strokeWidth={10} /><text y={26} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={76} fill="#FFFFFF">PLAY</text></g>
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1850} s={1.35} kind="kid" face="smirk" t={t} pose={{ armR: 160 }} />
    <g transform={`translate(780 560) rotate(8) scale(${popIn(t - 3)})`}><rect x={-220} y={-70} width={440} height={140} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={9} /><text y={24} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill={OL}>1 MORE!</text></g>
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Gamer t={t} face="determined" />
    <Blocky x={930} y={1560} s={0.5} kind="mom" face="yell" t={t} pose={{ armL: 140, armR: 40 }} />
    <g transform={`translate(860 560) scale(${popIn(t - 2, 5)})`}><rect x={-170} y={-60} width={340} height={120} rx={20} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><text y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#FF5AC8">DINNER!</text></g>
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A4A8A" c2="#2A5AA8" />
    <Blocky x={540} y={1850} s={1.35} kind="kid" face="determined" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} s={1.2} t={t * 3} /></g>} />
    <SpeedLines t={t} o={0.25} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Gamer t={t} face="sleepy" mess={0.6} />
    <Stink t={t} x={400} y={900} />
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Gamer t={t} face="sleepy" mess={1} />
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#3A8A2A" opacity={0.35 * clamp(t / 8)} />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${200 + i * 340} ${1640 - Math.abs(Math.sin(t * 0.3 + i)) * 60}) scale(${popIn(t - 3 - i * 2, 5) * 0.8})`}>
      <ellipse rx={70} ry={50} fill="#4AA84A" stroke={OL} strokeWidth={7} /><circle cx={-30} cy={-50} r={22} fill="#FFFFFF" stroke={OL} strokeWidth={6} /><circle cx={30} cy={-50} r={22} fill="#FFFFFF" stroke={OL} strokeWidth={6} /><circle cx={-30} cy={-50} r={9} fill={OL} /><circle cx={30} cy={-50} r={9} fill={OL} />
    </g>)}
    <g transform={`translate(540 580) scale(${popIn(t - 4)}) rotate(-5)`}><text {...txt(120, '#6AE84A')}>SWAMP</text></g>
  </g>
);
export const S8: S = ({ t }) => <Gamer t={t} face="sleepy" mess={1} melt={easeOut(clamp(t / 16))} dark={0.45} />;
export const S9: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Blocky x={540} y={1950} s={1.25} kind="kid" face="sleepy" t={t} extra={<SpiderCity n={clamp(t / 12)} t={t} />} />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Gamer t={t} face="sleepy" mess={1} melt={1} dark={0.55} />
    <Blocky x={930} y={1560} s={0.5} kind="mom" face="worried" t={t} pose={{ armL: 40, armR: 40 }} />
    <g transform={`translate(720 780) scale(${popIn(t - 2, 5)})`}><text {...txt(100, '#FFFFFF')}>HELLO?</text></g>
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A4A6A" c2="#2A5A8A" />
    <Blocky x={540} y={2060} s={1.35} kind="kid" face="angry" t={t} pose={{ armL: 60, armR: 60 }} />
    <g transform={`translate(540 640) scale(${popIn(t - 2) * 0.75})`}>
      <rect x={-330} y={-50} width={660} height={100} rx={50} fill="#1A1424" stroke="#5AE8F8" strokeWidth={6} />
      <rect x={-310} y={-30} width={620 * lerp(0.9, 0.99, clamp(t / 20))} height={60} rx={30} fill="#5AE8F8" />
      <text y={16} {...txt(48, '#FFFFFF', 8)}>LVL 98 / 99</text>
    </g>
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Den t={t} mess={1} dark={0.55} />
    <Chair x={400} y={1480} s={0.62} melt={1} />
    <Blocky x={400} y={1480} s={0.6} kind="kid" face="sleepy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g><Old beard={lerp(150, 760, easeOut(clamp(t / 18)))} /><g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g></g>} />
    <Desk t={t} />
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#14101E" />
    <g transform={`translate(540 860) scale(${popIn(t, 5) * 1.1})`}>
      <rect x={-340} y={-240} width={680} height={480} rx={30} fill="#1E1A2E" stroke="#5AE8F8" strokeWidth={10} />
      <text y={-120} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#B8B0D8">LEVEL 99,999</text>
      <text y={10} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={70} fill="#FFFFFF">NO MORE</text>
      <text y={100} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={70} fill="#FFFFFF">LEVELS</text>
      <text y={190} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={40} fill="#5AE8F8">please go outside</text>
    </g>
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Blocky x={680} y={1400} s={0.85} kind="boss" face={t > 10 ? 'despair' : 'angry'} t={t} pose={{ armL: 140, armR: 140, lean: t > 10 ? lerp(0, 40, clamp((t - 10) / 8)) : 0 }} />
    <Blocky x={240} y={1400} s={0.42} kind="kid" face="determined" t={t} pose={{ armR: 100, lean: 8 }} extra={<Old beard={300} />} />
    {t > 10 ? <SpeedLines t={t} c="#FFF6C0" o={0.4} /> : null}
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1850} s={1.25} kind="kid" face="starry" t={t} pose={{ armL: 165, armR: 165 }} extra={<Old beard={420} />} />
    <Confetti t={t} seed="win" />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Den t={t} mess={1} dark={0.3} />
    <Chair x={400} y={1480} s={0.62} melt={1} />
    <Blocky x={400} y={1480} s={0.6} kind="kid" face="happy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g><Old beard={760} /><g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g></g>} />
    <Desk t={t} screen="#FFD23F" label="VICTORY" />
    <Blocky x={lerp(1200, 860, easeOut(clamp(t / 10)))} y={1300} s={0.4} kind="friend" face="happy" t={t} pose={{ armR: 120 }} />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6AA8" c2="#2A8AC8" />
    <Blocky x={540} y={1850} s={1.35} kind="friend" face="happy" t={t} pose={{ armL: 30, armR: 140 }} />
    <Sparkles t={t} seed="gk" />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1850} s={1.3} kind="kid" face="grin" t={t} extra={<Old beard={420} />} />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Den t={t} dark={0.3} screen="#4ADE6A" />
    <Blocky x={330} y={1450} s={0.55} kind="friend" face="happy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g>} />
    <Blocky x={760} y={1450} s={0.55} kind="kid" face="smirk" t={t} pose={{ armL: 60, armR: 60 }} extra={<g><Old beard={420} /><g transform="translate(0 -420)"><Controller x={0} y={0} t={t * 1.3} /></g></g>} />
    <g transform={`translate(760 640) rotate(8) scale(${popIn(t - 6)})`}><rect x={-220} y={-70} width={440} height={140} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={9} /><text y={24} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill={OL}>1 MORE!</text></g>
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <Den t={t} dark={0.3} screen="#4ADE6A" />
    <Blocky x={330} y={1450} s={0.55} kind="friend" face="starry" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g>} />
    <Blocky x={760} y={1450} s={0.55} kind="kid" face="grin" t={t} pose={{ armL: 60, armR: 60 }} extra={<g><Old beard={420} /><g transform="translate(0 -420)"><Controller x={0} y={0} t={t * 1.3} /></g></g>} />
    <Toast t={t - 3} text="COMMENT ONE MORE" c="#FFD23F" y={600} />
    <Sparkles t={t} seed="end" />
  </g>
);
export const S21 = badge('HOUR', '1');
export const S22 = badge('DAY', '10');
export const S23 = badge('MONTH', '6');
export const S24 = badge('YEAR', '40', '#E2262E');
export const S25 = badge('YEAR', '80', '#E2262E');

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S30 = close(S1, 400, 1000, 1.8, 20);    // "playing": your face in the glow
export const S31 = close(S6, 400, 900, 1.7, 20);     // "smells": the stink lines
export const S32 = close(S8, 400, 1500, 1.6, 20);    // "shape": the melted chair
export const S33 = close(S12, 400, 1300, 1.5, 24);   // "floor": the beard on the floor
export const S34 = close(S14, 360, 1100, 1.5, 6);    // "boss": the boss falling
export const S35 = close(S16, 860, 950, 1.6, 12);   // "grandkid": at the door
