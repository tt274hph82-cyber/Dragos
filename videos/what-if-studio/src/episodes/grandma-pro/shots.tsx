import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Burst, Sparkles, Sky, Confetti, SpeedLines, Storm, Face, Pose } from '../ten-seconds/shots';
import { Toast, Ground } from '../best-friend/shots';
import { LivingRoom, Controller } from '../mom-plays/shots';
import words from './words.json';

// "What if your grandma was secretly a pro gamer?" The blocky-game What If style, family twist: four rounds,
// she wins them all (one while knitting), then the reveal: world champion, 1982. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });
const LILAC = '#C8A8FF';
const WINS = [at('wins'), at('cookie', 1), at('knitting'), at('hit')];
const CHAMP = at('champion');

/** Scoreboard (fixed HUD): Grandma's wins tick up; at the reveal it turns into her 1982 title. */
export const Score: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, g = WINS.filter((w) => sec >= w).length;
  const pop = WINS.some((w) => sec >= w && sec < w + 0.25) || (sec >= CHAMP && sec < CHAMP + 0.25) ? 1.14 : 1;
  const champ = sec >= CHAMP;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-320} y={-46} width={640} height={92} rx={46} fill="#1A1424" stroke={champ ? '#FFD23F' : LILAC} strokeWidth={6} />
      {champ ? <text y={16} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={42} fill="#FFD23F">🏆 WORLD CHAMP · 1982</text> : <g>
        <text x={-280} y={16} fontFamily={FONT.game} fontWeight={900} fontSize={42} fill={LILAC}>GRANDMA</text>
        <text x={40} y={18} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={52} fill="#FFFFFF">{g} - 0</text>
        <text x={280} y={16} textAnchor="end" fontFamily={FONT.game} fontWeight={900} fontSize={42} fill="#7ACCF2">YOU</text>
      </g>}
    </g>
  );
};
const RoundBadge: React.FC<{ t: number; n: string; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#4A2A8A" c2="#6A3AB8" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`rb${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-260} y={-160} width={520} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-236} y={-136} width={472} height={272} rx={44} fill="none" stroke={LILAC} strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>ROUND</text>
      <text y={110} {...txt(170, '#9A6AE8')}>{n}</text>
    </g>
  </g>
);
const badge = (n: string): S => ({ t, len }) => <RoundBadge t={t} n={n} len={len} />;
/** Grandma: Mom's outfit with grey hair, a bun and round glasses (drawn through Blocky's `extra`). */
const GranLook: React.FC<{ shades?: boolean }> = ({ shades }) => (
  <g>
    <g transform="translate(0 -790)">
      <path d="M -168 -60 Q -170 -170 0 -172 Q 170 -170 186 -60 L 150 -100 Q 0 -150 -130 -100 Z" fill="#D8D8E2" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
      <circle cx={0} cy={-228} r={50} fill="#D8D8E2" stroke={OL} strokeWidth={9} />
    </g>
    {shades ? <g><rect x={-120} y={-830} width={110} height={60} rx={14} fill={OL} /><rect x={10} y={-830} width={110} height={60} rx={14} fill={OL} /><path d="M -10 -810 L 10 -810" stroke={OL} strokeWidth={10} /></g>
      : <g fill="none" stroke={OL} strokeWidth={8}><circle cx={-62} cy={-800} r={46} /><circle cx={62} cy={-800} r={46} /><path d="M -16 -800 L 16 -800" /></g>}
    <path d="M -130 -600 Q 0 -520 130 -600 L 130 -540 Q 0 -460 -130 -540 Z" fill="#F28AB8" stroke={OL} strokeWidth={7} />
  </g>
);
const Gran: React.FC<{ x: number; y: number; s: number; face: Face; t: number; pose?: Pose; extra?: React.ReactNode; shades?: boolean }> = ({ x, y, s, face, t, pose, extra, shades }) => (
  <Blocky x={x} y={y} s={s} kind="mom" face={face} t={t} pose={pose} extra={<g><GranLook shades={shades} />{extra}</g>} />
);
const Cookie: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle r={50} fill="#E8A03A" stroke={OL} strokeWidth={7} />{[[-18, -14], [16, -20], [4, 12], [-20, 18], [22, 14]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={8} fill="#5A3A1A" />)}</g>
);
const Knit: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d={`M -80 -60 L 60 40`} stroke="#C8C8D8" strokeWidth={12} strokeLinecap="round" transform={`rotate(${Math.sin(t * 1.2) * 8})`} />
    <path d={`M 80 -60 L -60 40`} stroke="#C8C8D8" strokeWidth={12} strokeLinecap="round" transform={`rotate(${-Math.sin(t * 1.2) * 8})`} />
    <rect x={-50} y={0} width={100} height={70} rx={10} fill="#E85A8A" stroke={OL} strokeWidth={6} />
    <circle cx={110} cy={80} r={40} fill="#E85A8A" stroke={OL} strokeWidth={6} /><path d="M 80 70 Q 110 50 140 80 M 85 95 Q 110 75 135 100" stroke="#B83A6A" strokeWidth={5} fill="none" />
  </g>
);
const Pro: React.FC<{ x: number; y: number; s: number; face: Face; t: number; pose?: Pose }> = ({ x, y, s, face, t, pose }) => (
  <Blocky x={x} y={y} s={s} kind="friend" face={face} t={t} pose={pose}
    extra={<g>
      <path d="M -200 -860 Q -200 -1040 0 -1040 Q 200 -1040 200 -860" fill="none" stroke={OL} strokeWidth={20} />
      <rect x={-230} y={-880} width={60} height={110} rx={20} fill="#E2262E" stroke={OL} strokeWidth={8} /><rect x={170} y={-880} width={60} height={110} rx={20} fill="#E2262E" stroke={OL} strokeWidth={8} />
      <g transform="translate(0 -440)"><circle r={60} fill="#FFD23F" stroke={OL} strokeWidth={8} /><text y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill={OL}>#1</text></g>
    </g>} />
);
const Tag: React.FC<{ x: number; y: number; text: string; c?: string }> = ({ x, y, text, c = '#FFFFFF' }) => (
  <g transform={`translate(${x} ${y})`}><rect x={-text.length * 17 - 24} y={-34} width={text.length * 34 + 48} height={68} rx={16} fill="#1A1424" opacity={0.85} /><text y={14} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={40} fill={c}>{text}</text></g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Gran x={360} y={1380} s={0.58} face="happy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g>} />
    <Blocky x={760} y={1380} s={0.5} kind="kid" face="smirk" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g>} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#4A2A8A" c2="#6A3AB8" />
    <g transform={`translate(540 600) scale(${popIn(t, 6)}) rotate(-5)`}><text {...txt(150, '#FFD23F', 16)}>PRO</text><text y={160} {...txt(150, '#FFFFFF', 16)}>GAMER?</text></g>
    <Gran x={540} y={1850} s={0.85} face="smirk" t={t} shades pose={{ armL: 20, armR: 140 }} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={760} y={1380} s={0.52} kind="kid" face="happy" t={t} pose={{ armL: 120 }} />
    <Gran x={340} y={1380} s={0.58} face="worried" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420) rotate(180)"><Controller x={0} y={0} t={t} /></g>} />
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A1A" c2="#B82A2A" />
    <g transform="translate(540 980) rotate(180)"><Controller x={0} y={0} s={2.4} t={t} /></g>
    {[[-1, 330], [1, 750]].map(([d, x], i) => <rect key={i} x={x - 50} y={1100} width={100} height={200} rx={30} fill="#F4E2CC" stroke={OL} strokeWidth={9} />)}
    <g transform={`translate(540 620) scale(${popIn(t - 3)}) rotate(-6)`}><text {...txt(92, '#FFD23F')}>UPSIDE DOWN</text></g>
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A4A8A" c2="#2A5AA8" />
    <Blocky x={540} y={1900} s={1.3} kind="kid" face="worried" t={t} pose={{ armR: 120 }} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88AC8" c2="#D8A0D8" />
    <Gran x={540} y={1900} s={1.3} face="happy" t={t} />
    <Sparkles t={t} seed="sw" />
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#FFD23F" />
    <g transform="translate(540 720)"><text {...txt(110, '#FFFFFF', 10)}>VICTORY</text><text y={120} {...txt(80, '#4ADE6A', 8)}>0:04</text></g>
    <Gran x={340} y={1380} s={0.58} face="happy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420) rotate(180)"><Controller x={0} y={0} t={t} /></g>} />
    <Blocky x={760} y={1380} s={0.52} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} />
    <Confetti t={t} seed="v" />
  </g>
);
export const S8: S = ({ t }) => {
  const n = Math.floor(clamp(t / 18) * 30);
  return (
    <g>
      <Sky /><Ground />
      {Array.from({ length: n }, (_, i) => { const col = i % 6, row = Math.floor(i / 6); return <rect key={i} x={300 + col * 80} y={1220 - row * 80} width={80} height={80} fill={row === 4 ? '#E8A03A' : '#B8B0C8'} stroke={OL} strokeWidth={6} />; })}
      {n >= 30 ? [300, 700].map((x, i) => <g key={i}><rect x={x - 10} y={780} width={100} height={60} fill="#B8B0C8" stroke={OL} strokeWidth={6} /><path d={`M ${x - 10} 780 L ${x + 40} 700 L ${x + 90} 780 Z`} fill="#9A6AE8" stroke={OL} strokeWidth={6} /></g>) : null}
      <Gran x={160} y={1500} s={0.4} face="determined" t={t * 3} pose={{ armR: 140 + Math.sin(t * 2) * 30 }} />
      <SpeedLines t={t} o={0.25} />
    </g>
  );
};
export const S9: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    {Array.from({ length: 30 }, (_, i) => { const col = i % 6, row = Math.floor(i / 6); return <rect key={i} x={300 + col * 80} y={1220 - row * 80} width={80} height={80} fill={row === 4 ? '#E8A03A' : '#B8B0C8'} stroke={OL} strokeWidth={6} />; })}
    <g transform={`translate(540 1150) scale(${popIn(t, 5)})`}><rect x={-200} y={-70} width={400} height={140} rx={20} fill="#FFF2D0" stroke={OL} strokeWidth={8} /><text y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={58} fill="#8A4A1A">COOKIES</text></g>
    {[0, 1, 2, 3].map((i) => <Cookie key={i} x={200 + i * 230} y={600 + Math.sin(t * 0.3 + i) * 20} s={popIn(t - 3 - i * 2, 5) * 1.2} />)}
  </g>
);
const Rocker: React.FC = () => (
  <g><path d="M -200 0 Q 0 60 200 0" stroke="#8A5A3A" strokeWidth={24} fill="none" /><rect x={-150} y={-340} width={30} height={340} fill="#8A5A3A" stroke={OL} strokeWidth={6} /><rect x={120} y={-340} width={30} height={340} fill="#8A5A3A" stroke={OL} strokeWidth={6} /><rect x={-150} y={-120} width={300} height={30} fill="#8A5A3A" stroke={OL} strokeWidth={6} /></g>
);
export const S10: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <g transform={`translate(640 1450) rotate(${lerp(0, 35, easeOut(clamp((t - 8) / 14)))})`}><Blocky x={0} y={0} s={0.62} kind="boss" face={t > 8 ? 'despair' : 'angry'} t={t} pose={{ armL: 140, armR: 140 }} /></g>
    <g transform={`translate(240 1380) rotate(${Math.sin(t * 0.25) * 4})`}><Rocker /></g>
    <Gran x={240} y={1300} s={0.42} face="happy" t={t} pose={{ armL: 70, armR: 70 }} extra={<g transform="translate(0 -560) scale(1.3)"><Knit t={t} /></g>} />
    {t > 8 ? <SpeedLines t={t} c="#FFF6C0" o={0.35} /> : null}
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#C8A878" />
    <Gran x={540} y={2060} s={1.25} face="smirk" t={t} />
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(540 ${600 + i * 80}) scale(${popIn(t - 2 - i * 3, 5)})`}><rect x={-300} y={-24} width={600} height={48} rx={14} fill="#3A2434" stroke={OL} strokeWidth={6} /><rect x={-292} y={-16} width={584} height={32} rx={10} fill={['#FF3A3A', '#FF9A1A', '#FFD23F'][i]} /></g>)}
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#8A5A2A" opacity={0.15} />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Pro x={720} y={1500} s={0.75} face="smirk" t={t} pose={{ armL: 30, armR: 140 }} />
    <Gran x={250} y={1500} s={0.45} face="happy" t={t} />
    <Tag x={720} y={540} text="xX_PRO_Xx" c="#FFD23F" />
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A1A" c2="#B82A2A" />
    <Blocky x={540} y={1900} s={1.3} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} />
    <SpeedLines t={t} c="#FF8A8A" o={0.3} />
  </g>
);
export const S14: S = ({ t }) => {
  const fly = easeOut(clamp((t - 4) / 12));
  return (
    <g>
      <Storm t={t} />
      <g transform={`translate(${lerp(720, 1400, fly)} ${lerp(1500, 600, fly)}) rotate(${fly * 400})`}><Pro x={0} y={0} s={0.6} face="despair" t={t} pose={{ armL: 160, armR: 160 }} /></g>
      <Gran x={330} y={1500} s={0.5} face="determined" t={t} pose={{ armR: t > 3 ? 90 : 40 }} />
      {t > 4 ? <g transform={`translate(640 1000) scale(${popIn(t - 4, 4)}) rotate(-8)`}><path d="M 0 -170 L 50 -60 L 170 -70 L 80 10 L 130 130 L 0 60 L -130 130 L -80 10 L -170 -70 L -50 -60 Z" fill="#FFD23F" stroke={OL} strokeWidth={10} strokeLinejoin="round" /><text y={30} {...txt(90, '#FF3A3A', 8)}>KO!</text></g> : null}
    </g>
  );
};
export const S15: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Gran x={330} y={1380} s={0.58} face="smirk" t={t} />
    <Pro x={760} y={1380} s={0.5} face="worried" t={t} pose={{ armL: 100, armR: 100, legL: 20, legR: -20 }} />
    <g transform={`translate(760 760) rotate(6) scale(${popIn(t - 3)})`}><rect x={-200} y={-90} width={400} height={180} rx={14} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><text y={-20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill={OL}>COOKIE</text><text y={46} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill={OL}>RECIPE PLZ</text></g>
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#3A2A20" />
    <g transform={`translate(540 860) scale(${popIn(t, 6)}) rotate(-3)`}>
      <rect x={-380} y={-460} width={760} height={920} fill="#8A5A2A" stroke={OL} strokeWidth={14} />
      <rect x={-340} y={-420} width={680} height={840} fill="#E8D0A0" />
      <g transform="translate(0 0)"><Blocky x={-60} y={360} s={0.5} kind="mom" face="starry" t={0} pose={{ armR: 160 }} /></g>
      <g transform="translate(150 -120)"><path d="M -60 -100 L 60 -100 L 50 0 Q 0 40 -50 0 Z" fill="#FFD23F" stroke={OL} strokeWidth={8} /><rect x={-14} y={20} width={28} height={50} fill="#FFD23F" stroke={OL} strokeWidth={6} /><rect x={-50} y={70} width={100} height={26} fill="#C8A040" stroke={OL} strokeWidth={6} /></g>
      <rect x={-340} y={-420} width={680} height={840} fill="#8A5A2A" opacity={0.25} />
      <text y={-330} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={56} fill="#5A3A1A">WORLD CHAMPION</text>
    </g>
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <g transform={`translate(540 960) scale(${popIn(t, 5) * 1.6}) scale(${Math.max(0.25, Math.abs(Math.cos(t * 0.15)))} 1)`}><path d="M -110 -200 L 110 -200 L 90 -20 Q 0 60 -90 -20 Z" fill="#FFD23F" stroke={OL} strokeWidth={10} /><rect x={-24} y={30} width={48} height={90} fill="#FFD23F" stroke={OL} strokeWidth={8} /><rect x={-100} y={120} width={200} height={50} fill="#C8A040" stroke={OL} strokeWidth={8} /></g>
    <g transform={`translate(540 520) scale(${popIn(t - 3)})`}><text {...txt(130, '#FFFFFF', 14)}>1982</text></g>
    <Sparkles t={t} seed="tr" />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#FFD23F" />
    <Gran x={540} y={1380} s={0.58} face="happy" t={t} pose={{ armL: 95, armR: 95 }} extra={<g transform="translate(0 -440)"><rect x={-260} y={-20} width={520} height={40} rx={12} fill="#C8C8D8" stroke={OL} strokeWidth={8} />{[-180, -60, 60, 180].map((x) => <Cookie key={x} x={x} y={-60} s={0.9} />)}</g>} />
    <Blocky x={200} y={1380} s={0.45} kind="kid" face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
    <Pro x={880} y={1380} s={0.45} face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <S18 t={t} f={0} len={60} />
    <Toast t={t - 3} text="COMMENT GRANDMA" c={LILAC} y={600} />
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
export const S30 = close(S1, 360, 900, 1.8, 20);   // "pro": Grandma on the couch
export const S31 = close(S7, 540, 780, 1.6, 20);    // "seconds": VICTORY 0:04
export const S33 = close(S8, 540, 1000, 1.4, 30);   // "castle": the castle
export const S34 = close(S10, 640, 1000, 1.4, 14);  // "boss": the boss falling
export const S32 = close(S10, 260, 900, 1.9, 20);  // "knitting": Grandma knitting
export const S35 = close(S12, 720, 900, 1.6, 20);   // "challenges": the pro
export const S36 = close(S14, 640, 1000, 1.5, 10);  // "hit": KO!
export const S37 = close(S18, 540, 900, 1.5, 20);  // "cookies": the tray
