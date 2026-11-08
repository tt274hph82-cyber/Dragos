import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Sparkles, Gem, SpeedLines, Confetti } from '../ten-seconds/shots';
import words from './words.json';

// "What if your pet swallowed your mom?" A 6-minute 16:9 long-form in the blocky-game What If style: five chapters,
// a chapter chip, a SAVE MOM mission bar and an escape countdown in the fixed HUD. Drawn natively in 1920 x 1080.
// Original characters (Biscuit the dog, the Hairball King) and an invented game.

type S = React.FC<ShotProps>;
const LW = 1920, LH = 1080;
const W_ = words as any[];
const nth = (word: string, n = 1) => { let k = 0; for (const w of W_) if (w.w.toLowerCase().replace(/[^a-z']/g, '') === word && ++k === n) return w.s; return 0; };
export const CH = [0, nth('chapter', 1), nth('chapter', 2), nth('chapter', 3), nth('chapter', 4), nth('chapter', 5)];
const THIRTY = nth('thirty'), ACHOO = nth('achoo');
const NAMES = ['', 'THE SNACK', 'THE MOUTH', 'THE STOMACH', 'THE ESCAPE', 'HOME'];

// ---------------------------------------------------------------- the fixed HUD
export const Hud: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  const ch = CH.filter((c, i) => i && sec >= c).length;
  const prog = [0, 0.1, 0.35, 0.7, 0.85, 1][ch];
  const cd = sec >= THIRTY && sec < ACHOO ? Math.max(0, Math.ceil(30 - ((sec - THIRTY) / (ACHOO - THIRTY)) * 30)) : -1;
  return (
    <g>
      {ch ? <g transform="translate(70 70)">
        <rect x={0} y={0} width={420} height={76} rx={38} fill="#1A1424" opacity={0.92} />
        <text x={210} y={50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={36} fill="#FFD23F">{`CH ${ch} · ${NAMES[ch]}`}</text>
      </g> : null}
      <g transform="translate(1430 70)">
        <rect x={0} y={0} width={420} height={76} rx={38} fill="#1A1424" opacity={0.92} />
        <text x={30} y={50} fontFamily={FONT.game} fontWeight={900} fontSize={32} fill="#FFFFFF">SAVE MOM</text>
        <rect x={210} y={26} width={180} height={26} rx={13} fill="#3A3448" />
        <rect x={210} y={26} width={180 * prog} height={26} rx={13} fill={prog >= 1 ? '#4ADE6A' : '#FF7AE0'} />
      </g>
      {cd >= 0 ? <g transform={`translate(960 110) scale(${cd <= 10 ? 1.15 : 1})`}>
        <rect x={-120} y={-44} width={240} height={88} rx={44} fill={cd <= 10 ? '#E2262E' : '#1A1424'} stroke="#FFFFFF" strokeWidth={cd <= 10 ? 6 : 0} />
        <text y={18} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={52} fill="#FFFFFF">{`0:${String(cd).padStart(2, '0')}`}</text>
      </g> : null}
    </g>
  );
};

// ---------------------------------------------------------------- landscape sets and props
const Fill: React.FC<{ c: string }> = ({ c }) => <rect x={-600} y={-600} width={LW + 1200} height={LH + 1200} fill={c} />;
const WBurst: React.FC<{ t: number; c1: string; c2: string }> = ({ t, c1, c2 }) => (
  <g><Fill c={c1} /><g transform={`translate(960 540) rotate(${t * 0.6})`}>{Array.from({ length: 20 }, (_, i) => <path key={i} d="M 0 0 L -110 -1800 L 110 -1800 Z" fill={c2} transform={`rotate(${i * 18})`} />)}</g></g>
);
const Living: React.FC<{ t: number; night?: boolean; mess?: boolean }> = ({ t, night, mess }) => (
  <g>
    <Fill c={night ? '#2A2458' : '#F2D8B4'} />
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-600 + i * 200} y={-600} width={100} height={1500} fill={night ? '#322A62' : '#EACCA4'} />)}
    <rect x={-600} y={820} width={LW + 1200} height={900} fill={night ? '#4A3A5A' : '#B87A4A'} />
    {/* window, lamp, TV, couch, rug */}
    <rect x={120} y={160} width={380} height={380} rx={12} fill={night ? '#1A1A48' : '#9AD8F8'} stroke={OL} strokeWidth={10} />
    <path d="M 310 160 L 310 540 M 120 350 L 500 350" stroke={OL} strokeWidth={10} />
    {night ? <circle cx={420} cy={240} r={36} fill="#FFF2B0" /> : <circle cx={420} cy={240} r={44} fill="#FFE27A" />}
    <rect x={1500} y={300} width={300} height={190} rx={12} fill="#14101E" stroke={OL} strokeWidth={10} />
    <rect x={1515} y={315} width={270} height={160} fill={night ? '#3A6AE8' : '#4AC8FF'} opacity={0.8} />
    <rect x={560} y={600} width={760} height={240} rx={50} fill="#7A4A8A" stroke={OL} strokeWidth={10} />
    <rect x={580} y={520} width={720} height={130} rx={40} fill="#8A5A9A" stroke={OL} strokeWidth={10} />
    <ellipse cx={960} cy={980} rx={620} ry={70} fill="#2AA8A0" stroke={OL} strokeWidth={8} opacity={0.85} />
    {mess ? <g>{[[300, 120, '#FF9A1A'], [900, 60, '#FF9A1A'], [1400, 140, '#FF9A1A']].map(([x, y, c], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${i * 40})`}><path d="M 0 0 L 90 -30 L 70 60 Z" fill={c as string} stroke={OL} strokeWidth={6} /></g>)}
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={200 + i * 170} cy={900 + (i % 3) * 40} rx={60} ry={14} fill="#AFE0FF" opacity={0.7} />)}</g> : null}
  </g>
);
/** Biscuit: a big blocky golden dog facing right. mouth 0..1 opens the jaw; face: happy, chew, hungry, sneaky. */
const Dog: React.FC<{ x: number; y: number; s: number; t: number; mouth?: number; face?: 'happy' | 'chew' | 'hungry' | 'sneaky' | 'sneeze'; flip?: boolean; inMouth?: React.ReactNode; belly?: number }> = ({ x, y, s, t, mouth = 0, face = 'happy', flip, inMouth, belly = 0 }) => {
  const wag = Math.sin(t * 0.9) * 20;
  const chew = face === 'chew' ? Math.abs(Math.sin(t * 0.8)) * 0.25 : 0;
  const m = Math.max(mouth, chew);
  const c = '#E8A03A', cd = '#C8802A';
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={6} rx={360} ry={30} fill="#000" opacity={0.2} />
      <path d={`M -300 -360 Q -420 ${-480 + wag} -380 ${-560 + wag}`} stroke={cd} strokeWidth={46} fill="none" strokeLinecap="round" />
      {[-240, -120, 120, 230].map((lx) => <g key={lx}><rect x={lx - 44} y={-230} width={88} height={230} rx={20} fill={c} stroke={OL} strokeWidth={10} /><rect x={lx - 50} y={-40} width={100} height={44} rx={16} fill="#F2E4C4" stroke={OL} strokeWidth={8} /></g>)}
      <rect x={-320} y={-470} width={600} height={290 + belly * 60} rx={70} fill={c} stroke={OL} strokeWidth={12} />
      <rect x={-200} y={-300} width={360} height={110 + belly * 50} rx={50} fill="#F2D49A" />
      {/* head: a big box with a snout, a hinged jaw, floppy ears and a collar tag */}
      <g transform="translate(250 -470)">
        <rect x={-40} y={10} width={120} height={60} fill="#E2262E" stroke={OL} strokeWidth={8} />
        <circle cx={20} cy={90} r={30} fill="#FFD23F" stroke={OL} strokeWidth={6} />
        <g transform={`translate(140 -40) rotate(${m * 38})`}>
          <rect x={-60} y={-10} width={240} height={110} rx={30} fill={cd} stroke={OL} strokeWidth={12} />
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={-30 + i * 54} y={-10} width={30} height={26} fill="#FFFFFF" stroke={OL} strokeWidth={5} />)}
        </g>
        {m > 0.05 ? <g><path d={`M 120 -40 L 380 ${-40 + m * 40} L 380 ${-40 + m * 180} Q 250 ${-40 + m * 220} 120 30 Z`} fill="#5A1A24" />{inMouth}</g> : null}
        <rect x={-120} y={-330} width={360} height={320} rx={70} fill={c} stroke={OL} strokeWidth={12} />
        <rect x={120} y={-170} width={260} height={150} rx={40} fill={c} stroke={OL} strokeWidth={12} />
        <ellipse cx={360} cy={-150} rx={36} ry={28} fill={OL} />
        {[-90, 190].map((ex, i) => <path key={ex} d={`M ${ex} -330 Q ${ex - 60 + i * 40} -230 ${ex - 30 + i * 30} -120 Q ${ex + 20} -200 ${ex + 50} -320 Z`} fill={cd} stroke={OL} strokeWidth={10} />)}
        {face === 'sneeze' ? <path d="M 30 -210 L 80 -190 M 30 -170 L 80 -190" stroke={OL} strokeWidth={12} strokeLinecap="round" />
          : face === 'sneaky' ? <g><path d="M 10 -200 L 90 -200" stroke={OL} strokeWidth={12} strokeLinecap="round" /><circle cx={60} cy={-196} r={10} fill={OL} /></g>
          : <g><ellipse cx={50} cy={-200} rx={40} ry={face === 'hungry' ? 50 : 44} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><circle cx={64} cy={-196} r={22} fill={OL} /><circle cx={72} cy={-206} r={8} fill="#FFFFFF" /></g>}
        {face === 'hungry' ? <path d={`M 300 -10 q 10 ${40 + Math.sin(t * 0.3) * 10} 0 ${70 + Math.sin(t * 0.3) * 10} q -10 -20 0 -${70 + Math.sin(t * 0.3) * 10}`} fill="#AFE0FF" stroke={OL} strokeWidth={4} /> : null}
      </g>
    </g>
  );
};
const Slipper: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><path d="M -80 0 Q -90 -40 -40 -44 L 70 -40 Q 100 -20 80 10 Q 0 24 -80 0 Z" fill="#F28AB8" stroke={OL} strokeWidth={8} /><ellipse cx={-30} cy={-40} rx={40} ry={20} fill="#FFFFFF" stroke={OL} strokeWidth={6} /></g>
);
const Pizza: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><path d="M 0 -80 L 80 60 L -80 60 Z" fill="#FFC85A" stroke={OL} strokeWidth={8} strokeLinejoin="round" /><path d="M -80 60 L 80 60 L 70 80 L -70 80 Z" fill="#C8802A" stroke={OL} strokeWidth={8} />{[[-20, 20], [20, 30], [0, -20]].map(([px, py], i) => <circle key={i} cx={px} cy={py} r={14} fill="#E2262E" />)}</g>
);
const Remote: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}><rect x={-30} y={-100} width={60} height={200} rx={20} fill="#2A2234" stroke={OL} strokeWidth={8} /><circle cx={0} cy={-60} r={12} fill="#E2262E" />{[0, 30, 60].map((yy) => <rect key={yy} x={-16} y={yy - 20} width={32} height={16} rx={6} fill="#8A8AA8" />)}</g>
);
const Vacuum: React.FC<{ x: number; y: number; s?: number; r?: number; on?: boolean; t?: number }> = ({ x, y, s = 1, r = 0, on, t = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-150} y={-120} width={300} height={140} rx={40} fill="#E2262E" stroke={OL} strokeWidth={10} />
    <circle cx={-100} cy={30} r={34} fill="#2A2234" stroke={OL} strokeWidth={8} /><circle cx={100} cy={30} r={34} fill="#2A2234" stroke={OL} strokeWidth={8} />
    <path d="M 140 -80 Q 260 -120 300 -40 L 360 60" stroke="#5A5A6A" strokeWidth={30} fill="none" strokeLinecap="round" />
    <rect x={320} y={50} width={110} height={40} rx={10} fill="#3A3448" stroke={OL} strokeWidth={8} />
    {on ? Array.from({ length: 8 }, (_, i) => { const k = ((t * 0.08 + i / 8) % 1); return <path key={i} d={`M ${380 + (1 - k) * 500} ${70 + Math.sin(i * 2) * 200 * (1 - k)} l -40 0`} stroke="#FFFFFF" strokeWidth={6} opacity={k} />; }) : null}
  </g>
);
const Tablet: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-420} y={-280} width={840} height={560} rx={40} fill="#1E1A2E" stroke={OL} strokeWidth={14} /><rect x={-380} y={-240} width={760} height={480} rx={20} fill="#2E2A48" />{children}</g>
);
const Potion: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -160 L 40 -160 L 40 -90 Q 130 -40 120 60 Q 110 150 0 150 Q -110 150 -120 60 Q -130 -40 -40 -90 Z" fill="#4ADE6A" fillOpacity={0.85} stroke={OL} strokeWidth={10} />
    <rect x={-56} y={-200} width={112} height={50} rx={10} fill="#8A5A22" stroke={OL} strokeWidth={8} />
    {Array.from({ length: 5 }, (_, i) => { const k = ((t * 0.04 + i / 5) % 1); return <circle key={i} cx={-60 + i * 30} cy={110 - k * 200} r={8 + i * 2} fill="#FFFFFF" opacity={0.6 * (1 - k)} />; })}
    <text y={60} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF" stroke={OL} strokeWidth={6} paintOrder="stroke">SHRINK</text>
  </g>
);
/** Inside the mouth: a dark red cave, a row of block teeth top and bottom that chomp, the tongue below. */
const Mouth: React.FC<{ t: number; chomp?: boolean; teethScale?: number }> = ({ t, chomp, teethScale = 1 }) => {
  const k = chomp ? Math.abs(Math.sin(t * 0.25)) : 0.15;
  return (
    <g>
      <Fill c="#4A0E18" />
      <ellipse cx={960} cy={560} rx={1100} ry={520} fill="#6A1A28" />
      <path d="M -200 1100 Q 960 640 2120 1100 Z" fill="#F07A9A" stroke={OL} strokeWidth={12} />
      <path d="M 960 760 L 960 1100" stroke="#C85A7A" strokeWidth={10} />
      {Array.from({ length: 8 }, (_, i) => <rect key={`u${i}`} x={130 + i * 210} y={-40 + k * 260} width={170 * teethScale} height={260 * teethScale} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={10} />)}
      {Array.from({ length: 8 }, (_, i) => <rect key={`d${i}`} x={130 + i * 210} y={860 - k * 260} width={170 * teethScale} height={260 * teethScale} rx={30} fill="#F2F2E8" stroke={OL} strokeWidth={10} />)}
    </g>
  );
};
const Stomach: React.FC<{ t: number; shake?: number }> = ({ t, shake = 0 }) => (
  <g transform={`translate(${Math.sin(t * 2.3) * 14 * shake} ${Math.cos(t * 1.9) * 10 * shake}) rotate(${Math.sin(t * 0.5) * 3 * shake} 960 540)`}>
    <Fill c="#3A6A2A" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-100 + i * 260} -100 Q ${30 + i * 260} 300 ${-100 + i * 260} 700`} stroke="#4A8A3A" strokeWidth={60} fill="none" />)}
    <rect x={-600} y={760} width={LW + 1200} height={900} fill="#9AE85A" />
    {Array.from({ length: 14 }, (_, i) => { const k = ((t * 0.03 + i / 14) % 1); return <circle key={i} cx={(i * 143) % LW} cy={780 + k * 200} r={16 + (i % 4) * 8} fill="#CCFF8A" opacity={1 - k} stroke="#6AB83A" strokeWidth={4} />; })}
    <rect x={-600} y={760} width={LW + 1200} height={16} fill="#CCFF8A" />
  </g>
);
const Floaters: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Slipper x={300} y={790 + Math.sin(t * 0.2) * 10} s={1.3} r={-8} />
    <Pizza x={700} y={770 + Math.sin(t * 0.2 + 1) * 10} s={1.2} r={20} />
    <Remote x={1150} y={800 + Math.sin(t * 0.2 + 2) * 10} s={1.1} r={80} />
    <g transform={`translate(1600 ${790 + Math.sin(t * 0.2 + 3) * 10})`}><circle r={54} fill="#D8F23A" stroke={OL} strokeWidth={8} /><path d="M -50 -10 Q 0 20 50 -10" stroke="#FFFFFF" strokeWidth={8} fill="none" /><text y={100} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={34} fill="#FFFFFF" stroke={OL} strokeWidth={6} paintOrder="stroke">2019</text></g>
  </g>
);
const Hairball: React.FC<{ x: number; y: number; s: number; t: number; hurt?: number }> = ({ x, y, s, t, hurt = 0 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.2) * 10}) scale(${s * (1 - hurt * 0.6)}) rotate(${hurt * 200})`}>
    {Array.from({ length: 40 }, (_, i) => { const a = i * 0.157, r = 300 + (i % 3) * 20; return <path key={i} d={`M ${Math.cos(a) * 200} ${Math.sin(a) * 200} Q ${Math.cos(a + 0.2) * (r + 40)} ${Math.sin(a + 0.2) * (r + 40)} ${Math.cos(a) * (r + 60)} ${Math.sin(a) * (r + 60)}`} stroke="#8A6A4A" strokeWidth={24} fill="none" strokeLinecap="round" />; })}
    <circle r={320} fill="#A8865A" stroke={OL} strokeWidth={14} />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${(random(`hx${i}`) - 0.5) * 460} ${(random(`hy${i}`) - 0.5) * 460} q 30 -10 50 20`} stroke="#7A5A3A" strokeWidth={8} fill="none" />)}
    {[-110, 110].map((ex) => <g key={ex}><ellipse cx={ex} cy={-40} rx={70} ry={80} fill="#FFFFFF" stroke={OL} strokeWidth={10} /><circle cx={ex + 10} cy={-30} r={34} fill="#E2262E" /><circle cx={ex + 10} cy={-30} r={16} fill={OL} /></g>)}
    <path d="M -160 -150 L -40 -110 M 160 -150 L 40 -110" stroke={OL} strokeWidth={18} strokeLinecap="round" />
    <path d="M -120 120 Q 0 60 120 120" stroke={OL} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M -170 -300 L -190 -440 L -90 -370 L 0 -470 L 90 -370 L 190 -440 L 170 -300 Z" fill="#FFD23F" stroke={OL} strokeWidth={12} strokeLinejoin="round" />
  </g>
);
const BossBar: React.FC<{ hp: number }> = ({ hp }) => React.useContext(CloseCtx) ? null : (
  <g transform="translate(960 230)"><text x={-400} y={-20} fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF" stroke={OL} strokeWidth={6} paintOrder="stroke">♛ THE HAIRBALL KING</text>
    <rect x={-400} y={0} width={800} height={46} rx={23} fill="#1A1424" stroke="#FFFFFF" strokeWidth={5} /><rect x={-395} y={5} width={790 * hp} height={36} rx={18} fill="#E2262E" /></g>
);
const Throat: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Fill c="#5A1A24" />
    {Array.from({ length: 10 }, (_, i) => { const k = ((t * 0.04 + i / 10) % 1); return <ellipse key={i} cx={960} cy={540} rx={120 + k * 1300} ry={80 + k * 900} fill="none" stroke="#8A2A3A" strokeWidth={10 + k * 50} opacity={k} />; })}
    <ellipse cx={960} cy={540} rx={120} ry={80} fill="#2A0810" />
  </g>
);
const Word: React.FC<{ t: number; text: string; x?: number; y?: number; size?: number; c?: string; rot?: number }> = ({ t, text, x = 960, y = 330, size = 140, c = '#FFD23F', rot = -6 }) => React.useContext(CloseCtx) || t < 0 ? null : (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${popIn(t, 5)})`}><text textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={size} fill={c} stroke={OL} strokeWidth={size * 0.12} paintOrder="stroke">{text}</text></g>
);
const Tag: React.FC<{ t: number; text: string; x?: number; y?: number; c?: string }> = ({ t, text, x = 960, y = 260, c = '#FFD23F' }) => React.useContext(CloseCtx) || t < 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${popIn(t, 6)})`}><rect x={-text.length * 15 - 50} y={-50} width={text.length * 30 + 100} height={100} rx={30} fill="#1A1424" stroke={c} strokeWidth={8} /><text y={16} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={48} fill="#FFFFFF">{text}</text></g>
);
const Sky: React.FC = () => <g><Fill c="#7ACCF2" /><rect x={-600} y={860} width={LW + 1200} height={900} fill="#5AC86A" /></g>;

// ---------------------------------------------------------------- shots (base shots, then close variants)
type Shot = S;
const sh: Record<string, Shot> = {};
const def = (id: string, f: Shot) => { sh[id] = f; return f; };
// cold open
def('A1', ({ t }) => <g><Living t={t} /><Dog x={862} y={1110} s={1.25} t={t} mouth={0.55} inMouth={<g transform="translate(300 30) rotate(70)"><rect x={-30} y={-80} width={60} height={140} fill="#9A7AD8" stroke={OL} strokeWidth={8} /><rect x={-40} y={50} width={80} height={36} rx={14} fill="#F28AB8" stroke={OL} strokeWidth={6} /></g>} /><Word t={t - 8} text="?!" x={1600} y={300} size={180} /></g>);
def('A2', ({ t }) => <g><WBurst t={t} c1="#8A1A2A" c2="#A82A3A" /><Dog x={264} y={1870} s={2.2} t={t} mouth={Math.max(0, 0.9 - t / 12)} face="happy" /><Word t={t - 4} text="GULP!" x={1450} y={360} c="#FF4A4A" /></g>);
def('A3', ({ t }) => <g><Mouth t={t} /><Blocky x={960} y={1000} s={0.32} kind="kid" face="determined" t={t} /><Word t={t - 6} text="GO INSIDE" y={300} size={110} /></g>);
def('A4', ({ t }) => <g><WBurst t={t} c1="#3A2468" c2="#4A3488" /><Blocky x={960} y={1400} s={1.15} kind="kid" face="despair" t={t} pose={{ armL: 160, armR: 160 }} /></g>);
def('A5', ({ t }) => <g><Living t={t} /><Dog x={760} y={950} s={1.05} t={t} face="happy" /><Tag t={t - 4} text="BISCUIT" x={1450} y={300} c="#E8A03A" /></g>);
def('A6', ({ t }) => <g><WBurst t={t} c1="#C8802A" c2="#E8A03A" /><Dog x={453} y={1630} s={1.9} t={t} face="hungry" mouth={0.2} /><g transform="translate(1450 520)"><rect x={-260} y={-60} width={520} height={120} rx={30} fill="#1A1424" stroke="#FFFFFF" strokeWidth={6} /><text x={-230} y={18} fontFamily={FONT.game} fontWeight={900} fontSize={42} fill="#FFFFFF">HUNGER</text><rect x={-20} y={-24} width={250} height={48} rx={24} fill="#3A3448" /><rect x={-20} y={-24} width={250 * clamp(0.5 + t / 30)} height={48} rx={24} fill="#E2262E" /></g></g>);
// chapter cards
const chapter = (n: number, c1: string, c2: string): Shot => ({ t, len }) => (
  <g>
    <WBurst t={t} c1={c1} c2={c2} />
    <circle cx={960} cy={540} r={200 + t * 50} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <g transform={`translate(960 ${520 - Math.max(0, t - len + 6) * 140}) scale(${(t < 5 ? lerp(3, 1, easeOut(t / 5)) : 1)}) rotate(${t < 5 ? lerp(-18, -3, easeOut(t / 5)) : -3})`}>
      <rect x={-520} y={-200} width={1040} height={400} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={16} />
      <text y={-60} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={80} fill={c1}>{`CHAPTER ${n}`}</text>
      <text y={100} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={130} fill={OL}>{NAMES[n]}</text>
    </g>
    <Sparkles t={t * 2} n={16} seed={`ch${n}`} />
  </g>
);
def('C1', chapter(1, '#E8A03A', '#F2B85A')); def('C2', chapter(2, '#C83A5A', '#E85A7A')); def('C3', chapter(3, '#3A8A2A', '#5AAA3A')); def('C4', chapter(4, '#2A6AC8', '#3A8AE8')); def('C5', chapter(5, '#8A4AC8', '#A86AE8'));
// chapter 1: the snack
def('B1', ({ t }) => <g><Living t={t} /><Blocky x={1250} y={980} s={0.5} kind="mom" face="happy" t={t} pose={{ armR: 60 }} /><Vacuum x={1500} y={960} s={0.7} r={0} /><Dog x={520} y={960} s={0.75} t={t} face="sneaky" /></g>);
def('B2', ({ t }) => <g><Living t={t} /><Blocky x={1150} y={1350} s={1.0} kind="mom" face="angry" t={t} pose={{ armR: 100 }} /><Slipper x={600} y={900} s={2} /></g>);
def('B3', ({ t }) => <g><Living t={t} /><Dog x={760} y={1070} s={1.2} t={t} face="chew" inMouth={<Slipper x={300} y={20} s={1.6} r={10} />} /></g>);
def('B4', ({ t }) => <g><WBurst t={t} c1="#F2B85A" c2="#FFD07A" /><Dog x={500} y={1390} s={1.6} t={t} mouth={0.6} /><Pizza x={lerp(1800, 1100, clamp(t / 10))} y={lerp(200, 560, clamp(t / 10))} s={1.8} r={t * 8} /><SpeedLines t={t} o={0.25} /></g>);
def('B5', ({ t }) => <g><WBurst t={t} c1="#F2B85A" c2="#FFD07A" /><Dog x={500} y={1390} s={1.6} t={t} mouth={0.6} /><Remote x={lerp(1800, 1100, clamp(t / 10))} y={lerp(200, 560, clamp(t / 10))} s={2} r={t * 12} /><SpeedLines t={t} o={0.25} /></g>);
def('B6', ({ t }) => <g><WBurst t={t} c1="#E8A03A" c2="#F2B85A" /><Dog x={500} y={1390} s={1.6} t={t} mouth={0.75} /><Vacuum x={lerp(1900, 1150, clamp(t / 12))} y={lerp(300, 560, clamp(t / 12))} s={1.2} r={t * 6} /><Word t={t - 8} text="CHOMP!" x={1500} y={260} /></g>);
def('B7', ({ t }) => <g><Living t={t} /><Blocky x={960} y={1450} s={1.15} kind="mom" face="yell" t={t} pose={{ armL: 150, armR: 150 }} /></g>);
def('B8', ({ t }) => <g><Living t={t} /><Dog x={560} y={960} s={0.8} t={t} face="sneaky" /><Blocky x={lerp(1600, 1150, clamp(t / 30))} y={980} s={0.5} kind="mom" face="angry" t={t} pose={{ armR: 90 }} /></g>);
def('B9', ({ t }) => <g><WBurst t={t} c1="#5A1A24" c2="#7A2A30" /><Dog x={201} y={1950} s={2.3} t={t} mouth={clamp(t / 16)} face="hungry" /></g>);
def('B10', ({ t }) => <g><WBurst t={t} c1="#E2262E" c2="#FF4A4A" /><Dog x={642} y={1390} s={1.6} t={t} mouth={0} face="happy" belly={1} /><Word t={t} text="GULP!" x={960} y={260} size={200} c="#FFFFFF" rot={-4} /></g>);
def('B11', ({ t }) => <g><Living t={t} /><Dog x={760} y={960} s={0.9} t={t} face="happy" belly={1} /><Vacuum x={1500} y={-400} s={0.1} /><Tag t={t - 6} text="MOM: GONE" x={1450} y={300} c="#E2262E" /></g>);
def('B12', ({ t }) => <g><Living t={t} /><Blocky x={960} y={1450} s={1.15} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} /><SpeedLines t={t} o={0.2} /></g>);
def('B13', ({ t }) => <g><Living t={t} /><Dog x={700} y={960} s={0.9} t={t} face="happy" belly={1} mouth={t < 8 ? 0.4 : 0} /><Slipper x={lerp(1000, 1500, clamp(t / 14))} y={lerp(560, 300, clamp(t / 14))} s={1.2} r={t * 20} /><Word t={t - 2} text="BURP" x={1300} y={300} size={110} c="#4ADE6A" /></g>);
def('B14', ({ t }) => <g><WBurst t={t} c1="#C8802A" c2="#E8A03A" /><Dog x={327} y={1790} s={2.1} t={t} belly={1} /><Blocky x={1500} y={1500} s={0.75} kind="kid" face="worried" t={t} pose={{ armL: 120 }} /><g transform="translate(980 420)"><path d="M -220 -80 Q -240 -150 -100 -150 L 120 -150 Q 240 -150 220 -60 Q 200 20 60 20 L -20 70 L 0 20 Q -230 20 -220 -80 Z" fill="#FFFFFF" stroke={OL} strokeWidth={8} /><text x={0} y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={40} fill="#E2262E">LET ME OUT!</text></g></g>);
def('B15', ({ t }) => <g><Living t={t} /><Blocky x={760} y={1400} s={1.1} kind="kid" face="determined" t={t} /><g transform={`translate(1400 330) scale(${popIn(t - 4)})`}><circle r={70} fill="#FFD23F" stroke={OL} strokeWidth={10} /><rect x={-30} y={60} width={60} height={50} rx={10} fill="#8A8AA8" stroke={OL} strokeWidth={8} /></g></g>);
def('B16', ({ t }) => <g><Fill c="#2A2458" /><Tablet x={960} y={540} s={1.4}><text y={-120} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={80} fill="#FFD23F">BLOCK QUEST</text><text y={40} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#FFFFFF">▶ SHOP</text></Tablet></g>);
def('B17', ({ t }) => <g><WBurst t={t} c1="#1E7A34" c2="#2EA84A" /><Tablet x={960} y={560} s={1.4}><g transform="translate(-200 0)"><Potion x={0} y={20} s={0.9} t={t} /></g><text x={170} y={-100} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={56} fill="#FFFFFF">SHRINK POTION</text><Gem x={90} y={-10} s={0.8} /><text x={220} y={10} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#5AE8F8">99</text><text x={170} y={120} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={30} fill="#FF4A4A">⚠ DO NOT DRINK NEAR PETS</text></Tablet></g>);
def('B18', ({ t }) => <g><WBurst t={t} c1="#1E7A34" c2="#2EA84A" /><Blocky x={960} y={1450} s={1.15} kind="kid" face="smirk" t={t} pose={{ armR: 150 }} /><Potion x={1250} y={lerp(700, 300, clamp(t / 12))} s={1.1} t={t} /><Dog x={1700} y={1100} s={0.6} t={t} face="sneaky" /></g>);
def('B19', ({ t }) => <g><Fill c="#F2D8B4" /><rect x={-600} y={620} width={LW + 1200} height={900} fill="#B87A4A" />{/* the couch, now a mountain */}<rect x={-200} y={-200} width={2400} height={900} rx={200} fill="#7A4A8A" stroke={OL} strokeWidth={14} />{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M ${i * 70} 1080 q ${10 + (i % 3) * 10} -150 ${30 + (i % 2) * 20} -260`} stroke="#9A6A3A" strokeWidth={22} fill="none" strokeLinecap="round" />)}<Blocky x={960} y={1000} s={0.12} kind="kid" face="shock" t={t} /><Word t={t - 4} text="TINY!" y={260} c="#4ADE6A" /></g>);
def('B20', ({ t }) => <g><Fill c="#F2D8B4" /><rect x={-600} y={760} width={LW + 1200} height={900} fill="#B87A4A" /><Dog x={-492} y={2830} s={3.4} t={t} mouth={0.2 + Math.abs(Math.sin(t * 0.08)) * 0.7} /><Blocky x={lerp(1800, 1300, clamp(t / 30))} y={1000} s={0.13} kind="kid" face="determined" t={t} /></g>);
// chapter 2: the mouth
def('D1', ({ t }) => <g><Mouth t={t} /><Blocky x={960} y={1000} s={0.3} kind="kid" face="worried" t={t} />{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${300 + i * 260} ${600 + Math.sin(i) * 60} q 20 -40 40 0 q 20 40 40 0`} stroke="#9AE85A" strokeWidth={6} fill="none" opacity={0.6} />)}</g>);
def('D2', ({ t }) => <g><Mouth t={t} chomp /><Blocky x={lerp(200, 1700, (t % 60) / 60)} y={860 - Math.abs(Math.sin(t * 0.15)) * 200} s={0.25} kind="kid" face="determined" t={t} pose={{ armL: 150, armR: 150 }} /><Word t={t - 4} text="CHOMP!" x={1500} y={480} size={110} /></g>);
def('D3', ({ t }) => <g><Fill c="#6A1A28" /><path d={`M -200 200 L 2200 1100 L 2200 1400 L -200 1400 Z`} fill="#F07A9A" stroke={OL} strokeWidth={12} /><SpeedLines t={t * 2} o={0.35} /><Blocky x={lerp(200, 1500, (t % 50) / 50)} y={lerp(560, 960, (t % 50) / 50)} s={0.25} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160, lean: 20 }} /></g>);
def('D4', ({ t }) => <g><Fill c="#6A1A28" /><path d={`M -200 200 L 2200 1100 L 2200 1400 L -200 1400 Z`} fill="#F07A9A" stroke={OL} strokeWidth={12} /><SpeedLines t={t * 2} o={0.35} />{[[0, 'treat'], [1, 'sock'], [2, 'crayon']].map(([i, k]) => { const x = 1900 - ((t * 30 + (i as number) * 600) % 2400); const y = 200 + (x / 2400) * 900; return k === 'treat' ? <g key={i as number} transform={`translate(${x} ${y - 60})`}><rect x={-70} y={-24} width={140} height={48} rx={24} fill="#C8802A" stroke={OL} strokeWidth={8} /><circle cx={-70} cy={-20} r={24} fill="#C8802A" stroke={OL} strokeWidth={8} /><circle cx={70} cy={20} r={24} fill="#C8802A" stroke={OL} strokeWidth={8} /></g> : k === 'sock' ? <g key={i as number} transform={`translate(${x} ${y - 70}) rotate(20)`}><path d="M -30 -90 L 30 -90 L 30 20 L 90 30 L 90 70 L -30 70 Z" fill="#FFFFFF" stroke={OL} strokeWidth={8} /><rect x={-30} y={-90} width={60} height={30} fill="#E2262E" /></g> : <g key={i as number} transform={`translate(${x} ${y - 40}) rotate(-25)`}><rect x={-150} y={-24} width={300} height={48} fill="#2E6AE8" stroke={OL} strokeWidth={8} /><path d="M 150 -24 L 210 0 L 150 24 Z" fill="#F2E4C4" stroke={OL} strokeWidth={8} /></g>; })}</g>);
def('D5', ({ t }) => <g><Fill c="#6A1A28" /><path d={`M -200 900 Q 400 ${600 - t * 4} 960 ${700 - t * 2} Q 1500 ${300 - t * 4} 2200 700 L 2200 1400 L -200 1400 Z`} fill="#AFE0FF" stroke="#FFFFFF" strokeWidth={10} />{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={(i * 170 + t * 6) % 2000} cy={700 + Math.sin(i + t * 0.2) * 80} r={20} fill="#FFFFFF" opacity={0.7} />)}<Blocky x={500} y={760} s={0.3} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} /><Word t={t - 4} text="SLOBBER WAVE!" x={1300} y={260} size={100} c="#AFE0FF" /></g>);
def('D6', ({ t }) => <g><Fill c="#6A1A28" /><path d={`M -200 800 Q 960 ${560 + Math.sin(t * 0.2) * 60} 2200 800 L 2200 1400 L -200 1400 Z`} fill="#AFE0FF" stroke="#FFFFFF" strokeWidth={10} /><g transform={`translate(960 ${700 + Math.sin(t * 0.2) * 40}) rotate(${Math.sin(t * 0.15) * 8})`}><rect x={-260} y={-30} width={520} height={60} fill="#2E6AE8" stroke={OL} strokeWidth={10} /><path d="M 260 -30 L 340 0 L 260 30 Z" fill="#F2E4C4" stroke={OL} strokeWidth={8} /><Blocky x={0} y={-30} s={0.35} kind="kid" face="grin" t={t} pose={{ armL: 120, armR: 120 }} /></g><SpeedLines t={t} o={0.2} /></g>);
def('D7', ({ t }) => <g><Throat t={t} /><g transform={`translate(960 ${540 + Math.sin(t * 0.3) * 30}) scale(${1 + Math.sin(t * 0.1) * 0.1})`}><rect x={-160} y={-20} width={320} height={40} fill="#2E6AE8" stroke={OL} strokeWidth={8} /><Blocky x={0} y={-20} s={0.25} kind="kid" face="tongue" t={t} pose={{ armL: 140, armR: 140 }} /></g></g>);
def('D8', ({ t }) => <g><WBurst t={t} c1="#1A6A8A" c2="#2A8AAA" /><Blocky x={960} y={1450} s={1.15} kind="kid" face="tongue" t={t} /><Word t={t - 4} text="SLOBBER RUNNER" y={300} size={100} c="#AFE0FF" /></g>);
// chapter 3: the stomach
def('E1', ({ t }) => <g><Stomach t={t} /><Blocky x={300} y={760} s={0.25} kind="kid" face="shock" t={t} /><Floaters t={t} /></g>);
def('E2', ({ t }) => <g><Stomach t={t} /><Word t={t - 4} text="DON'T TOUCH!" y={300} size={120} c="#FF4A4A" />{Array.from({ length: 4 }, (_, i) => { const k = ((t * 0.05 + i / 4) % 1); return <circle key={i} cx={500 + i * 300} cy={900 - k * 200} r={40 * (1 - k) + 10} fill="#CCFF8A" stroke="#6AB83A" strokeWidth={6} opacity={1 - k} />; })}</g>);
def('E3', ({ t }) => <g><Stomach t={t} /><Floaters t={t} /></g>);
def('E4', ({ t }) => <g><Stomach t={t} /><Vacuum x={960} y={780 + Math.sin(t * 0.2) * 10} s={1.3} /><Blocky x={900} y={640 + Math.sin(t * 0.2) * 10} s={0.42} kind="mom" face="angry" t={t} pose={{ armL: 40, armR: 40 }} /></g>);
def('E5', ({ t }) => <g><Stomach t={t} /><Vacuum x={760} y={800} s={1.0} /><Blocky x={720} y={690} s={0.42} kind="mom" face="angry" t={t} pose={{ armR: 110 }} /><Blocky x={1300} y={800} s={0.42} kind="kid" face="worried" t={t} /></g>);
def('E6', ({ t }) => { const k = (t % 60) / 60; const pts = [[200, 790], [700, 770], [1150, 800], [1600, 780]]; const i = Math.min(2, Math.floor(k * 3)), u = k * 3 - i; const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; return <g><Stomach t={t} /><Floaters t={t} /><Vacuum x={1700} y={800} s={0.6} /><Blocky x={lerp(x0, x1, u)} y={lerp(y0, y1, u) - 40 - Math.sin(u * Math.PI) * 220} s={0.25} kind="kid" face="determined" t={t} pose={{ armL: 150, armR: 150 }} /></g>; });
def('E7', ({ t }) => <g><Stomach t={t} shake={0.4} />{Array.from({ length: 10 }, (_, i) => { const k = ((t * 0.08 + i / 10) % 1); return <circle key={i} cx={760 + i * 40} cy={900 - k * 300} r={30 + i * 3} fill="#CCFF8A" stroke="#6AB83A" strokeWidth={6} opacity={1 - k} />; })}<Vacuum x={300} y={800} s={0.7} /><Blocky x={280} y={720} s={0.3} kind="mom" face="shock" t={t} /></g>);
def('E8', ({ t }) => <g><Stomach t={t} shake={0.3} /><Hairball x={960} y={lerp(1300, 520, easeOut(clamp(t / 30)))} s={0.9} t={t} /></g>);
def('E9', ({ t }) => <g><WBurst t={t} c1="#5A3A1A" c2="#7A5A2A" /><Hairball x={960} y={600} s={1.25} t={t} /><Word t={t - 6} text="THE HAIRBALL KING" y={180} size={90} /></g>);
def('E10', ({ t }) => <g><Stomach t={t} /><Hairball x={1350} y={430} s={0.75} t={t} /><BossBar hp={1} /><Blocky x={500} y={790} s={0.33} kind="kid" face="determined" t={t} pose={{ armR: 120 }} extra={<g transform="translate(250 -840)"><Slipper x={0} y={0} s={1.4} r={-30} /></g>} /><Word t={t - 2} text="BOSS FIGHT" x={700} y={360} size={100} c="#FF4A4A" /></g>);
def('E11', ({ t }) => <g><Stomach t={t} /><Hairball x={1450} y={430} s={0.7} t={t} /><BossBar hp={1} />{[0, 10, 20].map((d, i) => { const k = clamp((t - d) / 14); return k > 0 && k < 1 ? <circle key={i} cx={lerp(1300, 500, k)} cy={lerp(450, 700, k) - Math.sin(k * Math.PI) * 120} r={50} fill="#A8865A" stroke={OL} strokeWidth={8} /> : null; })}<Vacuum x={500} y={800} s={0.8} /><Blocky x={480} y={700} s={0.36} kind="mom" face={t > 30 ? 'angry' : 'worried'} t={t} /></g>);
def('E12', ({ t }) => <g><WBurst t={t} c1="#C83A5A" c2="#E85A7A" /><Blocky x={960} y={1450} s={1.15} kind="mom" face="angry" t={t} pose={{ armR: 120 }} /><Vacuum x={1350} y={760} s={1.1} r={-20} /></g>);
def('E13', ({ t, len }) => <g><Stomach t={t} /><Hairball x={lerp(1300, 760, clamp(t / Math.max(1, len)))} y={lerp(420, 700, clamp(t / Math.max(1, len)))} s={0.7} t={t} hurt={clamp(t / Math.max(1, len))} /><BossBar hp={Math.max(0, 1 - t / Math.max(1, len))} /><Vacuum x={500} y={780} s={1.1} r={-10} on t={t} /><Blocky x={380} y={680} s={0.4} kind="mom" face="angry" t={t} pose={{ armR: 70 }} /></g>);
def('E14', ({ t }) => <g><Stomach t={t} /><g transform={`translate(960 ${700 + Math.sin(t * 0.2) * 10})`}><path d="M -170 -60 L -190 -200 L -90 -130 L 0 -230 L 90 -130 L 190 -200 L 170 -60 Z" fill="#FFD23F" stroke={OL} strokeWidth={12} strokeLinejoin="round" /></g><Sparkles t={t} seed="cr" /><Blocky x={420} y={800} s={0.4} kind="mom" face="smirk" t={t} pose={{ armL: 150, armR: 150 }} /><Word t={t - 6} text="K.O." x={1400} y={320} size={160} c="#FF4A4A" /></g>);
def('E15', ({ t }) => <g><WBurst t={t} c1="#C83A5A" c2="#E85A7A" /><Blocky x={760} y={1400} s={1.1} kind="mom" face="smirk" t={t} /><Vacuum x={1350} y={820} s={1.1} r={-10} /><Word t={t - 4} text="NEVER MESS WITH MOM" y={260} size={86} /></g>);
// chapter 4: the escape
def('F1', ({ t }) => <g><Stomach t={t} /><Blocky x={760} y={800} s={0.4} kind="kid" face="smirk" t={t} /><Blocky x={1150} y={800} s={0.4} kind="mom" face="happy" t={t} /><Word t={t - 4} text="EXIT →" x={1500} y={340} size={90} c="#4ADE6A" /></g>);
def('F2', ({ t }) => <g><WBurst t={t} c1="#1E7A34" c2="#2EA84A" /><g transform={`translate(960 980) scale(${1 + Math.sin(t * 0.5) * 0.04 + t * 0.004})`}><Blocky x={0} y={0} s={0.85} kind="kid" face="shock" t={t} pose={{ armL: 120, armR: 120 }} /></g><Word t={t - 4} text="GROWING!" y={200} size={120} c="#4ADE6A" /></g>);
def('F3', ({ t }) => <g><Stomach t={t} shake={1} />{Array.from({ length: 6 }, (_, i) => <Slipper key={i} x={300 + i * 260} y={760 + Math.sin(t * 0.6 + i) * 40} r={Math.sin(t * 0.5 + i) * 40} />)}<Blocky x={760} y={800} s={0.36} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} /><Blocky x={1150} y={800} s={0.36} kind="mom" face="shock" t={t} pose={{ armL: 160, armR: 160 }} /></g>);
def('F4', ({ t }) => <g><WBurst t={t} c1="#C83A5A" c2="#E85A7A" /><Blocky x={960} y={1450} s={1.15} kind="mom" face="smirk" t={t} pose={{ armR: 160 }} /><g transform={`translate(1400 300) scale(${popIn(t - 4)})`}><circle r={70} fill="#FFD23F" stroke={OL} strokeWidth={10} /><rect x={-30} y={60} width={60} height={50} rx={10} fill="#8A8AA8" stroke={OL} strokeWidth={8} /></g></g>);
def('F5', ({ t }) => <g><Stomach t={t} shake={Math.min(1, t / 20)} /><path d={`M 1700 -100 Q ${1650 + Math.sin(t) * 40} 400 1700 900`} stroke="#4A8A3A" strokeWidth={120} fill="none" /><g transform={`translate(1450 500) rotate(${Math.sin(t * 1.2) * 30})`}><path d="M -110 0 L -130 -100 L -60 -60 L 0 -130 L 60 -60 L 130 -100 L 110 0 Z" fill="#FFD23F" stroke={OL} strokeWidth={10} strokeLinejoin="round" /></g><Blocky x={1200} y={800} s={0.42} kind="kid" face="grin" t={t} pose={{ armR: 100 }} /></g>);
def('F6', ({ t }) => <g><Throat t={t * 2} /><g transform={`translate(${lerp(960, 960, 0)} ${lerp(1000, 300, easeOut(clamp(t / 14)))})`}><Blocky x={-100} y={0} s={0.28} kind="kid" face="shock" t={t} pose={{ armL: 170, armR: 170 }} /><Blocky x={100} y={0} s={0.28} kind="mom" face="shock" t={t} pose={{ armL: 170, armR: 170 }} /></g><Word t={t - 2} text="HIC!" x={1500} y={300} size={160} c="#FF7AE0" /><SpeedLines t={t} o={0.35} /></g>);
def('F7', ({ t }) => <g><Mouth t={t} teethScale={0.75} /><Blocky x={800} y={980} s={0.4} kind="kid" face="worried" t={t} /><Blocky x={1120} y={980} s={0.4} kind="mom" face="worried" t={t} /></g>);
def('F8', ({ t }) => <g><Living t={t} /><Dog x={820} y={1110} s={1.25} t={t} face="sneeze" mouth={0.15} /><Word t={t - 6} text="AH..." x={1500} y={300} size={130} c="#FFFFFF" /></g>);
def('F9', ({ t }) => <g><WBurst t={t} c1="#1E7A34" c2="#2EA84A" /><Dog x={516} y={1550} s={1.8} t={t} face="sneeze" mouth={0.8} />{[0, 1].map((i) => <g key={i} transform={`translate(${lerp(1200, 1800, easeOut(clamp(t / 12))) - i * 160} ${lerp(500, 200, easeOut(clamp(t / 12))) + i * 80}) rotate(${t * 20})`}><Blocky x={0} y={0} s={0.2} kind={i ? 'mom' : 'kid'} face="shock" t={t} pose={{ armL: 160, armR: 160 }} /></g>)}<Word t={t} text="ACHOO!" x={1250} y={280} size={180} c="#FFD23F" /></g>);
// chapter 5: home
def('G1', ({ t }) => <g><Living t={t} /><Blocky x={760} y={lerp(300, 820, easeOut(clamp(t / 10)))} s={0.36} kind="kid" face="shock" t={t} /><Blocky x={1150} y={lerp(200, 820, easeOut(clamp((t - 4) / 10)))} s={0.36} kind="mom" face="shock" t={t} /></g>);
def('G2', ({ t }) => <g><Living t={t} /><g transform={`translate(760 820) scale(${lerp(0.36, 0.55, clamp(t / 20)) / 0.36})`}><Blocky x={0} y={0} s={0.36} kind="kid" face="grin" t={t} /></g><g transform={`translate(1150 820) scale(${lerp(0.36, 0.55, clamp(t / 20)) / 0.36})`}><Blocky x={0} y={0} s={0.36} kind="mom" face="happy" t={t} /></g><Sparkles t={t} seed="grow" /></g>);
def('G3', ({ t }) => <g><Living t={t} mess /><Dog x={760} y={910} s={1.0} t={t} face="happy" /></g>);
def('G4', ({ t }) => <g><WBurst t={t} c1="#C8802A" c2="#E8A03A" /><Dog x={453} y={1630} s={1.9} t={t} face="happy" /><Word t={t - 4} text="GOOD BOY?" x={1450} y={300} size={110} /></g>);
def('G5', ({ t }) => <g><Living t={t} mess /><Blocky x={1150} y={1400} s={1.0} kind="mom" face="angry" t={t} pose={{ armR: 110 }} /><Blocky x={560} y={1500} s={0.65} kind="kid" face="worried" t={t} /></g>);
def('G6', ({ t }) => <g><WBurst t={t} c1="#1A4A8A" c2="#2A6AAA" /><g transform={`translate(960 560) rotate(-6) scale(${popIn(t) * 1.3})`}><rect x={-340} y={-200} width={680} height={400} rx={40} fill="#E8A81A" stroke={OL} strokeWidth={14} /><rect x={-340} y={-120} width={680} height={70} fill="#2A2234" /><rect x={-280} y={20} width={110} height={80} rx={10} fill="#F2E4C4" stroke={OL} strokeWidth={6} /><text x={-120} y={150} fontFamily={FONT.game} fontWeight={900} fontSize={54} fill={OL}>MOM'S CARD</text></g><Word t={t - 8} text="-99 GEMS" x={1500} y={260} size={90} c="#FF4A4A" /></g>);
def('G7', ({ t }) => <g><Living t={t} night /><Blocky x={lerp(1900, 1350, clamp(t / 20))} y={980} s={0.52} kind="dad" face="happy" t={t} pose={{ armR: 70 }} extra={<g transform="translate(330 -700)"><rect x={-100} y={-40} width={200} height={80} rx={30} fill="#E8B86A" stroke={OL} strokeWidth={8} /><rect x={-104} y={-6} width={208} height={14} fill="#4ADE6A" /></g>} /><Dog x={560} y={980} s={0.8} t={t} face="sneaky" /></g>);
def('G8', ({ t }) => <g><WBurst t={t} c1="#3A2468" c2="#5A3A98" /><Dog x={453} y={1630} s={1.9} t={t} face={t < 20 ? 'sneaky' : 'hungry'} mouth={t > 30 ? 0.2 : 0} /><g transform="translate(1450 600)"><rect x={-110} y={-40} width={220} height={80} rx={30} fill="#E8B86A" stroke={OL} strokeWidth={8} /><rect x={-114} y={-6} width={228} height={14} fill="#4ADE6A" /></g></g>);
def('G9', ({ t }) => <g><WBurst t={t} c1="#E2262E" c2="#FF4A4A" /><Blocky x={960} y={1450} s={1.15} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160 }} /><Word t={t - 4} text="DAD. RUN." y={260} size={130} c="#FFFFFF" /></g>);
def('G10', ({ t }) => <g><Living t={t} night /><Dog x={640} y={980} s={0.9} t={t} face="happy" /><Blocky x={1200} y={980} s={0.5} kind="kid" face="grin" t={t} /><Blocky x={1500} y={980} s={0.5} kind="mom" face="happy" t={t} /><Tag t={t - 4} text="COMMENT: BISCUIT" y={260} c="#E8A03A" /></g>);
def('G11', ({ t }) => <g><WBurst t={t} c1="#C8802A" c2="#E8A03A" /><Dog x={620} y={1390} s={1.6} t={t} face="hungry" mouth={0.3} /><g transform={`translate(1350 520) scale(${popIn(t - 2) * (1 + Math.sin(t * 0.3) * 0.04)})`}><rect x={-260} y={-80} width={520} height={160} rx={40} fill="#E2262E" stroke={OL} strokeWidth={10} /><text y={26} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={76} fill="#FFFFFF">SUBSCRIBE</text></g></g>);

// close variants: the same picture pushed in on (cx, cy), its clock carried on
const close = (base: string, cx: number, cy: number, z: number, from = 20): Shot => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(960 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}>{sh[base]({ ...p, t: p.t + from })}</g></CloseCtx.Provider>
);
const closes: Record<string, [string, number, number, number]> = {
  K1: ['A1', 1100, 600, 1.6], K2: ['A5', 1000, 500, 1.6], K3: ['B1', 1250, 600, 1.7], K4: ['B3', 1100, 500, 1.6], K5: ['B8', 760, 600, 1.6], K6: ['B11', 900, 600, 1.6], K7: ['B13', 1100, 500, 1.5],
  K8: ['B19', 960, 950, 2.4], K9: ['B20', 1000, 700, 1.6], K10: ['D1', 960, 800, 1.8], K11: ['D2', 960, 600, 1.4], K12: ['D4', 960, 600, 1.5], K13: ['D6', 960, 600, 1.6], K14: ['E1', 700, 700, 1.6],
  K15: ['E3', 960, 760, 1.7], K16: ['E4', 920, 600, 1.8], K17: ['E5', 1000, 600, 1.6], K18: ['E8', 960, 520, 1.5], K19: ['E11', 600, 600, 1.6], K20: ['E13', 700, 600, 1.5], K21: ['E14', 960, 650, 1.6],
  K22: ['F1', 960, 600, 1.6], K23: ['F3', 960, 640, 1.6], K24: ['F5', 1350, 560, 1.6], K25: ['F7', 960, 700, 1.6], K26: ['G1', 960, 600, 1.6], K27: ['G3', 900, 600, 1.6], K28: ['G5', 860, 600, 1.4],
  K29: ['G7', 1350, 500, 1.6], K30: ['G10', 960, 600, 1.4],
};
for (const [k, [b, x, y, z]] of Object.entries(closes)) sh[k] = close(b, x, y, z);

// every base shot also gets an automatic pushed-in variant, `<id>z`, for splitting long beats wide/close
for (const k of Object.keys(sh)) if (!k.startsWith('K') && !k.startsWith('C')) sh[`${k}z`] = close(k, 960, 560, 1.45, 15);

// the engine looks shots up by id: export them all
export const SHOTS = sh;
