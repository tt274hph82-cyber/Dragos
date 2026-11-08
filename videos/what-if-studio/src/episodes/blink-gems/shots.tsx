import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Bedroom, Burst, Sparkles, Sky, Block, Confetti, Gem, SpeedLines, Storm, Rain } from '../ten-seconds/shots';
import { Toast, Ground } from '../best-friend/shots';
import words from './words.json';

// "What if you got 1 gem every time you blinked?" The blocky-game What If style, rule-based variation: one rule,
// escalated until it breaks the game. Original characters and an invented game; gems, not any real currency.

type S = React.FC<ShotProps>;
const W_ = words as any[];
const blinks = W_.filter((w) => /^blink$/i.test(w.w)).map((w) => w.s);
const at = (word: string, n = 1) => { let k = 0; for (const w of W_) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const T = { ten: at('Ten'), breaks: at('breaks'), golden: at('golden'), rocket: at('rocket'), robot: at('robot'), gems: at('Gems'), infinity: at('Infinity') };

/** The gem count, from the voice: +1 per spoken "blink", then 10, then the broken counter, then infinity. */
const gemsAt = (sec: number): string => {
  if (sec >= T.infinity) return '∞';
  if (sec >= T.breaks) {
    const n = Math.round(lerp(10, 999999999, clamp((sec - T.breaks) / 0.8)));
    return sec - T.breaks < 1.2 && Math.floor(sec * 12) % 3 === 0 ? 'ERR0R' : n.toLocaleString('en-US');
  }
  if (sec >= T.ten) return '10';
  return String(blinks.filter((b) => b <= sec).length);
};
/** Fixed HUD: the gem counter pill, popping on every change and glitching when it breaks. */
export const GemPill: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, v = gemsAt(sec), prev = gemsAt(sec - 0.15);
  const pop = v !== prev ? 1.2 : 1, glitch = sec >= T.breaks && sec < T.breaks + 1.2;
  return (
    <g transform={`translate(${540 + (glitch ? Math.sin(f * 3.1) * 10 : 0)} 330) scale(${pop})`}>
      <rect x={-230} y={-48} width={460} height={96} rx={48} fill="#1A1424" stroke={glitch ? '#FF4A4A' : '#5AE8F8'} strokeWidth={6} />
      <Gem x={-170} y={4} s={0.75} />
      <text x={30} y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={v.length > 8 ? 50 : 60} fill={glitch ? '#FF4A4A' : '#5AE8F8'}>{v}</text>
    </g>
  );
};
/** A "+1" (or any) gem pop flying up from a point. */
const PlusPop: React.FC<{ t: number; x: number; y: number; text?: string }> = ({ t, x, y, text = '+1' }) => t < 0 || t > 24 ? null : (
  <g transform={`translate(${x} ${y - t * 14}) scale(${popIn(t, 5)})`} opacity={1 - Math.max(0, t - 14) / 10}>
    <Gem x={-60} y={0} s={0.8} />
    <text x={30} y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={84} fill="#5AE8F8" stroke={OL} strokeWidth={10} paintOrder="stroke">{text}</text>
  </g>
);
const Mansion: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(540 1300) scale(${popIn(t, 7)})`}>
    <rect x={-380} y={-460} width={760} height={460} fill="#FFD23F" stroke={OL} strokeWidth={12} />
    <path d="M -430 -460 L 0 -720 L 430 -460 Z" fill="#E8A81A" stroke={OL} strokeWidth={12} strokeLinejoin="round" />
    {[-260, -90, 90, 260].map((x) => <rect key={x} x={x - 50} y={-380} width={100} height={120} rx={10} fill="#8AE8FF" stroke={OL} strokeWidth={8} />)}
    <rect x={-70} y={-200} width={140} height={200} rx={70} fill="#8A5A22" stroke={OL} strokeWidth={8} />
    {[-300, 300].map((x) => <rect key={x} x={x - 26} y={-460} width={52} height={460} fill="#FFF0A0" stroke={OL} strokeWidth={8} />)}
  </g>
);
const Rocket: React.FC<{ t: number }> = ({ t }) => {
  const up = Math.max(0, t - 8) * 40;
  return (
    <g transform={`translate(${540 + Math.sin(t * 2) * (t > 8 ? 4 : 0)} ${1250 - up})`}>
      {t > 8 ? Array.from({ length: 6 }, (_, i) => <circle key={i} cx={(i - 2.5) * 40} cy={120 + i * 30} r={50 + i * 12} fill="#FFFFFF" opacity={0.7 - i * 0.1} />) : null}
      {t > 8 ? <path d={`M -50 40 Q 0 ${200 + Math.sin(t * 3) * 30} 50 40 Z`} fill="#FF9A1A" /> : null}
      <path d="M -90 40 L -90 -360 Q 0 -560 90 -360 L 90 40 Z" fill="#F2F2F8" stroke={OL} strokeWidth={12} />
      <circle cx={0} cy={-260} r={52} fill="#5AC8FF" stroke={OL} strokeWidth={10} />
      <path d="M -90 -60 L -190 60 L -90 40 Z M 90 -60 L 190 60 L 90 40 Z" fill="#E2262E" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
      <path d="M -90 -420 Q 0 -560 90 -420 Z" fill="#E2262E" stroke={OL} strokeWidth={10} />
    </g>
  );
};
const Robot: React.FC<{ t: number }> = ({ t }) => (
  <g transform="translate(540 1500)">
    <rect x={-150} y={-560} width={300} height={320} rx={30} fill="#B8C0D8" stroke={OL} strokeWidth={12} />
    <rect x={-120} y={-900} width={240} height={220} rx={30} fill="#C8D0E8" stroke={OL} strokeWidth={12} />
    <rect x={-4} y={-960} width={8} height={60} fill={OL} /><circle cx={0} cy={-970} r={16} fill="#E2262E" stroke={OL} strokeWidth={6} />
    {[-50, 50].map((x) => <circle key={x} cx={x} cy={-800} r={26} fill="#5AE8F8" stroke={OL} strokeWidth={8} />)}
    <rect x={-40} y={-740} width={80} height={14} rx={7} fill={OL} />
    <rect x={-60} y={-680} width={120} height={120} fill="#9AA0B8" stroke={OL} strokeWidth={8} />
    {/* a bow tie and a tray of drinks */}
    <path d="M -40 -540 L 0 -520 L 40 -540 L 40 -500 L 0 -520 L -40 -500 Z" fill="#1A1424" />
    <g transform={`translate(260 ${-560 + Math.sin(t * 0.3) * 6})`}><rect x={-110} y={-12} width={220} height={24} rx={12} fill="#D8D8E0" stroke={OL} strokeWidth={6} />
      {[-50, 30].map((x) => <g key={x}><rect x={x - 20} y={-90} width={40} height={78} rx={8} fill="#FF9A1A" opacity={0.85} stroke={OL} strokeWidth={5} /></g>)}</g>
    <path d="M 150 -500 L 230 -560" stroke="#B8C0D8" strokeWidth={50} strokeLinecap="round" />
    {[-90, 90].map((x) => <rect key={x} x={x - 45} y={-240} width={90} height={240} rx={16} fill="#9AA0B8" stroke={OL} strokeWidth={10} />)}
  </g>
);
const Flood: React.FC<{ t: number; level: number }> = ({ t, level }) => (
  <g>
    {Array.from({ length: 140 }, (_, i) => {
      const x = (i % 14) * 82 + ((Math.floor(i / 14) % 2) * 40), y = 1900 - Math.floor(i / 14) * 70;
      return y > 1900 - level ? <Gem key={i} x={x + Math.sin(t * 0.2 + i) * 6} y={y} s={1.0} /> : null;
    })}
  </g>
);
const Hammer: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <rect x={-14} y={-20} width={28} height={300} rx={10} fill="#8A5A22" stroke={OL} strokeWidth={8} />
    <rect x={-110} y={-120} width={220} height={110} rx={16} fill="#5A5A6A" stroke={OL} strokeWidth={10} />
    <text y={-46} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#FF4A4A">BAN</text>
  </g>
);

// ---------------------------------------------------------------- shots
const blinkFace = (t: number, every = 6) => ((t % every) < 2 ? 'sleepy' : 'starry') as any;
export const S1: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    <Blocky x={540} y={1800} s={1.25} kind="kid" face="happy" t={t} />
    <g transform={`translate(860 700) rotate(${t * 4})`}><Gem x={0} y={0} s={1.4} /></g>
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6A8A" c2="#2A8AAA" />
    <g transform={`translate(540 860) scale(${popIn(t) * 3.6}) rotate(${Math.sin(t * 0.4) * 10})`}><Gem x={0} y={0} /></g>
    <Sparkles t={t} n={16} seed="g" />
  </g>
);
const blinkClose = (seed: number): S => ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6A8A" c2="#2A8AAA" />
    <Blocky x={540} y={2100} s={1.65} kind="kid" face={t < 4 ? 'sleepy' : 'starry'} t={t + seed} />
    <PlusPop t={t - 4} x={800} y={760} />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6A8A" c2="#2A8AAA" />
    <Blocky x={540} y={2100} s={1.65} kind="kid" face="sleepy" t={t} />
  </g>
);
export const S4 = blinkClose(0);
export const S5: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    <Blocky x={540} y={1650} s={1.0} kind="kid" face="grin" t={t} pose={{ armR: 100 }} />
    <g transform={`translate(780 ${lerp(300, 1000, easeOut(clamp(t / 10)))})`}><Gem x={0} y={0} s={1.3} /></g>
  </g>
);
export const S6 = blinkClose(3);
export const S7 = blinkClose(6);
export const S8 = blinkClose(9);
export const S9: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    {Array.from({ length: 10 }, (_, i) => <g key={i} transform={`translate(${360 + (i % 5) * 90} ${1220 - Math.floor(i / 5) * 70}) scale(${popIn(t - i, 4)})`}><Gem x={0} y={0} s={1.1} /></g>)}
    <Blocky x={200} y={1320} s={0.5} kind="kid" face="starry" t={t} pose={{ armL: 140, armR: 140 }} />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#0E3A3A" c2="#145A50" />
    <SpeedLines t={t * 2} c="#7AFFE0" o={0.45} />
    <Blocky x={540} y={2100} s={1.65} kind="kid" face={blinkFace(t, 3)} t={t} />
    {[0, 6, 12, 18].map((d, i) => <PlusPop key={i} t={t - d} x={i % 2 ? 250 : 830} y={800 + i * 40} text={`+${(i + 1) * 99}`} />)}
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#5A1A24" c2="#7A2A30" />
    <g transform={`translate(${540 + Math.sin(t * 3) * 12} 860) scale(1.6)`}>
      <rect x={-230} y={-48} width={460} height={96} rx={48} fill="#1A1424" stroke="#FF4A4A" strokeWidth={6} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#FF4A4A">999,999,999</text>
      <path d="M -60 -48 L -20 -6 L -50 10 L 0 48" stroke="#FFFFFF" strokeWidth={6} fill="none" />
    </g>
    {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M 540 860 l ${Math.cos(i) * (40 + t * 20)} ${Math.sin(i) * (40 + t * 20)}`} stroke="#FFD23F" strokeWidth={8} strokeLinecap="round" opacity={Math.max(0, 1 - t / 14)} />)}
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Sky c="#8AD0F8" /><Ground />
    <Mansion t={t} />
    <Sparkles t={t} n={14} seed="m" />
    <Blocky x={170} y={1340} s={0.4} kind="kid" face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <Sky c="#5AA8E8" /><Ground />
    <Rocket t={t} />
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <Sky c="#8AD0F8" /><Ground />
    <Robot t={t} />
    <Blocky x={170} y={1500} s={0.45} kind="kid" face="grin" t={t} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#5A1A24" c2="#7A2A30" />
    <Blocky x={540} y={2100} s={1.65} kind="kid" face={(t % 4) < 2 ? 'sleepy' : 'shock'} t={t} pose={{ armL: 160, armR: 160 }} />
    <Rain t={t} kind="gem" n={16} seed="p" />
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Sky c="#5AA8D8" /><Ground />
    <Rain t={t * 1.5} kind="gem" n={46} seed="r16" />
    {[200, 540, 880].map((x, i) => <Blocky key={x} x={x} y={1320} s={0.38} kind={i === 1 ? 'kid' : 'friend'} face="shock" t={t + i} pose={{ armL: 160, armR: 160 }} />)}
  </g>
);
export const S17: S = ({ t, len }) => (
  <g>
    <Sky c="#5AA8D8" />
    {[160, 500, 840].map((x) => <g key={x}><rect x={x - 110} y={980} width={220} height={320} fill="#C88A52" stroke={OL} strokeWidth={10} /><path d={`M ${x - 140} 980 L ${x} 860 L ${x + 140} 980 Z`} fill="#D8323A" stroke={OL} strokeWidth={10} /></g>)}
    <Flood t={t} level={lerp(300, 1100, clamp(t / Math.max(1, len)))} />
    <Blocky x={540} y={lerp(1600, 820, clamp(t / Math.max(1, len)))} s={0.35} kind="friend" face="shock" t={t} pose={{ armL: 170, armR: 170 }} />
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Storm t={t} />
    {t % 8 < 4 ? <path d="M 620 300 L 520 700 L 600 700 L 480 1300 L 680 640 L 590 640 L 700 300 Z" fill="#FFF6C0" /> : null}
    <g opacity={0.95}><Blocky x={540} y={1400} s={0.9} kind="boss" face="angry" t={t} /></g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#0A0418" opacity={0.45} />
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <Blocky x={600} y={1500} s={0.95} kind="boss" face="angry" t={t} pose={{ armR: 120 }} />
    <Hammer x={860} y={760} a={-20 + Math.sin(t * 0.3) * 6} />
    <g transform={`translate(540 560) scale(${popIn(t - 3)})`}><rect x={-160} y={-56} width={320} height={112} rx={20} fill="#E2262E" stroke={OL} strokeWidth={10} /><text y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill="#FFFFFF">ADMIN</text></g>
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#5A1A24" c2="#7A2A30" />
    <Blocky x={540} y={2150} s={1.6} kind="boss" face="yell" t={t} />
    <SpeedLines t={t} c="#FF8A8A" o={0.35} />
  </g>
);
export const S21: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6A8A" c2="#2A8AAA" />
    <Blocky x={540} y={2150} s={1.65} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} />
  </g>
);
export const S22: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#F4E2CC" />
    {[260, 820].map((x) => <g key={x}>
      <ellipse cx={x} cy={900} rx={220} ry={180} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${x + Math.cos(i) * 210} ${900 + Math.sin(i) * 170} q ${-Math.cos(i) * 40} ${-Math.sin(i) * 30} ${-Math.cos(i) * 80} ${-Math.sin(i) * 50}`} stroke="#E2262E" strokeWidth={6} fill="none" opacity={clamp(t / 10)} />)}
      <circle cx={x} cy={900} r={90} fill={OL} /><circle cx={x + 26} cy={872} r={26} fill="#FFFFFF" />
    </g>)}
    {[0, 1].map((i) => <path key={i} d={`M ${200 + i * 560} ${1100 + ((t * 4) % 60)} q 12 26 0 40 q -12 -14 0 -40 Z`} fill="#7FD0FF" stroke={OL} strokeWidth={4} />)}
  </g>
);
export const S23: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Blocky x={540} y={2150} s={1.65} kind="kid" face="worried" t={t} />
    <g transform={`translate(800 700) scale(${popIn(t - 4, 5)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={110} fill="#FFFFFF" stroke={OL} strokeWidth={12} paintOrder="stroke">AH...</text></g>
  </g>
);
export const S24: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    {Array.from({ length: 30 }, (_, i) => { const a = i * 0.21, r = 80 + t * (30 + (i % 5) * 10); return <Gem key={i} x={540 + Math.cos(a) * r} y={900 + Math.sin(a) * r} s={1.0} />; })}
    <Blocky x={540} y={2150} s={1.65} kind="kid" face="yell" t={t} />
    <g transform={`translate(540 640) rotate(-6) scale(${popIn(t, 5)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={170} fill="#FFD23F" stroke={OL} strokeWidth={16} paintOrder="stroke">ACHOO!</text></g>
  </g>
);
export const S25: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A6A" c2="#B82A8A" />
    <Rain t={t * 2} kind="gem" n={40} seed="inf" />
    <g transform={`translate(540 900) scale(${popIn(t, 6) * 1.2})`}><text textAnchor="middle" y={120} fontFamily={FONT.game} fontWeight={900} fontSize={420} fill="#5AE8F8" stroke={OL} strokeWidth={22} paintOrder="stroke">∞</text></g>
    <Confetti t={t} seed="inf" />
  </g>
);
export const S26: S = ({ t }) => (
  <g>
    <Bedroom t={t} dark={0.4} />
    <g transform={`translate(540 980) scale(${popIn(t, 6)})`}>
      <rect x={-460} y={-420} width={920} height={840} rx={36} fill="#1E1A28" stroke="#3A3448" strokeWidth={6} />
      <text x={-400} y={-340} fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF">Comments</text>
      {['i blinked 47 times', 'ACHOO = infinity gems lol', 'the admin is so me'].map((c, i) => <g key={i}><circle cx={-380} cy={-240 + i * 120} r={36} fill={['#5AE8F8', '#FFD23F', '#E2262E'][i]} /><text x={-320} y={-228 + i * 120} fontFamily={FONT.game} fontWeight={800} fontSize={38} fill="#D8D0E8">{c}</text></g>)}
      <rect x={-400} y={180} width={800} height={110} rx={55} fill="#2E2A3E" stroke="#5AE8F8" strokeWidth={6} />
      <text x={-350} y={252} fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#FFFFFF">{'BLINK'.slice(0, Math.max(0, Math.floor((t - 6) / 3)))}{Math.floor(t / 8) % 2 ? '|' : ''}</text>
    </g>
  </g>
);

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S27 = close(S12, 540, 1000, 1.5, 20);   // "mansion"
export const S28 = close(S16, 540, 1100, 1.6, 20);   // "from the sky": a player in the rain
export const S29 = close(S17, 540, 1200, 1.4, 40);   // "flooding": the drowning player
export const S30 = close(S19, 860, 700, 1.6, 20);    // "economy": the BAN hammer
