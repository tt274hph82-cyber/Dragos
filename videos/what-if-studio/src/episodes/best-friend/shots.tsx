import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, Glow, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Bedroom, Burst, Sparkles, Sky, Block, Confetti, SpeedLines, Storm } from '../ten-seconds/shots';
import words from './words.json';

// "What if your best friend quit the game?" The blocky-game What If style, emotional variation: the friend leaves,
// three "DAY N" beats drained of colour, then he's back (he was only grounded). Original characters and game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const T = { gone: at('Gone'), back: at('back') };

/** Friends HUD at the top: Max's name with a green (online) or grey (offline) dot. */
export const FriendPill: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30, on = sec < T.gone || sec >= T.back;
  const pop = Math.abs(sec - T.gone) < 0.2 || Math.abs(sec - T.back) < 0.2 ? 1.15 : 1;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-215} y={-44} width={430} height={88} rx={44} fill="#1A1424" />
      <circle cx={-170} cy={0} r={16} fill={on ? '#4ADE6A' : '#8A8A9A'} />
      <text x={20} y={18} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={46} fill={on ? '#FFFFFF' : '#D0D0DC'}>{on ? 'MAX · ONLINE' : 'MAX · OFFLINE'}</text>
    </g>
  );
};
const hud = (f: number) => <FriendPill f={f} />;
/** The sad days: colour drained and a cold blue cast. */
const Gloom: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#808080" opacity={0.85 * k} style={{ mixBlendMode: 'saturation' }} />
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#2A3A6A" opacity={0.25 * k} />
  </g>
);
export const Ground: React.FC<{ c?: string }> = ({ c = '#5AC86A' }) => <rect x={-300} y={1300} width={W + 600} height={900} fill={c} />;
const DayBadge: React.FC<{ t: number; n: number; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#1E3A6A" c2="#2A4A88" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-240} y={-160} width={480} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-216} y={-136} width={432} height={272} rx={44} fill="none" stroke="#5A8AE8" strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={70} fill={OL}>DAY</text>
      <text y={110} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={170} fill="#5A8AE8" stroke={OL} strokeWidth={12} paintOrder="stroke">{n}</text>
    </g>
    {/* rain on the sad days */}
    {Array.from({ length: 40 }, (_, i) => { const x = random(`dr${i}`) * W, y = ((t * 40 + random(`dy${i}`) * 2000) % 2000) - 100; return <path key={i} d={`M ${x} ${y} l -8 44`} stroke="#AFC8FF" strokeWidth={4} opacity={0.5} />; })}
  </g>
);
const badge = (n: number): S => ({ t, len }) => <g><DayBadge t={t} n={n} len={len} /></g>;
/** Chat toast: "[name] left/joined the game", or a message. */
export const Toast: React.FC<{ t: number; text: string; c?: string; y?: number }> = ({ t, text, c = '#FFD23F', y = 520 }) => React.useContext(CloseCtx) ? null : (
  <g transform={`translate(540 ${y}) scale(${popIn(t, 6)})`}>
    <rect x={-420} y={-60} width={840} height={120} rx={30} fill="#1A1424" stroke={c} strokeWidth={8} />
    <circle cx={-350} cy={0} r={30} fill={c} />
    <text x={30} y={16} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF">{text}</text>
  </g>
);
/** Max's base: a block house with a hand-made sign. */
const Base: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-380} width={520} height={380} fill="#C88A52" stroke={OL} strokeWidth={10} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-260 + (i % 4) * 130} y={-380 + Math.floor(i / 4) * 127} width={130} height={127} fill="none" stroke="#9A6A3A" strokeWidth={5} />)}
    <path d="M -300 -380 L 0 -560 L 300 -380 Z" fill="#D8323A" stroke={OL} strokeWidth={10} strokeLinejoin="round" />
    <rect x={-60} y={-200} width={120} height={200} fill="#5A3A22" stroke={OL} strokeWidth={8} />
    <g transform="translate(170 -470) rotate(8)"><rect x={-110} y={-36} width={220} height={72} rx={8} fill="#F2E4C4" stroke={OL} strokeWidth={6} /><text y={16} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={38} fill={OL}>MAX'S BASE</text></g>
  </g>
);
/** The pet dragon: a little blocky green dragon with big eyes, sitting and waiting. */
export const Dragon: React.FC<{ x: number; y: number; s: number; t: number; sad?: boolean; happy?: boolean; pink?: boolean }> = ({ x, y, s, t, sad, happy, pink }) => {
  const bob = happy ? Math.abs(Math.sin(t * 0.5)) * 30 : Math.sin(t * 0.15) * 4;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s})`}>
      <path d="M -120 -60 Q -230 -40 -250 -140 Q -200 -90 -130 -110 Z" fill={pink ? '#E85AB8' : '#3AB86A'} stroke={OL} strokeWidth={8} />
      <rect x={-150} y={-260} width={300} height={260} rx={60} fill={pink ? '#FF7AD0' : '#4AD87A'} stroke={OL} strokeWidth={9} />
      <rect x={-90} y={-160} width={180} height={150} rx={40} fill={pink ? '#FFD0EE' : '#BDF2C8'} />
      <path d={`M -150 -220 Q ${-260} ${-330 + Math.sin(t * 0.3) * 20} -170 -300 Z M 150 -220 Q 260 ${-330 + Math.sin(t * 0.3 + 1) * 20} 170 -300 Z`} fill={pink ? '#E85AB8' : '#3AB86A'} stroke={OL} strokeWidth={8} />
      <g transform="translate(0 -360)">
        <rect x={-130} y={-120} width={260} height={220} rx={60} fill={pink ? '#FF7AD0' : '#4AD87A'} stroke={OL} strokeWidth={9} />
        <path d="M -90 -120 L -70 -180 L -40 -120 M 40 -120 L 70 -180 L 90 -120" fill="#FFD23F" stroke={OL} strokeWidth={7} strokeLinejoin="round" />
        {[-55, 55].map((ex) => <g key={ex}><ellipse cx={ex} cy={-20} rx={34} ry={40} fill="#FFFFFF" stroke={OL} strokeWidth={6} /><circle cx={ex + 4} cy={-12} r={22} fill={OL} /><circle cx={ex + 12} cy={-22} r={8} fill="#FFFFFF" /></g>)}
        {sad ? <g><path d="M -95 -75 L -20 -60 M 95 -75 L 20 -60" stroke={OL} strokeWidth={8} strokeLinecap="round" /><path d="M -30 60 Q 0 40 30 60" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" /><path d={`M 60 ${20 + (t * 3) % 60} q 10 20 0 30 q -10 -10 0 -30 Z`} fill="#7FD0FF" stroke={OL} strokeWidth={3} /></g>
          : <path d="M -40 40 Q 0 80 40 40" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />}
      </g>
    </g>
  );
};
const Tumbleweed: React.FC<{ t: number; y: number }> = ({ t, y }) => {
  const x = ((t * 14) % 1500) - 200;
  return <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 0.4)) * 40}) rotate(${t * 9})`}>{Array.from({ length: 6 }, (_, i) => <circle key={i} r={50 - i * 6} fill="none" stroke="#B8945A" strokeWidth={6} transform={`rotate(${i * 30}) scale(1 ${0.6 + i * 0.07})`} />)}</g>;
};
export const Lobby: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground c="#7AC87A" />
    {[160, 400, 680, 920].map((x, i) => <g key={i}><rect x={x - 50} y={1060} width={100} height={240} fill="#C8C0D8" stroke={OL} strokeWidth={8} /><rect x={x - 80} y={1020} width={160} height={50} fill="#D8D0E8" stroke={OL} strokeWidth={8} /></g>)}
    <g transform="translate(540 620)"><rect x={-300} y={-70} width={600} height={140} rx={20} fill="#2E6AE8" stroke={OL} strokeWidth={10} /><text y={26} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={72} fill="#FFFFFF">LOBBY</text></g>
  </g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t, f }) => (
  <g>
    <Sky /><Ground />{[200, 540, 880].map((x, i) => <Block key={i} x={x} y={1300} w={200} c={['#FFC21A', '#E2262E', '#2E6AE8'][i]} />)}
    <Blocky x={380} y={1300} s={0.5} kind="kid" face="grin" t={t} pose={{ armR: 120 }} />
    <Blocky x={700} y={1300} s={0.5} kind="friend" face="grin" t={t + 7} flip pose={{ armR: 120 }} />
    <Sparkles t={t} />
  </g>
);
export const S2: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#1E5AA8" c2="#2A6AC0" />
    <Blocky x={540} y={1750} s={1.3} kind="friend" face="happy" t={t} />
  </g>
);
export const S3: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#5A1A24" c2="#7A2A30" />
    <Blocky x={540} y={1800} s={1.4} kind="kid" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
    <SpeedLines t={t} o={0.3} />
  </g>
);
export const S4: S = ({ t, f }) => (
  <g>
    <Sky c="#8AB8E0" /><Ground />
    <Blocky x={540} y={1800} s={1.3} kind="friend" face="angry" t={t} pose={{ armR: 70 }} />
    <g transform={`translate(800 760) scale(${popIn(t - 3)})`}><rect x={-180} y={-60} width={360} height={120} rx={30} fill="#E2262E" stroke={OL} strokeWidth={10} /><text y={20} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#FFFFFF">LEAVE</text></g>
  </g>
);
export const S5: S = ({ t, f }) => (
  <g>
    <Sky c="#8AB8E0" /><Ground />
    <Blocky x={540} y={1750} s={1.2} kind="friend" face="sleepy" t={t} pose={{ armR: 160 + Math.sin(t * 0.8) * 20 }} />
  </g>
);
export const S6: S = ({ t, f }) => (
  <g>
    <Sky /><Ground />
    <Blocky x={360} y={1300} s={0.55} kind="kid" face="worried" t={t} />
    <g style={{ filter: 'grayscale(1)' }}><Blocky x={720} y={1300} s={0.55} kind="friend" face="sleepy" t={0} energy={0} flip /></g>
    <rect x={560} y={600} width={320} height={720} fill="#AFE0FF" opacity={0.3} stroke="#FFFFFF" strokeWidth={6} />
    <Toast t={t - 4} text="NOT RESPONDING…" c="#8A8A9A" />
  </g>
);
export const S7: S = ({ t, f }) => (
  <g>
    <Sky /><Ground />
    <Blocky x={360} y={1300} s={0.55} kind="kid" face="shock" t={t} />
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={720 + Math.cos(i) * (60 + t * 16)} cy={1050 + Math.sin(i) * (50 + t * 12)} r={Math.max(10, 110 - t * 5)} fill="#FFFFFF" stroke="#E0E0EC" strokeWidth={6} opacity={Math.max(0, 1 - t / 18)} />)}
  </g>
);
export const S8: S = ({ t, f }) => (
  <g>
    <Sky /><Ground />
    <Blocky x={360} y={1300} s={0.55} kind="kid" face="worried" t={t} energy={0.3} />
    <rect x={640} y={1280} width={160} height={30} rx={15} fill="#000" opacity={0.15} />
    <Toast t={t - 2} text="MaxBlocks left the game" c="#E2262E" />
  </g>
);
export const S9 = badge(1);
export const S10: S = ({ t, f }) => (
  <g>
    <Lobby t={t} />
    <Blocky x={540} y={1300} s={0.45} kind="kid" face="worried" t={t} energy={0.3} />
    <Gloom />
  </g>
);
export const S11: S = ({ t, f }) => (
  <g>
    <Lobby t={t} /><Tumbleweed t={t} y={1290} />
    <Blocky x={880} y={1300} s={0.25} kind="kid" face="worried" t={t} energy={0.2} />
    <Gloom />
  </g>
);
export const S12 = badge(2);
export const S13: S = ({ t, f }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    <Base x={540} y={1300} s={1.1} />
    <Blocky x={180} y={1320} s={0.4} kind="kid" face="worried" t={t} energy={0.3} />
    <Gloom />
  </g>
);
export const S14: S = ({ t, f }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    <Base x={540} y={1300} s={1.1} />
    <Dragon x={540} y={1330} s={0.75} t={t} sad />
    <Gloom k={0.8} />
  </g>
);
export const S15: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#1E3A6A" c2="#2A4A88" />
    <Dragon x={540} y={1650} s={1.6} t={t} sad />
    <Gloom k={0.5} />
  </g>
);
export const S16 = badge(3);
const BossBar: React.FC<{ hp: number }> = ({ hp }) => (
  <g transform="translate(540 470)"><text x={-300} y={-20} fontFamily={FONT.game} fontWeight={900} fontSize={44} fill="#FFFFFF">♛ BLOCK BOSS</text>
    <rect x={-300} y={0} width={600} height={40} rx={20} fill="#1A1424" stroke="#FFFFFF" strokeWidth={4} /><rect x={-296} y={4} width={592 * hp} height={32} rx={16} fill="#E2262E" /></g>
);
export const S17: S = ({ t, f }) => (
  <g>
    <Storm t={t} />
    <g transform={`translate(${lerp(640, 920, easeOut(clamp(t / 12)))} ${lerp(1300, 700, easeOut(clamp(t / 12)))}) rotate(${t * 6})`}><Blocky x={0} y={0} s={0.8} kind="boss" face="shock" t={t} /></g>
    <Blocky x={340} y={1300} s={0.5} kind="kid" face="angry" t={t} pose={{ armR: 95, lean: 8 }} />
    <SpeedLines t={t} c="#FFF6C0" o={0.4} />
    <BossBar hp={Math.max(0, 1 - t / 10)} />
  </g>
);
export const S18: S = ({ t, f }) => (
  <g>
    <Sky c="#E8A86A" /><Ground c="#6AA86A" />
    <Blocky x={420} y={1300} s={0.6} kind="kid" face="happy" t={t} pose={{ armR: 170 }} />
    <rect x={620} y={700} width={300} height={600} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeDasharray="20 16" opacity={0.6} />
    <Gloom k={clamp(t / 20)} />
  </g>
);
export const S19: S = ({ t, f }) => (
  <g>
    <Sky c="#E8A86A" />
    <Blocky x={540} y={1800} s={1.4} kind="kid" face="worried" t={t} energy={0.2} pose={{ armR: 170 }} />
    <Gloom />
  </g>
);
export const S20: S = ({ t, f }) => (
  <g>
    <Sky c="#E87A5A" />
    <circle cx={540} cy={1180} r={180} fill="#FFD27A" />
    <rect x={-300} y={1250} width={W + 600} height={900} fill="#3A6A4A" />
    <Block x={540} y={1250} w={360} c="#8A6A4A" />
    <Blocky x={540} y={1250} s={0.4} kind="kid" face="sleepy" t={t} energy={0.1} />
    <Gloom k={0.5} />
  </g>
);
export const S21: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Toast t={t - 1} text="MaxBlocks: bro…" c="#FFD23F" y={860} />
    <g transform={`translate(860 640) scale(${popIn(t - 4, 4)})`}><circle r={60} fill="#E2262E" stroke={OL} strokeWidth={8} /><text y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={64} fill="#FFFFFF">1</text></g>
    <Sparkles t={t} />
  </g>
);
export const S22: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1800} s={1.3} kind="friend" face="worried" t={t} pose={{ armR: 60 }} />
  </g>
);
export const S23: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={360} y={1500} s={0.75} kind="mom" face="angry" t={t} pose={{ armR: 120, armL: 120 }}
      extra={<g transform="translate(0 -1190)"><rect x={-150} y={-90} width={300} height={190} rx={14} fill="#2A2234" stroke={OL} strokeWidth={10} /><rect x={-130} y={-70} width={260} height={140} fill="#4AC86A" /></g>} />
    <Blocky x={820} y={1500} s={0.6} kind="friend" face="despair" t={t} flip />
  </g>
);
export const S24: S = ({ t, f }) => (
  <g>
    <Sky /><Ground />
    <Blocky x={360} y={1300} s={0.55} kind="kid" face="starry" t={t} pose={{ armL: 150, armR: 150 }} />
    <Blocky x={lerp(1300, 720, easeOut(clamp(t / 8)))} y={1300 - Math.sin(clamp(t / 8) * Math.PI) * 300} s={0.55} kind="friend" face="grin" t={t} flip pose={{ armL: 150, armR: 150 }} />
    <Toast t={t - 1} text="MaxBlocks joined the game" c="#4ADE6A" />
    <Confetti t={t} />
  </g>
);
export const S25: S = ({ t, f }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Blocky x={360} y={1700} s={0.9} kind="kid" face="grin" t={t} pose={{ armR: 150 }} />
    <Blocky x={720} y={1700} s={0.9} kind="friend" face="grin" t={t + 3} flip pose={{ armR: 150 }} />
    <g transform={`translate(540 560) scale(${popIn(t - 2, 4)})`}>{Array.from({ length: 10 }, (_, i) => <path key={i} d="M 0 0 L -26 -200 L 26 -200 Z" fill="#FFF6C0" transform={`rotate(${i * 36})`} />)}<circle r={70} fill="#FFFFFF" /></g>
    <Confetti t={t} seed="h" />
  </g>
);
export const S26: S = ({ t, f }) => (
  <g>
    <Bedroom t={t} />
    <Blocky x={540} y={1800} s={1.3} kind="friend" face="grin" t={t} />
    <g transform={`translate(540 760) rotate(-12) scale(${t < 5 ? lerp(2.6, 1, easeOut(t / 5)) : 1})`} opacity={clamp(t / 3)}>
      <rect x={-330} y={-80} width={660} height={160} rx={18} fill="none" stroke="#E2262E" strokeWidth={16} />
      <text y={40} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={120} fill="#E2262E">GROUNDED</text>
    </g>
  </g>
);
export const S27: S = ({ t, f }) => (
  <g>
    <Sky /><Ground />{[200, 540, 880].map((x, i) => <Block key={i} x={x} y={1300} w={200} c={['#FFC21A', '#E2262E', '#2E6AE8'][i]} />)}
    <Blocky x={380} y={1300} s={0.5} kind="kid" face="grin" t={t} pose={{ armR: 150 }} />
    <Blocky x={700} y={1300} s={0.5} kind="friend" face="grin" t={t + 7} flip pose={{ armR: 150 }} />
    <Dragon x={540} y={1330} s={0.3} t={t} happy />
    <Toast t={t - 3} text="TAG YOUR BEST FRIEND" c="#E2262E" />
    <Sparkles t={t} seed="e" />
  </g>
);

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S28 = close(S11, 880, 1150, 1.9, 30);   // "feels empty": him alone at the edge
export const S29 = close(S14, 540, 1000, 1.7, 40);   // "by the door": the dragon's face
export const S30 = close(S18, 470, 900, 1.7, 40);    // "high-five": the empty hand
export const S31 = close(S23, 360, 560, 1.6, 30);    // "computer": the laptop in mom's hands
export const S32 = close(S27, 540, 1100, 1.5, 30);   // "never quit": the two of them
