import React, { useContext } from 'react';
import {
  Hero, LOOKS, Look, Pose, basePose, poseAt, faceAt, kf, clamp, lerp, easeOut, camT, HEAD, LEG_LEN, FONT,
  Study, Schematic, SchLabel, DrawOn, SCH, Glow, TitleCard, ShotProps, walkPose, joints, toWorld, VerticalCtx,
} from '../../engine';
import { closeUp } from '../pause-full/parts';

// "Who invented the fountain pen?" A history explainer hosted by Nea Costel. The past is drawn as silhouettes against a
// dusk sky; the host lives in his lamp-lit corner. Every shot keeps its key content in the centre 600 px column,
// so the 9:16 crop reads as well as the 16:9 frame.

// In the 9:16 crop the frame is only 607 px wide, so shot zooms are softened there (VZ is set per render by index.tsx).
let VZ = 1;
export const setVertZoom = (vert: boolean) => { VZ = vert ? 0.3 : 1; };
export const camV = (x: number, y: number, z: number) => camT(x, y, 1 + (z - 1) * VZ);

export const COSTEL = LOOKS.costel;
export const INK = '#160C1E';
/** A figure from the past: the rig in solid ink, the face drawn in the ink too (pure silhouette). */
export const SIL: Look = { ...COSTEL, skin: INK, skinShade: INK, hand: INK, jacket: INK, jacketShade: INK, accent: INK, limb: INK, line: INK, shoe: INK, hair: INK, face: INK, extra: undefined };

type P = { x: number; y: number };
export const backOut = (x: number) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);
export const pop = (t: number, d = 6) => (t <= 0 ? 0 : backOut(clamp(t / d)));

/** Big bold caption in the Romanian-explainer style: white or yellow, thick dark outline. */
// Reels/Shorts safe band: the apps cover the top ~14% and the bottom ~35% of a 9:16 frame, so in the vertical crop
// captions move into source y ≈ 230..700 (≈ 280..1250 px of 1920). Top captions drop 80 px; bottom ones rise into the band.
const safeY = (y: number) => (y >= 760 ? y - 380 : y + 80);
export const Bold: React.FC<{ x: number; y: number; t: number; text: string; size?: number; fill?: string; rot?: number }> = ({ x, y: y0, t, text, size = 96, fill = '#FFFFFF', rot = 0 }) => {
  const vert = useContext(VerticalCtx);
  const y = vert ? safeY(y0) : y0;
  if (t < 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(t)})`}>
      <text textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size} fill={fill} stroke="#14091C" strokeWidth={size * 0.16} paintOrder="stroke" strokeLinejoin="round">{text}</text>
    </g>
  );
};

// ---------- the dusk sky and Paris rooftops ----------
export const Sky: React.FC<{ id: string; sunY?: number }> = ({ id, sunY = 700 }) => (
  <g>
    <defs>
      <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A1840" />
        <stop offset="45%" stopColor="#8A3F6E" />
        <stop offset="75%" stopColor="#F07A4A" />
        <stop offset="100%" stopColor="#FFC66A" />
      </linearGradient>
    </defs>
    <rect x={-400} y={-400} width={2720} height={1880} fill={`url(#sky${id})`} />
    <circle cx={960} cy={sunY} r={150} fill="#FFE2A0" opacity={0.95} />
    <Glow x={960} y={sunY} r={520} kind="warm" o={0.7} />
  </g>
);
// rooftops: a fixed row of houses with mansard roofs and chimney pots (no randomness)
export const ROW = [
  [-300, 180, 560], [-120, 150, 600], [30, 200, 520], [230, 140, 610], [370, 170, 560], [1150, 160, 570], [1310, 200, 540], [1510, 150, 600], [1660, 190, 550], [1850, 170, 580], [2020, 160, 560],
];
export const Roofs: React.FC<{ y?: number; c?: string }> = ({ y = 0, c = INK }) => (
  <g transform={`translate(0 ${y})`} fill={c}>
    {ROW.map(([x, w, top], i) => (
      <g key={i}>
        <path d={`M ${x} 1200 L ${x} ${top + 40} L ${x + 22} ${top} L ${x + w - 22} ${top} L ${x + w} ${top + 40} L ${x + w} 1200 Z`} />
        <rect x={x + w * 0.3} y={top - 44} width={22} height={48} />
        <rect x={x + w * 0.62} y={top - 32} width={18} height={36} />
        {[0, 1].map((k) => <rect key={k} x={x + 30 + k * (w - 80)} y={top + 90} width={22} height={34} fill="#FFB65A" opacity={i % 3 === k ? 0.85 : 0} />)}
      </g>
    ))}
  </g>
);
/** A cathedral with two square towers and a spire: an old-Paris silhouette, centred. */
export const Cathedral: React.FC<{ x?: number; y?: number; s?: number }> = ({ x = 960, y = 760, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={INK}>
    <rect x={-210} y={-330} width={130} height={500} />
    <rect x={80} y={-330} width={130} height={500} />
    <rect x={-80} y={-200} width={160} height={370} />
    <path d="M -80 -200 L 0 -260 L 80 -200 Z" />
    <circle cx={0} cy={-110} r={46} fill="#F0A060" opacity={0.6} />
    <path d="M -6 -260 L 0 -470 L 6 -260 Z" />
    {[-210, 80].map((tx) => (
      <g key={tx}>
        {[0, 1, 2, 3].map((k) => <rect key={k} x={tx + 8 + k * 30} y={-352} width={18} height={24} />)}
        <rect x={tx + 30} y={-290} width={22} height={70} rx={11} fill="#F0A060" opacity={0.35} />
        <rect x={tx + 78} y={-290} width={22} height={70} rx={11} fill="#F0A060" opacity={0.35} />
      </g>
    ))}
  </g>
);

// ---------- the host's corner: the study, warm lamp ----------
export const corner = (t: number, id: string) => <Study t={t} id={id} veil={0.3} />;
export const hostPose = (o: Partial<Pose>): Pose => ({ ...basePose, x: 960, y: 960 - LEG_LEN * 0.95, scale: 0.95, ...o });

// ---------- S1: wide, Nea Costel in his corner, the title pops over him ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const p = poseAt(t, [
    { f: 0, p: hostPose({ yaw: 0.1, look: 0 }) },
    { f: 10, p: hostPose({ yaw: 0.1, armL: { a: 50, b: 70 }, armR: { a: 50, b: 70 }, headTilt: -6 }) },
    { f: 30, p: hostPose({ yaw: 0.1, armL: { a: 70, b: 60 }, armR: { a: 70, b: 60 }, headTilt: 6, squash: -0.02 }) },
  ]);
  return (
    <g transform={camV(960, 560, kf(t, [[0, 1.0], [len, 1.08]]))}>
      {corner(t, 'st1')}
      <Hero look={COSTEL} pose={{ ...p, ...faceAt(t, [[0, 'neutral'], [8, 'worried']]) }} shadow={0.7} />
      <Bold x={960} y={170} t={t - 2} text="WHO INVENTED THE" size={52} />
      <Bold x={960} y={300} t={t - 10} text="FOUNTAIN" size={96} fill="#FFD24A" rot={-3} />
      <Bold x={960} y={430} t={t - 14} text="PEN?" size={96} fill="#FFD24A" rot={-3} />
    </g>
  );
};

// ---------- S2: close-up, "Americanii? Ei, aș!": he scoffs and wags a finger ----------
const S2C = closeUp({
  look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'smug'], [34, 'laugh']], bg: (t) => corner(t, 'st2b'), x: 960, y: 560, sc: 4.6, yaw: 0.15, eyes: 0.4,
  pose: { armR: { a: 150, b: 30 }, handR: 'point' },
});
export const S2: React.FC<ShotProps> = (p) => (
  <g>
    <S2C {...p} />
    <Bold x={960} y={170} t={p.t - 2} text="SOME AMERICAN?" size={60} />
    <Bold x={960} y={930} t={p.t - 34} text="HA! NO." size={120} fill="#FFD24A" rot={4} />
  </g>
);

// ---------- S3: wide, Paris at dusk in silhouette, two walkers, the year ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, kf(t, [[0, 480], [len, 560]]), kf(t, [[0, 1.12], [len, 1.0]]))}>
    <Sky id="s3" sunY={kf(t, [[0, 660], [len, 700]])} />
    <Cathedral x={960} y={820} s={0.95} />
    <Roofs y={180} />
    <rect x={-400} y={950} width={2720} height={400} fill={INK} />
    <Hero look={SIL} pose={walkPose(lerp(640, 820, t / len), t * 0.6, 990, 0.55)} shadow={0} rimId="none" />
    <Hero look={SIL} pose={walkPose(lerp(1300, 1120, t / len), t * 0.55 + 1, 990, 0.5, {}, -1)} shadow={0} rimId="none" />
    <Bold x={960} y={170} t={t - 4} text="PARIS" size={110} />
    <Bold x={960} y={300} t={t - 14} text="1827" size={130} fill="#FFD24A" />
  </g>
);

// ---------- S4: medium, an attic window at dusk: the student writes standing at a lectern, a quill in his hand ----------
// The quill is held the way a pen is: the nib on the page just ahead of the fingers, the shaft resting back over the
// hand toward the shoulder, the feather rising above the wrist. The page sits where his hand comes down.
const studentPose = (t: number): Pose => {
  const scrib = Math.sin(t * 0.9) * 2.5;
  return {
    ...basePose, x: 860, y: 900 - LEG_LEN * 1.25, scale: 1.25, yaw: 1, look: 1, headTilt: 8,
    armR: { a: 58 + scrib, b: 40 - scrib * 0.5 }, armL: { a: -30, b: -62 }, tilt: 6,
  };
};
const BASE4 = studentPose(0);
const HAND4 = (() => {
  const j = joints(BASE4);
  return toWorld(BASE4, j.armR.end);
})();
const DESK4 = { y: HAND4.y + 22, x0: HAND4.x - 110, x1: HAND4.x + 120 }; // the writing board's top edge at the hand
const Quill: React.FC<{ nib: P; len?: number }> = ({ nib, len = 175 }) => {
  // the shaft runs from the nib back through the fingers and on past the wrist
  // a pen held in writing grip leans back at about 70 degrees: up, and a little back toward the writer
  const ux = -0.26, uy = -0.97;
  const tip = { x: nib.x + ux * len, y: nib.y + uy * len };
  const nx = -uy, ny = ux; // normal, for the vane width
  const v0 = { x: nib.x + ux * len * 0.45, y: nib.y + uy * len * 0.45 };
  return (
    <g fill={INK}>
      <path d={`M ${nib.x} ${nib.y} L ${tip.x} ${tip.y}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${v0.x} ${v0.y} Q ${(v0.x + tip.x) / 2 + nx * 34} ${(v0.y + tip.y) / 2 + ny * 34} ${tip.x + ux * 14} ${tip.y + uy * 14} Q ${(v0.x + tip.x) / 2 - nx * 8} ${(v0.y + tip.y) / 2 - ny * 8} ${v0.x} ${v0.y} Z`} />
    </g>
  );
};
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const pose = studentPose(t);
  const hand = toWorld(pose, joints(pose).armR.end);
  const nib = { x: hand.x + 16, y: DESK4.y - 2 + Math.sin(t * 1.8) * 1.5 };
  return (
    <g transform={camV(kf(t, [[0, 940], [len, 1000]]), kf(t, [[0, 520], [len, 600]]), kf(t, [[0, 1.0], [len, 1.18]]))}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#24132E" />
      {/* the round attic window with the dusk city behind it */}
      <defs><clipPath id="win4"><circle cx={980} cy={420} r={300} /></clipPath></defs>
      <g clipPath="url(#win4)">
        <Sky id="s4" sunY={560} />
        <Roofs y={-80} c="#3A1E3E" />
      </g>
      <circle cx={980} cy={420} r={300} fill="none" stroke={INK} strokeWidth={30} />
      <path d="M 820 140 L 820 700 M 1160 140 L 1160 700 M 680 300 L 1280 300" stroke={INK} strokeWidth={16} />
      <rect x={-200} y={890} width={2400} height={400} fill={INK} />
      <Hero look={SIL} pose={pose} shadow={0} rimId="none" />
      {/* the lectern, in front of his body: a sloped board, the page on it, a post and a foot */}
      <path d={`M ${DESK4.x0} ${DESK4.y + 26} L ${DESK4.x1} ${DESK4.y - 6} L ${DESK4.x1} ${DESK4.y + 14} L ${DESK4.x0} ${DESK4.y + 46} Z`} fill={INK} />
      <path d={`M ${DESK4.x0 + 30} ${DESK4.y + 18} L ${DESK4.x1 - 20} ${DESK4.y - 2}`} stroke="#E9D9B4" strokeWidth={3} opacity={0.55} />
      <rect x={HAND4.x - 6} y={DESK4.y + 20} width={26} height={890 - DESK4.y - 20} fill={INK} />
      <rect x={HAND4.x - 60} y={880} width={130} height={16} fill={INK} />
      <Quill nib={nib} />
      {/* the ink pot on the board's upper corner */}
      <path d={`M ${DESK4.x1 - 46} ${DESK4.y - 2} l 4 -26 l 26 0 l 4 26 Z`} fill={INK} />
      {/* a candle on the sill */}
      <rect x={1190} y={640} width={16} height={46} fill={INK} />
      <ellipse cx={1198} cy={630} rx={6} ry={12 + Math.sin(t * 1.3) * 2} fill="#FFD27A" />
      <Glow x={1198} y={630} r={160} kind="warm" o={0.5} />
    </g>
  );
};

// ---------- S5: insert, top-down on the page: the quill drips, PIC, a blot, PIC, another ----------
const Blot: React.FC<{ x: number; y: number; t: number; r: number }> = ({ x, y, t, r }) => {
  if (t < 0) return null;
  const fall = clamp(t / 5);
  if (fall < 1) return <ellipse cx={x} cy={lerp(y - 250, y, fall * fall)} rx={10} ry={16} fill="#1A1440" />;
  const s = easeOut(clamp((t - 5) / 6));
  const arms = [0, 50, 110, 170, 230, 290];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#1A1440">
      <circle r={r} />
      {arms.map((a, i) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * (1.1 + (i % 2) * 0.25)} cy={Math.sin((a * Math.PI) / 180) * r * (1.1 + (i % 2) * 0.25)} r={r * (0.28 + (i % 3) * 0.08)} />)}
    </g>
  );
};
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, 560, kf(t, [[0, 1.05], [len, 1.15]]))}>
    <rect x={-200} y={-200} width={2400} height={1500} fill="#3A2416" />
    <g transform="rotate(-4 960 560)">
      <rect x={640} y={80} width={640} height={980} fill="#EFE2C4" />
      {['Monsieur,', 'J’ai l’honneur', 'de vous écrire', 'au sujet de...'].map((ln, i) => (
        <text key={i} x={690} y={220 + i * 80} fontFamily="Kalam" fontWeight={700} fontSize={50} fill="#2A2050" opacity={0.85}>{ln}</text>
      ))}
    </g>
    {/* the quill hovers over the page, and each drop falls from its nib */}
    {(() => {
      const nx = kf(t, [[0, 900], [22, 900], [30, 1050], [48, 1050], [56, 820]]);
      const ny = kf(t, [[0, 200], [22, 200], [30, 390], [48, 390], [56, 550]]);
      const bob = Math.sin(t * 0.5) * 4;
      return (
        <g transform={`translate(${nx} ${ny + bob}) rotate(50)`}>
          <path d="M 0 0 L -9 -40 L 9 -40 Z" fill="#2A1E18" />
          <path d="M 0 -36 L 0 -360" stroke="#5A4634" strokeWidth={9} strokeLinecap="round" />
          <path d="M 0 -150 Q 54 -260 8 -400 Q -40 -270 0 -150 Z" fill="#EDE6DA" stroke="#5A4634" strokeWidth={4} />
          <path d="M 2 -170 L 4 -380" stroke="#B8A890" strokeWidth={3} />
        </g>
      );
    })()}
    <Blot x={900} y={450} t={t - 2} r={46} />
    <Blot x={1050} y={640} t={t - 34} r={70} />
    <Blot x={820} y={800} t={t - 60} r={90} />
    <Bold x={960} y={330} t={t - 6} text="DRIP!" size={130} fill="#FFD24A" rot={-6} />
    <Bold x={960} y={1000} t={t - 40} text="BLOT!" size={120} rot={4} />
  </g>
);

// ---------- S6: schematic, the idea: a quill tube as a reservoir feeds the nib, and the ink fills it by itself ----------
const TUBE = { x: 900, y: 180, w: 120, h: 520 };
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const fill = clamp((t - 18) / 50);
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.05]])}) translate(-960 -540)`}>
      <Schematic t={t} id="st6" />
      <defs><clipPath id="tube6"><rect x={TUBE.x + 8} y={TUBE.y + 8} width={TUBE.w - 16} height={TUBE.h - 16} rx={50} /></clipPath></defs>
      <rect x={TUBE.x + 8} y={TUBE.y + 8 + (TUBE.h - 16) * (1 - fill)} width={TUBE.w - 16} height={(TUBE.h - 16) * fill} fill="#4A5CFF" clipPath="url(#tube6)" opacity={0.85} />
      <DrawOn d={`M ${TUBE.x + 60} ${TUBE.y} Q ${TUBE.x} ${TUBE.y} ${TUBE.x} ${TUBE.y + 60} L ${TUBE.x} ${TUBE.y + TUBE.h - 60} Q ${TUBE.x} ${TUBE.y + TUBE.h} ${TUBE.x + 60} ${TUBE.y + TUBE.h} Q ${TUBE.x + TUBE.w} ${TUBE.y + TUBE.h} ${TUBE.x + TUBE.w} ${TUBE.y + TUBE.h - 60} L ${TUBE.x + TUBE.w} ${TUBE.y + 60} Q ${TUBE.x + TUBE.w} ${TUBE.y} ${TUBE.x + 60} ${TUBE.y}`} t={t} dur={12} width={8} />
      {/* the nib under the tube */}
      <DrawOn d={`M ${TUBE.x + 10} ${TUBE.y + TUBE.h} L ${TUBE.x + 60} ${TUBE.y + TUBE.h + 200} L ${TUBE.x + TUBE.w - 10} ${TUBE.y + TUBE.h} M ${TUBE.x + 60} ${TUBE.y + TUBE.h + 40} L ${TUBE.x + 60} ${TUBE.y + TUBE.h + 190}`} t={t - 8} dur={10} width={8} color={SCH.live} />
      {/* a drop running down to the tip, again and again */}
      {fill > 0.3 ? <circle cx={TUBE.x + 60} cy={TUBE.y + TUBE.h + 40 + ((t * 6) % 150)} r={9} fill="#4A5CFF" /> : null}
      <SchLabel x={960} y={200} t={t - 4} text="BUILT-IN INK TANK" size={44} color={SCH.live} />
      <SchLabel x={960} y={660} t={t - 40} text="REFILLS ITSELF" size={60} />
    </g>
  );
};

// ---------- S7: insert, the patent on the desk: the stamp slams down ----------
const Patent: React.FC<{ t: number }> = ({ t }) => {
  const stamp = clamp((t - 36) / 4);
  return (
    <g>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#2A1A12" />
      <g transform="rotate(2 960 540)">
        <rect x={650} y={40} width={620} height={1000} fill="#F2E6C8" stroke="#8A6A3A" strokeWidth={6} />
        <rect x={680} y={70} width={560} height={940} fill="none" stroke="#8A6A3A" strokeWidth={2} />
        <text x={960} y={170} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={54} fill="#3A2A1A">BREVET</text>
        <text x={960} y={225} textAnchor="middle" fontFamily={FONT.title} fontWeight={600} fontSize={32} fill="#3A2A1A">D’INVENTION</text>
        <text x={960} y={340} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={96} fill="#7A1E1E">N° 3208</text>
        {['Plume portable', 'sans fin, qui', 's’alimente elle-même', 'avec de l’encre'].map((ln, i) => (
          <text key={i} x={960} y={460 + i * 62} textAnchor="middle" fontFamily="Kalam" fontWeight={700} fontSize={44} fill="#2A2050">{ln}</text>
        ))}
        <text x={960} y={760} textAnchor="middle" fontFamily="Kalam" fontWeight={700} fontSize={48} fill="#2A2050">Paris, 25 mai 1827</text>
        <path d="M 820 880 q 40 -40 80 0 t 80 0 t 80 -10" stroke="#2A2050" strokeWidth={5} fill="none" />
      </g>
      {/* the stamp: drops from above, then a red seal stays */}
      {t >= 30 ? (
        <g transform={`translate(1110 ${lerp(500, 870, stamp)}) rotate(-12) scale(${lerp(1.6, 1, stamp)})`} opacity={stamp}>
          <circle r={100} fill="none" stroke="#C0262E" strokeWidth={12} />
          <circle r={78} fill="none" stroke="#C0262E" strokeWidth={4} />
          <text y={14} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={40} fill="#C0262E">BREVETÉ</text>
        </g>
      ) : null}
    </g>
  );
};
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camV(960, kf(t, [[0, 420], [len, 560]]), kf(t, [[0, 1.25], [len, 1.0]]))}>
    <Patent t={t} />
  </g>
);
// ---------- S11: extreme close-up on the number, as he says it ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <g>
    <g transform={camV(960, 330, kf(t, [[0, 2.2], [len, 2.4]]))}>
      <Patent t={100} />
    </g>
  </g>
);

// ---------- S8: the name card: his silhouette in profile against the dusk, the name pops ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 4.2 * (1 + 0.04 * clamp(t / len));
  return (
    <g>
      <Sky id="s8" sunY={620} />
      <Roofs y={330} c="#2A1430" />
      <Hero look={SIL} pose={{ ...basePose, x: 960, y: 640 - HEAD.y * sc, scale: sc, yaw: 0.85, look: 1 }} shadow={0} rimId="none" />
      <Bold x={960} y={180} t={t - 2} text="PETRACHE" size={110} fill="#FFD24A" />
      <Bold x={960} y={300} t={t - 8} text="POENARU" size={110} fill="#FFD24A" />
      <Bold x={960} y={1000} t={t - 16} text="1799 – 1875" size={60} />
    </g>
  );
};

// ---------- S9: close-up, "Și știi ce-i mai tare?": he leans in, conspiratorial ----------
const S9C = closeUp({
  look: COSTEL, vertSc: 0.55, vertY: 500, face: [[0, 'smug']], bg: (t) => corner(t, 'st9b'), x: 960, y: 600, sc: 5.6, yaw: -0.1, eyes: -0.2, tilt: -8,
});
export const S9: React.FC<ShotProps> = (p) => (
  <g>
    <S9C {...p} />
    <Bold x={960} y={170} t={p.t - 4} text="AND THE BEST" size={72} />
    <Bold x={960} y={270} t={p.t - 12} text="PART?" size={100} fill="#FFD24A" />
  </g>
);

// ---------- S10: wide, an old shop window with an empty velvet stand: he shrugs at us ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const p = poseAt(t, [
    { f: 0, p: hostPose({ x: 960, yaw: -0.5, look: -0.8 }) },
    { f: 22, p: hostPose({ x: 960, yaw: 0.1, look: 0, armL: { a: 40, b: 80 }, armR: { a: 40, b: 80 }, headTilt: -10 }) },
    { f: 40, p: hostPose({ x: 960, yaw: 0.1, look: 0, armL: { a: 46, b: 84 }, armR: { a: 46, b: 84 }, headTilt: -12, squash: 0.02 }) },
  ]);
  return (
    <g transform={camV(960, kf(t, [[0, 540], [len, 600]]), kf(t, [[0, 1.0], [len, 1.12]]))}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#3A2A3A" />
      {/* the shop front */}
      <rect x={560} y={160} width={800} height={110} fill="#5A1E2A" stroke={INK} strokeWidth={8} />
      <text x={960} y={240} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={60} fill="#F2D27A" letterSpacing={3}>FOUNTAIN PENS</text>
      <rect x={600} y={300} width={720} height={560} fill="#1C2236" stroke={INK} strokeWidth={16} />
      <Glow x={960} y={420} r={360} kind="cool" o={0.35} />
      {/* the empty stand: a velvet cushion with only the dent where a pen would lie */}
      <rect x={760} y={400} width={400} height={70} rx={20} fill="#6A1E36" />
      <path d="M 820 428 L 1100 428" stroke="#4A1024" strokeWidth={14} strokeLinecap="round" />
      <text x={960} y={540} textAnchor="middle" fontFamily="Kalam" fontWeight={700} fontSize={48} fill="#C8C2D8" opacity={0.85}>empty.</text>
      <rect x={-200} y={960} width={2400} height={400} fill="#241824" />
      <Hero look={COSTEL} pose={{ ...p, ...faceAt(t, [[0, 'worried'], [22, 'oops']]) }} shadow={0.8} />
      <Bold x={960} y={1010} t={t - 30} text="NEVER SOLD" size={64} /><Bold x={960} y={1075} t={t - 36} text="IN A SHOP" size={56} fill="#FFD24A" />
    </g>
  );
};
