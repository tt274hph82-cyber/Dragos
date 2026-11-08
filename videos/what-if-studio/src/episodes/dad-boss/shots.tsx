import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Burst, Sparkles, Sky, Lava, Block, Confetti, SpeedLines, Storm, Rain, Card } from '../ten-seconds/shots';
import { Toast, Ground } from '../best-friend/shots';
import { LivingRoom, Controller } from '../mom-plays/shots';
import words from './words.json';

// "What if your dad became the final boss?" The blocky-game What If style, family twist: four boss phases
// (remote, broccoli, chores, Wi-Fi), then one bad joke drains his health bar. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const T = { ha: at('Ha', 1), ok: at('Okay', 1), win: at('defeated', 1) };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });

/** Dad's boss health bar (fixed HUD): full all the way until the joke lands, then drains in two hits. */
export const DadBar: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  const hp = sec < T.ha ? 1 : sec < T.ha + 0.5 ? 0.55 : sec < T.ok ? 0.2 : 0;
  const hit = (sec >= T.ha && sec < T.ha + 0.2) || (sec >= T.ha + 0.5 && sec < T.ha + 0.7) || (sec >= T.ok && sec < T.ok + 0.2);
  const won = sec >= T.win;
  return (
    <g transform={`translate(540 330) scale(${hit ? 1.12 : 1}) translate(${hit ? Math.sin(f * 2.3) * 10 : 0} 0)`}>
      <rect x={-380} y={-58} width={760} height={116} rx={30} fill="#1A1424" stroke={won ? '#FFD23F' : '#FF4A4A'} strokeWidth={6} />
      <text x={-350} y={-14} fontFamily={FONT.game} fontWeight={900} fontSize={34} fill={won ? '#FFD23F' : '#FF8A8A'}>{won ? 'DEFEATED' : 'FINAL BOSS'}</text>
      <text x={350} y={-14} textAnchor="end" fontFamily={FONT.game} fontWeight={900} fontSize={34} fill="#FFFFFF">DAD</text>
      <rect x={-350} y={6} width={700} height={36} rx={12} fill="#3A2434" />
      <rect x={-350} y={6} width={700 * hp} height={36} rx={12} fill={hp > 0.5 ? '#FF3A3A' : '#FF9A1A'} />
      <rect x={-350} y={6} width={700} height={36} rx={12} fill="none" stroke={OL} strokeWidth={5} />
    </g>
  );
};
const PhaseBadge: React.FC<{ t: number; n: string; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#8A1A1A" c2="#B82A2A" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`ph${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-290} y={-160} width={580} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-266} y={-136} width={532} height={272} rx={44} fill="none" stroke="#FF3A3A" strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>PHASE</text>
      <text y={110} {...txt(n.length > 2 ? 130 : 170, '#FF3A3A')}>{n}</text>
    </g>
  </g>
);
const badge = (n: string): S => ({ t, len }) => <PhaseBadge t={t} n={n} len={len} />;
const Crown: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M -110 60 L -80 -60 L -30 10 L 0 -90 L 30 10 L 80 -60 L 110 60 Z" fill="#FFD23F" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
);
const Remote: React.FC<{ x: number; y: number; s?: number; r?: number; t: number }> = ({ x, y, s = 1, r = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <rect x={-60} y={-200} width={120} height={400} rx={40} fill="#2A2234" stroke={OL} strokeWidth={9} />
    <circle cx={0} cy={-140} r={30} fill="#E2262E" stroke={OL} strokeWidth={6} opacity={0.7 + 0.3 * Math.sin(t)} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-38 + (i % 3) * 28} y={-70 + Math.floor(i / 3) * 50} width={20} height={30} rx={6} fill="#6A6478" />)}
  </g>
);
const Broccoli: React.FC<{ x: number; y: number; s?: number; face?: boolean; t?: number }> = ({ x, y, s = 1, face, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 0 L -30 -150 L 30 -150 L 40 0 Z" fill="#9AD86A" stroke={OL} strokeWidth={8} />
    {[[-80, -190, 70], [0, -240, 85], [80, -190, 70], [-40, -170, 60], [40, -170, 60]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i < 3 ? '#2E9A3A' : '#3AB84A'} stroke={OL} strokeWidth={8} />)}
    {face ? <g><circle cx={-34} cy={-90} r={12} fill={OL} /><circle cx={34} cy={-90} r={12} fill={OL} /><path d={`M -30 -50 Q 0 ${-60 + Math.sin(t * 0.5) * 6} 30 -50`} stroke={OL} strokeWidth={7} fill="none" /><path d="M -56 -118 L -16 -104 M 56 -118 L 16 -104" stroke={OL} strokeWidth={8} /></g> : null}
  </g>
);
const Scroll: React.FC<{ t: number; y?: number; s?: number }> = ({ t, y = 860, s = 1 }) => {
  const open = clamp(t / 14), items = ['DISHES', 'LAUNDRY', 'VACUUM', 'TRASH', 'BED', 'DOG WALK', 'LAWN', '...'];
  return (
    <g transform={`translate(540 ${y}) scale(${s})`}>
      <rect x={-300} y={-500} width={600} height={1000 * open} fill="#FFF2D0" stroke={OL} strokeWidth={10} />
      {items.map((it, i) => (110 + i * 115 < 1000 * open ? <g key={i}><rect x={-250} y={-430 + i * 115} width={50} height={50} rx={8} fill="#FFFFFF" stroke={OL} strokeWidth={6} />
        <text x={-170} y={-388 + i * 115} fontFamily={FONT.game} fontWeight={900} fontSize={54} fill={OL}>{it}</text></g> : null))}
      <rect x={-340} y={-540} width={680} height={70} rx={35} fill="#C88A3A" stroke={OL} strokeWidth={10} />
      <rect x={-340} y={-540 + 1000 * open} width={680} height={70} rx={35} fill="#C88A3A" stroke={OL} strokeWidth={10} />
    </g>
  );
};
const Wifi: React.FC<{ x: number; y: number; s?: number; bars: number; dead?: boolean }> = ({ x, y, s = 1, bars, dead }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={50} cy={120} fill={bars > 0 ? '#5AE8F8' : '#5A5468'} stroke={OL} strokeWidth={8} />
    {[1, 2, 3].map((k) => <path key={k} d={`M ${-110 * k * 0.8} ${120 - 90 * k * 0.8} A ${140 * k * 0.8} ${140 * k * 0.8} 0 0 1 ${110 * k * 0.8} ${120 - 90 * k * 0.8}`} fill="none" stroke={bars >= k + 1 ? '#5AE8F8' : '#5A5468'} strokeWidth={46} strokeLinecap="round" />)}
    {dead ? <g><path d="M -200 -200 L 200 200 M 200 -200 L -200 200" stroke="#FF3A3A" strokeWidth={50} strokeLinecap="round" /></g> : null}
  </g>
);
const Bubble: React.FC<{ t: number; x: number; y: number; lines: string[]; s?: number }> = ({ t, x, y, lines, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 5) * s})`}>
    <rect x={-420} y={-60 - lines.length * 40} width={840} height={120 + lines.length * 80 - 80 + 40} rx={50} fill="#FFFFFF" stroke={OL} strokeWidth={10} />
    <path d="M -60 60 L -120 150 L 20 60 Z" fill="#FFFFFF" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-80} y={40} width={110} height={30} fill="#FFFFFF" />
    {lines.map((l, i) => <text key={i} y={-lines.length * 40 + 50 + i * 80} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={62} fill={OL}>{l}</text>)}
  </g>
);
const Router: React.FC<{ x: number; y: number; t: number; pulled: number }> = ({ x, y, t, pulled }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-160} y={-60} width={320} height={120} rx={20} fill="#E8E8F0" stroke={OL} strokeWidth={9} />
    {[-90, -40, 10, 60].map((lx, i) => <circle key={i} cx={lx} cy={0} r={12} fill={pulled > 0.5 ? '#5A5468' : (Math.sin(t * 1.5 + i) > 0 ? '#4ADE6A' : '#2A8A3A')} />)}
    <path d="M -110 -60 L -130 -200 M 110 -60 L 130 -200" stroke={OL} strokeWidth={12} strokeLinecap="round" />
    <path d={`M 160 0 Q ${260 + pulled * 120} ${-20 - pulled * 200} ${300 + pulled * 160} ${-pulled * 260}`} stroke="#2A2234" strokeWidth={18} fill="none" />
  </g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Blocky x={600} y={1500} s={1.05} kind="dad" face="angry" t={t} pose={{ armL: 140, armR: 140 }} />
    <Crown x={600} y={1500 - 1000 * 1.05} s={1.1} />
    <Blocky x={170} y={1500} s={0.3} kind="kid" face="shock" t={t} />
    <SpeedLines t={t} c="#FFB0B0" o={0.25} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#5A0E1A" c2="#7A1A2A" />
    <g transform={`translate(540 ${600 - Math.max(0, 6 - t) * 20}) scale(${popIn(t, 6)}) rotate(-6)`}>
      <text y={0} {...txt(170, '#FF3A3A', 16)}>FINAL</text>
      <text y={180} {...txt(200, '#FFFFFF', 16)}>BOSS</text>
    </g>
    <Blocky x={540} y={1720} s={0.85} kind="dad" face="determined" t={t} pose={{ armL: 30, armR: 30 }} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Sky />
    <Lava t={t} />
    <Block x={200} y={1150} w={240} c="#FFC21A" /><Block x={560} y={1060} w={200} c="#2E6AE8" />
    {/* the kid frozen mid-jump: paused by the remote */}
    <Blocky x={380} y={lerp(1150, 1000, clamp(t / 8))} s={0.38} kind="kid" face={t > 10 ? 'shock' : 'determined'} t={t} pose={{ armL: 150, armR: 150, legL: -20, legR: 20 }} />
    {t > 10 ? <g transform={`translate(380 640) scale(${popIn(t - 10, 5)})`}><rect x={-70} y={-70} width={140} height={140} rx={24} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><rect x={-36} y={-40} width={24} height={80} fill={OL} /><rect x={12} y={-40} width={24} height={80} fill={OL} /></g> : null}
    <Blocky x={900} y={1500} s={0.6} kind="dad" face="smirk" t={t} pose={{ armR: 100 }} extra={<Remote x={330} y={-660} s={0.7} r={-30} t={t} />} />
    {t > 9 ? <path d="M 1020 1020 L 420 760" stroke="#FF3A3A" strokeWidth={14 + Math.sin(t * 2) * 6} opacity={0.8} strokeLinecap="round" /> : null}
  </g>
);
export const S4: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Remote x={540} y={900} s={1.6} r={lerp(-30, -10, clamp(t / 10))} t={t * 3} />
    <circle cx={540 - 100} cy={900 - 340} r={60 + Math.max(0, 8 - t) * 20} fill="none" stroke="#FFFFFF" strokeWidth={14} opacity={clamp(t / 4)} />
    <g transform={`translate(800 580) rotate(10) scale(${popIn(t - 3)})`}><text {...txt(120, '#FFD23F')}>CLICK!</text></g>
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A4A8A" c2="#2A5AA8" />
    <Blocky x={540} y={1800} s={1.3} kind="dad" face="yell" t={t} pose={{ armL: 150, armR: 150 }} />
    <SpeedLines t={t} o={0.3} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#E8D8A8" c2="#F2E6C0" />
    {Array.from({ length: 12 }, (_, i) => {
      const x = random(`hw${i}`) * W, y = -200 + ((t * (14 + random(`hwv${i}`) * 8) + random(`hwy${i}`) * 2000) % 2100);
      return <g key={i} transform={`translate(${x} ${y}) rotate(${t * 4 + i * 33})`}><rect x={-80} y={-100} width={160} height={200} fill="#FFFFFF" stroke={OL} strokeWidth={6} />{[0, 1, 2, 3].map((k) => <rect key={k} x={-56} y={-70 + k * 40} width={112} height={8} fill="#8A8AA8" />)}</g>;
    })}
    <g transform={`translate(540 900) scale(${popIn(t, 6) * 1.1}) rotate(-4)`}>
      <rect x={-300} y={-360} width={600} height={720} rx={20} fill="#FFFFFF" stroke={OL} strokeWidth={12} />
      <text y={-240} {...txt(70, '#2E6AE8', 0)}>HOMEWORK</text>
      {['2 + 2 = ?', '7 x 8 = ?', '100 - 1 = ?'].map((q, i) => <text key={i} x={-230} y={-100 + i * 130} fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>{q}</text>)}
    </g>
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" />
    <Lava t={t} />
    <Block x={240} y={1180} w={240} c="#FFC21A" />
    <Blocky x={240} y={1180} s={0.4} kind="kid" face="worried" t={t} />
    <Blocky x={820} y={1180} s={0.55} kind="dad" face="grin" t={t} pose={{ armL: 120 }} />
    <Block x={820} y={1180} w={280} c="#8A5A3A" />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={lerp(700, 120 + i * 100, clamp((t - 6) / 10))} cy={lerp(700, 1340, clamp((t - 6) / 10))} r={14} fill="#4ADE6A" opacity={clamp((t - 6) / 3)} />)}
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" />
    <Ground c="#4AA84A" />
    {Array.from({ length: 9 }, (_, i) => <Broccoli key={i} x={-40 + i * 140} y={1460 + (i % 2) * 120} s={popIn(t - i * 0.8, 5) * 0.75} />)}
    <Block x={540} y={1180} w={240} c="#FFC21A" />
    <Blocky x={540} y={1180} s={0.4} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} />
    <Toast t={t - 4} text="LAVA -> BROCCOLI" c="#4ADE6A" />
  </g>
);
export const S9: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A1A" c2="#B82A2A" />
    <Blocky x={540} y={1850} s={1.35} kind="kid" face="angry" t={t} pose={{ armL: 150, armR: 150 }} />
    <SpeedLines t={t} c="#FF8A8A" o={0.3} />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E6A2A" c2="#2E8A3A" />
    <Broccoli x={540} y={1300} s={2.2} face t={t} />
    <g transform={`translate(540 520) scale(${popIn(t - 3)}) rotate(-5)`}><text {...txt(110, '#FF4A4A')}>EVEN WORSE</text></g>
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <circle cx={540} cy={1480} r={lerp(0, 420, clamp(t / 8))} fill="none" stroke="#FFD23F" strokeWidth={14} opacity={0.8} />
    <ellipse cx={540} cy={1480} rx={lerp(0, 420, clamp(t / 8))} ry={lerp(0, 110, clamp(t / 8))} fill="#FFD23F" opacity={0.25} />
    <Blocky x={540} y={1480} s={0.75} kind="dad" face="determined" t={t} pose={{ armL: 160, armR: 160 }} />
    <g transform={`translate(540 ${lerp(1100, 500, clamp((t - 6) / 10))}) scale(${popIn(t - 6) * 0.6})`}><rect x={-200} y={-80} width={400} height={160} rx={30} fill="#FFF2D0" stroke={OL} strokeWidth={10} /><rect x={-230} y={-100} width={60} height={200} rx={30} fill="#C88A3A" stroke={OL} strokeWidth={8} /><rect x={170} y={-100} width={60} height={200} rx={30} fill="#C88A3A" stroke={OL} strokeWidth={8} /></g>
    <Sparkles t={t} seed="sum" />
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Scroll t={t} y={820} s={0.92} />
  </g>
);
export const S13: S = ({ t }) => {
  const n = Math.round(lerp(0, 200, easeOut(clamp(t / 18))));
  return (
    <g>
      <Burst t={t} c1="#3A2468" c2="#5A3A98" />
      <g transform={`translate(540 860) scale(${t > 18 && t < 22 ? 1.15 : 1}) rotate(-4)`}>
        <text y={40} {...txt(300, '#FFD23F', 18)}>{n}</text>
        <text y={200} {...txt(110, '#FFFFFF', 14)}>CHORES</text>
      </g>
      {t > 18 ? <Confetti t={t - 18} seed="ch" /> : null}
    </g>
  );
};
const TrashBag: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -120 0 Q -150 -200 -40 -240 L -20 -290 L 20 -290 L 40 -240 Q 150 -200 120 0 Z" fill="#2A2A34" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -30 -290 Q 0 -340 30 -290" stroke="#FFD23F" strokeWidth={10} fill="none" />
    <path d="M -60 -150 Q -40 -100 -70 -40" stroke="#4A4A58" strokeWidth={8} fill="none" />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#3A3448" />
    <Blocky x={300} y={1560} s={0.6} kind="kid" face="despair" t={t} pose={{ armR: 30 }} extra={<TrashBag x={200} y={-200} s={0.9} />} />
    <Blocky x={780} y={1560} s={0.62} kind="dad" face="smirk" t={t} pose={{ armL: 95 }} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A4A8A" c2="#2A5AA8" />
    <Blocky x={540} y={1800} s={1.3} kind="dad" face="smirk" t={t} pose={{ armL: 175, armR: 175 }} />
  </g>
);
export const S16 = badge('FINAL');
export const S17: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv={t > 12 ? '#3A3448' : '#4AC8FF'} />
    <Router x={300} y={1200} t={t} pulled={clamp((t - 8) / 6)} />
    <Blocky x={760} y={1600} s={0.62} kind="dad" face="grin" t={t} pose={{ armL: t > 8 ? 110 : 70, lean: t > 8 ? -6 : 0 }} />
    {t > 12 ? <g transform={`translate(300 900) scale(${popIn(t - 12, 5)})`}><text {...txt(100, '#FF3A3A')}>OFFLINE</text></g> : null}
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A1424" c2="#2A2234" />
    <Wifi x={540} y={860} s={1.6} bars={t < 3 ? 4 : t < 6 ? 3 : t < 9 ? 2 : t < 12 ? 1 : 0} dead={t >= 12} />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#2A2A48" c2="#3A3A5A" />
    <Rain t={t} kind="coin" n={0} />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={random(`rn${i}`) * W} y={((t * 50 + random(`ry${i}`) * 2000) % 2100) - 100} width={6} height={60} fill="#8AB8FF" opacity={0.6} />)}
    <Blocky x={540} y={1850} s={1.35} kind="kid" face="despair" t={t} pose={{ armL: 170, armR: 170 }} />
    <SpeedLines t={t} c="#8AB8FF" o={0.3} />
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Blocky x={540} y={1550} s={0.9} kind="dad" face="angry" t={t} pose={{ armL: 140, armR: 140 }} />
    {/* a target reticle sweeping onto his head */}
    <g transform={`translate(${lerp(200, 540, easeOut(clamp(t / 14)))} ${lerp(1200, 1550 - 710, easeOut(clamp(t / 14)))})`}>
      <circle r={150} fill="none" stroke="#FF3A3A" strokeWidth={14} /><circle r={60} fill="none" stroke="#FF3A3A" strokeWidth={10} />
      <path d="M -200 0 L -110 0 M 110 0 L 200 0 M 0 -200 L 0 -110 M 0 110 L 0 200" stroke="#FF3A3A" strokeWidth={12} />
    </g>
    {t > 14 && !React.useContext(CloseCtx) ? <g transform={`translate(540 520) scale(${popIn(t - 14, 5)})`}><text {...txt(96, '#FFD23F')}>WEAK SPOT</text></g> : null}
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E1A2E" c2="#2A2440" />
    <g transform={`translate(540 700) scale(${popIn(t, 6) * 1.0})`}>
      <rect x={-300} y={-330} width={600} height={660} rx={40} fill="#1E1A2E" stroke="#FF7AE0" strokeWidth={12} />
      <text y={-250} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill="#B8B0D8">LEGENDARY ITEM</text>
      <circle cx={0} cy={-80} r={120} fill="#FFD23F" stroke={OL} strokeWidth={10} />
      <circle cx={-40} cy={-110} r={16} fill={OL} /><circle cx={40} cy={-110} r={16} fill={OL} /><path d="M -60 -50 Q 0 10 60 -50 Z" fill={OL} />
      <text y={110} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={80} fill="#FFFFFF">BAD JOKE</text>
      <rect x={-200} y={160} width={400} height={110} rx={30} fill={t > 16 ? '#FF5AC8' : '#2E6AE8'} stroke={OL} strokeWidth={8} />
      <text y={234} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#FFFFFF">USE</text>
    </g>
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={300} y={1600} s={0.62} kind="kid" face="smirk" t={t} pose={{ armR: 120 }} />
    <Blocky x={800} y={1600} s={0.62} kind="dad" face="determined" t={t} />
    <Bubble t={t - 2} x={540} y={560} lines={['WHY DID THE BLOCK', 'CROSS THE ROAD?']} s={0.95} />
  </g>
);
export const S23: S = ({ t }) => (
  <g>
    <Sky />
    <Ground c="#5AC86A" />
    <rect x={-300} y={1250} width={W + 600} height={260} fill="#4A4458" />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-100 + i * 200} y={1370} width={110} height={20} fill="#FFFFFF" />)}
    <Blocky x={lerp(-100, 700, clamp(t / 30))} y={1430} s={0.42} kind="friend" face="happy" t={t} pose={{ legL: Math.sin(t * 0.8) * 20, legR: -Math.sin(t * 0.8) * 20, armL: 20, armR: 20 }} />
  </g>
);
export const S24: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" />
    <Ground c="#5AC86A" />
    {/* a playground slide on the other side of the road */}
    <path d="M 200 1300 L 200 700 M 340 1300 L 340 700" stroke="#C83A3A" strokeWidth={22} />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M 200 ${800 + k * 120} L 340 ${800 + k * 120}`} stroke="#C83A3A" strokeWidth={14} />)}
    <path d="M 340 700 Q 600 760 760 1100 Q 820 1240 1000 1300" stroke="#FFC21A" strokeWidth={60} fill="none" />
    <Blocky x={lerp(360, 940, easeOut(clamp(t / 14)))} y={lerp(700, 1290, easeOut(clamp(t / 14)))} s={0.36} kind="friend" face="starry" t={t} pose={{ armL: 160, armR: 160, lean: lerp(-30, 0, clamp(t / 14)) }} />
    <g transform={`translate(600 600) scale(${popIn(t - 6)}) rotate(-5)`}><text {...txt(84, '#FF7AE0')}>OTHER SLIDE!</text></g>
  </g>
);
export const S25: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1850} s={1.35} kind="dad" face="grin" t={t} pose={{ armL: 120, armR: 120, lean: Math.sin(t * 1.2) * 4 }} />
    {[0, 1].map((k) => <g key={k} transform={`translate(${k ? 800 : 270} ${k ? 700 : 760}) rotate(${k ? 12 : -12}) scale(${popIn(t - k * 12, 5)})`}><text {...txt(130, '#FFFFFF')}>HA!</text></g>)}
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={300} y={1600} s={0.62} kind="kid" face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
    <Blocky x={800} y={1600} s={0.62} kind="dad" face="happy" t={t} pose={{ armL: 140 }} />
  </g>
);
export const S27: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Card t={t} title="DAD SAYS" big="+10 MIN" btn="OK!" ok />
  </g>
);
export const S28: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Rain t={t} kind="gem" n={14} seed="win" />
    <g transform={`translate(540 640) scale(${popIn(t, 6)}) rotate(-4)`}>
      <text y={0} {...txt(140, '#FFFFFF', 16)}>BOSS</text>
      <text y={150} {...txt(130, '#FFD23F', 16)}>DEFEATED</text>
    </g>
    <Blocky x={540} y={1700} s={0.75} kind="kid" face="starry" t={t} pose={{ armL: 165, armR: 165 }} />
    <Confetti t={t} seed="win" />
  </g>
);
export const S29: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#4ADE6A" />
    <Blocky x={320} y={1640} s={0.74} kind="kid" face="happy" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t} /></g>} />
    <Blocky x={770} y={1640} s={0.76} kind="dad" face="grin" t={t} pose={{ armL: 60, armR: 60 }} extra={<g transform="translate(0 -420)"><Controller x={0} y={0} t={t * 1.3} /></g>} />
    <Toast t={t - 3} text="COMMENT DAD" c="#4A9AFF" y={620} />
    <Sparkles t={t} seed="end" />
  </g>
);
export const S30 = badge('1');
export const S31 = badge('2');
export const S32 = badge('3');

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S33 = close(S1, 600, 700, 1.7, 20);    // "dad": his angry face under the crown
export const S34 = close(S1, 170, 1200, 2.2, 20);   // "Block Quest": the tiny kid
export const S35 = close(S3, 380, 800, 1.7, 14);    // "jump": the kid frozen, paused
export const S36 = close(S5, 540, 1000, 1.4, 20);   // "homework": Dad yelling
export const S37 = close(S7, 300, 1200, 1.6, 10);   // "lava": the lava under the kid
export const S38 = close(S9, 540, 1000, 1.4, 20);   // "worse": the kid yelling
export const S39 = close(S14, 400, 1100, 1.7, 20);  // "trash": the kid and the bag
export const S40 = close(S20, 540, 840, 1.7, 14);   // "weak spot": the reticle on his head
export const S41 = close(S25, 540, 1000, 1.3, 20);  // "Okay, okay": Dad laughing
