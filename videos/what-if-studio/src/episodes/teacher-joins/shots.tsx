import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Burst, Sparkles, Sky, Lava, Block, Confetti, SpeedLines, Storm, Face, Pose } from '../ten-seconds/shots';
import { Toast, Ground, Dragon } from '../best-friend/shots';
import words from './words.json';

// "What if your teacher joined the game?" The blocky-game What If style, school twist: four periods of chaos,
// you fail a pop quiz into the lava, then he sees you're #1 and gives you an A+. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });
const CHALK = '#2E5A3A';
const FAIL = at('Splash'), APLUS = at('plus');

/** Your report card (fixed HUD): no grade, then a red F after the quiz, then a green A+. */
export const GradeBar: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  const g = sec >= APLUS ? 'A+' : sec >= FAIL ? 'F' : '-';
  const c = g === 'A+' ? '#4ADE6A' : g === 'F' ? '#FF4A4A' : '#B8B0D8';
  const pop = (sec >= FAIL && sec < FAIL + 0.3) || (sec >= APLUS && sec < APLUS + 0.3) ? 1.18 : 1;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-300} y={-46} width={600} height={92} rx={18} fill="#FFF8E8" stroke={OL} strokeWidth={6} />
      <path d="M -280 -20 L 120 -20 M -280 14 L 120 14" stroke="#9AC8E8" strokeWidth={4} />
      <text x={-270} y={12} fontFamily={FONT.game} fontWeight={900} fontSize={36} fill={OL}>YOUR GRADE</text>
      <circle cx={220} cy={0} r={40} fill="none" stroke={c} strokeWidth={6} />
      <text x={220} y={18} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={g === 'A+' ? 44 : 52} fill={c}>{g}</text>
    </g>
  );
};
const PeriodBadge: React.FC<{ t: number; n: string; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#1E4A2A" c2="#2E6A3A" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`pb${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-260} y={-160} width={520} height={320} rx={30} fill={CHALK} stroke="#8A5A3A" strokeWidth={22} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill="#F2F2E8">PERIOD</text>
      <text y={110} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={170} fill="#FFD23F">{n}</text>
    </g>
  </g>
);
const badge = (n: string): S => ({ t, len }) => <PeriodBadge t={t} n={n} len={len} />;
/** The teacher: Dad's build with glasses, a red tie and a clipboard. */
const Teacher: React.FC<{ x: number; y: number; s: number; face: Face; t: number; pose?: Pose; flip?: boolean; prop?: React.ReactNode }> = ({ x, y, s, face, t, pose, flip, prop }) => (
  <Blocky x={x} y={y} s={s} kind="dad" face={face} t={t} pose={pose} flip={flip}
    extra={<g>
      <g fill="#FFFFFF" fillOpacity={0.2} stroke={OL} strokeWidth={9}><rect x={-118} y={-842} width={100} height={80} rx={14} /><rect x={18} y={-842} width={100} height={80} rx={14} /><path d="M -18 -804 L 18 -804" /></g>
      <path d="M -26 -600 L 26 -600 L 40 -400 L 0 -350 L -40 -400 Z" fill="#E2262E" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
      {prop}
    </g>} />
);
const Board: React.FC<{ x: number; y: number; w: number; h: number; lines?: string[]; size?: number }> = ({ x, y, w, h, lines = [], size = 70 }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={12} fill={CHALK} stroke="#8A5A3A" strokeWidth={22} />
    {lines.map((l, i) => <text key={i} x={x} y={y - ((lines.length - 1) * size * 0.6) + i * size * 1.2 + size * 0.35} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={size} fill="#F2F2E8">{l}</text>)}
  </g>
);
const Paper: React.FC<{ x: number; y: number; s?: number; r?: number; mark?: string }> = ({ x, y, s = 1, r = 0, mark }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <rect x={-80} y={-100} width={160} height={200} fill="#FFFFFF" stroke={OL} strokeWidth={6} />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={-56} y={-60 + k * 36} width={112} height={8} fill="#9AC8E8" />)}
    {mark ? <text x={20} y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={110} fill="#E2262E" transform="rotate(-12)">{mark}</text> : null}
  </g>
);
const Stamp: React.FC<{ t: number; text: string; c: string; x?: number; y?: number; size?: number }> = ({ t, text, c, x = 540, y = 860, size = 300 }) => (
  t < 0 ? null : <g transform={`translate(${x} ${y}) rotate(-14) scale(${lerp(2.4, 1, easeOut(clamp(t / 4)))})`} opacity={clamp(t / 2)}>
    <circle r={size * 0.75} fill="none" stroke={c} strokeWidth={size * 0.08} />
    <text y={size * 0.33} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={c}>{text}</text>
  </g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    <Board x={540} y={760} w={760} h={420} lines={['BLOCK QUEST', '101']} size={80} />
    <Teacher x={720} y={1360} s={0.55} face="determined" t={t} pose={{ armR: 120 }} />
    <Blocky x={280} y={1360} s={0.45} kind="kid" face="worried" t={t} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A1424" c2="#2A2234" />
    <g transform={`translate(540 760) scale(${popIn(t, 6)})`}>
      <rect x={-420} y={-90} width={840} height={180} rx={30} fill="#1A1424" stroke="#FFD23F" strokeWidth={10} />
      <text y={-10} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#FFD23F">MR. GRUMBLE</text>
      <text y={60} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill="#FFFFFF">has joined the game</text>
    </g>
    <Teacher x={540} y={1640} s={0.75} face="smirk" t={t} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Blocky x={760} y={1480} s={0.72} kind="boss" face="shock" t={t} pose={{ armL: 140, armR: 140 }} />
    <Teacher x={260} y={1480} s={0.5} face="determined" t={t} pose={{ armR: 95 }} />
    <Paper x={lerp(420, 600, easeOut(clamp(t / 10)))} y={1060} s={1.2} r={-8} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A1A" c2="#B82A2A" />
    <Teacher x={540} y={1880} s={1.3} face="yell" t={t} pose={{ armL: 30, armR: 150 }} />
    <SpeedLines t={t} c="#FF8A8A" o={0.3} />
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <g transform={`translate(${lerp(560, 1100, clamp(t / 40))} 0)`}>
      <Blocky x={0} y={1480} s={0.65} kind="boss" face="despair" t={t} pose={{ armL: 160, armR: 160, legL: Math.sin(t) * 25, legR: -Math.sin(t) * 25, lean: 10 }} />
      {[0, 1, 2, 3].map((i) => <path key={i} d="M 0 0 q 10 30 0 50 q -10 -20 0 -50 Z" fill="#7FD0FF" stroke={OL} strokeWidth={4} transform={`translate(${-60 + i * 40} ${880 + ((t * 8 + i * 30) % 120)})`} />)}
    </g>
    <Paper x={300} y={1300} s={1} r={20} mark="?" />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#E8D8B8" />
    <Board x={540} y={620} w={720} h={240} lines={['DETENTION']} size={90} />
    {Array.from({ length: 24 }, (_, i) => { const r = Math.floor(i / 6), c = i % 6; return <g key={i} transform={`translate(${130 + c * 165} ${980 + r * 170})`}><Blocky x={0} y={0} s={0.2} kind={(['kid', 'friend', 'mom', 'dad'] as const)[(i + r) % 4]} face={(['despair', 'sleepy', 'worried', 'angry'] as const)[i % 4]} t={t} /><rect x={-70} y={-60} width={140} height={30} fill="#8A5A3A" stroke={OL} strokeWidth={4} /></g>; })}
  </g>
);
export const S7: S = ({ t }) => {
  const n = Math.round(lerp(0, 300, easeOut(clamp(t / 14))));
  return (
    <g>
      <Burst t={t} c1="#5A0A0A" c2="#7A1A1A" />
      <g transform={`translate(540 860) scale(${t > 14 && t < 18 ? 1.12 : 1}) rotate(-4)`}><text y={40} {...txt(280, '#FFD23F', 18)}>{n}</text><text y={190} {...txt(100, '#FFFFFF', 12)}>PLAYERS</text></g>
    </g>
  );
};
export const S8: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Blocky x={540} y={1900} s={1.3} kind="kid" face="angry" t={t} pose={{ armL: 150, armR: 150 }} />
    <g transform={`translate(700 660) rotate(8) scale(${popIn(t - 3)})`}><text {...txt(80, '#FFD23F')}>SUMMER!</text></g>
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Teacher x={540} y={1880} s={1.3} face="smirk" t={t} pose={{ armL: 100, armR: 100 }} />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
    {Array.from({ length: 10 }, (_, i) => <Paper key={i} x={random(`pq${i}`) * W} y={-150 + ((t * 18 + random(`pqy${i}`) * 2000) % 2100)} s={0.8} r={t * 6 + i * 36} />)}
    <g transform={`translate(540 820) scale(${popIn(t, 5)}) rotate(-6)`}><text {...txt(190, '#FFFFFF', 18)}>POP</text><text y={200} {...txt(190, '#FFD23F', 18)}>QUIZ!</text></g>
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Sky /><Lava t={t} />
    <Board x={540} y={650} w={640} h={260} lines={['7 x 8 = ?']} size={110} />
    <Block x={540} y={1100} w={280} c="#FFC21A" />
    <Blocky x={540} y={1100} s={0.45} kind="kid" face="worried" t={t} />
    <Teacher x={900} y={1300} s={0.42} face="smirk" t={t} pose={{ armL: 120 }} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E4A2A" c2="#2E6A3A" />
    <Teacher x={540} y={1880} s={1.3} face="determined" t={t} pose={{ armR: 150 }} />
    <g transform={`translate(560 560) scale(${popIn(t - 2) * 0.8})`}><Board x={0} y={0} w={560} h={200} lines={['7 x 8 = ?']} size={100} /></g>
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1900} s={1.3} kind="kid" face="worried" t={t} pose={{ armR: 140 }} />
    <g transform={`translate(800 560) rotate(8) scale(${popIn(t - 4)})`}><rect x={-140} y={-70} width={280} height={140} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={9} /><text y={26} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={80} fill={OL}>54?</text></g>
  </g>
);
export const S14: S = ({ t }) => {
  const fall = easeOut(clamp((t - 4) / 8));
  return (
    <g>
      <Sky /><Lava t={t} />
      <Block x={lerp(540, 340, fall)} y={1200} w={140} c="#FFC21A" /><Block x={lerp(540, 740, fall)} y={1200} w={140} c="#FFC21A" />
      <Blocky x={540} y={lerp(1200, 1560, fall)} s={0.45} kind="kid" face="shock" t={t} pose={{ armL: 170, armR: 170 }} />
      {t > 11 ? Array.from({ length: 10 }, (_, i) => <circle key={i} cx={540 + Math.cos(i * 0.63) * (60 + (t - 11) * 22)} cy={1300 - Math.abs(Math.sin(i * 0.63)) * (80 + (t - 11) * 26) + (t - 11) * (t - 11) * 1.5} r={22} fill="#FFC21A" stroke={OL} strokeWidth={4} />) : null}
      {t > 11 ? <g transform={`translate(540 720) scale(${popIn(t - 9, 4)}) rotate(-6)`}><text {...txt(150, '#FF4A4A')}>SPLASH!</text></g> : null}
    </g>
  );
};
export const S15: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    {[180, 400, 680, 900].map((x, i) => <g key={i}><Blocky x={x} y={1460} s={0.32} kind={(['kid', 'friend', 'mom', 'dad'] as const)[i]} face="despair" t={t} /><Stamp t={t - 3 - i * 2} text="F" c="#E2262E" x={x} y={1000} size={120} /></g>)}
    <Teacher x={540} y={1850} s={0.5} face="smirk" t={t} pose={{ armR: 150 }} />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
    <Dragon x={540} y={1330} s={1.2} t={t} sad />
    <Stamp t={t - 3} text="F" c="#E2262E" x={540} y={1150} size={220} />
  </g>
);
const Board2: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 840) scale(${popIn(t, 6) * 0.95})`}>
    <rect x={-380} y={-360} width={760} height={720} rx={40} fill="#1E1A2E" stroke="#FFD23F" strokeWidth={12} />
    <text y={-280} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={56} fill="#FFD23F">TOP PLAYERS</text>
    {[['#1', 'YOU', '#FFD23F'], ['#2', 'NoScope_Kid', '#C8C8D8'], ['#3', 'BlockLord99', '#D89A5A']].map(([r, n, c], i) => (
      <g key={i} transform={`translate(0 ${-150 + i * 160}) scale(${popIn(t - 4 - i * 3, 5)})`}>
        <rect x={-330} y={-60} width={660} height={120} rx={24} fill={i ? '#2E2A48' : '#5A3A08'} stroke={c} strokeWidth={6} />
        <text x={-280} y={20} fontFamily={FONT.game} fontWeight={900} fontSize={56} fill={c}>{r}</text>
        <text x={-160} y={20} fontFamily={FONT.game} fontWeight={900} fontSize={i ? 44 : 60} fill="#FFFFFF">{n}</text>
      </g>
    ))}
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Board2 t={t} />
    <Teacher x={850} y={1700} s={0.45} face="shock" t={t} pose={{ armL: 120 }} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E4A2A" c2="#2E6A3A" />
    <Teacher x={540} y={1880} s={1.3} face="worried" t={t} />
    {t > 6 ? <path d="M 410 1020 L 440 990 L 470 1020 L 440 1050 Z" fill="#FFFFFF" transform={`rotate(${t * 10} 440 1020)`} /> : null}
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Paper x={540} y={860} s={3} r={-4} />
    <Stamp t={t - 15} text="A+" c="#2EA84A" x={540} y={860} size={260} />
    <Confetti t={t} seed="ap" />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    <Board x={540} y={800} w={700} h={300} lines={['CLASS', 'DISMISSED']} size={76} />
    <Teacher x={720} y={1350} s={0.55} face="happy" t={t} pose={{ armR: 160 }} />
    <Blocky x={320} y={1350} s={0.5} kind="kid" face="starry" t={t} pose={{ armL: 160 }} />
    <Toast t={t - 3} text="COMMENT TEACHER" c="#FFD23F" y={480} />
    <Sparkles t={t} seed="end" />
  </g>
);
export const S21 = badge('1');
export const S22 = badge('2');
export const S23 = badge('3');
export const S24 = badge('4');

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S30 = close(S1, 720, 820, 1.8, 20);    // "teacher": his face
export const S31 = close(S3, 600, 1000, 1.5, 12);   // "homework": the paper
export const S32 = close(S6, 540, 1150, 1.5, 20);   // "classroom": the packed rows
export const S33 = close(S11, 540, 900, 1.5, 20);   // "lava": the question over the lava
export const S34 = close(S15, 540, 1000, 1.4, 20);  // "player an F": the stamps
export const S35 = close(S17, 540, 720, 1.5, 20);   // "number one": the #1 row
