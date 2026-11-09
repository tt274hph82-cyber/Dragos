import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Bedroom, Burst, Sparkles, Sky, Lava, Block, Confetti, SpeedLines, Storm, Face, Pose } from '../ten-seconds/shots';
import { Toast, Ground } from '../best-friend/shots';
import words from './words.json';

// "What if your little sister got admin powers?" The blocky-game What If style, family twist: four commands,
// you buy the powers back with candy, then Mom (the owner) types /bedtime. Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });
const PINK = '#FF7AE0';
const CMDS: [number, string, string][] = [
  [0, 'ADMIN: SISTER', PINK], [at('Command', 1), '/pink world', PINK], [at('Command', 2), '/freeze brother', '#7ACCF2'],
  [at('Command', 3), '/tea boss', PINK], [at('Command', 4), '/ban brother', '#FF4A4A'], [at('Deal'), 'ADMIN: YOU', '#4ADE6A'], [at('Owner'), 'OWNER: MOM', '#FF4A4A'],
];

/** The admin console (fixed HUD): the last command typed, and who is admin. */
export const AdminBar: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  let k = 0; CMDS.forEach(([s], i) => { if (sec >= s) k = i; });
  const [s0, label, c] = CMDS[k];
  const shown = label.slice(0, Math.max(1, Math.floor((sec - s0) * 30 / 1.5)));
  const pop = k > 0 && sec < s0 + 0.25 ? 1.12 : 1;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-320} y={-46} width={640} height={92} rx={22} fill="#1A1424" stroke={c} strokeWidth={6} />
      <text x={-280} y={16} fontFamily={FONT.game} fontWeight={900} fontSize={44} fill={c}>{'> '}{shown}{Math.floor(f / 15) % 2 ? '_' : ''}</text>
    </g>
  );
};
const CmdBadge: React.FC<{ t: number; n: string; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#8A1A6A" c2="#B82A8A" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`cb${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-300} y={-160} width={600} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-276} y={-136} width={552} height={272} rx={44} fill="none" stroke={PINK} strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill={OL}>COMMAND</text>
      <text y={110} {...txt(170, PINK)}>{n}</text>
    </g>
  </g>
);
const badge = (n: string): S => ({ t, len }) => <CmdBadge t={t} n={n} len={len} />;
const Crown: React.FC<{ y?: number; s?: number; c?: string }> = ({ y = -1000, s = 1, c = '#FFD23F' }) => (
  <path transform={`translate(0 ${y}) scale(${s})`} d="M -110 60 L -80 -60 L -30 10 L 0 -90 L 30 10 L 80 -60 L 110 60 Z" fill={c} stroke={OL} strokeWidth={9} strokeLinejoin="round" />
);
/** Your little sister: Mom's purple outfit, smaller, with pigtails, pink bows and the admin crown. */
const Sis: React.FC<{ x: number; y: number; s: number; face: Face; t: number; pose?: Pose; crown?: boolean; flip?: boolean }> = ({ x, y, s, face, t, pose, crown = true, flip }) => (
  <Blocky x={x} y={y} s={s} kind="mom" face={face} t={t} pose={pose} flip={flip}
    extra={<g>
      {[-1, 1].map((d) => <g key={d}><circle cx={d * 210} cy={-880} r={62} fill="#8A4A2A" stroke={OL} strokeWidth={8} /><path d={`M ${d * 170} -940 l ${d * 40} -40 l 0 60 Z M ${d * 170} -940 l ${-d * 40} -40 l 0 60 Z`} fill={PINK} stroke={OL} strokeWidth={6} strokeLinejoin="round" /></g>)}
      {crown ? <Crown y={-1010} s={0.9} /> : null}
    </g>} />
);
const Candy: React.FC<{ x: number; y: number; s?: number; r?: number; c?: string }> = ({ x, y, s = 1, r = 0, c = '#FF4A4A' }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <path d="M -60 0 L -100 -34 L -100 34 Z M 60 0 L 100 -34 L 100 34 Z" fill={c} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <ellipse rx={64} ry={42} fill={c} stroke={OL} strokeWidth={7} />
    <path d="M -30 -36 Q 0 0 -30 36 M 10 -40 Q 40 0 10 40" stroke="#FFFFFF" strokeWidth={8} fill="none" opacity={0.8} />
  </g>
);
const Ice: React.FC<{ x: number; y: number; w: number; h: number; o?: number }> = ({ x, y, w, h, o = 1 }) => (
  <g opacity={o}>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={30} fill="#BDEBFF" opacity={0.55} stroke="#FFFFFF" strokeWidth={10} />
    <path d={`M ${x - w / 2 + 40} ${y - h + 50} L ${x - w / 2 + 120} ${y - h + 50} M ${x - w / 2 + 40} ${y - h + 90} L ${x - w / 2 + 80} ${y - h + 90}`} stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
  </g>
);
const Pink: React.FC<{ o: number }> = ({ o }) => <rect x={-300} y={-300} width={W + 600} height={2600} fill="#FF5AC8" opacity={o} style={{ mixBlendMode: 'multiply' } as any} />;

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <Sky /><Ground />
    <Block x={760} y={1300} w={300} c="#FFC21A" />
    <Sis x={540} y={1450} s={0.55} face="smirk" t={t} pose={{ armL: 160, armR: 160 }} />
    <Blocky x={860} y={1270} s={0.36} kind="kid" face="worried" t={t} />
    <Sparkles t={t} seed="ad" />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A1424" c2="#2A2234" />
    <g transform={`translate(540 860) scale(${popIn(t, 6) * 1.1})`}>
      <rect x={-320} y={-300} width={640} height={600} rx={40} fill="#1E1A2E" stroke="#4ADE6A" strokeWidth={12} />
      <text y={-200} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={54} fill="#B8B0D8">ADMIN PANEL</text>
      <circle cx={0} cy={-40} r={100} fill="#4ADE6A" stroke={OL} strokeWidth={10} /><path d="M -50 -40 L -12 0 L 56 -80" stroke="#FFFFFF" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text y={140} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={56} fill="#FFFFFF">ACCESS GRANTED</text>
      <text y={220} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={60} fill={PINK}>SISTER</text>
    </g>
  </g>
);
export const S3: S = ({ t }) => {
  const r = lerp(0, 1800, easeOut(clamp(t / 16)));
  return (
    <g>
      <Sky /><Ground />
      {[200, 880].map((x, i) => <g key={i}><rect x={x - 20} y={1100} width={40} height={200} fill="#8A5A3A" stroke={OL} strokeWidth={6} /><circle cx={x} cy={1060} r={90} fill="#3AB84A" stroke={OL} strokeWidth={8} /></g>)}
      <clipPath id="pk"><circle cx={540} cy={1200} r={r} /></clipPath>
      <g clipPath="url(#pk)">
        <rect x={-300} y={-300} width={W + 600} height={1600} fill="#FFB8E8" /><rect x={-300} y={1300} width={W + 600} height={900} fill="#FF7AD0" />
        {[200, 880].map((x, i) => <g key={i}><rect x={x - 20} y={1100} width={40} height={200} fill="#C85AA8" stroke={OL} strokeWidth={6} /><circle cx={x} cy={1060} r={90} fill="#FF5AC8" stroke={OL} strokeWidth={8} /></g>)}
      </g>
      <Sis x={540} y={1450} s={0.5} face="grin" t={t} pose={{ armL: 160, armR: 40 }} />
      <Sparkles t={t} seed="pw" />
    </g>
  );
};
export const S4: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill="#FFB8E8" />
    <rect x={-300} y={1300} width={W + 600} height={1000} fill="#FF8AD8" />
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={(i * 150 + t * 3) % 1400 - 150} cy={1380 + (i % 3) * 120} r={40} fill="#FFFFFF" opacity={0.5} />)}
    <Block x={540} y={1300} w={300} c="#FFC21A" />
    <Blocky x={540} y={1300} s={0.5} kind="kid" face="angry" t={t} pose={{ armL: 150, armR: 150 }} />
    <g transform={`translate(540 700) scale(${popIn(t - 3)}) rotate(-4)`}><text {...txt(64, PINK)}>BUBBLEGUM LAVA</text></g>
  </g>
);
export const S5: S = ({ t }) => (
  <g>
    <Sky c="#9ACDE8" /><Ground />
    <Blocky x={540} y={1040} s={0.48} kind="kid" face="shock" t={0} pose={{ armL: 150, armR: 150, legL: -20, legR: 20 }} />
    <Ice x={540} y={1080} w={460} h={560} o={clamp(t / 4)} />
    <Sis x={250} y={1500} s={0.36} face="grin" t={t} pose={{ armR: 120 }} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d="M 0 -20 L 6 0 L 0 20 L -6 0 Z" fill="#FFFFFF" transform={`translate(${300 + random(`sf${i}`) * 480} ${560 + random(`sy${i}`) * 520}) scale(${1 + Math.sin(t * 0.3 + i)})`} />)}
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A5A8A" c2="#2A7AAA" />
    <g transform={`translate(540 860) scale(${popIn(t, 5) * 1.2})`}>
      <rect x={-300} y={-150} width={600} height={300} rx={40} fill="#BDEBFF" stroke={OL} strokeWidth={12} />
      <text y={60} {...txt(170, '#2A6AE8', 10)}>{`9:${String(59 - Math.min(59, Math.floor(t / 2))).padStart(2, '0')}`}</text>
    </g>
  </g>
);
export const S7: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
    <Sis x={540} y={1900} s={1.3} face="smirk" t={t} pose={{ armL: 30, armR: 140 }} />
    <g transform={`translate(800 560) rotate(8) scale(${popIn(t - 3)})`}><rect x={-200} y={-70} width={400} height={140} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={9} /><text y={24} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={PINK}>SAY IT!</text></g>
  </g>
);
export const S8: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A5A8A" c2="#2A7AAA" />
    <Blocky x={540} y={1950} s={1.3} kind="kid" face="despair" t={0} pose={{ armL: 150, armR: 150 }} />
    <Ice x={540} y={1950} w={1000} h={1450} />
  </g>
);
const Table: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={240} y={1240} width={600} height={40} rx={10} fill="#FFFFFF" stroke={OL} strokeWidth={8} />
    <path d="M 240 1280 L 270 1360 L 810 1360 L 840 1280 Z" fill="#FFD0EE" stroke={OL} strokeWidth={8} />
    <g transform="translate(540 1160)"><ellipse rx={80} ry={70} fill="#FFFFFF" stroke={OL} strokeWidth={8} /><path d="M 70 -10 Q 130 -30 140 -70" stroke={OL} strokeWidth={10} fill="none" /><circle cy={-70} r={14} fill={PINK} stroke={OL} strokeWidth={5} /></g>
  </g>
);
const Cup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -40 -40 L 40 -40 L 30 20 L -30 20 Z" fill="#FFFFFF" stroke={OL} strokeWidth={7} /><path d="M 38 -24 Q 64 -20 36 6" stroke={OL} strokeWidth={7} fill="none" /><ellipse cy={26} rx={56} ry={12} fill="#FFD0EE" stroke={OL} strokeWidth={5} /></g>
);
export const S9: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
    <Blocky x={820} y={1500} s={0.62} kind="boss" face="despair" t={t} pose={{ armL: 60, armR: 20 }} extra={<g transform="translate(-200 -500)"><Cup x={0} y={0} s={1.4} /></g>} />
    <Table t={t} />
    <Sis x={250} y={1500} s={0.42} face="happy" t={t} pose={{ armR: 100 }} />
    <g transform="translate(820 1500) scale(0.62)"><path d="M -140 -1000 L 140 -1000 L 0 -1220 Z" fill="#FF7AD0" stroke={OL} strokeWidth={10} strokeLinejoin="round" /><circle cy={-1230} r={24} fill="#FFD23F" stroke={OL} strokeWidth={6} /></g>
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#5A0A0A" c2="#7A1A1A" />
    <g transform={`translate(540 860) scale(${popIn(t, 5) * 1.1})`}>
      <rect x={-260} y={-340} width={520} height={680} rx={30} fill="#1E1A2E" stroke="#B8B0D8" strokeWidth={10} />
      <g transform="translate(0 -70) scale(0.9)"><Blocky x={0} y={300} s={0.4} kind="kid" face="shock" t={t} /></g>
      <text y={260} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={48} fill="#FFFFFF">BROTHER_99</text>
    </g>
    {t > 6 ? <g transform={`translate(540 880) rotate(-16) scale(${lerp(2.5, 1, easeOut(clamp((t - 6) / 4)))})`} opacity={clamp((t - 6) / 2)}>
      <rect x={-330} y={-90} width={660} height={180} rx={24} fill="none" stroke="#FF3A3A" strokeWidth={18} />
      <text y={52} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={140} fill="#FF3A3A">BANNED</text>
    </g> : null}
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Storm t={t} />
    <rect x={200} y={700} width={680} height={600} fill="none" stroke="#8A8AA8" strokeWidth={16} />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={220 + i * 84} y={700} width={16} height={600} fill="#8A8AA8" />)}
    <g transform="translate(540 650)"><rect x={-200} y={-60} width={400} height={120} rx={20} fill="#FF3A3A" stroke={OL} strokeWidth={8} /><text y={22} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill="#FFFFFF">NO BROTHERS</text></g>
    <Blocky x={540} y={1560} s={0.5} kind="kid" face="despair" t={t} />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={random(`rn${i}`) * W} y={((t * 50 + random(`ry${i}`) * 2000) % 2100) - 100} width={6} height={60} fill="#8AB8FF" opacity={0.6} />)}
  </g>
);
export const S12: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1900} s={1.3} kind="kid" face="worried" t={t} pose={{ armL: 100, armR: 100 }} />
    {Array.from({ length: 6 }, (_, i) => <Candy key={i} x={300 + i * 96} y={1180 - (i % 2) * 40} s={0.8} r={i * 30} c={['#FF4A4A', '#4ADE6A', '#FFD23F', PINK, '#7ACCF2', '#FF9A3A'][i]} />)}
  </g>
);
export const S13: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C83A9A" c2="#E85AB8" />
    {Array.from({ length: 24 }, (_, i) => {
      const x = random(`cd${i}`) * W, y = -150 + ((t * (14 + random(`cdv${i}`) * 10) + random(`cdy${i}`) * 2000) % 2100);
      return <Candy key={i} x={x} y={y} s={0.9} r={t * 6 + i * 30} c={['#FF4A4A', '#4ADE6A', '#FFD23F', '#7ACCF2', '#FF9A3A'][i % 5]} />;
    })}
    <g transform={`translate(540 860) scale(${popIn(t - 2)}) rotate(-5)`}><text {...txt(150, '#FFD23F', 16)}>ALL MY</text><text y={170} {...txt(150, '#FFFFFF', 16)}>CANDY</text></g>
  </g>
);
export const S14: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1E7A34" c2="#2EA84A" />
    <Sis x={340} y={1480} s={0.6} face="starry" t={t} pose={{ armR: 90 }} crown={t < 10} />
    <Blocky x={740} y={1480} s={0.6} kind="kid" face="grin" t={t} pose={{ armL: 90 }} extra={t >= 10 ? <Crown y={-1000} s={lerp(1.6, 0.9, easeOut(clamp((t - 10) / 5)))} /> : null} />
    <g transform={`translate(540 640) scale(${popIn(t - 2)}) rotate(-5)`}><text {...txt(140, '#4ADE6A')}>DEAL!</text></g>
    <Confetti t={t} seed="dl" />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Blocky x={540} y={1900} s={1.3} kind="kid" face="determined" t={t} pose={{ armL: 165, armR: 165 }} extra={<Crown y={-1010} s={0.9} />} />
    <SpeedLines t={t} o={0.3} />
  </g>
);
export const S16: S = ({ t }) => {
  const cmd = '/give me 999999 gems';
  return (
    <g>
      <rect x={-300} y={-300} width={W + 600} height={2600} fill="#0A140E" />
      <g transform="translate(540 860)">
        <rect x={-460} y={-160} width={920} height={320} rx={30} fill="#06120A" stroke="#4ADE6A" strokeWidth={10} />
        <text x={-420} y={-60} fontFamily={FONT.game} fontWeight={900} fontSize={40} fill="#4ADE6A" opacity={0.6}>ADMIN: YOU</text>
        <text x={-420} y={40} fontFamily={FONT.game} fontWeight={900} fontSize={58} fill="#FFFFFF">{'> '}{cmd.slice(0, Math.floor(t / 1.2))}{Math.floor(t / 6) % 2 ? '_' : ''}</text>
      </g>
    </g>
  );
};
export const S17: S = ({ t }) => (
  <g>
    <rect x={-300} y={-300} width={W + 600} height={2600} fill={Math.floor(t / 5) % 2 ? '#5A0A0A' : '#7A1010'} />
    <g transform={`translate(540 860) scale(${popIn(t, 5) * 0.92})`}>
      <rect x={-360} y={-200} width={720} height={400} rx={30} fill="#1E1A2E" stroke="#FF3A3A" strokeWidth={12} />
      <circle cx={-220} cy={0} r={100} fill="#9A7AD8" stroke={OL} strokeWidth={8} />
      <g transform="translate(-220 30) scale(0.42)"><Crown y={-230} s={1} c="#FF3A3A" /></g>
      <text x={-90} y={-30} fontFamily={FONT.game} fontWeight={900} fontSize={48} fill="#FF3A3A">OWNER</text>
      <text x={-90} y={40} fontFamily={FONT.game} fontWeight={900} fontSize={60} fill="#FFFFFF">IS ONLINE</text>
    </g>
  </g>
);
export const S18: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2468" c2="#5A3A98" />
    <Blocky x={540} y={2000} s={1.3} kind="mom" face="determined" t={t} pose={{ armL: 30, armR: 150 }} extra={<Crown y={-1010} s={0.9} c="#FF3A3A" />} />
    <g transform={`translate(540 640) scale(${popIn(t - 2) * 0.85}) rotate(-4)`}><rect x={-380} y={-80} width={760} height={160} rx={30} fill="#1A1424" stroke="#7ACCF2" strokeWidth={10} /><text y={30} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={88} fill="#7ACCF2">/bedtime all</text></g>
  </g>
);
export const S19: S = ({ t }) => (
  <g>
    <Bedroom t={t} dark={0.6} />
    {/* two kids tucked in, with the crowns on the floor */}
    {[300, 720].map((x, i) => <g key={i} transform="translate(0 -240)">
      <rect x={x - 170} y={1200} width={340} height={260} rx={30} fill={i ? '#FF8AD8' : '#4A8AE8'} stroke={OL} strokeWidth={9} />
      <g transform={`translate(${x} 1180) scale(0.42)`}><g transform="translate(0 -40)">{i ? <Sis x={0} y={850} s={1} face="sleepy" t={t} crown={false} /> : <Blocky x={0} y={850} s={1} kind="kid" face="sleepy" t={t} />}</g></g>
      <rect x={x - 170} y={1260} width={340} height={200} rx={30} fill={i ? '#FF8AD8' : '#4A8AE8'} stroke={OL} strokeWidth={9} />
    </g>)}
    {[0, 1, 2].map((k) => <text key={k} x={560 + k * 50} y={760 - k * 70 - ((t * 2) % 40)} fontFamily={FONT.game} fontWeight={900} fontSize={60 + k * 16} fill="#FFFFFF" opacity={0.8}>Z</text>)}
    <g transform="translate(540 1600) scale(0.4)"><Crown y={0} s={1} /></g>
  </g>
);
export const S20: S = ({ t }) => (
  <g>
    <S19 t={t} f={0} len={60} />
    <Toast t={t - 3} text="COMMENT SISTER" c={PINK} y={600} />
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
export const S30 = close(S1, 540, 900, 1.6, 20);    // "sister": her face under the crown
export const S31 = close(S4, 540, 1000, 1.6, 20);   // "cool": the kid yelling
export const S32 = close(S9, 720, 1000, 1.5, 20);   // "tea party": the boss with the teacup
export const S33 = close(S3, 540, 1100, 1.4, 24);   // "pink": the pink world
export const S34 = close(S11, 540, 1100, 1.5, 20);  // "game": locked out
export const S35 = close(S5, 540, 800, 1.6, 20);    // "mid-air": frozen in the ice
export const S36 = close(S7, 760, 600, 1.4, 20);    // "unfreeze": SAY IT!
export const S37 = close(S9, 300, 1100, 1.6, 20);   // "boss": sister pouring
export const S38 = close(S12, 540, 1150, 1.5, 20);  // "powers": the candy offer
export const S39 = close(S16, 600, 860, 1.15, 20);   // "first command": the typing
export const S40 = close(S1, 860, 1000, 2.0, 20);   // "Quest": you, worried
