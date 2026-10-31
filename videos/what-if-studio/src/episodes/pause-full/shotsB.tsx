import React from 'react';
import {
  basePose, kf, clamp, lerp, easeOut, easeIn, backOut, stand, BEDROOM, Tabletop, AlarmClock, WallCalendar, Dial, Gauge, Tag, Toast, FloatLabel,
  Sparkle, FocusRings, DizzyStars, SchLabel, DrawOn, Arrow, CountUp, SCH, Glow, Phone, OUT, LEG_LEN, Hero, camT, TitleCard, ShotProps, rnd,
} from '../../engine';
import { JUNO, MO, SIS, SUIT, ICE, Act, scene, closeUp, card, Frozen, Arm, sets } from './parts';

// Act 4 (the cost), act 5 (the Suit), act 6 (the pond), act 7 (the letter). Shots F44-F109.

const B = stand(BEDROOM, 0.62, 0.55);
const bJ = (o: Partial<Act> = {}): Act => ({ look: JUNO, x: B.x, feet: B.y + LEG_LEN * B.scale, scale: B.scale, pose: { yaw: 0.3, look: 0.4 }, rim: 'rimL', ...o });
const RED = '#FF6A5A';

// ---------- act 4: the cost ----------
export const F44 = scene({
  set: (t) => sets.bedroom(t, false, 'f44', '23:40'), cam: [B.x, B.y - 60, 1.4, B.x, B.y - 60, 1.48],
  actors: [bJ({ pose: { yaw: 0.2, look: -0.3, headTilt: 8, armL: { a: 20, b: 40 }, armR: { a: 20, b: 40 } }, face: [[0, 'worried']] })],
});
export const F45 = closeUp({
  look: JUNO, face: [[0, 'tired']], bg: (t) => sets.bedroom(t, false, 'f45b', '23:41'), bgT: 'translate(-600 -500) scale(2)', x: 960, y: 560, sc: 4.2, yaw: 0.1, rim: 'rimRed',
  over: (t, len, h) => <g transform={`translate(${h.x} ${h.y - 120}) scale(0.5) translate(${-h.x} ${-h.y + 120})`}>{[0, 10, 20].map((d) => <FocusRings key={d} x={h.x} y={h.y - 120} t={(t + d) % 18 + 1} color={RED} />)}</g>,
});
export const F46 = scene({
  set: (t) => sets.bedroom(t, false, 'f46', '23:42'), cam: [B.x, B.y - 90, 1.9, B.x, B.y - 90, 2.0],
  actors: [bJ({ pose: { yaw: 0.1, tilt: 12, headTilt: 10, armL: { a: 40, b: 90 }, armR: { a: 40, b: 90 } }, face: [[0, 'worried']], rim: 'rimRed' })],
  over: (t) => <Glow x={B.x} y={B.y - 60} r={140 + Math.sin(t / 3) * 20} kind="red" o={0.5} />,
});
export const F47 = card('f47', (t) => (
  <g>
    <SchLabel x={960} y={180} t={t} text="THE BURN COMES SOONER" size={52} />
    {[['1:00', 1], ['0:52', 0.86], ['0:45', 0.75]].map(([r, p], i) => (
      <g key={i} opacity={clamp((t - 4 - i * 8) / 6)}>
        <Dial x={480 + i * 480} y={540} r={170} p={p as number} readout={r as string} size={70} />
        <SchLabel x={480 + i * 480} y={780} t={t - 4 - i * 8} text={`DAY ${[1, 7, 14][i]}`} size={34} color={SCH.dim} />
      </g>
    ))}
  </g>
));
export const F48 = closeUp({
  look: JUNO, face: [[0, 'tired']], bg: (t) => sets.bedroom(t, false, 'f48b', '02:14'), bgT: 'translate(-400 -500) scale(2)', x: 820, y: 600, sc: 3.2, yaw: 0.2, eyes: 0.8, tilt: -70, rim: 'rimBlue',
  over: (t) => <AlarmClock x={1460} y={720} s={2.4} text="02:14" />,
});
export const F49: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.1], [len, 1.2]]))}>
    <rect x={-400} y={-400} width={2720} height={1880} fill="#14101C" />
    <Glow x={960} y={560} r={500} kind="cool" o={0.4} />
    <AlarmClock x={960} y={640} s={5} text={`02:1${4 + Math.min(5, Math.floor(t / 10))}`} />
    {['1', '2', '3', '4'].map((n, i) => <FloatLabel key={n} x={500 + i * 300} y={170} t={t - i * 8} text={n} size={70} color="#BFD8F0" />)}
  </g>
);
export const F50 = card('f50', (t) => <SchLabel x={960} y={580} t={t} text="WHY?" size={220} color={SCH.live} />);
const LUNGS = 'M 470 300 Q 400 300 360 420 Q 330 540 360 600 Q 400 640 460 600 Q 490 560 490 420 Z M 530 300 Q 600 300 640 420 Q 670 540 640 600 Q 600 640 540 600 Q 510 560 510 420 Z M 500 220 L 500 330';
export const F51 = card('f51', (t) => (
  <g>
    <g transform="translate(160 40) scale(1.2)"><DrawOn d={LUNGS} t={t} dur={10} width={6} /></g>
    <SchLabel x={1250} y={460} t={t - 6} text="O₂ RUNNING OUT?" size={64} />
    {t > 18 ? <path d="M 940 440 L 1560 480" stroke={RED} strokeWidth={12} strokeLinecap="round" /> : null}
    <SchLabel x={1250} y={600} t={t - 22} text="NOT THE ALARM" size={44} color={RED} />
  </g>
));
const Molecule: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 0 L 70 0" stroke={SCH.line} strokeWidth={8} />
    <circle cx={0} cy={0} r={40} fill="#1E2A3A" stroke={SCH.line} strokeWidth={6} />
    <circle cx={-80} cy={0} r={30} fill="#1E2A3A" stroke={SCH.live} strokeWidth={6} />
    <circle cx={80} cy={0} r={30} fill="#1E2A3A" stroke={SCH.live} strokeWidth={6} />
    <text x={0} y={12} textAnchor="middle" fontFamily="Fragment Mono" fontSize={30} fill={SCH.line}>C</text>
  </g>
);
export const F52 = card('f52', (t, len) => (
  <g>
    {Array.from({ length: 7 }).map((_, i) => (
      <g key={i} opacity={clamp((t - i * 5) / 6)}>
        <Molecule x={240 + (i % 3) * 380 + (Math.floor(i / 3) % 2) * 120} y={300 + Math.floor(i / 3) * 190 - t * 0.6} s={1.3} />
      </g>
    ))}
    <SchLabel x={560} y={860} t={t - 4} text="CARBON DIOXIDE" size={48} color={SCH.live} />
    <Gauge x={1300} y={500} p={clamp(t / len) * 0.92} label="CO₂ IN YOUR BLOOD" />
  </g>
));
const BRAIN = 'M 780 560 Q 760 400 900 380 Q 960 300 1060 360 Q 1180 340 1200 460 Q 1260 560 1160 620 Q 1100 700 980 660 Q 860 700 800 620 Z M 960 380 Q 940 480 990 560 M 1060 420 Q 1100 500 1060 600';
export const F53 = card('f53', (t) => (
  <g>
    <DrawOn d={BRAIN} t={t} dur={10} width={7} />
    {[0, 1, 2].map((k) => {
      const p = ((t + k * 10) % 30) / 30;
      return <circle key={k} cx={1000} cy={520} r={180 + p * 300} fill="none" stroke={RED} strokeWidth={6} opacity={(1 - p) * clamp((t - 10) / 6)} />;
    })}
    <SchLabel x={1000} y={900} t={t - 12} text="ALARM!" size={70} color={RED} />
  </g>
));
export const F54 = closeUp({ look: JUNO, face: [[0, 'shock']], bg: (t) => sets.bedroom(t, false, 'f54b', '23:50'), bgT: 'translate(-600 -500) scale(2)', x: 960, y: 600, sc: 6.2, yaw: 0.1, eyes: 0 });
export const F55 = scene({
  set: (t) => sets.bedroom(t, false, 'f55', '23:52'), cam: [B.x + 60, B.y - 120, 2.2, B.x + 60, B.y - 120, 2.3],
  actors: [bJ({ pose: { yaw: 0.35, look: 0.9, armR: { a: 50, b: 100 } }, face: [[0, 'neutral'], [16, 'smug']] })],
  over: (t) => <g transform={`translate(${B.x + 150} ${B.y - 260}) rotate(-12) scale(0.45)`}><Phone x={0} y={0} w={200} on={1} caller="TIP" /></g>,
});
export const F56 = scene({
  set: (t) => sets.bedroom(t, false, 'f56', '23:53'), cam: [B.x, B.y - 120, 2.0, B.x, B.y - 120, 2.05],
  actors: (t) => [bJ({ pose: { yaw: 0.2, squash: Math.sin(t * 0.9) * 0.05, armL: { a: 30, b: 40 }, armR: { a: 30, b: 40 } }, face: [[0, 'shock']] })],
  over: (t) => <>{[0, 9, 18, 27].map((d, i) => <FloatLabel key={i} x={B.x + 140 + (i % 2) * 40} y={B.y - 300} t={t - d} text="huff" size={44} color="#BFD8F0" />)}</>,
});
export const F57 = card('f57', (t, len) => {
  const s = Math.round(lerp(60, 95, easeOut(clamp(t / (len * 0.8)))));
  return (
    <g>
      <Dial x={960} y={500} r={240} p={Math.min(1, s / 95)} readout={`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`} size={110} />
      <SchLabel x={960} y={840} t={t - 6} text="NEW PERSONAL BEST" size={48} color={SCH.live} />
    </g>
  );
});
export const F58 = card('f58', (t, len) => {
  const sink = easeIn(clamp((t - 10) / (len - 10)));
  return (
    <g>
      {/* a pool in cross-section, a swimmer drifting down */}
      <rect x={360} y={300} width={1200} height={560} fill="#1E3A5A" stroke={SCH.line} strokeWidth={6} />
      <path d="M 360 340 Q 660 320 960 340 Q 1260 360 1560 340" stroke={SCH.line} strokeWidth={4} fill="none" />
      <g transform={`translate(${lerp(760, 880, sink)} ${lerp(420, 760, sink)}) rotate(${sink * 70})`}>
        <circle r={30} fill="none" stroke={SCH.line} strokeWidth={6} />
        <path d="M 0 30 L 0 110 M 0 60 L -50 90 M 0 60 L 50 90 M 0 110 L -30 170 M 0 110 L 30 170" stroke={SCH.line} strokeWidth={6} strokeLinecap="round" />
      </g>
      <SchLabel x={960} y={210} t={t - 2} text="HYPOXIC BLACKOUT" size={56} color={RED} />
      <SchLabel x={960} y={950} t={t - 14} text="NO WARNING" size={42} color={SCH.dim} />
    </g>
  );
});
export const F59 = card('f59', (t, len) => {
  const k = clamp(t / len);
  return (
    <g>
      <Gauge x={380} y={380} p={lerp(0.6, 0.15, clamp(t / 20))} label="CO₂ (THE ALARM)" />
      <Gauge x={380} y={620} p={lerp(0.9, 0.25, k)} label="OXYGEN" danger={0.3} />
      <SchLabel x={1460} y={420} t={t - 8} text="ALARM: LATE" size={48} color={RED} />
      <SchLabel x={1460} y={660} t={t - 30} text="OXYGEN: LOW" size={48} color={RED} />
    </g>
  );
});
export const F60 = closeUp({ look: JUNO, face: [[0, 'worried']], bg: (t) => sets.bedroom(t, false, 'f60b', '23:58'), bgT: 'translate(-600 -500) scale(2)', x: 900, y: 580, sc: 5.2, yaw: 0.25, eyes: 0.4, rim: 'rimRed' });
export const F61 = scene({
  set: (t) => sets.roof(t, { low: 200, sunX: 1250, sunY: 560 }), cam: [960, 540, 1.0, 960, 540, 1.06],
  actors: [{ look: JUNO, x: 820, feet: 790 + LEG_LEN * 1.8, scale: 1.8, pose: { yaw: 0.5, look: 0.8, armL: { a: 20, b: 30 }, armR: { a: 20, b: 30 } }, face: [[0, 'neutral'], [20, 'worried']], shadow: 0 }],
});
const crowd = (): Act[] => [
  { look: MO, x: 300, feet: OUT.feet, scale: 0.7, freeze: 18, walk: { to: 900, t1: 200 }, face: [[0, 'happy']] },
  { look: SUIT, x: 1700, feet: OUT.feet + 6, scale: 0.7, freeze: 30, walk: { to: 1000, t1: 200 }, face: [[0, 'neutral']] },
  { look: SIS, x: 1100, feet: OUT.feet, scale: 0.5, freeze: 0, pose: { armL: { a: 140, b: 10 } }, face: [[0, 'happy']] },
];
export const F62 = scene({
  set: () => sets.street(0, true, 'f62'), cam: [960, 600, 1.0, 960, 600, 1.05],
  actors: [...crowd(), { look: JUNO, x: 1500, feet: OUT.feet + 30, scale: 0.75, walk: { to: 600, t1: 80 }, face: [[0, 'puff']] }],
});
export const F63 = card('f63', (t) => (
  <g>
    <SchLabel x={960} y={200} t={t} text="+1 MINUTE  +1 MINUTE  +1 MINUTE" size={44} />
    {Array.from({ length: Math.min(30, Math.floor(t / 1.5)) }).map((_, i) => (
      <rect key={i} x={360 + (i % 10) * 124} y={360 + Math.floor(i / 10) * 140} width={100} height={100} rx={12} fill="none" stroke={SCH.live} strokeWidth={5} />
    ))}
  </g>
));
export const F64 = card('f64', (t) => (
  <g>
    <SchLabel x={960} y={150} t={t} text="100 PAUSES A DAY" size={52} />
    {Array.from({ length: Math.min(100, Math.floor(t * 2.2)) }).map((_, i) => (
      <g key={i} transform={`translate(${410 + (i % 20) * 56} ${260 + Math.floor(i / 20) * 110})`}>
        <rect x={-14} y={-24} width={10} height={48} fill={SCH.live} />
        <rect x={6} y={-24} width={10} height={48} fill={SCH.live} />
      </g>
    ))}
    <SchLabel x={960} y={900} t={t - 30} text="= 100 EXTRA MINUTES, EVERY DAY" size={44} color={SCH.dim} />
  </g>
));
export const F65 = card('f65', (t) => (
  <g>
    <CountUp x={960} y={560} t={t - 2} to={25} dur={24} size={300} />
    <SchLabel x={960} y={720} t={t - 10} text="EXTRA DAYS A YEAR" size={56} color={SCH.live} />
    <SchLabel x={960} y={820} t={t - 18} text="100 MIN × 365 = 36,500 MIN ≈ 25 DAYS" size={34} color={SCH.dim} />
  </g>
));
export const F66 = scene({
  set: (t) => sets.bedroom(t, false, 'f66', '07:10'), cam: [1150, 520, 1.6, 1170, 520, 1.7],
  under: () => {
    const M = { x: 1240, y: 330 };
    return (
      <g>
        <rect x={M.x - 6} y={M.y - 6} width={292} height={392} rx={14} fill="#6A4A3A" />
        <rect x={M.x} y={M.y} width={280} height={380} rx={10} fill="#9FB4D6" />
        <clipPath id="mirclip66"><rect x={M.x} y={M.y} width={280} height={380} rx={10} /></clipPath>
        <g clipPath="url(#mirclip66)">
          <Hero look={JUNO} pose={{ ...basePose, x: M.x + 140, y: M.y + 470, scale: 1.2, yaw: -0.3, look: -0.5, expr: 'tired' }} shadow={0} rimId="rimL" />
        </g>
      </g>
    );
  },
  actors: [bJ({ x: 980, pose: { yaw: 0.6, look: 1 }, face: [[0, 'worried']] })],
});

// ---------- act 5: the Suit ----------
export const F67 = scene({
  set: (t) => sets.street(t, false, 'f67'), cam: [1500, 640, 1.3, 1480, 640, 1.36],
  actors: [{ look: SUIT, x: 1540, feet: OUT.feet + 4, scale: 0.6, pose: { yaw: -0.3, look: -0.6 }, face: [[0, 'neutral']], rim: 'rimL' }],
  fg: <path d="M 900 1200 L 960 600 L 1010 600 L 1040 1200 Z" fill="#120C18" />,
});
export const F68 = scene({
  set: (t) => sets.street(t, false, 'f68'), cam: [1730, 680, 1.5, 1720, 680, 1.56],
  actors: [
    { look: SUIT, x: 1960, feet: OUT.feet + 4, scale: 0.75, pose: { yaw: -0.5, look: -0.9 }, face: [[0, 'neutral']], rim: 'rimL' },
    { look: JUNO, x: 1480, feet: OUT.feet + 30, scale: 0.75, walk: { to: 1640, t1: 40 }, face: [[0, 'worried']] },
  ],
});
export const F69 = scene({
  set: (t) => sets.street(t, false, 'f69', 0.15), cam: [1120, 600, 1.2, 1120, 600, 1.26],
  actors: [{ look: SUIT, x: 1350, feet: OUT.feet + 4, scale: 0.7, pose: { yaw: 0, look: 0 }, face: [[0, 'neutral']] }],
  fg: <g><rect x={-400} y={-400} width={700} height={1900} fill="#120C18" /><rect x={300} y={-400} width={60} height={1900} fill="#1E1626" /></g>,
});
export const F70 = closeUp({
  look: JUNO, face: [[0, 'neutral'], [16, 'worried']], bg: (t) => sets.kitchen(t, false, 'f70b'), bgT: 'translate(-700 -480) scale(2)', x: 640, y: 560, sc: 3.2, yaw: 0.3, eyes: 0.9,
  over: (t) => (
    <g>
      <g filter="url(#blur6)"><Hero look={SUIT} pose={{ ...basePose, x: 1450, y: 560 - 176 * 1.6 + 260, scale: 1.6, yaw: -0.3, look: -0.8, expr: 'neutral' }} shadow={0} rimId="rimL" /></g>
    </g>
  ),
});
const BENCH = OUT.bench;
const benchSit = (look: typeof JUNO, x: number, yaw: number, extra = {}): Act => ({
  look, x, feet: BENCH.seat + 10 + LEG_LEN * 0.75, scale: 0.75, pose: { yaw, look: yaw > 0 ? 0.8 : -0.8, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 }, ...extra }, rim: 'rimL', shadow: 0,
});
export const F71 = scene({
  set: (t) => sets.street(t, false, 'f71'), cam: [1350, 660, 1.7, 1350, 660, 1.78],
  actors: (t) => [benchSit(JUNO, 1300, 0.6), { ...benchSit(SUIT, 1420, -0.6), face: [[0, 'smug']] }],
  over: (t) => <g opacity={clamp((t - 30) / 6)} transform="translate(1360 790) rotate(-80) scale(0.2)"><Phone x={0} y={0} w={200} on={1} caller="CCTV" /></g>,
});
const PhoneFeed: React.FC<{ t: number; at: 'start' | 'finish'; frame: number }> = ({ t, at, frame }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [60, 1.06]]))}>
    <rect x={-400} y={-400} width={2720} height={1880} fill="#14101C" />
    <rect x={380} y={110} width={1160} height={860} rx={60} fill="#0A0A10" stroke="#2A2A34" strokeWidth={14} />
    <clipPath id={`feed${at}`}><rect x={420} y={150} width={1080} height={780} rx={30} /></clipPath>
    <g clipPath={`url(#feed${at})`}>
      <g transform="translate(420 150) scale(0.5625) translate(0 0)" filter="url(#blur3)">
        {sets.field(0, true, `pf${at}`)}
        <Hero look={JUNO} pose={{ ...basePose, x: at === 'start' ? OUT.start + 40 : OUT.finish - 40, y: OUT.lanes[1] + 20 - LEG_LEN * 0.62, scale: 0.62, yaw: 0.6 }} shadow={0} rimId="rimR" />
      </g>
      <rect x={420} y={150} width={1080} height={780} fill="#8FB0A0" opacity={0.18} />
      {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={420} y={150 + i * 26} width={1080} height={2} fill="#000" opacity={0.25} />)}
      <circle cx={at === 'start' ? 420 + (OUT.start + 40) * 0.5625 : 420 + (OUT.finish - 40) * 0.5625} cy={150 + (OUT.lanes[1] - 80) * 0.5625} r={60} fill="none" stroke={RED} strokeWidth={6} />
    </g>
    <text x={460} y={210} fontFamily="Fragment Mono" fontSize={34} fill="#F3E6D6">CAM 2 · SPORTS DAY</text>
    <text x={1460} y={210} textAnchor="end" fontFamily="Fragment Mono" fontSize={34} fill={RED}>{`FRAME ${frame}`}</text>
  </g>
);
export const F72: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.08]]))}>
    <Tabletop edge={1300} wood="#6A4A3A" grain="#5A3E30" />
    <g transform="translate(960 560) rotate(-6) scale(1.5)"><Phone x={0} y={0} w={200} on={1} caller="CCTV" /></g>
    <Arm look={SUIT} from={[2100, 900]} to={[kf(t, [[0, 1500], [14, 1240]]), 640]} rot={-100} />
  </g>
);
export const F73: React.FC<ShotProps> = ({ t }) => <PhoneFeed t={t} at="start" frame={1042} />;
export const F74: React.FC<ShotProps> = ({ t }) => <PhoneFeed t={t} at="finish" frame={1043} />;
export const F75 = closeUp({ look: SUIT, face: [[0, 'smug']], bg: (t) => sets.street(t, false, 'f75b'), bgT: 'translate(-1700 -800) scale(2)', x: 1100, y: 560, sc: 3.8, yaw: -0.3, eyes: -0.7, rim: 'rimL',
  over: () => <g filter="url(#blur10)"><Hero look={JUNO} pose={{ ...basePose, x: 300, y: 640 + 176 * 4, scale: 4, yaw: 0.6, expr: 'worried' }} shadow={0} rimId="rimR" /></g> });
export const F76 = closeUp({ look: SUIT, face: [[0, 'neutral']], bg: (t) => sets.street(t, false, 'f76b'), bgT: 'translate(-1700 -800) scale(2)', x: 960, y: 600, sc: 6.4, yaw: -0.1, eyes: 0, rim: 'rimL',
  over: (t) => <Tag x={1500} y={260} t={t - 4} text="JUNO" w={220} /> });
export const F77 = closeUp({ look: JUNO, face: [[0, 'shock']], bg: (t) => sets.street(t, false, 'f77b'), bgT: 'translate(-1500 -800) scale(2)', x: 940, y: 580, sc: 4.6, yaw: 0.3, eyes: 0.8 });
export const F78 = closeUp({ look: SUIT, face: [[0, 'smug']], bg: (t) => sets.street(t, false, 'f78b'), bgT: 'translate(-1700 -800) scale(2)', x: 760, y: 580, sc: 3.6, yaw: -0.2, rim: 'rimL',
  over: () => <Dial x={1420} y={420} r={170} p={0.97} readout="0:58" size={72} /> });
export const F79 = scene({
  set: (t) => sets.street(t, false, 'f79'), cam: [1360, 660, 1.9, 1360, 660, 2.0],
  actors: (t) => [benchSit(JUNO, 1300, 0.6, { tilt: -6 }), { ...benchSit(SUIT, 1420, -0.6, { tilt: -10 - clamp(t / 20) * 8 }), face: [[0, 'smug']] }],
});
export const F80 = closeUp({ look: JUNO, face: [[0, 'worried'], [5, 'puff']], bg: (t) => sets.street(t, false, 'f80b'), bgT: 'translate(-1500 -800) scale(2)', x: 960, y: 580, sc: 5, yaw: 0.2 });
export const F81 = scene({
  set: () => sets.street(0, true, 'f81'), cam: [1100, 640, 1.1, 800, 640, 1.15],
  actors: [
    { look: SUIT, x: 1420, feet: BENCH.seat + 10 + LEG_LEN * 0.75, scale: 0.75, pose: { yaw: -0.6, look: -0.8, tilt: -16, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 } }, face: [[0, 'smug']], freeze: 0, rim: 'rimL', shadow: 0 },
    { look: JUNO, x: 1260, feet: OUT.feet + 30, scale: 0.75, walk: { to: 200, t1: 70, speed: 1.8 }, face: [[0, 'puff']] },
  ],
  over: (t) => <Frozen x={1420} y={700} t={t} r={110} />,
});

// ---------- act 6: the pond ----------
const P = OUT.pond;
const sisPose = (o: Partial<Act> = {}): Act => ({ look: SIS, x: P.x - 360, feet: OUT.feet + 40, scale: 0.5, pose: { yaw: 0.6, look: 0.6 }, face: [[0, 'happy']], ...o });
const Ball: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 26 }) => (
  <g><circle cx={x} cy={y} r={r} fill="#F28C6A" stroke="#1A1424" strokeWidth={4} /><path d={`M ${x - r} ${y} Q ${x} ${y - r * 0.6} ${x + r} ${y}`} stroke="#F3E6D6" strokeWidth={4} fill="none" /></g>
);
export const F82 = scene({
  set: (t) => sets.garden(t, false, 'f82'), cam: [700, 620, 0.95, 720, 620, 1.0],
  actors: [{ look: JUNO, x: 250, feet: OUT.feet + 20, scale: 0.75, walk: { to: 520, t1: 40, speed: 0.9 }, face: [[0, 'tired']] }],
  over: (t) => <Ball x={P.x - 560 + Math.sin(t / 6) * 30} y={OUT.feet + 40} />,
});
export const F83 = scene({
  set: (t) => sets.garden(t, false, 'f83'), cam: [P.x - 420, 760, 1.8, P.x - 360, 760, 1.88],
  actors: (t) => [sisPose({ x: P.x - 640 + t * 2, walk: undefined, keys: [{ f: 0, p: { armL: { a: 120, b: 20 }, armR: { a: 120, b: 20 } } }] })],
  over: (t) => <Ball x={P.x - 470 + t * 2.2} y={OUT.feet + 40 - Math.abs(Math.sin(t / 5)) * 40} />,
});
export const F84 = closeUp({ look: SIS, face: [[0, 'happy']], bg: (t) => sets.garden(t, false, 'f84b'), bgT: 'translate(-1600 -1000) scale(2)', x: 960, y: 560, sc: 4.4, yaw: 0.3, eyes: 0.6 });
export const F85 = scene({
  set: (t) => sets.garden(t, false, 'f85'), cam: [P.x - 140, 800, 2.0, P.x - 120, 820, 2.1],
  actors: (t) => [sisPose({ x: P.x - 220, feet: OUT.feet + 40, keys: [{ f: 0, p: { tilt: 0 } }, { f: 8, p: { tilt: 30, spin: 20, armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 }, squash: -0.06 }, ease: easeIn }], face: [[0, 'happy'], [6, 'shock']] })],
});
export const F86: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(P.x, P.y - 40, kf(t, [[0, 2.6], [len, 2.8]]))}>
    {sets.garden(t, false, 'f86')}
    {Array.from({ length: 14 }).map((_, i) => {
      const k = clamp(t / 14);
      const a = (i / 14) * Math.PI;
      return <circle key={i} cx={P.x - 60 + Math.cos(a) * 160 * k} cy={P.y - 20 - Math.sin(a) * 120 * k + k * k * 80} r={8 * (1 - k * 0.6)} fill="#BFD8F0" opacity={1 - k} />;
    })}
    {[0, 1, 2].map((r) => <ellipse key={r} cx={P.x - 60} cy={P.y} rx={30 + ((t * 4 + r * 40) % 160)} ry={(30 + ((t * 4 + r * 40) % 160)) * 0.22} fill="none" stroke="#DDEBF5" strokeWidth={3} opacity={0.6} />)}
    {[0, 1, 2, 3].map((b) => <circle key={b} cx={P.x - 60 + Math.sin(t / 3 + b) * 20} cy={P.y - ((t * 3 + b * 25) % 60)} r={5} fill="#DDEBF5" opacity={0.7} />)}
  </g>
);
export const F87 = closeUp({ look: JUNO, face: [[0, 'tired']], bg: (t) => sets.garden(t, false, 'f87b'), bgT: 'translate(-300 -700) scale(2)', x: 960, y: 580, sc: 4.6, yaw: 0.25, eyes: 0.8, rim: 'rimRed', pose: { squash: 0.02 } });
export const F88 = closeUp({ look: JUNO, face: [[0, 'worried']], bg: (t) => sets.garden(t, false, 'f88b'), bgT: 'translate(-300 -700) scale(2)', x: 700, y: 580, sc: 3.6, yaw: 0.3, eyes: 0.9, rim: 'rimRed',
  over: (t) => <Dial x={1440} y={420} r={170} p={0.12} readout="0:07" size={72} /> });
export const F89: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(P.x, P.y - 40, kf(t, [[0, 2.8], [len, 3.0]]))}>
    {sets.garden(t, false, 'f89')}
    {[0, 1].map((b) => <circle key={b} cx={P.x - 60 + Math.sin(t / 3 + b) * 16} cy={P.y - ((t * 2 + b * 40) % 50)} r={4} fill="#DDEBF5" opacity={0.6} />)}
  </g>
);
export const F90 = closeUp({ look: JUNO, face: [[0, 'worried'], [6, 'puff']], bg: (t) => sets.garden(t, false, 'f90b', 0.2), bgT: 'translate(-300 -700) scale(2)', x: 960, y: 600, sc: 6.2, yaw: 0.1, eyes: 0.2, rim: 'rimRed', pose: { squash: -0.04 } });
export const F91 = scene({
  set: () => sets.garden(0, true, 'f91'), cam: [900, 640, 0.95, 920, 640, 1.0],
  actors: [{ look: JUNO, x: 520, feet: OUT.feet + 20, scale: 0.75, walk: { to: P.x - 260, t1: 40, speed: 1.6 }, face: [[0, 'puff']] }],
  over: (t) => <Frozen x={P.x - 60} y={P.y} t={t} r={120} />,
});
const FrozenSplash: React.FC<{ cx: number; cy: number; s?: number }> = ({ cx, cy, s = 1 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI;
      return <ellipse key={i} cx={Math.cos(a) * (110 + (i % 3) * 30)} cy={-Math.sin(a) * (90 + (i % 4) * 25)} rx={10} ry={14} fill="#BFD8F0" opacity={0.9} />;
    })}
    <path d="M -140 0 Q -100 -60 -60 -20 Q -20 -90 20 -20 Q 60 -70 100 -20 Q 130 -50 150 0 Z" fill="#9FC8E8" opacity={0.85} />
  </g>
);
export const F92: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(P.x - 60, P.y - 80, kf(t, [[0, 2.6], [len, 2.75]]))}>
    {sets.garden(0, true, 'f92')}
    <FrozenSplash cx={P.x - 60} cy={P.y} s={0.9} />
    <Frozen x={P.x - 60} y={P.y - 60} t={t} r={140} />
  </g>
);
export const F93: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(P.x - 60, P.y - 60, kf(t, [[0, 3.4], [len, 3.6]]))}>
    {sets.garden(0, true, 'f93')}
    <FrozenSplash cx={P.x - 60} cy={P.y} s={0.7} />
    {/* her arm and coral sleeve above the water, frozen, reaching up */}
    <path d={`M ${P.x - 70} ${P.y} L ${P.x - 60} ${P.y - 90}`} stroke={SIS.line} strokeWidth={22} strokeLinecap="round" />
    <path d={`M ${P.x - 70} ${P.y} L ${P.x - 60} ${P.y - 90}`} stroke={SIS.jacket} strokeWidth={16} strokeLinecap="round" />
    <circle cx={P.x - 60} cy={P.y - 100} r={14} fill={SIS.hand} stroke={SIS.line} strokeWidth={4} />
    <Frozen x={P.x - 60} y={P.y - 100} t={t} r={50} />
  </g>
);
export const F94 = scene({
  set: () => sets.garden(0, true, 'f94'), cam: [P.x - 200, 780, 1.9, P.x - 220, 780, 1.95],
  actors: (t) => [
    { look: JUNO, x: P.x - 300, feet: OUT.feet + 30, scale: 0.75, pose: { yaw: 0.6, tilt: 20, armR: { a: 90 + clamp(t / 30) * 40, b: 10 }, armL: { a: 80, b: 20 } }, face: [[0, 'puff']] },
    { look: SIS, x: lerp(P.x - 120, P.x - 230, clamp(t / 40)), feet: lerp(P.y + 60, OUT.feet + 40, clamp(t / 40)), scale: 0.5, pose: { yaw: -0.5, tilt: lerp(40, 10, clamp(t / 40)), armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, face: [[0, 'shock']], freeze: 0 },
  ],
  over: () => <FrozenSplash cx={P.x - 60} cy={P.y} s={0.6} />,
});
export const F95 = closeUp({ look: JUNO, face: [[0, 'puff']], bg: () => sets.garden(0, true, 'f95b'), bgT: 'translate(-300 -700) scale(2)', x: 760, y: 580, sc: 4.2, yaw: 0.3, rim: 'rimRed',
  over: (t) => <Dial x={1440} y={420} r={180} p={clamp(0.66 + t / 120)} readout={t < 25 ? '0:40' : '0:50'} size={78} /> });
export const F96: React.FC<ShotProps> = ({ t, len }) => {
  const C = closeUp({ look: JUNO, face: [[0, 'tired']], bg: () => sets.garden(0, true, 'f96b'), bgT: 'translate(-300 -700) scale(2)', x: 960, y: 600, sc: 6, yaw: 0.1, rim: 'rimRed' });
  const grey = clamp(t / len);
  return (
    <g>
      <C t={t} len={len} f={0} />
      <defs>
        <radialGradient id="tunnel96" cx="0.5" cy="0.5" r="0.75">
          <stop offset={`${70 - grey * 40}%`} stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#3A3A40" stopOpacity={0.95} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#tunnel96)" />
    </g>
  );
};
export const F97 = closeUp({ look: JUNO, face: [[0, 'tired'], [2, 'shock']], bg: (t) => sets.garden(t, false, 'f97b'), bgT: 'translate(-300 -700) scale(2)', x: 960, y: 600, sc: 5, yaw: 0.1, pose: { squash: -0.06 } });
export const F98 = scene({
  set: (t) => sets.garden(t, false, 'f98'), cam: [P.x - 300, 760, 1.8, P.x - 300, 760, 1.86],
  actors: (t) => [
    { look: JUNO, x: P.x - 380, feet: OUT.feet + 30, scale: 0.75, pose: { yaw: 0.4, armR: { a: 70, b: 40 }, armL: { a: 20, b: 10 } }, face: [[0, 'tired'], [20, 'happy']] },
    { look: SIS, x: P.x - 260, feet: OUT.feet + 34, scale: 0.5, pose: { yaw: -0.4, tilt: Math.max(0, Math.sin(t / 3)) * 10, headTilt: Math.sin(t / 3) * 8 }, face: [[0, 'oops'], [16, 'happy']] },
  ],
  over: (t) => <FloatLabel x={P.x - 230} y={OUT.feet - 160} t={t - 2} text="*cough*" size={40} color="#BFD8F0" />,
});
export const F99 = closeUp({ look: JUNO, face: [[0, 'happy']], bg: (t) => sets.garden(t, false, 'f99b'), bgT: 'translate(-300 -700) scale(2)', x: 900, y: 580, sc: 4.6, yaw: 0.3, eyes: 0.6 });
export const F100 = scene({
  set: (t) => sets.garden(t, false, 'f100'), cam: [960, 640, 1.1, 1000, 640, 1.18],
  actors: [
    { look: JUNO, x: P.x - 380, feet: OUT.feet + 30, scale: 0.75, pose: { yaw: 0.4 }, face: [[0, 'happy']] },
    { look: SIS, x: P.x - 260, feet: OUT.feet + 34, scale: 0.5, pose: { yaw: -0.4 }, face: [[0, 'happy']] },
  ],
  over: (t) => <g opacity={clamp((t - 30) / 6)}><circle cx={1520} cy={640} r={18} fill="#0A0A10" /><circle cx={1526} cy={634} r={6} fill="#FFFFFF" /><Glow x={1520} y={640} r={60} kind="cool" o={0.8} /></g>,
});
export const F101: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
    {/* through the fence slats: a lens, a gloved hand, a red recording light */}
    <rect x={-400} y={-400} width={2720} height={1880} fill="#1A1222" />
    <circle cx={960} cy={560} r={300} fill="#0A0A10" stroke="#2A2A34" strokeWidth={30} />
    <circle cx={960} cy={560} r={200} fill="#14141E" />
    <circle cx={900} cy={500} r={60} fill="#FFFFFF" opacity={0.25} />
    <circle cx={1360} cy={260} r={18} fill={t % 10 < 5 ? '#FF3A3A' : '#5A1A1A'} />
    {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={-400 + i * 420} y={-400} width={260} height={1880} fill="#5A4034" opacity={i === 3 ? 0 : 0.95} />)}
  </g>
);

// ---------- act 7: the letter ----------
export const F102: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 640, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-400} y={-400} width={2720} height={1880} fill="#3A2C40" />
    <rect x={560} y={-200} width={800} height={1000} fill="#5A3E3A" stroke="#2A1E22" strokeWidth={16} />
    <rect x={-400} y={800} width={2720} height={700} fill="#6A5048" />
    <Glow x={960} y={840} r={500} kind="warm" o={0.5} />
    {/* the letter sliding in under the door */}
    <g transform={`translate(${kf(t, [[0, 960], [20, 960]])} ${kf(t, [[0, 790], [18, 880]])}) rotate(-4)`}>
      <rect x={-200} y={-60} width={400} height={130} fill="#F3E6D6" stroke="#B8A890" strokeWidth={4} />
    </g>
  </g>
);
export const F103: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.05]]))}>
    <Tabletop edge={1300} wood="#6A5048" grain="#5A4038" />
    <g transform="translate(960 540) rotate(-5)">
      <rect x={-420} y={-260} width={840} height={520} fill="#F3E6D6" stroke="#B8A890" strokeWidth={6} />
      <path d="M -420 -260 L 0 40 L 420 -260" stroke="#B8A890" strokeWidth={6} fill="none" />
      <rect x={250} y={-220} width={120} height={150} fill="none" stroke="#C8B8A0" strokeWidth={5} strokeDasharray="14 10" />
    </g>
    <SchLabel x={1240} y={220} t={t - 2} text="NO STAMP" size={44} color="#F3E6D6" />
    <SchLabel x={700} y={900} t={t - 16} text="NO NAME" size={44} color="#F3E6D6" />
  </g>
);
export const F104: React.FC<ShotProps> = ({ t, len }) => {
  const line = 'How long can you hold your breath, Juno?';
  const n = Math.floor(clamp((t - 4) / 50) * line.length);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1], [len, 1.06]]))}>
      <rect x={-400} y={-400} width={2720} height={1880} fill="#2A2030" />
      <rect x={360} y={160} width={1200} height={760} fill="#F3E6D6" transform="rotate(-2 960 540)" />
      <text x={960} y={500} textAnchor="middle" fontFamily="Kalam" fontWeight={700} fontSize={64} fill="#2A2234" transform="rotate(-2 960 540)">{line.slice(0, n)}</text>
      <text x={960} y={640} textAnchor="middle" fontFamily="Kalam" fontSize={52} fill="#2A2234" opacity={clamp((t - 56) / 8)} transform="rotate(-2 960 540)">We'd like to find out.</text>
    </g>
  );
};
export const F105 = closeUp({ look: JUNO, face: [[0, 'shock']], bg: (t) => sets.bedroom(t, false, 'f105b', '07:00'), bgT: 'translate(-600 -500) scale(2)', x: 960, y: 600, sc: 6.4, yaw: 0, eyes: 0, rim: 'rimRed' });
export const F106: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, kf(t, [[0, 520], [len, 540]]), kf(t, [[0, 1.0], [len, 1.05]]))}>
    {sets.roof(t, { red: 0.8, sunX: 960, sunY: 650, clock: true, spin: 156 })}
    <Hero look={JUNO} pose={{ ...basePose, x: 960, y: 820 - LEG_LEN * 0.62, scale: 0.62, expr: 'worried' }} shadow={0.6} rimId="rimRed" />
    <TitleCard t={t} lines={['PART 1 OF 2', 'HOLD YOUR BREATH']} accent="BREATH" accentT={14} size={110} />
  </g>
);
export const F107 = scene({
  set: (t) => sets.roof(t, { low: 260, red: 0.7, sunX: 1180, sunY: 470, clock: true }), cam: [940, 540, 1.0, 900, 470, 1.25],
  actors: [{ look: JUNO, x: 900, feet: 800 + LEG_LEN * 1.9, scale: 1.9, pose: { yaw: -0.15, look: 0.4, armL: { a: 22, b: 30 }, armR: { a: 22, b: 30 } }, face: [[0, 'puff']], rim: 'rimRed', shadow: 0 }],
  over: (t) => <><Dial x={1480} y={330} r={110} p={0.5} readout={`0:${String(Math.min(59, Math.floor(t / 3))).padStart(2, '0')}`} size={44} /><Toast x={960} y={980} t={t - 20} text="TELL US IN THE COMMENTS" hold={200} /></>,
});
export const F108 = card('f108', (t) => (
  <g>
    <SchLabel x={960} y={420} t={t} text="NEVER HOLD YOUR BREATH" size={80} color={RED} />
    <SchLabel x={960} y={540} t={t - 6} text="UNDERWATER, OR ALONE." size={80} color={RED} />
    <SchLabel x={960} y={720} t={t - 14} text="HYPOXIC BLACKOUT HAS NO WARNING SIGNS." size={40} color={SCH.dim} />
  </g>
));
export const F109: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.04]]))}>
    {sets.roof(t, { sunX: 960, sunY: 640 })}
    <Hero look={JUNO} pose={{ ...basePose, x: 960, y: 820 - LEG_LEN * 0.62, scale: 0.62, expr: 'happy', armR: { a: 150, b: 20 } }} shadow={0.6} rimId="rimR" />
    <TitleCard t={t} lines={['PART 2', 'COMING SOON']} accent="SOON" accentT={10} size={120} />
    <Toast x={960} y={980} t={t - 14} text="SUBSCRIBE SO YOU DON'T MISS IT" hold={400} />
  </g>
);
