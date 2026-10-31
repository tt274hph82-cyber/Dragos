import React from 'react';
import {
  Pose, basePose, kf, clamp, lerp, easeOut, easeIn, backOut, stand, CLS, KITCHEN, BEDROOM, SchoolDesk, Kid, Tabletop, Cat, PizzaBox, PizzaSlice,
  CookieTop, PlateTop, AlarmClock, WallCalendar, OpenBook, Dial, Tag, Toast, FloatLabel, Sparkle, FocusRings, SchLabel, DrawOn, Arrow, SCH, Glow,
  Phone, OUT, LEG_LEN, Hero, camT, ShotProps, FONT,
} from '../../engine';
import { JUNO, MO, MUM, TEACHER, ICE, Act, scene, closeUp, card, Frozen, Arm, sets } from './parts';

// Act 2 (the premise and the rules) and act 3 (the fun part). Shots F01-F43.

const JD = { x: 1260, feet: 760 + LEG_LEN }; // Juno at her school desk (hips 1260, 760)
const T0 = stand(CLS, 0.3, 0.22); // the teacher, at the board
const teacher = (o: Partial<Act> = {}): Act => ({ look: TEACHER, x: T0.x, feet: T0.y + LEG_LEN * T0.scale, scale: T0.scale, pose: { yaw: 0.35, look: 0.5, armR: { a: 70, b: 20 }, handR: 'point' }, face: [[0, 'happy']], rim: 'rimL', ...o });
const junoDesk = (o: Partial<Act> = {}): Act => ({ look: JUNO, x: JD.x, feet: JD.feet, pose: { yaw: -0.35, look: -0.5 }, rim: 'rimL', shadow: 0, ...o });
const desk = () => <SchoolDesk x={1260} />;

// ---------- act 2: the discovery ----------
export const F01 = scene({
  set: (t) => sets.classroom(t, false, 'f01'), cam: [960, 520, 1.0, 980, 520, 1.06],
  actors: [teacher(), junoDesk({ face: [[0, 'neutral']] })],
  over: (t) => <>{desk()}<Toast x={960} y={170} t={t - 8} text="TUESDAY" hold={60} /></>,
});
export const F02 = scene({
  set: (t) => sets.classroom(t, false, 'f02'), cam: [1240, 560, 1.9, 1240, 560, 2.0],
  actors: (t) => [junoDesk({ keys: [{ f: 0, p: {} }, { f: 6, p: { squash: 0.12, headTilt: 8 } }, { f: 9, p: { squash: -0.04, headTilt: -4 } }, { f: 14, p: { squash: 0, headTilt: 0 } }], face: [[0, 'neutral'], [6, 'oops']] })],
  over: (t) => <>{desk()}<FloatLabel x={1340} y={470} t={t - 6} text="hic!" size={60} /></>,
});
export const F03 = closeUp({ look: JUNO, face: [[0, 'neutral'], [8, 'puff']], bg: (t) => sets.classroom(t, false, 'f03'), bgT: 'translate(-1500 -700) scale(2.2)', x: 1000, y: 560, sc: 4.2, yaw: -0.2, rim: 'rimL' });
export const F04 = scene({
  set: () => sets.classroom(0, true, 'f04'), cam: [960, 520, 1.0, 960, 520, 1.08],
  actors: [teacher({ freeze: 20, face: [[0, 'shock']] }), junoDesk({ face: [[0, 'puff']] })],
  over: (t) => <>{desk()}<Frozen x={1260} y={560} t={t} r={140} /></>,
});
export const F05: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.08]]))}>
    <rect x={-400} y={-400} width={2720} height={1880} fill="#3A3048" />
    <circle cx={960} cy={540} r={380} fill="#F3E6D6" stroke="#2A2234" strokeWidth={26} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <rect key={i} x={956} y={190} width={8} height={40} fill="#2A2234" transform={`rotate(${(a * 180) / Math.PI} 960 540)`} />;
    })}
    <path d="M 960 540 L 960 330" stroke="#2A2234" strokeWidth={16} strokeLinecap="round" transform="rotate(300 960 540)" />
    <path d="M 960 540 L 960 280" stroke="#2A2234" strokeWidth={10} strokeLinecap="round" transform="rotate(40 960 540)" />
    {/* the second hand, stuck mid-tick, trembling */}
    <path d="M 960 590 L 960 220" stroke="#D9534F" strokeWidth={5} strokeLinecap="round" transform={`rotate(${132 + Math.sin(t * 1.7) * 0.6} 960 540)`} />
    <circle cx={960} cy={540} r={16} fill="#D9534F" />
    <Frozen x={960} y={540} t={t} r={420} />
  </g>
);
export const F06: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.06]]))}>
    <Tabletop edge={860} />
    <Glow x={900} y={380} r={700} o={0.3} />
    <rect x={1200} y={560} width={360} height={240} fill="#F3E6D6" transform="rotate(6 1380 680)" />
    {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={1230} y={600 + i * 30} width={290} height={4} fill="#9FB4D6" transform="rotate(6 1380 680)" />)}
    {/* the pencil, hanging in mid-air above its own shadow */}
    <ellipse cx={880} cy={760} rx={140} ry={14} fill="#000" opacity={0.25} />
    <g transform="translate(880 420) rotate(-32)">
      <rect x={-170} y={-14} width={300} height={28} fill="#E9C46A" stroke="#7A5A2A" strokeWidth={3} />
      <path d="M 130 -14 L 190 0 L 130 14 Z" fill="#E8C8A0" stroke="#7A5A2A" strokeWidth={3} />
      <path d="M 172 -4 L 190 0 L 172 4 Z" fill="#2A2234" />
      <rect x={-200} y={-14} width={30} height={28} fill="#E07A7A" />
    </g>
    <Frozen x={880} y={420} t={t} r={150} />
  </g>
);
export const F07 = closeUp({
  look: TEACHER, face: [[0, 'shock']], bg: () => sets.classroom(0, true, 'f07'), bgT: 'translate(-500 -300) scale(2)', x: 900, y: 560, sc: 3.8, yaw: 0.35, eyes: 0.6, rim: 'rimL',
  pose: { armR: { a: 70, b: 20 }, handR: 'point' },
  over: (t) => <Frozen x={900} y={540} t={t} r={280} />,
});
export const F08 = closeUp({ look: JUNO, face: [[0, 'puff'], [3, 'shock']], bg: (t) => sets.classroom(t, false, 'f08'), bgT: 'translate(-1500 -700) scale(2.2)', x: 980, y: 560, sc: 4.4, yaw: -0.2, rim: 'rimL', pose: { squash: -0.05 } });
export const F09 = scene({
  set: (t) => sets.classroom(t, false, 'f09'), cam: [980, 520, 1.05, 1000, 520, 1.1],
  actors: [teacher({ face: [[0, 'happy']] }), junoDesk({ face: [[0, 'oops']] })],
  over: (t) => {
    const fall = easeIn(clamp(t / 10));
    return (
      <>
        {desk()}
        <g transform={`translate(${lerp(1180, 1200, fall)} ${lerp(470, 735, fall)}) rotate(${-32 + fall * 80}) scale(0.35)`}>
          <rect x={-170} y={-14} width={300} height={28} fill="#E9C46A" />
          <path d="M 130 -14 L 190 0 L 130 14 Z" fill="#E8C8A0" />
        </g>
      </>
    );
  },
});
export const F10 = scene({
  set: (t) => sets.classroom(t, false, 'f10'), cam: [980, 520, 1.15, 1000, 520, 1.2],
  actors: [teacher(), junoDesk({ face: [[0, 'worried']], pose: { yaw: 0.3, look: 0.6 } }), { look: MO, x: 980, feet: 760 + LEG_LEN, pose: { yaw: -0.3, look: -0.2, armR: { a: 40, b: 80 } }, face: [[0, 'neutral']], rim: 'rimL', shadow: 0 }],
  over: () => <>{desk()}<SchoolDesk x={980} /></>,
  fg: <Kid x={500} y={1080} s={2.4} look={{ hair: 'curly', hairC: '#120E18', top: '#1E1A28' }} />,
});
export const F11 = closeUp({ look: MO, face: [[0, 'neutral'], [16, 'tired']], bg: (t) => sets.classroom(t, false, 'f11'), bgT: 'translate(-900 -600) scale(2.1)', x: 960, y: 560, sc: 4, yaw: -0.25, eyes: -0.3, rim: 'rimL' });

// ---------- the rules ----------
const B = stand(BEDROOM, 0.62, 0.55);
const bedroomJuno = (o: Partial<Act> = {}): Act => ({ look: JUNO, x: B.x, feet: B.y + LEG_LEN * B.scale, scale: B.scale, pose: { yaw: 0.3, look: 0.4 }, rim: 'rimL', ...o });
export const F12 = scene({
  set: (t) => sets.bedroom(t, false, 'f12', '21:04'), cam: [960, 560, 1.15, 980, 560, 1.22],
  actors: [bedroomJuno({ keys: [{ f: 0, p: { armR: { a: 60, b: 70 } } }, { f: 20, p: { armR: { a: 70, b: 60 } } }], face: [[0, 'neutral'], [14, 'smug']] })],
});
const RuleCard = (n: string, line1: string, line2: string, icon: (t: number) => React.ReactNode, id: string) =>
  card(id, (t) => (
    <g>
      <SchLabel x={960} y={200} t={t - 1} text={n} size={64} color={SCH.live} />
      {icon(t)}
      <SchLabel x={960} y={820} t={t - 8} text={line1} size={54} />
      {line2 ? <SchLabel x={960} y={900} t={t - 14} text={line2} size={40} color={SCH.dim} /> : null}
    </g>
  ));
const PauseIcon = (t: number) => (
  <g transform={`translate(960 520) scale(${backOut(clamp(t / 8))})`}>
    <circle r={180} fill="none" stroke={SCH.line} strokeWidth={8} />
    <rect x={-70} y={-90} width={45} height={180} rx={8} fill={SCH.live} />
    <rect x={25} y={-90} width={45} height={180} rx={8} fill={SCH.live} />
  </g>
);
export const F13 = card('f13', (t) => (
  <g>
    <SchLabel x={960} y={560} t={t} text="3 RULES" size={180} color={SCH.live} />
  </g>
));
export const F14 = RuleCard('RULE 1', 'HOLD YOUR BREATH = PAUSE', 'BREATHE = PLAY', PauseIcon, 'f14');
export const F15 = scene({
  set: (t) => sets.bedroom(t, false, 'f15', t < 6 ? '21:09' : '21:10'), cam: [B.x + 80, B.y - 60, 1.9, B.x + 80, B.y - 60, 2.0],
  actors: [bedroomJuno({ keys: [{ f: 0, p: { squash: 0.05 } }, { f: 8, p: { squash: -0.04 } }, { f: 16, p: { squash: 0 } }], face: [[0, 'puff'], [4, 'happy']] })],
  over: (t) => <><FloatLabel x={B.x + 60} y={B.y - 330} t={t - 4} text="PLAY" size={56} color="#9FE8B0" /></>,
});
export const F16 = RuleCard('RULE 2', 'WHAT YOU TOUCH MOVES WITH YOU', 'EVERYTHING ELSE IS STUCK', (t) => (
  <g transform="translate(960 520)">
    <circle cx={-160} cy={0} r={70} fill="none" stroke={SCH.live} strokeWidth={8} />
    <DrawOn d="M -80 0 L 80 0" t={t - 6} dur={6} />
    <circle cx={160} cy={0} r={70} fill="none" stroke={SCH.line} strokeWidth={8} strokeDasharray="12 10" />
    <SchLabel x={-160} y={130} t={t - 4} text="YOU + BOOK" size={30} color={SCH.dim} />
    <SchLabel x={160} y={130} t={t - 10} text="THE WORLD" size={30} color={SCH.dim} />
  </g>
), 'f16');
export const F17: React.FC<ShotProps> = ({ t, len }) => {
  const S = scene({
    set: () => sets.bedroom(0, true, 'f17', '21:10'), cam: [B.x, B.y - 80, 1.5, B.x + 40, B.y - 80, 1.58],
    actors: [bedroomJuno({ keys: [{ f: 0, p: { armR: { a: 40, b: 50 } } }, { f: 16, p: { armR: { a: 100, b: 20 } }, ease: easeOut }], face: [[0, 'puff']] })],
  });
  return (
    <g>
      <S t={t} len={len} f={0} />
      <g transform={camT(kf(t, [[0, B.x], [len, B.x + 40]]), B.y - 80, kf(t, [[0, 1.5], [len, 1.58]]))}>
        {/* a paper plane hangs in the air; the book in her hand moves */}
        <path d={`M ${B.x - 260} ${B.y - 300} l 90 20 l -70 14 l -8 30 Z`} fill="#F3E6D6" stroke="#9E927C" strokeWidth={3} />
        <Frozen x={B.x - 220} y={B.y - 290} t={t} r={60} />
        <OpenBook x={B.x + 120 + clamp((t - 6) / 12) * 60} y={B.y - 160 - clamp((t - 6) / 12) * 80} w={120} rot={-10} turn={clamp((t - 10) / 10)} />
      </g>
    </g>
  );
};
export const F18 = RuleCard('RULE 3', 'ONLY AS LONG AS YOUR BREATH', '', (t) => <Dial x={960} y={520} r={190} p={1 - clamp(t / 60) * 0.4} readout="0:40" size={84} />, 'f18');
export const F19 = closeUp({
  look: JUNO, face: [[0, 'worried']], bg: (t) => sets.bedroom(t, false, 'f19b', '21:12'), bgT: 'translate(-600 -500) scale(2)', x: 800, y: 560, sc: 3.8, yaw: 0.3, rim: 'rimL',
  over: (t) => <Dial x={1420} y={420} r={150} p={0.4} readout="0:40" size={64} />,
});

// ---------- act 3: training and the fun part ----------
export const F20: React.FC<ShotProps> = ({ t, len }) => {
  const bob = Math.sin(t / 8) * 6;
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.06]]))}>
      <rect x={-400} y={-400} width={2720} height={1880} fill="#4A5A6A" />
      {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-400 + i * 240} y={-400} width={4} height={1880} fill="#3A4A5A" />)}
      {/* the bath from above: the tub, the water, Juno's head just above it */}
      <rect x={360} y={180} width={1200} height={720} rx={300} fill="#F3EEE6" stroke="#B8B0A6" strokeWidth={10} />
      <rect x={420} y={240} width={1080} height={600} rx={260} fill="#7FB8D8" />
      <ellipse cx={960} cy={540} rx={520} ry={260} fill="#9FD0E8" opacity={0.5} />
      <clipPath id="tub20b"><rect x={420} y={240} width={1080} height={600} rx={260} /></clipPath>
      <g transform={`translate(0 ${bob})`} clipPath="url(#tub20b)">
        <Hero look={JUNO} pose={{ ...basePose, x: 760, y: 540 + 176 * 2.6, scale: 2.6, yaw: 0, look: 0.3, expr: 'puff' }} shadow={0} rimId="rimR" />
      </g>
      <clipPath id="tub20"><rect x={420} y={240} width={1080} height={600} rx={260} /></clipPath>
      <g clipPath="url(#tub20)"><rect x={360} y={640 + bob} width={1200} height={400} fill="#7FB8D8" /><path d={`M 360 ${640 + bob} Q 760 ${620 + bob} 1560 ${640 + bob}`} stroke="#BFE3F5" strokeWidth={6} fill="none" /></g>
      <Dial x={1360} y={400} r={140} p={clamp(t / len)} readout={`0:${String(Math.min(59, 20 + Math.floor(t / 2))).padStart(2, '0')}`} size={56} />
    </g>
  );
};
export const F21 = card('f21', (t, len) => {
  const s = Math.round(lerp(40, 60, clamp(t / (len * 0.9))));
  const read = s >= 60 ? '1:00' : `0:${s}`;
  return (
    <g>
      <WallCalendar x={520} y={260} w={420} crossed={Math.min(14, Math.floor(t / 4))} />
      <Dial x={1340} y={520} r={230} p={s / 60} readout={read} size={96} />
      <SchLabel x={1340} y={830} t={t} text="PERSONAL BEST" size={40} color={SCH.dim} />
    </g>
  );
});
export const F22 = scene({
  set: (t) => sets.roof(t, { low: 260, sunX: 1080, sunY: 520 }), cam: [960, 540, 1.0, 960, 540, 1.04],
  actors: [{ look: JUNO, x: 900, feet: 800 + LEG_LEN * 1.8, scale: 1.8, pose: { yaw: 0.15, armL: { a: 150, b: 20 }, armR: { a: 150, b: 20 } }, face: [[0, 'happy']], shadow: 0 }],
  over: (t) => <><Sparkle x={600} y={360} t={t} s={1.4} /><Sparkle x={1260} y={300} t={t - 6} s={1.1} /></>,
});
const Bus: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={0} y={560} width={560} height={270} rx={30} fill="#3E8C86" stroke="#1A1424" strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={30 + i * 130} y={590} width={110} height={90} rx={10} fill="#FFC27A" opacity={0.85} />)}
    <rect x={470} y={600} width={70} height={200} rx={8} fill="#2A5A56" />
    <rect x={0} y={720} width={560} height={14} fill="#E9C46A" />
    {[110, 450].map((wx) => <g key={wx}><circle cx={wx} cy={830} r={44} fill="#1A1424" /><circle cx={wx} cy={830} r={18} fill="#6A6470" /></g>)}
    <rect x={20} y={570} width={140} height={14} rx={4} fill="#1A1424" />
  </g>
);
const QUEUE = [520, 640, 760, 880, 1000];
const queueKids = (frozen: boolean): Act[] => QUEUE.map((x, i) => ({
  look: [MO, MUM, TEACHER, MO, MUM][i], x, feet: OUT.feet, scale: 0.7, pose: { yaw: -0.6, look: -0.8, armL: { a: 10, b: -8 } }, face: [[0, i % 2 ? 'tired' : 'neutral']],
  freeze: frozen ? 30 : undefined, shadow: 0.5,
}));
export const F23 = scene({
  set: (t) => sets.street(t, false, 'f23'), cam: [700, 640, 1.2, 680, 640, 1.25],
  actors: [...queueKids(false), { look: JUNO, x: 1150, feet: OUT.feet, scale: 0.7, pose: { yaw: -0.6, look: -0.8 }, face: [[0, 'worried']] }],
  over: (t) => <Bus x={kf(t, [[0, -900], [40, -380]])} />,
});
export const F24 = scene({
  set: () => sets.street(0, true, 'f24'), cam: [700, 640, 1.2, 640, 640, 1.25],
  actors: [...queueKids(true), { look: JUNO, x: 1150, feet: OUT.feet, scale: 0.7, walk: { to: 420, t1: 40 }, face: [[0, 'puff']] }],
  over: () => <Bus x={-380} />,
});
export const F25 = scene({
  set: (t) => sets.street(t, false, 'f25'), cam: [420, 600, 2.1, 420, 600, 2.2],
  actors: [{ look: JUNO, x: 420, feet: OUT.feet, scale: 0.7, pose: { yaw: -0.4, look: 0.6 }, face: [[0, 'smug']] }, { look: MO, x: 540, feet: OUT.feet, scale: 0.7, pose: { yaw: -0.6 }, face: [[0, 'shock']] }],
  over: () => <Bus x={-380} />,
});
export const F26: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.05]]))}>
    <Tabletop edge={1300} kind="stone" />
    <PizzaBox x={960} y={560} w={760} lid />
    <PizzaSlice x={1000} y={520} len={260} rot={-30} shadow={0} />
    <Arm look={MO} from={[2100, 300]} to={[kf(t, [[0, 1650], [len, 1450]]), 420]} rot={70} />
    <Arm look={JUNO} from={[-200, 900]} to={[kf(t, [[0, 420], [len, 560]]), 720]} rot={-110} />
  </g>
);
const K1 = stand(KITCHEN, 0.38, 0.4);
const K2 = stand(KITCHEN, 0.6, 0.4);
export const F27 = scene({
  set: () => sets.kitchen(0, true, 'f27'), cam: [960, 590, 1.8, 975, 590, 1.88],
  actors: [
    { look: JUNO, x: K1.x, feet: K1.y + LEG_LEN * K1.scale, scale: K1.scale, pose: { yaw: 0.35, look: 0.6 }, keys: [{ f: 10, p: { armR: { a: 70, b: 20 } } }, { f: 22, p: { armR: { a: 30, b: 90 } } }], face: [[0, 'puff']], shadow: 0 },
    { look: MO, x: K2.x, feet: K2.y + LEG_LEN * K2.scale, scale: K2.scale, pose: { yaw: -0.35, look: -0.6, armL: { a: 70, b: 10 } }, face: [[0, 'happy']], freeze: 0, rim: 'rimL', shadow: 0 },
  ],
  over: (t) => <>{sets.island()}<Frozen x={K2.x} y={K2.y - 200} t={t} r={120} /></>,
});
export const F28 = closeUp({ look: MO, face: [[0, 'happy'], [14, 'shock']], bg: (t) => sets.kitchen(t, false, 'f28'), bgT: 'translate(-820 -560) scale(2)', x: 1100, y: 540, sc: 3.4, yaw: -0.35, eyes: -0.7, rim: 'rimL', pose: { armL: { a: 80, b: 10 } } });
const RUNNERS = [OUT.lanes[0], OUT.lanes[1], OUT.lanes[2]];
const runners = (frozen: boolean, t0 = 0): Act[] => [MO, TEACHER, MUM].map((look, i) => ({
  look, x: OUT.start + 40, feet: RUNNERS[i], scale: 0.62, walk: { to: OUT.start + 900, t0, t1: t0 + 120, speed: 1.7 }, face: [[0, 'worried']], freeze: frozen ? 48 + i * 9 : undefined, shadow: 0.4,
}));
export const F29 = scene({
  set: (t) => sets.field(t, false, 'f29'), cam: [640, 800, 1.6, 680, 800, 1.68],
  actors: [...runners(false, 1000), { look: JUNO, x: OUT.start + 40, feet: OUT.lanes[1] + 20, scale: 0.62, pose: { yaw: 0.6 }, face: [[0, 'smug']] }],
});
export const F30 = closeUp({ look: TEACHER, face: [[0, 'puff']], bg: (t) => sets.field(t, false, 'f30'), bgT: 'translate(-800 -700) scale(2)', x: 900, y: 560, sc: 3.4, yaw: 0.3, rim: 'rimR',
  over: (t, len, h) => <><circle cx={h.x + 60} cy={h.y + 40} r={22} fill="#C9CED6" stroke="#2A2234" strokeWidth={5} /><FloatLabel x={h.x + 200} y={h.y - 80} t={t - 2} text="FWEEEE!" size={64} /></> });
export const F31 = scene({
  set: () => sets.field(0, true, 'f31'), cam: [900, 700, 1.15, 1100, 700, 1.2],
  actors: [...runners(true), { look: JUNO, x: OUT.start + 40, feet: OUT.lanes[1] + 20, scale: 0.62, walk: { to: OUT.finish - 60, t1: 90, speed: 0.8 }, face: [[0, 'puff']] }],
});
export const F32 = scene({
  set: (t) => sets.field(t, false, 'f32'), cam: [OUT.finish, 720, 2.2, OUT.finish, 720, 2.3],
  actors: [{ look: JUNO, x: OUT.finish - 40, feet: OUT.lanes[1] + 20, scale: 0.62, pose: { yaw: 0.3, tilt: 8, armL: { a: 30, b: 60 }, armR: { a: 30, b: 60 } }, face: [[0, 'tired'], [20, 'smug']] }],
});
export const F33 = scene({
  set: () => sets.field(0, true, 'f33'), cam: [960, 560, 0.85, 960, 560, 0.9],
  actors: [...runners(true), { look: JUNO, x: OUT.finish - 40, feet: OUT.lanes[1] + 20, scale: 0.62, pose: { yaw: 0.3, armL: { a: 150, b: 20 } }, face: [[0, 'happy']] }],
  over: (t) => <Frozen x={700} y={800} t={t} r={300} />,
});
export const F34 = scene({
  set: (t) => sets.kitchen(t, false, 'f34'), cam: [960, 590, 1.8, 960, 590, 1.86],
  actors: [
    { look: MUM, x: K2.x, feet: K2.y + LEG_LEN * K2.scale, scale: K2.scale, pose: { yaw: -0.35, look: -0.7, armL: { a: 40, b: 100 }, armR: { a: 40, b: 100 } }, face: [[0, 'worried']], rim: 'rimL', shadow: 0 },
    { look: JUNO, x: K1.x, feet: K1.y + LEG_LEN * K1.scale, scale: K1.scale, pose: { yaw: 0.35, look: 0.6 }, face: [[0, 'oops']], shadow: 0 },
  ],
  over: () => <>{sets.island()}<PlateTop x={960} y={640} r={60} /></>,
});
export const F35: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.05]]))}>
    <Tabletop edge={980} kind="stone" />
    <g transform="translate(960 780) scale(2.6) translate(-960 -780)"><Cat x={960} y={780} mood="sleep" f={0} /></g>
    {Array.from({ length: 14 }).map((_, i) => {
      const k = clamp((t - 6 - i) / 10);
      return <circle key={i} cx={lerp(1300 + (i % 4) * 30, 900 + (i % 5) * 40, k)} cy={lerp(560 + (i % 3) * 20, 700 + (i % 4) * 12, k)} r={7} fill="#B07A4A" />;
    })}
    <Arm look={JUNO} from={[2100, 200]} to={[kf(t, [[0, 1420], [20, 1060]]), 600]} rot={60} />
  </g>
);
export const F36 = scene({
  set: (t) => sets.kitchen(t, false, 'f36'), cam: [960, 590, 1.5, 960, 590, 1.56],
  actors: [
    { look: MUM, x: K2.x, feet: K2.y + LEG_LEN * K2.scale, scale: K2.scale, pose: { yaw: -0.35, look: 0.6, armL: { a: 40, b: 100 }, armR: { a: 40, b: 100 } }, face: [[0, 'worried'], [10, 'shock']], rim: 'rimL', shadow: 0 },
    { look: JUNO, x: K1.x, feet: K1.y + LEG_LEN * K1.scale, scale: K1.scale, pose: { yaw: 0.35, look: 0.6 }, face: [[0, 'happy']], shadow: 0 },
  ],
  over: (t) => <>{sets.island()}<Cat x={K2.x + 160} y={KITCHEN.P(0.75, 0.66, 0.45).y} mood={t > 8 ? 'alert' : 'sleep'} f={t} /></>,
});
export const F37: React.FC<ShotProps> = ({ t, len }) => {
  const wx = 980 + Math.sin(t / 1.6) * 30;
  const wy = 470 + Math.cos(t / 1.3) * 20;
  return (
    <g transform={camT(960, 590, kf(t, [[0, 1.7], [len, 1.8]]))}>
      <Tabletop edge={1000} />
      <Glow x={960} y={420} r={600} o={0.3} />
      {/* the sandwich, a wasp landing on it */}
      <ellipse cx={960} cy={640} rx={300} ry={60} fill="#000" opacity={0.2} />
      <path d="M 700 600 Q 960 520 1220 600 L 1220 640 Q 960 700 700 640 Z" fill="#E8C890" stroke="#9A7A4A" strokeWidth={6} />
      <path d="M 710 600 Q 960 560 1210 600" stroke="#6AA84F" strokeWidth={14} fill="none" />
      <path d="M 700 580 Q 960 480 1220 580 L 1220 600 Q 960 540 700 600 Z" fill="#F0D8A0" stroke="#9A7A4A" strokeWidth={6} />
      <g transform={`translate(${wx} ${wy})`}>
        <ellipse rx={34} ry={20} fill="#E9C46A" stroke="#1A1424" strokeWidth={5} />
        <path d="M -10 -20 L -10 20 M 8 -20 L 8 20" stroke="#1A1424" strokeWidth={7} />
        <ellipse cx={-6} cy={-30} rx={22} ry={12} fill="#DDEBF5" opacity={0.8} transform={`rotate(${Math.sin(t * 4) * 20} -6 -20)`} />
        <circle cx={38} cy={0} r={12} fill="#1A1424" />
      </g>
    </g>
  );
};
export const F38 = scene({
  set: () => sets.garden(0, true, 'f38'), cam: [700, 700, 1.3, 760, 700, 1.36],
  actors: [{ look: JUNO, x: 300, feet: OUT.feet, scale: 0.75, walk: { to: 900, t1: 60 }, face: [[0, 'puff']], pose: { armR: { a: 80, b: 30 } } }],
  over: (t) => {
    const x = lerp(300, 900, clamp(t / 60));
    return <g transform={`translate(${x + 70} ${OUT.feet - 150})`}><path d="M -40 0 Q 0 -20 40 0 L 40 10 Q 0 22 -40 10 Z" fill="#E8C890" stroke="#9A7A4A" strokeWidth={3} /><circle cx={4} cy={-14} r={7} fill="#E9C46A" stroke="#1A1424" strokeWidth={2} /></g>;
  },
});
export const F39 = scene({
  set: (t) => sets.roof(t, {}), cam: [960, 740, 1.6, 960, 740, 1.66],
  actors: [{ look: JUNO, x: 820, feet: 820, scale: 0.9, pose: { yaw: 0.4, armR: { a: 80, b: 20 } }, face: [[0, 'smug']] }],
  over: () => <g>{[0, 1].map((k) => <g key={k} transform={`translate(${1000 + k * 70} 780)`}><path d="M -30 0 L 30 0 L 34 -18 Q 10 -26 -10 -34 L -30 -30 Z" fill="#D9534F" stroke="#1A1424" strokeWidth={4} /><rect x={-32} y={-4} width={66} height={8} fill="#F3E6D6" /></g>)}</g>,
});
export const F40 = scene({
  set: (t) => sets.kitchen(t, false, 'f40'), cam: [1300, 470, 1.9, 1300, 470, 1.96],
  over: (t) => <Cat x={1330} y={KITCHEN.P(0.92, 0.0, 0.25).y + 30} mood="alert" f={t} />,
});
const MIR = { x: 1240, y: 330 };
export const F41 = scene({
  set: (t) => sets.bedroom(t, false, 'f41', '18:20'), cam: [1150, 520, 1.6, 1170, 520, 1.66],
  under: (t) => {
    const draw = clamp((t - 6) / 16);
    const hy = MIR.y + 470 - 176 * 1.2;
    return (
      <g>
        {/* the mirror: a frame, a cool pane, Juno's reflection, a moustache drawing on */}
        <rect x={MIR.x - 6} y={MIR.y - 6} width={292} height={392} rx={14} fill="#6A4A3A" />
        <rect x={MIR.x} y={MIR.y} width={280} height={380} rx={10} fill="#9FB4D6" />
        <clipPath id="mirclip"><rect x={MIR.x} y={MIR.y} width={280} height={380} rx={10} /></clipPath>
        <g clipPath="url(#mirclip)">
          <Hero look={JUNO} pose={{ ...basePose, x: MIR.x + 140, y: MIR.y + 470, scale: 1.2, yaw: -0.3, look: -0.5, expr: 'smug' }} shadow={0} rimId="rimL" />
          <path d={`M ${MIR.x + 96} ${hy + 38} q 20 -18 40 0 q 20 -18 40 0`} stroke="#1A1424" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={`${draw * 140} 200`} />
        </g>
      </g>
    );
  },
  actors: [bedroomJuno({ x: 980, pose: { yaw: 0.6, look: 1, armR: { a: 100, b: 30 }, handR: 'point' }, face: [[0, 'smug']] })],
});
export const F42 = card('f42', (t) => (
  <g>
    <WallCalendar x={960} y={150} w={560} crossed={Math.min(14, 6 + Math.floor(t / 3))} />
    <SchLabel x={960} y={930} t={t - 6} text="TWO WEEKS" size={52} color={SCH.live} />
  </g>
));
export const F43 = scene({
  set: (t) => sets.roof(t, { sunX: 960, sunY: 640 }), cam: [960, 520, 1.0, 960, 540, 1.06],
  actors: [{ look: JUNO, x: 960, feet: 820, scale: 0.62, keys: [{ f: 0, p: { armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } }, { f: 10, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut }], face: [[0, 'happy']] }],
  over: (t) => <><Sparkle x={800} y={520} t={t - 8} s={1.2} /><Sparkle x={1120} y={480} t={t - 14} s={1} /></>,
});
