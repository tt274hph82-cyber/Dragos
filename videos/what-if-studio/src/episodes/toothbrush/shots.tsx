import React from 'react';
import { Hero, Pose, basePose, poseAt, faceAt, kf, clamp, lerp, easeOut, LEG_LEN, HEAD, DrawOn, Glow, Kitchen, ShotProps, joints, toWorld } from '../../engine';
import { closeUp } from '../pause-full/parts';
import { COSTEL, INK, SIL, Bold, Sky, Roofs, camV } from '../fountain-pen/shots';

// "Who invented the toothbrush?" with Nea Costel. A new intro: he's caught brushing his teeth in the kitchen. Then
// Tang China on parchment, a London riot at dusk, William Addis in a cell making a brush from a bone, the 1780
// workshop, and today. Key content stays in the centre column for the 9:16 crop.

type P = { x: number; y: number };
const BRUSH = '#3FA9F5';

/** A modern toothbrush: handle along the direction (dx, dy) from the grip point, head and bristles at the far end. */
const Toothbrush: React.FC<{ at: P; ang: number; s?: number; len?: number }> = ({ at, ang, s = 1, len = 150 }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${ang}) scale(${s})`}>
    <rect x={-10} y={-8} width={len} height={16} rx={8} fill={BRUSH} stroke={INK} strokeWidth={3} />
    <rect x={len - 32} y={-26} width={30} height={20} rx={3} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
  </g>
);
/** Held in the fist, the head in the mouth: drawn from the grip to the mouth whatever the arm's length. */
const BrushInMouth: React.FC<{ hand: P; mouth: P; s: number }> = ({ hand, mouth, s }) => {
  const d = Math.hypot(mouth.x - hand.x, mouth.y - hand.y) / s;
  return <Toothbrush at={hand} ang={(Math.atan2(mouth.y - hand.y, mouth.x - hand.x) * 180) / Math.PI} s={s} len={d + 14} />;
};
const Foam: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <g fill="#FFFFFF" stroke="#C9D6E2" strokeWidth={1.5}>
    {[[-22, 0, 9], [-8, 6, 11], [8, 4, 10], [22, -2, 8], [0, 14, 7], [-16, 14, 6]].map(([dx, dy, r], i) => (
      <circle key={i} cx={x + dx * s} cy={y + (dy + Math.sin(t * 0.6 + i) * 1.5) * s} r={r * s} />
    ))}
  </g>
);

// ---------- the kitchen intro: he stands at the worktop, brushing; on "Who invented" he turns to us ----------
const hostK = (o: Partial<Pose>): Pose => ({ ...basePose, x: 960, y: 960 - LEG_LEN * 1.4, scale: 1.4, ...o });
const brushingPose = (t: number, turn: number): Pose => {
  const scrub = Math.sin(t * 1.6) * 8;
  return hostK({ yaw: lerp(0.7, 0.05, turn), look: lerp(0.9, 0, turn), armR: { a: 150 + scrub, b: 120 }, armL: { a: 10, b: -10 } });
};
const handOf = (p: Pose) => toWorld(p, joints(p).armR.end);
const mouthOf = (p: Pose) => ({ x: p.x + p.yaw * 30 * p.scale, y: p.y + (HEAD.y + 30) * p.scale });

export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const turn = easeOut(clamp((t - 6) / 10));
  const p = { ...brushingPose(t, turn), ...faceAt(t, [[0, 'happy'], [14, 'shock']]) };
  const hand = handOf(p), mouth = mouthOf(p);
  return (
    <g transform={camV(960, kf(t, [[0, 560], [len, 520]]), kf(t, [[0, 1.05], [len, 1.18]]))}>
      <Kitchen t={t + 30} id="tb1" veil={0.3} />
      <Hero look={COSTEL} pose={p} shadow={0.7} />
      <BrushInMouth hand={hand} mouth={mouth} s={1.3} />
      <Foam x={mouth.x} y={mouth.y} s={1.35} t={t} />
      <Bold x={960} y={170} t={t - 4} text="WHO INVENTED THE" size={52} />
      <Bold x={960} y={290} t={t - 12} text="TOOTHBRUSH?" size={70} fill="#FFD24A" rot={-3} />
    </g>
  );
};

// ---------- S2: close-up, foam on the moustache: "A dentist? Nope." ----------
const S2C = closeUp({
  look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'smug'], [30, 'oops']], bg: (t) => <Kitchen t={t} id="tb2b" veil={0.3} />, x: 960, y: 560, sc: 4.6, yaw: 0.1, eyes: 0.4,
  over: (t, _len, h) => <Foam x={h.x + 3 * h.sc} y={h.y + 30 * h.sc} s={h.sc * 0.9} t={t} />,
});
export const S2: React.FC<ShotProps> = (p) => (
  <g>
    <S2C {...p} />
    <Bold x={960} y={170} t={p.t - 2} text="A DENTIST?" size={84} />
    <Bold x={960} y={1000} t={p.t - 30} text="NOPE." size={120} fill="#FFD24A" rot={4} />
  </g>
);

// ---------- S3: insert, Tang China on parchment: a bamboo-handled bristle brush draws itself ----------
const SEPIA = '#5A3A1E';
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#3A1A14" />
    <rect x={600} y={80} width={720} height={920} fill="#E8D3A6" />
    <rect x={600} y={80} width={720} height={920} fill="none" stroke="#A8322A" strokeWidth={10} />
    <DrawOn d="M 760 760 L 1120 400 M 778 778 L 1138 418" t={t} dur={12} color={SEPIA} width={6} />
    <DrawOn d="M 830 690 L 850 710 M 930 590 L 950 610 M 1030 490 L 1050 510" t={t - 8} dur={6} color={SEPIA} width={4} />
    {Array.from({ length: 9 }, (_, i) => {
      const k = clamp((t - 14 - i) / 4);
      const bx = 1110 + i * 4, by = 410 - i * 4;
      return <path key={i} d={`M ${bx} ${by} l ${-30 * k} ${-30 * k}`} stroke="#2A1A10" strokeWidth={5} strokeLinecap="round" />;
    })}
    <Bold x={960} y={170} t={t - 4} text="CHINA" size={100} />
    <Bold x={960} y={1000} t={t - 16} text="1,000+ YEARS AGO" size={60} fill="#FFD24A" />
  </g>
);

// ---------- S4: wide, London 1770 at dusk: a dome over the rooftops, a riot in the street ----------
const Dome: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK}>
    <rect x={-160} y={-120} width={320} height={260} />
    <rect x={-120} y={-200} width={240} height={90} />
    <path d="M -110 -200 Q -110 -360 0 -370 Q 110 -360 110 -200 Z" />
    <rect x={-14} y={-430} width={28} height={70} />
    <circle cx={0} cy={-440} r={14} />
    {[-130, 130].map((dx) => <rect key={dx} x={dx - 30} y={-240} width={60} height={140} />)}
  </g>
);
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, kf(t, [[0, 520], [len, 560]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
    <Sky id="tb4" sunY={720} />
    <Dome x={960} y={780} s={0.9} />
    <Roofs y={220} />
    <rect x={-400} y={970} width={2720} height={400} fill={INK} />
    {[660, 740, 820, 900, 1020, 1100, 1180, 1260].map((x, i) => {
      const w = Math.sin(t * 0.5 + i * 1.3) * 25;
      return (
        <g key={x}>
          <Hero look={SIL} pose={{ ...basePose, x, y: 990 - LEG_LEN * 0.45, scale: 0.45, yaw: i % 2 ? 0.4 : -0.4, armR: { a: 150 + w, b: 10 }, armL: { a: 30 - w * 0.4, b: 20 } }} shadow={0} rimId="none" />
          {i % 3 === 0 ? <Glow x={x + 30} y={990 - LEG_LEN * 0.45 - 120} r={70} kind="warm" o={0.8} /> : null}
        </g>
      );
    })}
    <Bold x={960} y={160} t={t - 4} text="LONDON" size={100} />
    <Bold x={960} y={280} t={t - 12} text="1770" size={120} fill="#FFD24A" />
  </g>
);

// ---------- S5: medium, the cell: stone wall, a barred window, moonlight; Addis sits on the bench ----------
const Cell: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#1E2236" />
    {Array.from({ length: 12 }, (_, r) => Array.from({ length: 14 }, (_, c) => (
      <rect key={`${r}-${c}`} x={-100 + c * 160 + (r % 2) * 80} y={-60 + r * 100} width={150} height={92} rx={8} fill="#262B42" />
    )))}
    <rect x={860} y={200} width={200} height={220} fill="#9FB6E0" />
    {[900, 940, 980, 1020].map((x) => <rect key={x} x={x - 6} y={200} width={12} height={220} fill="#10131F" />)}
    <path d="M 860 420 L 1060 420 L 1260 1000 L 700 1000 Z" fill="#9FB6E0" opacity={0.12} />
    <rect x={-200} y={940} width={2400} height={400} fill="#121522" />
    <rect x={720} y={820} width={480} height={36} fill="#3A2E28" />
  </g>
);
const seated: Partial<Pose> = { legL: { a: 90, b: -90 }, legR: { a: 80, b: -80 }, yaw: 0.6, look: 0.8, headTilt: 14 };
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, kf(t, [[0, 560], [len, 600]]), kf(t, [[0, 1.0], [len, 1.1]]))}>
    <Cell t={t} />
    <Hero look={SIL} pose={{ ...basePose, x: 900, y: 820 - LEG_LEN * 0.8 + 70, scale: 0.8, ...seated, armR: { a: 25, b: 55 }, armL: { a: 20, b: 50 } }} shadow={0} rimId="none" />
    <Bold x={960} y={160} t={t - 4} text="WILLIAM ADDIS" size={72} fill="#FFD24A" />
    <Bold x={960} y={1000} t={t - 40} text="THE RIOTER" size={70} />
  </g>
);

// ---------- S6 / S7: inserts on the cell table: holes drilled into a bone, then bristles tied in ----------
const HOLES = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 1030 + (i % 3) * 34, y: 520 + Math.floor(i / 3) * 34 }));
const Bone: React.FC<{ holes: number; tufts: number }> = ({ holes, tufts }) => (
  <g>
    <path d="M 720 560 Q 700 520 740 510 Q 780 500 790 530 L 1000 520 Q 1010 480 1060 480 Q 1120 480 1150 520 Q 1160 560 1150 590 Q 1120 630 1060 620 Q 1010 615 1000 580 L 790 590 Q 780 620 740 612 Q 700 604 720 560 Z" fill="#EFE6CF" stroke="#6B5A40" strokeWidth={6} />
    {HOLES.slice(0, holes).map((h, i) => <circle key={i} cx={h.x} cy={h.y} r={7} fill="#3A2E20" />)}
    {HOLES.slice(0, tufts).map((h, i) => (
      <g key={`t${i}`} stroke="#F4E9D0" strokeWidth={4} strokeLinecap="round">
        {[-6, 0, 6].map((d) => <path key={d} d={`M ${h.x} ${h.y} l ${d} -46`} />)}
      </g>
    ))}
  </g>
);
const Table: React.FC = () => (
  <g>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#4A3426" />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M -200 ${80 + i * 140} L 2200 ${110 + i * 140}`} stroke="#3C2A1E" strokeWidth={6} />)}
    <Glow x={960} y={400} r={700} kind="cool" o={0.25} />
  </g>
);
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const holes = Math.min(6, Math.floor(t / 7));
  const h = HOLES[Math.min(5, holes)];
  const wob = Math.sin(t * 2.2) * 6;
  return (
    <g transform={camV(960, 560, kf(t, [[0, 1.15], [len, 1.25]]))}>
      <Table />
      <Bone holes={holes} tufts={0} />
      {/* the awl, turning in the next hole */}
      <g transform={`translate(${h.x} ${h.y}) rotate(${-30 + wob})`}>
        <rect x={-4} y={-120} width={8} height={120} fill="#B8BCC4" />
        <rect x={-14} y={-210} width={28} height={92} rx={10} fill="#6B4A26" stroke={INK} strokeWidth={3} />
      </g>
      <Bold x={960} y={240} t={t - 2} text="THE STORY GOES..." size={60} />
    </g>
  );
};
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, 540, kf(t, [[0, 1.25], [len, 1.12]]))}>
    <Table />
    <Bone holes={6} tufts={Math.min(6, Math.floor(t / 5))} />
    <Bold x={960} y={220} t={t - 30} text="THE FIRST" size={70} />
    <Bold x={960} y={330} t={t - 34} text="TOOTHBRUSH!" size={70} fill="#FFD24A" />
  </g>
);

// ---------- S8: wide, the 1780 workshop: a bench, racks of bone brushes, workers at their stools ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(kf(t, [[0, 900], [len, 1020]]), 560, 1.05)}>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#5A3A24" />
    <Glow x={960} y={380} r={800} kind="warm" o={0.45} />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={420} y={300 + r * 150} width={1080} height={14} fill="#3A2416" />
        {Array.from({ length: 22 }, (_, i) => (
          <g key={i} transform={`translate(${450 + i * 48} ${300 + r * 150}) rotate(-90)`}>
            <rect x={0} y={-5} width={90} height={10} rx={4} fill="#EFE6CF" />
            <rect x={70} y={-9} width={22} height={18} fill="#F4E9D0" />
          </g>
        ))}
      </g>
    ))}
    <rect x={300} y={820} width={1320} height={40} fill="#3A2416" />
    <rect x={-200} y={960} width={2400} height={400} fill="#2A1A10" />
    {[640, 960, 1280].map((x, i) => (
      <Hero key={x} look={SIL} pose={{ ...basePose, x, y: 960 - LEG_LEN * 0.6, scale: 0.6, yaw: 0.2, headTilt: 12, armR: { a: 60 + Math.sin(t * 0.8 + i) * 15, b: 70 }, armL: { a: 50, b: 60 } }} shadow={0} rimId="none" />
    ))}
    <Bold x={960} y={170} t={t - 4} text="1780" size={130} fill="#FFD24A" />
    <Bold x={960} y={1000} t={t - 14} text="IN BUSINESS" size={70} />
  </g>
);

// ---------- S9: card, today: a modern brush pops on, the company still going ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const s = easeOut(clamp(t / 10));
  return (
    <g transform={camV(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <defs>
        <radialGradient id="tb9g" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#4FB3FF" />
          <stop offset="100%" stopColor="#123A6A" />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200} width={2400} height={1500} fill="url(#tb9g)" />
      <g transform={`translate(960 560) rotate(-30) scale(${2.4 * s})`}>
        <Toothbrush at={{ x: -70, y: 0 }} ang={0} />
      </g>
      <Bold x={960} y={170} t={t - 2} text="STILL MAKING" size={66} />
      <Bold x={960} y={280} t={t - 8} text="TOOTHBRUSHES" size={64} fill="#FFD24A" />
      <Bold x={960} y={1000} t={t - 16} text="240+ YEARS LATER" size={60} />
    </g>
  );
};

// ---------- S10: close-up, "So every morning...": he leans in, brush in hand ----------
const S10C = closeUp({ look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'smug']], bg: (t) => <Kitchen t={t} id="tb10b" veil={0.3} />, x: 960, y: 600, sc: 5.4, yaw: -0.1, eyes: -0.2, tilt: -8 });
export const S10: React.FC<ShotProps> = (p) => (
  <g>
    <S10C {...p} />
    <Bold x={960} y={180} t={p.t - 4} text="EVERY MORNING..." size={56} />
  </g>
);

// ---------- S11: medium, back in the kitchen: he raises the toothbrush like a torch and laughs ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const p0 = poseAt(t, [
    { f: 0, p: hostK({ yaw: 0.1, armR: { a: 100, b: 30 } }) },
    { f: 10, p: hostK({ yaw: 0.1, armR: { a: 135, b: -25 }, armL: { a: 30, b: 50 }, headTilt: 8, squash: -0.03 }) },
  ]);
  const p = { ...p0, ...faceAt(t, [[0, 'happy'], [10, 'laugh']]) };
  const hand = handOf(p);
  return (
    <g transform={camV(960, kf(t, [[0, 560], [len, 520]]), kf(t, [[0, 1.05], [len, 1.15]]))}>
      <Kitchen t={t + 60} id="tb11" veil={0.3} />
      <Glow x={hand.x} y={hand.y - 80} r={180} kind="warm" o={0.6 * clamp(t / 10)} />
      <Hero look={COSTEL} pose={p} shadow={0.7} />
      <Toothbrush at={hand} ang={-90} s={1.3} />
      <Bold x={960} y={170} t={t - 4} text="A RIOTER'S" size={80} />
      <Bold x={960} y={290} t={t - 8} text="IDEA!" size={120} fill="#FFD24A" />
    </g>
  );
};

// ---------- cold open S12: the iron door slams shut on him ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const shut = easeOut(clamp((t - 1) / 5));
  return (
    <g transform={camV(960, 560, kf(t, [[0, 1.1], [len, 1.0]]))}>
      <Cell t={t} />
      <Hero look={SIL} pose={{ ...basePose, x: 960, y: 940 - LEG_LEN * 0.85, scale: 0.85, yaw: 0, headTilt: 18, armL: { a: 12, b: -6 }, armR: { a: 12, b: -6 } }} shadow={0} rimId="none" />
      {/* the barred door slides in from the left and bangs shut */}
      <g transform={`translate(${lerp(-900, 0, shut)} 0)`}>
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={500 + i * 92} y={-100} width={22} height={1300} fill="#0B0D16" />)}
        <rect x={480} y={240} width={940} height={22} fill="#0B0D16" />
        <rect x={480} y={760} width={940} height={22} fill="#0B0D16" />
      </g>
      <Bold x={960} y={170} t={t - 6} text="LOCKED UP" size={100} fill="#FFD24A" />
    </g>
  );
};

// ---------- cold open S13: a bone from his dinner, lit by the moon through the bars ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, 560, kf(t, [[0, 1.0], [len, 1.2]]))}>
    <Table />
    <Glow x={960} y={560} r={360} kind="cool" o={0.5} />
    <Bone holes={0} tufts={0} />
    {/* bar shadows across the table */}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={640 + i * 200} y={-200} width={50} height={1500} fill="#000" opacity={0.25} transform="skewX(-20)" />)}
    <Bold x={960} y={200} t={t - 4} text="A BONE." size={110} />
  </g>
);

// ---------- cold open S14: the bone brush glows and becomes the toothbrush in your bathroom ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const morph = clamp((t - 20) / 14);
  return (
    <g transform={camV(960, 560, kf(t, [[0, 1.2], [len, 1.05]]))}>
      <Table />
      <Glow x={1090} y={540} r={300 + 120 * morph} kind="warm" o={0.4 + 0.4 * morph} />
      <g opacity={1 - morph}><Bone holes={6} tufts={Math.min(6, Math.floor(t / 3))} /></g>
      <g opacity={morph} transform={`translate(960 560) rotate(-12) scale(${2.2 + 0.3 * morph})`}>
        <Toothbrush at={{ x: -80, y: 0 }} ang={0} />
      </g>
      <Bold x={960} y={200} t={t - 18} text="IN YOUR BATHROOM" size={50} />
      <Bold x={960} y={300} t={t - 24} text="RIGHT NOW" size={96} fill="#FFD24A" />
    </g>
  );
};
