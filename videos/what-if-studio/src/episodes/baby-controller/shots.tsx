import React from 'react';
import { random } from 'remotion';
import { ShotProps, FONT } from '../../engine';
import { W, popIn, clamp, lerp, easeOut, CloseCtx } from '../molasses/kit';
import { OL, Blocky, Burst, Sparkles, Sky, Confetti, SpeedLines, Storm, CubeHead, Card, Face } from '../ten-seconds/shots';
import { Toast, Ground } from '../best-friend/shots';
import { LivingRoom, Controller } from '../mom-plays/shots';
import words from './words.json';

// "What if your baby brother grabbed your controller?" The blocky-game What If style, family twist: four minutes
// of baby chaos that keeps beating your records, then the controller goes in the toilet and he blames you.
// Original characters and an invented game.

type S = React.FC<ShotProps>;
const at = (word: string, n = 1) => { let k = 0; for (const w of words as any[]) if (w.w.toLowerCase() === word.toLowerCase() && ++k === n) return w.s; return 0; };
const txt = (s: number, c = '#FFFFFF', sw = 12) => ({ textAnchor: 'middle' as const, fontFamily: FONT.game, fontWeight: 900, fontSize: s, fill: c, stroke: OL, strokeWidth: sw, paintOrder: 'stroke' as const });
const BLUE = '#7ACCF2';
const STEPS: [number, string, string][] = [[0, '0', '#FFFFFF'], [at('secret'), '9,999', '#C8A8FF'], [at('boss'), '99,999', '#4ADE6A'], [at('record'), 'WORLD RECORD', '#FFD23F'], [at('toilet'), 'OFFLINE', '#FF4A4A']];

/** The baby's score (fixed HUD): it jumps at every accident, then the controller goes offline. */
export const BabyBar: React.FC<{ f: number }> = ({ f }) => {
  const sec = f / 30;
  let k = 0; STEPS.forEach(([s], i) => { if (sec >= s) k = i; });
  const [s0, label, c] = STEPS[k];
  const pop = k > 0 && sec < s0 + 0.3 ? 1.16 : 1;
  return (
    <g transform={`translate(540 330) scale(${pop})`}>
      <rect x={-320} y={-46} width={640} height={92} rx={46} fill="#1A1424" stroke={c} strokeWidth={6} />
      <circle cx={-262} cy={0} r={28} fill="#F4E2CC" stroke={OL} strokeWidth={5} /><path d="M -262 -30 q 14 -14 4 -24" stroke="#8A5A32" strokeWidth={6} fill="none" strokeLinecap="round" />
      <text x={-218} y={15} fontFamily={FONT.game} fontWeight={900} fontSize={38} fill={BLUE}>BABY</text>
      <text x={285} y={17} textAnchor="end" fontFamily={FONT.game} fontWeight={900} fontSize={label.length > 8 ? 40 : 50} fill={c}>{label}</text>
    </g>
  );
};
const MinuteBadge: React.FC<{ t: number; n: string; len?: number }> = ({ t, n, len = 30 }) => (
  <g>
    <Burst t={t} c1="#1A5A8A" c2="#2A7AAA" />
    <circle cx={540} cy={860} r={200 + t * 60} fill="none" stroke="#FFFFFF" strokeWidth={Math.max(0, 40 - t * 3)} opacity={Math.max(0, 1 - t / 12)} />
    <Sparkles t={t * 2} n={14} seed={`mb${n}`} />
    <g transform={`translate(540 ${860 - Math.max(0, t - len + 6) * 160}) scale(${(t < 5 ? lerp(3.2, 1, easeOut(t / 5)) : 1) * 1.25}) rotate(${t < 5 ? lerp(-24, -4, easeOut(t / 5)) : -4 + Math.sin(t * 0.6) * 3})`}>
      <rect x={-260} y={-160} width={520} height={320} rx={60} fill="#FFFFFF" stroke={OL} strokeWidth={14} />
      <rect x={-236} y={-136} width={472} height={272} rx={44} fill="none" stroke={BLUE} strokeWidth={14} />
      <text y={-50} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill={OL}>MINUTE</text>
      <text y={110} {...txt(170, '#3A9AD8')}>{n}</text>
    </g>
  </g>
);
const badge = (n: string): S => ({ t, len }) => <MinuteBadge t={t} n={n} len={len} />;
/** The baby: a big bald cube head with one curl, a yellow onesie, a diaper and stubby limbs. */
const Baby: React.FC<{ x: number; y: number; s: number; face: Face; t: number; armL?: number; armR?: number; r?: number; held?: React.ReactNode; paci?: boolean }> = ({ x, y, s, face, t, armL = 20, armR = 20, r = 0, held, paci }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
    <ellipse cx={0} cy={6} rx={170} ry={22} fill="#000" opacity={0.22} />
    {[-70, 70].map((lx) => <rect key={lx} x={lx - 46} y={-70} width={92} height={74} rx={26} fill="#F4E2CC" stroke={OL} strokeWidth={9} />)}
    <g transform={`translate(-128 -250) rotate(${armL})`}><rect x={-34} y={-10} width={68} height={130} rx={28} fill="#FFE27A" stroke={OL} strokeWidth={9} /><circle cx={0} cy={126} r={30} fill="#F4E2CC" stroke={OL} strokeWidth={9} /></g>
    <rect x={-120} y={-290} width={240} height={230} rx={50} fill="#FFE27A" stroke={OL} strokeWidth={9} />
    <path d="M -120 -150 Q 0 -110 120 -150 L 120 -100 Q 120 -50 70 -50 L -70 -50 Q -120 -50 -120 -100 Z" fill="#FFFFFF" stroke={OL} strokeWidth={9} strokeLinejoin="round" />
    <g transform={`translate(0 ${-440 + Math.sin(t * 0.12) * 3})`}>
      <CubeHead face={face} hair={'none' as any} t={t} />
      <path d="M -10 -176 q 50 -60 10 -90 q -40 -10 -30 30" stroke="#8A5A32" strokeWidth={14} fill="none" strokeLinecap="round" />
      {paci ? <g><circle cx={0} cy={86} r={40} fill="#7ACCF2" stroke={OL} strokeWidth={8} /><circle cx={0} cy={86} r={14} fill="#FFFFFF" stroke={OL} strokeWidth={6} /></g> : null}
    </g>
    <g transform={`translate(128 -250) rotate(${-armR})`}><rect x={-34} y={-10} width={68} height={130} rx={28} fill="#FFE27A" stroke={OL} strokeWidth={9} /><circle cx={0} cy={126} r={30} fill="#F4E2CC" stroke={OL} strokeWidth={9} /></g>
    {held}
  </g>
);
const Drool: React.FC<{ t: number; x: number; y: number; n?: number }> = ({ t, x, y, n = 4 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const life = (t * 0.9 + i * 6) % 22; return <path key={i} d="M 0 -26 Q 22 6 0 22 Q -22 6 0 -26 Z" fill="#9AE0FF" stroke={OL} strokeWidth={5} transform={`translate(${x + (i - n / 2) * 46} ${y + life * life * 0.9}) scale(${1 + (i % 2) * 0.3})`} opacity={clamp(1.2 - life / 22)} />; })}</g>
);
const Zzz: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g>{[0, 1, 2].map((k) => <text key={k} x={x + k * 60} y={y - k * 80 - ((t * 2) % 40)} fontFamily={FONT.game} fontWeight={900} fontSize={70 + k * 20} fill="#FFFFFF" stroke={OL} strokeWidth={8} paintOrder="stroke" opacity={0.9}>Z</text>)}</g>
);

// ---------------------------------------------------------------- shots
export const S1: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={820} y={1370} s={0.55} kind="kid" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
    <Baby x={400} y={1390} s={0.9} face="grin" t={t} armL={60} armR={60} held={<g transform="translate(0 -170)"><Controller x={0} y={0} s={1.1} t={t * 2} /></g>} />
  </g>
);
export const S2: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A5A8A" c2="#2A7AAA" />
    <Baby x={540} y={1750} s={1.9} face="grin" t={t} armL={70} armR={70} held={<g transform="translate(0 -170)"><Controller x={0} y={0} s={1.1} t={t * 3} /></g>} />
    <Sparkles t={t} seed="b2" />
  </g>
);
export const S3: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A6A8A" c2="#2A8AAA" />
    <Baby x={540} y={1330} s={1.35} face="tongue" t={t} armL={10} armR={10} />
    <g transform="translate(540 1420)"><Controller x={0} y={0} s={1.9} t={t} /></g>
    <Drool t={t} x={540} y={1130} />
  </g>
);
export const S4: S = ({ t }) => {
  const open = easeOut(clamp((t - 4) / 12));
  return (
    <g>
      <rect x={-300} y={-300} width={W + 600} height={2600} fill="#1A0E2E" />
      <Burst t={t} c1="#2A1648" c2="#3A2060" />
      <g transform="translate(540 980) scale(0.9)">
        <rect x={-230} y={-330} width={460} height={660} rx={20} fill="#FFE27A" opacity={open} />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d="M 0 0 L -60 -900 L 60 -900 Z" fill="#FFE27A" opacity={0.18 * open} transform={`rotate(${i * 36 + t})`} />)}
        <rect x={-230} y={-330} width={230 * (1 - open)} height={660} fill="#6A4AC8" stroke={OL} strokeWidth={12} /><rect x={230 * open} y={-330} width={230 * (1 - open)} height={660} fill="#6A4AC8" stroke={OL} strokeWidth={12} />
        <rect x={-250} y={-350} width={500} height={700} rx={24} fill="none" stroke={OL} strokeWidth={16} />
      </g>
      <g transform={`translate(540 500) scale(${popIn(t - 8)}) rotate(-4)`}><text {...txt(76, '#C8A8FF')}>SECRET LEVEL</text></g>
      <Sparkles t={t * 2} n={16} seed="sl" />
    </g>
  );
};
export const S5: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#8A1A1A" c2="#B82A2A" />
    <Blocky x={540} y={1950} s={1.3} kind="kid" face="yell" t={t} pose={{ armL: 150, armR: 150 }} />
    <SpeedLines t={t} c="#FF8A8A" o={0.3} />
  </g>
);
export const S6: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C86A1A" c2="#E88A2A" />
    <Baby x={540} y={1750} s={1.9} face="happy" t={t} armL={120} armR={120} />
    <g transform={`translate(540 ${1210 + Math.sin(t * 1.4) * 14}) rotate(${Math.sin(t * 1.4) * 8})`}><Controller x={0} y={0} s={2.0} t={t} /></g>
    <g transform={`translate(720 640) rotate(10) scale(${popIn(t - 3)})`}><text {...txt(100, '#FFFFFF')}>NOM!</text></g>
  </g>
);
export const S7: S = ({ t }) => {
  const k = clamp(t / 34), x = lerp(160, 900, k), y = 1250 - Math.sin(k * Math.PI) * 620;
  return (
    <g>
      <Sky /><Ground />
      <g transform={`translate(${x} ${y}) rotate(${k * 1080})`}><Blocky x={0} y={230} s={0.42} kind="kid" face="shock" t={t} pose={{ armL: 160, armR: 160, legL: 30, legR: -30 }} /></g>
      {[0.25, 0.5, 0.75].map((q, i) => (k > q ? <g key={i} transform={`translate(${lerp(160, 900, q)} ${1250 - Math.sin(q * Math.PI) * 620 - 260}) scale(${popIn(t - q * 34, 4)})`}><text {...txt(90, '#4ADE6A', 10)}>x{i + 1}</text></g> : null))}
      <SpeedLines t={t} o={0.25} />
    </g>
  );
};
export const S8: S = ({ t }) => {
  const land = clamp(t / 5);
  return (
    <g>
      <Storm t={t} />
      <g transform={`translate(600 1500) scale(1 ${t > 5 ? 0.55 : 1})`}><Blocky x={0} y={0} s={0.8} kind="boss" face="despair" t={t} pose={{ armL: 120, armR: 120 }} /></g>
      <Blocky x={600} y={lerp(300, t > 5 ? 1010 : 760, land)} s={0.4} kind="kid" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
      {t > 5 ? <g transform={`translate(540 600) scale(${popIn(t - 5, 4)}) rotate(-6)`}><path d="M 0 -210 L 60 -75 L 210 -90 L 100 10 L 160 160 L 0 75 L -160 160 L -100 10 L -210 -90 L -60 -75 Z" fill="#FFD23F" stroke={OL} strokeWidth={12} strokeLinejoin="round" /><text y={36} {...txt(110, '#FF3A3A', 10)}>K.O.!</text></g> : null}
    </g>
  );
};
export const S9: S = ({ t }) => (
  <g>
    <LivingRoom t={t} tv="#FFD23F" />
    <g transform="translate(560 1420)"><Controller x={0} y={0} s={1.5} t={0} /></g>
    <Baby x={420} y={1420} s={0.95} face="sleepy" t={t} armL={80} armR={80} r={62} paci />
    <Zzz t={t} x={700} y={900} />
  </g>
);
export const S10: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#C88A1A" c2="#E8A82A" />
    <Card t={t} title="SPEEDRUN" big="0:07" btn="RECORD!" ok />
    <Confetti t={t} seed="wr" />
  </g>
);
export const S11: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#3A2A48" c2="#4A3A5A" />
    <Blocky x={540} y={1950} s={1.3} kind="kid" face="despair" t={t} pose={{ armL: 100, armR: 100 }} />
    <g transform={`translate(700 700) rotate(8) scale(${popIn(t - 6)})`}><rect x={-190} y={-66} width={380} height={132} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={9} /><text y={24} textAnchor="middle" fontFamily={FONT.game} fontWeight={900} fontSize={66} fill="#E2262E">2 YEARS!</text></g>
  </g>
);
export const S12: S = ({ t }) => {
  const k = clamp((t - 8) / 14);
  return (
    <g>
      <LivingRoom t={t} />
      <Baby x={380} y={1500} s={1.0} face={t > 8 ? 'grin' : 'happy'} t={t} armL={t > 8 ? 150 : 60} armR={t > 8 ? 150 : 60} />
      <g transform={`translate(${lerp(400, 1250, k)} ${1100 - Math.sin(k * Math.PI * 0.8) * 500}) rotate(${k * 700})`}><Controller x={0} y={0} s={1.2} t={0} /></g>
      {t > 8 ? <g transform={`translate(640 660) scale(${popIn(t - 8, 4)}) rotate(-8)`}><text {...txt(120, '#FFD23F')}>YEET!</text></g> : null}
      <SpeedLines t={t} o={t > 8 ? 0.3 : 0} />
    </g>
  );
};
export const S13: S = ({ t }) => {
  const k = clamp(t / 8), splash = t > 8;
  return (
    <g>
      <rect x={-300} y={-300} width={W + 600} height={2600} fill="#BDE4F2" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-300} y={i * 150} width={W + 600} height={6} fill="#9ACCE0" />)}{Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 150 - 60} y={-300} width={6} height={2600} fill="#9ACCE0" />)}
      <rect x={-300} y={1500} width={W + 600} height={700} fill="#E8E8F0" />
      <rect x={330} y={620} width={420} height={420} rx={30} fill="#FFFFFF" stroke={OL} strokeWidth={12} /><rect x={680} y={690} width={50} height={26} rx={8} fill="#B8B8C8" stroke={OL} strokeWidth={6} />
      <path d="M 260 1060 L 820 1060 Q 800 1400 660 1500 L 420 1500 Q 280 1400 260 1060 Z" fill="#FFFFFF" stroke={OL} strokeWidth={12} strokeLinejoin="round" />
      <ellipse cx={540} cy={1060} rx={300} ry={70} fill="#FFFFFF" stroke={OL} strokeWidth={12} /><ellipse cx={540} cy={1066} rx={230} ry={44} fill="#5AC8F2" stroke={OL} strokeWidth={8} />
      {!splash ? <g transform={`translate(${lerp(-100, 540, k)} ${lerp(500, 1040, k * k)}) rotate(${k * 500})`}><Controller x={0} y={0} s={1.2} t={0} /></g> : null}
      {splash ? Array.from({ length: 12 }, (_, i) => { const q = t - 8, a = Math.PI * (0.15 + 0.7 * (i / 11)); return <path key={i} d="M 0 -26 Q 22 6 0 22 Q -22 6 0 -26 Z" fill="#5AC8F2" stroke={OL} strokeWidth={5} transform={`translate(${540 + Math.cos(a) * q * 34} ${1040 - Math.sin(a) * q * 60 + q * q * 2.4})`} opacity={clamp(1.3 - q / 18)} />; }) : null}
      {splash ? <g transform={`translate(540 560) scale(${popIn(t - 8, 4)}) rotate(-6)`}><text {...txt(150, '#5AC8F2')}>PLOP!</text></g> : null}
    </g>
  );
};
export const S14: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#5A1A6A" c2="#7A2A8A" />
    <Blocky x={540} y={2050} s={1.3} kind="mom" face="angry" t={t} pose={{ armL: 20, armR: 150 }} />
    <g transform="translate(880 900) rotate(20)"><Controller x={0} y={0} s={1.3} t={0} /></g>
    <Drool t={t} x={880} y={990} n={3} />
  </g>
);
export const S15: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={850} y={1370} s={0.52} kind="kid" face="shock" t={t} pose={{ armL: 150, armR: 150 }} />
    <Blocky x={200} y={1370} s={0.56} kind="mom" face="angry" t={t} pose={{ armL: 30, armR: 30 }} />
    <Baby x={520} y={1410} s={0.8} face="smirk" t={t} armL={20} armR={t > 4 ? 95 : 20} paci />
    {t > 4 ? <g transform={`translate(730 900) scale(${popIn(t - 4, 4)})`}><path d="M -60 -30 L 30 -30 L 30 -60 L 100 0 L 30 60 L 30 30 L -60 30 Z" fill="#FFD23F" stroke={OL} strokeWidth={9} strokeLinejoin="round" /></g> : null}
  </g>
);
export const S16: S = ({ t }) => (
  <g>
    <Burst t={t} c1="#1A5A8A" c2="#2A7AAA" />
    <Baby x={540} y={1750} s={1.9} face="smirk" t={t} armL={20} armR={95} paci />
  </g>
);
export const S17: S = ({ t }) => (
  <g>
    <LivingRoom t={t} />
    <Blocky x={850} y={1370} s={0.52} kind="kid" face="despair" t={t} />
    <Blocky x={200} y={1370} s={0.56} kind="mom" face="angry" t={t} pose={{ armR: 100 }} />
    <Baby x={520} y={1410} s={0.8} face="grin" t={t} armL={140} armR={140} paci />
    <Toast t={t - 3} text="COMMENT BABY" c={BLUE} y={600} />
    <Sparkles t={t} seed="end" />
  </g>
);
export const S20 = badge('1');
export const S21 = badge('2');
export const S22 = badge('3');
export const S23 = badge('4');

// ---------------------------------------------------------------- "wide, then close"
const close = (Shot: S, cx: number, cy: number, z: number, from: number): S => (p) => (
  <CloseCtx.Provider value={true}><g transform={`translate(540 ${cy}) scale(${z}) translate(${-cx} ${-cy})`}><Shot {...p} t={p.t + from} /></g></CloseCtx.Provider>
);
export const S30 = close(S1, 820, 900, 1.8, 20);   // "your controller": you, horrified
export const S31 = close(S3, 540, 1300, 1.35, 14);   // "Somehow": the drool on the pad
export const S32 = close(S4, 540, 900, 1.4, 16);    // "level": the open door
export const S33 = close(S6, 540, 1150, 1.4, 20);   // "joystick": chewing
export const S34 = close(S7, 540, 800, 1.35, 16);   // "backflip": mid-flip
export const S35 = close(S9, 420, 1150, 1.6, 20);   // "buttons": asleep on the pad
export const S36 = close(S10, 540, 860, 1.3, 20);   // "record": the card
export const S37 = close(S12, 380, 1050, 1.6, 2);   // "wakes up": the baby
export const S38 = close(S15, 850, 900, 1.8, 20);  // "you": you, blamed
