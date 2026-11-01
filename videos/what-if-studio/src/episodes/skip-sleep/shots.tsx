import React, { useContext } from 'react';
import {
  Hero, HERO, Look, Pose, basePose, poseAt, faceAt, kf, clamp, lerp, easeOut, camT, HEAD, LEG_LEN, VerticalCtx, FONT,
  Study, Desk, Bedroom, BEDROOM, bedSit, BedDuvet, stand, Rooftop, Schematic, SchLabel, DrawOn, SCH, WallCalendar,
  AlarmClock, PaperStack, Tabletop, Paper, Sparkle, FloatLabel, Glow, TitleCard, ShotProps,
} from '../../engine';

// "What if you could skip sleep?" Juno skips sleep; the hours go to her shadow, which starts living on its own.
// Thirteen shots: the study at midnight, the bedroom by lamplight, the wall shadow, a dawn title, the science, the end.

const JUNO = HERO;
const WALL = '#4A3A50';
/** Juno's shadow: the same rig, every colour dark, the face drawn in the wall's colour so eyes and mouth read as holes. */
const SHADOW: Look = { ...JUNO, skin: '#120A18', skinShade: '#120A18', hand: '#120A18', jacket: '#120A18', jacketShade: '#120A18', accent: '#120A18', limb: '#120A18', line: '#120A18', shoe: '#120A18', hair: '#120A18', face: '#6A5A72' };

const B = stand(BEDROOM, 0.66, 0.55);
const SIT = bedSit(0.25);

/** The wall shadow: Juno's silhouette thrown large on the back wall by the lamp, soft-edged. */
const WallShadow: React.FC<{ x: number; y: number; sc: number; pose: Partial<Pose>; o?: number; clip?: boolean }> = ({ x, y, sc, pose, o = 0.8, clip = true }) => (
  <g clipPath={clip ? 'url(#backwall)' : undefined}>
    <defs><clipPath id="backwall"><rect x={482} y={322} width={560} height={300} /></clipPath></defs>
    <g opacity={o} style={{ mixBlendMode: 'multiply' }} filter="url(#blur3)">
      <Hero look={SHADOW} pose={{ ...basePose, x, y, scale: sc, ...pose }} shadow={0} rimId="none" />
    </g>
  </g>
);
const yawn = (t: number, at: number): Partial<Pose> => {
  const k = clamp((t - at) / 10);
  const back = Math.sin(k * Math.PI);
  return { headTilt: -14 * back, armL: { a: lerp(14, 165, back), b: lerp(-6, 30, back) }, armR: { a: lerp(14, 165, back), b: lerp(-6, 30, back) }, squash: -0.05 * back, expr: back > 0.2 ? 'shock' : 'tired' };
};

const Guitar: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -30 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-6} y={-150} width={12} height={130} fill="#3A2A22" />
    <rect x={-9} y={-170} width={18} height={26} rx={3} fill="#2A1E18" />
    <ellipse cx={0} cy={0} rx={44} ry={36} fill="#C8783E" stroke="#3A2214" strokeWidth={4} />
    <ellipse cx={0} cy={-34} rx={34} ry={28} fill="#C8783E" stroke="#3A2214" strokeWidth={4} />
    <circle cx={0} cy={-18} r={11} fill="#2A1A12" />
    <rect x={-14} y={14} width={28} height={6} fill="#2A1A12" />
  </g>
);

// ---------- S1: wide, the study at midnight: homework, the clock ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(990, 545, kf(t, [[0, 0.9], [len, 0.97]]))}>
    <Study t={t} id="ss1" night veil={0.4} />
    <Hero look={JUNO} pose={{ ...poseAt(t, [{ f: 0, p: { x: 960, y: 712, yaw: 0.3, look: 0.5, armR: { a: 50, b: 60 }, headTilt: 6 } }]), ...faceAt(t, [[0, 'tired']]) }} shadow={0} rimId="rimL" />
    <Desk x0={560} x1={1360} y={700} />
    <AlarmClock x={1180} y={690} s={0.8} text="00:00" />
    <PaperStack x={760} y={696} n={4} w={150} />
  </g>
);
// ---------- S2: SKIP: top-down on the desk, the sheet fills itself in a blur, the clock races ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const k = clamp(t / len);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.12]]))}>
      <Tabletop edge={1400} />
      <Glow x={960} y={420} r={720} o={0.25} />
      <Paper x={860} y={560} w={380} rot={-4} done={k > 0.9} fill={k} />
      <AlarmClock x={1400} y={520} s={2.2} text={`0${Math.min(1, Math.floor(k * 2))}:${String(Math.floor((k * 60) % 60)).padStart(2, '0')}`} />
    </g>
  );
};
// ---------- S3: medium, done: a stack of finished homework, smug ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 1000], [len, 980]]), 590, kf(t, [[0, 1.8], [len, 1.9]]))}>
    <Study t={t + 60} id="ss3" night />
    <Hero look={JUNO} pose={{ ...poseAt(t, [{ f: 0, p: { x: 900, y: 712, yaw: 0.4, look: 0.7, armL: { a: 14, b: -6 }, armR: { a: 50, b: 30 } } }, { f: 8, p: { tilt: -8, headTilt: -6, armL: { a: 160, b: 120 }, armR: { a: 160, b: 120 } }, ease: easeOut }]), ...faceAt(t, [[0, 'happy'], [8, 'smug']]) }} shadow={0} rimId="rimL" />
    <Desk x0={560} x1={1360} y={700} lamp={false} />
    <PaperStack x={1110} y={698} n={9} w={200} />
    <AlarmClock x={1280} y={690} s={0.8} text="01:00" />
    <Sparkle x={1180} y={600} t={t - 4} s={0.9} />
  </g>
);
// ---------- S4: medium, the bedroom at 3 a.m.: sitting on the bed with a guitar, struggling ----------
const sitPose = (t: number, strum: number): Pose => ({
  ...basePose, x: SIT.x, y: SIT.y, scale: SIT.scale, yaw: 0.3, look: 0.6, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 },
  armL: { a: 60, b: 70 }, armR: { a: 40 + Math.sin(t * strum) * 14, b: 60 }, headTilt: 8,
});
const bedroom = (t: number, id: string, clock: string, red = 0) => <Bedroom t={t} id={id} clock={clock} crossed={0} veil={0.48} duvet={false} lamp={1} />;
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(SIT.x + 60, SIT.y - 60, kf(t, [[0, 1.9], [len, 2.0]]))}>
    {bedroom(t, 'ss4', '03:00')}
    <Hero look={JUNO} pose={{ ...sitPose(t, 0.3), ...faceAt(t, [[0, 'worried']]) }} shadow={0} rimId="rimR" />
    <Guitar x={SIT.x + 40 * SIT.scale} y={SIT.y - 30 * SIT.scale} s={SIT.scale} />
    <BedDuvet />
  </g>
);
// ---------- S5: SKIP: the same, the strumming a blur, notes flying ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(SIT.x + 60, SIT.y - 60, kf(t, [[0, 2.0], [len, 2.2]]))}>
    {bedroom(t, 'ss5', `0${3 + Math.min(1, Math.floor(t / 10))}:${String((t * 7) % 60).padStart(2, '0')}`)}
    <Hero look={JUNO} pose={{ ...sitPose(t, 2.6), ...faceAt(t, [[0, 'smug']]) }} shadow={0} rimId="rimR" />
    <Guitar x={SIT.x + 40 * SIT.scale} y={SIT.y - 30 * SIT.scale} s={SIT.scale} rot={-30 + Math.sin(t * 2.6) * 3} />
    <BedDuvet />
    {[0, 6, 12, 18].map((d, i) => <FloatLabel key={i} x={SIT.x + 140 + i * 30} y={SIT.y - 200} t={t - d} text="♪" size={50} />)}
  </g>
);
// ---------- S6: close-up, nailed it ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 3.8 * (1 + 0.05 * clamp(t / len));
  const head = { x: 960, y: 560 };
  return (
    <g>
      <g filter="url(#blur16)"><g transform="translate(-700 -500) scale(2)">{bedroom(t, 'ss6b', '04:00')}</g></g>
      <rect x={0} y={0} width={1920} height={1080} fill="#07040C" opacity={0.22} />
      <Hero look={JUNO} pose={{ ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.2, look: 0.3, ...faceAt(t, [[0, 'cool']]) }} shadow={0} rimId="rimR" />
      <Sparkle x={head.x + 420} y={head.y - 200} t={t - 2} s={2.2} />
    </g>
  );
};
// ---------- S7: wide, 5 a.m.: Juno standing, the lamp throws her shadow big on the wall ----------
// her shadow on the back wall: feet on the skirting (y 742), a little taller than her, thrown right of her by the lamp
const SH = { x: 780, sc: 1.05 };
const shY = 742 - LEG_LEN * SH.sc;
const shadowSpot = { x: SH.x, y: shY };
export const S7: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 960], [len, 1000]]), 520, kf(t, [[0, 1.0], [len, 1.08]]))}>
    {bedroom(t, 'ss7', '05:00')}
    <WallShadow x={SH.x} y={shY} sc={SH.sc} pose={{ yaw: 0.2, expr: 'tired' }} o={0.88} />
    <Hero look={JUNO} pose={{ ...basePose, x: B.x, y: B.y, scale: B.scale, yaw: 0.25, look: 0.4, ...faceAt(t, [[0, 'tired']]) }} shadow={1} rimId="rimL" />
  </g>
);
// ---------- S8: the shadow yawns; Juno, in the foreground, sees it ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(SH.x + 60, 540, kf(t, [[0, 1.9], [len, 2.05]]))}>
    {bedroom(t, 'ss8', '05:01')}
    <WallShadow x={SH.x} y={shY} sc={SH.sc} pose={{ yaw: 0.2, ...yawn(t, 6) }} o={0.8} />
    <g filter="url(#blur6)">
      <Hero look={JUNO} pose={{ ...basePose, x: SH.x + 330, y: 900 + 176 * 1.8 - 200, scale: 1.8, yaw: -0.6, look: -1, ...faceAt(t, [[0, 'tired'], [10, 'shock']]) }} shadow={0} rimId="rimL" />
    </g>
  </g>
);
// ---------- S9: the title on the roof at dawn ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const vert = useContext(VerticalCtx);
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.06]]))}>
      <Rooftop t={t + 40} sunX={960} sunY={760 - 70 * clamp(t / 40)} />
      <Hero look={JUNO} pose={{ ...basePose, x: 960, y: 820 - LEG_LEN * 0.62, scale: 0.62, expr: 'tired' }} shadow={0.8} rimId="rimR" />
      {vert ? (
        <g>
          {[['WHAT IF YOU COULD', 170, 40, '#F6EFE3', 2], ['SKIP', 290, 130, '#FF8A3D', 6], ['SLEEP?', 410, 120, '#FF8A3D', 10]].map(([txt, y, size, fill, d]) => (
            <text key={txt as string} x={960} y={y as number} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={size as number} fill={fill as string}
              stroke="#1A1230" strokeWidth={(size as number) * 0.12} paintOrder="stroke" opacity={clamp((t - (d as number)) / 7)}>{txt as string}</text>
          ))}
        </g>
      ) : (
        <TitleCard t={t} lines={['WHAT IF YOU COULD', 'SKIP SLEEP?']} accent="SKIP" accentT={20} />
      )}
    </g>
  );
};
// ---------- S10: schematic: 1964, eleven days awake ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const vert = useContext(VerticalCtx);
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t} id="ss10" />
      <WallCalendar x={vert ? 960 : 620} y={vert ? 120 : 200} w={vert ? 440 : 520} crossed={Math.min(11, Math.floor(t / 4))} />
      <SchLabel x={vert ? 960 : 1340} y={vert ? 720 : 470} t={t - 4} text="1964" size={vert ? 90 : 110} color={SCH.live} />
      <SchLabel x={vert ? 960 : 1340} y={vert ? 820 : 590} t={t - 12} text="11 DAYS AWAKE" size={vert ? 50 : 56} />
      <SchLabel x={vert ? 960 : 1340} y={vert ? 890 : 670} t={t - 18} text="264 HOURS" size={36} color={SCH.dim} />
    </g>
  );
};
// ---------- S11: schematic: day five, seeing things ----------
const EYE = 'M 700 540 Q 960 300 1220 540 Q 960 780 700 540 Z';
export const S11: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.05]])}) translate(-960 -540)`}>
    <Schematic t={t + 40} id="ss11" />
    <DrawOn d={EYE} t={t} dur={10} width={8} />
    <circle cx={960 + Math.sin(t / 3) * 30} cy={540} r={70 * clamp(t / 8)} fill="none" stroke={SCH.live} strokeWidth={8} />
    <SchLabel x={960} y={250} t={t - 4} text="DAY 5" size={80} color={SCH.live} />
    <SchLabel x={960} y={860} t={t - 10} text="SEEING THINGS" size={56} color="#FF6A5A" />
  </g>
);
// ---------- S12: extreme close-up, that's real: dark rings, her shadow drifting out of step behind her ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 5.8 * (1 + 0.05 * clamp(t / len));
  const head = { x: 960, y: 620 };
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={WALL} />
      <WallShadow clip={false} x={1150 + Math.sin(t / 6) * 40} y={head.y - HEAD.y * sc * 0.9 + 60} sc={sc * 0.9} pose={{ yaw: -0.2, headTilt: 10 * Math.sin(t / 5) }} o={0.6} />
      <Hero look={JUNO} pose={{ ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.05, look: 0, ...faceAt(t, [[0, 'tired']]) }} shadow={0} rimId="rimRed" />
    </g>
  );
};
// ---------- S13: wide, red: Juno in bed, wide awake; on the wall her shadow stands up on its own and waves ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const s = bedSit(0.2);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 1060]]), kf(t, [[0, 520], [len, 480]]), kf(t, [[0, 1.0], [len, 1.22]]))}>
      <Bedroom t={t + 30} id="ss13" clock="05:59" crossed={0} veil={0.55} duvet={false} lamp={1 - clamp((t - 30) / 6) * 0.7} />
      <WallShadow x={SH.x + 40} y={shY} sc={SH.sc} pose={{ yaw: -0.2, armR: { a: 150 + Math.sin(t / 3) * 14, b: 20 }, expr: 'happy' }} o={0.85} />
      <Hero look={JUNO} pose={{ ...basePose, x: s.x, y: s.y, scale: s.scale, yaw: 0.4, look: 1, legL: { a: 80, b: -80 }, legR: { a: 80, b: -80 }, ...faceAt(t, [[0, 'tired'], [12, 'shock']]) }} shadow={0} rimId="rimRed" />
      <BedDuvet knees={0.6} />
      <rect x={-400} y={-400} width={2720} height={1900} fill="#5A0A1A" opacity={0.28 * clamp(t / 10)} style={{ mixBlendMode: 'multiply' }} />
    </g>
  );
};
