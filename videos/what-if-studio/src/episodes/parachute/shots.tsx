import React from 'react';
import { Hero, Pose, HEAD, basePose, poseAt, faceAt, kf, clamp, lerp, easeOut, LEG_LEN, DrawOn, Glow, ShotProps } from '../../engine';
import { closeUp } from '../pause-full/parts';
import { COSTEL, INK, SIL, Bold, Sky, Roofs, Cathedral, corner, hostPose, camV } from '../fountain-pen/shots';

// "Who invented the parachute?" with Nea Costel. Leonardo's sketch, then Garnerin's 1797 jump over Paris in silhouette
// against the dusk, then the 2000 test of Leonardo's design in a daytime sky. Key content stays in the centre column
// so the 9:16 crop reads.

const NET = '#3A2442';

/** A hydrogen balloon: a dark sphere in a rope net, a neck at the bottom. */
const Balloon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={150} fill={INK} />
    {[-110, -60, 0, 60, 110].map((dx) => (
      <path key={dx} d={`M ${dx * 0.2} -150 Q ${dx * 1.3} 0 ${dx * 0.35} 150`} stroke={NET} strokeWidth={3} fill="none" />
    ))}
    {[-90, -30, 30, 90].map((dy) => <path key={dy} d={`M ${-Math.sqrt(150 * 150 - dy * dy)} ${dy} Q 0 ${dy + 26} ${Math.sqrt(150 * 150 - dy * dy)} ${dy}`} stroke={NET} strokeWidth={3} fill="none" />)}
    <path d="M -40 140 L -18 190 L 18 190 L 40 140 Z" fill={INK} />
  </g>
);

/** Garnerin's rig: the canopy (furled when open = 0, a scalloped dome when open = 1), the cords, the basket, the man. */
const Chute: React.FC<{ x: number; y: number; s?: number; open: number; swing?: number }> = ({ x, y, s = 1, open, swing = 0 }) => {
  const w = lerp(26, 170, open), h = lerp(140, 90, open);
  const scallops = 7;
  const edge = Array.from({ length: scallops }, (_, i) => {
    const x0 = -w + (2 * w * i) / scallops, x1 = -w + (2 * w * (i + 1)) / scallops;
    return `Q ${(x0 + x1) / 2} ${14 * open} ${x1} 0`;
  }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${swing} 0 ${-h})`}>
      <path d={`M ${-w} 0 C ${-w} ${-h * 1.3} ${w} ${-h * 1.3} ${w} 0 Z`} fill={INK} />
      <path d={`M ${-w} 0 ${edge}`} fill={INK} stroke={INK} strokeWidth={2} />
      {/* the cords and the basket swing as one under the canopy */}
      <g>
        {[-1, -0.4, 0.4, 1].map((k) => <path key={k} d={`M ${k * w} 2 L ${k * 26} 240`} stroke={INK} strokeWidth={3} />)}
        <path d="M -34 240 L 34 240 L 28 290 L -28 290 Z" fill={INK} />
        {/* Garnerin in the basket: head and a tall hat over the rim */}
        <circle cx={0} cy={222} r={16} fill={INK} />
        <rect x={-13} y={186} width={26} height={26} fill={INK} />
        <rect x={-20} y={208} width={40} height={6} fill={INK} />
      </g>
    </g>
  );
};

const Clouds: React.FC<{ t: number; o?: number; c?: string }> = ({ t, o = 0.35, c = '#F6D2B8' }) => (
  <g opacity={o} fill={c}>
    {[[200, 260, 1], [1500, 200, 1.2], [800, 900, 0.9], [1700, 760, 1], [300, 640, 0.8]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + ((t * (1 + i * 0.3)) % 400) - 200} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={0} rx={160} ry={34} />
        <ellipse cx={-60} cy={-20} rx={70} ry={34} />
        <ellipse cx={50} cy={-26} rx={80} ry={40} />
      </g>
    ))}
  </g>
);
const HighSky: React.FC<{ id: string; t: number }> = ({ id, t }) => (
  <g>
    <defs>
      <linearGradient id={`hs${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A2458" />
        <stop offset="60%" stopColor="#B05A78" />
        <stop offset="100%" stopColor="#F2A066" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={2720} height={1880} fill={`url(#hs${id})`} />
    <Clouds t={t} />
  </g>
);

// ---------- S1: wide, Nea Costel in his corner, the title pops ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const p = poseAt(t, [
    { f: 0, p: hostPose({ yaw: 0.1 }) },
    { f: 10, p: hostPose({ yaw: 0.1, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, headTilt: -6 }) },
    { f: 30, p: hostPose({ yaw: 0.1, armL: { a: 70, b: 60 }, armR: { a: 70, b: 60 }, headTilt: 6, squash: -0.02 }) },
  ]);
  return (
    <g transform={camV(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
      {corner(t, 'pc1')}
      <Hero look={COSTEL} pose={{ ...p, ...faceAt(t, [[0, 'neutral'], [8, 'worried']]) }} shadow={0.7} />
      <Bold x={960} y={170} t={t - 2} text="WHO INVENTED THE" size={52} />
      <Bold x={960} y={300} t={t - 10} text="PARACHUTE?" size={84} fill="#FFD24A" rot={-3} />
    </g>
  );
};

// ---------- S2: close-up, "Leonardo da Vinci? Sure...": a knowing, sideways look ----------
const S2C = closeUp({ look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'smug']], bg: (t) => corner(t, 'pc2b'), x: 960, y: 560, sc: 4.6, yaw: 0.2, eyes: 0.6, tilt: 6 });
export const S2: React.FC<ShotProps> = (p) => (
  <g>
    <S2C {...p} />
    <Bold x={960} y={170} t={p.t - 2} text="LEONARDO?" size={84} />
  </g>
);

// ---------- S3: insert, Leonardo's sketch drawing itself on old paper: the pyramid parachute, c. 1485 ----------
const SEPIA = '#5A3A1E';
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#2A1A10" />
    <rect x={560} y={60} width={800} height={960} fill="#E8D3A6" />
    <rect x={560} y={60} width={800} height={960} fill="none" stroke="#B89660" strokeWidth={6} />
    {/* the pyramid: apex, two front edges, the hidden back edge, the square base in perspective */}
    <DrawOn d="M 960 200 L 760 520 L 1160 520 Z" t={t} dur={14} color={SEPIA} width={6} />
    <DrawOn d="M 960 200 L 1040 470 L 1160 520 M 1040 470 L 760 520" t={t - 8} dur={12} color={SEPIA} width={3} />
    {/* the cords and the hanging man */}
    <DrawOn d="M 760 520 L 945 690 M 1160 520 L 975 690 M 1040 470 L 965 690" t={t - 16} dur={10} color={SEPIA} width={3} />
    <DrawOn d="M 960 690 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0 M 960 706 L 960 790 M 960 720 L 930 690 M 960 720 L 990 690 M 960 790 L 935 850 M 960 790 L 985 850" t={t - 22} dur={10} color={SEPIA} width={4} />
    {/* Leonardo's mirror-writing, as a few illegible lines */}
    {[0, 1, 2].map((i) => <path key={i} d={`M ${640} ${880 + i * 34} q 40 -10 80 0 t 80 0 t 80 0 t 80 0`} stroke={SEPIA} strokeWidth={3} fill="none" opacity={clamp((t - 28 - i * 4) / 6) * 0.7} />)}
    <Bold x={960} y={1000} t={t - 30} text="c. 1485" size={80} fill="#FFD24A" />
  </g>
);

// ---------- S4: close-up, "But he never jumped.": eyebrows up, a shrug ----------
const S4C = closeUp({ look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'oops']], bg: (t) => corner(t, 'pc4b'), x: 960, y: 600, sc: 5.2, yaw: -0.05, eyes: 0, pose: { armL: { a: 40, b: 80 }, armR: { a: 40, b: 80 } } });
export const S4: React.FC<ShotProps> = (p) => (
  <g>
    <S4C {...p} />
    <Bold x={960} y={180} t={p.t - 4} text="NEVER" size={96} />
    <Bold x={960} y={300} t={p.t - 8} text="JUMPED." size={96} fill="#FFD24A" />
  </g>
);

// ---------- S5: wide, Paris at dusk: the balloon rises over the rooftops, the crowd watches ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const by = lerp(820, 380, easeOut(clamp(t / len)));
  return (
    <g transform={camV(960, kf(t, [[0, 600], [len, 480]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
      <Sky id="pc5" sunY={720} />
      <Cathedral x={1460} y={840} s={0.7} />
      <Balloon x={960} y={by} s={0.75} />
      <Chute x={960} y={by + 150} s={0.6} open={0} />
      <Roofs y={200} />
      <rect x={-400} y={970} width={2720} height={400} fill={INK} />
      {[700, 780, 1140, 1220, 1300].map((x, i) => (
        <Hero key={x} look={SIL} pose={{ ...basePose, x, y: 990 - LEG_LEN * 0.4, scale: 0.4, yaw: i < 2 ? 0.5 : -0.5, look: 0, headTilt: -16, armR: { a: i % 2 ? 150 : 20, b: 10 } }} shadow={0} rimId="none" />
      ))}
      <Bold x={960} y={150} t={t - 4} text="PARIS" size={100} />
      <Bold x={960} y={270} t={t - 14} text="1797" size={120} fill="#FFD24A" />
    </g>
  );
};

// ---------- S6: medium, high above the city: the balloon and Garnerin's basket, an altitude tag ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, kf(t, [[0, 520], [len, 560]]), kf(t, [[0, 1.0], [len, 1.1]]))}>
    <HighSky id="pc6" t={t} />
    <g transform="translate(0 0)">
      <Balloon x={960} y={260} s={1} />
      <Chute x={960} y={480} s={0.85} open={0} />
    </g>
    <g transform="translate(560 1000) scale(0.4)" opacity={0.6}><Roofs y={-600} c="#4A2A48" /></g>
    <Bold x={960} y={1000} t={t - 6} text="≈ 900 M UP" size={84} fill="#FFD24A" />
  </g>
);

// ---------- S7: insert, the cord is cut: a blade, a snap, the two ends fly apart ----------
export const S7: React.FC<ShotProps> = ({ t }) => {
  const cut = t >= 4;
  const gap = cut ? easeOut(clamp((t - 4) / 8)) * 220 : 0;
  const blade = clamp(t / 4);
  return (
    <g>
      <HighSky id="pc7" t={t} />
      <path d={`M 960 -100 L 960 ${520 - gap}`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
      <path d={`M 960 ${560 + gap} L 960 1300`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${946 + i * 8} ${520 - gap} l ${(i - 1.5) * 10} 26`} stroke={INK} strokeWidth={5} opacity={cut ? 1 : 0} />)}
      {/* the knife sweeps in from the left */}
      <g transform={`translate(${lerp(500, 1000, blade)} 540) rotate(-8)`}>
        <path d="M 0 -18 L 160 -6 L 180 0 L 160 8 L 0 18 Z" fill="#C8CCD4" stroke={INK} strokeWidth={4} />
        <rect x={-120} y={-20} width={120} height={40} rx={10} fill={INK} />
      </g>
      <Bold x={960} y={220} t={t - 4} text="SNIP!" size={140} fill="#FFD24A" rot={-6} />
    </g>
  );
};

// ---------- S8: wide, the balloon shoots away, the canopy bangs open, the basket swings wildly ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const open = easeOut(clamp((t - 2) / 8));
  const swing = Math.sin(t * 0.28) * 30 * (0.6 + 0.4 * Math.exp(-t / 90));
  const cy = lerp(300, 420, clamp(t / len));
  return (
    <g transform={camV(960, 540, kf(t, [[0, 1.12], [len, 1.0]]))}>
      <HighSky id="pc8" t={t + 20} />
      <Balloon x={960} y={lerp(40, -500, easeOut(clamp(t / 20)))} s={0.8} />
      <Chute x={960} y={cy} s={1.25} open={open} swing={swing} />
      <Bold x={960} y={1000} t={t - 10} text="WHOA!" size={130} fill="#FFD24A" rot={4} />
    </g>
  );
};

// ---------- S9: wide, the landing in the park: the canopy collapses, he climbs out, the crowd cheers ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const land = clamp(t / 10);
  const cheer = (i: number) => Math.sin(t * 0.5 + i) * 20;
  return (
    <g transform={camV(960, kf(t, [[0, 560], [len, 600]]), kf(t, [[0, 1.0], [len, 1.08]]))}>
      <Sky id="pc9" sunY={780} />
      {/* park trees */}
      {[200, 420, 1500, 1720].map((x) => <g key={x} fill={INK}><rect x={x - 14} y={700} width={28} height={300} /><circle cx={x} cy={660} r={110} /></g>)}
      <rect x={-400} y={940} width={2720} height={400} fill={INK} />
      {/* the canopy settling like a deflated tent beside the basket */}
      <path d={`M 1010 940 Q 1130 ${lerp(760, 900, land)} 1260 940 Z`} fill={INK} />
      <path d="M 900 940 L 900 890 L 980 890 L 980 940 Z" fill={INK} />
      <Hero look={SIL} pose={{ ...basePose, x: 860, y: 940 - LEG_LEN * 0.55, scale: 0.55, yaw: 0.2, armL: { a: 150 + cheer(0), b: 10 }, armR: { a: 150 - cheer(0), b: 10 } }} shadow={0} rimId="none" />
      {[620, 700, 1340, 1420, 1500].map((x, i) => (
        <Hero key={x} look={SIL} pose={{ ...basePose, x, y: 950 - LEG_LEN * 0.42, scale: 0.42, yaw: i < 2 ? 0.5 : -0.5, armL: { a: 140 + cheer(i), b: 20 }, armR: { a: 140 - cheer(i), b: 20 } }} shadow={0} rimId="none" />
      ))}
      <Bold x={960} y={260} t={t - 6} text="ALIVE!" size={140} fill="#FFD24A" />
    </g>
  );
};

// ---------- S10: the card: the first parachute jump in history ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
    <HighSky id="pc10" t={t} />
    <Chute x={960} y={560} s={0.9} open={1} swing={Math.sin(t * 0.15) * 8} />
    <Bold x={960} y={170} t={t - 2} text="THE FIRST" size={76} />
    <Bold x={960} y={280} t={t - 6} text="PARACHUTE JUMP" size={58} fill="#FFD24A" />
    <Bold x={960} y={1010} t={t - 14} text="22 OCT 1797" size={64} />
  </g>
);

// ---------- S11: close-up, "And Leonardo's design?": he leans in ----------
const S11C = closeUp({ look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'smug']], bg: (t) => corner(t, 'pc11b'), x: 960, y: 600, sc: 5.6, yaw: -0.1, eyes: -0.2, tilt: -8 });
export const S11: React.FC<ShotProps> = (p) => (
  <g>
    <S11C {...p} />
    <Bold x={960} y={170} t={p.t - 4} text="AND LEONARDO'S" size={60} />
    <Bold x={960} y={270} t={p.t - 10} text="DESIGN?" size={100} fill="#FFD24A" />
  </g>
);

// ---------- S12: wide, a daytime sky in 2000: the wooden pyramid parachute floats down with a skydiver under it ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const y = lerp(380, 480, clamp(t / len));
  const sway = Math.sin(t * 0.12) * 4;
  return (
    <g transform={camV(960, 540, kf(t, [[0, 1.0], [len, 1.08]]))}>
      <defs>
        <linearGradient id="pc12sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3E7FC4" />
          <stop offset="100%" stopColor="#A9D6F2" />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width={2720} height={1880} fill="url(#pc12sky)" />
      <Clouds t={t} o={0.85} c="#FFFFFF" />
      <path d="M -400 1000 Q 400 930 960 970 T 2320 960 L 2320 1480 L -400 1480 Z" fill="#6E8B4E" />
      <g transform={`translate(960 ${y}) rotate(${sway})`}>
        {/* canvas pyramid on a wooden frame */}
        <path d="M 0 -170 L -190 120 L 190 120 Z" fill="#C9A16A" stroke="#6B4A26" strokeWidth={8} strokeLinejoin="round" />
        <path d="M 0 -170 L 60 100" stroke="#6B4A26" strokeWidth={6} />
        <path d="M -190 120 L 190 120" stroke="#6B4A26" strokeWidth={10} />
        {[-190, 60, 190].map((x) => <path key={x} d={`M ${x} 120 L 0 330`} stroke="#3A2A1A" strokeWidth={3} />)}
        {/* the skydiver in a harness */}
        <Hero look={{ ...COSTEL, skin: '#E8C4A0', skinShade: '#D0A884', hand: '#E8C4A0', jacket: '#D9472B', jacketShade: '#B3361E', accent: '#F2F2F2', limb: '#2E3440', line: '#141414', shoe: '#141414', hair: '#141414', face: '#141414', extra: 'goggles' }}
          pose={{ ...basePose, x: 0, y: 330 + LEG_LEN * 0.38 + 60, scale: 0.38, armL: { a: 160, b: 0 }, armR: { a: 160, b: 0 }, expr: 'happy' }} shadow={0} rimId="none" />
      </g>
      <Bold x={960} y={170} t={t - 4} text="2000" size={110} fill="#FFD24A" />
      <Bold x={960} y={1000} t={t - 30} text="IT WORKED!" size={80} />
    </g>
  );
};

// ---------- S13: medium, the punchline: he still cut away and landed on a modern chute; Nea Costel laughs ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const p = poseAt(t, [
    { f: 0, p: hostPose({ yaw: 0.1, armL: { a: 40, b: 80 }, armR: { a: 40, b: 80 }, headTilt: -10 }) },
    { f: 40, p: hostPose({ yaw: 0.1, armL: { a: 20, b: 40 }, armR: { a: 70, b: 90 }, headTilt: 8, squash: -0.03 }) },
  ]);
  const bounce = t > 40 ? Math.abs(Math.sin(t * 0.5)) * 8 : 0;
  return (
    <g transform={camV(960, kf(t, [[0, 600], [len, 560]]), kf(t, [[0, 1.15], [len, 1.3]]))}>
      {corner(t, 'pc13')}
      <Hero look={COSTEL} pose={{ ...p, y: p.y - bounce, ...faceAt(t, [[0, 'oops'], [40, 'laugh']]) }} shadow={0.7} />
      <Bold x={960} y={260} t={t - 6} text="...THEN USED A" size={50} />
      <Bold x={960} y={350} t={t - 12} text="MODERN CHUTE" size={60} fill="#FFD24A" />
    </g>
  );
};

// ---------- S14: name card: Garnerin in profile against the dusk, his name pops ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 3.5 * (1 + 0.04 * clamp(t / len));
  return (
    <g>
      <Sky id="pc14" sunY={620} />
      <Roofs y={330} c="#2A1430" />
      <Hero look={SIL} pose={{ ...basePose, x: 960, y: 720 - HEAD.y * sc, scale: sc, yaw: 0.85, look: 1 }} shadow={0} rimId="none" />
      {/* a tall 1790s hat over the silhouette */}
      <g transform={`translate(960 ${720 - 50 * sc}) scale(${sc})`} fill={INK}>
        <rect x={-46} y={-58} width={92} height={60} rx={6} />
        <rect x={-70} y={-2} width={140} height={10} rx={5} />
      </g>
      <Bold x={960} y={160} t={t - 2} text="ANDRÉ-JACQUES" size={64} fill="#FFD24A" />
      <Bold x={960} y={270} t={t - 8} text="GARNERIN" size={100} fill="#FFD24A" />
      <Bold x={960} y={1010} t={t - 16} text="BALLOONIST" size={56} />
    </g>
  );
};
